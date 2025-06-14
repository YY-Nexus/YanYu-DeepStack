#!/bin/bash

# 阿里云服务器Ollama部署脚本
# 使用方法: chmod +x deploy-ollama-aliyun.sh && ./deploy-ollama-aliyun.sh

set -e

echo "🚀 开始在阿里云ECS上部署Ollama服务..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        log_info "请使用: sudo $0"
        exit 1
    fi
}

# 检测系统信息
detect_system() {
    log_info "检测系统信息..."
    
    # 检测操作系统
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        log_error "无法检测操作系统"
        exit 1
    fi
    
    # 检测架构
    ARCH=$(uname -m)
    
    # 检测内存
    MEMORY=$(free -m | awk 'NR==2{printf "%.1f", $2/1024}')
    
    # 检测CPU核心数
    CPU_CORES=$(nproc)
    
    # 检测磁盘空间
    DISK_SPACE=$(df -h / | awk 'NR==2 {print $4}')
    
    log_success "系统信息检测完成:"
    echo "  操作系统: $OS $VER"
    echo "  架构: $ARCH"
    echo "  内存: ${MEMORY}GB"
    echo "  CPU核心: $CPU_CORES"
    echo "  可用磁盘空间: $DISK_SPACE"
    
    # 检查最低要求
    if (( $(echo "$MEMORY < 2.0" | bc -l) )); then
        log_warning "内存不足2GB，可能影响大模型运行"
    fi
    
    if [[ "$ARCH" != "x86_64" && "$ARCH" != "aarch64" ]]; then
        log_error "不支持的架构: $ARCH"
        exit 1
    fi
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    
    if command -v apt-get &> /dev/null; then
        apt-get update -y
        apt-get upgrade -y
        apt-get install -y curl wget git htop nvtop bc
    elif command -v yum &> /dev/null; then
        yum update -y
        yum install -y curl wget git htop bc
    else
        log_error "不支持的包管理器"
        exit 1
    fi
    
    log_success "系统更新完成"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    # 检查防火墙类型
    if command -v ufw &> /dev/null; then
        # Ubuntu/Debian UFW
        ufw --force enable
        ufw allow 22/tcp comment "SSH"
        ufw allow 80/tcp comment "HTTP"
        ufw allow 443/tcp comment "HTTPS"
        ufw allow 11434/tcp comment "Ollama API"
        ufw allow 3000/tcp comment "Next.js App"
        log_success "UFW防火墙配置完成"
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL firewalld
        systemctl enable firewalld
        systemctl start firewalld
        firewall-cmd --permanent --add-port=22/tcp
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --permanent --add-port=11434/tcp
        firewall-cmd --permanent --add-port=3000/tcp
        firewall-cmd --reload
        log_success "firewalld防火墙配置完成"
    else
        log_warning "未检测到防火墙，请手动配置端口开放"
    fi
}

# 检测GPU
detect_gpu() {
    log_info "检测GPU..."
    
    if command -v nvidia-smi &> /dev/null; then
        GPU_INFO=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits)
        log_success "检测到NVIDIA GPU:"
        echo "$GPU_INFO" | while read line; do
            echo "  $line"
        done
        HAS_GPU=true
        GPU_TYPE="nvidia"
    elif lspci | grep -i amd | grep -i vga &> /dev/null; then
        log_info "检测到AMD GPU，但Ollama主要支持NVIDIA GPU"
        HAS_GPU=false
        GPU_TYPE="amd"
    else
        log_info "未检测到GPU，将使用CPU模式"
        HAS_GPU=false
        GPU_TYPE="none"
    fi
}

# 安装NVIDIA驱动和CUDA（如果需要）
install_nvidia_drivers() {
    if [[ "$HAS_GPU" == true && "$GPU_TYPE" == "nvidia" ]]; then
        log_info "检查NVIDIA驱动..."
        
        if ! command -v nvidia-smi &> /dev/null; then
            log_info "安装NVIDIA驱动..."
            
            if command -v apt-get &> /dev/null; then
                # Ubuntu/Debian
                apt-get update
                apt-get install -y ubuntu-drivers-common
                ubuntu-drivers autoinstall
            elif command -v yum &> /dev/null; then
                # CentOS/RHEL
                yum install -y epel-release
                yum install -y nvidia-driver nvidia-settings
            fi
            
            log_warning "NVIDIA驱动安装完成，需要重启系统"
            log_info "请运行 'sudo reboot' 重启后再次执行此脚本"
            exit 0
        else
            log_success "NVIDIA驱动已安装"
        fi
    fi
}

