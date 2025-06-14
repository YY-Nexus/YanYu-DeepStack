"use client"

import { EventEmitter } from "events"

// 增强版Ollama服务 - 优化性能和稳定性
export class EnhancedOllamaService extends EventEmitter {
  private static instance: EnhancedOllamaService
  private baseUrl: string
  private models = new Map<string, EnhancedOllamaModel>()
  private downloadQueue: DownloadTask[] = []
  private activeDownloads = new Map<string, DownloadTask>()
  private maxConcurrentDownloads = 2
  private healthCheckInterval: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private connectionStatus: "connected" | "disconnected" | "reconnecting" = "disconnected"

  private constructor() {
    super()
    this.baseUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434"
    this.initializeService()
  }

  public static getInstance(): EnhancedOllamaService {
    if (!EnhancedOllamaService.instance) {
      EnhancedOllamaService.instance = new EnhancedOllamaService()
    }
    return EnhancedOllamaService.instance
  }

  // 初始化服务
  private async initializeService(): Promise<void> {
    try {
      await this.checkConnection()
      await this.loadModels()
      this.startHealthCheck()
      this.processDownloadQueue()

      console.log("✅ Enhanced Ollama服务初始化成功")
      this.emit("service:ready")
    } catch (error) {
      console.error("❌ Enhanced Ollama服务初始化失败:", error)
      this.emit("service:error", error)
      this.scheduleReconnect()
    }
  }

