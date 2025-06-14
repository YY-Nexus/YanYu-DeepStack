"use client"

// 本地服务器管理器 - 管理本地部署的服务器资源
export class LocalServerManager {
  private static instance: LocalServerManager
  private servers = new Map<string, LocalServer>()
  private services = new Map<string, LocalService>()
  private deployments = new Map<string, Deployment>()
  private config: LocalServerConfig

  private constructor() {
    this.config = {
      defaultSSHPort: 22,
      defaultUser: "root",
      monitoringInterval: 30000, // 30秒
      healthCheckTimeout: 5000, // 5秒
      deploymentTimeout: 300000, // 5分钟
    }

    this.initializeDefaultServers()
    this.startMonitoring()
  }

  public static getInstance(): LocalServerManager {
    if (!LocalServerManager.instance) {
      LocalServerManager.instance = new LocalServerManager()
    }
    return LocalServerManager.instance
  }

  // 初始化默认服务器
  private initializeDefaultServers(): void {
    // 本地开发服务器
    this.addServer({
      id: "local-dev",
      name: "本地开发服务器",
      host: "localhost",
      port: 22,
      username: "yanyu",
      type: "development",
      os: "Ubuntu 22.04",
      specs: {
        cpu: 8,
        memory: 16384, // 16GB
        disk: 512000, // 512GB
        network: "1Gbps",
      },
      status: "online",
      services: ["docker", "nginx", "nodejs", "python", "ollama"],
      tags: ["development", "local", "ai-models"],
      createdAt: new Date("2024-01-01"),
      lastHealthCheck: new Date(),
    })

    // 生产服务器1
    this.addServer({
      id: "prod-web-01",
      name: "生产Web服务器01",
      host: "192.168.1.100",
      port: 22,
      username: "deploy",
      type: "production",
      os: "CentOS 8",
      specs: {
        cpu: 16,
        memory: 32768, // 32GB
        disk: 1024000, // 1TB
        network: "10Gbps",
      },
      status: "online",
      services: ["docker", "nginx", "nodejs", "redis", "postgresql"],
      tags: ["production", "web", "frontend"],
      createdAt: new Date("2024-01-01"),
      lastHealthCheck: new Date(),
    })

    // 生产服务器2
    this.addServer({
      id: "prod-api-01",
      name: "生产API服务器01",
      host: "192.168.1.101",
      port: 22,
      username: "deploy",
      type: "production",
      os: "CentOS 8",
      specs: {
        cpu: 32,
        memory: 65536, // 64GB
        disk: 2048000, // 2TB
        network: "10Gbps",
      },
      status: "online",
      services: ["docker", "nodejs", "python", "redis", "postgresql", "elasticsearch"],
      tags: ["production", "api", "backend"],
      createdAt: new Date("2024-01-01"),
      lastHealthCheck: new Date(),
    })

    // AI推理服务器
    this.addServer({
      id: "ai-inference-01",
      name: "AI推理服务器01",
      host: "192.168.1.102",
      port: 22,
      username: "ai",
      type: "ai-inference",
      os: "Ubuntu 22.04",
      specs: {
        cpu: 64,
        memory: 131072, // 128GB
        disk: 4096000, // 4TB
        network: "25Gbps",
        gpu: "4x NVIDIA A100 80GB",
      },
      status: "online",
      services: ["docker", "nvidia-docker", "ollama", "python", "cuda"],
      tags: ["ai", "inference", "gpu", "ollama"],
      createdAt: new Date("2024-01-01"),
      lastHealthCheck: new Date(),
    })
  }

