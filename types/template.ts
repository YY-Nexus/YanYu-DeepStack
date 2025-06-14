// 代码生成模板类型定义

export interface CodeTemplate {
  id: string
  name: string
  description: string
  prompt: string
  language?: string
  framework?: string
  category: TemplateCategory
  tags: string[]
  options: {
    temperature?: number
    maxTokens?: number
    includeComments?: boolean
    optimizeFor?: "readability" | "performance" | "security" | "balanced"
  }
  createdAt: Date
  updatedAt: Date
  userId?: string
  isPublic: boolean
  usageCount: number
  rating?: number
  thumbnail?: string
}

export type TemplateCategory =
  | "component"
  | "function"
  | "api"
  | "database"
  | "algorithm"
  | "utility"
  | "testing"
  | "documentation"
  | "other"

export interface TemplateFilter {
  search?: string
  category?: TemplateCategory
  language?: string
  framework?: string
  tags?: string[]
  sortBy?: "popular" | "recent" | "rating"
  isPublic?: boolean
}

// 模板创建请求
export interface CreateTemplateRequest {
  name: string
  description: string
  prompt: string
  language?: string
  framework?: string
  category: TemplateCategory
  tags: string[]
  options: {
    temperature?: number
    maxTokens?: number
    includeComments?: boolean
    optimizeFor?: "readability" | "performance" | "security" | "balanced"
  }
  isPublic: boolean
}

// 模板更新请求
export interface UpdateTemplateRequest {
  id: string
  name?: string
  description?: string
  prompt?: string
  language?: string
  framework?: string
  category?: TemplateCategory
  tags?: string[]
  options?: {
    temperature?: number
    maxTokens?: number
    includeComments?: boolean
    optimizeFor?: "readability" | "performance" | "security" | "balanced"
  }
  isPublic?: boolean
}
