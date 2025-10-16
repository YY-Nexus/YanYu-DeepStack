/**
 * @file 监控系统集成示例
 * @description 展示如何在实际应用中集成和使用监控服务
 * @module monitoring
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import {
  monitoringIntegrationService,
  SLATarget,
  RecoveryStrategy,
  MonitoringStatus
} from './monitoring';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * 1. 初始化监控系统
 * 在应用启动时调用此函数
 */
export async function initializeMonitoringSystem() {
  try {
    console.log('正在初始化监控系统...');
    
    // 初始化监控系统，配置各种参数
    await monitoringIntegrationService.initialize({
      // SLA监控配置
      slaEnabled: true,
      slaCheckInterval: 60, // 1分钟检查一次
      slaReportInterval: 3600, // 1小时生成一次报告
      
      // 故障恢复配置
      faultRecoveryEnabled: true,
      faultDetectionInterval: 30, // 30秒检测一次
      maxConcurrentRecoveries: 3, // 最多同时执行3个恢复操作
      recoveryTimeout: 60000, // 恢复操作超时时间60秒
      
      // 告警配置
      alertEnabled: true,
      alertChannels: ['email', 'slack'],
      criticalAlertChannels: ['email', 'sms', 'slack'],
      
      // 日志配置
      detailedLogging: process.env.NODE_ENV !== 'production',
      logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      
      // 指标收集间隔
      metricsCollectionInterval: 15 // 15秒收集一次指标
    });
    
    console.log('监控系统初始化完成');
    
    // 设置事件监听器
    setupMonitoringEventListeners();
    
    // 配置关键SLA目标
    await configureCriticalSLATargets();
    
    // 配置常用故障恢复策略
    configureCommonRecoveryStrategies();
    
    console.log('监控系统配置完成，开始监控...');
    
  } catch (error) {
    console.error('❌ 监控系统初始化失败:', error);
    // 在生产环境中，可以发送告警通知管理员
  }
}

/**
 * 2. 设置监控事件监听器
 */