  // 添加服务器
  public addServer(server: Omit<LocalServer, "id"> & { id?: string }): LocalServer {
    const newServer: LocalServer = {
      id: server.id || `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...server,
      createdAt: server.createdAt || new Date(),
      lastHealthCheck: server.lastHealthCheck || new Date(),
    }

    this.servers.set(newServer.id, newServer)
    return newServer
  }

  // 获取所有服务器
  public getServers(): LocalServer[] {
    return Array.from(this.servers.values())
  }

  // 获取特定类型的服务器
  public getServersByType(type: ServerType): LocalServer[] {
    return Array.from(this.servers.values()).filter((server) => server.type === type)
  }

  // 获取在线服务器
  public getOnlineServers(): LocalServer[] {
    return Array.from(this.servers.values()).filter((server) => server.status === "online")
  }

  // 获取服务器详情
  public getServer(serverId: string): LocalServer | undefined {
    return this.servers.get(serverId)
  }

  // 更新服务器信息
  public updateServer(serverId: string, updates: Partial<LocalServer>): LocalServer | undefined {
    const server = this.servers.get(serverId)
    if (server) {
      const updatedServer = { ...server, ...updates, updatedAt: new Date() }
      this.servers.set(serverId, updatedServer)
      return updatedServer
    }
    return undefined
  }

  // 删除服务器
  public removeServer(serverId: string): boolean {
    return this.servers.delete(serverId)
  }

  // 健康检查
  public async performHealthCheck(serverId: string): Promise<HealthCheckResult> {
    const server = this.servers.get(serverId)
    if (!server) {
      throw new Error(`服务器不存在: ${serverId}`)
    }

    try {
      // 模拟健康检查
      const startTime = Date.now()

      // 检查网络连通性
      const networkCheck = await this.checkNetworkConnectivity(server)

      // 检查系统资源
      const resourceCheck = await this.checkSystemResources(server)

      // 检查服务状态
      const serviceCheck = await this.checkServices(server)

      const endTime = Date.now()
      const responseTime = endTime - startTime

      const result: HealthCheckResult = {
        serverId: server.id,
        timestamp: new Date(),
        status: networkCheck.success && resourceCheck.success && serviceCheck.success ? "healthy" : "unhealthy",
        responseTime,
        checks: {
          network: networkCheck,
          resources: resourceCheck,
          services: serviceCheck,
        },
      }

      // 更新服务器状态
      server.lastHealthCheck = new Date()
      server.status = result.status === "healthy" ? "online" : "offline"
      this.servers.set(serverId, server)

      return result
    } catch (error) {
      console.error(`健康检查失败 ${serverId}:`, error)

      // 更新服务器状态为离线
      server.status = "offline"
      server.lastHealthCheck = new Date()
      this.servers.set(serverId, server)

      return {
        serverId: server.id,
        timestamp: new Date(),
        status: "unhealthy",
        responseTime: this.config.healthCheckTimeout,
        checks: {
          network: { success: false, message: "网络连接失败" },
          resources: { success: false, message: "无法获取资源信息" },
          services: { success: false, message: "无法检查服务状态" },
        },
        error: error instanceof Error ? error.message : "未知错误",
      }
    }
  }

  // 检查网络连通性
  private async checkNetworkConnectivity(server: LocalServer): Promise<CheckResult> {
    try {
      // 模拟网络检查
      if (server.host === "localhost" || server.host.startsWith("192.168.")) {
        return { success: true, message: "网络连接正常" }
      }

      // 对于外部服务器，可以使用fetch进行检查
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.healthCheckTimeout)

      try {
        const response = await fetch(`http://${server.host}:80`, {
          method: "HEAD",
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        return { success: true, message: "网络连接正常" }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        return { success: true, message: "网络连接正常（假设内网可达）" }
      }
    } catch (error) {
      return { success: false, message: "网络连接失败" }
    }
  }

  // 检查系统资源
  private async checkSystemResources(server: LocalServer): Promise<CheckResult> {
    try {
      // 模拟系统资源检查
      const cpuUsage = Math.random() * 100
      const memoryUsage = Math.random() * 100
      const diskUsage = Math.random() * 100

      const warnings = []
      if (cpuUsage > 80) warnings.push(`CPU使用率过高: ${cpuUsage.toFixed(1)}%`)
      if (memoryUsage > 85) warnings.push(`内存使用率过高: ${memoryUsage.toFixed(1)}%`)
      if (diskUsage > 90) warnings.push(`磁盘使用率过高: ${diskUsage.toFixed(1)}%`)

      return {
        success: warnings.length === 0,
        message: warnings.length > 0 ? warnings.join(", ") : "系统资源正常",
        data: {
          cpu: cpuUsage,
          memory: memoryUsage,
          disk: diskUsage,
        },
      }
    } catch (error) {
      return { success: false, message: "无法获取系统资源信息" }
    }
  }

  // 检查服务状态
  private async checkServices(server: LocalServer): Promise<CheckResult> {
    try {
      // 模拟服务状态检查
      const serviceStatuses = server.services.map((service) => ({
        name: service,
        status: Math.random() > 0.1 ? "running" : "stopped", // 90%概率运行
      }))

      const stoppedServices = serviceStatuses.filter((s) => s.status === "stopped")

      return {
        success: stoppedServices.length === 0,
        message:
          stoppedServices.length > 0
            ? `服务异常: ${stoppedServices.map((s) => s.name).join(", ")}`
            : "所有服务运行正常",
        data: serviceStatuses,
      }
    } catch (error) {
      return { success: false, message: "无法检查服务状态" }
    }
  }

  // 部署应用
  public async deployApplication(deploymentConfig: DeploymentConfig): Promise<Deployment> {
    const deployment: Deployment = {
      id: `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...deploymentConfig,
      status: "pending",
      createdAt: new Date(),
      logs: [],
    }

    this.deployments.set(deployment.id, deployment)

    try {
      // 更新部署状态
      deployment.status = "in-progress"
      deployment.startedAt = new Date()
      this.deployments.set(deployment.id, deployment)

      // 模拟部署过程
      const steps = [
        "准备部署环境",
        "下载应用代码",
        "构建Docker镜像",
        "停止旧版本服务",
        "启动新版本服务",
        "健康检查",
        "更新负载均衡配置",
      ]

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        deployment.logs.push({
          timestamp: new Date(),
          level: "info",
          message: `[${i + 1}/${steps.length}] ${step}...`,
        })

        // 模拟步骤执行时间
        await new Promise((resolve) => setTimeout(resolve, 2000))

        deployment.logs.push({
          timestamp: new Date(),
          level: "info",
          message: `[${i + 1}/${steps.length}] ${step} 完成`,
        })

        deployment.progress = Math.round(((i + 1) / steps.length) * 100)
        this.deployments.set(deployment.id, deployment)
      }

      // 部署成功
      deployment.status = "success"
      deployment.completedAt = new Date()
      deployment.logs.push({
        timestamp: new Date(),
        level: "info",
        message: "部署成功完成！",
      })

      this.deployments.set(deployment.id, deployment)
      return deployment
    } catch (error) {
      // 部署失败
      deployment.status = "failed"
      deployment.completedAt = new Date()
      deployment.error = error instanceof Error ? error.message : "部署失败"
      deployment.logs.push({
        timestamp: new Date(),
        level: "error",
        message: `部署失败: ${deployment.error}`,
      })

      this.deployments.set(deployment.id, deployment)
      throw error
    }
  }

  // 获取部署历史
  public getDeployments(): Deployment[] {
    return Array.from(this.deployments.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // 获取特定服务器的部署历史
  public getDeploymentsByServer(serverId: string): Deployment[] {
    return Array.from(this.deployments.values())
      .filter((deployment) => deployment.serverId === serverId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // 获取部署详情
  public getDeployment(deploymentId: string): Deployment | undefined {
    return this.deployments.get(deploymentId)
  }

  // 回滚部署
  public async rollbackDeployment(deploymentId: string): Promise<Deployment> {
    const originalDeployment = this.deployments.get(deploymentId)
    if (!originalDeployment) {
      throw new Error("部署记录不存在")
    }

    // 创建回滚部署
    const rollbackDeployment: Deployment = {
      id: `rollback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      serverId: originalDeployment.serverId,
      applicationName: originalDeployment.applicationName,
      version: originalDeployment.previousVersion || "previous",
      environment: originalDeployment.environment,
      previousVersion: originalDeployment.version,
      status: "pending",
      createdAt: new Date(),
      logs: [
        {
          timestamp: new Date(),
          level: "info",
          message: `开始回滚到版本: ${originalDeployment.previousVersion || "previous"}`,
        },
      ],
    }

    return this.deployApplication(rollbackDeployment)
  }

  // 启动监控
  private startMonitoring(): void {
    setInterval(async () => {
      const servers = this.getOnlineServers()
      for (const server of servers) {
        try {
          await this.performHealthCheck(server.id)
        } catch (error) {
          console.error(`监控检查失败 ${server.id}:`, error)
        }
      }
    }, this.config.monitoringInterval)
  }

  // 获取服务器统计信息
  public getServerStats(): ServerStats {
    const servers = this.getServers()
    const onlineServers = servers.filter((s) => s.status === "online")
    const offlineServers = servers.filter((s) => s.status === "offline")

    return {
      total: servers.length,
      online: onlineServers.length,
      offline: offlineServers.length,
      byType: {
        development: servers.filter((s) => s.type === "development").length,
        production: servers.filter((s) => s.type === "production").length,
        staging: servers.filter((s) => s.type === "staging").length,
        "ai-inference": servers.filter((s) => s.type === "ai-inference").length,
      },
      totalResources: {
        cpu: servers.reduce((sum, s) => sum + s.specs.cpu, 0),
        memory: servers.reduce((sum, s) => sum + s.specs.memory, 0),
        disk: servers.reduce((sum, s) => sum + s.specs.disk, 0),
      },
    }
  }

  // 执行远程命令
  public async executeCommand(serverId: string, command: string): Promise<CommandResult> {
    const server = this.servers.get(serverId)
    if (!server) {
      throw new Error(`服务器不存在: ${serverId}`)
    }

    try {
      // 模拟命令执行
      const startTime = Date.now()

      // 模拟不同命令的输出
      let output = ""
      const exitCode = 0

      if (command.includes("ps aux")) {
        output =
          "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1  19356  1544 ?        Ss   Jan01   0:01 /sbin/init"
      } else if (command.includes("df -h")) {
        output = "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        20G  5.5G   14G  30% /"
      } else if (command.includes("free -m")) {
        output =
          "              total        used        free      shared  buff/cache   available\nMem:           7982        1234        5678          12        1070        6543"
      } else if (command.includes("docker ps")) {
        output =
          "CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES\nabc123def456   nginx     nginx     1 hour    Up 1 hour 80/tcp    web-server"
      } else {
        output = `Command executed: ${command}`
      }

      const endTime = Date.now()
      const executionTime = endTime - startTime

      return {
        serverId: server.id,
        command,
        output,
        exitCode,
        executionTime,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        serverId: server.id,
        command,
        output: "",
        exitCode: 1,
        executionTime: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "命令执行失败",
      }
    }
  }
}

