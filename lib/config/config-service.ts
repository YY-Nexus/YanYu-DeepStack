// 配置服务 - 管理应用程序配置和环境变量

// 环境变量类型定义
export interface AppEnvironment {
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  SLACK_CLIENT_ID?: string
  SLACK_CLIENT_SECRET?: string
  BASE_URL?: string
  [key: string]: string | undefined
}

// 配置服务类
export class ConfigService {
  private static instance: ConfigService
  private environment: AppEnvironment = {}

  private constructor() {
    this.initializeEnvironment()
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService()
    }
    return ConfigService.instance
  }

  // 初始化环境变量
  private initializeEnvironment(): void {
    // 尝试从全局process对象获取环境变量
    try {
      // 仅在Node.js环境下使用process
      if (typeof process !== 'undefined' && process.env) {
        this.environment = { ...process.env } as AppEnvironment
      }
    } catch (error) {
      // 非Node.js环境，忽略错误
      console.log('Running in non-Node.js environment')
    }

    // 尝试从浏览器环境获取
    try {
      if (typeof window !== 'undefined' && (window as any).process?.env) {
        this.environment = { 
          ...this.environment, 
          ...(window as any).process.env 
        } as AppEnvironment
      }
    } catch (error) {
      // 非浏览器环境，忽略错误
    }

    // 设置默认值
    this.setDefaultValues()
  }

  // 设置默认值
  private setDefaultValues(): void {
    // 基础URL默认值
    if (!this.environment.BASE_URL) {
      try {
        if (typeof window !== 'undefined') {
          this.environment.BASE_URL = `${window.location.origin}`
        } else {
          this.environment.BASE_URL = 'http://localhost:3000'
        }
      } catch (error) {
        this.environment.BASE_URL = 'http://localhost:3000'
      }
    }
  }

  // 获取环境变量
  public get(key: string, defaultValue: string = ''): string {
    return this.environment[key] || defaultValue
  }

  // 获取完整环境
  public getAll(): AppEnvironment {
    return { ...this.environment }
  }

  // 设置环境变量（主要用于测试）
  public set(key: string, value: string): void {
    this.environment[key] = value
  }

  // 检查环境变量是否存在
  public has(key: string): boolean {
    return !!this.environment[key]
  }

  // 获取基础URL
  public getBaseUrl(): string {
    return this.get('BASE_URL', 'http://localhost:3000')
  }

  // 获取API端点URL
  public getApiUrl(path: string = ''): string {
    const baseUrl = this.getBaseUrl()
    return `${baseUrl}/api${path.startsWith('/') ? '' : '/'}${path}`
  }

  // 获取Webhook URL
  public getWebhookUrl(integrationName: string): string {
    return this.getApiUrl(`/webhooks/${integrationName}`)
  }
}

// 导出配置服务实例
export const configService = ConfigService.getInstance()