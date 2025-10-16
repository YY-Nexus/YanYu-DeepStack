#!/bin/bash

# 类定义检测与修复启动脚本
# 这个脚本会运行完整的类定义检查流程

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 设置工作目录
sCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$sCRIPT_DIR"

# 函数：显示标题
show_title() {
    echo "${BLUE}"
    echo "==================================================="
    echo "          🏗️  类定义检测与修复工具"
    echo "==================================================="
    echo "${NC}"
}

# 函数：检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "${RED}错误: $1 命令未找到，请先安装。${NC}"
        exit 1
    fi
}

# 函数：安装依赖
install_dependencies() {
    echo "${YELLOW}正在检查并安装依赖...${NC}"
    
    # 检查npm是否安装
    check_command npm
    
    # 检查Python是否安装
    check_command python
    
    # 安装项目依赖
    cd "$PROJECT_ROOT"
    npm install
    
    # 安装yyc3_TypeScript目录下的依赖
    if [ -d "$PROJECT_ROOT/yyc3_TypeScript" ]; then
        cd "$PROJECT_ROOT/yyc3_TypeScript"
        npm install
        cd "$PROJECT_ROOT"
    fi
    
    echo "${GREEN}依赖安装完成！${NC}"
}

# 函数：运行类定义检测
run_class_check() {
    echo "${YELLOW}正在运行类定义检测与修复...${NC}"
    
    # 确保检测脚本有执行权限
    chmod +x "$PROJECT_ROOT/scripts/class_definition_checker.js"
    
    # 运行主检测脚本
    node "$PROJECT_ROOT/scripts/class_definition_checker.js"
    
    if [ $? -eq 0 ]; then
        echo "${GREEN}类定义检测与修复任务成功完成！${NC}"
    else
        echo "${RED}类定义检测与修复任务执行失败，请查看错误信息。${NC}"
        return 1
    fi
}

# 函数：清理临时文件
cleanup() {
    echo "${YELLOW}正在清理临时文件...${NC}"
    
    # 删除临时ESLint配置文件
    if [ -f "$PROJECT_ROOT/scripts/.temp_eslintrc.json" ]; then
        rm -f "$PROJECT_ROOT/scripts/.temp_eslintrc.json"
    fi
    
    echo "${GREEN}清理完成！${NC}"
}

# 函数：显示帮助信息
show_help() {
    echo "${BLUE}使用说明：${NC}"
    echo "  ./start_class_check.sh [选项]"
    echo ""
    echo "选项："
    echo "  --install    仅安装依赖，不运行检测"
    echo "  --check      仅运行检测，不安装依赖"
    echo "  --clean      清理临时文件"
    echo "  --help       显示此帮助信息"
    echo ""
    echo "示例："
    echo "  ./start_class_check.sh          # 安装依赖并运行检测"
    echo "  ./start_class_check.sh --check  # 直接运行检测"
}

# 主函数
main() {
    show_title
    
    # 处理命令行参数
    case "$1" in
        --install)
            install_dependencies
            ;;
        --check)
            run_class_check
            ;;
        --clean)
            cleanup
            ;;
        --help)
            show_help
            ;;
        *)
            install_dependencies
            if [ $? -eq 0 ]; then
                run_class_check
                if [ $? -eq 0 ]; then
                    cleanup
                fi
            fi
            ;;
    esac
    
    echo "${BLUE}"
    echo "==================================================="
    echo "          🏁  任务执行完毕"
    echo "==================================================="
    echo "${NC}"
}

# 执行主函数
main "$@"