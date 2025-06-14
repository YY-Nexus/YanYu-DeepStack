"use client"

import { create } from "zustand"
import { enhancedOllamaService, type EnhancedOllamaModel } from "./enhanced-ollama-service"

// 模型与代码生成集成状态管理
interface ModelCodeIntegrationState {
  // 模型相关
  availableModels: EnhancedOllamaModel[]
  selectedModelId: string | null
  isLoadingModels: boolean
  modelError: string | null

  // 代码生成相关
  generationHistory: CodeGenerationRecord[]
  isGenerating: boolean
  generationProgress: number

  // 操作方法
  loadAvailableModels: () => Promise<void>
  selectModel: (modelId: string) => void
  generateCode: (prompt: string, options?: CodeGenerationOptions) => Promise<CodeGenerationResult>
  saveGenerationRecord: (record: CodeGenerationRecord) => void
  clearHistory: () => void
}

// 代码生成记录
export interface CodeGenerationRecord {
  id: string
  timestamp: Date
  prompt: string
  code: string
  modelId: string
  modelName: string
  options: CodeGenerationOptions
  metrics: {
    latency: number
    tokensGenerated: number
    tokensPerSecond: number
  }
}

// 代码生成选项
export interface CodeGenerationOptions {
  temperature?: number
  maxTokens?: number
  language?: string
  framework?: string
  includeComments?: boolean
  optimizeFor?: "readability" | "performance" | "security"
}

// 代码生成结果
export interface CodeGenerationResult {
  success: boolean
  code: string
  error?: string
  metrics: {
    latency: number
    tokensGenerated: number
    tokensPerSecond: number
  }
}

// 创建状态管理存储
export const useModelCodeIntegration = create<ModelCodeIntegrationState>((set, get) => ({
  // 初始状态
  availableModels: [],
  selectedModelId: null,
  isLoadingModels: false,
  modelError: null,
  generationHistory: [],
  isGenerating: false,
  generationProgress: 0,

  // 加载可用模型
  loadAvailableModels: async () => {
    set({ isLoadingModels: true, modelError: null })

    try {
      // 监听模型加载事件
      const onModelsLoaded = (models: EnhancedOllamaModel[]) => {
        // 过滤出可用的代码生成模型
        const codeModels = models
          .filter((m) => m.status === "ready" && (m.type === "code" || m.type === "chat"))
          .sort((a, b) => {
            // 优先显示代码类型模型
            if (a.type === "code" && b.type !== "code") return -1
            if (a.type !== "code" && b.type === "code") return 1

            // 其次按使用频率排序
            return (b.usageStats.totalCalls || 0) - (a.usageStats.totalCalls || 0)
          })

        set({
          availableModels: codeModels,
          // 如果没有选择模型或当前选择的模型不可用，则选择第一个可用模型
          selectedModelId:
            get().selectedModelId && codeModels.some((m) => m.id === get().selectedModelId)
              ? get().selectedModelId
              : codeModels.length > 0
                ? codeModels[0].id
                : null,
          isLoadingModels: false,
        })

        // 移除事件监听器
        enhancedOllamaService.removeListener("models:loaded", onModelsLoaded)
      }

      // 添加事件监听器
      enhancedOllamaService.on("models:loaded", onModelsLoaded)

      // 获取当前模型列表
      const currentModels = enhancedOllamaService.getAllModels()
      if (currentModels.length > 0) {
        onModelsLoaded(currentModels)
      }
    } catch (error) {
      console.error("加载模型失败:", error)
      set({
        modelError: error instanceof Error ? error.message : "加载模型失败",
        isLoadingModels: false,
      })
    }
  },

  // 选择模型
  selectModel: (modelId: string) => {
    const model = get().availableModels.find((m) => m.id === modelId)
    if (model) {
      set({ selectedModelId: modelId })

      // 存储用户选择到本地存储
      try {
        localStorage.setItem("yanyu-selected-code-model", modelId)
      } catch (e) {
        // 忽略本地存储错误
      }
    }
  },

  // 生成代码
  generateCode: async (prompt: string, options = {}) => {
    const { selectedModelId, availableModels } = get()

    if (!selectedModelId) {
      return {
        success: false,
        code: "",
        error: "未选择模型",
        metrics: { latency: 0, tokensGenerated: 0, tokensPerSecond: 0 },
      }
    }

    const model = availableModels.find((m) => m.id === selectedModelId)
    if (!model) {
      return {
        success: false,
        code: "",
        error: "所选模型不可用",
        metrics: { latency: 0, tokensGenerated: 0, tokensPerSecond: 0 },
      }
    }

    // 开始生成
    set({ isGenerating: true, generationProgress: 0 })

    try {
      // 构建增强提示词
      let enhancedPrompt = prompt

      // 根据选项添加语言和框架信息
      if (options.language) {
        enhancedPrompt = `使用 ${options.language} ${options.framework ? `和 ${options.framework} 框架 ` : ""}实现以下功能:\n\n${prompt}`
      }

      // 添加注释要求
      if (options.includeComments) {
        enhancedPrompt += "\n\n请提供详细的中文注释，解释代码的关键部分。"
      }

      // 添加优化要求
      if (options.optimizeFor) {
        const optimizationMap = {
          readability: "可读性",
          performance: "性能",
          security: "安全性",
        }
        enhancedPrompt += `\n\n请特别注重代码的${optimizationMap[options.optimizeFor]}。`
      }

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        set((state) => ({
          generationProgress: Math.min(state.generationProgress + 5, 90),
        }))
      }, 300)

      // 调用模型生成代码
      const startTime = Date.now()
      const result = await enhancedOllamaService.generateText(selectedModelId, enhancedPrompt, {
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2048,
      })
      const endTime = Date.now()

      // 清除进度更新
      clearInterval(progressInterval)
      set({ generationProgress: 100 })

      // 处理结果
      if (result.success && result.text) {
        // 提取代码块
        const code = extractCodeFromResponse(result.text)

        // 计算指标
        const metrics = {
          latency: endTime - startTime,
          tokensGenerated: result.tokens?.completion || 0,
          tokensPerSecond: result.tokens?.completion
            ? (result.tokens.completion / (result.timing?.evalTime || 1e9)) * 1e9
            : 0,
        }

        // 创建生成记录
        const generationRecord: CodeGenerationRecord = {
          id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date(),
          prompt,
          code,
          modelId: selectedModelId,
          modelName: model.name,
          options: { ...options },
          metrics,
        }

        // 保存记录
        get().saveGenerationRecord(generationRecord)

        return {
          success: true,
          code,
          metrics,
        }
      } else {
        return {
          success: false,
          code: "",
          error: result.error || "生成失败",
          metrics: {
            latency: endTime - startTime,
            tokensGenerated: 0,
            tokensPerSecond: 0,
          },
        }
      }
    } catch (error) {
      console.error("代码生成错误:", error)
      return {
        success: false,
        code: "",
        error: error instanceof Error ? error.message : "生成过程中发生错误",
        metrics: { latency: 0, tokensGenerated: 0, tokensPerSecond: 0 },
      }
    } finally {
      set({ isGenerating: false, generationProgress: 0 })
    }
  },

  // 保存生成记录
  saveGenerationRecord: (record: CodeGenerationRecord) => {
    set((state) => {
      // 限制历史记录数量，保留最近的20条
      const updatedHistory = [record, ...state.generationHistory].slice(0, 20)

      // 尝试保存到本地存储
      try {
        localStorage.setItem("yanyu-code-generation-history", JSON.stringify(updatedHistory))
      } catch (e) {
        // 忽略本地存储错误
      }

      return { generationHistory: updatedHistory }
    })
  },

  // 清除历史记录
  clearHistory: () => {
    set({ generationHistory: [] })
    try {
      localStorage.removeItem("yanyu-code-generation-history")
    } catch (e) {
      // 忽略本地存储错误
    }
  },
}))

