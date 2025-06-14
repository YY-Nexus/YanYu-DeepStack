"use client"

// 性能监控器 - 监控应用性能指标
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []
  private config: PerformanceConfig

  private constructor() {
    this.config = {
      enableAutoCollection: true,
      metricsRetentionDays: 7,
      samplingRate: 1.0,
      enableRealTimeAlerts: true,
      thresholds: {
        fcp: 2000, // First Contentful Paint
        lcp: 4000, // Largest Contentful Paint
        fid: 100, // First Input Delay
        cls: 0.1, // Cumulative Layout Shift
        ttfb: 800, // Time to First Byte
      },
    }

    if (typeof window !== "undefined") {
      this.initializeMonitoring()
    }
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 初始化性能监控
  private initializeMonitoring(): void {
    this.setupWebVitalsObserver()
    this.setupNavigationObserver()
    this.setupResourceObserver()
    this.setupLongTaskObserver()
    this.setupMemoryMonitoring()
    this.setupCustomMetrics()
  }

  // 设置Web Vitals观察器
  private setupWebVitalsObserver(): void {
    if ("PerformanceObserver" in window) {
      // FCP (First Contentful Paint)
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            this.recordMetric({
              name: "FCP",
              value: entry.startTime,
              timestamp: Date.now(),
              type: "web-vital",
              category: "loading",
              threshold: this.config.thresholds.fcp,
            })
          }
        }
      })
      fcpObserver.observe({ entryTypes: ["paint"] })
      this.observers.push(fcpObserver)

      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordMetric({
          name: "LCP",
          value: lastEntry.startTime,
          timestamp: Date.now(),
          type: "web-vital",
          category: "loading",
          threshold: this.config.thresholds.lcp,
        })
      })
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
      this.observers.push(lcpObserver)

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: "FID",
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            type: "web-vital",
            category: "interactivity",
            threshold: this.config.thresholds.fid,
          })
        }
      })
      fidObserver.observe({ entryTypes: ["first-input"] })
      this.observers.push(fidObserver)

      // CLS (Cumulative Layout Shift)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.recordMetric({
          name: "CLS",
          value: clsValue,
          timestamp: Date.now(),
          type: "web-vital",
          category: "visual-stability",
          threshold: this.config.thresholds.cls,
        })
      })
      clsObserver.observe({ entryTypes: ["layout-shift"] })
      this.observers.push(clsObserver)
    }
  }

  // 设置导航性能观察器
  private setupNavigationObserver(): void {
    if ("PerformanceObserver" in window) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming

          this.recordMetric({
            name: "TTFB",
            value: navEntry.responseStart - navEntry.requestStart,
            timestamp: Date.now(),
            type: "navigation",
            category: "loading",
            threshold: this.config.thresholds.ttfb,
          })

          this.recordMetric({
            name: "DOM_LOAD",
            value: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            timestamp: Date.now(),
            type: "navigation",
            category: "loading",
          })

          this.recordMetric({
            name: "WINDOW_LOAD",
            value: navEntry.loadEventEnd - navEntry.loadEventStart,
            timestamp: Date.now(),
            type: "navigation",
            category: "loading",
          })
        }
      })
      navObserver.observe({ entryTypes: ["navigation"] })
      this.observers.push(navObserver)
    }
  }

  // 设置资源性能观察器
  private setupResourceObserver(): void {
    if ("PerformanceObserver" in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming

          this.recordMetric({
            name: "RESOURCE_LOAD",
            value: resourceEntry.responseEnd - resourceEntry.startTime,
            timestamp: Date.now(),
            type: "resource",
            category: "loading",
            details: {
              name: resourceEntry.name,
              type: this.getResourceType(resourceEntry.name),
              size: resourceEntry.transferSize,
              cached: resourceEntry.transferSize === 0,
            },
          })
        }
      })
      resourceObserver.observe({ entryTypes: ["resource"] })
      this.observers.push(resourceObserver)
    }
  }

  // 设置长任务观察器
  private setupLongTaskObserver(): void {
    if ("PerformanceObserver" in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: "LONG_TASK",
            value: entry.duration,
            timestamp: Date.now(),
            type: "long-task",
            category: "performance",
            details: {
              startTime: entry.startTime,
              duration: entry.duration,
            },
          })
        }
      })
      longTaskObserver.observe({ entryTypes: ["longtask"] })
      this.observers.push(longTaskObserver)
    }
  }

  // 设置内存监控
  private setupMemoryMonitoring(): void {
    if ("memory" in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.recordMetric({
          name: "MEMORY_USAGE",
          value: memory.usedJSHeapSize,
          timestamp: Date.now(),
          type: "memory",
          category: "resource",
          details: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
          },
        })
      }, 30000) // 每30秒检查一次
    }
  }

  // 设置自定义指标
  private setupCustomMetrics(): void {
    // 监控React组件渲染时间
    this.setupReactPerformanceMonitoring()

    // 监控API请求性能
    this.setupAPIPerformanceMonitoring()

    // 监控用户交互性能
    this.setupInteractionMonitoring()
  }

  // React性能监控
  private setupReactPerformanceMonitoring(): void {
    // 使用React Profiler API监控组件性能
    if (typeof window !== "undefined" && (window as any).React) {
      const originalProfiler = (window as any).React.Profiler
      if (originalProfiler) {
        ;(window as any).React.Profiler = (props: any) => {
          return originalProfiler({
            ...props,
            onRender: (id: string, phase: string, actualDuration: number) => {
              this.recordMetric({
                name: "REACT_RENDER",
                value: actualDuration,
                timestamp: Date.now(),
                type: "react",
                category: "performance",
                details: {
                  componentId: id,
                  phase,
                  duration: actualDuration,
                },
              })

              if (props.onRender) {
                props.onRender(id, phase, actualDuration)
              }
            },
          })
        }
      }
    }
  }

  // API性能监控
  private setupAPIPerformanceMonitoring(): void {
    // 拦截fetch请求
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      const url = typeof args[0] === "string" ? args[0] : args[0].url

      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()

        this.recordMetric({
          name: "API_REQUEST",
          value: endTime - startTime,
          timestamp: Date.now(),
          type: "api",
          category: "network",
          details: {
            url,
            method: args[1]?.method || "GET",
            status: response.status,
            success: response.ok,
            duration: endTime - startTime,
          },
        })

        return response
      } catch (error) {
        const endTime = performance.now()

        this.recordMetric({
          name: "API_REQUEST",
          value: endTime - startTime,
          timestamp: Date.now(),
          type: "api",
          category: "network",
          details: {
            url,
            method: args[1]?.method || "GET",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            duration: endTime - startTime,
          },
        })

        throw error
      }
    }
  }

  // 用户交互监控
  private setupInteractionMonitoring(): void {
    const interactionTypes = ["click", "keydown", "scroll", "touchstart"]

    interactionTypes.forEach((type) => {
      document.addEventListener(
        type,
        (event) => {
          const startTime = performance.now()

          // 使用requestIdleCallback或setTimeout来测量交互响应时间
          requestAnimationFrame(() => {
            const endTime = performance.now()

            this.recordMetric({
              name: "USER_INTERACTION",
              value: endTime - startTime,
              timestamp: Date.now(),
              type: "interaction",
              category: "user-experience",
              details: {
                type,
                target: (event.target as Element)?.tagName || "unknown",
                duration: endTime - startTime,
              },
            })
          })
        },
        { passive: true },
      )
    })
  }

  // 记录性能指标
  public recordMetric(metric: Omit<PerformanceMetric, "id">): void {
    if (Math.random() > this.config.samplingRate) return

    const fullMetric: PerformanceMetric = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    this.metrics.push(fullMetric)

    // 检查阈值并发送警报
    if (this.config.enableRealTimeAlerts && metric.threshold && metric.value > metric.threshold) {
      this.sendAlert(fullMetric)
    }

    // 清理过期指标
    this.cleanupOldMetrics()

    // 发送到分析服务（可选）
    this.sendToAnalytics(fullMetric)
  }

  // 获取性能报告
  public getPerformanceReport(timeRange?: { start: number; end: number }): PerformanceReport {
    const filteredMetrics = timeRange
      ? this.metrics.filter((m) => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end)
      : this.metrics

    const report: PerformanceReport = {
      summary: this.calculateSummary(filteredMetrics),
      webVitals: this.calculateWebVitals(filteredMetrics),
      resourcePerformance: this.calculateResourcePerformance(filteredMetrics),
      userExperience: this.calculateUserExperience(filteredMetrics),
      recommendations: this.generateRecommendations(filteredMetrics),
      timestamp: Date.now(),
    }

    return report
  }

  // 获取实时性能数据
  public getRealTimeMetrics(): RealtimeMetrics {
    const recentMetrics = this.metrics.filter((m) => Date.now() - m.timestamp < 60000) // 最近1分钟

    return {
      currentMemoryUsage: this.getCurrentMemoryUsage(),
      activeConnections: this.getActiveConnections(),
      recentErrors: this.getRecentErrors(recentMetrics),
      performanceScore: this.calculatePerformanceScore(recentMetrics),
      timestamp: Date.now(),
    }
  }

  // 私有方法
  private getResourceType(url: string): string {
    const extension = url.split(".").pop()?.toLowerCase()

    if (["js", "mjs"].includes(extension || "")) return "script"
    if (["css"].includes(extension || "")) return "stylesheet"
    if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension || "")) return "image"
    if (["woff", "woff2", "ttf", "otf"].includes(extension || "")) return "font"
    if (["json", "xml"].includes(extension || "")) return "data"

    return "other"
  }

  private sendAlert(metric: PerformanceMetric): void {
    console.warn(`Performance Alert: ${metric.name} exceeded threshold`, {
      value: metric.value,
      threshold: metric.threshold,
      metric,
    })

    // 这里可以集成实际的告警系统
    // 例如发送到监控服务、邮件通知等
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.config.metricsRetentionDays * 24 * 60 * 60 * 1000
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoffTime)
  }

  private sendToAnalytics(metric: PerformanceMetric): void {
    // 发送到分析服务（如Google Analytics、自定义分析服务等）
    if (typeof gtag !== "undefined") {
      gtag("event", "performance_metric", {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_type: metric.type,
        metric_category: metric.category,
      })
    }
  }

  private calculateSummary(metrics: PerformanceMetric[]): PerformanceSummary {
    return {
      totalMetrics: metrics.length,
      averageLoadTime: this.calculateAverage(
        metrics.filter((m) => m.category === "loading"),
        "value",
      ),
      errorRate: this.calculateErrorRate(metrics),
      performanceScore: this.calculatePerformanceScore(metrics),
    }
  }

  private calculateWebVitals(metrics: PerformanceMetric[]): WebVitalsReport {
    const webVitalMetrics = metrics.filter((m) => m.type === "web-vital")

    return {
      fcp: this.getLatestMetricValue(webVitalMetrics, "FCP"),
      lcp: this.getLatestMetricValue(webVitalMetrics, "LCP"),
      fid: this.getLatestMetricValue(webVitalMetrics, "FID"),
      cls: this.getLatestMetricValue(webVitalMetrics, "CLS"),
      ttfb: this.getLatestMetricValue(webVitalMetrics, "TTFB"),
    }
  }

  private calculateResourcePerformance(metrics: PerformanceMetric[]): ResourcePerformanceReport {
    const resourceMetrics = metrics.filter((m) => m.type === "resource")

    return {
      totalRequests: resourceMetrics.length,
      averageLoadTime: this.calculateAverage(resourceMetrics, "value"),
      cacheHitRate: this.calculateCacheHitRate(resourceMetrics),
      largestResources: this.getLargestResources(resourceMetrics),
    }
  }

  private calculateUserExperience(metrics: PerformanceMetric[]): UserExperienceReport {
    const interactionMetrics = metrics.filter((m) => m.type === "interaction")

    return {
      averageInteractionTime: this.calculateAverage(interactionMetrics, "value"),
      totalInteractions: interactionMetrics.length,
      slowInteractions: interactionMetrics.filter((m) => m.value > 100).length,
    }
  }

  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = []

    // 基于指标生成建议
    const webVitals = this.calculateWebVitals(metrics)

    if (webVitals.fcp && webVitals.fcp > 2000) {
      recommendations.push("优化首次内容绘制时间：考虑减少关键资源大小或使用CDN")
    }

    if (webVitals.lcp && webVitals.lcp > 4000) {
      recommendations.push("优化最大内容绘制时间：优化图片加载或使用懒加载")
    }

    if (webVitals.fid && webVitals.fid > 100) {
      recommendations.push("优化首次输入延迟：减少JavaScript执行时间或使用Web Workers")
    }

    if (webVitals.cls && webVitals.cls > 0.1) {
      recommendations.push("优化累积布局偏移：为图片和广告设置固定尺寸")
    }

    const memoryMetrics = metrics.filter((m) => m.name === "MEMORY_USAGE")
    if (memoryMetrics.length > 0) {
      const latestMemory = memoryMetrics[memoryMetrics.length - 1]
      if (latestMemory.details?.percentage > 80) {
        recommendations.push("内存使用率过高：检查内存泄漏或优化数据结构")
      }
    }

    return recommendations
  }

  private calculateAverage(metrics: PerformanceMetric[], field: keyof PerformanceMetric): number {
    if (metrics.length === 0) return 0
    const sum = metrics.reduce((acc, metric) => acc + (metric[field] as number), 0)
    return sum / metrics.length
  }

  private calculateErrorRate(metrics: PerformanceMetric[]): number {
    const apiMetrics = metrics.filter((m) => m.type === "api")
    if (apiMetrics.length === 0) return 0

    const errorCount = apiMetrics.filter((m) => m.details?.success === false).length
    return (errorCount / apiMetrics.length) * 100
  }

  private calculatePerformanceScore(metrics: PerformanceMetric[]): number {
    // 简化的性能评分算法
    const webVitals = this.calculateWebVitals(metrics)
    let score = 100

    if (webVitals.fcp && webVitals.fcp > 2000) score -= 10
    if (webVitals.lcp && webVitals.lcp > 4000) score -= 15
    if (webVitals.fid && webVitals.fid > 100) score -= 10
    if (webVitals.cls && webVitals.cls > 0.1) score -= 15

    return Math.max(0, score)
  }

  private getLatestMetricValue(metrics: PerformanceMetric[], name: string): number | null {
    const filtered = metrics.filter((m) => m.name === name)
    return filtered.length > 0 ? filtered[filtered.length - 1].value : null
  }

  private getCurrentMemoryUsage(): number {
    if ("memory" in performance) {
      const memory = (performance as any).memory
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
    return 0
  }

  private getActiveConnections(): number {
    // 简化实现，实际项目中需要更复杂的连接跟踪
    return navigator.onLine ? 1 : 0
  }

  private getRecentErrors(metrics: PerformanceMetric[]): number {
    return metrics.filter((m) => m.details?.success === false).length
  }

  private calculateCacheHitRate(resourceMetrics: PerformanceMetric[]): number {
    const cachedResources = resourceMetrics.filter((m) => m.details?.cached === true)
    return resourceMetrics.length > 0 ? (cachedResources.length / resourceMetrics.length) * 100 : 0
  }

  private getLargestResources(resourceMetrics: PerformanceMetric[]): Array<{ name: string; size: number }> {
    return resourceMetrics
      .filter((m) => m.details?.size)
      .sort((a, b) => (b.details?.size || 0) - (a.details?.size || 0))
      .slice(0, 5)
      .map((m) => ({
        name: m.details?.name || "unknown",
        size: m.details?.size || 0,
      }))
  }

  // 清理资源
  public destroy(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
    this.metrics = []
  }
}

