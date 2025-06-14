"use client"

// 定义插件市场相关的类型
export interface MarketplacePlugin {
  id: string
  name: string
  description: string
  version: string
  author: {
    id: string
    name: string
    avatar: string
  }
  categoryId: string
  tags: string[]
  pricing:
    | { type: "free" }
    | { type: "paid"; price: number; currency: string; trial?: number }
    | { type: "freemium"; price: number; currency: string }
  stats: {
    downloads: number
    rating: number
    reviewCount: number
  }
  compatibility: {
    minVersion: string
    maxVersion: string | null
  }
  createdAt: number
  updatedAt: number
  featured: boolean
  verified: boolean
  screenshots: string[]
}

export interface PluginCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export interface PluginReview {
  id: string
  pluginId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: number
  helpful: number
}

// 插件市场 - 管理插件发布、安装和评分
export class PluginMarketplace {
  private static instance: PluginMarketplace
  private plugins = new Map<string, MarketplacePlugin>()
  private categories = new Map<string, PluginCategory>()
  private reviews = new Map<string, PluginReview[]>()
  private userInstallations = new Map<string, string[]>() // userId -> pluginIds
  private eventListeners: Map<string, Function[]> = new Map()

  private constructor() {
    this.initializeCategories()
    this.initializeMockPlugins()
  }

  public static getInstance(): PluginMarketplace {
    if (!PluginMarketplace.instance) {
      PluginMarketplace.instance = new PluginMarketplace()
    }
    return PluginMarketplace.instance
  }

  // 初始化插件分类
  private initializeCategories(): void {
    const categories: PluginCategory[] = [
      {
        id: "code-generation",
        name: "代码生成",
        description: "增强AI代码生成能力",
        icon: "Code",
        color: "#FF6B6B",
      },
      {
        id: "ui-components",
        name: "UI组件",
        description: "扩展UI组件库",
        icon: "Layout",
        color: "#4ECDC4",
      },
      {
        id: "integrations",
        name: "第三方集成",
        description: "连接外部服务和平台",
        icon: "Link",
        color: "#45B7D1",
      },
      {
        id: "productivity",
        name: "生产力工具",
        description: "提高开发效率的工具",
        icon: "Zap",
        color: "#FFE66D",
      },
      {
        id: "themes",
        name: "主题和样式",
        description: "自定义界面外观",
        icon: "Palette",
        color: "#A2D2FF",
      },
      {
        id: "ai-models",
        name: "AI模型扩展",
        description: "扩展AI模型和能力",
        icon: "Brain",
        color: "#FF9A8B",
      },
    ]

    categories.forEach((category) => {
      this.categories.set(category.id, category)
    })
  }