  // 检查连接状态
  private async checkConnection(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        this.connectionStatus = "connected"
        this.reconnectAttempts = 0
        this.emit("connection:established")
        return true
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      this.connectionStatus = "disconnected"
      this.emit("connection:lost", error)
      throw error
    }
  }

  // 加载模型列表
  private async loadModels(): Promise<void> {
    try {
      const response = await this.makeRequest("/api/tags", "GET")
      const data = await response.json()

      if (data.models) {
        // 清空现有模型列表
        this.models.clear()

        // 添加已安装的模型
        for (const model of data.models) {
          const enhancedModel: EnhancedOllamaModel = {
            id: model.name,
            name: this.formatModelName(model.name),
            type: this.inferModelType(model.name),
            provider: "ollama",
            status: "ready",
            size: model.size || 0,
            digest: model.digest,
            modifiedAt: new Date(model.modified_at),
            parameters: this.inferModelParameters(model.name),
            quantization: this.inferModelQuantization(model.name),
            usageStats: {
              totalCalls: 0,
              totalTokens: 0,
              averageLatency: 0,
              lastUsed: null,
              errorCount: 0,
            },
            performance: {
              tokensPerSecond: 0,
              memoryUsage: 0,
              cpuUsage: 0,
            },
            createdAt: new Date(),
          }

          this.models.set(model.name, enhancedModel)
        }

        // 添加推荐但未安装的模型
        this.addRecommendedModels()

        console.log(`📊 已加载 ${this.models.size} 个模型`)
        this.emit("models:loaded", Array.from(this.models.values()))
      }
    } catch (error) {
      console.error("加载模型列表失败:", error)
      throw error
    }
  }

  // 添加推荐模型
  private addRecommendedModels(): void {
    const recommendedModels = [
      { id: "llama3:8b", name: "Llama 3 8B", type: "chat" as ModelType },
      { id: "codellama:7b", name: "CodeLlama 7B", type: "code" as ModelType },
      { id: "phi3:mini", name: "Phi-3 Mini", type: "chat" as ModelType },
      { id: "qwen2:7b", name: "Qwen2 7B", type: "chat" as ModelType },
      { id: "mistral:7b", name: "Mistral 7B", type: "chat" as ModelType },
      { id: "gemma:7b", name: "Gemma 7B", type: "chat" as ModelType },
    ]

    for (const recommended of recommendedModels) {
      if (!this.models.has(recommended.id)) {
        const enhancedModel: EnhancedOllamaModel = {
          id: recommended.id,
          name: recommended.name,
          type: recommended.type,
          provider: "ollama",
          status: "not_downloaded",
          size: 0,
          digest: "",
          modifiedAt: new Date(),
          parameters: this.inferModelParameters(recommended.id),
          quantization: this.inferModelQuantization(recommended.id),
          usageStats: {
            totalCalls: 0,
            totalTokens: 0,
            averageLatency: 0,
            lastUsed: null,
            errorCount: 0,
          },
          performance: {
            tokensPerSecond: 0,
            memoryUsage: 0,
            cpuUsage: 0,
          },
          createdAt: new Date(),
        }

        this.models.set(recommended.id, enhancedModel)
      }
    }
  }

  // 优化的HTTP请求方法
  private async makeRequest(
    endpoint: string,
    method: "GET" | "POST" | "DELETE" = "GET",
    body?: any,
    timeout = 30000,
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("请求超时")
      }

      throw error
    }
  }

  // 下载模型（支持队列和并发控制）
  public async downloadModel(modelId: string): Promise<DownloadTask> {
    // 检查是否已在下载队列中
    const existingTask =
      this.downloadQueue.find((task) => task.modelId === modelId) || this.activeDownloads.get(modelId)

    if (existingTask) {
      return existingTask
    }

    // 创建下载任务
    const task: DownloadTask = {
      id: `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      modelId,
      type: "download",
      status: "queued",
      progress: 0,
      speed: 0,
      eta: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // 添加到队列
    this.downloadQueue.push(task)
    this.emit("download:queued", task)

    // 更新模型状态
    const model = this.models.get(modelId)
    if (model) {
      model.status = "queued"
      this.models.set(modelId, model)
      this.emit("model:updated", model)
    }

    // 处理队列
    this.processDownloadQueue()

    return task
  }

  // 处理下载队列
  private async processDownloadQueue(): Promise<void> {
    // 检查是否有空闲的下载槽位
    while (this.activeDownloads.size < this.maxConcurrentDownloads && this.downloadQueue.length > 0) {
      const task = this.downloadQueue.shift()
      if (task) {
        this.activeDownloads.set(task.modelId, task)
        this.startModelDownload(task)
      }
    }
  }

  // 开始模型下载
  private async startModelDownload(task: DownloadTask): Promise<void> {
    try {
      // 更新任务状态
      task.status = "downloading"
      task.startedAt = new Date()
      this.emit("download:started", task)

      // 更新模型状态
      const model = this.models.get(task.modelId)
      if (model) {
        model.status = "downloading"
        this.models.set(task.modelId, model)
        this.emit("model:updated", model)
      }

      console.log(`🔄 开始下载模型: ${task.modelId}`)

      // 调用Ollama API下载模型
      const response = await this.makeRequest(
        "/api/pull",
        "POST",
        { name: task.modelId },
        300000, // 5分钟超时
      )

      // 处理流式响应
      await this.handleDownloadStream(response, task)

      // 下载完成
      task.status = "completed"
      task.progress = 100
      task.completedAt = new Date()
      this.emit("download:completed", task)

      // 更新模型状态
      if (model) {
        model.status = "ready"
        this.models.set(task.modelId, model)
        this.emit("model:updated", model)
      }

      console.log(`✅ 模型下载完成: ${task.modelId}`)

      // 重新加载模型信息
      await this.loadModels()
    } catch (error) {
      console.error(`❌ 模型下载失败: ${task.modelId}`, error)

      // 更新任务状态
      task.status = "failed"
      task.error = error instanceof Error ? error.message : "下载失败"
      task.updatedAt = new Date()
      this.emit("download:failed", task)

      // 更新模型状态
      const model = this.models.get(task.modelId)
      if (model) {
        model.status = "download_failed"
        this.models.set(task.modelId, model)
        this.emit("model:updated", model)
      }
    } finally {
      // 从活动下载中移除
      this.activeDownloads.delete(task.modelId)

      // 继续处理队列
      this.processDownloadQueue()
    }
  }

  // 处理下载流
  private async handleDownloadStream(response: Response, task: DownloadTask): Promise<void> {
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("无法获取响应流")
    }

    const decoder = new TextDecoder()
    let totalBytes = 0
    let downloadedBytes = 0
    let lastUpdateTime = Date.now()
    let lastDownloadedBytes = 0

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)

            if (data.total && data.completed !== undefined) {
              totalBytes = data.total
              downloadedBytes = data.completed

              // 计算进度
              const progress = Math.round((downloadedBytes / totalBytes) * 100)

              // 计算下载速度
              const currentTime = Date.now()
              const timeDiff = (currentTime - lastUpdateTime) / 1000 // 秒
              const bytesDiff = downloadedBytes - lastDownloadedBytes

              if (timeDiff > 0) {
                const speed = bytesDiff / timeDiff // 字节/秒
                const remainingBytes = totalBytes - downloadedBytes
                const eta = remainingBytes > 0 ? Math.round(remainingBytes / speed) : 0

                // 更新任务信息
                task.progress = progress
                task.speed = speed
                task.eta = eta
                task.updatedAt = new Date()

                // 发送进度更新事件
                this.emit("download:progress", {
                  taskId: task.id,
                  modelId: task.modelId,
                  progress,
                  speed,
                  eta,
                  downloadedBytes,
                  totalBytes,
                })

                // 更新时间和字节数
                lastUpdateTime = currentTime
                lastDownloadedBytes = downloadedBytes
              }
            }

            if (data.status) {
              console.log(`📥 ${task.modelId}: ${data.status}`)
            }
          } catch (parseError) {
            // 忽略JSON解析错误
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  // 删除模型
  public async deleteModel(modelId: string): Promise<boolean> {
    try {
      const model = this.models.get(modelId)
      if (!model) {
        throw new Error(`模型不存在: ${modelId}`)
      }

      if (model.status === "downloading") {
        throw new Error(`模型正在下载中，无法删除: ${modelId}`)
      }

      console.log(`🗑️ 开始删除模型: ${modelId}`)

      await this.makeRequest("/api/delete", "DELETE", { name: modelId })

      // 更新模型状态
      model.status = "not_downloaded"
      model.size = 0
      this.models.set(modelId, model)
      this.emit("model:updated", model)

      console.log(`✅ 模型删除成功: ${modelId}`)
      return true
    } catch (error) {
      console.error(`❌ 模型删除失败: ${modelId}`, error)
      return false
    }
  }

  // 生成文本（带性能监控）
  public async generateText(modelId: string, prompt: string, options: GenerateOptions = {}): Promise<GenerateResponse> {
    const startTime = Date.now()
    const model = this.models.get(modelId)

    if (!model) {
      throw new Error(`模型不存在: ${modelId}`)
    }

    if (model.status !== "ready") {
      throw new Error(`模型未就绪: ${modelId}`)
    }

    try {
      // 标记模型为使用中
      model.status = "busy"
      this.models.set(modelId, model)
      this.emit("model:updated", model)

      const response = await this.makeRequest("/api/generate", "POST", {
        model: modelId,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9,
          top_k: options.topK || 40,
          num_predict: options.maxTokens || 2048,
          ...options.rawOptions,
        },
      })

      const result = await response.json()
      const endTime = Date.now()
      const latency = endTime - startTime

      // 更新使用统计
      model.usageStats.totalCalls++
      model.usageStats.totalTokens += result.eval_count || 0
      model.usageStats.averageLatency =
        (model.usageStats.averageLatency * (model.usageStats.totalCalls - 1) + latency) / model.usageStats.totalCalls
      model.usageStats.lastUsed = new Date()

      // 更新性能指标
      if (result.eval_count && result.eval_duration) {
        model.performance.tokensPerSecond = (result.eval_count / result.eval_duration) * 1e9
      }

      // 恢复模型状态
      model.status = "ready"
      this.models.set(modelId, model)
      this.emit("model:updated", model)

      return {
        success: true,
        text: result.response,
        model: modelId,
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
        metadata: result,
      }
    } catch (error) {
      // 更新错误统计
      if (model) {
        model.usageStats.errorCount++
        model.status = "ready"
        this.models.set(modelId, model)
        this.emit("model:updated", model)
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "生成失败",
        model: modelId,
        latency: Date.now() - startTime,
      }
    }
  }

  // 获取模型推荐
  public getRecommendedModels(
    type?: ModelType,
    maxCount = 5,
    criteria: "performance" | "usage" | "size" = "usage",
  ): EnhancedOllamaModel[] {
    let models = Array.from(this.models.values()).filter((model) => model.status === "ready")

    if (type) {
      models = models.filter((model) => model.type === type)
    }

    // 根据推荐标准排序
    switch (criteria) {
      case "performance":
        models.sort((a, b) => {
          const aScore = a.performance.tokensPerSecond - a.usageStats.averageLatency / 1000
          const bScore = b.performance.tokensPerSecond - b.usageStats.averageLatency / 1000
          return bScore - aScore
        })
        break

      case "usage":
        models.sort((a, b) => {
          const aScore = a.usageStats.totalCalls * 0.7 + (a.usageStats.lastUsed ? 1 : 0) * 0.3
          const bScore = b.usageStats.totalCalls * 0.7 + (b.usageStats.lastUsed ? 1 : 0) * 0.3
          return bScore - aScore
        })
        break

      case "size":
        models.sort((a, b) => a.size - b.size)
        break
    }

    return models.slice(0, maxCount)
  }

  // 获取模型统计
  public getModelStatistics(): ModelStatistics {
    const models = Array.from(this.models.values())

    return {
      total: models.length,
      ready: models.filter((m) => m.status === "ready").length,
      downloading: models.filter((m) => m.status === "downloading").length,
      queued: models.filter((m) => m.status === "queued").length,
      notDownloaded: models.filter((m) => m.status === "not_downloaded").length,
      failed: models.filter((m) => m.status === "download_failed").length,
      byType: {
        chat: models.filter((m) => m.type === "chat").length,
        code: models.filter((m) => m.type === "code").length,
        multimodal: models.filter((m) => m.type === "multimodal").length,
      },
      totalSize: models.reduce((sum, m) => sum + m.size, 0),
      totalCalls: models.reduce((sum, m) => sum + m.usageStats.totalCalls, 0),
      totalTokens: models.reduce((sum, m) => sum + m.usageStats.totalTokens, 0),
      averageLatency:
        models.length > 0 ? models.reduce((sum, m) => sum + m.usageStats.averageLatency, 0) / models.length : 0,
    }
  }

  // 健康检查
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkConnection()
      } catch (error) {
        console.warn("健康检查失败:", error)
        this.scheduleReconnect()
      }
    }, 30000) // 每30秒检查一次
  }

  // 重连调度
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("达到最大重连次数，停止重连")
      this.emit("connection:failed")
      return
    }

    this.connectionStatus = "reconnecting"
    this.reconnectAttempts++

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) // 指数退避，最大30秒

    console.log(`🔄 ${delay / 1000}秒后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(async () => {
      try {
        await this.checkConnection()
        await this.loadModels()
        console.log("✅ 重连成功")
      } catch (error) {
        console.error("重连失败:", error)
        this.scheduleReconnect()
      }
    }, delay)
  }

  // 工具方法
  private formatModelName(modelId: string): string {
    const parts = modelId.split(":")
    const baseName = parts[0]
    const version = parts[1] || ""

    const nameMap: Record<string, string> = {
      codellama: "CodeLlama",
      llama3: "Llama 3",
      llama2: "Llama 2",
      phi3: "Phi-3",
      mistral: "Mistral",
      qwen: "Qwen",
      qwen2: "Qwen2",
      gemma: "Gemma",
    }

    const formattedName = nameMap[baseName] || baseName.charAt(0).toUpperCase() + baseName.slice(1)
    return version ? `${formattedName} ${version}` : formattedName
  }

  private inferModelType(modelId: string): ModelType {
    const id = modelId.toLowerCase()
    if (id.includes("code")) return "code"
    if (id.includes("vision") || id.includes("multimodal")) return "multimodal"
    return "chat"
  }

  private inferModelParameters(modelId: string): string {
    const id = modelId.toLowerCase()
    if (id.includes("70b")) return "70B"
    if (id.includes("34b")) return "34B"
    if (id.includes("13b")) return "13B"
    if (id.includes("8b")) return "8B"
    if (id.includes("7b")) return "7B"
    if (id.includes("3b")) return "3B"
    if (id.includes("1b")) return "1B"
    return "未知"
  }

  private inferModelQuantization(modelId: string): string {
    const id = modelId.toLowerCase()
    if (id.includes("q4_0")) return "Q4_0"
    if (id.includes("q4_1")) return "Q4_1"
    if (id.includes("q5_0")) return "Q5_0"
    if (id.includes("q5_1")) return "Q5_1"
    if (id.includes("q8_0")) return "Q8_0"
    return "无量化"
  }

  // 获取所有模型
  public getAllModels(): EnhancedOllamaModel[] {
    return Array.from(this.models.values())
  }

  // 获取连接状态
  public getConnectionStatus(): "connected" | "disconnected" | "reconnecting" {
    return this.connectionStatus
  }

  // 获取活动下载任务
  public getActiveDownloads(): DownloadTask[] {
    return Array.from(this.activeDownloads.values())
  }

  // 获取下载队列
  public getDownloadQueue(): DownloadTask[] {
    return [...this.downloadQueue]
  }

  // 清理资源
  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
    this.removeAllListeners()
  }
}

