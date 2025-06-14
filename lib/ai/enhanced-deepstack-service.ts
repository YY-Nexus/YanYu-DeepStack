"use client"

import { deepStackService } from "./deepstack-service"
import { localModelOptimizer } from "./local-model-optimizer"

/**
 * 增强版DeepStack服务
 * 集成本地模型优化器，智能选择最佳模型
 */
export class EnhancedDeepStackService {
  private static instance: EnhancedDeepStackService

  public static getInstance(): EnhancedDeepStackService {
    if (!EnhancedDeepStackService.instance) {
      EnhancedDeepStackService.instance = new EnhancedDeepStackService()
    }
    return EnhancedDeepStackService.instance
  }

  /**
   * 智能选择模型
   */
  private selectOptimalModel(
    language?: string,
    taskType: "generate" | "optimize" | "explain" | "fix" = "generate",
    complexity: "simple" | "medium" | "complex" = "medium",
  ): string {
    // 根据语言和任务类型选择模型
    if (language === "中文" || language === "Chinese") {
      if (complexity === "complex") {
        return "qwen2:72b" // 复杂中文任务使用最强模型
      } else {
        return "qwen2:latest" // 一般中文任务使用标准模型
      }
    }

    // 代码相关任务
    if (taskType === "generate" || taskType === "optimize") {
      if (complexity === "complex") {
        return "qwen2:72b" // 复杂代码任务
      } else {
        return "codellama:latest" // 一般代码任务
      }
    }

    // 快速响应需求
    if (complexity === "simple") {
      return "phi3:latest"
    }

    // 默认使用平衡模型
    return "qwen2:latest"
  }

  /**
   * 增强的代码生成
   */
  public async generateCode(
    prompt: string,
    options: {
      language?: string
      framework?: string
      context?: string
      complexity?: "simple" | "medium" | "complex"
      preferredModel?: string
    } = {},
  ) {
    const { complexity = "medium", preferredModel } = options

    // 选择最优模型
    const selectedModel = preferredModel || this.selectOptimalModel(options.language, "generate", complexity)

    // 增强提示词
    let enhancedPrompt = prompt

    // 如果是中文编程，添加中文优化提示
    if (options.language && ["Python", "JavaScript", "Java", "C++"].includes(options.language)) {
      enhancedPrompt +=
        "\n\n请确保：\n1. 添加详细的中文注释\n2. 变量名使用有意义的英文\n3. 提供使用示例\n4. 解释关键算法思路"
    }

    // 调用原始服务，但使用选定的模型
    const originalGenerate = deepStackService.generateCode.bind(deepStackService)

    // 临时替换模型选择逻辑
    const result = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        prompt: enhancedPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          top_k: 40,
        },
      }),
    })

    if (result.ok) {
      const data = await result.json()
      return {
        success: true,
        code: this.extractCode(data.response),
        explanation: this.extractExplanation(data.response),
        model: selectedModel,
        language: options.language,
        metrics: {
          latency: data.total_duration ? Math.round(data.total_duration / 1e6) : 0,
          tokensGenerated: data.eval_count || 0,
          tokensPerSecond:
            data.eval_count && data.eval_duration ? Math.round((data.eval_count / data.eval_duration) * 1e9) : 0,
        },
      }
    } else {
      return {
        success: false,
        error: "模型调用失败",
      }
    }
  }

  /**
   * 获取模型推荐
   */
  public getModelRecommendations(
    taskType: "chinese_coding" | "english_coding" | "complex_reasoning" | "fast_response",
  ) {
    return localModelOptimizer.recommendModelForTask(taskType)
  }

  /**
   * 获取最佳中文模型
   */
  public getBestChineseModel() {
    return localModelOptimizer.getBestChineseModel()
  }

  /**
   * 提取代码块
   */
  private extractCode(response: string): string {
    const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/g
    const matches = [...response.matchAll(codeBlockRegex)]
    return matches.map((match) => match[1].trim()).join("\n\n")
  }

  /**
   * 提取解释文本
   */
  private extractExplanation(response: string): string {
    let explanation = response
    const codeBlockRegex = /```(?:\w+)?\s*[\s\S]*?```/g
    explanation = explanation.replace(codeBlockRegex, "").trim()
    return explanation
  }
}

export const enhancedDeepStackService = EnhancedDeepStackService.getInstance()
