/**
 * @file SLA监控服务
 * @description 实现SLA指标监控、达标率计算与告警功能
 * @module monitoring
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { EventEmitter } from 'events';
import { predictiveMaintenanceService } from '../ai/predictive-maintenance';
import type { MetricDefinition, MetricDataPoint } from '../ai/predictive-maintenance';

// SLA目标接口
export interface SLATarget {
  priority: 'critical' | 'high' | 'medium' | 'low';
  responseTime: number; // 响应时间阈值（毫秒）
  resolutionTime: number; // 解决时间阈值（毫秒）
  availabilityTarget: number; // 可用性目标（百分比）
}

// SLA监控指标
export interface SLAMetric {
  id: string;
  name: string;
  description: string;
  value: number;
  target: number;
  status: 'met' | 'warning' | 'breached';
  timestamp: Date;
}

// SLA事件类型
export type SLAEvent = {
  id: string;
  type: 'sla_breach' | 'sla_warning' | 'sla_recovered';
  metricId: string;
  metricName: string;
  value: number;
  target: number;
  timestamp: Date;
  description: string;
};

// 服务可用性数据
export interface AvailabilityData {
  totalChecks: number;
  successfulChecks: number;
  availability: number; // 可用性百分比
  downtime: number; // 停机时间（毫秒）
  lastDowntime?: Date;
  lastUptime?: Date;
}

/**
 * SLA监控服务类 - 负责监控和评估系统SLA指标
 */
class SLAMonitoringService extends EventEmitter {
  private static instance: SLAMonitoringService;
  private slaTargets: Map<string, SLATarget> = new Map();
  private slaMetrics: Map<string, SLAMetric[]> = new Map();
  private availabilityData: Map<string, AvailabilityData> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isMonitoring: boolean = false;
  private slaEvents: SLAEvent[] = [];

  private constructor() {
    super();
    this.initializeDefaultSLATargets();
    this.initializeSLAMetrics();
    this.setupEventListeners();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): SLAMonitoringService {
    if (!SLAMonitoringService.instance) {
      SLAMonitoringService.instance = new SLAMonitoringService();
    }
    return SLAMonitoringService.instance;
  }

  /**
   * 初始化默认SLA目标
   */
  private initializeDefaultSLATargets(): void {
    this.slaTargets.set('critical', {
      priority: 'critical',
      responseTime: 3600000, // 1小时
      resolutionTime: 14400000, // 4小时
      availabilityTarget: 99.99
    });

    this.slaTargets.set('high', {
      priority: 'high',
      responseTime: 14400000, // 4小时
      resolutionTime: 86400000, // 24小时
      availabilityTarget: 99.9
    });

    this.slaTargets.set('medium', {
      priority: 'medium',
      responseTime: 43200000, // 12小时
      resolutionTime: 259200000, // 72小时
      availabilityTarget: 99.5
    });

    this.slaTargets.set('low', {
      priority: 'low',
      responseTime: 86400000, // 24小时
      resolutionTime: 604800000, // 7天
      availabilityTarget: 99.0
    });
  }

  /**
   * 初始化SLA监控指标
   */
  private initializeSLAMetrics(): void {
    // 添加SLA特定的监控指标
    const slaMetrics: MetricDefinition[] = [
      {
        id: 'sla_response_time',
        name: 'SLA响应时间',
        description: '平均响应时间达标情况',
        unit: 'ms',
        category: 'sla',
        normalRange: { min: 0, max: 3600000 }, // 0到1小时
        alertThresholds: { warning: 7200000, critical: 14400000 },
        collectInterval: 60000
      },
      {
        id: 'sla_resolution_time',
        name: 'SLA解决时间',
        description: '平均解决时间达标情况',
        unit: 'ms',
        category: 'sla',
        normalRange: { min: 0, max: 86400000 }, // 0到24小时
        alertThresholds: { warning: 172800000, critical: 259200000 },
        collectInterval: 60000
      },
      {
        id: 'sla_availability',
        name: '服务可用性',
        description: '服务可用百分比',
        unit: '%',
        category: 'sla',
        normalRange: { min: 99.0, max: 100 },
        alertThresholds: { warning: 99.0, critical: 95.0 },
        collectInterval: 60000
      },
      {
        id: 'sla_compliance_rate',
        name: 'SLA达标率',
        description: 'SLA指标总体达标率',
        unit: '%',
        category: 'sla',
        normalRange: { min: 95.0, max: 100 },
        alertThresholds: { warning: 90.0, critical: 85.0 },
        collectInterval: 60000
      }
    ];

    // 注册到预测性维护服务
    slaMetrics.forEach(metric => {
      predictiveMaintenanceService.metrics.set(metric.id, metric);
      predictiveMaintenanceService.dataPoints.set(metric.id, []);
      predictiveMaintenanceService.anomalies.set(metric.id, []);
    });
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    predictiveMaintenanceService.on('anomalyDetected', (anomaly) => {
      if (anomaly.metricId.startsWith('sla_')) {
        this.handleSLAAnomaly(anomaly);
      }
    });

    predictiveMaintenanceService.on('dataPointRecorded', (dataPoint) => {
      if (dataPoint.metricId.startsWith('sla_')) {
        this.updateSLAMetrics(dataPoint);
      }
    });
  }