// 类型定义
export type ModelType = "chat" | "code" | "multimodal"
export type ModelStatus = "ready" | "busy" | "downloading" | "queued" | "not_downloaded" | "download_failed"
export type TaskStatus = "queued" | "downloading" | "completed" | "failed"

export interface EnhancedOllamaModel {
  id: string
  name: string
  type: ModelType
  provider: "ollama"
  status: ModelStatus
  size: number
  digest: string
  modifiedAt: Date
  parameters: string
  quantization: string
  usageStats: {
    totalCalls: number
    totalTokens: number
    averageLatency: number
    lastUsed: Date | null
    errorCount: number
  }
  performance: {
    tokensPerSecond: number
    memoryUsage: number
    cpuUsage: number
  }
  createdAt: Date
}

export interface DownloadTask {
  id: string
  modelId: string
  type: "download"
  status: TaskStatus
  progress: number
  speed: number
  eta: number | null
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
}

export interface GenerateOptions {
  temperature?: number
  topP?: number
  topK?: number
  maxTokens?: number
  rawOptions?: Record<string, any>
}

export interface GenerateResponse {
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

export interface ModelStatistics {
  total: number
  ready: number
  downloading: number
  queued: number
  notDownloaded: number
  failed: number
  byType: Record<ModelType, number>
  totalSize: number
  totalCalls: number
  totalTokens: number
  averageLatency: number
}

// 导出增强版Ollama服务实例
export const enhancedOllamaService = EnhancedOllamaService.getInstance()
