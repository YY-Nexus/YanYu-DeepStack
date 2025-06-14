"use client"

// AI模型管理器 - 管理多个AI模型和智能推荐
export class AIModelManager {
  private static instance: AIModelManager
  private models = new Map<string, AIModel>()
  private providers = new Map<string, AIProvider>()
  private recommendations: RecommendationEngine
  private trainingJobs = new Map<string, TrainingJob>()
  private config: AIConfig

  private constructor() {
    this.config = {
      defaultModel: "gpt-4",
      enableCustomModels: true,
      enableTraining: true,
      maxConcurrentJobs: 5,
      cacheEnabled: true,
      cacheTTL: 30 * 60 * 1000, // 30分钟
    }

    this.recommendations = new RecommendationEngine()
    this.initializeProviders()
    this.initializeModels()
  }

  public static getInstance(): AIModelManager {
    if (!AIModelManager.instance) {
      AIModelManager.instance = new AIModelManager()
    }
    return AIModelManager.instance
  }

  // 初始化AI提供商 - 移除敏感信息
  private initializeProviders(): void {
    // OpenAI - 仅配置结构，不包含密钥
    this.providers.set("openai", {
      id: "openai",
      name: "OpenAI",
      type: "api",
      config: {
        baseUrl: "https://api.openai.com/v1",
        // API密钥通过服务端API获取，不在客户端存储
      },
      models: ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo", "text-davinci-003"],
      capabilities: ["text-generation", "code-generation", "chat", "completion"],
      pricing: {
        inputTokens: 0.03,
        outputTokens: 0.06,
        currency: "USD",
        per1000Tokens: true,
      },
      limits: {
        maxTokens: 4096,
        requestsPerMinute: 60,
        tokensPerMinute: 90000,
      },
      enabled: false, // 默认禁用，需要服务端验证
    })

    // Anthropic Claude - 仅配置结构
    this.providers.set("anthropic", {
      id: "anthropic",
      name: "Anthropic",
      type: "api",
      config: {
        baseUrl: "https://api.anthropic.com/v1",
        // API密钥通过服务端API获取
      },
      models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
      capabilities: ["text-generation", "code-generation", "analysis"],
      pricing: {
        inputTokens: 0.015,
        outputTokens: 0.075,
        currency: "USD",
        per1000Tokens: true,
      },
      limits: {
        maxTokens: 4096,
        requestsPerMinute: 50,
        tokensPerMinute: 40000,
      },
      enabled: false, // 默认禁用
    })

    // Google Gemini - 仅配置结构
    this.providers.set("google", {
      id: "google",
      name: "Google",
      type: "api",
      config: {
        baseUrl: "https://generativelanguage.googleapis.com/v1",
        // API密钥通过服务端API获取
      },
      models: ["gemini-pro", "gemini-pro-vision"],
      capabilities: ["text-generation", "vision", "multimodal"],
      pricing: {
        inputTokens: 0.0005,
        outputTokens: 0.0015,
        currency: "USD",
        per1000Tokens: true,
      },
      limits: {
        maxTokens: 2048,
        requestsPerMinute: 60,
        tokensPerMinute: 32000,
      },
      enabled: false, // 默认禁用
    })

    // 本地模型 - 安全的本地配置
    this.providers.set("local", {
      id: "local",
      name: "本地模型",
      type: "local",
      config: {
        modelPath: "/models",
        device: "auto", // auto, cpu, gpu
      },
      models: ["llama2-7b", "codellama-7b", "mistral-7b"],
      capabilities: ["text-generation", "code-generation"],
      pricing: {
        inputTokens: 0,
        outputTokens: 0,
        currency: "USD",
        per1000Tokens: true,
      },
      limits: {
        maxTokens: 2048,
        requestsPerMinute: 10,
        tokensPerMinute: 5000,
      },
      enabled: true, // 本地模型默认启用
    })
  }

