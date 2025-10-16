"use client"

import { ConfigService } from '../config/config-service';

// 定义API密钥类型
interface APIKey {
  id: string
  name: string
  key: string
  userId: string
  permissions: string[]
  rateLimit: RateLimit
  status: "active" | "disabled"
  lastUsed: number | null
  usageCount: number
  createdAt: number
  expiresAt?: number
}

// 定义API密钥验证结果类型
interface APIKeyValidation {
  valid: boolean
  apiKey?: APIKey
  reason?: string
  rateLimit?: RateLimitResult
  retryAfter?: number
}

// 定义API请求类型
interface APIRequest {
  apiKey: string
  endpoint: string
  method: string
  body: any
  query: any
  headers: any
}

// 定义API响应类型
interface APIResponse {
  success: boolean
  data?: any
  error?: string
  statusCode: number
}

// 定义创建API密钥请求类型
interface CreateAPIKeyRequest {
  name: string
  userId: string
  permissions?: string[]
  rateLimit?: RateLimit
  expiresAt?: number
}

// 定义速率限制类型
interface RateLimit {
  requests: number
  window: number
}

// 定义速率限制结果类型
interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
  retryAfter?: number
}

// 定义第三方集成类型
interface Integration {
  id: string
  name: string
  type: string
  description: string
  config: any
  endpoints: APIEndpoint[]
  status: "active" | "inactive"
  createdAt: number
  updatedAt: number
}

// 定义API端点类型
interface APIEndpoint {
  method: string
  path: string
  description: string
}

// 定义Webhook类型
interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: "active" | "inactive"
  createdAt: number
  updatedAt: number
}

// 定义API配置类型
interface APIConfig {
  enableOpenAPI: boolean
  enableWebhooks: boolean
  defaultRateLimit: RateLimit
  enableAnalytics: boolean
  enableCaching: boolean
  securityLevel: string
}

// 速率限制器
class RateLimiter {
  private limits = new Map<string, { count: number; resetTime: number }>()

  public checkLimit(key: string, rateLimit: RateLimit): RateLimitResult {
    const now = Date.now()
    let limit = this.limits.get(key)

    if (!limit || limit.resetTime <= now) {
      limit = { count: 0, resetTime: now + rateLimit.window }
      this.limits.set(key, limit)
    }

    if (limit.count >= rateLimit.requests) {
      const retryAfter = Math.max(0, limit.resetTime - now)
      return {
        allowed: false,
        remaining: rateLimit.requests - limit.count,
        reset: limit.resetTime,
        retryAfter: Math.ceil(retryAfter / 1000), // in seconds
      }
    }

    limit.count++
    this.limits.set(key, limit)

    return {
      allowed: true,
      remaining: rateLimit.requests - limit.count,
      reset: limit.resetTime,
    }
  }
}

// API分析
class APIAnalytics {
  public recordRequest(request: APIRequest, apiKey: APIKey): void {
    // TODO: 实现API请求记录和分析
    console.log(`API请求记录: ${request.endpoint} - ${apiKey.id}`)
  }
}

// API管理器 - 管理开放API和第三方集成
export class APIManager {
  private static instance: APIManager
  private apiKeys = new Map<string, APIKey>()
  private integrations = new Map<string, Integration>()
  private webhooks = new Map<string, Webhook>()
  private rateLimiter = new RateLimiter()
  private analytics = new APIAnalytics()
  private config: APIConfig

  private constructor() {
    this.config = {
      enableOpenAPI: true,
      enableWebhooks: true,
      defaultRateLimit: {
        requests: 1000,
        window: 60 * 60 * 1000, // 1小时
      },
      enableAnalytics: true,
      enableCaching: true,
      securityLevel: "strict",
    }

    this.initializeIntegrations()
  }

  public static getInstance(): APIManager {
    if (!APIManager.instance) {
      APIManager.instance = new APIManager()
    }
    return APIManager.instance
  }

