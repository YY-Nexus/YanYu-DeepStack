"use client"

import { serviceRegistry } from "@/lib/microservices/service-registry"
import { localServerDiscovery } from "./local-server-discovery"

// 服务网格连接器 - 自动连接和管理服务
export class ServiceMeshConnector {
  private static instance: ServiceMeshConnector
  private connections = new Map<string, ServiceConnection>()
  private config: MeshConfig

  private constructor() {
    this.config = {
      autoConnect: true,
      healthCheckInterval: 30000,
      reconnectAttempts: 3,
      reconnectDelay: 5000,
      enableLoadBalancing: true,
      enableCircuitBreaker: true,
    }

    this.initializeAutoConnection()
  }

  public static getInstance(): ServiceMeshConnector {
    if (!ServiceMeshConnector.instance) {
      ServiceMeshConnector.instance = new ServiceMeshConnector()
    }
    return ServiceMeshConnector.instance
  }

  // 初始化自动连接
  private initializeAutoConnection(): void {
    if (this.config.autoConnect) {
      // 启动服务发现
      localServerDiscovery.startAutoDiscovery()

      // 监听服务注册事件
      this.startServiceMonitoring()

      console.log("🔗 服务网格自动连接已启动")
    }
  }

  // 开始服务监控
  private startServiceMonitoring(): void {
    setInterval(() => {
      this.checkServiceConnections()
    }, this.config.healthCheckInterval)
  }

  // 检查服务连接状态
  private async checkServiceConnections(): Promise<void> {
    const services = serviceRegistry.getAllServices()

    for (const [serviceName, instances] of services.entries()) {
      for (const instance of instances) {
        await this.checkServiceConnection(serviceName, instance)
      }
    }
  }

  // 检查单个服务连接
  private async checkServiceConnection(serviceName: string, instance: any): Promise<void> {
    const connectionKey = `${serviceName}-${instance.id}`
    let connection = this.connections.get(connectionKey)

    if (!connection) {
      // 创建新连接
      connection = {
        serviceName,
        instanceId: instance.id,
        host: instance.host,
        port: instance.port,
        status: "connecting",
        createdAt: new Date(),
        lastCheck: new Date(),
        failureCount: 0,
      }
      this.connections.set(connectionKey, connection)
    }

    try {
      // 执行健康检查
      const isHealthy = await this.performHealthCheck(instance)

      if (isHealthy) {
        connection.status = "connected"
        connection.failureCount = 0
        connection.lastSuccessfulCheck = new Date()
      } else {
        throw new Error("健康检查失败")
      }
    } catch (error) {
      connection.failureCount++
      connection.lastError = error instanceof Error ? error.message : "未知错误"

      if (connection.failureCount >= this.config.reconnectAttempts) {
        connection.status = "failed"
        console.warn(`❌ 服务连接失败: ${serviceName} (${instance.host}:${instance.port})`)
      } else {
        connection.status = "reconnecting"
        // 尝试重连
        setTimeout(() => {
          this.attemptReconnection(connectionKey)
        }, this.config.reconnectDelay)
      }
    }

    connection.lastCheck = new Date()
    this.connections.set(connectionKey, connection)
  }