# 安装Docker
install_docker() {
    log_info "安装Docker..."
    
    if command -v docker &> /dev/null; then
        log_success "Docker已安装"
        return
    fi
    
    # 安装Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # 启动Docker服务
    systemctl enable docker
    systemctl start docker
    
    # 添加当前用户到docker组（如果不是root）
    if [[ $SUDO_USER ]]; then
        usermod -aG docker $SUDO_USER
        log_info "已将用户 $SUDO_USER 添加到docker组"
    fi
    
    # 安装Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    log_success "Docker安装完成"
}

# 安装Ollama
install_ollama() {
    log_info "安装Ollama..."
    
    if command -v ollama &> /dev/null; then
        log_success "Ollama已安装"
        return
    fi
    
    # 下载并安装Ollama
    curl -fsSL https://ollama.com/install.sh | sh
    
    log_success "Ollama安装完成"
}

# 配置Ollama服务
configure_ollama_service() {
    log_info "配置Ollama系统服务..."
    
    # 创建ollama用户（如果不存在）
    if ! id "ollama" &>/dev/null; then
        useradd -r -s /bin/false -m -d /usr/share/ollama ollama
    fi
    
    # 创建服务文件
    cat > /etc/systemd/system/ollama.service << EOF
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
Environment="OLLAMA_HOST=0.0.0.0"
Environment="OLLAMA_ORIGINS=*"

[Install]
WantedBy=default.target
EOF
    
    # 重新加载systemd并启动服务
    systemctl daemon-reload
    systemctl enable ollama
    systemctl start ollama
    
    # 等待服务启动
    log_info "等待Ollama服务启动..."
    sleep 5
    
    # 检查服务状态
    if systemctl is-active --quiet ollama; then
        log_success "Ollama服务启动成功"
    else
        log_error "Ollama服务启动失败"
        systemctl status ollama
        exit 1
    fi
}

# 下载推荐模型
download_models() {
    log_info "下载推荐AI模型..."
    
    # 等待Ollama API就绪
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s http://localhost:11434/api/tags > /dev/null; then
            log_success "Ollama API就绪"
            break
        fi
        
        log_info "等待Ollama API就绪... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_error "Ollama API启动超时"
        exit 1
    fi
    
    # 根据系统配置选择模型
    local models=()
    
    if (( $(echo "$MEMORY >= 8.0" | bc -l) )); then
        models+=("llama3:8b" "codellama:7b")
        log_info "内存充足，下载大型模型"
    elif (( $(echo "$MEMORY >= 4.0" | bc -l) )); then
        models+=("phi3:mini" "qwen2:1.5b")
        log_info "内存适中，下载中型模型"
    else
        models+=("phi3:mini")
        log_info "内存有限，下载小型模型"
    fi
    
    # 下载模型
    for model in "${models[@]}"; do
        log_info "下载模型: $model"
        if sudo -u ollama ollama pull "$model"; then
            log_success "模型 $model 下载完成"
        else
            log_error "模型 $model 下载失败"
        fi
    done
}

# 安装Node.js和npm
install_nodejs() {
    log_info "安装Node.js..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js已安装: $NODE_VERSION"
        return
    fi
    
    # 安装NodeSource仓库
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    
    if command -v apt-get &> /dev/null; then
        apt-get install -y nodejs
    elif command -v yum &> /dev/null; then
        yum install -y nodejs npm
    fi
    
    # 安装PM2
    npm install -g pm2
    
    log_success "Node.js和PM2安装完成"
}

# 安装Nginx
install_nginx() {
    log_info "安装Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_success "Nginx已安装"
        return
    fi
    
    if command -v apt-get &> /dev/null; then
        apt-get install -y nginx
    elif command -v yum &> /dev/null; then
        yum install -y nginx
    fi
    
    # 启动并启用Nginx
    systemctl enable nginx
    systemctl start nginx
    
    log_success "Nginx安装完成"
}