// 类型定义
export type ServerType = "development" | "production" | "staging" | "ai-inference"
export type ServerStatus = "online" | "offline" | "maintenance"
export type DeploymentStatus = "pending" | "in-progress" | "success" | "failed"

export interface LocalServer {
  id: string
  name: string
  host: string
  port: number
  username: string
  type: ServerType
  os: string
  specs: {
    cpu: number
    memory: number // MB
    disk: number // MB
    network: string
    gpu?: string
  }
  status: ServerStatus
  services: string[]
  tags: string[]
  createdAt: Date
  updatedAt?: Date
  lastHealthCheck: Date
}

export interface LocalService {
  id: string
  name: string
  serverId: string
  port: number
  status: "running" | "stopped" | "error"
  version: string
  description: string
  healthCheckUrl?: string
  createdAt: Date
  updatedAt?: Date
}

export interface Deployment {
  id: string
  serverId: string
  applicationName: string
  version: string
  environment: string
  previousVersion?: string
  status: DeploymentStatus
  progress?: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  logs: Array<{
    timestamp: Date
    level: "info" | "warn" | "error"
    message: string
  }>
  error?: string
}

export interface DeploymentConfig {
  serverId: string
  applicationName: string
  version: string
  environment: string
  previousVersion?: string
}

export interface HealthCheckResult {
  serverId: string
  timestamp: Date
  status: "healthy" | "unhealthy"
  responseTime: number
  checks: {
    network: CheckResult
    resources: CheckResult
    services: CheckResult
  }
  error?: string
}

export interface CheckResult {
  success: boolean
  message: string
  data?: any
}

export interface LocalServerConfig {
  defaultSSHPort: number
  defaultUser: string
  monitoringInterval: number
  healthCheckTimeout: number
  deploymentTimeout: number
}

export interface ServerStats {
  total: number
  online: number
  offline: number
  byType: Record<ServerType, number>
  totalResources: {
    cpu: number
    memory: number
    disk: number
  }
}

export interface CommandResult {
  serverId: string
  command: string
  output: string
  exitCode: number
  executionTime: number
  timestamp: Date
  error?: string
}

// 导出本地服务器管理器实例
export const localServerManager = LocalServerManager.getInstance()
