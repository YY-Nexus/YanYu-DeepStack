"use client"

import { multimodalAIService } from "./multimodal-ai-service"

// 自动化编程助手 - 提供代码生成、补全、重构和测试生成
export class AutoProgrammingAssistant {
  private static instance: AutoProgrammingAssistant
  private supportedLanguages: string[]
  private supportedFrameworks: Record<string, string[]>
  private codeQualityMetrics: string[]
  private testingFrameworks: Record<string, string[]>

  private constructor() {
    // 支持的编程语言
    this.supportedLanguages = [
      "javascript",
      "typescript",
      "python",
      "java",
      "c#",
      "go",
      "rust",
      "php",
      "ruby",
      "swift",
      "kotlin",
      "dart",
    ]

    // 支持的框架
    this.supportedFrameworks = {
      javascript: ["react", "vue", "angular", "next.js", "express", "nest.js"],
      typescript: ["react", "vue", "angular", "next.js", "express", "nest.js"],
      python: ["django", "flask", "fastapi", "pytorch", "tensorflow"],
      java: ["spring", "hibernate", "android"],
      "c#": [".net core", "asp.net", "xamarin", "unity"],
      go: ["gin", "echo", "fiber"],
      rust: ["actix", "rocket", "tokio"],
      php: ["laravel", "symfony", "wordpress"],
      ruby: ["rails", "sinatra"],
      swift: ["swiftui", "uikit"],
      kotlin: ["spring", "android", "ktor"],
      dart: ["flutter"],
    }

    // 代码质量指标
    this.codeQualityMetrics = [
      "可读性",
      "可维护性",
      "性能",
      "安全性",
      "可测试性",
      "复杂度",
      "代码重复",
      "命名规范",
      "注释质量",
    ]

    // 测试框架
    this.testingFrameworks = {
      javascript: ["jest", "mocha", "cypress", "playwright"],
      typescript: ["jest", "mocha", "cypress", "playwright"],
      python: ["pytest", "unittest", "behave"],
      java: ["junit", "testng", "mockito"],
      "c#": ["nunit", "xunit", "mstest"],
      go: ["testing", "testify", "gomock"],
      rust: ["cargo test"],
      php: ["phpunit", "codeception"],
      ruby: ["rspec", "minitest"],
      swift: ["xctest"],
      kotlin: ["junit", "kotlintest"],
      dart: ["flutter test"],
    }
  }

  public static getInstance(): AutoProgrammingAssistant {
    if (!AutoProgrammingAssistant.instance) {
      AutoProgrammingAssistant.instance = new AutoProgrammingAssistant()
    }
    return AutoProgrammingAssistant.instance
  }

  // 获取支持的编程语言
  public getSupportedLanguages(): string[] {
    return this.supportedLanguages
  }

  // 获取特定语言支持的框架
  public getSupportedFrameworks(language: string): string[] {
    return this.supportedFrameworks[language] || []
  }

  // 获取代码质量指标
  public getCodeQualityMetrics(): string[] {
    return this.codeQualityMetrics
  }

  // 获取特定语言支持的测试框架
  public getTestingFrameworks(language: string): string[] {
    return this.testingFrameworks[language] || []
  }