  // 执行健康检查
  private async performHealthCheck(instance: any): Promise<boolean> {
    try {
      if (instance.healthCheckUrl) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(instance.healthCheckUrl, {
          method: "GET",
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        return response.ok
      } else {
        // 如果没有健康检查URL，尝试连接端口
        return await this.checkPortConnectivity(instance.host, instance.port)
      }
    } catch (error) {
      return false
    }
  }

  // 检查端口连通性
  private async checkPortConnectivity(host: string, port: number): Promise<boolean> {
    try {
      // 模拟端口连通性检查
      const url = `http://${host}:${port}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return true
    } catch (error) {
      return false
    }
  }

  // 尝试重连
  private async attemptReconnection(connectionKey: string): Promise<void> {
    const connection = this.connections.get(connectionKey)
    if (!connection || connection.status !== "reconnecting") {
      return
    }

    console.log(`🔄 尝试重连服务: ${connection.serviceName}`)

    // 重新检查服务连接
    const services = serviceRegistry.getAllServices()
    const instances = services.get(connection.serviceName)
    const instance = instances?.find((i) => i.id === connection.instanceId)

    if (instance) {
      await this.checkServiceConnection(connection.serviceName, instance)
    }
  }

  // 获取连接统计
  public getConnectionStats(): ConnectionStats {
    const connections = Array.from(this.connections.values())

    return {
      totalConnections: connections.length,
      connectedServices: connections.filter((c) => c.status === "connected").length,
      failedConnections: connections.filter((c) => c.status === "failed").length,
      reconnectingServices: connections.filter((c) => c.status === "reconnecting").length,
      avgResponseTime: this.calculateAverageResponseTime(connections),
      lastUpdateTime: new Date(),
    }
  }

  // 计算平均响应时间
  private calculateAverageResponseTime(connections: ServiceConnection[]): number {
    const connectedServices = connections.filter((c) => c.status === "connected" && c.responseTime)
    if (connectedServices.length === 0) return 0

    const totalTime = connectedServices.reduce((sum, c) => sum + (c.responseTime || 0), 0)
    return Math.round(totalTime / connectedServices.length)
  }

  // 获取服务拓扑
  public getServiceTopology(): ServiceTopology {
    const services = serviceRegistry.getAllServices()
    const nodes: TopologyNode[] = []
    const edges: TopologyEdge[] = []

    // 创建服务节点
    for (const [serviceName, instances] of services.entries()) {
      const healthyInstances = instances.filter((i) => i.status === "healthy").length

      nodes.push({
        id: serviceName,
        name: serviceName,
        type: "service",
        status: healthyInstances > 0 ? "healthy" : "unhealthy",
        instanceCount: instances.length,
        healthyInstances,
      })

      // 创建实例节点
      instances.forEach((instance) => {
        nodes.push({
          id: instance.id,
          name: `${instance.host}:${instance.port}`,
          type: "instance",
          status: instance.status,
          parentService: serviceName,
        })

        // 创建服务到实例的边
        edges.push({
          source: serviceName,
          target: instance.id,
          type: "contains",
        })
      })
    }

    return { nodes, edges }
  }

  // 手动连接服务
  public async connectToService(serviceName: string, host: string, port: number): Promise<boolean> {
    try {
      // 注册服务
      const serviceId = serviceRegistry.registerService({
        name: serviceName,
        version: "1.0.0",
        host,
        port,
        tags: ["manual"],
      })

      console.log(`✅ 手动连接服务成功: ${serviceName} (${host}:${port})`)
      return true
    } catch (error) {
      console.error(`❌ 手动连接服务失败: ${serviceName}`, error)
      return false
    }
  }

  // 断开服务连接
  public disconnectService(serviceId: string): boolean {
    const success = serviceRegistry.deregisterService(serviceId)
    if (success) {
      // 清理连接记录
      for (const [key, connection] of this.connections.entries()) {
        if (connection.instanceId === serviceId) {
          this.connections.delete(key)
          break
        }
      }
      console.log(`🔌 断开服务连接: ${serviceId}`)
    }
    return success
  }
}

// 类型定义
interface MeshConfig {
  autoConnect: boolean
  healthCheckInterval: number
  reconnectAttempts: number
  reconnectDelay: number
  enableLoadBalancing: boolean
  enableCircuitBreaker: boolean
}

interface ServiceConnection {
  serviceName: string
  instanceId: string
  host: string
  port: number
  status: "connecting" | "connected" | "reconnecting" | "failed"
  createdAt: Date
  lastCheck: Date
  lastSuccessfulCheck?: Date
  failureCount: number
  responseTime?: number
  lastError?: string
}

interface ConnectionStats {
  totalConnections: number
  connectedServices: number
  failedConnections: number
  reconnectingServices: number
  avgResponseTime: number
  lastUpdateTime: Date
}

interface ServiceTopology {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
}

interface TopologyNode {
  id: string
  name: string
  type: "service" | "instance"
  status: string
  instanceCount?: number
  healthyInstances?: number
  parentService?: string
}

interface TopologyEdge {
  source: string
  target: string
  type: "contains" | "calls"
}

// 导出服务网格连接器实例
export const serviceMeshConnector = ServiceMeshConnector.getInstance()
