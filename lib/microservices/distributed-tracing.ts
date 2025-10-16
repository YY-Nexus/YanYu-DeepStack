"use client"

// 分布式追踪系统 - OpenTelemetry实现
export class DistributedTracing {
  private static instance: DistributedTracing
  private traces = new Map<string, Trace>()
  private spans = new Map<string, Span>()
  private config: TracingConfig
  private exporters: TraceExporter[] = []

  private constructor() {
    this.config = {
      serviceName: "yanyu-cloud",
      serviceVersion: "1.0.0",
      environment: "production",
      samplingRate: 1.0, // 100%采样
      enableMetrics: true,
      enableLogs: true,
      batchSize: 100,
      exportInterval: 5000,
      maxSpanCount: 1000,
    }

    this.initializeExporters()
    this.startBatchExport()
  }

  public static getInstance(): DistributedTracing {
    if (!DistributedTracing.instance) {
      DistributedTracing.instance = new DistributedTracing()
    }
    return DistributedTracing.instance
  }

  // 初始化导出器
  private initializeExporters(): void {
    // 控制台导出器
    this.exporters.push(new ConsoleTraceExporter())

    // Jaeger导出器
    if (process.env.JAEGER_ENDPOINT) {
      this.exporters.push(new JaegerTraceExporter(process.env.JAEGER_ENDPOINT))
    }

    // Zipkin导出器
    if (process.env.ZIPKIN_ENDPOINT) {
      this.exporters.push(new ZipkinTraceExporter(process.env.ZIPKIN_ENDPOINT))
    }

    // 自定义导出器
    this.exporters.push(new CustomTraceExporter())
  }

  // 开始追踪
  public startTrace(operationName: string, options?: TraceOptions): Trace {
    const traceId = this.generateTraceId()
    const trace: Trace = {
      traceId,
      operationName,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      status: "active",
      spans: [],
      tags: options?.tags || {},
      baggage: options?.baggage || {},
      serviceName: this.config.serviceName,
      serviceVersion: this.config.serviceVersion,
      environment: this.config.environment,
    }

    this.traces.set(traceId, trace)

    // 创建根Span
    const rootSpan = this.startSpan(operationName, { traceId, parentSpanId: null })
    trace.spans.push(rootSpan.spanId)

    return trace
  }

  // 开始Span
  public startSpan(operationName: string, options?: SpanOptions): Span {
    const spanId = this.generateSpanId()
    const traceId = options?.traceId || this.generateTraceId()

    const span: Span = {
      spanId,
      traceId,
      parentSpanId: options?.parentSpanId || null,
      operationName,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      status: "active",
      tags: options?.tags || {},
      logs: [],
      references: options?.references || [],
      serviceName: this.config.serviceName,
      kind: options?.kind || "internal",
    }

    this.spans.set(spanId, span)

    // 如果有父Span，添加引用
    if (options?.parentSpanId) {
      span.references.push({
        type: "child_of",
        spanId: options.parentSpanId,
      })
    }

    return span
  }

  // 结束Span
  public finishSpan(spanId: string, options?: FinishSpanOptions): void {
    const span = this.spans.get(spanId)
    if (!span) return

    span.endTime = Date.now()
    span.duration = span.endTime - span.startTime
    span.status = options?.status || "ok"

    if (options?.error) {
      span.tags.error = true
      span.tags["error.message"] = options.error.message
      span.tags["error.stack"] = options.error.stack
      span.status = "error"
    }

    if (options?.tags) {
      span.tags = { ...span.tags, ...options.tags }
    }

    // 添加日志
    if (options?.logs) {
      span.logs.push(...options.logs)
    }

    // 更新追踪状态
    const trace = this.traces.get(span.traceId)
    if (trace) {
      const allSpansFinished = trace.spans.every((id) => {
        const s = this.spans.get(id)
        return s && s.endTime !== null
      })

      if (allSpansFinished) {
        this.finishTrace(span.traceId)
      }
    }
  }

