#!/usr/bin/env node

/**
 * 核心环境变量自动配置脚本
 * 用于快速设置言語云³深度堆栈的必需环境变量
 */

import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"
import { execSync } from "child_process"

interface CoreEnvironmentConfig {
  NEXT_PUBLIC_OLLAMA_URL: string
  NODE_ENV: string
  NEXT_PUBLIC_APP_NAME: string
  NEXT_PUBLIC_APP_VERSION: string
  NEXT_PUBLIC_API_BASE_URL: string
}

class CoreEnvironmentSetup {
  private envPath: string
  private examplePath: string
  private currentConfig: Record<string, string> = {}

  constructor() {
    this.envPath = join(process.cwd(), ".env.local")
    this.examplePath = join(process.cwd(), ".env.example")
    this.loadCurrentConfig()
  }

  // 加载当前配置
  private loadCurrentConfig(): void {
    if (existsSync(this.envPath)) {
      const content = readFileSync(this.envPath, "utf-8")
      const lines = content.split("\n")

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...valueParts] = trimmed.split("=")
          if (key && valueParts.length > 0) {
            this.currentConfig[key.trim()] = valueParts.join("=").trim()
          }
        }
      }
    }
  }

  // 检测Ollama服务
  private async detectOllamaService(): Promise<string> {
    console.log("🔍 正在检测Ollama服务...")

    const possibleUrls = [
      "http://localhost:11434",
      "http://127.0.0.1:11434",
      "http://ollama:11434",
      process.env.NEXT_PUBLIC_OLLAMA_URL || "",
    ].filter(Boolean)

    for (const url of possibleUrls) {
      try {
        console.log(`   检测: ${url}`)

        // 使用fetch检测服务可用性
        const response = await fetch(`${url}/api/tags`, {
          method: "GET",
          signal: AbortSignal.timeout(3000), // 3秒超时
        })

        if (response.ok) {
          console.log(`✅ 发现Ollama服务: ${url}`)
          return url
        }
      } catch (error) {
        console.log(`   ❌ ${url} 不可用`)
      }
    }

    // 如果没有检测到服务，提供默认值
    console.log("⚠️ 未检测到运行中的Ollama服务")
    console.log("   将使用默认配置: http://localhost:11434")
    console.log("   请确保Ollama服务正在运行")

    return "http://localhost:11434"
  }

  // 检查Ollama安装状态
  private checkOllamaInstallation(): boolean {
    try {
      execSync("ollama --version", { stdio: "pipe" })
      return true
    } catch {
      return false
    }
  }

  // 获取可用的Ollama模型
  private async getAvailableModels(ollamaUrl: string): Promise<string[]> {
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`)
      if (response.ok) {
        const data = await response.json()
        return data.models?.map((model: any) => model.name) || []
      }
    } catch (error) {
      console.log("⚠️ 无法获取模型列表")
    }
    return []
  }

  // 生成核心配置
  private async generateCoreConfig(): Promise<CoreEnvironmentConfig> {
    console.log("🚀 开始配置核心环境变量...\n")

    // 检测Ollama服务
    const ollamaUrl = await this.detectOllamaService()

    // 获取可用模型
    const models = await this.getAvailableModels(ollamaUrl)
    if (models.length > 0) {
      console.log(`📦 发现可用模型: ${models.join(", ")}`)
    }

    // 使用用户提供的配置
    const config: CoreEnvironmentConfig = {
      NEXT_PUBLIC_OLLAMA_URL: ollamaUrl,
      NODE_ENV: "development", // 用户已配置
      NEXT_PUBLIC_APP_NAME: "言語云³深度堆栈", // 用户已配置
      NEXT_PUBLIC_APP_VERSION: "1.0.0", // 用户已配置
      NEXT_PUBLIC_API_BASE_URL: "https://nettrack.yyhnit.com", // 用户已配置
    }

    return config
  }

  // 创建环境变量文件
  private createEnvironmentFile(config: CoreEnvironmentConfig): void {
    console.log("\n📝 创建环境变量文件...")

    const envContent = this.generateEnvFileContent(config)

    // 备份现有文件
    if (existsSync(this.envPath)) {
      const backupPath = `${this.envPath}.backup.${Date.now()}`
      const currentContent = readFileSync(this.envPath, "utf-8")
      writeFileSync(backupPath, currentContent)
      console.log(`📋 已备份现有配置到: ${backupPath}`)
    }

    // 写入新配置
    writeFileSync(this.envPath, envContent)
    console.log(`✅ 环境变量文件已创建: ${this.envPath}`)
  }

  // 生成环境变量文件内容
  private generateEnvFileContent(config: CoreEnvironmentConfig): string {
    const timestamp = new Date().toISOString()

    return `# 言語云³深度堆栈 - 核心环境变量配置
# 自动生成时间: ${timestamp}
# 
# 🚨 重要提示:
# 1. 请勿将此文件提交到版本控制系统
# 2. 生产环境请使用更安全的密钥管理方案

# ================================
# 🔧 核心服务配置 (必需)
# ================================

# Ollama AI服务地址 - 本地AI模型服务
NEXT_PUBLIC_OLLAMA_URL=${config.NEXT_PUBLIC_OLLAMA_URL}

# 应用运行环境
NODE_ENV=${config.NODE_ENV}

# 应用基本信息
NEXT_PUBLIC_APP_NAME=${config.NEXT_PUBLIC_APP_NAME}
NEXT_PUBLIC_APP_VERSION=${config.NEXT_PUBLIC_APP_VERSION}

# API基础地址
NEXT_PUBLIC_API_BASE_URL=${config.NEXT_PUBLIC_API_BASE_URL}

# ================================
# 🔐 安全配置
# ================================

# JWT密钥 (生产环境请使用强密码)
JWT_SECRET=${this.generateSecureSecret()}

# 会话密钥
SESSION_SECRET=${this.generateSecureSecret()}

# ================================
# 📊 应用配置
# ================================

# 调试模式
DEBUG=true

# 日志级别
LOG_LEVEL=debug

# 热重载
FAST_REFRESH=true

# TypeScript检查
TYPESCRIPT_CHECK=true

# ESLint检查
ESLINT_CHECK=true

# ================================
# 🤖 AI服务配置 (可选 - 按需启用)
# ================================

# 如需使用OpenAI服务，请取消注释并填入API密钥
# NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key
# OPENAI_ORG_ID=org-your-organization-id

# 如需使用Anthropic服务，请取消注释并填入API密钥
# NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# 如需使用Google AI服务，请取消注释并填入API密钥
# NEXT_PUBLIC_GOOGLE_API_KEY=AIza-your-google-api-key

# ================================
# 🔐 身份认证配置 (可选 - 按需启用)
# ================================

# 如需GitHub OAuth登录，请取消注释并配置
# NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret

# 如需Google OAuth登录，请取消注释并配置
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# ================================
# ☁️ 云服务配置 (可选 - 按需启用)
# ================================

# 如需阿里云服务，请取消注释并配置
# ALIYUN_ACCESS_KEY_ID=your-aliyun-access-key-id
# ALIYUN_ACCESS_KEY_SECRET=your-aliyun-access-key-secret
# ALIYUN_REGION=cn-hangzhou
# ALIYUN_ENDPOINT=https://ecs.cn-hangzhou.aliyuncs.com

# ================================
# 📊 监控配置 (可选 - 按需启用)
# ================================

# 如需分布式追踪，请取消注释并配置
# JAEGER_ENDPOINT=http://localhost:14268
# ZIPKIN_ENDPOINT=http://localhost:9411

# ================================
# 💬 协作通信配置 (可选 - 按需启用)
# ================================

# 如需Slack集成，请取消注释并配置
# NEXT_PUBLIC_SLACK_CLIENT_ID=your-slack-client-id
# SLACK_CLIENT_SECRET=your-slack-client-secret

# ================================
# 🎨 界面配置
# ================================

# 默认主题
NEXT_PUBLIC_DEFAULT_THEME=light

# 主题切换
NEXT_PUBLIC_THEME_SWITCHING=true

# 默认语言
NEXT_PUBLIC_DEFAULT_LOCALE=zh-CN

# 支持的语言
NEXT_PUBLIC_SUPPORTED_LOCALES=zh-CN,en-US

# ================================
# 📱 PWA配置
# ================================

# 启用PWA
NEXT_PUBLIC_PWA_ENABLED=true

# 离线支持
NEXT_PUBLIC_OFFLINE_SUPPORT=true

# ================================
# 🔧 高级配置
# ================================

# 最大文件上传大小 (MB)
MAX_FILE_SIZE=10

# API请求超时 (秒)
API_TIMEOUT=30

# 并发请求限制
MAX_CONCURRENT_REQUESTS=10

# 缓存过期时间 (秒)
CACHE_TTL=3600

# ================================
# 结束配置
# ================================
`
  }

  // 生成安全密钥
  private generateSecureSecret(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let result = ""
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // 验证配置
  private async validateConfiguration(config: CoreEnvironmentConfig): Promise<boolean> {
    console.log("\n🔍 验证配置...")

    let isValid = true

    // 验证Ollama服务
    try {
      const response = await fetch(`${config.NEXT_PUBLIC_OLLAMA_URL}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      })

      if (response.ok) {
        console.log("✅ Ollama服务连接正常")
      } else {
        console.log("❌ Ollama服务响应异常")
        isValid = false
      }
    } catch (error) {
      console.log("❌ 无法连接到Ollama服务")
      console.log("   请确保Ollama正在运行并且地址正确")
      isValid = false
    }

    // 验证必需配置
    const requiredFields = ["NEXT_PUBLIC_OLLAMA_URL", "NODE_ENV"]
    for (const field of requiredFields) {
      if (!config[field as keyof CoreEnvironmentConfig]) {
        console.log(`❌ 缺少必需配置: ${field}`)
        isValid = false
      }
    }

    return isValid
  }

  // 提供Ollama安装指导
  private provideOllamaInstallationGuide(): void {
    console.log("\n📖 Ollama安装指南:")
    console.log("=" * 50)

    const isOllamaInstalled = this.checkOllamaInstallation()

    if (!isOllamaInstalled) {
      console.log("❌ 未检测到Ollama安装")
      console.log("\n🔧 安装Ollama:")
      console.log("   macOS/Linux: curl -fsSL https://ollama.ai/install.sh | sh")
      console.log("   Windows: 访问 https://ollama.ai/download")
      console.log("   Docker: docker run -d -p 11434:11434 ollama/ollama")
    } else {
      console.log("✅ Ollama已安装")
    }

    console.log("\n🚀 启动Ollama服务:")
    console.log("   ollama serve")

    console.log("\n📦 下载推荐模型:")
    console.log("   ollama pull llama3.2        # 通用对话模型")
    console.log("   ollama pull codellama       # 代码生成模型")
    console.log("   ollama pull qwen2.5         # 中文优化模型")

    console.log("\n🔍 验证安装:")
    console.log("   ollama list                 # 查看已安装模型")
    console.log("   curl http://localhost:11434/api/tags  # 测试API")
  }

  // 生成启动脚本
  private generateStartupScript(): void {
    const scriptContent = `#!/bin/bash

# 言語云³深度堆栈启动脚本
# 自动检查环境并启动服务

echo "🚀 启动言語云³深度堆栈..."

# 检查Node.js版本
NODE_VERSION=$(node --version)
echo "📦 Node.js版本: $NODE_VERSION"

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "❌ 未找到环境变量文件 .env.local"
    echo "   请运行: npm run setup:env"
    exit 1
fi

# 检查Ollama服务
echo "🔍 检查Ollama服务..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama服务正常"
else
    echo "❌ Ollama服务未运行"
    echo "   请启动Ollama: ollama serve"
    exit 1
fi

# 安装依赖
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "   安装依赖中..."
    npm install
fi

# 启动开发服务器
echo "🌟 启动开发服务器..."
npm run dev
`

    writeFileSync("start.sh", scriptContent)

    // 设置执行权限 (Unix系统)
    try {
      execSync("chmod +x start.sh")
    } catch {
      // Windows系统忽略权限设置
    }

    console.log("✅ 启动脚本已创建: start.sh")
  }

  // 主要设置流程
  public async setup(): Promise<void> {
    try {
      console.log("🎯 言語云³深度堆栈 - 核心环境变量配置")
      console.log("=" * 60)

      // 生成核心配置
      const config = await this.generateCoreConfig()

      // 创建环境变量文件
      this.createEnvironmentFile(config)

      // 验证配置
      const isValid = await this.validateConfiguration(config)

      // 生成启动脚本
      this.generateStartupScript()

      // 提供安装指导
      this.provideOllamaInstallationGuide()

      console.log("\n🎉 核心环境变量配置完成!")
      console.log("=" * 60)

      if (isValid) {
        console.log("✅ 所有配置验证通过，可以启动应用")
        console.log("\n🚀 启动应用:")
        console.log("   npm run dev")
        console.log("   或者: ./start.sh")
      } else {
        console.log("⚠️ 部分配置需要调整，请检查上述提示")
        console.log("\n🔧 修复问题后重新验证:")
        console.log("   npm run validate:env")
      }

      console.log("\n📖 更多配置选项:")
      console.log("   编辑 .env.local 文件添加可选服务")
      console.log("   访问 /admin/environment-config 查看配置状态")
    } catch (error) {
      console.error("❌ 配置过程中出现错误:", error)
      process.exit(1)
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const setup = new CoreEnvironmentSetup()
  setup.setup()
}

export { CoreEnvironmentSetup }
