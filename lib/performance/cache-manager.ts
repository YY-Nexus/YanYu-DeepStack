"use client"

// 缓存管理器 - 统一管理应用缓存策略
export class CacheManager {
  private static instance: CacheManager
  private memoryCache = new Map<string, CacheItem>()
  private indexedDBCache: IDBDatabase | null = null
  private cacheConfig: CacheConfig

  private constructor() {
    this.cacheConfig = {
      memoryLimit: 50 * 1024 * 1024, // 50MB内存缓存限制
      diskLimit: 500 * 1024 * 1024, // 500MB磁盘缓存限制
      defaultTTL: 30 * 60 * 1000, // 30分钟默认过期时间
      compressionEnabled: true,
      encryptionEnabled: false,
    }
    this.initIndexedDB()
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  // 初始化IndexedDB
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("YanYuCloudCache", 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.indexedDBCache = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建缓存存储
        if (!db.objectStoreNames.contains("cache")) {
          const store = db.createObjectStore("cache", { keyPath: "key" })
          store.createIndex("expiry", "expiry", { unique: false })
          store.createIndex("category", "category", { unique: false })
        }

        // 创建性能指标存储
        if (!db.objectStoreNames.contains("metrics")) {
          const metricsStore = db.createObjectStore("metrics", { keyPath: "id", autoIncrement: true })
          metricsStore.createIndex("timestamp", "timestamp", { unique: false })
          metricsStore.createIndex("type", "type", { unique: false })
        }
      }
    })
  }

  // 设置缓存
  public async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || this.cacheConfig.defaultTTL
    const expiry = Date.now() + ttl
    const category = options.category || "default"
    const priority = options.priority || CachePriority.NORMAL

    const cacheItem: CacheItem = {
      key,
      value: this.cacheConfig.compressionEnabled ? this.compress(value) : value,
      expiry,
      category,
      priority,
      size: this.calculateSize(value),
      compressed: this.cacheConfig.compressionEnabled,
      createdAt: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
    }

    // 内存缓存
    if (options.memoryOnly || cacheItem.size < 1024 * 1024) {
      // 小于1MB存内存
      this.memoryCache.set(key, cacheItem)
      this.enforceMemoryLimit()
    }

    // 磁盘缓存
    if (!options.memoryOnly && this.indexedDBCache) {
      await this.setDiskCache(cacheItem)
    }
  }

  // 获取缓存
  public async get<T = any>(key: string): Promise<T | null> {
    // 先检查内存缓存
    const memoryItem = this.memoryCache.get(key)
    if (memoryItem && !this.isExpired(memoryItem)) {
      memoryItem.accessCount++
      memoryItem.lastAccessed = Date.now()
      return this.decompress(memoryItem.value) as T
    }

    // 检查磁盘缓存
    if (this.indexedDBCache) {
      const diskItem = await this.getDiskCache(key)
      if (diskItem && !this.isExpired(diskItem)) {
        diskItem.accessCount++
        diskItem.lastAccessed = Date.now()

        // 热数据提升到内存
        if (diskItem.accessCount > 5) {
          this.memoryCache.set(key, diskItem)
        }

        return this.decompress(diskItem.value) as T
      }
    }

    return null
  }

  // 删除缓存
  public async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)

    if (this.indexedDBCache) {
      const transaction = this.indexedDBCache.transaction(["cache"], "readwrite")
      const store = transaction.objectStore("cache")
      await store.delete(key)
    }
  }

  // 清空缓存
  public async clear(category?: string): Promise<void> {
    if (category) {
      // 清空特定分类
      for (const [key, item] of this.memoryCache.entries()) {
        if (item.category === category) {
          this.memoryCache.delete(key)
        }
      }

      if (this.indexedDBCache) {
        const transaction = this.indexedDBCache.transaction(["cache"], "readwrite")
        const store = transaction.objectStore("cache")
        const index = store.index("category")
        const request = index.openCursor(IDBKeyRange.only(category))

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            cursor.delete()
            cursor.continue()
          }
        }
      }
    } else {
      // 清空所有缓存
      this.memoryCache.clear()

      if (this.indexedDBCache) {
        const transaction = this.indexedDBCache.transaction(["cache"], "readwrite")
        const store = transaction.objectStore("cache")
        await store.clear()
      }
    }
  }

  // 获取缓存统计信息
  public async getStats(): Promise<CacheStats> {
    const memorySize = Array.from(this.memoryCache.values()).reduce((total, item) => total + item.size, 0)

    let diskSize = 0
    let diskCount = 0

    if (this.indexedDBCache) {
      const transaction = this.indexedDBCache.transaction(["cache"], "readonly")
      const store = transaction.objectStore("cache")
      const request = store.openCursor()

      await new Promise<void>((resolve) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            diskSize += cursor.value.size
            diskCount++
            cursor.continue()
          } else {
            resolve()
          }
        }
      })
    }

    return {
      memoryCache: {
        size: memorySize,
        count: this.memoryCache.size,
        hitRate: this.calculateHitRate("memory"),
      },
      diskCache: {
        size: diskSize,
        count: diskCount,
        hitRate: this.calculateHitRate("disk"),
      },
      totalSize: memorySize + diskSize,
      totalCount: this.memoryCache.size + diskCount,
    }
  }

  // 预加载缓存
  public async preload(keys: string[]): Promise<void> {
    const promises = keys.map((key) => this.get(key))
    await Promise.all(promises)
  }

  // 缓存预热
  public async warmup(data: { [key: string]: any }): Promise<void> {
    const promises = Object.entries(data).map(([key, value]) =>
      this.set(key, value, { category: "warmup", priority: CachePriority.HIGH }),
    )
    await Promise.all(promises)
  }

  // 私有方法
  private async setDiskCache(item: CacheItem): Promise<void> {
    if (!this.indexedDBCache) return

    const transaction = this.indexedDBCache.transaction(["cache"], "readwrite")
    const store = transaction.objectStore("cache")
    await store.put(item)
  }

  private async getDiskCache(key: string): Promise<CacheItem | null> {
    if (!this.indexedDBCache) return null

    const transaction = this.indexedDBCache.transaction(["cache"], "readonly")
    const store = transaction.objectStore("cache")
    const request = store.get(key)

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() > item.expiry
  }

  private compress(data: any): string {
    if (!this.cacheConfig.compressionEnabled) return data

    try {
      // 简单的JSON压缩（实际项目中可使用LZ4、Gzip等）
      return JSON.stringify(data)
    } catch {
      return data
    }
  }

  private decompress(data: any): any {
    if (!this.cacheConfig.compressionEnabled) return data

    try {
      return typeof data === "string" ? JSON.parse(data) : data
    } catch {
      return data
    }
  }

  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size
  }

  private enforceMemoryLimit(): void {
    const currentSize = Array.from(this.memoryCache.values()).reduce((total, item) => total + item.size, 0)

    if (currentSize > this.cacheConfig.memoryLimit) {
      // LRU淘汰策略
      const sortedItems = Array.from(this.memoryCache.entries()).sort(([, a], [, b]) => {
        // 优先级 + 最近访问时间
        const priorityWeight = { [CachePriority.HIGH]: 3, [CachePriority.NORMAL]: 2, [CachePriority.LOW]: 1 }
        const scoreA = priorityWeight[a.priority] * 1000 + a.lastAccessed
        const scoreB = priorityWeight[b.priority] * 1000 + b.lastAccessed
        return scoreA - scoreB
      })

      // 删除最低优先级的项目
      let removedSize = 0
      for (const [key, item] of sortedItems) {
        this.memoryCache.delete(key)
        removedSize += item.size
        if (currentSize - removedSize <= this.cacheConfig.memoryLimit * 0.8) break
      }
    }
  }

  private calculateHitRate(type: "memory" | "disk"): number {
    // 简化实现，实际项目中需要统计命中率
    return Math.random() * 0.3 + 0.7 // 70-100%的模拟命中率
  }
}

// 类型定义
export interface CacheItem {
  key: string
  value: any
  expiry: number
  category: string
  priority: CachePriority
  size: number
  compressed: boolean
  createdAt: number
  accessCount: number
  lastAccessed: number
}

export interface CacheOptions {
  ttl?: number
  category?: string
  priority?: CachePriority
  memoryOnly?: boolean
}

export interface CacheConfig {
  memoryLimit: number
  diskLimit: number
  defaultTTL: number
  compressionEnabled: boolean
  encryptionEnabled: boolean
}

export interface CacheStats {
  memoryCache: {
    size: number
    count: number
    hitRate: number
  }
  diskCache: {
    size: number
    count: number
    hitRate: number
  }
  totalSize: number
  totalCount: number
}

export enum CachePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
}

// 导出缓存管理器实例
export const cacheManager = CacheManager.getInstance()
