"use client"

// 项目模板管理器 - 管理和使用项目模板
export class TemplateManager {
  private static instance: TemplateManager
  private templates = new Map<string, ProjectTemplate>()
  private categories = new Map<string, TemplateCategory>()

  private constructor() {
    this.initializeTemplates()
  }

  public static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager()
    }
    return TemplateManager.instance
  }

  // 初始化模板
  private initializeTemplates(): void {
    // 添加模板分类
    this.addCategory({
      id: "frontend",
      name: "前端应用",
      description: "用于构建Web前端应用的模板",
      icon: "monitor",
    })

    this.addCategory({
      id: "backend",
      name: "后端服务",
      description: "用于构建API和后端服务的模板",
      icon: "server",
    })

    this.addCategory({
      id: "fullstack",
      name: "全栈应用",
      description: "集成前后端的完整应用模板",
      icon: "layers",
    })

    this.addCategory({
      id: "mobile",
      name: "移动应用",
      description: "用于构建移动应用的模板",
      icon: "smartphone",
    })

    this.addCategory({
      id: "ai",
      name: "AI应用",
      description: "集成AI功能的应用模板",
      icon: "brain",
    })

    // 添加前端模板
    this.addTemplate({
      id: "next-app-router",
      name: "Next.js App Router",
      description: "使用App Router的Next.js应用模板",
      category: "frontend",
      tags: ["react", "nextjs", "typescript", "tailwind"],
      framework: "nextjs",
      version: "14.0.0",
      popularity: 95,
      gitRepo: "https://github.com/vercel/next.js/tree/canary/packages/create-next-app",
      previewImage: "/images/templates/next-app-router.png",
      features: ["App Router架构", "TypeScript支持", "Tailwind CSS集成", "ESLint配置", "路由系统"],
      files: [
        { path: "app/page.tsx", type: "component" },
        { path: "app/layout.tsx", type: "layout" },
        { path: "components/ui/button.tsx", type: "component" },
        { path: "tailwind.config.js", type: "config" },
      ],
      createdAt: new Date("2023-10-01"),
    })

    this.addTemplate({
      id: "react-vite",
      name: "React + Vite",
      description: "使用Vite构建工具的React应用模板",
      category: "frontend",
      tags: ["react", "vite", "typescript", "tailwind"],
      framework: "react",
      version: "18.2.0",
      popularity: 90,
      gitRepo: "https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts",
      previewImage: "/images/templates/react-vite.png",
      features: ["Vite快速构建", "React 18", "TypeScript支持", "热模块替换", "ESLint配置"],
      files: [
        { path: "src/App.tsx", type: "component" },
        { path: "src/main.tsx", type: "entry" },
        { path: "vite.config.ts", type: "config" },
      ],
      createdAt: new Date("2023-09-15"),
    })

    this.addTemplate({
      id: "vue-vite",
      name: "Vue 3 + Vite",
      description: "使用Vite构建工具的Vue 3应用模板",
      category: "frontend",
      tags: ["vue", "vite", "typescript", "pinia"],
      framework: "vue",
      version: "3.3.4",
      popularity: 85,
      gitRepo: "https://github.com/vitejs/vite/tree/main/packages/create-vite/template-vue-ts",
      previewImage: "/images/templates/vue-vite.png",
      features: ["Vue 3 Composition API", "Vite构建工具", "TypeScript支持", "Pinia状态管理", "Vue Router"],
      files: [
        { path: "src/App.vue", type: "component" },
        { path: "src/main.ts", type: "entry" },
        { path: "vite.config.ts", type: "config" },
      ],
      createdAt: new Date("2023-09-10"),
    })

    // 添加后端模板
    this.addTemplate({
      id: "express-typescript",
      name: "Express + TypeScript",
      description: "使用TypeScript的Express API服务模板",
      category: "backend",
      tags: ["nodejs", "express", "typescript", "rest-api"],
      framework: "express",
      version: "4.18.2",
      popularity: 88,
      gitRepo: "https://github.com/expressjs/express",
      previewImage: "/images/templates/express-typescript.png",
      features: ["Express路由系统", "TypeScript支持", "中间件架构", "错误处理", "API文档生成"],
      files: [
        { path: "src/index.ts", type: "entry" },
        { path: "src/routes/index.ts", type: "route" },
        { path: "src/controllers/user.controller.ts", type: "controller" },
      ],
      createdAt: new Date("2023-08-20"),
    })

    this.addTemplate({
      id: "nestjs-api",
      name: "NestJS API",
      description: "基于NestJS框架的后端API服务模板",
      category: "backend",
      tags: ["nodejs", "nestjs", "typescript", "rest-api"],
      framework: "nestjs",
      version: "10.0.0",
      popularity: 92,
      gitRepo: "https://github.com/nestjs/nest",
      previewImage: "/images/templates/nestjs-api.png",
      features: ["模块化架构", "依赖注入", "TypeScript支持", "OpenAPI/Swagger集成", "单元测试配置"],
      files: [
        { path: "src/main.ts", type: "entry" },
        { path: "src/app.module.ts", type: "module" },
        { path: "src/users/users.controller.ts", type: "controller" },
        { path: "src/users/users.service.ts", type: "service" },
      ],
      createdAt: new Date("2023-08-15"),
    })

    // 添加全栈模板
    this.addTemplate({
      id: "next-fullstack",
      name: "Next.js全栈应用",
      description: "使用Next.js构建的全栈应用模板，包含API路由和数据库集成",
      category: "fullstack",
      tags: ["react", "nextjs", "typescript", "prisma", "tailwind"],
      framework: "nextjs",
      version: "14.0.0",
      popularity: 94,
      gitRepo: "https://github.com/vercel/next.js",
      previewImage: "/images/templates/next-fullstack.png",
      features: ["App Router架构", "Server Actions", "Prisma ORM", "NextAuth认证", "Tailwind CSS"],
      files: [
        { path: "app/page.tsx", type: "component" },
        { path: "app/api/users/route.ts", type: "api" },
        { path: "lib/db.ts", type: "utility" },
        { path: "prisma/schema.prisma", type: "config" },
      ],
      createdAt: new Date("2023-10-05"),
    })

    this.addTemplate({
      id: "t3-stack",
      name: "T3 Stack",
      description: "使用T3 Stack (Next.js, tRPC, Prisma, Tailwind)的全栈应用模板",
      category: "fullstack",
      tags: ["react", "nextjs", "trpc", "prisma", "tailwind"],
      framework: "nextjs",
      version: "14.0.0",
      popularity: 93,
      gitRepo: "https://github.com/t3-oss/create-t3-app",
      previewImage: "/images/templates/t3-stack.png",
      features: ["tRPC类型安全API", "Prisma ORM", "NextAuth认证", "Tailwind CSS", "Zod验证"],
      files: [
        { path: "src/pages/index.tsx", type: "component" },
        { path: "src/server/api/routers/user.ts", type: "api" },
        { path: "src/server/db.ts", type: "utility" },
        { path: "prisma/schema.prisma", type: "config" },
      ],
      createdAt: new Date("2023-09-25"),
    })

    // 添加移动应用模板
    this.addTemplate({
      id: "react-native",
      name: "React Native",
      description: "使用React Native构建的移动应用模板",
      category: "mobile",
      tags: ["react-native", "typescript", "expo"],
      framework: "react-native",
      version: "0.72.0",
      popularity: 89,
      gitRepo: "https://github.com/expo/expo",
      previewImage: "/images/templates/react-native.png",
      features: ["Expo工具链", "TypeScript支持", "React Navigation", "原生UI组件", "离线支持"],
      files: [
        { path: "App.tsx", type: "component" },
        { path: "src/screens/HomeScreen.tsx", type: "component" },
        { path: "src/navigation/index.tsx", type: "utility" },
      ],
      createdAt: new Date("2023-08-10"),
    })

    // 添加AI应用模板
    this.addTemplate({
      id: "next-ai",
      name: "Next.js AI应用",
      description: "集成AI功能的Next.js应用模板",
      category: "ai",
      tags: ["react", "nextjs", "ai", "typescript", "tailwind"],
      framework: "nextjs",
      version: "14.0.0",
      popularity: 96,
      gitRepo: "https://github.com/vercel/ai",
      previewImage: "/images/templates/next-ai.png",
      features: ["AI SDK集成", "流式响应", "多模型支持", "聊天界面", "提示词工程"],
      files: [
        { path: "app/page.tsx", type: "component" },
        { path: "app/api/chat/route.ts", type: "api" },
        { path: "components/chat.tsx", type: "component" },
        { path: "lib/ai.ts", type: "utility" },
      ],
      createdAt: new Date("2023-10-10"),
    })

    this.addTemplate({
      id: "ollama-app",
      name: "Ollama应用",
      description: "集成Ollama本地模型的应用模板",
      category: "ai",
      tags: ["react", "nextjs", "ollama", "ai", "typescript"],
      framework: "nextjs",
      version: "14.0.0",
      popularity: 91,
      gitRepo: "https://github.com/ollama/ollama-js",
      previewImage: "/images/templates/ollama-app.png",
      features: ["Ollama API集成", "本地模型推理", "聊天界面", "代码生成", "多模型切换"],
      files: [
        { path: "app/page.tsx", type: "component" },
        { path: "app/api/ollama/route.ts", type: "api" },
        { path: "components/chat-interface.tsx", type: "component" },
        { path: "lib/ollama-client.ts", type: "utility" },
      ],
      createdAt: new Date("2023-10-15"),
    })
  }

  // 添加模板分类
  public addCategory(category: TemplateCategory): void {
    this.categories.set(category.id, category)
  }

  // 添加模板
  public addTemplate(template: ProjectTemplate): void {
    this.templates.set(template.id, template)
  }

  // 获取所有模板
  public getAllTemplates(): ProjectTemplate[] {
    return Array.from(this.templates.values())
  }

  // 获取所有分类
  public getAllCategories(): TemplateCategory[] {
    return Array.from(this.categories.values())
  }

  // 获取特定分类的模板
  public getTemplatesByCategory(categoryId: string): ProjectTemplate[] {
    return this.getAllTemplates().filter((template) => template.category === categoryId)
  }

  // 获取特定标签的模板
  public getTemplatesByTag(tag: string): ProjectTemplate[] {
    return this.getAllTemplates().filter((template) => template.tags.includes(tag))
  }

  // 获取特定框架的模板
  public getTemplatesByFramework(framework: string): ProjectTemplate[] {
    return this.getAllTemplates().filter((template) => template.framework === framework)
  }

  // 获取热门模板
  public getPopularTemplates(limit = 5): ProjectTemplate[] {
    return this.getAllTemplates()
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)
  }

  // 获取最新模板
  public getNewestTemplates(limit = 5): ProjectTemplate[] {
    return this.getAllTemplates()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }

  // 搜索模板
  public searchTemplates(query: string): ProjectTemplate[] {
    const lowercaseQuery = query.toLowerCase()
    return this.getAllTemplates().filter(
      (template) =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
        template.framework.toLowerCase().includes(lowercaseQuery),
    )
  }

  // 获取模板详情
  public getTemplate(templateId: string): ProjectTemplate | undefined {
    return this.templates.get(templateId)
  }

  // 获取分类详情
  public getCategory(categoryId: string): TemplateCategory | undefined {
    return this.categories.get(categoryId)
  }

  // 获取模板统计信息
  public getTemplateStats(): TemplateStats {
    const templates = this.getAllTemplates()
    const categories = this.getAllCategories()

    const frameworkCounts: Record<string, number> = {}
    templates.forEach((template) => {
      frameworkCounts[template.framework] = (frameworkCounts[template.framework] || 0) + 1
    })

    const tagCounts: Record<string, number> = {}
    templates.forEach((template) => {
      template.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return {
      totalTemplates: templates.length,
      totalCategories: categories.length,
      templatesByCategory: categories.reduce(
        (acc, category) => {
          acc[category.id] = this.getTemplatesByCategory(category.id).length
          return acc
        },
        {} as Record<string, number>,
      ),
      templatesByFramework: frameworkCounts,
      popularTags: Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count })),
    }
  }
}

// 类型定义
export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  framework: string
  version: string
  popularity: number
  gitRepo: string
  previewImage: string
  features: string[]
  files: TemplateFile[]
  createdAt: Date
  updatedAt?: Date
}

export interface TemplateFile {
  path: string
  type: "component" | "api" | "utility" | "config" | "entry" | "layout" | "route" | "controller" | "service" | "module"
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  icon: string
}

export interface TemplateStats {
  totalTemplates: number
  totalCategories: number
  templatesByCategory: Record<string, number>
  templatesByFramework: Record<string, number>
  popularTags: Array<{ tag: string; count: number }>
}

// 导出模板管理器实例
export const templateManager = TemplateManager.getInstance()