  /**
   * 处理SLA异常
   */
  private handleSLAAnomaly(anomaly): void {
    const metric = predictiveMaintenanceService.metrics.get(anomaly.metricId);
    const event: SLAEvent = {
      id: `sla_event_${Date.now()}`,
      type: anomaly.severity === 'critical' ? 'sla_breach' : 'sla_warning',
      metricId: anomaly.metricId,
      metricName: metric?.name || anomaly.metricId,
      value: anomaly.value,
      target: metric?.alertThresholds.warning || 0,
      timestamp: new Date(),
      description: anomaly.description
    };

    this.slaEvents.push(event);
    this.emit('sla_event', event);
    
    // 保留最近1000个事件
    if (this.slaEvents.length > 1000) {
      this.slaEvents.shift();
    }
  }

  /**
   * 更新SLA指标
   */
  private updateSLAMetrics(dataPoint: MetricDataPoint): void {
    const metric = predictiveMaintenanceService.metrics.get(dataPoint.metricId);
    if (!metric) return;

    let target: number;
    let status: 'met' | 'warning' | 'breached';

    switch (dataPoint.metricId) {
      case 'sla_availability':
      case 'sla_compliance_rate':
        // 这些是百分比指标，越高越好
        target = 99.9; // 默认目标
        if (dataPoint.value >= target) {
          status = 'met';
        } else if (dataPoint.value >= target * 0.95) {
          status = 'warning';
        } else {
          status = 'breached';
        }
        break;
      default:
        // 这些是时间指标，越低越好
        target = metric.normalRange.max;
        if (dataPoint.value <= target) {
          status = 'met';
        } else if (dataPoint.value <= metric.alertThresholds.warning) {
          status = 'warning';
        } else {
          status = 'breached';
        }
    }

    const slaMetric: SLAMetric = {
      id: dataPoint.metricId,
      name: metric.name,
      description: metric.description,
      value: dataPoint.value,
      target,
      status,
      timestamp: dataPoint.timestamp
    };

    const metrics = this.slaMetrics.get(dataPoint.metricId) || [];
    metrics.push(slaMetric);
    
    // 保留最近100个数据点
    if (metrics.length > 100) {
      metrics.shift();
    }

    this.slaMetrics.set(dataPoint.metricId, metrics);

    // 检查是否需要触发恢复事件
    if (status === 'met') {
      this.checkForRecovery(dataPoint.metricId, dataPoint.value);
    }
  }

  /**
   * 检查SLA恢复情况
   */
  private checkForRecovery(metricId: string, value: number): void {
    const recentEvents = this.slaEvents.filter(
      e => e.metricId === metricId && 
           (e.type === 'sla_breach' || e.type === 'sla_warning') &&
           Date.now() - e.timestamp.getTime() < 3600000 // 最近1小时内
    );

    if (recentEvents.length > 0) {
      const metric = predictiveMaintenanceService.metrics.get(metricId);
      const recoveryEvent: SLAEvent = {
        id: `sla_event_${Date.now()}`,
        type: 'sla_recovered',
        metricId,
        metricName: metric?.name || metricId,
        value,
        target: metric?.normalRange.max || 0,
        timestamp: new Date(),
        description: `${metric?.name || metricId} 已恢复正常水平`
      };

      this.slaEvents.push(recoveryEvent);
      this.emit('sla_event', recoveryEvent);
    }
  }

  /**
   * 获取特定优先级的SLA目标
   */
  public getSLATarget(priority: string): SLATarget | undefined {
    return this.slaTargets.get(priority);
  }

  /**
   * 设置SLA目标
   */
  public setSLATarget(priority: string, target: SLATarget): void {
    this.slaTargets.set(priority, target);
    this.emit('sla_target_changed', { priority, target });
  }

  /**
   * 获取SLA指标历史
   */
  public getSLAMetricHistory(metricId: string, hours: number = 24): SLAMetric[] {
    const metrics = this.slaMetrics.get(metricId) || [];
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return metrics.filter(metric => metric.timestamp >= cutoffTime);
  }

