#!/bin/bash

# 快速安装中文优化模型脚本
# 适用于言語云³深度堆栈系统

set -e

echo "🤖 言語云³ 中文优化模型快速安装"
echo "=================================="

# 检查Ollama是否安装
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama未安装，正在安装..."
    curl -fsSL https://ollama.ai/install.sh | sh
    echo "✅ Ollama安装完成"
fi

# 检查Ollama服务是否运行
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "🚀 启动Ollama服务..."
    ollama serve &
    sleep 5
    
    # 再次检查
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "❌ Ollama服务启动失败"
        echo "请手动启动: ollama serve"
        exit 1
    fi
fi

echo "✅ Ollama服务正常运行"

# 获取系统内存信息
TOTAL_RAM=$(free -g | awk 'NR==2{print $2}')
AVAILABLE_RAM=$(free -g | awk 'NR==2{print $7}')

echo "💾 系统内存: ${AVAILABLE_RAM}GB 可用 / ${TOTAL_RAM}GB 总计"

# 根据内存推荐模型
declare -a MODELS_TO_INSTALL

if [ "$AVAILABLE_RAM" -ge 16 ]; then
    echo "🚀 高配置系统，安装完整中文模型套件"
    MODELS_TO_INSTALL=(
        "qwen2.5:0.5b"
        "qwen2.5:1.5b" 
        "qwen2.5:3b"
        "qwen2.5:7b"
        "qwen2.5-coder:1.5b"
        "qwen2.5-coder:7b"
    )
elif [ "$AVAILABLE_RAM" -ge 8 ]; then
    echo "⚖️ 中等配置系统，安装平衡模型组合"
    MODELS_TO_INSTALL=(
        "qwen2.5:1.5b"
        "qwen2.5:3b"
        "qwen2.5-coder:1.5b"
    )
elif [ "$AVAILABLE_RAM" -ge 4 ]; then
    echo "🚀 轻量配置系统，安装基础模型"
    MODELS_TO_INSTALL=(
        "qwen2.5:0.5b"
        "qwen2.5:1.5b"
    )
else
    echo "⚠️ 内存不足4GB，仅安装最小模型"
    MODELS_TO_INSTALL=(
        "qwen2.5:0.5b"
    )
fi

# 获取已安装模型
INSTALLED_MODELS=$(ollama list | tail -n +2 | awk '{print $1}' | grep -v "^$" || true)

echo "📦 开始安装中文优化模型..."

# 安装模型
for model in "${MODELS_TO_INSTALL[@]}"; do
    if echo "$INSTALLED_MODELS" | grep -q "^$model$"; then
        echo "✅ $model 已安装，跳过"
    else
        echo "📥 正在安装: $model"
        if ollama pull "$model"; then
            echo "✅ $model 安装成功"
            
            # 简单测试
            echo "🧪 测试模型..."
            if echo '{"model":"'$model'","prompt":"你好","stream":false}' | \
               curl -s -X POST http://localhost:11434/api/generate \
               -H "Content-Type: application/json" \
               -d @- | grep -q "response"; then
                echo "✅ $model 测试通过"
            else
                echo "⚠️ $model 测试未通过，但安装成功"
            fi
        else
            echo "❌ $model 安装失败"
        fi
        echo ""
    fi
done

# 显示安装结果
echo "📊 安装完成！已安装的中文模型:"
ollama list | grep -E "(qwen|deepseek)" || echo "   暂无中文模型"

# 配置建议
echo ""
echo "🔧 配置建议:"
echo "在 .env.local 中添加:"
echo "NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434"

# 推荐默认模型
if ollama list | grep -q "qwen2.5:1.5b"; then
    echo "NEXT_PUBLIC_DEFAULT_MODEL=qwen2.5:1.5b"
elif ollama list | grep -q "qwen2.5:0.5b"; then
    echo "NEXT_PUBLIC_DEFAULT_MODEL=qwen2.5:0.5b"
fi

echo ""
echo "🎉 中文优化模型安装完成！"
echo "🚀 现在可以启动应用: npm run dev"
echo "📱 访问 DeepStack: http://localhost:3000/modules/deepstack-generator"
