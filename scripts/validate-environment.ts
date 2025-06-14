#!/usr/bin/env node

/**
 * 环境变量验证脚本
 * 验证所有必需和可选的环境变量配置
 */

import { existsSync, readFileSync } from "fs"
import { join } from "path"

interface ValidationResult {
  key: string
  required: boolean
  configured: boolean
  valid: boolean
  message: string
  suggestion?: string
}

class EnvironmentValidator {
  private envPath: string
  private config: Record<string, string> = {}

  constructor() {
    this.envPath = join(process.cwd(), ".env.local")
    this.loadEnvironmentConfig()
  }

  // 加载环境配置
  private loadEnvironmentConfig(): void {
    if (!existsSync(this.envPath)) {
      console.log("❌ 未找到环境变量文件 .env.local")
      console.log("   请运行: npm run setup:env")
      return
    }

    const content = readFileSync(this.envPath, "utf-8")
    const lines = content.split("\n")

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=")
        if (key && valueParts.length > 0) {
          this.config[key.trim()] = valueParts.join("=").trim()
        }
      }
    }
  }

  // 验证单个环境变量
  private validateVariable(key: string, required = false, validator?: (value: string) => boolean): ValidationResult {
    const value = this.config[key] || process.env[key]
    const configured = !!value

    let valid = true
    let message = ""
    let suggestion = ""

    if (!configured) {
      message = required ? "❌ 必需配置缺失" : "⚠️ 可选配置未设置"
      suggestion = this.getConfigurationSuggestion(key)
    } else if (validator && !validator(value)) {
      valid = false
      message = "❌ 配置格式错误"
      suggestion = this.getFormatSuggestion(key)
    } else {
      message = "✅ 配置正确"
    }

    return {
      key,
      required,
      configured,
      valid,
      message,
      suggestion,
    }
  }

  // 获取配置建议
  private getConfigurationSuggestion(key: string): string {
    const suggestions: Record<string, string> = {
      NEXT_PUBLIC_OLLAMA_URL: '运行 "ollama serve" 启动服务，然后设置为 http://localhost:11434',
      NEXT_PUBLIC_OPENAI_API_KEY: "访问 https://platform.openai.com/api-keys 获取API密钥",
      NEXT_PUBLIC_GITHUB_CLIENT_ID: "访问 https://github.com/settings/developers 创建OAuth应用",
      ALIYUN_ACCESS_KEY_ID: "访问 https://ram.console.aliyun.com/ 创建访问密钥",
    }

    return suggestions[key] || "请参考文档配置此环境变量"
  }

  // 获取格式建议
  private getFormatSuggestion(key: string): string {
    const suggestions: Record<string, string> = {
      NEXT_PUBLIC_OLLAMA_URL: "应该是有效的URL格式，如: http://localhost:11434",
      NEXT_PUBLIC_OPENAI_API_KEY: '应该以 "sk-" 开头',
      NEXT_PUBLIC_ANTHROPIC_API_KEY: '应该以 "sk-ant-" 开头',
      NEXT_PUBLIC_GOOGLE_API_KEY: '应该以 "AIza" 开头',
    }

    return suggestions[key] || "请检查配置格式是否正确"
  }

  // 验证URL格式
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // 测试Ollama连接
  private async testOllamaConnection(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }

  // 主要验证流程
  public async validate(): Promise<void> {
    console.log("🔍 验证环境变量配置")
    console.log("=" * 50)

    const results: ValidationResult[] = []

    // 验证核心必需配置
    console.log("\n🔧 核心配置 (必需):")
    const coreResults = [
      this.validateVariable("NEXT_PUBLIC_OLLAMA_URL", true, this.isValidUrl),
      this.validateVariable("NODE_ENV", true),
      this.validateVariable("NEXT_PUBLIC_APP_NAME", true),
      this.validateVariable("NEXT_PUBLIC_APP_VERSION", true),
      this.validateVariable("NEXT_PUBLIC_API_BASE_URL", true, this.isValidUrl),
    ]

    for (const result of coreResults) {
      results.push(result)
      console.log(`  ${result.message} ${result.key}`)
      if (result.suggestion) {
        console.log(`    💡 ${result.suggestion}`)
      }
    }

    // 测试Ollama连接
    const ollamaUrl = this.config["NEXT_PUBLIC_OLLAMA_URL"]
    if (ollamaUrl) {
      console.log("\n🔗 测试Ollama连接...")
      const isConnected = await this.testOllamaConnection(ollamaUrl)
      if (isConnected) {
        console.log("  ✅ Ollama服务连接正常")
      } else {
        console.log("  ❌ 无法连接到Ollama服务")
        console.log("    💡 请确保Ollama正在运行: ollama serve")
      }
    }

    // 测试API基础地址
    const apiBaseUrl = this.config["NEXT_PUBLIC_API_BASE_URL"]
    if (apiBaseUrl && apiBaseUrl.startsWith("https://")) {
      console.log("\n🌐 测试API连接...")
      try {
        const response = await fetch(`${apiBaseUrl}/health`, {
          signal: AbortSignal.timeout(5000),
        })
        if (response.ok) {
          console.log("  ✅ API服务连接正常")
        } else {
          console.log("  ⚠️ API服务响应异常，但这在开发阶段是正常的")
        }
      } catch {
        console.log("  ⚠️ 无法连接到API服务，但这在开发阶段是正常的")
      }
    }

    // 检查可选配置
    console.log("\n🔧 可选配置状态:")
    const optionalConfigs = [
      "NEXT_PUBLIC_OPENAI_API_KEY",
      "NEXT_PUBLIC_GITHUB_CLIENT_ID",
      "ALIYUN_ACCESS_KEY_ID",
      "JAEGER_ENDPOINT",
    ]

    let optionalConfigured = 0
    for (const key of optionalConfigs) {
      const value = this.config[key]
      if (value) {
        console.log(`  ✅ ${key} 已配置`)
        optionalConfigured++
      } else {
        console.log(`  ⚪ ${key} 未配置 (可选)`)
      }
    }

    // 统计结果
    const requiredConfigured = coreResults.filter((r) => r.configured).length
    const requiredTotal = coreResults.length

    console.log("\n📊 配置统计:")
    console.log("=" * 30)
    console.log(`必需配置: ${requiredConfigured}/${requiredTotal}`)
    console.log(`可选配置: ${optionalConfigured}/${optionalConfigs.length}`)

    // 最终结果
    console.log("\n🎯 验证结果:")
    if (requiredConfigured >= requiredTotal) {
      console.log("✅ 核心配置完整，应用可以正常启动!")
      console.log("\n🚀 启动应用:")
      console.log("   npm run dev")
      console.log("   或者: ./start.sh")

      if (optionalConfigured > 0) {
        console.log(`\n🎉 已启用 ${optionalConfigured} 个可选功能`)
      }

      console.log("\n💡 提示:")
      console.log("   - 可选配置可以随时在 .env.local 中启用")
      console.log("   - 访问 /admin/environment-config 查看详细状态")
    } else {
      console.log("❌ 核心配置不完整，请检查以下配置:")
      const missing = coreResults.filter((r) => !r.configured)
      missing.forEach((r) => console.log(`     - ${r.key}`))
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const validator = new EnvironmentValidator()
  validator.validate()
}

export { EnvironmentValidator }
