"use client"

// 服务注册与发现 - 微服务核心组件
export class ServiceRegistry {
  private static instance: ServiceRegistry
  private services = new Map<string, ServiceInstance[]>()
  private healthChecks = new Map<string, HealthCheck>()
  private loadBalancer: LoadBalancer
  private config: ServiceRegistryConfig

  private constructor() {
    this.config = {
      healthCheckInterval: 30000, // 30秒
      unhealthyThreshold: 3,
      healthyThreshold: 2,
      enableLoadBalancing: true,
      loadBalancingStrategy: "round-robin",
      enableServiceMesh: true,
      enableCircuitBreaker: true,
    }

    this.loadBalancer = new LoadBalancer(this.config.loadBalancingStrategy)
    this.initializeHealthChecks()
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry()
    }
    return ServiceRegistry.instance
  }

  // 注册服务实例
  public registerService(service: ServiceRegistration): string {
    const instance: ServiceInstance = {
      id: `${service.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: service.name,
      version: service.version,
      host: service.host,
      port: service.port,
      protocol: service.protocol || "http",
      healthCheckUrl: service.healthCheckUrl,
      metadata: service.metadata || {},
      status: "starting",
      registeredAt: Date.now(),
      lastHeartbeat: Date.now(),
      tags: service.tags || [],
      weight: service.weight || 100,
    }

    // 添加到服务列表
    if (!this.services.has(service.name)) {
      this.services.set(service.name, [])
    }
    this.services.get(service.name)!.push(instance)

    // 启动健康检查
    this.startHealthCheck(instance)

    console.log(`服务注册成功: ${service.name} (${instance.id})`)
    return instance.id
  }

  // 注销服务实例
  public deregisterService(serviceId: string): boolean {
    for (const [serviceName, instances] of this.services.entries()) {
      const index = instances.findIndex((instance) => instance.id === serviceId)
      if (index !== -1) {
        const instance = instances[index]
        instances.splice(index, 1)

        // 停止健康检查
        this.stopHealthCheck(serviceId)

        console.log(`服务注销成功: ${serviceName} (${serviceId})`)
        return true
      }
    }
    return false
  }

  // 发现服务实例
  public discoverService(serviceName: string, options?: DiscoveryOptions): ServiceInstance | null {
    const instances = this.services.get(serviceName)
    if (!instances || instances.length === 0) {
      return null
    }

    // 过滤健康的实例
    const healthyInstances = instances.filter((instance) => instance.status === "healthy")
    if (healthyInstances.length === 0) {
      return null
    }

    // 应用过滤条件
    let filteredInstances = healthyInstances
    if (options?.version) {
      filteredInstances = filteredInstances.filter((instance) => instance.version === options.version)
    }
    if (options?.tags) {
      filteredInstances = filteredInstances.filter((instance) =>
        options.tags!.every((tag) => instance.tags.includes(tag)),
      )
    }

    if (filteredInstances.length === 0) {
      return null
    }

    // 负载均衡选择
    return this.loadBalancer.selectInstance(filteredInstances)
  }

  // 获取所有服务实例
  public getAllServices(): Map<string, ServiceInstance[]> {
    return new Map(this.services)
  }

  // 获取服务健康状态
  public getServiceHealth(serviceName: string): ServiceHealth {
    const instances = this.services.get(serviceName) || []
    const healthyCount = instances.filter((instance) => instance.status === "healthy").length
    const unhealthyCount = instances.filter((instance) => instance.status === "unhealthy").length
    const totalCount = instances.length

    return {
      serviceName,
      totalInstances: totalCount,
      healthyInstances: healthyCount,
      unhealthyInstances: unhealthyCount,
      healthRatio: totalCount > 0 ? healthyCount / totalCount : 0,
      status: healthyCount > 0 ? "available" : "unavailable",
      lastUpdated: Date.now(),
    }
  }

  // 启动健康检查
  private startHealthCheck(instance: ServiceInstance): void {
    if (!instance.healthCheckUrl) {
      instance.status = "healthy" // 没有健康检查URL，默认为健康
      return
    }

    const healthCheck: HealthCheck = {
      instanceId: instance.id,
      url: instance.healthCheckUrl,
      interval: this.config.healthCheckInterval,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      lastCheck: 0,
      isRunning: true,
    }

    this.healthChecks.set(instance.id, healthCheck)
    this.performHealthCheck(instance, healthCheck)
  }

  // 执行健康检查
  private async performHealthCheck(instance: ServiceInstance, healthCheck: HealthCheck): Promise<void> {
    if (!healthCheck.isRunning) return

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

      const response = await fetch(healthCheck.url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "YanYu-ServiceRegistry/1.0",
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        healthCheck.consecutiveSuccesses++
        healthCheck.consecutiveFailures = 0

        if (instance.status !== "healthy" && healthCheck.consecutiveSuccesses >= this.config.healthyThreshold) {
          instance.status = "healthy"
          console.log(`服务恢复健康: ${instance.name} (${instance.id})`)
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      healthCheck.consecutiveFailures++
      healthCheck.consecutiveSuccesses = 0

      if (instance.status !== "unhealthy" && healthCheck.consecutiveFailures >= this.config.unhealthyThreshold) {
        instance.status = "unhealthy"
        console.warn(`服务不健康: ${instance.name} (${instance.id}) - ${error}`)
      }
    }

    healthCheck.lastCheck = Date.now()
    instance.lastHeartbeat = Date.now()

    // 调度下次检查
    setTimeout(() => {
      this.performHealthCheck(instance, healthCheck)
    }, healthCheck.interval)
  }

  // 停止健康检查
  private stopHealthCheck(instanceId: string): void {
    const healthCheck = this.healthChecks.get(instanceId)
    if (healthCheck) {
      healthCheck.isRunning = false
      this.healthChecks.delete(instanceId)
    }
  }

  // 初始化健康检查
  private initializeHealthChecks(): void {
    // 定期清理过期的服务实例
    setInterval(() => {
      this.cleanupExpiredInstances()
    }, 60000) // 每分钟清理一次
  }

  // 清理过期实例
  private cleanupExpiredInstances(): void {
    const now = Date.now()
    const expireThreshold = 5 * 60 * 1000 // 5分钟无心跳则认为过期

    for (const [serviceName, instances] of this.services.entries()) {
      const validInstances = instances.filter((instance) => {
        const isExpired = now - instance.lastHeartbeat > expireThreshold
        if (isExpired) {
          this.stopHealthCheck(instance.id)
          console.log(`清理过期服务实例: ${serviceName} (${instance.id})`)
        }
        return !isExpired
      })

      this.services.set(serviceName, validInstances)
    }
  }

  // 更新服务元数据
  public updateServiceMetadata(instanceId: string, metadata: Record<string, any>): boolean {
    for (const instances of this.services.values()) {
      const instance = instances.find((inst) => inst.id === instanceId)
      if (instance) {
        instance.metadata = { ...instance.metadata, ...metadata }
        return true
      }
    }
    return false
  }

  // 获取服务统计信息
  public getServiceStats(): ServiceStats {
    const stats: ServiceStats = {
      totalServices: this.services.size,
      totalInstances: 0,
      healthyInstances: 0,
      unhealthyInstances: 0,
      serviceDetails: [],
    }

    for (const [serviceName, instances] of this.services.entries()) {
      const healthyCount = instances.filter((inst) => inst.status === "healthy").length
      const unhealthyCount = instances.filter((inst) => inst.status === "unhealthy").length

      stats.totalInstances += instances.length
      stats.healthyInstances += healthyCount
      stats.unhealthyInstances += unhealthyCount

      stats.serviceDetails.push({
        name: serviceName,
        instanceCount: instances.length,
        healthyCount,
        unhealthyCount,
        versions: [...new Set(instances.map((inst) => inst.version))],
      })
    }

    return stats
  }
}

// 负载均衡器
class LoadBalancer {
  private strategy: LoadBalancingStrategy
  private roundRobinCounters = new Map<string, number>()

  constructor(strategy: LoadBalancingStrategy) {
    this.strategy = strategy
  }

  public selectInstance(instances: ServiceInstance[]): ServiceInstance {
    switch (this.strategy) {
      case "round-robin":
        return this.roundRobinSelect(instances)
      case "weighted-round-robin":
        return this.weightedRoundRobinSelect(instances)
      case "least-connections":
        return this.leastConnectionsSelect(instances)
      case "random":
        return this.randomSelect(instances)
      default:
        return instances[0]
    }
  }

  private roundRobinSelect(instances: ServiceInstance[]): ServiceInstance {
    const serviceName = instances[0].name
    const counter = this.roundRobinCounters.get(serviceName) || 0
    const selectedIndex = counter % instances.length
    this.roundRobinCounters.set(serviceName, counter + 1)
    return instances[selectedIndex]
  }

  private weightedRoundRobinSelect(instances: ServiceInstance[]): ServiceInstance {
    const totalWeight = instances.reduce((sum, instance) => sum + instance.weight, 0)
    const random = Math.random() * totalWeight
    let currentWeight = 0

    for (const instance of instances) {
      currentWeight += instance.weight
      if (random <= currentWeight) {
        return instance
      }
    }

    return instances[0]
  }

  private leastConnectionsSelect(instances: ServiceInstance[]): ServiceInstance {
    // 简化实现，实际应该跟踪连接数
    return instances.reduce((min, instance) => {
      const minConnections = min.metadata.connections || 0
      const instanceConnections = instance.metadata.connections || 0
      return instanceConnections < minConnections ? instance : min
    })
  }

  private randomSelect(instances: ServiceInstance[]): ServiceInstance {
    const randomIndex = Math.floor(Math.random() * instances.length)
    return instances[randomIndex]
  }
}

// 类型定义
export interface ServiceRegistration {
  name: string
  version: string
  host: string
  port: number
  protocol?: "http" | "https" | "grpc"
  healthCheckUrl?: string
  metadata?: Record<string, any>
  tags?: string[]
  weight?: number
}

export interface ServiceInstance {
  id: string
  name: string
  version: string
  host: string
  port: number
  protocol: string
  healthCheckUrl?: string
  metadata: Record<string, any>
  status: "starting" | "healthy" | "unhealthy" | "stopping"
  registeredAt: number
  lastHeartbeat: number
  tags: string[]
  weight: number
}

export interface DiscoveryOptions {
  version?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface ServiceHealth {
  serviceName: string
  totalInstances: number
  healthyInstances: number
  unhealthyInstances: number
  healthRatio: number
  status: "available" | "degraded" | "unavailable"
  lastUpdated: number
}

export interface HealthCheck {
  instanceId: string
  url: string
  interval: number
  consecutiveFailures: number
  consecutiveSuccesses: number
  lastCheck: number
  isRunning: boolean
}

export interface ServiceRegistryConfig {
  healthCheckInterval: number
  unhealthyThreshold: number
  healthyThreshold: number
  enableLoadBalancing: boolean
  loadBalancingStrategy: LoadBalancingStrategy
  enableServiceMesh: boolean
  enableCircuitBreaker: boolean
}

export interface ServiceStats {
  totalServices: number
  totalInstances: number
  healthyInstances: number
  unhealthyInstances: number
  serviceDetails: Array<{
    name: string
    instanceCount: number
    healthyCount: number
    unhealthyCount: number
    versions: string[]
  }>
}

export type LoadBalancingStrategy = "round-robin" | "weighted-round-robin" | "least-connections" | "random"

// 导出服务注册中心实例
export const serviceRegistry = ServiceRegistry.getInstance()