  // 代码生成
  public async generateCode(
    prompt: string,
    language: string,
    framework?: string,
    options: CodeGenerationOptions = {},
  ): Promise<CodeGenerationResult> {
    try {
      // 验证语言是否支持
      if (!this.supportedLanguages.includes(language)) {
        throw new Error(`不支持的编程语言: ${language}`)
      }

      // 验证框架是否支持
      if (framework && !this.supportedFrameworks[language]?.includes(framework)) {
        throw new Error(`${language} 不支持框架: ${framework}`)
      }

      // 构建提示词
      let enhancedPrompt = `使用 ${language} `
      if (framework) {
        enhancedPrompt += `和 ${framework} 框架 `
      }
      enhancedPrompt += `实现以下功能:\n\n${prompt}\n\n`
      enhancedPrompt += "请提供完整、可运行的代码，并包含详细的中文注释。"

      // 设置默认选项
      const defaultOptions: CodeGenerationOptions = {
        modelId: "codellama:latest",
        temperature: 0.2,
        maxTokens: 2000,
        includeExplanation: true,
        optimizeFor: "readability",
      }

      const mergedOptions = { ...defaultOptions, ...options }

      // 调用AI服务生成代码
      const response = await multimodalAIService.generateText(enhancedPrompt, mergedOptions.modelId, {
        temperature: mergedOptions.temperature,
        maxTokens: mergedOptions.maxTokens,
      })

      // 解析生成的代码和解释
      const { code, explanation } = this.parseCodeResponse(response.text)

      return {
        code,
        language,
        framework: framework || null,
        explanation: mergedOptions.includeExplanation ? explanation : null,
        model: response.model,
        usage: response.usage,
      }
    } catch (error) {
      throw error
    }
  }

  // 代码补全
  public async completeCode(
    codeSnippet: string,
    language: string,
    options: CodeCompletionOptions = {},
  ): Promise<CodeCompletionResult> {
    try {
      // 验证语言是否支持
      if (!this.supportedLanguages.includes(language)) {
        throw new Error(`不支持的编程语言: ${language}`)
      }

      // 构建提示词
      let prompt = `请补全以下 ${language} 代码:\n\n${codeSnippet}\n\n`
      prompt += "请只返回补全的代码部分，不要重复已有代码。"

      // 设置默认选项
      const defaultOptions: CodeCompletionOptions = {
        modelId: "codellama:latest",
        temperature: 0.2,
        maxTokens: 1000,
        stopAtDelimiter: true,
      }

      const mergedOptions = { ...defaultOptions, ...options }

      // 调用AI服务补全代码
      const response = await multimodalAIService.generateText(prompt, mergedOptions.modelId, {
        temperature: mergedOptions.temperature,
        maxTokens: mergedOptions.maxTokens,
        stop: mergedOptions.stopAtDelimiter ? ["}"] : undefined,
      })

      return {
        completion: response.text,
        language,
        model: response.model,
        usage: response.usage,
      }
    } catch (error) {
      throw error
    }
  }

  // 代码重构
  public async refactorCode(
    codeSnippet: string,
    language: string,
    refactoringType: RefactoringType,
    options: CodeRefactoringOptions = {},
  ): Promise<CodeRefactoringResult> {
    try {
      // 验证语言是否支持
      if (!this.supportedLanguages.includes(language)) {
        throw new Error(`不支持的编程语言: ${language}`)
      }

      // 构建提示词
      let prompt = `请对以下 ${language} 代码进行${refactoringType}重构:\n\n${codeSnippet}\n\n`

      switch (refactoringType) {
        case "performance":
          prompt += "重点优化代码性能，减少不必要的计算和内存使用。"
          break
        case "readability":
          prompt += "重点提高代码可读性，使用更清晰的命名和结构。"
          break
        case "modularity":
          prompt += "重点提高代码模块化，拆分复杂函数，增强复用性。"
          break
        case "security":
          prompt += "重点提高代码安全性，修复潜在的安全漏洞。"
          break
      }

      prompt += "\n请提供重构后的完整代码，并用中文注释说明重构的改进点。"

      // 设置默认选项
      const defaultOptions: CodeRefactoringOptions = {
        modelId: "codellama:latest",
        temperature: 0.3,
        maxTokens: 2000,
        includeExplanation: true,
      }

      const mergedOptions = { ...defaultOptions, ...options }

      // 调用AI服务重构代码
      const response = await multimodalAIService.generateText(prompt, mergedOptions.modelId, {
        temperature: mergedOptions.temperature,
        maxTokens: mergedOptions.maxTokens,
      })

      // 解析生成的代码和解释
      const { code, explanation } = this.parseCodeResponse(response.text)

      return {
        originalCode: codeSnippet,
        refactoredCode: code,
        language,
        refactoringType,
        explanation: mergedOptions.includeExplanation ? explanation : null,
        model: response.model,
        usage: response.usage,
      }
    } catch (error) {
      throw error
    }
  }