# 配置Nginx反向代理
configure_nginx() {
    log_info "配置Nginx反向代理..."
    
    # 创建Nginx配置文件
    cat > /etc/nginx/sites-available/yanyu-cloud << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 前端应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Ollama API代理
    location /api/ollama/ {
        proxy_pass http://localhost:11434/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    # 启用站点
    if [[ -d /etc/nginx/sites-enabled ]]; then
        ln -sf /etc/nginx/sites-available/yanyu-cloud /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
    else
        # CentOS/RHEL
        cp /etc/nginx/sites-available/yanyu-cloud /etc/nginx/conf.d/yanyu-cloud.conf
    fi
    
    # 测试配置
    if nginx -t; then
        systemctl reload nginx
        log_success "Nginx配置完成"
    else
        log_error "Nginx配置错误"
        exit 1
    fi
}

# 创建监控脚本
create_monitoring_scripts() {
    log_info "创建监控脚本..."
    
    # 创建监控目录
    mkdir -p /opt/yanyu-cloud/scripts
    mkdir -p /var/log/yanyu-cloud
    
    # 创建系统监控脚本
    cat > /opt/yanyu-cloud/scripts/monitor.sh << 'EOF'
#!/bin/bash

# 言語云³深度堆栈系统监控脚本

LOG_FILE="/var/log/yanyu-cloud/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 记录日志
log() {
    echo "[$DATE] $1" >> $LOG_FILE
}

# 检查Ollama服务
check_ollama() {
    if systemctl is-active --quiet ollama; then
        if curl -s http://localhost:11434/api/tags > /dev/null; then
            log "✅ Ollama服务正常"
            return 0
        else
            log "❌ Ollama API无响应"
            return 1
        fi
    else
        log "❌ Ollama服务未运行"
        systemctl restart ollama
        return 1
    fi
}

# 检查Nginx服务
check_nginx() {
    if systemctl is-active --quiet nginx; then
        log "✅ Nginx服务正常"
        return 0
    else
        log "❌ Nginx服务未运行"
        systemctl restart nginx
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $DISK_USAGE -gt 90 ]]; then
        log "⚠️ 磁盘空间不足: ${DISK_USAGE}%"
        return 1
    else
        log "✅ 磁盘空间充足: ${DISK_USAGE}%"
        return 0
    fi
}

# 检查内存使用
check_memory() {
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [[ $MEMORY_USAGE -gt 90 ]]; then
        log "⚠️ 内存使用过高: ${MEMORY_USAGE}%"
        return 1
    else
        log "✅ 内存使用正常: ${MEMORY_USAGE}%"
        return 0
    fi
}

# 主监控逻辑
main() {
    log "开始系统监控检查"
    
    check_ollama
    check_nginx
    check_disk_space
    check_memory
    
    log "监控检查完成"
}

main
EOF
    
    chmod +x /opt/yanyu-cloud/scripts/monitor.sh
    
    # 创建定时任务
    cat > /etc/cron.d/yanyu-cloud-monitor << 'EOF'
# 言語云³深度堆栈监控任务
*/5 * * * * root /opt/yanyu-cloud/scripts/monitor.sh
EOF
    
    log_success "监控脚本创建完成"
}

# 创建部署脚本
create_deployment_script() {
    log_info "创建应用部署脚本..."
    
    cat > /opt/yanyu-cloud/scripts/deploy-app.sh << 'EOF'
#!/bin/bash

# 言語云³深度堆栈应用部署脚本

set -e

APP_DIR="/opt/yanyu-cloud/app"
REPO_URL="https://github.com/your-repo/yanyu-cloud-deepstack.git"
LOG_FILE="/var/log/yanyu-cloud/deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 克隆或更新代码
update_code() {
    log "更新应用代码..."
    
    if [[ -d "$APP_DIR" ]]; then
        cd "$APP_DIR"
        git pull origin main
    else
        git clone "$REPO_URL" "$APP_DIR"
        cd "$APP_DIR"
    fi
    
    log "代码更新完成"
}

# 安装依赖
install_dependencies() {
    log "安装应用依赖..."
    
    cd "$APP_DIR"
    npm install
    
    log "依赖安装完成"
}

# 构建应用
build_app() {
    log "构建应用..."
    
    cd "$APP_DIR"
    
    # 创建环境变量文件
    cat > .env.local << ENVEOF
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434
ENVEOF
    
    npm run build
    
    log "应用构建完成"
}

# 部署应用
deploy_app() {
    log "部署应用..."
    
    cd "$APP_DIR"
    
    # 停止现有应用
    pm2 delete yanyu-cloud || true
    
    # 启动新应用
    pm2 start npm --name "yanyu-cloud" -- start
    pm2 save
    
    log "应用部署完成"
}

# 主部署流程
main() {
    log "开始应用部署"
    
    update_code
    install_dependencies
    build_app
    deploy_app
    
    log "应用部署完成"
    log "访问地址: http://$(curl -s ifconfig.me)"
}

main
EOF
    
    chmod +x /opt/yanyu-cloud/scripts/deploy-app.sh
    
    log_success "部署脚本创建完成"
}