  // 初始化第三方集成
  private initializeIntegrations(): void {
    // GitHub集成
    this.integrations.set("github", {
      id: "github",
      name: "GitHub",
      type: "version-control",
      description: "GitHub代码仓库集成",
      config: {
        clientId: ConfigService.getInstance().get('GITHUB_CLIENT_ID') || "",
        clientSecret: ConfigService.getInstance().get('GITHUB_CLIENT_SECRET') || "",
        scopes: ["repo", "user", "workflow"],
        webhookUrl: `${ConfigService.getInstance().getBaseUrl()}/api/webhooks/github`,
      },
      endpoints: [
        {
          method: "GET",
          path: "/repos",
          description: "获取用户仓库列表",
        },
        {
          method: "POST",
          path: "/repos/{owner}/{repo}/contents/{path}",
          description: "创建或更新文件",
        },
        {
          method: "POST",
          path: "/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
          description: "触发工作流",
        },
      ],
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Slack集成
    this.integrations.set("slack", {
      id: "slack",
      name: "Slack",
      type: "communication",
      description: "Slack团队协作集成",
      config: {
        clientId: ConfigService.getInstance().get('SLACK_CLIENT_ID') || "",
        clientSecret: ConfigService.getInstance().get('SLACK_CLIENT_SECRET') || "",
        scopes: ["chat:write", "channels:read", "users:read"],
        webhookUrl: `${ConfigService.getInstance().getBaseUrl()}/api/webhooks/slack`,
      },
      endpoints: [
        {
          method: "POST",
          path: "/chat.postMessage",
          description: "发送消息",
        },
        {
          method: "GET",
          path: "/conversations.list",
          description: "获取频道列表",
        },
      ],
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Jira集成
    this.integrations.set("jira", {
      id: "jira",
      name: "Jira",
      type: "project-management",
      description: "Jira项目管理集成",
      config: {
        baseUrl: "",
        username: "",
        apiToken: "",
        webhookUrl: `${ConfigService.getInstance().getBaseUrl()}/api/webhooks/jira`,
      },
      endpoints: [
        {
          method: "GET",
          path: "/rest/api/3/project",
          description: "获取项目列表",
        },
        {
          method: "POST",
          path: "/rest/api/3/issue",
          description: "创建问题",
        },
        {
          method: "PUT",
          path: "/rest/api/3/issue/{issueIdOrKey}",
          description: "更新问题",
        },
      ],
      status: "inactive",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Docker Hub集成
    this.integrations.set("docker", {
      id: "docker",
      name: "Docker Hub",
      type: "deployment",
      description: "Docker容器镜像管理",
      config: {
        username: "",
        accessToken: "",
        namespace: "",
      },
      endpoints: [
        {
          method: "GET",
          path: "/v2/repositories/{namespace}",
          description: "获取仓库列表",
        },
        {
          method: "POST",
          path: "/v2/repositories/{namespace}/{repository}/builds",
          description: "触发构建",
        },
      ],
      status: "inactive",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // AWS集成
    this.integrations.set("aws", {
      id: "aws",
      name: "Amazon Web Services",
      type: "cloud-platform",
      description: "AWS云服务集成",
      config: {
        accessKeyId: "",
        secretAccessKey: "",
        region: "us-east-1",
        services: ["s3", "lambda", "ec2", "rds"],
      },
      endpoints: [
        {
          method: "GET",
          path: "/s3/buckets",
          description: "获取S3存储桶列表",
        },
        {
          method: "POST",
          path: "/lambda/functions",
          description: "创建Lambda函数",
        },
      ],
      status: "inactive",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }

  // 创建API密钥
  public createAPIKey(request: CreateAPIKeyRequest): APIKey {
    const apiKey: APIKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: request.name,
      key: this.generateAPIKey(),
      userId: request.userId,
      permissions: request.permissions || ["read"],
      rateLimit: request.rateLimit || this.config.defaultRateLimit,
      status: "active",
      lastUsed: null,
      usageCount: 0,
      createdAt: Date.now(),
      expiresAt: request.expiresAt,
    }

    this.apiKeys.set(apiKey.id, apiKey)
    return apiKey
  }

  // 验证API密钥
  public validateAPIKey(key: string): APIKeyValidation {
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.key === key) {
        if (apiKey.status !== "active") {
          return { valid: false, reason: "API密钥已禁用" }
        }

        if (apiKey.expiresAt && Date.now() > apiKey.expiresAt) {
          return { valid: false, reason: "API密钥已过期" }
        }

        // 检查速率限制
        const rateLimitResult = this.rateLimiter.checkLimit(apiKey.id, apiKey.rateLimit)
        if (!rateLimitResult.allowed) {
          return {
            valid: false,
            reason: "超出速率限制",
            retryAfter: rateLimitResult.retryAfter,
          }
        }

        // 更新使用统计
        apiKey.lastUsed = Date.now()
        apiKey.usageCount++

        return {
          valid: true,
          apiKey,
          rateLimit: rateLimitResult,
        }
      }
    }

    return { valid: false, reason: "无效的API密钥" }
  }

  // 处理API请求
  public async handleAPIRequest(request: APIRequest): Promise<APIResponse> {
    try {
      // 验证API密钥
      const validation = this.validateAPIKey(request.apiKey)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.reason,
          statusCode: 401,
        }
      }

      // 检查权限
      if (!this.hasPermission(validation.apiKey!, request.endpoint, request.method)) {
        return {
          success: false,
          error: "权限不足",
          statusCode: 403,
        }
      }

      // 记录请求
      this.analytics.recordRequest(request, validation.apiKey!)

      return {
        success: true,
        data: "请求成功",
        statusCode: 200,
      }
    } catch (error: any) {
      console.error("API请求处理失败:", error)
      return {
        success: false,
        error: error.message || "服务器错误",
        statusCode: 500,
      }
    }
  }

  // 检查用户权限
  private hasPermission(apiKey: APIKey, endpoint: string, method: string): boolean {
    // TODO: 实现更细粒度的权限控制
    return apiKey.permissions.includes("read") || apiKey.permissions.includes("write")
  }

  // 生成API密钥
  private generateAPIKey(): string {
    return `api_key_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`
  }

  // 获取API密钥
  public getAPIKey(keyId: string): APIKey | undefined {
    return this.apiKeys.get(keyId)
  }

  // 更新API密钥
  public updateAPIKey(keyId: string, updates: Partial<APIKey>): APIKey | undefined {
    const apiKey = this.apiKeys.get(keyId)
    if (apiKey) {
      Object.assign(apiKey, updates)
      this.apiKeys.set(keyId, apiKey)
      return apiKey
    }
    return undefined
  }

  // 停用API密钥
  public disableAPIKey(keyId: string): boolean {
    const apiKey = this.apiKeys.get(keyId)
    if (apiKey) {
      apiKey.status = "disabled"
      this.apiKeys.set(keyId, apiKey)
      return true
    }
    return false
  }

  // 删除API密钥
  public deleteAPIKey(keyId: string): boolean {
    return this.apiKeys.delete(keyId)
  }

  // 获取集成
  public getIntegration(integrationId: string): Integration | undefined {
    return this.integrations.get(integrationId)
  }

  // 获取所有集成
  public getAllIntegrations(): Integration[] {
    return Array.from(this.integrations.values())
  }

  // 启用集成
  public enableIntegration(integrationId: string): boolean {
    const integration = this.integrations.get(integrationId)
    if (integration) {
      integration.status = "active"
      this.integrations.set(integrationId, integration)
      return true
    }
    return false
  }

  // 停用集成
  public disableIntegration(integrationId: string): boolean {
    const integration = this.integrations.get(integrationId)
    if (integration) {
      integration.status = "inactive"
      this.integrations.set(integrationId, integration)
      return true
    }
    return false
  }

  // 创建Webhook
  public createWebhook(webhook: Webhook): Webhook {
    webhook.id = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    webhook.createdAt = Date.now()
    webhook.updatedAt = Date.now()
    this.webhooks.set(webhook.id, webhook)
    return webhook
  }

  // 获取Webhook
  public getWebhook(webhookId: string): Webhook | undefined {
    return this.webhooks.get(webhookId)
  }

  // 更新Webhook
  public updateWebhook(webhookId: string, updates: Partial<Webhook>): Webhook | undefined {
    const webhook = this.webhooks.get(webhookId)
    if (webhook) {
      Object.assign(webhook, updates)
      webhook.updatedAt = Date.now()
      this.webhooks.set(webhookId, webhook)
      return webhook
    }
    return undefined
  }

  // 删除Webhook
  public deleteWebhook(webhookId: string): boolean {
    return this.webhooks.delete(webhookId)
  }
}
