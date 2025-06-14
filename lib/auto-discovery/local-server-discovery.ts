"use client"

import { localServerManager } from "@/lib/enterprise/local-server-manager"
import { serviceRegistry } from "@/lib/microservices/service-registry"

// 本地服务器自动发现服务
export class LocalServerDiscovery {
  private static instance: LocalServerDiscovery
  private discoveryInterval: NodeJS.Timeout | null = null
  private config: DiscoveryConfig

  private constructor() {
    this.config = {
      scanInterval: 30000, // 30秒扫描一次
      networkRanges: [
        "192.168.1.0/24", // 家庭网络
        "192.168.0.0/24", // 路由器默认网段
        "10.0.0.0/24", // 企业内网
        "172.16.0.0/24", // Docker网络
      ],
      commonPorts: [22, 80, 443, 3000, 8080, 11434], // 常见服务端口
      autoRegister: true, // 自动注册发现的服务
      enableSSHScan: true, // 启用SSH扫描
    }
  }

  public static getInstance(): LocalServerDiscovery {
    if (!LocalServerDiscovery.instance) {
      LocalServerDiscovery.instance = new LocalServerDiscovery()
    }
    return LocalServerDiscovery.instance
  }

  // 启动自动发现
  public startAutoDiscovery(): void {
    console.log("🔍 启动本地服务器自动发现...")

    // 立即执行一次扫描
    this.performNetworkScan()

    // 设置定期扫描
    this.discoveryInterval = setInterval(() => {
      this.performNetworkScan()
    }, this.config.scanInterval)
  }

