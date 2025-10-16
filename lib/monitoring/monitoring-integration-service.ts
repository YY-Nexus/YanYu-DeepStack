/**
 * @file 监控集成服务
 * @description 整合SLA监控和故障恢复功能，提供统一的监控管理接口
 * @module monitoring
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { EventEmitter } from 'events';
import { predictiveMaintenanceService } from '../ai/predictive-maintenance';
import { slaMonitoringService } from './sla-monitoring-service';
import { faultRecoveryService } from './fault-recovery-service';
import type { SLATarget, SLAMetric, SLAEvent } from './sla-monitoring-service';
import type { Fault, RecoveryResult, RecoveryStrategy, FaultType } from './fault-recovery-service';
import type { MetricDefinition, Anomaly, HealthScoreResult } from '../ai/predictive-maintenance';

// 监控系统配置
export interface MonitoringConfig {
  // SLA监控配置
  slaEnabled: boolean;
  slaCheckInterval: number; // 秒
  slaReportInterval: number; // 秒
  slaDashboardUpdateInterval: number; // 秒
  
  // 故障恢复配置
  faultRecoveryEnabled: boolean;
  faultDetectionInterval: number; // 秒
  maxConcurrentRecoveries: number;
  recoveryTimeout: number; // 毫秒
  
  // 告警配置
  alertEnabled: boolean;
  alertChannels: ('email' | 'sms' | 'slack' | 'webhook')[];
  criticalAlertChannels: ('email' | 'sms' | 'slack' | 'webhook')[];
  
  // 日志配置
  detailedLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logRetentionDays: number;
  
  // 历史数据配置
  dataRetentionDays: number;
  metricsCollectionInterval: number; // 秒
}

// 监控状态
export interface MonitoringStatus {
  slaService: {
    active: boolean;
    lastCheck: Date | null;
    checkInterval: number;
    metrics: number;
    targets: number;
  };
  faultRecoveryService: {
    active: boolean;
    activeFaults: number;
    totalFaults: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    recoveryStrategies: number;
  };
  predictiveMaintenanceService: {
    active: boolean;
    metrics: number;
    anomalies: number;
    lastScan: Date | null;
  };
  overall: {
    systemHealthScore: number;
    slaComplianceRate: number;
    autoRecoveryRate: number;
    uptime: number; // 秒
    startTime: Date;
  };
}

// 监控仪表板数据
export interface MonitoringDashboardData {
  systemHealth: {
    score: number;
    trend: 'improving' | 'stable' | 'declining';
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
  slaMetrics: {
    complianceRate: number;
    availability: number;
    responseTime: number;
    resolutionTime: number;
    breaches: number;
    warnings: number;
  };
  faultStatistics: {
    totalFaults: number;
    autoRecovered: number;
    manualInterventionRequired: number;
    topFaultTypes: Array<{ type: FaultType; count: number; recoveryRate: number }>;
    averageRecoveryTime: number;
  };
  resourceUsage: {
    cpu: {
      current: number;
      average: number;
      max: number;
      threshold: number;
    };
    memory: {
      current: number;
      average: number;
      max: number;
      threshold: number;
    };
    disk: {
      current: number;
      average: number;
      max: number;
      threshold: number;
    };
  };
  recentEvents: Array<{
    type: 'anomaly' | 'fault' | 'recovery' | 'sla_breach' | 'sla_warning';
    timestamp: Date;
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    details: any;
  }>;
}

/**
 * 监控集成服务类
 */
class MonitoringIntegrationService extends EventEmitter {
  private static instance: MonitoringIntegrationService;
  private config: MonitoringConfig;
  private isInitialized: boolean = false;
  private startTime: Date;
  private systemUptime: number = 0;
  private statusUpdateInterval: NodeJS.Timeout | null = null;
  private dashboardDataCache: { data: MonitoringDashboardData; timestamp: number } | null = null;
  private recentEvents: MonitoringDashboardData['recentEvents'] = [];
  private maxRecentEvents: number = 50;