  // 测试生成
  public async generateTests(
    codeSnippet: string,
    language: string,
    options: TestGenerationOptions = {},
  ): Promise<TestGenerationResult> {
    try {
      // 验证语言是否支持
      if (!this.supportedLanguages.includes(language)) {
        throw new Error(`不支持的编程语言: ${language}`)
      }

      // 获取该语言支持的测试框架
      const availableFrameworks = this.testingFrameworks[language] || []
      const testFramework = options.testFramework || availableFrameworks[0] || "默认测试框架"

      // 构建提示词
      let prompt = `请为以下 ${language} 代码生成单元测试:\n\n${codeSnippet}\n\n`
      prompt += `使用 ${testFramework} 测试框架，覆盖所有主要功能和边界情况。`
      prompt += "\n请提供完整的测试代码，并用中文注释说明测试的目的。"

      // 设置默认选项
      const defaultOptions: TestGenerationOptions = {
        modelId: "codellama:latest",
        temperature: 0.3,
        maxTokens: 2000,
        coverageTarget: 80,
      }

      const mergedOptions = { ...defaultOptions, ...options }

      // 调用AI服务生成测试
      const response = await multimodalAIService.generateText(prompt, mergedOptions.modelId, {
        temperature: mergedOptions.temperature,
        maxTokens: mergedOptions.maxTokens,
      })

      // 解析生成的测试代码
      const { code: testCode, explanation } = this.parseCodeResponse(response.text)

      return {
        sourceCode: codeSnippet,
        testCode,
        language,
        testFramework,
        coverageEstimate: mergedOptions.coverageTarget,
        explanation,
        model: response.model,
        usage: response.usage,
      }
    } catch (error) {
      throw error
    }
  }

  // 代码质量评估
  public async evaluateCodeQuality(
    codeSnippet: string,
    language: string,
    options: CodeQualityOptions = {},
  ): Promise<CodeQualityResult> {
    try {
      // 验证语言是否支持
      if (!this.supportedLanguages.includes(language)) {
        throw new Error(`不支持的编程语言: ${language}`)
      }

      // 构建提示词
      let prompt = `请评估以下 ${language} 代码的质量:\n\n${codeSnippet}\n\n`
      prompt += "请从以下几个方面进行评估，并给出1-10的分数和具体改进建议：\n"
      prompt += "1. 可读性\n2. 可维护性\n3. 性能\n4. 安全性\n5. 可测试性\n"
      prompt += "6. 复杂度\n7. 代码重复\n8. 命名规范\n9. 注释质量\n"
      prompt += "最后给出总体评分和总结性建议。"

      // 设置默认选项
      const defaultOptions: CodeQualityOptions = {
        modelId: "codellama:latest",
        temperature: 0.3,
        maxTokens: 2000,
        detailedReport: true,
      }

      const mergedOptions = { ...defaultOptions, ...options }

      // 调用AI服务评估代码质量
      const response = await multimodalAIService.generateText(prompt, mergedOptions.modelId, {
        temperature: mergedOptions.temperature,
        maxTokens: mergedOptions.maxTokens,
      })

      // 解析评估结果
      const evaluationResult = this.parseQualityEvaluation(response.text)

      return {
        codeSnippet,
        language,
        metrics: evaluationResult.metrics,
        overallScore: evaluationResult.overallScore,
        suggestions: evaluationResult.suggestions,
        detailedReport: mergedOptions.detailedReport ? response.text : null,
        model: response.model,
        usage: response.usage,
      }
    } catch (error) {
      throw error
    }
  }