  // 结束追踪
  public finishTrace(traceId: string): void {
    const trace = this.traces.get(traceId)
    if (!trace) return

    trace.endTime = Date.now()
    trace.duration = trace.endTime - trace.startTime

    // 计算追踪状态
    const hasErrors = trace.spans.some((spanId) => {
      const span = this.spans.get(spanId)
      return span && span.status === "error"
    })

    trace.status = hasErrors ? "error" : "ok"

    // 导出追踪数据
    this.exportTrace(trace)
  }

  // 添加Span标签
  public setSpanTag(spanId: string, key: string, value: any): void {
    const span = this.spans.get(spanId)
    if (span) {
      span.tags[key] = value
    }
  }

  // 添加Span日志
  public logSpan(spanId: string, log: SpanLog): void {
    const span = this.spans.get(spanId)
    if (span) {
      span.logs.push({
        ...log,
        timestamp: log.timestamp || Date.now(),
      })
    }
  }

  // 注入追踪上下文
  public inject(span: Span, format: string, carrier: any): void {
    switch (format) {
      case "http_headers":
        carrier["x-trace-id"] = span.traceId
        carrier["x-span-id"] = span.spanId
        carrier["x-parent-span-id"] = span.parentSpanId || ""
        break
      case "text_map":
        carrier.traceId = span.traceId
        carrier.spanId = span.spanId
        carrier.parentSpanId = span.parentSpanId || ""
        break
    }
  }

  // 提取追踪上下文
  public extract(format: string, carrier: any): SpanContext | null {
    switch (format) {
      case "http_headers":
        const traceId = carrier["x-trace-id"]
        const spanId = carrier["x-span-id"]
        const parentSpanId = carrier["x-parent-span-id"]

        if (traceId && spanId) {
          return {
            traceId,
            spanId,
            parentSpanId: parentSpanId || null,
          }
        }
        break
      case "text_map":
        if (carrier.traceId && carrier.spanId) {
          return {
            traceId: carrier.traceId,
            spanId: carrier.spanId,
            parentSpanId: carrier.parentSpanId || null,
          }
        }
        break
    }
    return null
  }

  // 创建子Span
  public createChildSpan(parentSpanId: string, operationName: string, options?: SpanOptions): Span {
    const parentSpan = this.spans.get(parentSpanId)
    if (!parentSpan) {
      throw new Error(`父Span不存在: ${parentSpanId}`)
    }

    return this.startSpan(operationName, {
      ...options,
      traceId: parentSpan.traceId,
      parentSpanId: parentSpanId,
    })
  }

  // 获取当前活跃的Span
  public getActiveSpan(): Span | null {
    // 简化实现，实际应该使用上下文管理
    const activeSpans = Array.from(this.spans.values()).filter((span) => span.status === "active")
    return activeSpans.length > 0 ? activeSpans[activeSpans.length - 1] : null
  }

  // 导出追踪数据
  private exportTrace(trace: Trace): void {
    if (Math.random() > this.config.samplingRate) {
      return // 采样丢弃
    }

    const traceData: TraceData = {
      trace,
      spans: trace.spans.map((spanId) => this.spans.get(spanId)!).filter(Boolean),
      timestamp: Date.now(),
    }

    // 发送到所有导出器
    this.exporters.forEach((exporter) => {
      try {
        exporter.export(traceData)
      } catch (error) {
        console.error("追踪数据导出失败:", error)
      }
    })

    // 清理已完成的追踪数据
    this.cleanupTrace(trace.traceId)
  }

  // 清理追踪数据
  private cleanupTrace(traceId: string): void {
    const trace = this.traces.get(traceId)
    if (trace) {
      // 删除相关的Span
      trace.spans.forEach((spanId) => {
        this.spans.delete(spanId)
      })
      // 删除追踪
      this.traces.delete(traceId)
    }
  }

  // 批量导出
  private startBatchExport(): void {
    setInterval(() => {
      const completedTraces = Array.from(this.traces.values()).filter((trace) => trace.status !== "active")

      if (completedTraces.length >= this.config.batchSize) {
        completedTraces.slice(0, this.config.batchSize).forEach((trace) => {
          this.exportTrace(trace)
        })
      }
    }, this.config.exportInterval)
  }