  private constructor() {
    super();
    this.startTime = new Date();
    this.config = this.getDefaultConfig();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): MonitoringIntegrationService {
    if (!MonitoringIntegrationService.instance) {
      MonitoringIntegrationService.instance = new MonitoringIntegrationService();
    }
    return MonitoringIntegrationService.instance;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): MonitoringConfig {
    return {
      slaEnabled: true,
      slaCheckInterval: 60, // 1分钟
      slaReportInterval: 3600, // 1小时
      slaDashboardUpdateInterval: 60, // 1分钟
      faultRecoveryEnabled: true,
      faultDetectionInterval: 30, // 30秒
      maxConcurrentRecoveries: 5,
      recoveryTimeout: 30000, // 30秒
      alertEnabled: true,
      alertChannels: ['email', 'slack'],
      criticalAlertChannels: ['email', 'sms', 'slack'],
      detailedLogging: true,
      logLevel: 'info',
      logRetentionDays: 30,
      dataRetentionDays: 90,
      metricsCollectionInterval: 15 // 15秒
    };
  }

  /**
   * 初始化监控系统
   */
  public async initialize(config?: Partial<MonitoringConfig>): Promise<void> {
    if (this.isInitialized) {
      throw new Error('监控系统已初始化');
    }

    // 合并配置
    this.config = {
      ...this.getDefaultConfig(),
      ...config
    };

    // 设置事件监听器
    this.setupEventListeners();

    // 初始化各个服务
    await this.initializeServices();

    // 启动状态更新定时器
    this.startStatusUpdateTimer();

    this.isInitialized = true;
    this.systemUptime = 0;
    this.log('info', '监控系统初始化完成');
    this.emit('initialized', { config: this.config });
  }