  /**
   * 计算SLA达标率
   */
  public calculateSLAComplianceRate(priority: string, hours: number = 24): number {
    const metrics = this.getSLAMetricHistory('sla_compliance_rate', hours);
    
    if (metrics.length === 0) return 100; // 默认100%
    
    const compliantCount = metrics.filter(m => m.status === 'met').length;
    return (compliantCount / metrics.length) * 100;
  }

  /**
   * 更新服务可用性数据
   */
  public updateAvailability(serviceId: string, isAvailable: boolean, responseTime?: number): void {
    let data = this.availabilityData.get(serviceId);
    
    if (!data) {
      data = {
        totalChecks: 0,
        successfulChecks: 0,
        availability: 100,
        downtime: 0
      };
    }

    data.totalChecks++;
    if (isAvailable) {
      data.successfulChecks++;
      data.lastUptime = new Date();
    } else {
      data.lastDowntime = new Date();
      if (responseTime) {
        data.downtime += responseTime;
      }
    }

    data.availability = (data.successfulChecks / data.totalChecks) * 100;
    this.availabilityData.set(serviceId, data);

    // 更新SLA可用性指标
    const availabilityMetric: MetricDataPoint = {
      metricId: 'sla_availability',
      value: data.availability,
      timestamp: new Date(),
      tags: { serviceId }
    };
    
    predictiveMaintenanceService.recordMetricDataPoint(availabilityMetric);
  }

  /**
   * 获取服务可用性数据
   */
  public getAvailabilityData(serviceId: string): AvailabilityData | undefined {
    return this.availabilityData.get(serviceId);
  }

  /**
   * 获取所有SLA事件
   */
  public getAllSLAEvents(hours: number = 24): SLAEvent[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.slaEvents
      .filter(event => event.timestamp >= cutoffTime)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 开始SLA监控
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.emit('monitoringStarted');
    
    // 启动SLA指标监控
    this.monitoringIntervals.set('sla_compliance', setInterval(() => {
      this.checkSLACompliance();
    }, 60000)); // 每分钟检查一次

    // 启动服务可用性监控
    this.monitoringIntervals.set('service_availability', setInterval(() => {
      this.checkServiceAvailability();
    }, 30000)); // 每30秒检查一次
  }

  /**
   * 停止SLA监控
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    this.emit('monitoringStopped');
    
    // 清除所有定时器
    this.monitoringIntervals.forEach(interval => clearInterval(interval));
    this.monitoringIntervals.clear();
  }

  /**
   * 检查SLA合规性
   */
  private checkSLACompliance(): void {
    // 计算总体SLA合规率
    let totalCompliance = 0;
    let metricCount = 0;

    ['sla_response_time', 'sla_resolution_time', 'sla_availability'].forEach(metricId => {
      const metrics = this.getSLAMetricHistory(metricId, 1); // 最近1小时
      if (metrics.length > 0) {
        const compliantCount = metrics.filter(m => m.status === 'met').length;
        const metricCompliance = (compliantCount / metrics.length) * 100;
        totalCompliance += metricCompliance;
        metricCount++;
      }
    });

    const overallCompliance = metricCount > 0 ? totalCompliance / metricCount : 100;
    
    // 记录合规率指标
    const complianceMetric: MetricDataPoint = {
      metricId: 'sla_compliance_rate',
      value: overallCompliance,
      timestamp: new Date(),
      tags: { source: 'sla_monitoring' }
    };
    
    predictiveMaintenanceService.recordMetricDataPoint(complianceMetric);
  }

  /**
   * 检查服务可用性
   */
  private checkServiceAvailability(): void {
    // 这里应该实现实际的服务可用性检查逻辑
    // 目前仅作为示例
    const services = ['api', 'database', 'cache', 'ai_service'];
    
    services.forEach(serviceId => {
      // 模拟服务可用性检查
      const isAvailable = Math.random() > 0.01; // 99%可用率
      this.updateAvailability(serviceId, isAvailable);
    });
  }

  /**
   * 获取监控状态
   */
  public isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * 清理历史数据
   */
  public cleanupHistoricalData(retentionHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - retentionHours * 60 * 60 * 1000);

    // 清理SLA指标
    this.slaMetrics.forEach((metrics, metricId) => {
      const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime);
      this.slaMetrics.set(metricId, filteredMetrics);
    });

    // 清理SLA事件
    this.slaEvents = this.slaEvents.filter(event => event.timestamp >= cutoffTime);

    this.emit('dataCleanupCompleted', { retentionHours, cutoffTime });
  }
}

// 导出单例实例
export const slaMonitoringService = SLAMonitoringService.getInstance();

// 导出默认实例
export default slaMonitoringService;