function setupMonitoringEventListeners() {
  // 监听告警事件
  monitoringIntegrationService.on('alert', async (alert) => {
    console.log(`⚠️  监控告警 [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    // 根据告警严重程度执行不同操作
    if (alert.severity === 'critical') {
      // 对于严重告警，可以通知管理员
      await notifyAdmin(alert);
      // 可能还需要记录到事件日志或触发其他流程
    }
    
    // 记录告警到数据库
    await logAlertToDatabase(alert);
  });
  
  // 监听状态更新
  monitoringIntegrationService.on('status_update', (status: MonitoringStatus) => {
    console.log(`📊 系统状态更新 - 健康评分: ${status.overall.systemHealthScore}, SLA合规率: ${status.overall.slaComplianceRate}%`);
    
    // 可以在这里更新系统状态面板
    updateSystemStatusDashboard(status);
  });
  
  // 监听配置更新
  monitoringIntegrationService.on('config_updated', (config) => {
    console.log('⚙️  监控配置已更新');
    // 可以保存新配置到数据库或配置文件
    saveConfigurationToDatabase(config);
  });
}

/**
 * 3. 配置关键SLA目标
 */
async function configureCriticalSLATargets() {
  console.log('正在配置SLA目标...');
  
  const criticalTargets: SLATarget[] = [
    {
      id: 'sla_availability',
      name: '系统可用性',
      description: '系统整体可用性SLA',
      metricName: 'system_availability',
      threshold: 99.9, // 99.9%可用
      severity: 'critical',
      unit: '%',
      warningThreshold: 99.95
    },
    {
      id: 'sla_response_time',
      name: 'API响应时间',
      description: '主要API端点的平均响应时间',
      metricName: 'api_response_time',
      threshold: 500, // 500毫秒
      severity: 'high',
      unit: 'ms',
      warningThreshold: 300
    },
    {
      id: 'sla_error_rate',
      name: '错误率',
      description: 'API请求的错误率',
      metricName: 'api_error_rate',
      threshold: 0.1, // 0.1%
      severity: 'high',
      unit: '%',
      warningThreshold: 0.05
    },
    {
      id: 'sla_database_performance',
      name: '数据库性能',
      description: '数据库查询平均执行时间',
      metricName: 'database_query_time',
      threshold: 100, // 100毫秒
      severity: 'medium',
      unit: 'ms',
      warningThreshold: 50
    },
    {
      id: 'sla_user_transaction_rate',
      name: '用户交易处理率',
      description: '每分钟成功处理的交易数',
      metricName: 'transactions_per_minute',
      threshold: 1000, // 每分钟至少1000笔
      severity: 'medium',
      unit: 'tpm',
      warningThreshold: 1500
    }
  ];
  
  // 添加所有SLA目标
  for (const target of criticalTargets) {
    try {
      await monitoringIntegrationService.addSLATarget(target);
      console.log(`✅ 添加SLA目标: ${target.name}`);
    } catch (error) {
      console.error(`❌ 添加SLA目标失败: ${target.name}`, error);
    }
  }
  
  console.log('SLA目标配置完成');
}

/**
 * 4. 配置常用故障恢复策略
 */
function configureCommonRecoveryStrategies() {
  console.log('正在配置故障恢复策略...');
  
  const commonStrategies: RecoveryStrategy[] = [
    // 服务不可用恢复策略
    {
      faultType: 'service_unavailable',
      name: '服务自动重启',
      description: '当检测到服务不可用时尝试自动重启',
      priority: 1,
      execute: async (context) => {
        console.log(`🔄 正在重启服务: ${context.serviceId}`);
        
        try {
          // 实际项目中，这里应该调用服务管理API或系统命令
          // 模拟服务重启
          const start = Date.now();
          await new Promise(resolve => setTimeout(resolve, 3000)); // 模拟重启耗时
          const duration = Date.now() - start;
          
          console.log(`✅ 服务重启成功: ${context.serviceId}, 耗时: ${duration}ms`);
          return { 
            success: true, 
            duration, 
            message: `服务 ${context.serviceId} 重启成功`,
            details: { serviceId: context.serviceId }
          };
        } catch (error) {
          console.error(`❌ 服务重启失败: ${context.serviceId}`, error);
          return {
            success: false,
            error: error.message,
            recommendations: ['检查服务配置', '手动重启服务', '检查资源限制']
          };
        }
      },
      canExecute: (fault) => true // 所有服务不可用故障都适用
    },
    
    // 高延迟恢复策略
    {
      faultType: 'high_latency',
      name: '资源扩展',
      description: '当检测到高延迟时尝试扩展资源',
      priority: 2,
      execute: async (context) => {
        console.log(`📈 尝试扩展资源: ${context.serviceId}`);
        
        try {
          // 实际项目中，这里应该调用云服务API或容器编排工具
          // 模拟资源扩展
          const start = Date.now();
          await new Promise(resolve => setTimeout(resolve, 5000)); // 模拟扩展耗时
          const duration = Date.now() - start;
          
          console.log(`✅ 资源扩展成功: ${context.serviceId}, 耗时: ${duration}ms`);
          return { 
            success: true, 
            duration, 
            message: `资源已扩展，延迟应该会降低`,
            details: { 
              serviceId: context.serviceId,
              scaleFactor: 1.5
            }
          };
        } catch (error) {
          console.error(`❌ 资源扩展失败: ${context.serviceId}`, error);
          return {
            success: false,
            error: error.message,
            recommendations: ['检查资源配额', '减少并发请求', '优化代码性能']
          };
        }
      },
      canExecute: (fault) => {
        // 只对API服务的高延迟故障执行此策略
        return fault.serviceId.includes('api') && 
               fault.details?.latency > 1000; // 延迟超过1秒
      }
    },
    
    // 数据库连接问题恢复策略
    {
      faultType: 'database_connection_error',
      name: '数据库连接重置',
      description: '当检测到数据库连接问题时重置连接池',
      priority: 1,
      execute: async (context) => {
        console.log(`🔄 正在重置数据库连接池: ${context.databaseId}`);
        
        try {
          // 实际项目中，这里应该调用数据库连接池管理API
          // 模拟连接池重置
          const start = Date.now();
          await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟重置耗时
          const duration = Date.now() - start;
          
          console.log(`✅ 数据库连接池重置成功: ${context.databaseId}`);
          return { 
            success: true, 
            duration, 
            message: `数据库连接已重置`,
            details: { databaseId: context.databaseId }
          };
        } catch (error) {
          console.error(`❌ 数据库连接池重置失败: ${context.databaseId}`, error);
          return {
            success: false,
            error: error.message,
            recommendations: ['检查数据库状态', '验证连接凭证', '增加连接池大小']
          };
        }
      },
      canExecute: (fault) => true // 所有数据库连接错误都适用
    },
    
    // 缓存服务故障恢复策略
    {
      faultType: 'cache_service_error',
      name: '缓存服务重启',
      description: '当缓存服务出错时尝试重启',
      priority: 1,
      execute: async (context) => {
        console.log(`🔄 正在重启缓存服务: ${context.cacheId}`);
        
        try {
          // 实际项目中，这里应该调用缓存服务管理API
          // 模拟缓存服务重启
          const start = Date.now();
          await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟重启耗时
          const duration = Date.now() - start;
          
          console.log(`✅ 缓存服务重启成功: ${context.cacheId}`);
          return { 
            success: true, 
            duration, 
            message: `缓存服务已重启`,
            details: { cacheId: context.cacheId }
          };
        } catch (error) {
          console.error(`❌ 缓存服务重启失败: ${context.cacheId}`, error);
          return {
            success: false,
            error: error.message,
            recommendations: ['检查缓存配置', '验证资源', '考虑使用备用缓存']
          };
        }
      },
      canExecute: (fault) => true // 所有缓存服务错误都适用
    },
    
    // 队列积压恢复策略
    {
      faultType: 'queue_backlog',
      name: '队列消费者扩展',
      description: '当消息队列积压时增加消费者数量',
      priority: 2,
      execute: async (context) => {
        console.log(`📈 正在扩展队列消费者: ${context.queueId}`);
        
        try {
          // 实际项目中，这里应该调用消息队列服务API
          // 模拟消费者扩展
          const start = Date.now();
          await new Promise(resolve => setTimeout(resolve, 4000)); // 模拟扩展耗时
          const duration = Date.now() - start;
          
          console.log(`✅ 队列消费者扩展成功: ${context.queueId}`);
          return { 
            success: true, 
            duration, 
            message: `队列消费者数量已增加`,
            details: { 
              queueId: context.queueId,
              previousConsumers: context.details?.currentConsumers || 1,
              newConsumers: (context.details?.currentConsumers || 1) * 2
            }
          };
        } catch (error) {
          console.error(`❌ 队列消费者扩展失败: ${context.queueId}`, error);
          return {
            success: false,
            error: error.message,
            recommendations: ['检查队列配置', '验证资源配额', '手动处理积压消息']
          };
        }
      },
      canExecute: (fault) => {
        // 只对积压超过阈值的队列执行此策略
        return fault.details?.messageCount > 1000;
      }
    }
  ];
  
  // 添加所有恢复策略
  for (const strategy of commonStrategies) {
    try {
      monitoringIntegrationService.addRecoveryStrategy(strategy);
      console.log(`✅ 添加恢复策略: ${strategy.name}`);
    } catch (error) {
      console.error(`❌ 添加恢复策略失败: ${strategy.name}`, error);
    }
  }
  
  console.log('故障恢复策略配置完成');
}

/**
 * 5. API路由集成中间件
 * 用于在API请求中集成监控功能
 */
export function withMonitoring(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    const endpoint = `${req.method} ${req.url}`;
    const correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
    
    // 设置响应头
    res.setHeader('x-correlation-id', correlationId);
    
    try {
      // 记录请求开始
      logRequestStart(req, { correlationId });
      
      // 执行原始处理函数
      const result = await handler(req, res);
      
      // 计算响应时间
      const responseTime = Date.now() - startTime;
      
      // 更新API响应时间指标
      updateAPIResponseTimeMetric(endpoint, responseTime);
      
      // 记录请求成功
      logRequestSuccess(req, res.statusCode, { 
        correlationId, 
        responseTime 
      });
      
      return result;
    } catch (error) {
      // 计算响应时间
      const responseTime = Date.now() - startTime;
      
      // 记录错误
      logRequestError(req, error, { 
        correlationId, 
        responseTime 
      });
      
      // 更新错误率指标
      updateAPIErrorRateMetric(endpoint);
      
      throw error;
    }
  };
}

/**
 * 6. 定时任务集成
 * 用于定期收集指标和执行监控任务
 */
export function scheduleMonitoringTasks() {
  console.log('正在设置监控定时任务...');
  
  // 每分钟收集一次业务指标
  setInterval(async () => {
    try {
      await collectBusinessMetrics();
    } catch (error) {
      console.error('❌ 收集业务指标失败:', error);
    }
  }, 60000);
  
  // 每小时生成一次监控报告
  setInterval(async () => {
    try {
      await generatePeriodicReport();
    } catch (error) {
      console.error('❌ 生成监控报告失败:', error);
    }
  }, 3600000);
  
  // 每12小时清理一次历史数据
  setInterval(async () => {
    try {
      await cleanupOldMonitoringData();
    } catch (error) {
      console.error('❌ 清理历史数据失败:', error);
    }
  }, 12 * 3600000);
  
  console.log('监控定时任务设置完成');
}

/**
 * 7. 辅助函数 - 收集业务指标
 */
async function collectBusinessMetrics() {
  console.log('📊 收集业务指标...');
  
  try {
    // 示例：收集用户活跃指标
    const activeUsers = await getActiveUsersCount();
    const newRegistrations = await getNewRegistrationsCount();
    const transactionVolume = await getTransactionVolume();
    const averageOrderValue = await getAverageOrderValue();
    
    // 这里可以使用监控服务更新这些业务指标
    console.log(`业务指标 - 活跃用户: ${activeUsers}, 新注册: ${newRegistrations}, 交易量: ${transactionVolume}, 平均订单值: ${averageOrderValue}`);
    
  } catch (error) {
    console.error('❌ 收集业务指标时出错:', error);
  }
}

/**
 * 8. 辅助函数 - 生成定期报告
 */
async function generatePeriodicReport() {
  console.log('📋 生成定期监控报告...');
  
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    // 生成过去一小时的报告
    const report = await monitoringIntegrationService.generateReport({
      start: oneHourAgo,
      end: now
    });
    
    // 保存报告到数据库或文件系统
    await saveReportToDatabase(report);
    
    // 可以发送报告给相关团队
    await emailReportToTeam(report);
    
    console.log(`✅ 监控报告已生成并分发 - 评分: ${report.summary.averageHealthScore}`);
    
  } catch (error) {
    console.error('❌ 生成定期报告时出错:', error);
  }
}

/**
 * 9. 辅助函数 - 清理旧数据
 */
async function cleanupOldMonitoringData() {
  console.log('🧹 清理旧监控数据...');
  
  try {
    // 清理30天前的旧数据
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // 这里应该调用数据清理逻辑
    console.log(`✅ 已清理 ${thirtyDaysAgo.toISOString()} 之前的旧监控数据`);
    
  } catch (error) {
    console.error('❌ 清理旧数据时出错:', error);
  }
}

/**
 * 10. 系统启动时的集成示例
 */
export async function integrateMonitoringIntoApplication() {
  console.log('🚀 开始集成监控系统到应用程序...');
  
  try {
    // 1. 初始化监控系统
    await initializeMonitoringSystem();
    
    // 2. 设置定时任务
    scheduleMonitoringTasks();
    
    // 3. 获取初始状态
    const initialStatus = monitoringIntegrationService.getStatus();
    console.log(`✅ 监控系统集成完成 - 系统健康评分: ${initialStatus.overall.systemHealthScore}`);
    
    return true;
  } catch (error) {
    console.error('❌ 集成监控系统失败:', error);
    return false;
  }
}

// 模拟辅助函数 - 实际项目中需要替换为真实实现

function updateAPIResponseTimeMetric(endpoint: string, responseTime: number) {
  console.log(`📊 API响应时间: ${endpoint} - ${responseTime}ms`);
  // 实际项目中，这里应该调用监控服务更新指标
}

function updateAPIErrorRateMetric(endpoint: string) {
  console.log(`⚠️ API错误: ${endpoint}`);
  // 实际项目中，这里应该调用监控服务更新错误率指标
}

function logRequestStart(req: NextApiRequest, metadata: any) {
  console.log(`▶️ 请求开始: ${req.method} ${req.url}`, metadata);
}

function logRequestSuccess(req: NextApiRequest, statusCode: number, metadata: any) {
  console.log(`✅ 请求成功: ${req.method} ${req.url} (${statusCode})`, metadata);
}

function logRequestError(req: NextApiRequest, error: any, metadata: any) {
  console.error(`❌ 请求失败: ${req.method} ${req.url}`, error, metadata);
}

function generateCorrelationId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function notifyAdmin(alert: any) {
  console.log(`🔔 通知管理员: ${alert.message}`);
  // 实际项目中，这里应该实现通知逻辑
}

async function logAlertToDatabase(alert: any) {
  console.log(`📝 记录告警到数据库: ${alert.message}`);
  // 实际项目中，这里应该实现数据库存储逻辑
}

function updateSystemStatusDashboard(status: MonitoringStatus) {
  console.log(`🎯 更新系统状态面板`);
  // 实际项目中，这里应该实现状态面板更新逻辑
}

async function saveConfigurationToDatabase(config: any) {
  console.log(`💾 保存配置到数据库`);
  // 实际项目中，这里应该实现配置保存逻辑
}

async function getActiveUsersCount(): Promise<number> {
  return Math.floor(Math.random() * 1000) + 500; // 模拟数据
}

async function getNewRegistrationsCount(): Promise<number> {
  return Math.floor(Math.random() * 100) + 10; // 模拟数据
}

async function getTransactionVolume(): Promise<number> {
  return Math.floor(Math.random() * 5000) + 1000; // 模拟数据
}

async function getAverageOrderValue(): Promise<number> {
  return Math.floor(Math.random() * 1000) + 500; // 模拟数据
}

async function saveReportToDatabase(report: any): Promise<void> {
  console.log(`💾 保存报告到数据库 - ID: ${report.generatedAt.getTime()}`);
  // 实际项目中，这里应该实现报告保存逻辑
}

async function emailReportToTeam(report: any): Promise<void> {
  console.log(`📧 发送报告给团队 - 摘要: ${JSON.stringify(report.summary)}`);
  // 实际项目中，这里应该实现邮件发送逻辑
}

// 导出主要集成函数
export default {
  initializeMonitoringSystem,
  withMonitoring,
  scheduleMonitoringTasks,
  integrateMonitoringIntoApplication
};