  /**
   * 初始化各个服务
   */
  private async initializeServices(): Promise<void> {
    try {
      // 确保预测性维护服务已启动
      const pmStatus = predictiveMaintenanceService.getStatus();
      if (!pmStatus.active) {
        predictiveMaintenanceService.startMonitoring(this.config.metricsCollectionInterval * 1000);
        this.log('info', '预测性维护服务已启动');
      }

      // 初始化SLA监控服务
      if (this.config.slaEnabled) {
        await slaMonitoringService.initialize({
          checkInterval: this.config.slaCheckInterval,
          reportInterval: this.config.slaReportInterval,
          dashboardUpdateInterval: this.config.slaDashboardUpdateInterval
        });
        this.log('info', 'SLA监控服务已初始化');
      }

      // 初始化故障恢复服务
      if (this.config.faultRecoveryEnabled) {
        faultRecoveryService.setMaxConcurrentRecoveries(this.config.maxConcurrentRecoveries);
        faultRecoveryService.setRecoveryTimeout(this.config.recoveryTimeout);
        faultRecoveryService.start();
        this.log('info', '故障恢复服务已初始化并启动');
      }

    } catch (error) {
      this.log('error', `服务初始化失败: ${error}`);
      throw error;
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听预测性维护服务事件
    predictiveMaintenanceService.on('anomalyDetected', (anomaly) => {
      this.handleAnomalyDetection(anomaly);
    });

    predictiveMaintenanceService.on('healthScoreUpdated', (score) => {
      this.handleHealthScoreUpdate(score);
    });

    // 监听SLA监控服务事件
    slaMonitoringService.on('sla_event', (event) => {
      this.handleSLAEvent(event);
    });

    slaMonitoringService.on('metrics_updated', (metrics) => {
      this.handleSLAMetricsUpdate(metrics);
    });

    // 监听故障恢复服务事件
    faultRecoveryService.on('fault_detected', (fault) => {
      this.handleFaultDetection(fault);
    });

    faultRecoveryService.on('recovery_successful', (data) => {
      this.handleRecoverySuccess(data);
    });

    faultRecoveryService.on('recovery_failed', (data) => {
      this.handleRecoveryFailure(data);
    });

    faultRecoveryService.on('admin_alert', (data) => {
      this.handleAdminAlert(data);
    });
  }

  /**
   * 启动状态更新定时器
   */
  private startStatusUpdateTimer(): void {
    this.statusUpdateInterval = setInterval(() => {
      this.systemUptime += 5; // 每5秒更新一次
      this.emit('status_update', this.getStatus());
    }, 5000);
  }

  /**
   * 处理异常检测事件
   */
  private handleAnomalyDetection(anomaly: Anomaly): void {
    this.log('warn', `检测到异常: ${anomaly.description}`, { anomaly });
    
    this.addRecentEvent({
      type: 'anomaly',
      timestamp: new Date(),
      severity: anomaly.severity as 'critical' | 'high' | 'medium' | 'low',
      message: anomaly.description,
      details: anomaly
    });

    // 如果异常严重，触发告警
    if (anomaly.severity === 'critical') {
      this.sendAlert('critical', `严重异常: ${anomaly.description}`, { anomaly });
    } else if (anomaly.severity === 'high' && this.config.alertEnabled) {
      this.sendAlert('high', `高优先级异常: ${anomaly.description}`, { anomaly });
    }

    this.clearDashboardCache();
  }

  /**
   * 处理健康评分更新
   */
  private handleHealthScoreUpdate(score: HealthScoreResult): void {
    this.log('debug', '系统健康评分已更新', { score });
    
    // 如果健康评分过低，触发告警
    if (score.overall < 40) {
      this.sendAlert('critical', `系统健康评分过低: ${score.overall}/100`, { score });
    } else if (score.overall < 60) {
      this.sendAlert('high', `系统健康评分偏低: ${score.overall}/100`, { score });
    }

    this.clearDashboardCache();
  }

  /**
   * 处理SLA事件
   */
  private handleSLAEvent(event: SLAEvent): void {
    const severity = event.type === 'sla_breach' ? 'critical' : 'high';
    const message = event.type === 'sla_breach' 
      ? `SLA违反: ${event.metricName} 当前值: ${event.value} 目标值: ${event.target}`
      : `SLA警告: ${event.metricName} 当前值: ${event.value} 目标值: ${event.target}`;

    this.log('warn', message, { event });
    
    this.addRecentEvent({
      type: event.type as 'sla_breach' | 'sla_warning',
      timestamp: new Date(),
      severity,
      message,
      details: event
    });

    // 触发告警
    this.sendAlert(severity, message, { event });

    this.clearDashboardCache();
  }

  /**
   * 处理SLA指标更新
   */
  private handleSLAMetricsUpdate(metrics: SLAMetric[]): void {
    this.log('debug', 'SLA指标已更新', { count: metrics.length });
    this.clearDashboardCache();
  }

  /**
   * 处理故障检测
   */
  private handleFaultDetection(fault: Fault): void {
    this.log('error', `检测到故障: ${fault.description}`, { fault });
    
    this.addRecentEvent({
      type: 'fault',
      timestamp: new Date(),
      severity: fault.severity,
      message: fault.description,
      details: fault
    });

    // 触发告警
    this.sendAlert(fault.severity, `故障检测: ${fault.description}`, { fault });

    this.clearDashboardCache();
  }

  /**
   * 处理恢复成功
   */
  private handleRecoverySuccess(data: { fault: Fault; result: RecoveryResult }): void {
    const { fault, result } = data;
    this.log('info', `故障恢复成功: ${fault.description}`, { fault, result });
    
    this.addRecentEvent({
      type: 'recovery',
      timestamp: new Date(),
      severity: 'low',
      message: `故障自动恢复: ${fault.description}`,
      details: { fault, result }
    });

    // 记录恢复成功的统计信息
    this.clearDashboardCache();
  }

  /**
   * 处理恢复失败
   */
  private handleRecoveryFailure(data: { fault: Fault; result: RecoveryResult }): void {
    const { fault, result } = data;
    this.log('error', `故障恢复失败: ${fault.description}`, { fault, result });
    
    this.addRecentEvent({
      type: 'recovery',
      timestamp: new Date(),
      severity: 'critical',
      message: `故障恢复失败，需要人工干预: ${fault.description}`,
      details: { fault, result }
    });

    // 发送关键告警，需要人工干预
    this.sendAlert('critical', `故障恢复失败，需要人工干预: ${fault.description}`, { 
      fault, 
      result,
      recommendations: result.recommendations 
    });

    this.clearDashboardCache();
  }

  /**
   * 处理管理员告警
   */
  private handleAdminAlert(data: { fault: Fault; action: any }): void {
    this.log('warn', `触发管理员告警: ${data.fault.description}`, { data });
  }

  /**
   * 添加最近事件
   */
  private addRecentEvent(event: MonitoringDashboardData['recentEvents'][0]): void {
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > this.maxRecentEvents) {
      this.recentEvents.pop();
    }
  }