// 类型定义
export interface PerformanceMetric {
  id: string
  name: string
  value: number
  timestamp: number
  type: string
  category: string
  threshold?: number
  details?: any
}

export interface PerformanceConfig {
  enableAutoCollection: boolean
  metricsRetentionDays: number
  samplingRate: number
  enableRealTimeAlerts: boolean
  thresholds: {
    fcp: number
    lcp: number
    fid: number
    cls: number
    ttfb: number
  }
}

export interface PerformanceReport {
  summary: PerformanceSummary
  webVitals: WebVitalsReport
  resourcePerformance: ResourcePerformanceReport
  userExperience: UserExperienceReport
  recommendations: string[]
  timestamp: number
}

export interface PerformanceSummary {
  totalMetrics: number
  averageLoadTime: number
  errorRate: number
  performanceScore: number
}

export interface WebVitalsReport {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

export interface ResourcePerformanceReport {
  totalRequests: number
  averageLoadTime: number
  cacheHitRate: number
  largestResources: Array<{ name: string; size: number }>
}

export interface UserExperienceReport {
  averageInteractionTime: number
  totalInteractions: number
  slowInteractions: number
}

export interface RealtimeMetrics {
  currentMemoryUsage: number
  activeConnections: number
  recentErrors: number
  performanceScore: number
  timestamp: number
}

// 导出性能监控器实例

declare global {
  interface Window {
    gtag: any
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()