  // 初始化模拟插件数据
  private initializeMockPlugins(): void {
    const mockPlugins: MarketplacePlugin[] = [
      {
        id: "code-snippets-pro",
        name: "代码片段专业版",
        description: "提供数百个常用代码片段，支持多种编程语言",
        version: "1.2.0",
        author: {
          id: "dev-team-1",
          name: "开发团队一号",
          avatar: "/images/avatars/team1.png",
        },
        categoryId: "code-generation",
        tags: ["代码片段", "模板", "效率"],
        pricing: {
          type: "free",
        },
        stats: {
          downloads: 12500,
          rating: 4.7,
          reviewCount: 320,
        },
        compatibility: {
          minVersion: "1.0.0",
          maxVersion: null,
        },
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90天前
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5天前
        featured: true,
        verified: true,
        screenshots: ["/images/plugins/code-snippets-1.png", "/images/plugins/code-snippets-2.png"],
      },
      {
        id: "ui-component-library",
        name: "UI组件库扩展",
        description: "为言語云³添加50+精美UI组件，支持暗黑模式",
        version: "2.1.3",
        author: {
          id: "design-masters",
          name: "设计大师工作室",
          avatar: "/images/avatars/design-masters.png",
        },
        categoryId: "ui-components",
        tags: ["UI", "组件", "设计系统"],
        pricing: {
          type: "paid",
          price: 29.99,
          currency: "USD",
          trial: 14, // 14天试用
        },
        stats: {
          downloads: 8700,
          rating: 4.9,
          reviewCount: 210,
        },
        compatibility: {
          minVersion: "1.5.0",
          maxVersion: null,
        },
        createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000, // 120天前
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2天前
        featured: true,
        verified: true,
        screenshots: ["/images/plugins/ui-components-1.png", "/images/plugins/ui-components-2.png"],
      },
      {
        id: "github-integration",
        name: "GitHub增强集成",
        description: "深度集成GitHub，支持PR预览、代码审查和自动部署",
        version: "1.0.5",
        author: {
          id: "cloud-tools",
          name: "云工具开发者",
          avatar: "/images/avatars/cloud-tools.png",
        },
        categoryId: "integrations",
        tags: ["GitHub", "CI/CD", "代码审查"],
        pricing: {
          type: "freemium",
          price: 9.99,
          currency: "USD",
        },
        stats: {
          downloads: 5300,
          rating: 4.5,
          reviewCount: 95,
        },
        compatibility: {
          minVersion: "1.2.0",
          maxVersion: null,
        },
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45天前
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10天前
        featured: false,
        verified: true,
        screenshots: ["/images/plugins/github-integration-1.png", "/images/plugins/github-integration-2.png"],
      },
      {
        id: "code-optimizer",
        name: "代码优化器",
        description: "自动分析并优化代码，提高性能和可读性",
        version: "0.9.2",
        author: {
          id: "performance-labs",
          name: "性能实验室",
          avatar: "/images/avatars/performance-labs.png",
        },
        categoryId: "productivity",
        tags: ["性能优化", "代码质量", "重构"],
        pricing: {
          type: "free",
        },
        stats: {
          downloads: 3200,
          rating: 4.2,
          reviewCount: 48,
        },
        compatibility: {
          minVersion: "1.0.0",
          maxVersion: null,
        },
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30天前
        updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15天前
        featured: false,
        verified: false,
        screenshots: ["/images/plugins/code-optimizer-1.png", "/images/plugins/code-optimizer-2.png"],
      },
      {
        id: "dark-theme-pro",
        name: "暗黑主题专业版",
        description: "高对比度暗黑主题，保护眼睛，支持自定义颜色",
        version: "2.0.1",
        author: {
          id: "theme-creators",
          name: "主题创作者",
          avatar: "/images/avatars/theme-creators.png",
        },
        categoryId: "themes",
        tags: ["暗黑模式", "主题", "定制化"],
        pricing: {
          type: "paid",
          price: 4.99,
          currency: "USD",
        },
        stats: {
          downloads: 9800,
          rating: 4.8,
          reviewCount: 275,
        },
        compatibility: {
          minVersion: "1.0.0",
          maxVersion: null,
        },
        createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000, // 180天前
        updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7天前
        featured: true,
        verified: true,
        screenshots: ["/images/plugins/dark-theme-1.png", "/images/plugins/dark-theme-2.png"],
      },
      {
        id: "llama-extension",
        name: "Llama模型扩展",
        description: "为言語云³添加Llama模型支持，包括微调和自定义提示词",
        version: "1.1.0",
        author: {
          id: "ai-research-group",
          name: "AI研究小组",
          avatar: "/images/avatars/ai-research.png",
        },
        categoryId: "ai-models",
        tags: ["Llama", "AI模型", "微调"],
        pricing: {
          type: "freemium",
          price: 19.99,
          currency: "USD",
          trial: 7, // 7天试用
        },
        stats: {
          downloads: 4200,
          rating: 4.6,
          reviewCount: 85,
        },
        compatibility: {
          minVersion: "1.5.0",
          maxVersion: null,
        },
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60天前
        updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3天前
        featured: false,
        verified: true,
        screenshots: ["/images/plugins/llama-extension-1.png", "/images/plugins/llama-extension-2.png"],
      },
    ]

    // 添加插件到市场
    mockPlugins.forEach((plugin) => {
      this.plugins.set(plugin.id, plugin)

      // 添加模拟评论
      this.reviews.set(plugin.id, this.generateMockReviews(plugin.id, plugin.stats.reviewCount))
    })
  }

