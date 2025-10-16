#!/bin/bash

# 言語云³ 生产环境构建脚本
echo "🚀 开始构建言語云³生产环境..."

# 1. 清理之前的构建
echo "📦 清理之前的构建文件..."
rm -rf .next
rm -rf dist
rm -rf out

# 2. 安装依赖
echo "📦 安装依赖..."
npm ci

# 3. 类型检查
echo "🔍 进行TypeScript类型检查..."
npm run type-check

# 4. 运行测试
echo "🧪 运行测试..."
npm run test

# 5. 构建生产版本
echo "🏗️ 构建生产版本..."
npm run build

# 6. 创建部署包
echo "📦 创建部署包..."
mkdir -p dist
cp -r .next dist/
cp -r public dist/
cp package.json dist/
cp next.config.mjs dist/

# 7. 压缩部署包
echo "🗜️ 压缩部署包..."
tar -czf yanyu-deepstack-production-$(date +%Y%m%d-%H%M%S).tar.gz -C dist .

echo "✅ 生产环境构建完成！"
echo "📦 部署包: yanyu-deepstack-production-*.tar.gz"
echo "🚀 使用 'npm start' 启动生产服务器"