  // 解析代码响应
  private parseCodeResponse(response: string): { code: string; explanation: string } {
    // 简单实现，实际应用中可能需要更复杂的解析逻辑
    const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/g
    const matches = [...response.matchAll(codeBlockRegex)]

    if (matches.length > 0) {
      // 提取代码块
      const code = matches.map((match) => match[1]).join("\n\n")

      // 提取解释（代码块之外的文本）
      let explanation = response
      matches.forEach((match) => {
        explanation = explanation.replace(match[0], "")
      })

      return { code, explanation: explanation.trim() }
    }

    // 如果没有找到代码块，假设整个响应都是代码
    return { code: response, explanation: "" }
  }

  // 解析质量评估结果
  private parseQualityEvaluation(response: string): {
    metrics: Record<string, number>
    overallScore: number
    suggestions: string[]
  } {
    // 简单实现，实际应用中可能需要更复杂的解析逻辑
    const metrics: Record<string, number> = {}
    const suggestions: string[] = []
    let overallScore = 0

    // 尝试提取各指标分数
    this.codeQualityMetrics.forEach((metric) => {
      const regex = new RegExp(`${metric}[：:].*(\\d+)[^\\d]*10`, "i")
      const match = response.match(regex)
      if (match && match[1]) {
        metrics[metric] = Number.parseInt(match[1], 10)
      } else {
        metrics[metric] = 5 // 默认中等分数
      }
    })

    // 尝试提取总体评分
    const overallMatch = response.match(/总体[评分|得分][：:].*(\\d+)[^\\d]*10/i)
    if (overallMatch && overallMatch[1]) {
      overallScore = Number.parseInt(overallMatch[1], 10)
    } else {
      // 如果没有找到总体评分，计算平均值
      const sum = Object.values(metrics).reduce((a, b) => a + b, 0)
      overallScore = Math.round(sum / Object.values(metrics).length)
    }

    // 尝试提取建议
    const suggestionRegex = /建议[：:]([\s\S]*?)(?=\n\n|\n[0-9]|$)/gi
    const suggestionMatches = [...response.matchAll(suggestionRegex)]
    if (suggestionMatches.length > 0) {
      suggestionMatches.forEach((match) => {
        if (match[1]) {
          const suggestionText = match[1].trim()
          if (suggestionText) {
            suggestions.push(suggestionText)
          }
        }
      })
    }

    // 如果没有找到具体建议，提取整个响应中的关键建议
    if (suggestions.length === 0) {
      const lines = response.split("\n")
      lines.forEach((line) => {
        if (line.includes("建议") || line.includes("改进") || line.includes("优化")) {
          suggestions.push(line.trim())
        }
      })
    }

    return { metrics, overallScore, suggestions }
  }
}

// 类型定义
export type RefactoringType = "performance" | "readability" | "modularity" | "security"

export interface CodeGenerationOptions {
  modelId?: string
  temperature?: number
  maxTokens?: number
  includeExplanation?: boolean
  optimizeFor?: "performance" | "readability" | "security"
}

export interface CodeGenerationResult {
  code: string
  language: string
  framework: string | null
  explanation: string | null
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface CodeCompletionOptions {
  modelId?: string
  temperature?: number
  maxTokens?: number
  stopAtDelimiter?: boolean
}

export interface CodeCompletionResult {
  completion: string
  language: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface CodeRefactoringOptions {
  modelId?: string
  temperature?: number
  maxTokens?: number
  includeExplanation?: boolean
}

export interface CodeRefactoringResult {
  originalCode: string
  refactoredCode: string
  language: string
  refactoringType: RefactoringType
  explanation: string | null
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface TestGenerationOptions {
  modelId?: string
  temperature?: number
  maxTokens?: number
  testFramework?: string
  coverageTarget?: number
}

export interface TestGenerationResult {
  sourceCode: string
  testCode: string
  language: string
  testFramework: string
  coverageEstimate: number
  explanation: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface CodeQualityOptions {
  modelId?: string
  temperature?: number
  maxTokens?: number
  detailedReport?: boolean
}

export interface CodeQualityResult {
  codeSnippet: string
  language: string
  metrics: Record<string, number>
  overallScore: number
  suggestions: string[]
  detailedReport: string | null
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// 导出单例实例
export const autoProgrammingAssistant = AutoProgrammingAssistant.getInstance()