# 优化系统性能
optimize_system() {
    log_info "优化系统性能..."
    
    # 调整内核参数
    cat >> /etc/sysctl.conf << 'EOF'

# 言語云³深度堆栈性能优化
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 65536 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.ipv4.tcp_congestion_control = bbr
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF
    
    sysctl -p
    
    # 设置文件描述符限制
    cat >> /etc/security/limits.conf << 'EOF'

# 言語云³深度堆栈文件描述符限制
* soft nofile 65536
* hard nofile 65536
root soft nofile 65536
root hard nofile 65536
EOF
    
    log_success "系统性能优化完成"
}

# 创建SSL证书（Let's Encrypt）
setup_ssl() {
    local domain=$1
    
    if [[ -z "$domain" ]]; then
        log_warning "未提供域名，跳过SSL配置"
        return
    fi
    
    log_info "配置SSL证书..."
    
    # 安装Certbot
    if command -v apt-get &> /dev/null; then
        apt-get install -y certbot python3-certbot-nginx
    elif command -v yum &> /dev/null; then
        yum install -y certbot python3-certbot-nginx
    fi
    
    # 获取SSL证书
    certbot --nginx -d "$domain" --non-interactive --agree-tos --email admin@"$domain"
    
    # 设置自动续期
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    log_success "SSL证书配置完成"
}

# 显示部署信息
show_deployment_info() {
    log_success "🎉 言語云³深度堆栈部署完成！"
    
    echo ""
    echo "=========================================="
    echo "           部署信息"
    echo "=========================================="
    echo "服务器IP: $(curl -s ifconfig.me 2>/dev/null || echo "获取失败")"
    echo "访问地址: http://$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")"
    echo "Ollama API: http://$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip"):11434"
    echo ""
    echo "已安装的模型:"
    sudo -u ollama ollama list 2>/dev/null || echo "  获取模型列表失败"
    echo ""
    echo "服务状态:"
    echo "  Ollama: $(systemctl is-active ollama)"
    echo "  Nginx: $(systemctl is-active nginx)"
    echo ""
    echo "日志文件:"
    echo "  系统监控: /var/log/yanyu-cloud/monitor.log"
    echo "  应用部署: /var/log/yanyu-cloud/deploy.log"
    echo ""
    echo "管理命令:"
    echo "  查看Ollama状态: sudo systemctl status ollama"
    echo "  重启Ollama: sudo systemctl restart ollama"
    echo "  查看Nginx状态: sudo systemctl status nginx"
    echo "  部署应用: sudo /opt/yanyu-cloud/scripts/deploy-app.sh"
    echo "  系统监控: sudo /opt/yanyu-cloud/scripts/monitor.sh"
    echo "=========================================="
}

# 主函数
main() {
    echo "🚀 言語云³深度堆栈 - 阿里云ECS自动部署脚本"
    echo "版本: 1.0.0"
    echo "作者: YanYu Cloud Team"
    echo ""
    
    # 检查参数
    DOMAIN=""
    while [[ $# -gt 0 ]]; do
        case $1 in
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            --help)
                echo "使用方法: $0 [选项]"
                echo "选项:"
                echo "  --domain DOMAIN    配置SSL证书的域名"
                echo "  --help            显示帮助信息"
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                exit 1
                ;;
        esac
    done
    
    # 执行部署步骤
    check_root
    detect_system
    update_system
    configure_firewall
    detect_gpu
    install_nvidia_drivers
    install_docker
    install_ollama
    configure_ollama_service
    download_models
    install_nodejs
    install_nginx
    configure_nginx
    create_monitoring_scripts
    create_deployment_script
    optimize_system
    
    if [[ -n "$DOMAIN" ]]; then
        setup_ssl "$DOMAIN"
    fi
    
    show_deployment_info
    
    log_success "部署完成！请运行应用部署脚本来部署前端应用"
    log_info "命令: sudo /opt/yanyu-cloud/scripts/deploy-app.sh"
}

# 执行主函数
main "$@"
