"use client"

import { serviceRegistry } from "./service-registry"

// API网关 - 统一入口和路由管理
export class APIGateway {
  private static instance: APIGateway
  private routes = new Map<string, RouteConfig>()
  private middleware: Middleware[] = []
  private circuitBreakers = new Map<string, CircuitBreaker>()
  private rateLimiters = new Map<string, RateLimiter>()
  private config: GatewayConfig

  private constructor() {
    this.config = {
      enableRateLimit: true,
      enableCircuitBreaker: true,
      enableCaching: true,
      enableTracing: true,
      enableMetrics: true,
      defaultTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    }

    this.initializeDefaultRoutes()
    this.initializeMiddleware()
  }

  public static getInstance(): APIGateway {
    if (!APIGateway.instance) {
      APIGateway.instance = new APIGateway()
    }
    return APIGateway.instance
  }

  // 初始化默认路由
  private initializeDefaultRoutes(): void {
    // AI服务路由
    this.addRoute({
      path: "/api/ai/*",
      serviceName: "ai-service",
      methods: ["GET", "POST"],
      stripPath: true,
      preserveHost: false,
      timeout: 60000,
      retries: 2,
      rateLimit: {
        requests: 100,
        window: 60000,
      },
      circuitBreaker: {
        failureThreshold: 5,
        timeout: 30000,
        resetTimeout: 60000,
      },
    })

    // 项目管理服务路由
    this.addRoute({
      path: "/api/projects/*",
      serviceName: "project-service",
      methods: ["GET", "POST", "PUT", "DELETE"],
      stripPath: true,
      preserveHost: false,
      timeout: 30000,
      retries: 3,
      rateLimit: {
        requests: 200,
        window: 60000,
      },
    })

    // 用户认证服务路由
    this.addRoute({
      path: "/api/auth/*",
      serviceName: "auth-service",
      methods: ["GET", "POST"],
      stripPath: true,
      preserveHost: false,
      timeout: 15000,
      retries: 2,
      rateLimit: {
        requests: 50,
        window: 60000,
      },
    })

    // 文件服务路由
    this.addRoute({
      path: "/api/files/*",
      serviceName: "file-service",
      methods: ["GET", "POST", "PUT", "DELETE"],
      stripPath: true,
      preserveHost: false,
      timeout: 120000, // 文件上传可能需要更长时间
      retries: 1,
      rateLimit: {
        requests: 30,
        window: 60000,
      },
    })

    // 部署服务路由
    this.addRoute({
      path: "/api/deploy/*",
      serviceName: "deployment-service",
      methods: ["GET", "POST"],
      stripPath: true,
      preserveHost: false,
      timeout: 300000, // 部署可能需要很长时间
      retries: 1,
      rateLimit: {
        requests: 10,
        window: 60000,
      },
    })
  }

  // 初始化中间件
  private initializeMiddleware(): void {
    // 请求日志中间件
    this.addMiddleware({
      name: "request-logger",
      priority: 1,
      execute: async (context: RequestContext, next: NextFunction) => {
        const startTime = Date.now()
        console.log(`[${new Date().toISOString()}] ${context.method} ${context.path}`)

        await next()

        const duration = Date.now() - startTime
        console.log(
          `[${new Date().toISOString()}] ${context.method} ${context.path} - ${context.response?.status} (${duration}ms)`,
        )
      },
    })

    // 认证中间件
    this.addMiddleware({
      name: "authentication",
      priority: 2,
      execute: async (context: RequestContext, next: NextFunction) => {
        // 跳过认证的路径
        const skipAuthPaths = ["/api/auth/login", "/api/auth/register", "/api/health"]
        if (skipAuthPaths.some((path) => context.path.startsWith(path))) {
          await next()
          return
        }

        const authHeader = context.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          context.response = {
            status: 401,
            body: { error: "未提供认证令牌" },
            headers: {},
          }
          return
        }

        // 验证JWT令牌（简化实现）
        const token = authHeader.substring(7)
        const isValid = await this.validateToken(token)
        if (!isValid) {
          context.response = {
            status: 401,
            body: { error: "无效的认证令牌" },
            headers: {},
          }
          return
        }

        context.user = await this.getUserFromToken(token)
        await next()
      },
    })

