/**
 * 输入验证工具
 * 提供统一的数据验证功能
 */

import { z } from 'zod'

// 通用验证规则
export const commonSchemas = {
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要8个字符'),
  url: z.string().url('请输入有效的URL'),
  apiKey: z.string().min(10, 'API密钥格式不正确'),
}

// 环境变量验证
export const envSchema = z.object({
  NEXT_PUBLIC_OLLAMA_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_APP_VERSION: z.string(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  // 可选配置
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),
  GOOGLE_API_KEY: z.string().startsWith('AIza').optional(),
})

// 用户注册验证
export const userRegistrationSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  name: z.string().min(2, '姓名至少需要2个字符'),
  terms: z.boolean().refine(val => val === true, '请同意服务条款'),
})

// API请求验证
export const apiRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  path: z.string(),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
})

// 项目创建验证
export const projectCreateSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(50, '项目名称不能超过50个字符'),
  description: z.string().max(500, '项目描述不能超过500个字符').optional(),
  type: z.enum(['web', 'mobile', 'desktop', 'api']),
  framework: z.string().optional(),
})

// 验证工具函数
export class Validator {
  static validateEnv() {
    try {
      return envSchema.parse(process.env)
    } catch (error) {
      console.error('环境变量验证失败:', error)
      throw new Error('环境变量配置不正确')
    }
  }

  static validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => e.message).join(', ')
        throw new Error(`输入验证失败: ${messages}`)
      }
      throw error
    }
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }
}
