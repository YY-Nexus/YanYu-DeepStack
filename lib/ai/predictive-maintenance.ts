/**
 * 预测性维护服务
 * 提供系统健康监控、异常检测、趋势预测等功能
 */

import { EventEmitter } from "events"

// 指标定义接口
export interface MetricDefinition {
  id: string
  name: string
  description: string
  unit: string
  category: "system" | "application" | "database" | "ai" | "network"
  normalRange: {
    min: number
    max: number
  }
  alertThresholds: {
    warning: number
    critical: number
  }
  collectInterval: number // 收集间隔（毫秒）
}

// 指标数据点接口
export interface MetricDataPoint {
  metricId: string
  value: number
  timestamp: Date
  tags: Record<string, string>
}

// 异常检测结果接口
export interface Anomaly {
  id: string
  metricId: string
  value: number
  expectedValue: number
  deviation: number
  severity: "low" | "medium" | "high" | "critical"
  timestamp: Date
  description: string
  confidence: number
}

// 异常检测结果
export interface AnomalyDetectionResult {
  anomalies: Anomaly[]
  totalChecked: number
  anomalyRate: number
  summary: string
}

// 趋势预测结果接口
export interface TrendPredictionResult {
  metricId: string
  trend: "increasing" | "decreasing" | "stable"
  predictedValues: Array<{
    timestamp: Date
    value: number
    confidence: number
  }>
  anomalyRisk: "low" | "medium" | "high"
  recommendations: string[]
  confidence: number
}

// 告警阈值接口
export interface AlertThreshold {
  warning: number
  critical: number
}

// 健康评分接口
export interface HealthScore {
  overall: number
  categories: Record<string, number>
  trends: Record<string, "improving" | "stable" | "degrading">
  criticalIssues: string[]
  recommendations: string[]
}

/**
 * 预测性维护服务类
 */
export class PredictiveMaintenanceService extends EventEmitter {
  private static instance: PredictiveMaintenanceService
  private metrics: Map<string, MetricDefinition> = new Map()
  private dataPoints: Map<string, MetricDataPoint[]> = new Map()
  private anomalies: Map<string, Anomaly[]> = new Map()
  private isMonitoring = false
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map()

  private constructor() {
    super()
    this.initializeDefaultMetrics()
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): PredictiveMaintenanceService {
    if (!PredictiveMaintenanceService.instance) {
      PredictiveMaintenanceService.instance = new PredictiveMaintenanceService()
    }
    return PredictiveMaintenanceService.instance
  }

  /**
   * 初始化默认指标
   */
  private initializeDefaultMetrics(): void {
    const defaultMetrics: MetricDefinition[] = [
      // 系统指标
      {
        id: "cpu_usage",
        name: "CPU使用率",
        description: "系统CPU使用百分比",
        unit: "%",
        category: "system",
        normalRange: { min: 0, max: 80 },
        alertThresholds: { warning: 70, critical: 90 },
        collectInterval: 30000,
      },
      {
        id: "memory_usage",
        name: "内存使用率",
        description: "系统内存使用百分比",
        unit: "%",
        category: "system",
        normalRange: { min: 0, max: 85 },
        alertThresholds: { warning: 80, critical: 95 },
        collectInterval: 30000,
      },
      {
        id: "disk_usage",
        name: "磁盘使用率",
        description: "磁盘空间使用百分比",
        unit: "%",
        category: "system",
        normalRange: { min: 0, max: 80 },
        alertThresholds: { warning: 85, critical: 95 },
        collectInterval: 60000,
      },
      {
        id: "network_traffic",
        name: "网络流量",
        description: "网络传输速率",
        unit: "MB/s",
        category: "network",
        normalRange: { min: 0, max: 100 },
        alertThresholds: { warning: 80, critical: 120 },
        collectInterval: 15000,
      },
      // 应用指标
      {
        id: "api_latency",
        name: "API响应延迟",
        description: "API请求平均响应时间",
        unit: "ms",
        category: "application",
        normalRange: { min: 0, max: 500 },
        alertThresholds: { warning: 1000, critical: 2000 },
        collectInterval: 10000,
      },
      {
        id: "error_rate",
        name: "错误率",
        description: "API请求错误百分比",
        unit: "%",
        category: "application",
        normalRange: { min: 0, max: 1 },
        alertThresholds: { warning: 2, critical: 5 },
        collectInterval: 30000,
      },
      // 数据库指标
      {
        id: "database_connections",
        name: "数据库连接数",
        description: "活跃数据库连接数量",
        unit: "个",
        category: "database",
        normalRange: { min: 0, max: 100 },
        alertThresholds: { warning: 80, critical: 95 },
        collectInterval: 30000,
      },
      {
        id: "database_query_time",
        name: "数据库查询时间",
        description: "数据库查询平均执行时间",
        unit: "ms",
        category: "database",
        normalRange: { min: 0, max: 200 },
        alertThresholds: { warning: 500, critical: 1000 },
        collectInterval: 30000,
      },
      // AI模型指标
      {
        id: "model_inference_time",
        name: "模型推理时间",
        description: "AI模型推理平均耗时",
        unit: "ms",
        category: "ai",
        normalRange: { min: 0, max: 1000 },
        alertThresholds: { warning: 2000, critical: 5000 },
        collectInterval: 60000,
      },
      {
        id: "model_error_rate",
        name: "模型错误率",
        description: "AI模型推理错误百分比",
        unit: "%",
        category: "ai",
        normalRange: { min: 0, max: 1 },
        alertThresholds: { warning: 3, critical: 8 },
        collectInterval: 60000,
      },
    ]

    defaultMetrics.forEach((metric) => {
      this.metrics.set(metric.id, metric)
      this.dataPoints.set(metric.id, [])
      this.anomalies.set(metric.id, [])
    })
  }

