/**
 * 本地模型优化器
 * 针对已安装的模型进行优化配置
 */

export interface LocalModel {
  name: string
  id: string
  size: string
  sizeGB: number
  modified: string
  category: "general" | "code" | "chinese" | "large"
  capabilities: string[]
  performance: {
    speed: "fast" | "medium" | "slow"
    quality: "good" | "excellent" | "outstanding"
    memoryUsage: "low" | "medium" | "high" | "very_high"
  }
  chineseSupport: "none" | "basic" | "good" | "excellent"
  codingAbility: "none" | "basic" | "good" | "excellent"
  recommendedFor: string[]
  priority: number
}

export class LocalModelOptimizer {
  private models: LocalModel[] = [
    {
      name: "qwen2:72b",
      id: "93563ef658b2",
      size: "41 GB",
      sizeGB: 41,
      modified: "22 hours ago",
      category: "large",
      capabilities: ["中文对话", "代码生成", "复杂推理", "多语言翻译", "文档分析"],
      performance: {
        speed: "slow",
        quality: "outstanding",
        memoryUsage: "very_high",
      },
      chineseSupport: "excellent",
      codingAbility: "excellent",
      recommendedFor: ["复杂编程任务", "架构设计", "代码审查", "技术文档", "高质量翻译"],
      priority: 1,
    },
    {
      name: "llama3:70b",
      id: "786f3184aec0",
      size: "39 GB",
      sizeGB: 39,
      modified: "3 days ago",
      category: "large",
      capabilities: ["英文对话", "逻辑推理", "创意写作", "问题解决", "代码理解"],
      performance: {
        speed: "slow",
        quality: "outstanding",
        memoryUsage: "very_high",
      },
      chineseSupport: "basic",
      codingAbility: "excellent",
      recommendedFor: ["英文编程", "算法设计", "系统架构", "技术咨询", "代码优化"],
      priority: 2,
    },
    {
      name: "mixtral:latest",
      id: "a3b6bef0f836",
      size: "26 GB",
      sizeGB: 26,
      modified: "3 days ago",
      category: "large",
      capabilities: ["多语言支持", "专家混合", "高效推理", "代码生成", "技术问答"],
      performance: {
        speed: "medium",
        quality: "excellent",
        memoryUsage: "high",
      },
      chineseSupport: "good",
      codingAbility: "excellent",
      recommendedFor: ["多语言项目", "快速原型", "技术咨询", "代码重构", "性能优化"],
      priority: 3,
    },
    {
      name: "llama3:latest",
      id: "365c0bd3c000",
      size: "4.7 GB",
      sizeGB: 4.7,
      modified: "3 days ago",
      category: "general",
      capabilities: ["通用对话", "文本生成", "简单推理", "基础编程", "内容创作"],
      performance: {
        speed: "fast",
        quality: "good",
        memoryUsage: "medium",
      },
      chineseSupport: "basic",
      codingAbility: "good",
      recommendedFor: ["日常编程", "快速开发", "学习辅助", "简单任务", "原型验证"],
      priority: 4,
    },
    {
      name: "qwen2:latest",
      id: "dd314f039b9d",
      size: "4.4 GB",
      sizeGB: 4.4,
      modified: "3 days ago",
      category: "chinese",
      capabilities: ["中文对话", "中文编程", "文档翻译", "代码注释", "技术解释"],
      performance: {
        speed: "fast",
        quality: "excellent",
        memoryUsage: "medium",
      },
      chineseSupport: "excellent",
      codingAbility: "excellent",
      recommendedFor: ["中文编程", "代码注释", "技术文档", "学习辅导", "快速开发"],
      priority: 5,
    },
    {
      name: "codellama:latest",
      id: "8fdf8f752f6e",
      size: "3.8 GB",
      sizeGB: 3.8,
      modified: "3 days ago",
      category: "code",
      capabilities: ["代码生成", "代码补全", "bug修复", "代码解释", "重构建议"],
      performance: {
        speed: "fast",
        quality: "excellent",
        memoryUsage: "medium",
      },
      chineseSupport: "basic",
      codingAbility: "excellent",
      recommendedFor: ["纯代码生成", "算法实现", "代码调试", "性能优化", "单元测试"],
      priority: 6,
    },
    {
      name: "phi3:latest",
      id: "4f2222927938",
      size: "2.2 GB",
      sizeGB: 2.2,
      modified: "3 days ago",
      category: "general",
      capabilities: ["轻量对话", "快速响应", "基础推理", "简单编程", "教育辅助"],
      performance: {
        speed: "fast",
        quality: "good",
        memoryUsage: "low",
      },
      chineseSupport: "basic",
      codingAbility: "good",
      recommendedFor: ["快速查询", "学习辅助", "简单任务", "资源受限环境", "批量处理"],
      priority: 7,
    },
  ]