    // CORS中间件
    this.addMiddleware({
      name: "cors",
      priority: 3,
      execute: async (context: RequestContext, next: NextFunction) => {
        // 设置CORS头
        const corsHeaders = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        }

        if (context.method === "OPTIONS") {
          context.response = {
            status: 200,
            body: "",
            headers: corsHeaders,
          }
          return
        }

        await next()

        if (context.response) {
          context.response.headers = { ...context.response.headers, ...corsHeaders }
        }
      },
    })

    // 速率限制中间件
    this.addMiddleware({
      name: "rate-limit",
      priority: 4,
      execute: async (context: RequestContext, next: NextFunction) => {
        if (!this.config.enableRateLimit) {
          await next()
          return
        }

        const route = this.findRoute(context.path, context.method)
        if (!route?.rateLimit) {
          await next()
          return
        }

        const clientId = this.getClientId(context)
        const rateLimiter = this.getRateLimiter(route.path, route.rateLimit)
        const result = rateLimiter.checkLimit(clientId)

        if (!result.allowed) {
          context.response = {
            status: 429,
            body: { error: "请求频率过高", retryAfter: result.retryAfter },
            headers: {
              "X-RateLimit-Limit": route.rateLimit.requests.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.reset.toString(),
            },
          }
          return
        }

        await next()

        if (context.response) {
          context.response.headers = {
            ...context.response.headers,
            "X-RateLimit-Limit": route.rateLimit.requests.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
          }
        }
      },
    })
  }

  // 处理请求
  public async handleRequest(request: GatewayRequest): Promise<GatewayResponse> {
    const context: RequestContext = {
      method: request.method,
      path: request.path,
      headers: request.headers,
      body: request.body,
      query: request.query,
      startTime: Date.now(),
    }

    try {
      // 执行中间件链
      await this.executeMiddleware(context)

      // 如果中间件已经设置了响应，直接返回
      if (context.response) {
        return context.response
      }

      // 路由到后端服务
      const response = await this.routeToService(context)
      return response
    } catch (error) {
      console.error("网关请求处理失败:", error)
      return {
        status: 500,
        body: { error: "内部服务器错误" },
        headers: {},
      }
    }
  }

  // 执行中间件链
  private async executeMiddleware(context: RequestContext): Promise<void> {
    const sortedMiddleware = [...this.middleware].sort((a, b) => a.priority - b.priority)
    let index = 0

    const next: NextFunction = async () => {
      if (index < sortedMiddleware.length) {
        const middleware = sortedMiddleware[index++]
        await middleware.execute(context, next)
      }
    }

    await next()
  }

  // 路由到后端服务
  private async routeToService(context: RequestContext): Promise<GatewayResponse> {
    const route = this.findRoute(context.path, context.method)
    if (!route) {
      return {
        status: 404,
        body: { error: "路由未找到" },
        headers: {},
      }
    }

    // 服务发现
    const serviceInstance = serviceRegistry.discoverService(route.serviceName)
    if (!serviceInstance) {
      return {
        status: 503,
        body: { error: "服务不可用" },
        headers: {},
      }
    }

    // 熔断器检查
    if (this.config.enableCircuitBreaker && route.circuitBreaker) {
      const circuitBreaker = this.getCircuitBreaker(route.serviceName, route.circuitBreaker)
      if (circuitBreaker.isOpen()) {
        return {
          status: 503,
          body: { error: "服务熔断中" },
          headers: {},
        }
      }
    }

    // 构建目标URL
    const targetPath = route.stripPath ? context.path.replace(route.path.replace("/*", ""), "") : context.path
    const targetUrl = `${serviceInstance.protocol}://${serviceInstance.host}:${serviceInstance.port}${targetPath}`

    try {
      // 发送请求到后端服务
      const response = await this.forwardRequest(targetUrl, context, route)

      // 记录成功
      if (route.circuitBreaker) {
        const circuitBreaker = this.getCircuitBreaker(route.serviceName, route.circuitBreaker)
        circuitBreaker.recordSuccess()
      }

      return response
    } catch (error) {
      // 记录失败
      if (route.circuitBreaker) {
        const circuitBreaker = this.getCircuitBreaker(route.serviceName, route.circuitBreaker)
        circuitBreaker.recordFailure()
      }

      console.error(`转发请求失败: ${targetUrl}`, error)
      return {
        status: 502,
        body: { error: "网关错误" },
        headers: {},
      }
    }
  }

  // 转发请求
  private async forwardRequest(
    targetUrl: string,
    context: RequestContext,
    route: RouteConfig,
  ): Promise<GatewayResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), route.timeout || this.config.defaultTimeout)

    try {
      const response = await fetch(targetUrl, {
        method: context.method,
        headers: {
          ...context.headers,
          "X-Forwarded-For": context.headers["x-forwarded-for"] || "127.0.0.1",
          "X-Forwarded-Proto": "https",
          "X-Forwarded-Host": context.headers.host || "localhost",
        },
        body: context.method !== "GET" && context.method !== "HEAD" ? JSON.stringify(context.body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const responseBody = await response.text()
      let parsedBody: any

      try {
        parsedBody = JSON.parse(responseBody)
      } catch {
        parsedBody = responseBody
      }

      return {
        status: response.status,
        body: parsedBody,
        headers: Object.fromEntries(response.headers.entries()),
      }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  // 查找路由
  private findRoute(path: string, method: string): RouteConfig | null {
    for (const route of this.routes.values()) {
      if (route.methods.includes(method) && this.matchPath(path, route.path)) {
        return route
      }
    }
    return null
  }

  // 路径匹配
  private matchPath(requestPath: string, routePath: string): boolean {
    if (routePath.endsWith("/*")) {
      const prefix = routePath.slice(0, -2)
      return requestPath.startsWith(prefix)
    }
    return requestPath === routePath
  }

  // 获取客户端ID
  private getClientId(context: RequestContext): string {
    return context.headers["x-forwarded-for"] || context.headers["x-real-ip"] || "127.0.0.1"
  }

  // 获取速率限制器
  private getRateLimiter(routePath: string, config: RateLimitConfig): RateLimiter {
    if (!this.rateLimiters.has(routePath)) {
      this.rateLimiters.set(routePath, new RateLimiter(config))
    }
    return this.rateLimiters.get(routePath)!
  }

  // 获取熔断器
  private getCircuitBreaker(serviceName: string, config: CircuitBreakerConfig): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker(config))
    }
    return this.circuitBreakers.get(serviceName)!
  }

  // 验证令牌
  private async validateToken(token: string): Promise<boolean> {
    // 简化实现，实际应该验证JWT签名
    return token.length > 10
  }

  // 从令牌获取用户信息
  private async getUserFromToken(token: string): Promise<any> {
    // 简化实现，实际应该解析JWT载荷
    return { id: "user123", email: "user@example.com" }
  }

  // 添加路由
  public addRoute(route: RouteConfig): void {
    this.routes.set(route.path, route)
  }

  // 删除路由
  public removeRoute(path: string): boolean {
    return this.routes.delete(path)
  }

  // 添加中间件
  public addMiddleware(middleware: Middleware): void {
    this.middleware.push(middleware)
  }

  // 获取网关统计信息
  public getGatewayStats(): GatewayStats {
    return {
      totalRoutes: this.routes.size,
      totalMiddleware: this.middleware.length,
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([name, cb]) => ({
        name,
        state: cb.getState(),
        failureCount: cb.getFailureCount(),
        lastFailureTime: cb.getLastFailureTime(),
      })),
      rateLimiters: Array.from(this.rateLimiters.entries()).map(([path, rl]) => ({
        path,
        currentRequests: rl.getCurrentRequests(),
        totalRequests: rl.getTotalRequests(),
      })),
    }
  }
}

