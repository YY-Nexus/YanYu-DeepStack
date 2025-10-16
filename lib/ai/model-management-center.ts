"use client"

import { useState, useEffect } from "react"

// AI模型管理中心 - 统一管理本地和云端AI模型
export class ModelManagementCenter {
  private static instance: ModelManagementCenter
  private models = new Map<string, AIModel>()
  private modelTasks = new Map<string, ModelTask>()
  private config: ModelManagementConfig

  private constructor() {
    this.config = {
      ollamaUrl: process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434",
      modelCacheDir: "/tmp/yanyu-models",
      defaultModels: [
        { id: "codellama:7b", name: "CodeLlama 7B", type: "code", provider: "ollama" },
        { id: "llama3:8b", name: "Llama 3 8B", type: "chat", provider: "ollama" },
        { id: "phi3:mini", name: "Phi-3 Mini", type: "chat", provider: "ollama" },
      ],
      autoDownload: false,
      maxConcurrentDownloads: 1,
    }

    this.initializeModels()
  }

  public static getInstance(): ModelManagementCenter {
    if (!ModelManagementCenter.instance) {
      ModelManagementCenter.instance = new ModelManagementCenter()
    }
    return ModelManagementCenter.instance
  }

  // 初始化模型列表
  private async initializeModels(): Promise<void> {
    try {
      // 获取本地已安装的Ollama模型
      await this.fetchOllamaModels()

      // 添加默认模型（如果不存在）
      for (const defaultModel of this.config.defaultModels) {
        if (!this.models.has(defaultModel.id)) {
          this.models.set(defaultModel.id, {
            ...defaultModel,
            status: "not_downloaded",
            size: 0,
            lastUsed: null,
            parameters: defaultModel.id.includes("7b") ? "7B" : defaultModel.id.includes("8b") ? "8B" : "Unknown",
            quantization: defaultModel.id.includes("q4_0") ? "Q4_0" : "None",
            createdAt: new Date(),
          })
        }
      }

      console.log(`✅ 已初始化${this.models.size}个AI模型`)
    } catch (error) {
      console.error("初始化模型失败:", error)
    }
  }

  // 获取Ollama模型列表
  private async fetchOllamaModels(): Promise<void> {
    try {
      const response = await fetch(`${this.config.ollamaUrl}/api/tags`)

      if (!response.ok) {
        throw new Error(`获取Ollama模型失败: ${response.status}`)
      }

      const data = await response.json()

      if (data.models) {
        for (const model of data.models) {
          const modelId = model.name
          const existingModel = this.models.get(modelId)

          this.models.set(modelId, {
            id: modelId,
            name: this.formatModelName(modelId),
            type: this.inferModelType(modelId),
            provider: "ollama",
            status: "ready",
            size: model.size || 0,
            lastUsed: existingModel?.lastUsed || null,
            parameters: this.inferModelParameters(modelId),
            quantization: this.inferModelQuantization(modelId),
            createdAt: existingModel?.createdAt || new Date(),
            updatedAt: new Date(),
          })
        }
      }
    } catch (error) {
      console.error("获取Ollama模型列表失败:", error)
      // 如果获取失败，可能是Ollama服务未启动，标记所有Ollama模型为未知状态
      // 使用Array.from将Map转换为数组，避免使用MapIterator
      for (const [id, model] of Array.from(this.models.entries())) {
        if (model.provider === "ollama") {
          this.models.set(id, { ...model, status: "unknown" })
        }
      }
    }
  }

  // 格式化模型名称
  private formatModelName(modelId: string): string {
    // 将模型ID转换为更友好的显示名称
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
      gemma: "Gemma",
    }

    const formattedName = nameMap[baseName] || baseName.charAt(0).toUpperCase() + baseName.slice(1)

    if (version) {
      return `${formattedName} ${version}`
    }