  /**
   * 获取所有本地模型
   */
  public getLocalModels(): LocalModel[] {
    return this.models
  }

  /**
   * 根据任务类型推荐模型
   */
  public recommendModelForTask(
    taskType: "chinese_coding" | "english_coding" | "complex_reasoning" | "fast_response" | "general",
  ): LocalModel[] {
    const recommendations: Record<string, string[]> = {
      chinese_coding: ["qwen2:72b", "qwen2:latest", "mixtral:latest"],
      english_coding: ["llama3:70b", "codellama:latest", "mixtral:latest"],
      complex_reasoning: ["qwen2:72b", "llama3:70b", "mixtral:latest"],
      fast_response: ["phi3:latest", "llama3:latest", "qwen2:latest"],
      general: ["qwen2:latest", "llama3:latest", "phi3:latest"],
    }

    const modelNames = recommendations[taskType] || []
    return this.models.filter((model) => modelNames.includes(model.name)).sort((a, b) => a.priority - b.priority)
  }

  /**
   * 获取最佳中文编程模型
   */
  public getBestChineseModel(): LocalModel {
    return this.models.find((m) => m.name === "qwen2:72b") || this.models.find((m) => m.name === "qwen2:latest")!
  }

  /**
   * 获取最快响应模型
   */
  public getFastestModel(): LocalModel {
    return this.models.filter((m) => m.performance.speed === "fast").sort((a, b) => a.sizeGB - b.sizeGB)[0]
  }

  /**
   * 获取资源使用统计
   */
  public getResourceUsage(): {
    totalSize: number
    totalModels: number
    categoryBreakdown: Record<string, number>
    memoryUsage: Record<string, number>
  } {
    const totalSize = this.models.reduce((sum, model) => sum + model.sizeGB, 0)
    const totalModels = this.models.length

    const categoryBreakdown: Record<string, number> = {}
    const memoryUsage: Record<string, number> = {}

    this.models.forEach((model) => {
      categoryBreakdown[model.category] = (categoryBreakdown[model.category] || 0) + 1
      memoryUsage[model.performance.memoryUsage] = (memoryUsage[model.performance.memoryUsage] || 0) + 1
    })

    return {
      totalSize,
      totalModels,
      categoryBreakdown,
      memoryUsage,
    }
  }

  /**
   * 生成使用建议
   */
  public generateUsageRecommendations(): {
    primary: LocalModel
    secondary: LocalModel
    fast: LocalModel
    specialized: LocalModel[]
    tips: string[]
  } {
    return {
      primary: this.getBestChineseModel(),
      secondary: this.models.find((m) => m.name === "mixtral:latest")!,
      fast: this.getFastestModel(),
      specialized: this.models.filter((m) => m.category === "code"),
      tips: [
        "使用 qwen2:72b 处理复杂的中文编程任务",
        "使用 qwen2:latest 进行日常中文编程",
        "使用 codellama:latest 专门生成代码",
        "使用 phi3:latest 进行快速查询和测试",
        "大模型适合复杂任务，小模型适合快速响应",
        "根据任务复杂度选择合适的模型以平衡性能和资源",
      ],
    }
  }
}

export const localModelOptimizer = new LocalModelOptimizer()
