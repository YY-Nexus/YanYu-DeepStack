"use client"

import { enhancedOllamaService } from "./enhanced-ollama-service"
import { deepStackConfig, buildEnhancedPrompt, getRelevantExamples } from "./deepstack-config"

// DeepStack服务选项
export interface DeepStackOptions {
  language?: string
  framework?: string
  context?: string
  temperature?: number
  maxTokens?: number
  includeExamples?: boolean
}

// DeepStack响应接口
export interface DeepStackResponse {
  success: boolean
  code?: string
  explanation?: string
  language?: string
  examples?: string[]
  error?: string
  metrics?: {
    latency: number
    tokensGenerated: number
    tokensPerSecond: number
  }
}

/**
 * DeepStack AI代码助手服务
 * 基于配置的专业代码生成服务
 */
export class DeepStackService {
  private static instance: DeepStackService

  public static getInstance(): DeepStackService {
    if (!DeepStackService.instance) {
      DeepStackService.instance = new DeepStackService()
    }
    return DeepStackService.instance
  }

  /**
   * 生成代码
   * @param prompt 用户提示词
   * @param options 生成选项
   * @returns 生成结果
   */
  public async generateCode(prompt: string, options: DeepStackOptions = {}): Promise<DeepStackResponse> {
    try {
      const startTime = Date.now()

      // 构建增强提示词
      const enhancedPrompt = buildEnhancedPrompt(prompt, options.language, options.context)

      // 获取相关示例
      const examples = options.includeExamples ? getRelevantExamples(prompt, 2) : []

      // 如果有相关示例，添加到提示词中
      let finalPrompt = enhancedPrompt
      if (examples.length > 0) {
        finalPrompt += "\n\n参考示例：\n"
        examples.forEach((example, index) => {
          finalPrompt += `\n示例${index + 1}：\n用户：${example.user}\n助手：${example.ai}\n`
        })
        finalPrompt += "\n请参考以上示例的风格和格式来回答用户的问题。\n"
      }

      // 调用Ollama服务生成代码
      const result = await enhancedOllamaService.generateText("qwen2.5:latest", finalPrompt, {
        temperature: options.temperature || 0.3,
        maxTokens: options.maxTokens || 2048,
      })

      const endTime = Date.now()

      if (result.success && result.text) {
        // 解析生成的内容
        const { code, explanation } = this.parseResponse(result.text)

        return {
          success: true,
          code,
          explanation,
          language: options.language,
          examples: examples.map((ex) => ex.user),
          metrics: {
            latency: endTime - startTime,
            tokensGenerated: result.tokens?.completion || 0,
            tokensPerSecond: result.tokens?.completion
              ? (result.tokens.completion / (result.timing?.evalTime || 1e9)) * 1e9
              : 0,
          },
        }
      } else {
        return {
          success: false,
          error: result.error || "代码生成失败",
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "服务异常",
      }
    }
  }

  /**
   * 优化代码
   * @param code 原始代码
   * @param language 编程语言
   * @param optimizationType 优化类型
   * @returns 优化结果
   */
  public async optimizeCode(
    code: string,
    language: string,
    optimizationType: "performance" | "readability" | "security" = "readability",
  ): Promise<DeepStackResponse> {
    const optimizationMap = {
      performance: "性能",
      readability: "可读性",
      security: "安全性",
    }

    const prompt = `请优化以下${language}代码，重点提升${optimizationMap[optimizationType]}：

\`\`\`${language}
${code}
\`\`\`

请提供优化后的代码，并详细说明改进的地方。`

    return this.generateCode(prompt, { language, temperature: 0.2 })
  }

  /**
   * 解释代码
   * @param code 要解释的代码
   * @param language 编程语言
   * @returns 解释结果
   */
  public async explainCode(code: string, language: string): Promise<DeepStackResponse> {
    const prompt = `请详细解释以下${language}代码的功能、逻辑和关键实现：

\`\`\`${language}
${code}
\`\`\`

请用中文解释，包括：
1. 代码的主要功能
2. 关键算法或逻辑
3. 重要的实现细节
4. 可能的改进建议`

    return this.generateCode(prompt, { language, temperature: 0.3 })
  }

  /**
   * 修复代码错误
   * @param code 有问题的代码
   * @param language 编程语言
   * @param errorDescription 错误描述
   * @returns 修复结果
   */
  public async fixCode(code: string, language: string, errorDescription?: string): Promise<DeepStackResponse> {
    let prompt = `请修复以下${language}代码中的错误：

\`\`\`${language}
${code}
\`\`\``

    if (errorDescription) {
      prompt += `\n\n错误描述：${errorDescription}`
    }

    prompt += `\n\n请提供修复后的代码，并说明修复的问题和原因。`

    return this.generateCode(prompt, { language, temperature: 0.2 })
  }

  /**
   * 解析AI响应，提取代码和解释
   * @param response AI响应文本
   * @returns 解析结果
   */
  private parseResponse(response: string): { code: string; explanation: string } {
    // 提取代码块
    const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/g
    const codeMatches = [...response.matchAll(codeBlockRegex)]

    let code = ""
    if (codeMatches.length > 0) {
      code = codeMatches.map((match) => match[1].trim()).join("\n\n")
    }

    // 提取解释（去除代码块后的文本）
    let explanation = response
    codeMatches.forEach((match) => {
      explanation = explanation.replace(match[0], "")
    })
    explanation = explanation.trim()

    return { code, explanation }
  }

  /**
   * 获取支持的编程语言
   * @returns 支持的语言列表
   */
  public getSupportedLanguages(): string[] {
    return deepStackConfig.supportedLanguages
  }

  /**
   * 获取服务能力
   * @returns 能力列表
   */
  public getCapabilities(): string[] {
    return deepStackConfig.capabilities
  }
}

// 导出单例实例
export const deepStackService = DeepStackService.getInstance()