// 速率限制器
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()
  private config: RateLimitConfig
  private totalRequests = 0

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  public checkLimit(clientId: string): { allowed: boolean; remaining: number; reset: number; retryAfter?: number } {
    const now = Date.now()
    let clientData = this.requests.get(clientId)

    if (!clientData || clientData.resetTime <= now) {
      clientData = { count: 0, resetTime: now + this.config.window }
      this.requests.set(clientId, clientData)
    }

    if (clientData.count >= this.config.requests) {
      const retryAfter = Math.max(0, clientData.resetTime - now)
      return {
        allowed: false,
        remaining: 0,
        reset: clientData.resetTime,
        retryAfter: Math.ceil(retryAfter / 1000),
      }
    }

    clientData.count++
    this.totalRequests++
    this.requests.set(clientId, clientData)

    return {
      allowed: true,
      remaining: this.config.requests - clientData.count,
      reset: clientData.resetTime,
    }
  }

  public getCurrentRequests(): number {
    const now = Date.now()
    let current = 0
    for (const data of this.requests.values()) {
      if (data.resetTime > now) {
        current += data.count
      }
    }
    return current
  }

  public getTotalRequests(): number {
    return this.totalRequests
  }
}

// 熔断器
class CircuitBreaker {
  private state: "closed" | "open" | "half-open" = "closed"
  private failureCount = 0
  private lastFailureTime = 0
  private config: CircuitBreakerConfig