  /**
   * 清除仪表板缓存
   */
  private clearDashboardCache(): void {
    this.dashboardDataCache = null;
  }

  /**
   * 发送告警
   */
  private sendAlert(severity: 'critical' | 'high' | 'medium' | 'low', message: string, data?: any): void {
    if (!this.config.alertEnabled) return;

    const isCritical = severity === 'critical';
    const channels = isCritical ? this.config.criticalAlertChannels : this.config.alertChannels;

    this.log(severity === 'critical' ? 'error' : 'warn', `发送告警: ${message}`, {
      severity,
      channels,
      data
    });

    // 发出告警事件
    this.emit('alert', {
      severity,
      message,
      timestamp: new Date(),
      channels,
      data
    });

    // 这里可以根据不同的告警通道实现具体的发送逻辑
    // 例如：发送邮件、短信、Slack消息等
    // 由于这是示例实现，这里只记录日志
  }

  /**
   * 日志记录
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = logLevels[this.config.logLevel];
    const messageLevel = logLevels[level];

    if (messageLevel >= currentLevel) {
      const timestamp = new Date().toISOString();
      const logData = this.config.detailedLogging && data ? ` ${JSON.stringify(data)}` : '';
      console[level](`[${timestamp}] [${level.toUpperCase()}] [Monitoring] ${message}${logData}`);
    }
  }

  /**
   * 获取监控系统状态
   */
  public getStatus(): MonitoringStatus {
    const pmStatus = predictiveMaintenanceService.getStatus();
    const activeFaults = faultRecoveryService.getActiveFaults();
    const allFaults = faultRecoveryService.getAllFaults();
    const recoveryHistory = faultRecoveryService.getRecoveryHistory();
    const healthScore = predictiveMaintenanceService.calculateHealthScore();
    const slaCompliance = slaMonitoringService.getComplianceRate();
    
    // 计算自动恢复成功率
    const successfulRecoveries = recoveryHistory.filter(r => r.success).length;
    const totalRecoveries = recoveryHistory.length;
    const autoRecoveryRate = totalRecoveries > 0 
      ? (successfulRecoveries / totalRecoveries) * 100 
      : 100;

    return {
      slaService: {
        active: this.config.slaEnabled,
        lastCheck: slaMonitoringService.getLastCheckTime(),
        checkInterval: this.config.slaCheckInterval,
        metrics: slaMonitoringService.getMetrics().length,
        targets: slaMonitoringService.getSLATargets().length
      },
      faultRecoveryService: {
        active: this.config.faultRecoveryEnabled,
        activeFaults: activeFaults.length,
        totalFaults: allFaults.length,
        successfulRecoveries,
        failedRecoveries: totalRecoveries - successfulRecoveries,
        recoveryStrategies: faultRecoveryService.getRecoveryStrategies().size
      },
      predictiveMaintenanceService: {
        active: pmStatus.active,
        metrics: pmStatus.metricsCount,
        anomalies: predictiveMaintenanceService.getAllAnomalies().length,
        lastScan: pmStatus.lastScanTime
      },
      overall: {
        systemHealthScore: healthScore.overall,
        slaComplianceRate: slaCompliance,
        autoRecoveryRate,
        uptime: this.systemUptime,
        startTime: this.startTime
      }
    };
  }