    return formattedName
  }

  // 推断模型类型
  private inferModelType(modelId: string): ModelType {
    const id = modelId.toLowerCase()

    if (id.includes("code") || id.includes("starcoder") || id.includes("deepseek-coder")) {
      return "code"
    } else if (id.includes("vision") || id.includes("clip") || id.includes("image")) {
      return "multimodal"
    } else {
      return "chat"
    }
  }

  // 推断模型参数量
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

  // 推断模型量化方式
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
  public getAllModels(): AIModel[] {
    return Array.from(this.models.values())
  }

  // 获取特定类型的模型
  public getModelsByType(type: ModelType): AIModel[] {
    return Array.from(this.models.values()).filter((model) => model.type === type)
  }

  // 获取可用的模型
  public getAvailableModels(): AIModel[] {
    return Array.from(this.models.values()).filter((model) => model.status === "ready")
  }

  // 获取模型详情
  public getModel(modelId: string): AIModel | undefined {
    return this.models.get(modelId)
  }

  // 下载模型
  public async downloadModel(modelId: string, onProgress?: (progress: number, status: string) => void): Promise<ModelTask> {
    // 检查是否已存在下载任务
    let task = this.modelTasks.get(modelId)
    if (task && ["pending", "downloading"].includes(task.status)) {
      return task
    }

    // 创建新的下载任务
    task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      modelId,
      type: "download",
      status: "pending",
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.modelTasks.set(modelId, task)

    // 更新模型状态
    const model = this.models.get(modelId)
    if (model) {
      this.models.set(modelId, { ...model, status: "downloading" })
    }
    
    // 调用进度回调
    onProgress?.(0, '准备下载...')

    // 开始下载
    this.startModelDownload(modelId, task, onProgress)

    return task
  }

  // 开始模型下载
  private async startModelDownload(modelId: string, task: ModelTask, onProgress?: (progress: number, status: string) => void): Promise<void> {
    try {
      // 更新任务状态
      task.status = "downloading"
      task.startedAt = new Date()
      this.modelTasks.set(modelId, { ...task })

      console.log(`🔄 开始下载模型: ${modelId}`)
      
      // 调用进度回调
      onProgress?.(0, `开始下载模型: ${modelId}`)

      // 调用Ollama API下载模型
      const response = await fetch(`${this.config.ollamaUrl}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: modelId }),
      })

      if (!response.ok) {
        throw new Error(`下载模型失败: ${response.status}`)
      }

      // Ollama API返回的是流式响应，需要逐行读取
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("无法读取响应流")
      }

      let receivedLength = 0
      let totalLength = 0

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // 解析进度信息
        const text = new TextDecoder().decode(value)
        const lines = text.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)

            if (data.total && data.completed) {
              totalLength = data.total
              receivedLength = data.completed

              const progress = Math.round((receivedLength / totalLength) * 100)

              // 更新任务进度
              task.progress = progress
              task.updatedAt = new Date()
              this.modelTasks.set(modelId, { ...task })

              // 更新模型状态
              const model = this.models.get(modelId)
              if (model) {
                this.models.set(modelId, {
                  ...model,
                  status: "downloading",
                  downloadProgress: progress,
                })
              }
              
              // 调用进度回调
              onProgress?.(progress, `下载中... ${progress}%`)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }

      // 下载完成，更新状态
      task.status = "completed"
      task.progress = 100
      task.completedAt = new Date()
      this.modelTasks.set(modelId, { ...task })

      // 更新模型状态
      await this.fetchOllamaModels() // 重新获取模型列表以更新状态

      console.log(`✅ 模型下载完成: ${modelId}`)
      
      // 完成回调
      onProgress?.(100, '下载完成')
    } catch (error) {
      console.error(`❌ 模型下载失败: ${modelId}`, error)

      // 更新任务状态
      task.status = "failed"
      task.error = error instanceof Error ? error.message : "下载失败"
      task.updatedAt = new Date()
      this.modelTasks.set(modelId, { ...task })

      // 更新模型状态
      const model = this.models.get(modelId)
      if (model) {
        this.models.set(modelId, { ...model, status: "download_failed" })
      }
      
      // 失败回调
      onProgress?.(0, `下载失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 删除模型
  public async deleteModel(modelId: string): Promise<boolean> {
    try {
      // 检查模型是否存在
      const model = this.models.get(modelId)
      if (!model) {
        throw new Error(`模型不存在: ${modelId}`)
      }

      // 只能删除Ollama模型
      if (model.provider !== "ollama") {
        throw new Error(`不支持删除非Ollama模型: ${modelId}`)
      }

      console.log(`🗑️ 开始删除模型: ${modelId}`)

      // 调用Ollama API删除模型
      const response = await fetch(`${this.config.ollamaUrl}/api/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: modelId }),
      })

      if (!response.ok) {
        throw new Error(`删除模型失败: ${response.status}`)
      }

      // 更新模型状态
      this.models.set(modelId, { ...model, status: "not_downloaded" })

      console.log(`✅ 模型删除成功: ${modelId}`)
      return true
    } catch (error) {
      console.error(`❌ 模型删除失败: ${modelId}`, error)
      return false
    }
  }

  // 获取模型任务
  public getModelTasks(): ModelTask[] {
    return Array.from(this.modelTasks.values())
  }

  // 获取模型任务详情
  public getModelTask(taskId: string): ModelTask | undefined {
    // 使用Array.from将Map转换为数组，避免使用MapIterator
    for (const task of Array.from(this.modelTasks.values())) {
      if (task.id === taskId) {
        return task
      }
    }
    return undefined
  }

  // 获取模型统计信息
  public getModelStats(): ModelStats {
    const models = this.getAllModels()

    return {
      total: models.length,
      ready: models.filter((m) => m.status === "ready").length,
      downloading: models.filter((m) => m.status === "downloading").length,
      notDownloaded: models.filter((m) => m.status === "not_downloaded").length,
      byType: {
        chat: models.filter((m) => m.type === "chat").length,
        code: models.filter((m) => m.type === "code").length,
        multimodal: models.filter((m) => m.type === "multimodal").length,
      },
      byProvider: {
        ollama: models.filter((m) => m.provider === "ollama").length,
        openai: models.filter((m) => m.provider === "openai").length,
        anthropic: models.filter((m) => m.provider === "anthropic").length,
        google: models.filter((m) => m.provider === "google").length,
      },
      totalSize: models.reduce((sum, m) => sum + (m.size || 0), 0),
    }
  }

  // 刷新模型列表
  public async refreshModels(): Promise<void> {
    await this.fetchOllamaModels()
  }

  // 使用模型（记录使用时间）
  public useModel(modelId: string): void {
    const model = this.models.get(modelId)
    if (model) {
      this.models.set(modelId, {
        ...model,
        lastUsed: new Date(),
        usageCount: (model.usageCount || 0) + 1,
      })
    }
  }

  // 获取推荐模型
  public getRecommendedModels(type: ModelType = "chat", count = 3): AIModel[] {
    const availableModels = this.getAvailableModels().filter((m) => m.type === type)

    // 按使用次数和最近使用时间排序
    return availableModels
      .sort((a, b) => {
        // 首先按使用次数排序
        const countDiff = (b.usageCount || 0) - (a.usageCount || 0)
        if (countDiff !== 0) return countDiff

        // 其次按最近使用时间排序
        if (a.lastUsed && b.lastUsed) {
          return b.lastUsed.getTime() - a.lastUsed.getTime()
        }

        return a.lastUsed ? -1 : b.lastUsed ? 1 : 0
      })
      .slice(0, count)
  }
}

// 类型定义
export type ModelType = "chat" | "code" | "multimodal"
export type ModelProvider = "ollama" | "openai" | "anthropic" | "google"
export type ModelStatus = "ready" | "downloading" | "not_downloaded" | "download_failed" | "unknown"
export type TaskType = "download" | "update" | "delete"
export type TaskStatus = "pending" | "downloading" | "completed" | "failed"

export interface AIModel {
  id: string
  name: string
  type: ModelType
  provider: ModelProvider
  status: ModelStatus
  size: number
  lastUsed: Date | null
  parameters: string
  quantization: string
  createdAt: Date
  updatedAt?: Date
  downloadProgress?: number
  usageCount?: number
}

export interface ModelTask {
  id: string
  modelId: string
  type: TaskType
  status: TaskStatus
  progress: number
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
}

export interface ModelManagementConfig {
  ollamaUrl: string
  modelCacheDir: string
  defaultModels: Array<{
    id: string
    name: string
    type: ModelType
    provider: ModelProvider
  }>
  autoDownload: boolean
  maxConcurrentDownloads: number
}

export interface ModelStats {
  total: number
  ready: number
  downloading: number
  notDownloaded: number
  byType: Record<ModelType, number>
  byProvider: Record<ModelProvider, number>
  totalSize: number
}

// 导出模型管理中心实例
export const modelManagementCenter = ModelManagementCenter.getInstance()

// React Hook - 使用模型管理中心
export function useModelManagement() {
  const [models, setModels] = useState<AIModel[]>([])
  const [tasks, setTasks] = useState<ModelTask[]>([])
  const [stats, setStats] = useState<ModelStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初始加载
    loadModels()

    // 定期刷新
    const interval = setInterval(() => {
      loadModels()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const loadModels = async () => {
    try {
      await modelManagementCenter.refreshModels()
      setModels(modelManagementCenter.getAllModels())
      setTasks(modelManagementCenter.getModelTasks())
      setStats(modelManagementCenter.getModelStats())
      setLoading(false)
    } catch (error) {
      console.error("加载模型失败:", error)
      setLoading(false)
    }
  }

  const downloadModel = async (modelId: string) => {
    await modelManagementCenter.downloadModel(modelId)
    loadModels()
  }

  const deleteModel = async (modelId: string) => {
    await modelManagementCenter.deleteModel(modelId)
    loadModels()
  }

  return {
    models,
    tasks,
    stats,
    loading,
    refreshModels: loadModels,
    downloadModel,
    deleteModel,
    getModelsByType: (type: ModelType) => modelManagementCenter.getModelsByType(type),
    getAvailableModels: () => modelManagementCenter.getAvailableModels(),
    getRecommendedModels: (type?: ModelType, count?: number) => modelManagementCenter.getRecommendedModels(type, count),
  }
}