  constructor(config: CircuitBreakerConfig) {
    this.config = config
  }

  public isOpen(): boolean {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = "half-open"
        return false
      }
      return true
    }
    return false
  }

  public recordSuccess(): void {
    this.failureCount = 0
    this.state = "closed"
  }

  public recordFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = "open"
    }
  }

  public getState(): string {
    return this.state
  }

  public getFailureCount(): number {
    return this.failureCount
  }

  public getLastFailureTime(): number {
    return this.lastFailureTime
  }
}

// 类型定义
export interface RouteConfig {
  path: string
  serviceName: string
  methods: string[]
  stripPath: boolean
  preserveHost: boolean
  timeout?: number
  retries?: number
  rateLimit?: RateLimitConfig
  circuitBreaker?: CircuitBreakerConfig
}

export interface RateLimitConfig {
  requests: number
  window: number
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  timeout: number
  resetTimeout: number
}

export interface GatewayRequest {
  method: string
  path: string
  headers: Record<string, string>
  body?: any
  query?: Record<string, string>
}

export interface GatewayResponse {
  status: number
  body: any
  headers: Record<string, string>
}

export interface RequestContext {
  method: string
  path: string
  headers: Record<string, string>
  body?: any
  query?: Record<string, string>
  user?: any
  startTime: number
  response?: GatewayResponse
}

export interface Middleware {
  name: string
  priority: number
  execute: (context: RequestContext, next: NextFunction) => Promise<void>
}

export interface GatewayConfig {
  enableRateLimit: boolean
  enableCircuitBreaker: boolean
  enableCaching: boolean
  enableTracing: boolean
  enableMetrics: boolean
  defaultTimeout: number
  retryAttempts: number
  retryDelay: number
}

export interface GatewayStats {
  totalRoutes: number
  totalMiddleware: number
  circuitBreakers: Array<{
    name: string
    state: string
    failureCount: number
    lastFailureTime: number
  }>
  rateLimiters: Array<{
    path: string
    currentRequests: number
    totalRequests: number
  }>
}

export type NextFunction = () => Promise<void>

// 导出API网关实例
export const apiGateway = APIGateway.getInstance()