  // 初始化AI模型
  private initializeModels(): void {
    // GPT-4 - 不包含API密钥
    this.models.set("gpt-4", {
      id: "gpt-4",
      name: "GPT-4",
      provider: "openai",
      type: "language-model",
      capabilities: ["text-generation", "code-generation", "chat", "analysis"],
      parameters: {
        maxTokens: 4096,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
      },
      specializations: ["general", "coding", "analysis", "creative"],
      performance: {
        accuracy: 0.95,
        speed: 0.8,
        cost: 0.7,
        reliability: 0.98,
      },
      status: "inactive", // 需要服务端验证后启用
      version: "gpt-4-0613",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Claude-3 - 不包含API密钥
    this.models.set("claude-3-opus", {
      id: "claude-3-opus",
      name: "Claude-3 Opus",
      provider: "anthropic",
      type: "language-model",
      capabilities: ["text-generation", "code-generation", "analysis"],
      parameters: {
        maxTokens: 4096,
        temperature: 0.7,
      },
      specializations: ["analysis", "reasoning", "coding"],
      performance: {
        accuracy: 0.96,
        speed: 0.75,
        cost: 0.6,
        reliability: 0.97,
      },
      status: "inactive", // 需要服务端验证后启用
      version: "claude-3-opus-20240229",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // 代码专用模型 - 本地安全
    this.models.set("codellama-7b", {
      id: "codellama-7b",
      name: "CodeLlama 7B",
      provider: "local",
      type: "code-model",
      capabilities: ["code-generation", "code-completion", "code-analysis"],
      parameters: {
        maxTokens: 2048,
        temperature: 0.1,
        topP: 0.95,
      },
      specializations: ["coding", "debugging", "refactoring"],
      performance: {
        accuracy: 0.88,
        speed: 0.9,
        cost: 1.0, // 本地模型成本为0
        reliability: 0.92,
      },
      status: "active", // 本地模型可直接启用
      version: "7b-instruct",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }

  // 通过服务端API验证和启用提供商
  public async enableProvider(providerId: string): Promise<boolean> {
    try {
      const response = await fetch("/api/ai/verify-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      })

      const result = await response.json()

      if (result.success) {
        const provider = this.providers.get(providerId)
        if (provider) {
          provider.enabled = true
          // 启用该提供商的所有模型
          for (const model of this.models.values()) {
            if (model.provider === providerId) {
              model.status = "active"
            }
          }
        }
        return true
      }
      return false
    } catch (error) {
      console.error(`启用提供商 ${providerId} 失败:`, error)
      return false
    }
  }

  // 获取推荐模型
  public getRecommendedModel(task: AITask): ModelRecommendation {
    const context = {
      taskType: task.type,
      language: task.language,
      complexity: task.complexity || "medium",
      priority: task.priority || "normal",
      budget: task.budget,
      userPreferences: task.userPreferences,
    }

    return this.recommendations.recommend(context, Array.from(this.models.values()))
  }

  // 执行AI任务 - 通过服务端API
  public async executeTask(task: AITask): Promise<AITaskResult> {
    try {
      const response = await fetch("/api/ai/execute-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      })

      const result = await response.json()
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: 0,
        cost: 0,
      }
    }
  }

  // 批量执行任务
  public async executeBatchTasks(tasks: AITask[]): Promise<AITaskResult[]> {
    const results: AITaskResult[] = []
    const concurrentLimit = 3

    for (let i = 0; i < tasks.length; i += concurrentLimit) {
      const batch = tasks.slice(i, i + concurrentLimit)
      const batchResults = await Promise.allSettled(batch.map((task) => this.executeTask(task)))

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          results.push(result.value)
        } else {
          results.push({
            success: false,
            error: result.reason?.message || "Batch execution failed",
            duration: 0,
            cost: 0,
          })
        }
      }
    }

    return results
  }

  // 创建自定义模型
  public async createCustomModel(config: CustomModelConfig): Promise<AIModel> {
    if (!this.config.enableCustomModels) {
      throw new Error("自定义模型功能未启用")
    }

    const modelId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const customModel: AIModel = {
      id: modelId,
      name: config.name,
      provider: "custom",
      type: config.type,
      capabilities: config.capabilities,
      parameters: config.parameters,
      specializations: config.specializations,
      performance: {
        accuracy: 0.5, // 初始值，需要通过训练提升
        speed: 0.5,
        cost: 0.8,
        reliability: 0.5,
      },
      status: "training",
      version: "1.0.0",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      customConfig: config,
    }

    this.models.set(modelId, customModel)

    // 启动训练任务
    if (config.trainingData) {
      await this.startTraining(modelId, config.trainingData)
    }

    return customModel
  }

  // 开始模型训练
  public async startTraining(modelId: string, trainingData: TrainingData): Promise<string> {
    if (!this.config.enableTraining) {
      throw new Error("模型训练功能未启用")
    }

    const model = this.models.get(modelId)
    if (!model) {
      throw new Error(`模型 ${modelId} 不存在`)
    }

    if (this.trainingJobs.size >= this.config.maxConcurrentJobs) {
      throw new Error("训练任务数量已达上限")
    }

    const jobId = `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const trainingJob: TrainingJob = {
      id: jobId,
      modelId,
      status: "running",
      progress: 0,
      startTime: Date.now(),
      endTime: null,
      config: {
        epochs: trainingData.epochs || 10,
        batchSize: trainingData.batchSize || 32,
        learningRate: trainingData.learningRate || 0.001,
        validationSplit: trainingData.validationSplit || 0.2,
      },
      metrics: {
        loss: [],
        accuracy: [],
        validationLoss: [],
        validationAccuracy: [],
      },
      logs: [],
    }

    this.trainingJobs.set(jobId, trainingJob)

    // 模拟训练过程
    this.simulateTraining(jobId, trainingData)

    return jobId
  }

  // 获取训练状态
  public getTrainingStatus(jobId: string): TrainingJob | null {
    return this.trainingJobs.get(jobId) || null
  }

  // 停止训练
  public stopTraining(jobId: string): void {
    const job = this.trainingJobs.get(jobId)
    if (job && job.status === "running") {
      job.status = "stopped"
      job.endTime = Date.now()
    }
  }

  // 获取模型性能分析
  public getModelAnalytics(modelId: string, timeRange?: { start: number; end: number }): ModelAnalytics {
    // 这里应该从数据库或分析服务获取真实数据
    return {
      modelId,
      usage: {
        totalRequests: Math.floor(Math.random() * 10000),
        successRate: 0.95 + Math.random() * 0.05,
        averageLatency: 500 + Math.random() * 1000,
        totalTokens: Math.floor(Math.random() * 1000000),
      },
      performance: {
        accuracy: 0.85 + Math.random() * 0.15,
        throughput: 100 + Math.random() * 200,
        errorRate: Math.random() * 0.05,
        costEfficiency: 0.7 + Math.random() * 0.3,
      },
      trends: {
        usageGrowth: (Math.random() - 0.5) * 0.2,
        performanceChange: (Math.random() - 0.5) * 0.1,
        costChange: (Math.random() - 0.5) * 0.15,
      },
      topUseCases: [
        { type: "code-generation", percentage: 40 },
        { type: "text-generation", percentage: 30 },
        { type: "analysis", percentage: 20 },
        { type: "chat", percentage: 10 },
      ],
    }
  }

  // 私有方法 - 模拟训练过程
  private simulateTraining(jobId: string, trainingData: TrainingData): void {
    const job = this.trainingJobs.get(jobId)!
    const epochs = job.config.epochs
    let currentEpoch = 0

    const updateProgress = () => {
      if (job.status !== "running") return

      currentEpoch++
      job.progress = (currentEpoch / epochs) * 100

      // 模拟训练指标
      const loss = Math.max(0.1, 2.0 - (currentEpoch / epochs) * 1.5 + (Math.random() - 0.5) * 0.2)
      const accuracy = Math.min(0.95, 0.3 + (currentEpoch / epochs) * 0.6 + (Math.random() - 0.5) * 0.1)

      job.metrics.loss.push(loss)
      job.metrics.accuracy.push(accuracy)
      job.logs.push(`Epoch ${currentEpoch}/${epochs} - Loss: ${loss.toFixed(4)}, Accuracy: ${accuracy.toFixed(4)}`)

      if (currentEpoch >= epochs) {
        job.status = "completed"
        job.endTime = Date.now()

        // 更新模型性能
        const model = this.models.get(job.modelId)!
        model.performance.accuracy = accuracy
        model.status = "active"

        console.log(`训练完成: ${job.modelId}`)
      } else {
        setTimeout(updateProgress, 2000) // 每2秒更新一次
      }
    }

    setTimeout(updateProgress, 1000)
  }

  // 公共方法
  public getAllModels(): AIModel[] {
    return Array.from(this.models.values())
  }

  public getModel(modelId: string): AIModel | null {
    return this.models.get(modelId) || null
  }

  public getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values())
  }

  public getProvider(providerId: string): AIProvider | null {
    return this.providers.get(providerId) || null
  }

  public updateModelParameters(modelId: string, parameters: Partial<ModelParameters>): void {
    const model = this.models.get(modelId)
    if (model) {
      model.parameters = { ...model.parameters, ...parameters }
      model.updatedAt = Date.now()
    }
  }

  public enableModel(modelId: string): void {
    const model = this.models.get(modelId)
    if (model) {
      model.status = "active"
      model.updatedAt = Date.now()
    }
  }

  public disableModel(modelId: string): void {
    const model = this.models.get(modelId)
    if (model) {
      model.status = "inactive"
      model.updatedAt = Date.now()
    }
  }
}

// 推荐引擎类
class RecommendationEngine {
  private feedback = new Map<string, ModelFeedback[]>()

  public recommend(context: TaskContext, models: AIModel[]): ModelRecommendation {
    const availableModels = models.filter((m) => m.status === "active")

    if (availableModels.length === 0) {
      throw new Error("没有可用的模型")
    }

    // 计算每个模型的评分
    const scoredModels = availableModels.map((model) => ({
      model,
      score: this.calculateScore(model, context),
    }))

    // 按评分排序
    scoredModels.sort((a, b) => b.score - a.score)

    const bestModel = scoredModels[0]

    return {
      model: bestModel.model,
      confidence: bestModel.score,
      reasoning: this.generateReasoning(bestModel.model, context),
      alternatives: scoredModels.slice(1, 4).map((sm) => ({
        model: sm.model,
        score: sm.score,
      })),
    }
  }

  public updateFeedback(modelId: string, taskType: string, feedback: ModelFeedback): void {
    const key = `${modelId}_${taskType}`
    if (!this.feedback.has(key)) {
      this.feedback.set(key, [])
    }

    const feedbackList = this.feedback.get(key)!
    feedbackList.push(feedback)

    // 保留最近100条反馈
    if (feedbackList.length > 100) {
      feedbackList.splice(0, feedbackList.length - 100)
    }
  }

  private calculateScore(model: AIModel, context: TaskContext): number {
    let score = 0

    // 基础性能评分 (40%)
    score += model.performance.accuracy * 0.4

    // 任务类型匹配 (30%)
    if (model.capabilities.includes(context.taskType)) {
      score += 0.3
    }

    // 专业化匹配 (20%)
    const specializationMatch = model.specializations.some(
      (spec) => context.taskType.includes(spec) || spec === "general",
    )
    if (specializationMatch) {
      score += 0.2
    }

    // 成本效率 (10%)
    score += model.performance.cost * 0.1

    // 历史反馈调整
    const feedbackKey = `${model.id}_${context.taskType}`
    const feedbackList = this.feedback.get(feedbackKey) || []
    if (feedbackList.length > 0) {
      const avgQuality = feedbackList.reduce((sum, f) => sum + f.quality, 0) / feedbackList.length
      score = score * 0.7 + avgQuality * 0.3
    }

    return Math.min(1, Math.max(0, score))
  }

  private generateReasoning(model: AIModel, context: TaskContext): string {
    const reasons = []

    if (model.performance.accuracy > 0.9) {
      reasons.push("高准确率")
    }

    if (model.capabilities.includes(context.taskType)) {
      reasons.push("支持任务类型")
    }

    if (model.specializations.includes("coding") && context.taskType.includes("code")) {
      reasons.push("代码专业化")
    }

    if (model.performance.cost > 0.8) {
      reasons.push("成本效益高")
    }

    return reasons.join("、") || "综合评估最佳"
  }
}

// 类型定义
export interface AIModel {
  id: string
  name: string
  provider: string
  type: "language-model" | "code-model" | "vision-model" | "multimodal"
  capabilities: string[]
  parameters: ModelParameters
  specializations: string[]
  performance: ModelPerformance
  status: "active" | "inactive" | "training" | "error"
  version: string
  createdAt: number
  updatedAt: number
  customConfig?: CustomModelConfig
}

export interface ModelParameters {
  maxTokens: number
  temperature: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export interface ModelPerformance {
  accuracy: number
  speed: number
  cost: number
  reliability: number
}

export interface AIProvider {
  id: string
  name: string
  type: "api" | "local" | "cloud"
  config: any
  models: string[]
  capabilities: string[]
  pricing: {
    inputTokens: number
    outputTokens: number
    currency: string
    per1000Tokens: boolean
  }
  limits: {
    maxTokens: number
    requestsPerMinute: number
    tokensPerMinute: number
  }
  enabled: boolean
}

export interface AITask {
  type: string
  input: string
  language?: string
  complexity?: "low" | "medium" | "high"
  priority?: "low" | "normal" | "high"
  budget?: number
  preferredModel?: string
  systemPrompt?: string
  userPreferences?: any
}

export interface AITaskResult {
  success: boolean
  result?: string
  error?: string
  model?: string
  tokens?: TokenUsage
  duration: number
  cost: number
  confidence?: number
  metadata?: any
}

export interface TokenUsage {
  input: number
  output: number
  total: number
}

export interface ModelResponse {
  content: string
  tokens: TokenUsage
  confidence: number
  quality: number
}

export interface CustomModelConfig {
  name: string
  type: AIModel["type"]
  capabilities: string[]
  parameters: ModelParameters
  specializations: string[]
  trainingData?: TrainingData
}

export interface TrainingData {
  examples: Array<{ input: string; output: string }>
  epochs?: number
  batchSize?: number
  learningRate?: number
  validationSplit?: number
}

export interface TrainingJob {
  id: string
  modelId: string
  status: "running" | "completed" | "failed" | "stopped"
  progress: number
  startTime: number
  endTime: number | null
  config: {
    epochs: number
    batchSize: number
    learningRate: number
    validationSplit: number
  }
  metrics: {
    loss: number[]
    accuracy: number[]
    validationLoss: number[]
    validationAccuracy: number[]
  }
  logs: string[]
}

export interface ModelRecommendation {
  model: AIModel
  confidence: number
  reasoning: string
  alternatives: Array<{
    model: AIModel
    score: number
  }>
}

export interface TaskContext {
  taskType: string
  language?: string
  complexity: string
  priority: string
  budget?: number
  userPreferences?: any
}

export interface ModelFeedback {
  success: boolean
  duration: number
  quality: number
}

export interface ModelAnalytics {
  modelId: string
  usage: {
    totalRequests: number
    successRate: number
    averageLatency: number
    totalTokens: number
  }
  performance: {
    accuracy: number
    throughput: number
    errorRate: number
    costEfficiency: number
  }
  trends: {
    usageGrowth: number
    performanceChange: number
    costChange: number
  }
  topUseCases: Array<{
    type: string
    percentage: number
  }>
}

export interface AIConfig {
  defaultModel: string
  enableCustomModels: boolean
  enableTraining: boolean
  maxConcurrentJobs: number
  cacheEnabled: boolean
  cacheTTL: number
}

// 导出AI模型管理器实例
export const aiModelManager = AIModelManager.getInstance()
