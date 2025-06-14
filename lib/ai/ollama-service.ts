"use client"

// Ollama本地大模型服务集成
export class OllamaService {
  private static instance: OllamaService
  private baseUrl: string
  private models: Map<string, OllamaModel> = new Map()
  private healthCheckInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434"
    this.initializeModels()
    this.startHealthCheck()
  }

  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService()
    }
    return OllamaService.instance
  }

  // 初始化模型列表
  private async initializeModels(): Promise<void> {
    try {
      const models = await this.listModels()
      models.forEach((model) => {
        this.models.set(model.name, {
          ...model,
          status: "available",
          lastUsed: null,
          usageCount: 0,
          averageLatency: 0,
        })
      })
      console.log(`已发现 ${models.length} 个本地模型`)
    } catch (error) {
      console.error("初始化Ollama模型失败:", error)
    }
  }

  // 获取模型列表
  public async listModels(): Promise<OllamaModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      return data.models || []
    } catch (error) {
      console.error("获取模型列表失败:", error)
      return []
    }
  }

  // 生成文本
  public async generateText(
    modelName: string,
    prompt: string,
    options: OllamaGenerateOptions = {},
  ): Promise<OllamaResponse> {
    const startTime = Date.now()

    try {
      const model = this.models.get(modelName)
      if (!model) {
        throw new Error(`模型 ${modelName} 不存在`)
      }

      if (model.status !== "available") {
        throw new Error(`模型 ${modelName} 当前不可用`)
      }

      // 更新模型状态
      model.status = "busy"
      this.models.set(modelName, model)

      const requestBody = {
        model: modelName,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9,
          top_k: options.topK || 40,
          num_predict: options.maxTokens || 2048,
          ...options.rawOptions,
        },
      }

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`生成失败: ${response.statusText}`)
      }

      const result = await response.json()
      const endTime = Date.now()
      const latency = endTime - startTime

      // 更新模型统计
      model.status = "available"
      model.lastUsed = endTime
      model.usageCount++
      model.averageLatency = (model.averageLatency * (model.usageCount - 1) + latency) / model.usageCount
      this.models.set(modelName, model)

      return {
        success: true,
        text: result.response,
        model: modelName,
        tokens: {
          prompt: result.prompt_eval_count || 0,
          completion: result.eval_count || 0,
          total: (result.prompt_eval_count || 0) + (result.eval_count || 0),
        },
        timing: {
          promptEvalTime: result.prompt_eval_duration || 0,
          evalTime: result.eval_duration || 0,
          totalTime: result.total_duration || 0,
        },
        latency,
        metadata: {
          model: result.model,
          created_at: result.created_at,
          done: result.done,
        },
      }
    } catch (error) {
      // 恢复模型状态
      const model = this.models.get(modelName)
      if (model) {
        model.status = "available"
        this.models.set(modelName, model)
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
        model: modelName,
        latency: Date.now() - startTime,
      }
    }
  }

  // 流式生成文本
  public async generateTextStream(
    modelName: string,
    prompt: string,
    options: OllamaGenerateOptions = {},
    onChunk?: (chunk: string) => void,
  ): Promise<OllamaResponse> {
    const startTime = Date.now()

    try {
      const model = this.models.get(modelName)
      if (!model) {
        throw new Error(`模型 ${modelName} 不存在`)
      }

      model.status = "busy"
      this.models.set(modelName, model)

      const requestBody = {
        model: modelName,
        prompt,
        stream: true,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9,
          top_k: options.topK || 40,
          num_predict: options.maxTokens || 2048,
          ...options.rawOptions,
        },
      }

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`流式生成失败: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("无法获取响应流")
      }

      let fullText = ""
      let totalTokens = 0
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n").filter((line) => line.trim())

          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              if (data.response) {
                fullText += data.response
                onChunk?.(data.response)
              }
              if (data.done) {
                totalTokens = (data.prompt_eval_count || 0) + (data.eval_count || 0)
              }
            } catch (parseError) {
              // 忽略JSON解析错误
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      const endTime = Date.now()
      const latency = endTime - startTime

      // 更新模型统计
      model.status = "available"
      model.lastUsed = endTime
      model.usageCount++
      model.averageLatency = (model.averageLatency * (model.usageCount - 1) + latency) / model.usageCount
      this.models.set(modelName, model)

      return {
        success: true,
        text: fullText,
        model: modelName,
        tokens: {
          prompt: 0,
          completion: totalTokens,
          total: totalTokens,
        },
        latency,
      }
    } catch (error) {
      const model = this.models.get(modelName)
      if (model) {
        model.status = "available"
        this.models.set(modelName, model)
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
        model: modelName,
        latency: Date.now() - startTime,
      }
    }
  }

  // 聊天对话
  public async chat(
    modelName: string,
    messages: ChatMessage[],
    options: OllamaGenerateOptions = {},
  ): Promise<OllamaResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.topP || 0.9,
            top_k: options.topK || 40,
            num_predict: options.maxTokens || 2048,
            ...options.rawOptions,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`聊天失败: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        text: result.message?.content || "",
        model: modelName,
        tokens: {
          prompt: result.prompt_eval_count || 0,
          completion: result.eval_count || 0,
          total: (result.prompt_eval_count || 0) + (result.eval_count || 0),
        },
        timing: {
          promptEvalTime: result.prompt_eval_duration || 0,
          evalTime: result.eval_duration || 0,
          totalTime: result.total_duration || 0,
        },
        metadata: result,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
        model: modelName,
      }
    }
  }

  // 获取模型信息
  public async getModelInfo(modelName: string): Promise<OllamaModelDetails | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/show`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: modelName }),
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error(`获取模型 ${modelName} 信息失败:`, error)
      return null
    }
  }

  // 健康检查
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/tags`, {
          method: "GET",
          signal: AbortSignal.timeout(5000), // 5秒超时
        })

        if (response.ok) {
          // 更新所有模型状态为可用（如果之前是离线状态）
          this.models.forEach((model, name) => {
            if (model.status === "offline") {
              model.status = "available"
              this.models.set(name, model)
            }
          })
        }
      } catch (error) {
        // 标记所有模型为离线
        this.models.forEach((model, name) => {
          if (model.status !== "offline") {
            model.status = "offline"
            this.models.set(name, model)
          }
        })
        console.warn("Ollama服务健康检查失败:", error)
      }
    }, 30000) // 每30秒检查一次
  }

  // 获取推荐模型
  public getRecommendedModel(task: "code" | "chat" | "analysis" | "translation"): string | null {
    const availableModels = Array.from(this.models.entries()).filter(([_, model]) => model.status === "available")

    if (availableModels.length === 0) {
      return null
    }

    // 根据任务类型推荐模型
    switch (task) {
      case "code":
        // 优先选择代码专用模型
        const codeModel = availableModels.find(([name]) => name.includes("codellama"))
        if (codeModel) return codeModel[0]
        break

      case "chat":
        // 优先选择对话模型
        const chatModel = availableModels.find(([name]) => name.includes("llama3"))
        if (chatModel) return chatModel[0]
        break

      case "analysis":
        // 优先选择大型模型
        const largeModel = availableModels.find(([name]) => name.includes("70b") || name.includes("72b"))
        if (largeModel) return largeModel[0]
        break

      case "translation":
        // 优先选择多语言模型
        const multilingualModel = availableModels.find(([name]) => name.includes("qwen2"))
        if (multilingualModel) return multilingualModel[0]
        break
    }

    // 如果没有找到专用模型，返回使用最少的模型
    const leastUsedModel = availableModels.reduce((min, current) =>
      current[1].usageCount < min[1].usageCount ? current : min,
    )

    return leastUsedModel[0]
  }

  // 获取模型统计
  public getModelStats(): Map<string, OllamaModel> {
    return new Map(this.models)
  }

  // 清理资源
  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }
}

// 类型定义
export interface OllamaModelInfo {
  name: string
  modified_at: string
  size: number
  digest: string
  details?: {
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
}

export interface OllamaModel extends OllamaModelInfo {
  status: "available" | "busy" | "offline"
  lastUsed: number | null
  usageCount: number
  averageLatency: number
}

export interface OllamaGenerateOptions {
  temperature?: number
  topP?: number
  topK?: number
  maxTokens?: number
  rawOptions?: Record<string, any>
}

export interface OllamaResponse {
  success: boolean
  text?: string
  error?: string
  model: string
  tokens?: {
    prompt: number
    completion: number
    total: number
  }
  timing?: {
    promptEvalTime: number
    evalTime: number
    totalTime: number
  }
  latency?: number
  metadata?: any
}

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface OllamaModelDetails {
  modelfile: string
  parameters: string
  template: string
  details: {
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
}

// 导出Ollama服务实例
export const ollamaService = OllamaService.getInstance()