  /**
   * 获取仪表板数据
   */
  public async getDashboardData(): Promise<MonitoringDashboardData> {
    // 检查缓存
    const now = Date.now();
    const cacheDuration = 60000; // 缓存1分钟
    
    if (this.dashboardDataCache && (now - this.dashboardDataCache.timestamp) < cacheDuration) {
      return this.dashboardDataCache.data;
    }

    try {
      // 获取系统健康评分
      const healthScore = predictiveMaintenanceService.calculateHealthScore();
      const previousScore = predictiveMaintenanceService.getPreviousHealthScore();
      
      // 确定趋势
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (previousScore) {
        const diff = healthScore.overall - previousScore.overall;
        if (diff > 5) trend = 'improving';
        else if (diff < -5) trend = 'declining';
      }

      // 获取SLA指标
      const slaMetrics = slaMonitoringService.getMetrics();
      const availabilityMetric = slaMetrics.find(m => m.id === 'sla_availability');
      const responseTimeMetric = slaMetrics.find(m => m.id === 'sla_response_time');
      const resolutionTimeMetric = slaMetrics.find(m => m.id === 'sla_resolution_time');
      const slaEvents = slaMonitoringService.getRecentEvents(100);
      
      // 计算SLA违反和警告次数
      const breaches = slaEvents.filter(e => e.type === 'sla_breach').length;
      const warnings = slaEvents.filter(e => e.type === 'sla_warning').length;

      // 获取故障统计
      const allFaults = faultRecoveryService.getAllFaults();
      const recoveryHistory = faultRecoveryService.getRecoveryHistory();
      
      // 计算故障类型统计
      const faultTypeMap = new Map<FaultType, { count: number; recovered: number }>();
      allFaults.forEach(fault => {
        const existing = faultTypeMap.get(fault.type) || { count: 0, recovered: 0 };
        faultTypeMap.set(fault.type, {
          count: existing.count + 1,
          recovered: existing.recovered + (fault.status === 'recovered' ? 1 : 0)
        });
      });

      // 转换为Top故障类型列表
      const topFaultTypes = Array.from(faultTypeMap.entries())
        .map(([type, data]) => ({
          type,
          count: data.count,
          recoveryRate: (data.recovered / data.count) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 计算平均恢复时间
      const successfulRecoveries = recoveryHistory.filter(r => r.success);
      const averageRecoveryTime = successfulRecoveries.length > 0
        ? successfulRecoveries.reduce((sum, r) => sum + r.duration, 0) / successfulRecoveries.length
        : 0;

      // 获取资源使用情况
      const metrics = predictiveMaintenanceService.getMetrics();
      const cpuMetric = metrics.find(m => m.id === 'cpu_usage');
      const memoryMetric = metrics.find(m => m.id === 'memory_usage');
      const diskMetric = metrics.find(m => m.id === 'disk_usage');

      // 构建仪表板数据
      const dashboardData: MonitoringDashboardData = {
        systemHealth: {
          score: healthScore.overall,
          trend,
          criticalIssues: healthScore.categoryScores.criticalIssues || 0,
          highIssues: healthScore.categoryScores.highIssues || 0,
          mediumIssues: healthScore.categoryScores.mediumIssues || 0,
          lowIssues: healthScore.categoryScores.lowIssues || 0
        },
        slaMetrics: {
          complianceRate: slaMonitoringService.getComplianceRate(),
          availability: availabilityMetric?.currentValue || 100,
          responseTime: responseTimeMetric?.currentValue || 0,
          resolutionTime: resolutionTimeMetric?.currentValue || 0,
          breaches,
          warnings
        },
        faultStatistics: {
          totalFaults: allFaults.length,
          autoRecovered: allFaults.filter(f => f.status === 'recovered').length,
          manualInterventionRequired: allFaults.filter(f => f.status === 'failed').length,
          topFaultTypes,
          averageRecoveryTime
        },
        resourceUsage: {
          cpu: {
            current: cpuMetric?.currentValue || 0,
            average: cpuMetric?.averageValue || 0,
            max: cpuMetric?.maxValue || 0,
            threshold: cpuMetric?.threshold || 85
          },
          memory: {
            current: memoryMetric?.currentValue || 0,
            average: memoryMetric?.averageValue || 0,
            max: memoryMetric?.maxValue || 0,
            threshold: memoryMetric?.threshold || 80
          },
          disk: {
            current: diskMetric?.currentValue || 0,
            average: diskMetric?.averageValue || 0,
            max: diskMetric?.maxValue || 0,
            threshold: diskMetric?.threshold || 90
          }
        },
        recentEvents: this.recentEvents.slice(0, 20) // 只返回最近20个事件
      };

      // 缓存结果
      this.dashboardDataCache = { data: dashboardData, timestamp: now };
      
      return dashboardData;
    } catch (error) {
      this.log('error', `获取仪表板数据失败: ${error}`);
      throw error;
    }
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<MonitoringConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };

    // 根据配置更新各个服务
    if (this.config.slaEnabled) {
      slaMonitoringService.updateCheckInterval(this.config.slaCheckInterval);
    }

    if (this.config.faultRecoveryEnabled) {
      faultRecoveryService.setMaxConcurrentRecoveries(this.config.maxConcurrentRecoveries);
      faultRecoveryService.setRecoveryTimeout(this.config.recoveryTimeout);
    }

    this.log('info', '监控系统配置已更新', { config: this.config });
    this.emit('config_updated', this.config);
    this.clearDashboardCache();
  }

  /**
   * 获取配置
   */
  public getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * 添加SLA目标
   */
  public async addSLATarget(target: SLATarget): Promise<void> {
    await slaMonitoringService.addSLATarget(target);
    this.clearDashboardCache();
  }

  /**
   * 添加恢复策略
   */
  public addRecoveryStrategy(strategy: RecoveryStrategy): void {
    faultRecoveryService.addRecoveryStrategy(strategy);
    this.log('info', `已添加恢复策略: ${strategy.faultType}`);
  }

  /**
   * 手动触发故障检测
   */
  public async triggerManualFaultDetection(): Promise<void> {
    if (!this.config.faultRecoveryEnabled) {
      throw new Error('故障恢复功能未启用');
    }
    
    await faultRecoveryService.triggerFaultDetection();
    this.log('info', '手动触发故障检测');
  }

  /**
   * 生成监控报告
   */
  public async generateReport(timeRange: { start: Date; end: Date }): Promise<any> {
    try {
      // 获取指定时间范围内的所有数据
      const slaReport = await slaMonitoringService.generateReport(timeRange);
      const faultReport = this.generateFaultReport(timeRange);
      const healthReport = this.generateHealthReport(timeRange);

      return {
        generatedAt: new Date(),
        timeRange,
        summary: {
          slaComplianceRate: slaReport.complianceRate,
          totalFaults: faultReport.totalFaults,
          successfulRecoveries: faultReport.successfulRecoveries,
          averageHealthScore: healthReport.averageScore
        },
        detailedReports: {
          sla: slaReport,
          faults: faultReport,
          health: healthReport
        }
      };
    } catch (error) {
      this.log('error', `生成监控报告失败: ${error}`);
      throw error;
    }
  }

  /**
   * 生成故障报告
   */
  private generateFaultReport(timeRange: { start: Date; end: Date }): any {
    const allFaults = faultRecoveryService.getAllFaults();
    const filteredFaults = allFaults.filter(fault => 
      fault.detectedAt >= timeRange.start && fault.detectedAt <= timeRange.end
    );

    const successfulRecoveries = filteredFaults.filter(f => f.status === 'recovered').length;
    const failedRecoveries = filteredFaults.filter(f => f.status === 'failed').length;

    return {
      totalFaults: filteredFaults.length,
      successfulRecoveries,
      failedRecoveries,
      recoveryRate: filteredFaults.length > 0 
        ? (successfulRecoveries / filteredFaults.length) * 100 
        : 100,
      faultDetails: filteredFaults
    };
  }

  /**
   * 生成健康报告
   */
  private generateHealthReport(timeRange: { start: Date; end: Date }): any {
    // 这里可以实现健康报告生成逻辑
    // 例如获取历史健康评分数据等
    const currentScore = predictiveMaintenanceService.calculateHealthScore();
    
    return {
      currentScore: currentScore.overall,
      averageScore: currentScore.overall, // 示例值
      trend: 'stable', // 示例值
      categoryScores: currentScore.categoryScores
    };
  }

  /**
   * 重启监控服务
   */
  public async restart(): Promise<void> {
    this.log('info', '重启监控服务...');
    
    // 停止服务
    this.stop();
    
    // 重新初始化
    await this.initialize(this.config);
    
    this.log('info', '监控服务重启完成');
  }

  /**
   * 停止监控服务
   */
  public stop(): void {
    if (!this.isInitialized) return;

    // 停止定时器
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }

    // 停止各个服务
    if (this.config.slaEnabled) {
      slaMonitoringService.stop();
    }

    if (this.config.faultRecoveryEnabled) {
      faultRecoveryService.stop();
    }

    predictiveMaintenanceService.stopMonitoring();

    this.isInitialized = false;
    this.log('info', '监控服务已停止');
    this.emit('stopped');
  }
}

// 导出单例实例
export const monitoringIntegrationService = MonitoringIntegrationService.getInstance();

// 导出默认实例
export default monitoringIntegrationService;