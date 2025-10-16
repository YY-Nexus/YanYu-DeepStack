"use client"

// 环境变量验证器 - 确保系统配置正确
export class EnvironmentValidator {
  private static instance: EnvironmentValidator
  private validationResults: ValidationResult[] = []

  private constructor() {
    this.validateEnvironment()
  }

  public static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator()
    }
    return EnvironmentValidator.instance
  }

  // 验证所有环境变量
  private validateEnvironment(): void {
    console.log("🔍 开始验证环境变量配置...")

    // 验证必需的环境变量
    this.validateRequired()

    // 验证可选的环境变量
    this.validateOptional()

    // 验证配置格式
    this.validateFormats()

    // 输出验证结果
    this.outputResults()
  }

  // 验证必需的环境变量
  private validateRequired(): void {
    const requiredVars: EnvironmentVariable[] = [
      {
        key: "NEXT_PUBLIC_OLLAMA_URL",
        description: "Ollama服务地址",
        category: "core",
        example: "http://localhost:11434",
      },
    ]

    for (const envVar of requiredVars) {
      const value = this.getEnvValue(envVar.key)
      const result: ValidationResult = {
        key: envVar.key,
        description: envVar.description,
        category: envVar.category,
        required: true,
        configured: !!value,
        valid: this.validateValue(envVar.key, value),
        message: this.getValidationMessage(envVar.key, value, true),
      }

      this.validationResults.push(result)

      if (!result.configured) {
        console.error(`❌ 缺少必需的环境变量: ${envVar.key}`)
        console.log(`   描述: ${envVar.description}`)
        console.log(`   示例: ${envVar.example}`)
      }
    }
  }

  // 验证可选的环境变量 - 移除客户端敏感信息
  private validateOptional(): void {
    const optionalVars: EnvironmentVariable[] = [
      // OAuth认证 - 客户端ID可以暴露
      {
        key: "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
        description: "Google OAuth客户端ID",
        category: "auth",
        example: "123456789-abc.apps.googleusercontent.com",
        validator: (value) => value.includes(".apps.googleusercontent.com"),
      },
      {
        key: "NEXT_PUBLIC_GITHUB_CLIENT_ID",
        description: "GitHub OAuth客户端ID",
        category: "auth",
        example: "Iv1.abcdefghijklmnop",
        validator: (value) => value.startsWith("Iv1."),
      },
      {
        key: "NEXT_PUBLIC_AZURE_CLIENT_ID",
        description: "Azure AD客户端ID",
        category: "auth",
        example: "12345678-1234-1234-1234-123456789abc",
        validator: (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
      },

      // SAML配置
      {
        key: "SAML_ENTRY_POINT",
        description: "SAML入口点URL",
        category: "auth",
        example: "https://your-idp.com/saml/sso",
        validator: (value) => value.startsWith("https://"),
      },
      {
        key: "SAML_ISSUER",
        description: "SAML发行者",
        category: "auth",
        example: "your-saml-issuer",
      },

      // 监控追踪
      {
        key: "JAEGER_ENDPOINT",
        description: "Jaeger追踪端点",
        category: "monitoring",
        example: "http://jaeger-collector:14268",
        validator: (value) => value.includes(":14268"),
      },
      {
        key: "ZIPKIN_ENDPOINT",
        description: "Zipkin追踪端点",
        category: "monitoring",
        example: "http://zipkin:9411",
        validator: (value) => value.includes(":9411"),
      },

      // 协作通信 - 客户端ID可以暴露
      {
        key: "NEXT_PUBLIC_SLACK_CLIENT_ID",
        description: "Slack客户端ID",
        category: "collaboration",
        example: "123456789.123456789",
        validator: (value) => /^\d+\.\d+$/.test(value),
      },
    ]

    for (const envVar of optionalVars) {
      const value = this.getEnvValue(envVar.key)
      const result: ValidationResult = {
        key: envVar.key,
        description: envVar.description,
        category: envVar.category,
        required: false,
        configured: !!value,
        valid: value ? this.validateValue(envVar.key, value, envVar.validator) : true,
        message: this.getValidationMessage(envVar.key, value, false, envVar.validator),
      }

      this.validationResults.push(result)

      if (!result.configured) {
        console.warn(`⚠️ 可选环境变量未配置: ${envVar.key}`)
        console.log(`   描述: ${envVar.description}`)
        console.log(`   示例: ${envVar.example}`)
      } else if (!result.valid) {
        console.error(`❌ 环境变量格式错误: ${envVar.key}`)
        console.log(`   当前值格式不正确`)
        console.log(`   示例: ${envVar.example}`)
      }
    }

    // 检查服务端专用配置的可用性（通过API）
    this.checkServerSideConfigurations()
  }

  // 检查服务端配置
  private async checkServerSideConfigurations(): Promise<void> {
    const serverConfigs = [
      { key: "OPENAI_API_KEY", name: "OpenAI服务", category: "ai" },
      { key: "ANTHROPIC_API_KEY", name: "Anthropic服务", category: "ai" },
      { key: "GOOGLE_API_KEY", name: "Google AI服务", category: "ai" },
      { key: "ALIYUN_ACCESS_KEY_ID", name: "阿里云服务", category: "cloud" },
    ]

    for (const config of serverConfigs) {
      try {
        const response = await fetch("/api/config/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: config.key }),
        })

        const result = await response.json()

        this.validationResults.push({
          key: config.key,
          description: config.name,
          category: config.category,
          required: false,
          configured: result.configured || false,
          valid: result.valid || false,
          message: result.configured ? "✅ 服务端已配置" : "⚠️ 服务端未配置",
        })
      } catch (error) {
        // 如果API不可用，跳过检查
        console.warn(`无法检查服务端配置: ${config.key}`)
      }
    }
  }

  // 验证配置格式
  private validateFormats(): void {
    // 验证URL格式
    const urlVars = ["NEXT_PUBLIC_OLLAMA_URL", "JAEGER_ENDPOINT", "ZIPKIN_ENDPOINT", "SAML_ENTRY_POINT"]

    for (const key of urlVars) {
      const value = this.getEnvValue(key)
      if (value && !this.isValidUrl(value)) {
        console.error(`❌ URL格式错误: ${key} = ${value}`)
      }
    }
  }

  // 获取环境变量值
  private getEnvValue(key: string): string {
    return process.env[key] || ""
  }

  // 验证单个值
  private validateValue(key: string, value: string, customValidator?: (value: string) => boolean): boolean {
    if (!value) return false

    // 使用自定义验证器
    if (customValidator) {
      return customValidator(value)
    }

    // 默认验证逻辑
    switch (key) {
      case "NEXT_PUBLIC_OLLAMA_URL":
        return this.isValidUrl(value)
      default:
        return true
    }
  }

  // 生成验证消息
  private getValidationMessage(
    key: string,
    value: string,
    required: boolean,
    customValidator?: (value: string) => boolean,
  ): string {
    if (!value) {
      return required ? "❌ 必需配置" : "⚠️ 未配置"
    }

    if (!this.validateValue(key, value, customValidator)) {
      return "❌ 格式错误"
    }

    return "✅ 配置正确"
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

  // 输出验证结果
  private outputResults(): void {
    const categories = this.groupByCategory()

    console.log("\n📊 环境变量配置报告:")
    console.log("=".repeat(50))

    for (const [category, results] of Object.entries(categories)) {
      console.log(`\n🔧 ${this.getCategoryName(category)}:`)

      for (const result of results) {
        const status = result.configured ? (result.valid ? "✅" : "❌") : result.required ? "❌" : "⚠️"
        console.log(`  ${status} ${result.key}: ${result.message}`)
        if (result.suggestion) {
          console.log(`    💡 ${result.suggestion}`)
        }
      }
    }

    // 统计信息
    const total = this.validationResults.length
    const configured = this.validationResults.filter((r) => r.configured).length
    const valid = this.validationResults.filter((r) => r.configured && r.valid).length
    const required = this.validationResults.filter((r) => r.required).length
    const requiredConfigured = this.validationResults.filter((r) => r.required && r.configured).length

    console.log(`\n📈 配置统计:`)
    console.log(`  总计: ${total} 个环境变量`)
    console.log(`  已配置: ${configured}/${total} (${Math.round((configured / total) * 100)}%)`)
    console.log(`  格式正确: ${valid}/${configured} (${configured > 0 ? Math.round((valid / configured) * 100) : 0}%)`)
    console.log(
      `  必需项: ${requiredConfigured}/${required} (${required > 0 ? Math.round((requiredConfigured / required) * 100) : 0}%)`,
    )

    if (requiredConfigured < required) {
      console.log(`\n❌ 系统无法正常启动，请配置所有必需的环境变量`)
    } else {
      console.log(`\n✅ 系统可以正常启动`)
    }
  }

  // 按类别分组
  private groupByCategory(): Record<string, ValidationResult[]> {
    const groups: Record<string, ValidationResult[]> = {}

    for (const result of this.validationResults) {
      if (!groups[result.category]) {
        groups[result.category] = []
      }
      groups[result.category].push(result)
    }

    return groups
  }

  // 获取类别名称
  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      core: "核心服务",
      ai: "AI服务",
      auth: "身份认证",
      cloud: "云服务",
      monitoring: "监控追踪",
      collaboration: "协作通信",
    }

    return names[category] || category
  }

  // 获取验证结果
  public getValidationResults(): ValidationResult[] {
    return this.validationResults
  }

  // 获取配置状态
  public getConfigurationStatus(): ConfigurationStatus {
    const total = this.validationResults.length
    const configured = this.validationResults.filter((r) => r.configured).length
    const valid = this.validationResults.filter((r) => r.configured && r.valid).length
    const required = this.validationResults.filter((r) => r.required).length
    const requiredConfigured = this.validationResults.filter((r) => r.required && r.configured).length

    return {
      total,
      configured,
      valid,
      required,
      requiredConfigured,
      canStart: requiredConfigured >= required,
      completeness: Math.round((configured / total) * 100),
      validity: configured > 0 ? Math.round((valid / configured) * 100) : 0,
    }
  }

  // 获取缺失的必需配置
  public getMissingRequired(): string[] {
    return this.validationResults.filter((r) => r.required && !r.configured).map((r) => r.key)
  }

  // 获取格式错误的配置
  public getInvalidConfigurations(): string[] {
    return this.validationResults.filter((r) => r.configured && !r.valid).map((r) => r.key)
  }
}

// 类型定义
interface EnvironmentVariable {
  key: string
  description: string
  category: string
  example: string
  validator?: (value: string) => boolean
}

interface ValidationResult {
  key: string
  description: string
  category: string
  required: boolean
  configured: boolean
  valid: boolean
  message: string
  suggestion?: string
}

interface ConfigurationStatus {
  total: number
  configured: number
  valid: number
  required: number
  requiredConfigured: number
  canStart: boolean
  completeness: number
  validity: number
}

// 导出环境验证器实例
export const environmentValidator = EnvironmentValidator.getInstance()