  // 生成追踪ID
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
  }

  // 生成SpanID
  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`
  }

  // 获取追踪统计信息
  public getTracingStats(): TracingStats {
    const activeTraces = Array.from(this.traces.values()).filter((trace) => trace.status === "active")
    const completedTraces = Array.from(this.traces.values()).filter((trace) => trace.status !== "active")
    const errorTraces = completedTraces.filter((trace) => trace.status === "error")

    return {
      activeTraces: activeTraces.length,
      completedTraces: completedTraces.length,
      errorTraces: errorTraces.length,
      totalSpans: this.spans.size,
      averageTraceDuration: this.calculateAverageTraceDuration(completedTraces),
      errorRate: completedTraces.length > 0 ? errorTraces.length / completedTraces.length : 0,
      samplingRate: this.config.samplingRate,
    }
  }

  // 计算平均追踪时长
  private calculateAverageTraceDuration(traces: Trace[]): number {
    if (traces.length === 0) return 0

    const totalDuration = traces.reduce((sum, trace) => sum + (trace.duration || 0), 0)
    return totalDuration / traces.length
  }

  // 搜索追踪
  public searchTraces(query: TraceQuery): Trace[] {
    let results = Array.from(this.traces.values())

    if (query.serviceName) {
      results = results.filter((trace) => trace.serviceName === query.serviceName)
    }

    if (query.operationName) {
      results = results.filter((trace) => trace.operationName && trace.operationName.includes(query.operationName!))
    }

    if (query.startTime && query.endTime) {
      results = results.filter((trace) => trace.startTime >= query.startTime! && trace.startTime <= query.endTime!)
    }

    if (query.minDuration) {
      results = results.filter((trace) => (trace.duration || 0) >= query.minDuration!)
    }

    if (query.maxDuration) {
      results = results.filter((trace) => (trace.duration || 0) <= query.maxDuration!)
    }

    if (query.status) {
      results = results.filter((trace) => trace.status === query.status)
    }

    if (query.tags) {
      results = results.filter((trace) => {
        return Object.entries(query.tags!).every(([key, value]) => trace.tags[key] === value)
      })
    }

    return results.slice(0, query.limit || 100)
  }

  // 获取追踪详情
  public getTraceDetails(traceId: string): TraceDetails | null {
    const trace = this.traces.get(traceId)
    if (!trace) return null

    const spans = trace.spans.map((spanId) => this.spans.get(spanId)!).filter(Boolean)

    return {
      trace,
      spans,
      timeline: this.buildTimeline(spans),
      serviceMap: this.buildServiceMap(spans),
      criticalPath: this.findCriticalPath(spans),
    }
  }

  // 构建时间线
  private buildTimeline(spans: Span[]): TimelineEvent[] {
    const events: TimelineEvent[] = []

    spans.forEach((span) => {
      events.push({
        type: "span_start",
        timestamp: span.startTime,
        spanId: span.spanId,
        operationName: span.operationName,
        serviceName: span.serviceName,
      })

      if (span.endTime) {
        events.push({
          type: "span_end",
          timestamp: span.endTime,
          spanId: span.spanId,
          operationName: span.operationName,
          serviceName: span.serviceName,
        })
      }

      span.logs.forEach((log) => {
        events.push({
          type: "log",
          timestamp: log.timestamp,
          spanId: span.spanId,
          operationName: span.operationName,
          serviceName: span.serviceName,
          data: log,
        })
      })
    })

    return events.sort((a, b) => a.timestamp - b.timestamp)
  }

  // 构建服务地图
  private buildServiceMap(spans: Span[]): ServiceMapNode[] {
    const services = new Map<string, ServiceMapNode>()

    spans.forEach((span) => {
      if (!services.has(span.serviceName)) {
        services.set(span.serviceName, {
          serviceName: span.serviceName,
          spanCount: 0,
          errorCount: 0,
          totalDuration: 0,
          connections: [],
        })
      }

      const service = services.get(span.serviceName)!
      service.spanCount++
      service.totalDuration += span.duration || 0

      if (span.status === "error") {
        service.errorCount++
      }

      // 查找父Span的服务
      if (span.parentSpanId) {
        const parentSpan = spans.find((s) => s.spanId === span.parentSpanId)
        if (parentSpan && parentSpan.serviceName !== span.serviceName) {
          const existingConnection = service.connections.find((conn) => conn.targetService === parentSpan.serviceName)
          if (existingConnection) {
            existingConnection.callCount++
          } else {
            service.connections.push({
              targetService: parentSpan.serviceName,
              callCount: 1,
            })
          }
        }
      }
    })

    return Array.from(services.values())
  }

  // 查找关键路径
  private findCriticalPath(spans: Span[]): Span[] {
    // 简化实现：找到最长的执行路径
    const rootSpans = spans.filter((span) => !span.parentSpanId)
    if (rootSpans.length === 0) return []

    let longestPath: Span[] = []
    let maxDuration = 0

    rootSpans.forEach((rootSpan) => {
      const path = this.buildSpanPath(rootSpan, spans)
      const pathDuration = path.reduce((sum, span) => sum + (span.duration || 0), 0)

      if (pathDuration > maxDuration) {
        maxDuration = pathDuration
        longestPath = path
      }
    })

    return longestPath
  }

  // 构建Span路径
  private buildSpanPath(span: Span, allSpans: Span[]): Span[] {
    const path = [span]
    const childSpans = allSpans.filter((s) => s.parentSpanId === span.spanId)

    if (childSpans.length > 0) {
      // 选择持续时间最长的子Span
      const longestChild = childSpans.reduce((longest, current) => {
        return (current.duration || 0) > (longest.duration || 0) ? current : longest
      })

      path.push(...this.buildSpanPath(longestChild, allSpans))
    }

    return path
  }
}

// 追踪导出器基类
abstract class TraceExporter {
  abstract export(traceData: TraceData): void
}

// 控制台导出器
class ConsoleTraceExporter extends TraceExporter {
  export(traceData: TraceData): void {
    console.log("追踪数据:", {
      traceId: traceData.trace.traceId,
      operationName: traceData.trace.operationName,
      duration: traceData.trace.duration,
      spanCount: traceData.spans.length,
      status: traceData.trace.status,
    })
  }
}

// Jaeger导出器
class JaegerTraceExporter extends TraceExporter {
  constructor(private endpoint: string) {
    super()
  }

  export(traceData: TraceData): void {
    // 转换为Jaeger格式并发送
    const jaegerData = this.convertToJaegerFormat(traceData)
    this.sendToJaeger(jaegerData)
  }

  private convertToJaegerFormat(traceData: TraceData): any {
    return {
      traceID: traceData.trace.traceId,
      spans: traceData.spans.map((span) => ({
        traceID: span.traceId,
        spanID: span.spanId,
        parentSpanID: span.parentSpanId,
        operationName: span.operationName,
        startTime: span.startTime * 1000, // 微秒
        duration: (span.duration || 0) * 1000,
        tags: Object.entries(span.tags).map(([key, value]) => ({
          key,
          type: typeof value === "string" ? "string" : "number",
          value: value.toString(),
        })),
        logs: span.logs.map((log) => ({
          timestamp: log.timestamp * 1000,
          fields: Object.entries(log.fields || {}).map(([key, value]) => ({
            key,
            value: value.toString(),
          })),
        })),
        process: {
          serviceName: span.serviceName,
          tags: [],
        },
      })),
    }
  }

  private async sendToJaeger(data: any): Promise<void> {
    try {
      await fetch(`${this.endpoint}/api/traces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error("发送到Jaeger失败:", error)
    }
  }
}

