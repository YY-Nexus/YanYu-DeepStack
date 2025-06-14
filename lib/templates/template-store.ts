"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  CodeTemplate,
  TemplateFilter,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateCategory,
} from "@/types/template"

// 模板存储状态接口
interface TemplateStoreState {
  // 状态
  templates: CodeTemplate[]
  isLoading: boolean
  error: string | null

  // 过滤和分页
  filter: TemplateFilter
  currentPage: number
  itemsPerPage: number

  // 操作方法
  fetchTemplates: () => Promise<void>
  createTemplate: (template: CreateTemplateRequest) => Promise<CodeTemplate>
  updateTemplate: (template: UpdateTemplateRequest) => Promise<CodeTemplate>
  deleteTemplate: (id: string) => Promise<boolean>
  incrementUsageCount: (id: string) => Promise<void>
  rateTemplate: (id: string, rating: number) => Promise<void>

  // 过滤和排序
  setFilter: (filter: Partial<TemplateFilter>) => void
  resetFilter: () => void
  setPage: (page: number) => void

  // 获取过滤后的模板
  getFilteredTemplates: () => CodeTemplate[]
  getTotalPages: () => number
}

// 创建模板存储
export const useTemplateStore = create<TemplateStoreState>()(
  persist(
    (set, get) => ({
      // 初始状态
      templates: [],
      isLoading: false,
      error: null,
      filter: {
        sortBy: "popular",
      },
      currentPage: 1,
      itemsPerPage: 12,

      // 获取模板列表
      fetchTemplates: async () => {
        set({ isLoading: true, error: null })

        try {
          // 在实际应用中，这里应该是API调用
          // 这里我们使用模拟数据
          const mockTemplates = generateMockTemplates()

          // 延迟模拟网络请求
          await new Promise((resolve) => setTimeout(resolve, 500))

          set({ templates: mockTemplates, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "获取模板失败",
            isLoading: false,
          })
        }
      },

      // 创建新模板
      createTemplate: async (templateRequest: CreateTemplateRequest) => {
        set({ isLoading: true, error: null })

        try {
          // 在实际应用中，这里应该是API调用
          // 这里我们创建一个新模板对象
          const newTemplate: CodeTemplate = {
            id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            ...templateRequest,
            createdAt: new Date(),
            updatedAt: new Date(),
            usageCount: 0,
          }

          // 延迟模拟网络请求
          await new Promise((resolve) => setTimeout(resolve, 300))

          // 更新状态
          set((state) => ({
            templates: [...state.templates, newTemplate],
            isLoading: false,
          }))

          return newTemplate
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "创建模板失败",
            isLoading: false,
          })
          throw error
        }
      },

      // 更新模板
      updateTemplate: async (templateUpdate: UpdateTemplateRequest) => {
        set({ isLoading: true, error: null })

        try {
          // 在实际应用中，这里应该是API调用
          // 这里我们更新本地状态
          let updatedTemplate: CodeTemplate | null = null

          set((state) => {
            const updatedTemplates = state.templates.map((template) => {
              if (template.id === templateUpdate.id) {
                updatedTemplate = {
                  ...template,
                  ...templateUpdate,
                  updatedAt: new Date(),
                }
                return updatedTemplate
              }
              return template
            })

            return {
              templates: updatedTemplates,
              isLoading: false,
            }
          })

          if (!updatedTemplate) {
            throw new Error("模板不存在")
          }

          return updatedTemplate
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "更新模板失败",
            isLoading: false,
          })
          throw error
        }
      },

      // 删除模板
      deleteTemplate: async (id: string) => {
        set({ isLoading: true, error: null })

        try {
          // 在实际应用中，这里应该是API调用
          // 这里我们从本地状态中删除
          set((state) => ({
            templates: state.templates.filter((template) => template.id !== id),
            isLoading: false,
          }))

          return true
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "删除模板失败",
            isLoading: false,
          })
          return false
        }
      },

      // 增加使用次数
      incrementUsageCount: async (id: string) => {
        try {
          set((state) => ({
            templates: state.templates.map((template) => {
              if (template.id === id) {
                return {
                  ...template,
                  usageCount: template.usageCount + 1,
                }
              }
              return template
            }),
          }))
        } catch (error) {
          console.error("增加使用次数失败:", error)
        }
      },

      // 评分模板
      rateTemplate: async (id: string, rating: number) => {
        try {
          set((state) => ({
            templates: state.templates.map((template) => {
              if (template.id === id) {
                return {
                  ...template,
                  rating,
                }
              }
              return template
            }),
          }))
        } catch (error) {
          console.error("评分失败:", error)
        }
      },

      // 设置过滤器
      setFilter: (filter: Partial<TemplateFilter>) => {
        set((state) => ({
          filter: { ...state.filter, ...filter },
          currentPage: 1, // 重置到第一页
        }))
      },

      // 重置过滤器
      resetFilter: () => {
        set({
          filter: {
            sortBy: "popular",
          },
          currentPage: 1,
        })
      },

      // 设置当前页
      setPage: (page: number) => {
        set({ currentPage: page })
      },

      // 获取过滤后的模板
      getFilteredTemplates: () => {
        const { templates, filter, currentPage, itemsPerPage } = get()

        // 应用过滤器
        let filtered = [...templates]

        // 搜索
        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          filtered = filtered.filter(
            (template) =>
              template.name.toLowerCase().includes(searchLower) ||
              template.description.toLowerCase().includes(searchLower) ||
              template.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
          )
        }

        // 类别过滤
        if (filter.category) {
          filtered = filtered.filter((template) => template.category === filter.category)
        }

        // 语言过滤
        if (filter.language) {
          filtered = filtered.filter((template) => template.language === filter.language)
        }

        // 框架过滤
        if (filter.framework) {
          filtered = filtered.filter((template) => template.framework === filter.framework)
        }

        // 标签过滤
        if (filter.tags && filter.tags.length > 0) {
          filtered = filtered.filter((template) => filter.tags!.some((tag) => template.tags.includes(tag)))
        }

        // 公开/私有过滤
        if (filter.isPublic !== undefined) {
          filtered = filtered.filter((template) => template.isPublic === filter.isPublic)
        }

        // 排序
        if (filter.sortBy) {
          switch (filter.sortBy) {
            case "popular":
              filtered.sort((a, b) => b.usageCount - a.usageCount)
              break
            case "recent":
              filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
              break
            case "rating":
              filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
              break
          }
        }

        // 分页
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage

        return filtered.slice(startIndex, endIndex)
      },

      // 获取总页数
      getTotalPages: () => {
        const { templates, filter, itemsPerPage } = get()

        // 应用过滤器计算总数
        let filtered = [...templates]

        // 搜索
        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          filtered = filtered.filter(
            (template) =>
              template.name.toLowerCase().includes(searchLower) ||
              template.description.toLowerCase().includes(searchLower) ||
              template.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
          )
        }

        // 类别过滤
        if (filter.category) {
          filtered = filtered.filter((template) => template.category === filter.category)
        }

        // 语言过滤
        if (filter.language) {
          filtered = filtered.filter((template) => template.language === filter.language)
        }

        // 框架过滤
        if (filter.framework) {
          filtered = filtered.filter((template) => template.framework === filter.framework)
        }

        // 标签过滤
        if (filter.tags && filter.tags.length > 0) {
          filtered = filtered.filter((template) => filter.tags!.some((tag) => template.tags.includes(tag)))
        }

        // 公开/私有过滤
        if (filter.isPublic !== undefined) {
          filtered = filtered.filter((template) => template.isPublic === filter.isPublic)
        }

        return Math.ceil(filtered.length / itemsPerPage)
      },
    }),
    {
      name: "yanyu-template-store",
      partialize: (state) => ({
        templates: state.templates,
      }),
    },
  ),
)