  /**
   * 获取所有监控指标
   */
  public getMonitoredMetrics(): MetricDefinition[] {
    return Array.from(this.metrics.values())
  }

  /**
   * 获取指定类别的指标
   */
  public getMetricsByCategory(category: string): MetricDefinition[] {
    return Array.from(this.metrics.values()).filter((metric) => category === "all" || metric.category === category)
  }

  /**
   * 记录指标数据点
   */
  public recordMetricDataPoint(dataPoint: MetricDataPoint): void {
    const points = this.dataPoints.get(dataPoint.metricId) || []
    points.push(dataPoint)

    // 保留最近1000个数据点
    if (points.length > 1000) {
      points.splice(0, points.length - 1000)
    }

    this.dataPoints.set(dataPoint.metricId, points)
    this.emit("dataPointRecorded", dataPoint)
  }

  /**
   * 批量记录指标数据点
   */
  public recordMetricDataPoints(dataPoints: MetricDataPoint[]): void {
    dataPoints.forEach((point) => this.recordMetricDataPoint(point))
  }

  /**
   * 获取指标历史数据
   */
  public getMetricHistory(metricId: string, hours = 1): MetricDataPoint[] {
    const points = this.dataPoints.get(metricId) || []
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)

    return points.filter((point) => point.timestamp >= cutoffTime)
  }

  /**
   * 异常检测
   */
  public async detectAnomalies(metricId: string, dataPoints: MetricDataPoint[]): Promise<AnomalyDetectionResult> {
    const metric = this.metrics.get(metricId)
    if (!metric) {
      throw new Error(`未找到指标: ${metricId}`)
    }

    const anomalies: Anomaly[] = []
    const values = dataPoints.map((p) => p.value)

    if (values.length < 10) {
      return {
        anomalies: [],
        totalChecked: values.length,
        anomalyRate: 0,
        summary: "数据点不足，无法进行异常检测",
      }
    }

    // 计算统计指标
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    // Z-score异常检测
    const zThreshold = 2.5 // Z-score阈值

    dataPoints.forEach((point, index) => {
      const zScore = Math.abs((point.value - mean) / stdDev)

      if (
        zScore > zThreshold ||
        point.value > metric.alertThresholds.critical ||
        point.value > metric.alertThresholds.warning
      ) {
        let severity: "low" | "medium" | "high" | "critical"
        if (point.value > metric.alertThresholds.critical) {
          severity = "critical"
        } else if (point.value > metric.alertThresholds.warning) {
          severity = "high"
        } else if (zScore > 3) {
          severity = "medium"
        } else {
          severity = "low"
        }

        const anomaly: Anomaly = {
          id: `anomaly_${metricId}_${Date.now()}_${index}`,
          metricId,
          value: point.value,
          expectedValue: mean,
          deviation: Math.abs(point.value - mean),
          severity,
          timestamp: point.timestamp,
          description: this.generateAnomalyDescription(metric, point.value, severity),
          confidence: Math.min(zScore / 3, 1),
        }

        anomalies.push(anomaly)
      }
    })

    // 存储异常记录
    const existingAnomalies = this.anomalies.get(metricId) || []
    existingAnomalies.push(...anomalies)

    // 保留最近100个异常记录
    if (existingAnomalies.length > 100) {
      existingAnomalies.splice(0, existingAnomalies.length - 100)
    }

    this.anomalies.set(metricId, existingAnomalies)

    // 发出异常事件
    anomalies.forEach((anomaly) => {
      this.emit("anomalyDetected", anomaly)
    })

    return {
      anomalies,
      totalChecked: dataPoints.length,
      anomalyRate: anomalies.length / dataPoints.length,
      summary: `检测到 ${anomalies.length} 个异常，异常率 ${((anomalies.length / dataPoints.length) * 100).toFixed(2)}%`,
    }
  }

  /**
   * 趋势预测
   */
  public async predictTrend(
    metricId: string,
    historicalHours = 1,
    predictionHours = 6,
  ): Promise<TrendPredictionResult> {
    const metric = this.metrics.get(metricId)
    if (!metric) {
      throw new Error(`未找到指标: ${metricId}`)
    }

    const historicalData = this.getMetricHistory(metricId, historicalHours)

    if (historicalData.length < 5) {
      throw new Error("历史数据不足，无法进行趋势预测")
    }

    // 简单线性回归预测
    const values = historicalData.map((p) => p.value)
    const timestamps = historicalData.map((p) => p.timestamp.getTime())

    const n = values.length
    const sumX = timestamps.reduce((sum, t) => sum + t, 0)
    const sumY = values.reduce((sum, v) => sum + v, 0)
    const sumXY = timestamps.reduce((sum, t, i) => sum + t * values[i], 0)
    const sumXX = timestamps.reduce((sum, t) => sum + t * t, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // 生成预测值
    const predictedValues = []
    const startTime = Date.now()
    const intervalMs = 10 * 60 * 1000 // 10分钟间隔

    for (let i = 0; i < predictionHours * 6; i++) {
      const timestamp = new Date(startTime + i * intervalMs)
      const predictedValue = slope * timestamp.getTime() + intercept
      const confidence = Math.max(0.5, 1 - i * 0.05) // 置信度随时间递减

      predictedValues.push({
        timestamp,
        value: Math.max(0, predictedValue),
        confidence,
      })
    }

    // 判断趋势
    let trend: "increasing" | "decreasing" | "stable"
    if (Math.abs(slope) < 0.001) {
      trend = "stable"
    } else if (slope > 0) {
      trend = "increasing"
    } else {
      trend = "decreasing"
    }

    // 评估异常风险
    const maxPredicted = Math.max(...predictedValues.map((p) => p.value))
    let anomalyRisk: "low" | "medium" | "high"

    if (maxPredicted > metric.alertThresholds.critical) {
      anomalyRisk = "high"
    } else if (maxPredicted > metric.alertThresholds.warning) {
      anomalyRisk = "medium"
    } else {
      anomalyRisk = "low"
    }

    // 生成建议
    const recommendations = this.generateRecommendations(metric, trend, anomalyRisk, maxPredicted)

    return {
      metricId,
      trend,
      predictedValues,
      anomalyRisk,
      recommendations,
      confidence: 0.8,
    }
  }

  /**
   * 获取告警阈值
   */
  public getAlertThreshold(metricId: string): AlertThreshold | null {
    const metric = this.metrics.get(metricId)
    return metric ? metric.alertThresholds : null
  }

  /**
   * 计算系统健康评分
   */
  public calculateHealthScore(): HealthScore {
    const categories = ["system", "application", "database", "ai", "network"]
    const categoryScores: Record<string, number> = {}
    const trends: Record<string, "improving" | "stable" | "degrading"> = {}
    const criticalIssues: string[] = []

    let totalScore = 0
    let totalMetrics = 0

    categories.forEach((category) => {
      const categoryMetrics = this.getMetricsByCategory(category)
      let categoryScore = 0
      let categoryMetricCount = 0

      categoryMetrics.forEach((metric) => {
        const recentData = this.getMetricHistory(metric.id, 0.5) // 最近30分钟
        if (recentData.length > 0) {
          const latestValue = recentData[recentData.length - 1].value
          const score = this.calculateMetricScore(metric, latestValue)

          categoryScore += score
          categoryMetricCount++

          if (score < 50) {
            criticalIssues.push(`${metric.name}: ${latestValue}${metric.unit}`)
          }
        }
      })

      if (categoryMetricCount > 0) {
        categoryScores[category] = categoryScore / categoryMetricCount
        totalScore += categoryScores[category]
        totalMetrics++
      }
    })

    const overallScore = totalMetrics > 0 ? totalScore / totalMetrics : 100

    // 生成建议
    const recommendations = this.generateHealthRecommendations(overallScore, criticalIssues)

    return {
      overall: Math.round(overallScore),
      categories: categoryScores,
      trends,
      criticalIssues,
      recommendations,
    }
  }

  /**
   * 计算单个指标评分
   */
  private calculateMetricScore(metric: MetricDefinition, value: number): number {
    if (value <= metric.normalRange.max) {
      return 100
    } else if (value <= metric.alertThresholds.warning) {
      return 80
    } else if (value <= metric.alertThresholds.critical) {
      return 50
    } else {
      return 20
    }
  }

  /**
   * 生成异常描述
   */
  private generateAnomalyDescription(metric: MetricDefinition, value: number, severity: string): string {
    const descriptions = {
      critical: `${metric.name}达到严重异常水平: ${value}${metric.unit}`,
      high: `${metric.name}超出警告阈值: ${value}${metric.unit}`,
      medium: `${metric.name}出现中等异常: ${value}${metric.unit}`,
      low: `${metric.name}轻微异常: ${value}${metric.unit}`,
    }

    return descriptions[severity as keyof typeof descriptions] || `${metric.name}异常: ${value}${metric.unit}`
  }

  /**
   * 生成预测建议
   */
  private generateRecommendations(metric: MetricDefinition, trend: string, risk: string, maxValue: number): string[] {
    const recommendations: string[] = []

    if (risk === "high") {
      recommendations.push(`${metric.name}预计将超过临界阈值，建议立即采取措施`)
    } else if (risk === "medium") {
      recommendations.push(`${metric.name}预计将达到警告水平，建议密切监控`)
    }

    if (trend === "increasing") {
      switch (metric.category) {
        case "system":
          recommendations.push("考虑扩展系统资源或优化性能")
          break
        case "application":
          recommendations.push("检查应用性能瓶颈，优化代码逻辑")
          break
        case "database":
          recommendations.push("优化数据库查询，考虑添加索引")
          break
        case "ai":
          recommendations.push("优化AI模型推理，考虑模型压缩")
          break
      }
    }

    return recommendations
  }

  /**
   * 生成健康建议
   */
  private generateHealthRecommendations(score: number, issues: string[]): string[] {
    const recommendations: string[] = []

    if (score < 60) {
      recommendations.push("系统健康状况较差，建议立即检查关键指标")
    } else if (score < 80) {
      recommendations.push("系统健康状况一般，建议优化性能")
    } else {
      recommendations.push("系统运行良好，继续保持监控")
    }

    if (issues.length > 0) {
      recommendations.push(`发现${issues.length}个关键问题需要处理`)
    }

    return recommendations
  }

  /**
   * 开始监控
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      return
    }

    this.isMonitoring = true
    this.emit("monitoringStarted")

    // 为每个指标启动数据收集
    this.metrics.forEach((metric) => {
      const interval = setInterval(() => {
        // 这里应该调用实际的数据收集逻辑
        // 目前使用模拟数据
        this.collectMetricData(metric.id)
      }, metric.collectInterval)

      this.monitoringIntervals.set(metric.id, interval)
    })
  }

  /**
   * 停止监控
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return
    }

    this.isMonitoring = false
    this.emit("monitoringStopped")

    // 清除所有定时器
    this.monitoringIntervals.forEach((interval) => {
      clearInterval(interval)
    })
    this.monitoringIntervals.clear()
  }

  /**
   * 收集指标数据（模拟实现）
   */
  private collectMetricData(metricId: string): void {
    // 这里应该实现实际的数据收集逻辑
    // 目前返回模拟数据
    const metric = this.metrics.get(metricId)
    if (!metric) return

    let value: number
    switch (metricId) {
      case "cpu_usage":
        value = 30 + Math.random() * 40
        break
      case "memory_usage":
        value = 50 + Math.random() * 30
        break
      default:
        value = Math.random() * metric.normalRange.max
    }

    const dataPoint: MetricDataPoint = {
      metricId,
      value,
      timestamp: new Date(),
      tags: { source: "system" },
    }

    this.recordMetricDataPoint(dataPoint)
  }

  /**
   * 获取监控状态
   */
  public isMonitoringActive(): boolean {
    return this.isMonitoring
  }

  /**
   * 获取所有异常记录
   */
  public getAllAnomalies(): Anomaly[] {
    const allAnomalies: Anomaly[] = []
    this.anomalies.forEach((anomalies) => {
      allAnomalies.push(...anomalies)
    })
    return allAnomalies.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * 清理历史数据
   */
  public cleanupHistoricalData(retentionHours = 24): void {
    const cutoffTime = new Date(Date.now() - retentionHours * 60 * 60 * 1000)

    // 清理数据点
    this.dataPoints.forEach((points, metricId) => {
      const filteredPoints = points.filter((point) => point.timestamp >= cutoffTime)
      this.dataPoints.set(metricId, filteredPoints)
    })

    // 清理异常记录
    this.anomalies.forEach((anomalies, metricId) => {
      const filteredAnomalies = anomalies.filter((anomaly) => anomaly.timestamp >= cutoffTime)
      this.anomalies.set(metricId, filteredAnomalies)
    })

    this.emit("dataCleanupCompleted", { retentionHours, cutoffTime })
  }
}

// 导出单例实例
export const predictiveMaintenanceService = PredictiveMaintenanceService.getInstance()

// 导出默认实例
export default predictiveMaintenanceService