// Zipkin导出器
class ZipkinTraceExporter extends TraceExporter {
  constructor(private endpoint: string) {
    super()
  }

  export(traceData: TraceData): void {
    const zipkinData = this.convertToZipkinFormat(traceData)
    this.sendToZipkin(zipkinData)
  }

  private convertToZipkinFormat(traceData: TraceData): any[] {
    return traceData.spans.map((span) => ({
      traceId: span.traceId,
      id: span.spanId,
      parentId: span.parentSpanId,
      name: span.operationName,
      timestamp: span.startTime * 1000,
      duration: (span.duration || 0) * 1000,
      kind: span.kind?.toUpperCase(),
      localEndpoint: {
        serviceName: span.serviceName,
      },
      tags: span.tags,
      annotations: span.logs.map((log) => ({
        timestamp: log.timestamp * 1000,
        value: log.message || JSON.stringify(log.fields),
      })),
    }))
  }

  private async sendToZipkin(data: any[]): Promise<void> {
    try {
      await fetch(`${this.endpoint}/api/v2/spans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error("发送到Zipkin失败:", error)
    }
  }
}

// 自定义导出器
class CustomTraceExporter extends TraceExporter {
  export(traceData: TraceData): void {
    // 发送到自定义分析服务
    this.sendToAnalytics(traceData)
  }

  private async sendToAnalytics(traceData: TraceData): Promise<void> {
    // 这里可以发送到自定义的分析服务
    console.log("发送追踪数据到分析服务:", traceData.trace.traceId)
  }
}

// 类型定义
export interface Trace {
  traceId: string
  operationName: string
  startTime: number
  endTime: number | null
  duration: number | null
  status: "active" | "ok" | "error"
  spans: string[]
  tags: Record<string, any>
  baggage: Record<string, any>
  serviceName: string
  serviceVersion: string
  environment: string
}

export interface Span {
  spanId: string
  traceId: string
  parentSpanId: string | null
  operationName: string
  startTime: number
  endTime: number | null
  duration: number | null
  status: "active" | "ok" | "error"
  tags: Record<string, any>
  logs: SpanLog[]
  references: SpanReference[]
  serviceName: string
  kind?: "client" | "server" | "producer" | "consumer" | "internal"
}

export interface SpanLog {
  timestamp: number
  message?: string
  level?: "debug" | "info" | "warn" | "error"
  fields?: Record<string, any>
}

export interface SpanReference {
  type: "child_of" | "follows_from"
  spanId: string
}

export interface SpanContext {
  traceId: string
  spanId: string
  parentSpanId: string | null
}

export interface TraceOptions {
  tags?: Record<string, any>
  baggage?: Record<string, any>
}

export interface SpanOptions {
  traceId?: string
  parentSpanId?: string | null
  tags?: Record<string, any>
  references?: SpanReference[]
  kind?: Span["kind"]
}

export interface FinishSpanOptions {
  status?: "ok" | "error"
  error?: Error
  tags?: Record<string, any>
  logs?: SpanLog[]
}

export interface TracingConfig {
  serviceName: string
  serviceVersion: string
  environment: string
  samplingRate: number
  enableMetrics: boolean
  enableLogs: boolean
  batchSize: number
  exportInterval: number
  maxSpanCount: number
}

export interface TraceData {
  trace: Trace
  spans: Span[]
  timestamp: number
}

export interface TracingStats {
  activeTraces: number
  completedTraces: number
  errorTraces: number
  totalSpans: number
  averageTraceDuration: number
  errorRate: number
  samplingRate: number
}

export interface TraceQuery {
  serviceName?: string
  operationName?: string
  startTime?: number
  endTime?: number
  minDuration?: number
  maxDuration?: number
  status?: "ok" | "error"
  tags?: Record<string, any>
  limit?: number
}

export interface TraceDetails {
  trace: Trace
  spans: Span[]
  timeline: TimelineEvent[]
  serviceMap: ServiceMapNode[]
  criticalPath: Span[]
}

export interface TimelineEvent {
  type: "span_start" | "span_end" | "log"
  timestamp: number
  spanId: string
  operationName: string
  serviceName: string
  data?: any
}

export interface ServiceMapNode {
  serviceName: string
  spanCount: number
  errorCount: number
  totalDuration: number
  connections: Array<{
    targetService: string
    callCount: number
  }>
}

// 导出分布式追踪实例
export const distributedTracing = DistributedTracing.getInstance()
