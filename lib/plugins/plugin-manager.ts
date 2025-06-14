"use client"

// 插件管理器 - 管理插件的加载、卸载和通信
export class PluginManager {
  private static instance: PluginManager
  private plugins = new Map<string, LoadedPlugin>()
  private hooks = new Map<string, HookCallback[]>()
  private eventBus = new EventTarget()
  private config: PluginConfig

  private constructor() {
    this.config = {
      enableSandbox: true,
      maxPlugins: 50,
      allowedDomains: ["localhost", "yanyu.cloud"],
      securityLevel: "strict",
      autoUpdate: true,
    }
  }

  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager()
    }
    return PluginManager.instance
  }

  // 注册插件
  public async registerPlugin(manifest: PluginManifest): Promise<void> {
    try {
      // 验证插件清单
      this.validateManifest(manifest)

      // 检查权限
      await this.checkPermissions(manifest)

      // 加载插件代码
      const pluginCode = await this.loadPluginCode(manifest)

      // 创建沙箱环境
      const sandbox = this.config.enableSandbox ? this.createSandbox(manifest) : window

      // 执行插件代码
      const pluginInstance = await this.executePlugin(pluginCode, sandbox, manifest)

      // 注册插件
      const loadedPlugin: LoadedPlugin = {
        manifest,
        instance: pluginInstance,
        sandbox,
        status: "active",
        loadedAt: Date.now(),
        hooks: new Set(),
        permissions: manifest.permissions || [],
      }

      this.plugins.set(manifest.id, loadedPlugin)

      // 触发插件加载事件
      this.emit("plugin:loaded", { plugin: manifest })

      console.log(`插件 ${manifest.name} 加载成功`)
    } catch (error) {
      console.error(`插件 ${manifest.name} 加载失败:`, error)
      throw error
    }
  }

  // 卸载插件
  public async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`插件 ${pluginId} 不存在`)
    }

    try {
      // 调用插件的卸载方法
      if (plugin.instance.onUnload) {
        await plugin.instance.onUnload()
      }

      // 清理钩子
      plugin.hooks.forEach((hookName) => {
        this.removeHook(hookName, plugin.instance)
      })

      // 清理沙箱
      if (plugin.sandbox !== window) {
        this.destroySandbox(plugin.sandbox)
      }

      // 移除插件
      this.plugins.delete(pluginId)

      // 触发插件卸载事件
      this.emit("plugin:unloaded", { pluginId })

      console.log(`插件 ${plugin.manifest.name} 卸载成功`)
    } catch (error) {
      console.error(`插件 ${plugin.manifest.name} 卸载失败:`, error)
      throw error
    }
  }

  // 获取已加载的插件列表
  public getLoadedPlugins(): PluginInfo[] {
    return Array.from(this.plugins.values()).map((plugin) => ({
      id: plugin.manifest.id,
      name: plugin.manifest.name,
      version: plugin.manifest.version,
      description: plugin.manifest.description,
      author: plugin.manifest.author,
      status: plugin.status,
      loadedAt: plugin.loadedAt,
      permissions: plugin.permissions,
    }))
  }

  // 启用插件
  public async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`插件 ${pluginId} 不存在`)
    }

    if (plugin.status === "active") {
      return
    }

    try {
      if (plugin.instance.onEnable) {
        await plugin.instance.onEnable()
      }

      plugin.status = "active"
      this.emit("plugin:enabled", { pluginId })
    } catch (error) {
      console.error(`启用插件 ${plugin.manifest.name} 失败:`, error)
      throw error
    }
  }

  // 禁用插件
  public async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`插件 ${pluginId} 不存在`)
    }

    if (plugin.status === "disabled") {
      return
    }

    try {
      if (plugin.instance.onDisable) {
        await plugin.instance.onDisable()
      }

      plugin.status = "disabled"
      this.emit("plugin:disabled", { pluginId })
    } catch (error) {
      console.error(`禁用插件 ${plugin.manifest.name} 失败:`, error)
      throw error
    }
  }

  // 注册钩子
  public registerHook(hookName: string, callback: HookCallback, pluginId?: string): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, [])
    }

    const hookCallbacks = this.hooks.get(hookName)!
    hookCallbacks.push(callback)

    // 记录插件的钩子
    if (pluginId) {
      const plugin = this.plugins.get(pluginId)
      if (plugin) {
        plugin.hooks.add(hookName)
      }
    }
  }

  // 移除钩子
  public removeHook(hookName: string, callback: HookCallback): void {
    const hookCallbacks = this.hooks.get(hookName)
    if (hookCallbacks) {
      const index = hookCallbacks.indexOf(callback)
      if (index > -1) {
        hookCallbacks.splice(index, 1)
      }
    }
  }

  // 执行钩子
  public async executeHook(hookName: string, data?: any): Promise<any[]> {
    const hookCallbacks = this.hooks.get(hookName) || []
    const results: any[] = []

    for (const callback of hookCallbacks) {
      try {
        const result = await callback(data)
        results.push(result)
      } catch (error) {
        console.error(`执行钩子 ${hookName} 失败:`, error)
      }
    }

    return results
  }

  // 发送消息给插件
  public async sendMessage(pluginId: string, message: PluginMessage): Promise<any> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin || plugin.status !== "active") {
      throw new Error(`插件 ${pluginId} 不存在或未激活`)
    }

    if (plugin.instance.onMessage) {
      return await plugin.instance.onMessage(message)
    }
  }

  // 广播消息给所有插件
  public async broadcastMessage(message: PluginMessage): Promise<void> {
    const promises = Array.from(this.plugins.values())
      .filter((plugin) => plugin.status === "active")
      .map((plugin) => {
        if (plugin.instance.onMessage) {
          return plugin.instance.onMessage(message)
        }
      })

    await Promise.allSettled(promises)
  }

  // 获取插件API
  public getPluginAPI(pluginId: string): PluginAPI {
    return {
      // 核心API
      registerHook: (hookName: string, callback: HookCallback) => {
        this.registerHook(hookName, callback, pluginId)
      },
      executeHook: this.executeHook.bind(this),
      sendMessage: this.sendMessage.bind(this),
      broadcastMessage: this.broadcastMessage.bind(this),

      // 事件API
      on: this.on.bind(this),
      off: this.off.bind(this),
      emit: this.emit.bind(this),

      // 存储API
      storage: {
        get: (key: string) => this.getPluginStorage(pluginId, key),
        set: (key: string, value: any) => this.setPluginStorage(pluginId, key, value),
        remove: (key: string) => this.removePluginStorage(pluginId, key),
        clear: () => this.clearPluginStorage(pluginId),
      },

      // UI API
      ui: {
        createPanel: (config: any) => this.createUIPanel(pluginId, config),
        showNotification: (message: string, type?: string) => this.showNotification(message, type),
        showModal: (config: any) => this.showModal(config),
      },

      // 工具API
      utils: {
        http: this.createHttpClient(pluginId),
        crypto: this.createCryptoUtils(),
        logger: this.createLogger(pluginId),
      },
    }
  }

  // 私有方法
  private validateManifest(manifest: PluginManifest): void {
    const requiredFields = ["id", "name", "version", "main"]
    for (const field of requiredFields) {
      if (!(field in manifest)) {
        throw new Error(`插件清单缺少必需字段: ${field}`)
      }
    }

    // 验证版本格式
    if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      throw new Error("插件版本格式无效，应为 x.y.z 格式")
    }

    // 检查插件ID是否已存在
    if (this.plugins.has(manifest.id)) {
      throw new Error(`插件ID ${manifest.id} 已存在`)
    }
  }

  private async checkPermissions(manifest: PluginManifest): Promise<void> {
    const permissions = manifest.permissions || []

    for (const permission of permissions) {
      if (!this.isPermissionAllowed(permission)) {
        throw new Error(`插件请求的权限 ${permission} 不被允许`)
      }
    }
  }

  private isPermissionAllowed(permission: string): boolean {
    const allowedPermissions = ["storage", "network", "ui", "filesystem", "notifications", "clipboard"]

    return allowedPermissions.includes(permission)
  }

  private async loadPluginCode(manifest: PluginManifest): Promise<string> {
    try {
      const response = await fetch(manifest.main)
      if (!response.ok) {
        throw new Error(`加载插件代码失败: ${response.statusText}`)
      }
      return await response.text()
    } catch (error) {
      throw new Error(`加载插件代码失败: ${error}`)
    }
  }

  private createSandbox(manifest: PluginManifest): any {
    // 创建安全的沙箱环境
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    iframe.sandbox.add("allow-scripts")
    document.body.appendChild(iframe)

    const sandboxWindow = iframe.contentWindow!

    // 提供受限的API
    sandboxWindow.pluginAPI = this.getPluginAPI(manifest.id)

    return sandboxWindow
  }

  private destroySandbox(sandbox: any): void {
    if (sandbox !== window && sandbox.frameElement) {
      document.body.removeChild(sandbox.frameElement)
    }
  }

  private async executePlugin(code: string, sandbox: any, manifest: PluginManifest): Promise<PluginInstance> {
    try {
      // 在沙箱中执行插件代码
      const func = new sandbox.Function(
        "pluginAPI",
        `
        ${code}
        return typeof plugin !== 'undefined' ? plugin : {};
      `,
      )

      const pluginInstance = func(this.getPluginAPI(manifest.id))

      // 调用插件的初始化方法
      if (pluginInstance.onLoad) {
        await pluginInstance.onLoad()
      }

      return pluginInstance
    } catch (error) {
      throw new Error(`执行插件代码失败: ${error}`)
    }
  }

  // 事件系统
  private on(event: string, callback: EventListener): void {
    this.eventBus.addEventListener(event, callback)
  }

  private off(event: string, callback: EventListener): void {
    this.eventBus.removeEventListener(event, callback)
  }

  private emit(event: string, data?: any): void {
    this.eventBus.dispatchEvent(new CustomEvent(event, { detail: data }))
  }

  // 存储API
  private getPluginStorage(pluginId: string, key: string): any {
    const storageKey = `plugin_${pluginId}_${key}`
    const value = localStorage.getItem(storageKey)
    return value ? JSON.parse(value) : null
  }

  private setPluginStorage(pluginId: string, key: string, value: any): void {
    const storageKey = `plugin_${pluginId}_${key}`
    localStorage.setItem(storageKey, JSON.stringify(value))
  }

  private removePluginStorage(pluginId: string, key: string): void {
    const storageKey = `plugin_${pluginId}_${key}`
    localStorage.removeItem(storageKey)
  }

  private clearPluginStorage(pluginId: string): void {
    const prefix = `plugin_${pluginId}_`
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }

  // UI API
  private createUIPanel(pluginId: string, config: any): string {
    // 创建UI面板的实现
    const panelId = `plugin_panel_${pluginId}_${Date.now()}`
    // 这里应该集成到实际的UI系统中
    console.log(`创建UI面板: ${panelId}`, config)
    return panelId
  }

  private showNotification(message: string, type = "info"): void {
    // 显示通知的实现
    console.log(`通知 [${type}]: ${message}`)
  }

  private showModal(config: any): Promise<any> {
    // 显示模态框的实现
    return new Promise((resolve) => {
      console.log("显示模态框:", config)
      resolve(true)
    })
  }

  // 工具API
  private createHttpClient(pluginId: string): any {
    return {
      get: async (url: string, options?: any) => {
        // 实现HTTP GET请求
        return fetch(url, { ...options, method: "GET" })
      },
      post: async (url: string, data?: any, options?: any) => {
        // 实现HTTP POST请求
        return fetch(url, {
          ...options,
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
        })
      },
    }
  }

  private createCryptoUtils(): any {
    return {
      hash: async (data: string) => {
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(data)
        const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
      },
      uuid: () => {
        return crypto.randomUUID()
      },
    }
  }

  private createLogger(pluginId: string): any {
    return {
      info: (message: string, ...args: any[]) => {
        console.log(`[Plugin:${pluginId}] ${message}`, ...args)
      },
      warn: (message: string, ...args: any[]) => {
        console.warn(`[Plugin:${pluginId}] ${message}`, ...args)
      },
      error: (message: string, ...args: any[]) => {
        console.error(`[Plugin:${pluginId}] ${message}`, ...args)
      },
    }
  }
}

