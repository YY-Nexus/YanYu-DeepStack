"use client"

// PWA管理器 - 管理离线能力、缓存策略和更新
export class PWAManager {
  private static instance: PWAManager
  private config: PWAConfig
  private isOnline: boolean = navigator.onLine
  private offlineContent = new Map<string, any>()
  private syncQueue: SyncTask[] = []
  private eventListeners: Map<string, Function[]> = new Map()

  private constructor() {
    this.config = {
      cacheName: "yanyu-cloud-cache-v1",
      offlinePageUrl: "/offline",
      assetsToCache: ["/", "/offline", "/dashboard", "/api/models", "/images/logo.png", "/fonts/geist-regular.woff2"],
      syncInterval: 60000, // 60秒
      maxSyncRetries: 5,
      maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7天
      cacheStrategy: "network-first",
    }

    this.initializeListeners()
    this.loadOfflineContent()
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }

  // 初始化事件监听器
  private initializeListeners(): void {
    // 监听在线/离线状态变化
    window.addEventListener("online", () => {
      this.isOnline = true
      this.emit("online", { timestamp: Date.now() })
      this.processSyncQueue()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      this.emit("offline", { timestamp: Date.now() })
    })

    // 监听Service Worker消息
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        this.handleServiceWorkerMessage(event.data)
      })
    }
  }

  // 注册Service Worker
  public async registerServiceWorker(): Promise<boolean> {
    if (!("serviceWorker" in navigator)) {
      console.warn("浏览器不支持Service Worker")
      return false
    }

    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js")
      console.log("Service Worker注册成功:", registration.scope)

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              this.emit("update-available", { timestamp: Date.now() })
            }
          })
        }
      })

      return true
    } catch (error) {
      console.error("Service Worker注册失败:", error)
      return false
    }
  }

  // 检查更新
  public async checkForUpdates(): Promise<boolean> {
    if (!("serviceWorker" in navigator)) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        return true
      }
      return false
    } catch (error) {
      console.error("检查更新失败:", error)
      return false
    }
  }

  // 加载离线内容
  private async loadOfflineContent(): Promise<void> {
    try {
      const storedContent = localStorage.getItem("yanyu-offline-content")
      if (storedContent) {
        this.offlineContent = new Map(JSON.parse(storedContent))
      }
    } catch (error) {
      console.error("加载离线内容失败:", error)
    }
  }

  // 保存离线内容
  private saveOfflineContent(): void {
    try {
      const contentArray = Array.from(this.offlineContent.entries())
      localStorage.setItem("yanyu-offline-content", JSON.stringify(contentArray))
    } catch (error) {
      console.error("保存离线内容失败:", error)
    }
  }

  // 缓存资源
  public async cacheResources(urls: string[]): Promise<boolean> {
    if (!("caches" in window)) {
      return false
    }

    try {
      const cache = await caches.open(this.config.cacheName)
      await cache.addAll(urls)
      return true
    } catch (error) {
      console.error("缓存资源失败:", error)
      return false
    }
  }

  // 清除缓存
  public async clearCache(): Promise<boolean> {
    if (!("caches" in window)) {
      return false
    }

    try {
      await caches.delete(this.config.cacheName)
      return true
    } catch (error) {
      console.error("清除缓存失败:", error)
      return false
    }
  }

  // 添加离线内容
  public addOfflineContent(key: string, content: any): void {
    this.offlineContent.set(key, {
      content,
      timestamp: Date.now(),
    })
    this.saveOfflineContent()
  }

  // 获取离线内容
  public getOfflineContent(key: string): any | null {
    const item = this.offlineContent.get(key)
    if (!item) {
      return null
    }

    // 检查内容是否过期
    if (Date.now() - item.timestamp > this.config.maxCacheAge) {
      this.offlineContent.delete(key)
      this.saveOfflineContent()
      return null
    }

    return item.content
  }

  // 添加同步任务
  public addSyncTask(task: Omit<SyncTask, "id" | "createdAt" | "retries">): string {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const syncTask: SyncTask = {
      id,
      ...task,
      createdAt: Date.now(),
      retries: 0,
    }

    this.syncQueue.push(syncTask)
    this.saveSyncQueue()

    // 如果在线，立即尝试同步
    if (this.isOnline) {
      this.processSyncQueue()
    }

    return id
  }

  // 处理同步队列
  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return
    }

    const task = this.syncQueue[0]
    try {
      // 尝试执行同步任务
      const response = await fetch(task.url, {
        method: task.method,
        headers: task.headers,
        body: task.body ? JSON.stringify(task.body) : undefined,
      })

      if (response.ok) {
        // 任务成功，从队列中移除
        this.syncQueue.shift()
        this.saveSyncQueue()
        this.emit("sync-success", { taskId: task.id, timestamp: Date.now() })

        // 继续处理下一个任务
        if (this.syncQueue.length > 0) {
          setTimeout(() => this.processSyncQueue(), 1000)
        }
      } else {
        throw new Error(`同步失败: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error(`同步任务 ${task.id} 失败:`, error)

      // 增加重试次数
      task.retries++

      if (task.retries >= this.config.maxSyncRetries) {
        // 达到最大重试次数，移除任务
        this.syncQueue.shift()
        this.emit("sync-failed", { taskId: task.id, error, timestamp: Date.now() })
      } else {
        // 移动到队列末尾，稍后重试
        this.syncQueue.shift()
        this.syncQueue.push(task)
      }

      this.saveSyncQueue()

      // 继续处理下一个任务
      if (this.syncQueue.length > 0) {
        setTimeout(() => this.processSyncQueue(), 5000) // 5秒后重试
      }
    }
  }

  // 保存同步队列
  private saveSyncQueue(): void {
    try {
      localStorage.setItem("yanyu-sync-queue", JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error("保存同步队列失败:", error)
    }
  }

  // 加载同步队列
  private loadSyncQueue(): void {
    try {
      const storedQueue = localStorage.getItem("yanyu-sync-queue")
      if (storedQueue) {
        this.syncQueue = JSON.parse(storedQueue)
      }
    } catch (error) {
      console.error("加载同步队列失败:", error)
    }
  }

  // 处理Service Worker消息
  private handleServiceWorkerMessage(message: any): void {
    if (!message || !message.type) {
      return
    }

    switch (message.type) {
      case "cache-updated":
        this.emit("cache-updated", message.data)
        break

      case "update-available":
        this.emit("update-available", message.data)
        break

      case "offline-ready":
        this.emit("offline-ready", message.data)
        break

      default:
        break
    }
  }

  // 发送消息到Service Worker
  public async sendMessageToSW(message: any): Promise<any> {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
      return null
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data)
      }

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2])
    })
  }

  // 事件系统
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  public off(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      return
    }
    const listeners = this.eventListeners.get(event)!
    const index = listeners.indexOf(callback)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }

  private emit(event: string, data: any): void {
    if (!this.eventListeners.has(event)) {
      return
    }
    this.eventListeners.get(event)!.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error(`执行事件 ${event} 回调失败:`, error)
      }
    })
  }

  // 获取网络状态
  public isNetworkOnline(): boolean {
    return this.isOnline
  }

  // 获取PWA状态
  public getPWAStatus(): PWAStatus {
    return {
      isOnline: this.isOnline,
      isSWRegistered: "serviceWorker" in navigator && !!navigator.serviceWorker.controller,
      syncQueueLength: this.syncQueue.length,
      offlineContentCount: this.offlineContent.size,
      lastUpdated: localStorage.getItem("yanyu-pwa-last-updated") || null,
    }
  }
}

// 类型定义
export interface PWAConfig {
  cacheName: string
  offlinePageUrl: string
  assetsToCache: string[]
  syncInterval: number
  maxSyncRetries: number
  maxCacheAge: number
  cacheStrategy: "cache-first" | "network-first" | "stale-while-revalidate"
}

export interface SyncTask {
  id: string
  url: string
  method: string
  headers: Record<string, string>
  body?: any
  createdAt: number
  retries: number
}

export interface PWAStatus {
  isOnline: boolean
  isSWRegistered: boolean
  syncQueueLength: number
  offlineContentCount: number
  lastUpdated: string | null
}

// 导出PWA管理器实例
export const pwaManager = PWAManager.getInstance()