// 从响应中提取代码块
function extractCodeFromResponse(text: string): string {
  // 尝试提取代码块（使用```包围的内容）
  const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/g
  const matches = [...text.matchAll(codeBlockRegex)]

  if (matches.length > 0) {
    // 提取所有代码块并合并
    return matches.map((match) => match[1].trim()).join("\n\n")
  }

  // 如果没有找到代码块，返回原始文本
  return text
}

// 初始化函数 - 在应用启动时调用
export function initializeModelCodeIntegration() {
  const integration = useModelCodeIntegration.getState()

  // 加载可用模型
  integration.loadAvailableModels()

  // 从本地存储加载历史记录
  try {
    const savedHistory = localStorage.getItem("yanyu-code-generation-history")
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory) as CodeGenerationRecord[]
      // 转换日期字符串为Date对象
      const processedHistory = parsedHistory.map((record) => ({
        ...record,
        timestamp: new Date(record.timestamp),
      }))
      useModelCodeIntegration.setState({ generationHistory: processedHistory })
    }

    // 加载上次选择的模型
    const savedModelId = localStorage.getItem("yanyu-selected-code-model")
    if (savedModelId) {
      // 在模型加载完成后再设置选择的模型
      const unsubscribe = useModelCodeIntegration.subscribe(
        (state) => state.availableModels,
        (models) => {
          if (models.length > 0 && models.some((m) => m.id === savedModelId)) {
            useModelCodeIntegration.getState().selectModel(savedModelId)
            unsubscribe()
          }
        },
      )
    }
  } catch (e) {
    console.error("加载历史记录失败:", e)
  }

  // 监听Ollama服务连接状态变化
  enhancedOllamaService.on("connection:established", () => {
    integration.loadAvailableModels()
  })

  enhancedOllamaService.on("connection:lost", () => {
    useModelCodeIntegration.setState({
      modelError: "与AI模型服务的连接已断开，请检查服务状态",
    })
  })

  return integration
}