// 类型定义
export interface PluginManifest {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  main: string
  permissions?: string[]
  dependencies?: string[]
  engines?: {
    yanyu?: string
  }
  keywords?: string[]
  homepage?: string
  repository?: string
}

export interface PluginInstance {
  onLoad?(): Promise<void> | void
  onUnload?(): Promise<void> | void
  onEnable?(): Promise<void> | void
  onDisable?(): Promise<void> | void
  onMessage?(message: PluginMessage): Promise<any> | any
}

export interface LoadedPlugin {
  manifest: PluginManifest
  instance: PluginInstance
  sandbox: any
  status: "active" | "disabled" | "error"
  loadedAt: number
  hooks: Set<string>
  permissions: string[]
}

export interface PluginInfo {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  status: string
  loadedAt: number
  permissions: string[]
}

export interface PluginMessage {
  type: string
  data?: any
  from?: string
  to?: string
}

export interface PluginConfig {
  enableSandbox: boolean
  maxPlugins: number
  allowedDomains: string[]
  securityLevel: "strict" | "moderate" | "permissive"
  autoUpdate: boolean
}

export interface PluginAPI {
  registerHook(hookName: string, callback: HookCallback): void
  executeHook(hookName: string, data?: any): Promise<any[]>
  sendMessage(pluginId: string, message: PluginMessage): Promise<any>
  broadcastMessage(message: PluginMessage): Promise<void>
  on(event: string, callback: EventListener): void
  off(event: string, callback: EventListener): void
  emit(event: string, data?: any): void
  storage: {
    get(key: string): any
    set(key: string, value: any): void
    remove(key: string): void
    clear(): void
  }
  ui: {
    createPanel(config: any): string
    showNotification(message: string, type?: string): void
    showModal(config: any): Promise<any>
  }
  utils: {
    http: any
    crypto: any
    logger: any
  }
}

export type HookCallback = (data?: any) => Promise<any> | any

// 导出插件管理器实例
export const pluginManager = PluginManager.getInstance()
