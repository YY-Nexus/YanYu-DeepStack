#!/bin/bash

# 言語云³ 应用封装脚本
# 支持多种部署方式：Web应用、Docker、Electron桌面版、PWA

set -e

# 颜色输出
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

# 显示帮助信息
show_help() {
    cat << EOF
言語云³ 应用封装工具

用法: $0 [选项]

选项:
    web         构建生产环境Web应用
    docker      构建Docker镜像
    electron    构建Electron桌面应用
    pwa         构建PWA应用
    all         构建所有格式
    clean       清理构建文件
    help        显示此帮助信息

示例:
    $0 web              # 构建Web应用
    $0 docker           # 构建Docker镜像
    $0 electron         # 构建桌面应用
    $0 all              # 构建所有格式

EOF
}

# 检查环境
check_environment() {
    log_info "检查构建环境..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装Node.js"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    npm install --legacy-peer-deps
    log_success "依赖安装完成"
}

# 清理构建文件
clean_build() {
    log_info "清理构建文件..."
    rm -rf .next
    rm -rf out
    rm -rf dist
    rm -rf dist-electron
    rm -rf build
    rm -rf node_modules/.cache
    log_success "清理完成"
}

# 构建Web应用
build_web() {
    log_info "构建生产环境Web应用..."
    
    # 设置环境变量
    export NODE_ENV=production
    
    # 检查是否需要静态导出
    if [[ "$1" == "static" ]]; then
        log_info "构建静态网站版本..."
        export NEXT_EXPORT=true
        npm run build
        
        # 创建静态部署包
        mkdir -p dist/web-static
        cp -r out/* dist/web-static/ 2>/dev/null || cp -r .next/out/* dist/web-static/ 2>/dev/null || {
            log_error "静态文件导出失败"
            return 1
        }
        
        # 压缩打包
        cd dist
        tar -czf "web-static-${VERSION}.tar.gz" web-static/
        cd ..
        
        log_success "Web静态版本构建完成: dist/web-static-${VERSION}.tar.gz"
    else
        log_info "构建服务器版本..."
        unset NEXT_EXPORT
        npm run build
        
        # 创建部署包
        mkdir -p dist/web
        cp -r .next dist/web/
        cp -r public dist/web/
        cp package.json dist/web/
        cp next.config.mjs dist/web/
        
        # 创建启动脚本
        cat > dist/web/start.sh << 'EOF'
#!/bin/bash
echo "启动言語云³ Web应用..."
npm start
EOF
        chmod +x dist/web/start.sh
        
        # 压缩打包
        cd dist
        tar -czf "web-server-${VERSION}.tar.gz" web/
        cd ..
        
        log_success "Web服务器版本构建完成: dist/web-server-${VERSION}.tar.gz"
    fi
    cd dist
    tar -czf "yanyu-deepstack-web-$(date +%Y%m%d-%H%M%S).tar.gz" web/
    cd ..
    
    log_success "Web应用构建完成: dist/yanyu-deepstack-web-*.tar.gz"
}

# 构建Docker镜像
build_docker() {
    log_info "构建Docker镜像..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装Docker"
        return 1
    fi
    
    # 构建镜像
    docker build -f docker/Dockerfile -t yanyu-deepstack:latest .
    
    # 标记版本
    VERSION=$(date +%Y%m%d-%H%M%S)
    docker tag yanyu-deepstack:latest yanyu-deepstack:$VERSION
    
    # 保存镜像
    mkdir -p dist/docker
    docker save yanyu-deepstack:latest | gzip > dist/docker/yanyu-deepstack-docker-$VERSION.tar.gz
    
    log_success "Docker镜像构建完成: dist/docker/yanyu-deepstack-docker-*.tar.gz"
    log_info "运行命令: docker-compose up -d"
}

# 构建Electron应用
build_electron() {
    log_info "构建Electron桌面应用..."
    
    # 检查是否有electron依赖
    if ! grep -q "electron" electron-package.json 2>/dev/null; then
        log_warning "正在安装Electron依赖..."
        npm install --save-dev electron electron-builder concurrently wait-on
    fi
    
    # 首先构建Next.js应用
    npm run build
    
    # 复制electron配置
    cp electron-package.json package-electron.json
    
    # 构建桌面应用
    export NODE_ENV=production
    npx electron-builder --config package-electron.json
    
    log_success "Electron应用构建完成: dist-electron/"
}

# 构建PWA应用
build_pwa() {
    log_info "构建PWA应用..."
    
    # 修改Next.js配置以支持静态导出
    export NODE_ENV=production
    
    # 构建静态文件
    npm run build
    
    # 创建PWA包
    mkdir -p dist/pwa
    cp -r out/* dist/pwa/ 2>/dev/null || cp -r .next/static dist/pwa/
    cp public/manifest.json dist/pwa/
    cp public/service-worker.js dist/pwa/ 2>/dev/null || echo "// Service Worker" > dist/pwa/service-worker.js
    
    # 创建部署说明
    cat > dist/pwa/README.md << 'EOF'
# 言語云³ PWA 部署说明

## 部署方式

1. 将所有文件上传到Web服务器
2. 确保服务器支持HTTPS（PWA要求）
3. 配置适当的MIME类型

## 验证PWA

打开浏览器开发者工具 > Application > Manifest
检查Service Worker是否正常注册

EOF
    
    # 压缩PWA包
    cd dist
    tar -czf "yanyu-deepstack-pwa-$(date +%Y%m%d-%H%M%S).tar.gz" pwa/
    cd ..
    
    log_success "PWA应用构建完成: dist/yanyu-deepstack-pwa-*.tar.gz"
}

# 构建所有格式
build_all() {
    log_info "开始构建所有应用格式..."
    
    build_web
    build_docker
    build_electron
    build_pwa
    
    log_success "所有应用格式构建完成！"
    
    # 显示构建结果
    echo
    log_info "构建结果:"
    ls -la dist/ 2>/dev/null || echo "dist目录不存在"
    ls -la dist-electron/ 2>/dev/null || echo "dist-electron目录不存在"
}

# 显示构建信息
show_build_info() {
    cat << 'EOF'

🚀 言語云³ 深度堆栈全栈智创引擎
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ 功能特色:
   • AI代码生成与智能补全
   • 实时预览与多格式支持
   • 自动化部署与CI/CD
   • 项目模板与脚手架
   • 多平台支持

📦 支持的应用格式:
   • Web应用 (生产环境部署)
   • Docker容器 (容器化部署)
   • Electron桌面应用 (跨平台桌面版)
   • PWA渐进式应用 (移动端友好)

🛠️ 技术栈:
   • Next.js 15 + React 18
   • TypeScript + Tailwind CSS
   • Framer Motion + Radix UI
   • Docker + Kubernetes
   • Electron + PWA

EOF
}

# 主函数
main() {
    case "${1:-help}" in
        web)
            check_environment
            install_dependencies
            build_web
            ;;
        docker)
            check_environment
            install_dependencies
            build_docker
            ;;
        electron)
            check_environment
            install_dependencies
            build_electron
            ;;
        pwa)
            check_environment
            install_dependencies
            build_pwa
            ;;
        all)
            check_environment
            install_dependencies
            build_all
            ;;
        clean)
            clean_build
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            show_build_info
            show_help
            ;;
    esac
}

# 运行主函数
main "$@"