  // 停止自动发现
  public stopAutoDiscovery(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval)
      this.discoveryInterval = null
      console.log("⏹️ 停止本地服务器自动发现")
    }
  }

  // 执行网络扫描
  private async performNetworkScan(): Promise<void> {
    console.log("🔍 开始扫描本地网络...")

    for (const networkRange of this.config.networkRanges) {
      await this.scanNetworkRange(networkRange)
    }
  }

  // 扫描网络段
  private async scanNetworkRange(networkRange: string): Promise<void> {
    const [baseIP, cidr] = networkRange.split("/")
    const [a, b, c] = baseIP.split(".").map(Number)

    // 简化实现：扫描网段中的前50个IP
    const promises: Promise<void>[] = []

    for (let d = 1; d <= 50; d++) {
      const ip = `${a}.${b}.${c}.${d}`
      promises.push(this.scanHost(ip))
    }

    await Promise.allSettled(promises)
  }

  // 扫描单个主机
  private async scanHost(ip: string): Promise<void> {
    try {
      const discoveredServices: DiscoveredService[] = []

      // 扫描常见端口
      for (const port of this.config.commonPorts) {
        const service = await this.checkPort(ip, port)
        if (service) {
          discoveredServices.push(service)
        }
      }

      // 如果发现服务，尝试识别服务器类型
      if (discoveredServices.length > 0) {
        const serverInfo = await this.identifyServer(ip, discoveredServices)
        if (serverInfo && this.config.autoRegister) {
          await this.registerDiscoveredServer(serverInfo)
        }
      }
    } catch (error) {
      // 静默处理扫描错误
    }
  }

  // 检查端口是否开放
  private async checkPort(ip: string, port: number): Promise<DiscoveredService | null> {
    try {
      // 模拟端口检查（实际环境中需要使用网络库）
      const isOpen = await this.simulatePortCheck(ip, port)

      if (isOpen) {
        const serviceType = this.identifyServiceType(port)
        return {
          ip,
          port,
          type: serviceType,
          protocol: port === 443 ? "https" : "http",
          discoveredAt: new Date(),
        }
      }
    } catch (error) {
      // 端口不可达
    }

    return null
  }

  // 模拟端口检查
  private async simulatePortCheck(ip: string, port: number): Promise<boolean> {
    // 在实际环境中，这里会使用网络库进行真实的端口扫描
    // 这里使用模拟逻辑

    // 本地回环地址总是可达
    if (ip === "127.0.0.1" || ip === "localhost") {
      return [22, 80, 3000, 11434].includes(port)
    }

    // 模拟一些常见的内网服务器
    const commonServers = [
      { ip: "192.168.1.100", ports: [22, 80, 443] },
      { ip: "192.168.1.101", ports: [22, 3000, 8080] },
      { ip: "192.168.1.102", ports: [22, 11434] }, // AI推理服务器
    ]

    const server = commonServers.find((s) => s.ip === ip)
    return server ? server.ports.includes(port) : false
  }

  // 识别服务类型
  private identifyServiceType(port: number): string {
    const serviceMap: Record<number, string> = {
      22: "ssh",
      80: "http",
      443: "https",
      3000: "nodejs",
      8080: "web-server",
      11434: "ollama",
      5432: "postgresql",
      3306: "mysql",
      6379: "redis",
    }

    return serviceMap[port] || "unknown"
  }

  // 识别服务器信息
  private async identifyServer(ip: string, services: DiscoveredService[]): Promise<ServerInfo | null> {
    try {
      // 尝试通过HTTP请求获取服务器信息
      const httpService = services.find((s) => s.type === "http" || s.type === "https")
      if (httpService) {
        const serverInfo = await this.probeHttpServer(ip, httpService.port)
        if (serverInfo) {
          return {
            ...serverInfo,
            ip,
            services: services.map((s) => s.type),
            discoveredAt: new Date(),
          }
        }
      }

      // 如果有SSH服务，尝试识别操作系统
      const sshService = services.find((s) => s.type === "ssh")
      if (sshService && this.config.enableSSHScan) {
        return {
          ip,
          name: `服务器-${ip}`,
          type: "unknown",
          os: "Linux", // 默认假设为Linux
          services: services.map((s) => s.type),
          discoveredAt: new Date(),
        }
      }

      return null
    } catch (error) {
      return null
    }
  }

  // 探测HTTP服务器
  private async probeHttpServer(ip: string, port: number): Promise<Partial<ServerInfo> | null> {
    try {
      const protocol = port === 443 ? "https" : "http"
      const url = `${protocol}://${ip}:${port}`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 从响应头获取服务器信息
      const serverHeader = response.headers.get("server") || ""
      const poweredBy = response.headers.get("x-powered-by") || ""

      let serverType = "web-server"
      const os = "unknown"

      if (serverHeader.toLowerCase().includes("nginx")) {
        serverType = "nginx"
      } else if (serverHeader.toLowerCase().includes("apache")) {
        serverType = "apache"
      } else if (poweredBy.toLowerCase().includes("express")) {
        serverType = "nodejs"
      }

      return {
        name: `${serverType.toUpperCase()}服务器-${ip}`,
        type: serverType as any,
        os,
      }
    } catch (error) {
      return null
    }
  }

  // 注册发现的服务器
  private async registerDiscoveredServer(serverInfo: ServerInfo): Promise<void> {
    try {
      // 检查是否已经注册过
      const existingServers = localServerManager.getServers()
      const exists = existingServers.some((server) => server.host === serverInfo.ip)

      if (!exists) {
        // 自动注册到本地服务器管理器
        const newServer = localServerManager.addServer({
          name: serverInfo.name,
          host: serverInfo.ip,
          port: 22, // 默认SSH端口
          username: "root", // 默认用户名
          type: this.mapServerType(serverInfo.type),
          os: serverInfo.os,
          specs: {
            cpu: 4, // 默认规格
            memory: 8192,
            disk: 100000,
            network: "1Gbps",
          },
          status: "online",
          services: serverInfo.services,
          tags: ["auto-discovered"],
        })

        console.log(`✅ 自动发现并注册服务器: ${serverInfo.name} (${serverInfo.ip})`)

        // 注册服务到服务注册中心
        for (const service of serverInfo.services) {
          if (service === "ollama") {
            serviceRegistry.registerService({
              name: "ollama-service",
              version: "1.0.0",
              host: serverInfo.ip,
              port: 11434,
              healthCheckUrl: `http://${serverInfo.ip}:11434/api/tags`,
              tags: ["ai", "ollama", "auto-discovered"],
            })
          } else if (service === "nodejs") {
            serviceRegistry.registerService({
              name: "web-service",
              version: "1.0.0",
              host: serverInfo.ip,
              port: 3000,
              healthCheckUrl: `http://${serverInfo.ip}:3000/health`,
              tags: ["web", "nodejs", "auto-discovered"],
            })
          }
        }
      }
    } catch (error) {
      console.error(`注册服务器失败 ${serverInfo.ip}:`, error)
    }
  }

  // 映射服务器类型
  private mapServerType(type: string): "development" | "production" | "staging" | "ai-inference" {
    const typeMap: Record<string, any> = {
      ollama: "ai-inference",
      nodejs: "development",
      nginx: "production",
      apache: "production",
      unknown: "development",
    }

    return typeMap[type] || "development"
  }

  // 获取发现统计
  public getDiscoveryStats(): DiscoveryStats {
    const servers = localServerManager.getServers()
    const autoDiscovered = servers.filter((s) => s.tags.includes("auto-discovered"))

    return {
      totalServers: servers.length,
      autoDiscovered: autoDiscovered.length,
      manuallyAdded: servers.length - autoDiscovered.length,
      lastScanTime: new Date(),
      networkRanges: this.config.networkRanges,
    }
  }

  // 手动触发扫描
  public async triggerManualScan(): Promise<void> {
    console.log("🔍 手动触发网络扫描...")
    await this.performNetworkScan()
  }
}

// 类型定义
interface DiscoveryConfig {
  scanInterval: number
  networkRanges: string[]
  commonPorts: number[]
  autoRegister: boolean
  enableSSHScan: boolean
}

interface DiscoveredService {
  ip: string
  port: number
  type: string
  protocol: string
  discoveredAt: Date
}

interface ServerInfo {
  ip: string
  name: string
  type: string
  os: string
  services: string[]
  discoveredAt: Date
}

interface DiscoveryStats {
  totalServers: number
  autoDiscovered: number
  manuallyAdded: number
  lastScanTime: Date
  networkRanges: string[]
}

// 导出自动发现服务实例
export const localServerDiscovery = LocalServerDiscovery.getInstance()