  // 生成模拟评论
  private generateMockReviews(pluginId: string, count: number): PluginReview[] {
    const reviews: PluginReview[] = []
    const comments = [
      "非常好用的插件，提高了我的工作效率！",
      "界面设计很精美，功能也很强大。",
      "安装简单，使用方便，推荐给大家。",
      "解决了我长期以来的痛点问题，感谢开发者！",
      "性能很好，没有明显的延迟或卡顿。",
      "功能丰富，但有些地方还可以改进。",
      "总体不错，但偶尔会有小bug。",
      "价格合理，物有所值。",
      "客服响应迅速，问题解决得很好。",
      "持续更新，开发者很用心。",
    ]

    for (let i = 0; i < Math.min(count, 20); i++) {
      const rating = Math.floor(Math.random() * 3) + 3 // 3-5星
      reviews.push({
        id: `review_${pluginId}_${i}`,
        pluginId,
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        userName: `用户${Math.floor(Math.random() * 1000)}`,
        rating,
        comment: comments[Math.floor(Math.random() * comments.length)],
        createdAt: Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000, // 0-90天前
        helpful: Math.floor(Math.random() * 50),
      })
    }

    // 按时间排序
    return reviews.sort((a, b) => b.createdAt - a.createdAt)
  }

  // 获取所有插件
  public getAllPlugins(): MarketplacePlugin[] {
    return Array.from(this.plugins.values())
  }

  // 获取特定插件
  public getPlugin(pluginId: string): MarketplacePlugin | undefined {
    return this.plugins.get(pluginId)
  }

  // 获取所有分类
  public getAllCategories(): PluginCategory[] {
    return Array.from(this.categories.values())
  }

  // 获取特定分类
  public getCategory(categoryId: string): PluginCategory | undefined {
    return this.categories.get(categoryId)
  }

  // 获取分类下的插件
  public getPluginsByCategory(categoryId: string): MarketplacePlugin[] {
    return this.getAllPlugins().filter((plugin) => plugin.categoryId === categoryId)
  }

  // 搜索插件
  public searchPlugins(query: string): MarketplacePlugin[] {
    query = query.toLowerCase()
    return this.getAllPlugins().filter(
      (plugin) =>
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  // 获取插件评论
  public getPluginReviews(pluginId: string): PluginReview[] {
    return this.reviews.get(pluginId) || []
  }

  // 添加插件评论
  public addPluginReview(review: Omit<PluginReview, "id" | "createdAt" | "helpful">): PluginReview {
    const plugin = this.plugins.get(review.pluginId)
    if (!plugin) {
      throw new Error(`插件 ${review.pluginId} 不存在`)
    }

    const newReview: PluginReview = {
      id: `review_${review.pluginId}_${Date.now()}`,
      pluginId: review.pluginId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: Date.now(),
      helpful: 0,
    }

    this.reviews.set(review.pluginId, [...(this.reviews.get(review.pluginId) || []), newReview])

    return newReview
  }

  // 更新插件评分 (简化版，实际应用中需要更复杂的逻辑)
  public updatePluginRating(pluginId: string, newRating: number): void {
    const plugin = this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    // 模拟更新评分和评论数
    plugin.stats.rating = newRating
    plugin.stats.reviewCount += 1

    this.plugins.set(pluginId, plugin)
  }

  // 用户安装插件
  public installPlugin(userId: string, pluginId: string): void {
    if (!this.plugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    const installedPlugins = this.userInstallations.get(userId) || []
    if (!installedPlugins.includes(pluginId)) {
      this.userInstallations.set(userId, [...installedPlugins, pluginId])
    }
  }

  // 用户卸载插件
  public uninstallPlugin(userId: string, pluginId: string): void {
    const installedPlugins = this.userInstallations.get(userId) || []
    const updatedPlugins = installedPlugins.filter((id) => id !== pluginId)
    this.userInstallations.set(userId, updatedPlugins)
  }

  // 获取用户安装的插件
  public getUserInstalledPlugins(userId: string): MarketplacePlugin[] {
    const installedPluginIds = this.userInstallations.get(userId) || []
    return installedPluginIds
      .map((pluginId) => this.getPlugin(pluginId))
      .filter((plugin): plugin is MarketplacePlugin => plugin !== undefined)
  }

  // 插件事件监听
  public addEventListener(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || []
    this.eventListeners.set(event, [...listeners, listener])
  }

  public removeEventListener(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || []
    const updatedListeners = listeners.filter((l) => l !== listener)
    this.eventListeners.set(event, updatedListeners)
  }

  private dispatchEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach((listener) => listener(data))
  }
}