// 生成模拟模板数据
function generateMockTemplates(): CodeTemplate[] {
  const categories: TemplateCategory[] = [
    "component",
    "function",
    "api",
    "database",
    "algorithm",
    "utility",
    "testing",
    "documentation",
    "other",
  ]

  const languages = ["javascript", "typescript", "python", "java", "csharp", "go", "rust", "php"]

  const frameworks = ["react", "vue", "angular", "express", "next.js", "django", "flask", "spring", "dotnet"]

  const templates: CodeTemplate[] = []

  // React组件模板
  templates.push({
    id: "template_react_component",
    name: "React函数组件",
    description: "创建一个带TypeScript类型的React函数组件，包含基本状态管理和样式",
    prompt:
      "创建一个React函数组件，名为{{componentName}}，接收以下属性：{{props}}。组件应该包含状态管理和样式，并实现以下功能：{{functionality}}。请使用TypeScript和函数组件语法。",
    language: "typescript",
    framework: "react",
    category: "component",
    tags: ["react", "component", "typescript", "frontend"],
    options: {
      temperature: 0.7,
      maxTokens: 2048,
      includeComments: true,
      optimizeFor: "readability",
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    isPublic: true,
    usageCount: 128,
    rating: 4.8,
    thumbnail: "/placeholder.svg?height=200&width=200",
  })

  // API路由模板
  templates.push({
    id: "template_nextjs_api",
    name: "Next.js API路由",
    description: "创建一个带有错误处理和验证的Next.js API路由",
    prompt:
      "创建一个Next.js API路由，路径为{{path}}，实现{{method}}方法，处理以下数据：{{data}}。包含输入验证、错误处理和适当的HTTP状态码。",
    language: "typescript",
    framework: "next.js",
    category: "api",
    tags: ["next.js", "api", "backend", "typescript"],
    options: {
      temperature: 0.6,
      maxTokens: 2048,
      includeComments: true,
      optimizeFor: "security",
    },
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    isPublic: true,
    usageCount: 95,
    rating: 4.6,
    thumbnail: "/placeholder.svg?height=200&width=200",
  })

  // 数据库模型模板
  templates.push({
    id: "template_database_model",
    name: "数据库模型",
    description: "创建一个带有关系和验证的数据库模型",
    prompt:
      "创建一个{{databaseType}}数据库模型，表名为{{tableName}}，包含以下字段：{{fields}}。添加适当的索引、关系和验证规则。",
    language: "typescript",
    category: "database",
    tags: ["database", "model", "schema", "backend"],
    options: {
      temperature: 0.5,
      maxTokens: 1536,
      includeComments: true,
      optimizeFor: "performance",
    },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    isPublic: true,
    usageCount: 87,
    rating: 4.5,
    thumbnail: "/placeholder.svg?height=200&width=200",
  })

  // 算法模板
  templates.push({
    id: "template_algorithm",
    name: "算法实现",
    description: "实现指定的算法，带有详细注释和性能分析",
    prompt:
      "使用{{language}}实现{{algorithmName}}算法。提供详细的中文注释解释算法原理、时间复杂度和空间复杂度分析。包含示例用法和测试用例。",
    category: "algorithm",
    tags: ["algorithm", "data structure", "interview", "optimization"],
    options: {
      temperature: 0.4,
      maxTokens: 2048,
      includeComments: true,
      optimizeFor: "performance",
    },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isPublic: true,
    usageCount: 156,
    rating: 4.9,
    thumbnail: "/placeholder.svg?height=200&width=200",
  })

  // 测试模板
  templates.push({
    id: "template_unit_test",
    name: "单元测试",
    description: "为指定函数或组件创建单元测试",
    prompt:
      "为以下{{language}}代码创建单元测试：\n\n```{{language}}\n{{code}}\n```\n\n使用{{testFramework}}测试框架，覆盖所有主要功能和边缘情况。包含模拟和断言。",
    category: "testing",
    tags: ["testing", "unit test", "jest", "mocha", "pytest"],
    options: {
      temperature: 0.6,
      maxTokens: 2048,
      includeComments: true,
      optimizeFor: "readability",
    },
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isPublic: true,
    usageCount: 112,
    rating: 4.7,
    thumbnail: "/placeholder.svg?height=200&width=200",
  })

  // 生成更多随机模板
  for (let i = 0; i < 15; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const language = languages[Math.floor(Math.random() * languages.length)]
    const framework = Math.random() > 0.3 ? frameworks[Math.floor(Math.random() * frameworks.length)] : undefined

    const daysAgo = Math.floor(Math.random() * 180)
    const updateDaysAgo = Math.floor(Math.random() * daysAgo)

    templates.push({
      id: `template_${i}_${Date.now()}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} 模板 ${i + 1}`,
      description: `这是一个${category}类别的示例模板，用于${Math.random() > 0.5 ? "前端" : "后端"}开发`,
      prompt: `请使用${language}${framework ? `和${framework}` : ""}实现以下功能：{{functionality}}`,
      language,
      framework,
      category,
      tags: [category, language, framework || "", Math.random() > 0.5 ? "frontend" : "backend"],
      options: {
        temperature: Math.random() * 0.6 + 0.4,
        maxTokens: Math.floor(Math.random() * 1536) + 512,
        includeComments: Math.random() > 0.3,
        optimizeFor: Math.random() > 0.7 ? "performance" : Math.random() > 0.5 ? "readability" : "security",
      },
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - updateDaysAgo * 24 * 60 * 60 * 1000),
      isPublic: Math.random() > 0.2,
      usageCount: Math.floor(Math.random() * 100),
      rating: Math.random() * 2 + 3,
      thumbnail: `/placeholder.svg?height=200&width=200&query=${category} ${language}`,
    })
  }

  return templates
}

// 初始化函数
export function initializeTemplateStore() {
  const store = useTemplateStore.getState()

  // 如果模板为空，则获取模板
  if (store.templates.length === 0) {
    store.fetchTemplates()
  }

  return store
}
