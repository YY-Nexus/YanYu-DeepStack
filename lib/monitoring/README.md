# 监控系统使用指南

## 1. 系统概述

本监控系统提供了全面的服务级别协议(SLA)监控和自动故障恢复功能，旨在提高系统的可靠性、可用性和可维护性。系统由三个核心服务组成：

- **监控集成服务(MonitoringIntegrationService)**: 整合所有监控功能，提供统一的管理接口
- **SLA监控服务(SLAMonitoringService)**: 负责监控和报告系统的SLA合规情况
- **故障恢复服务(FaultRecoveryService)**: 自动检测和恢复系统故障

## 2. 快速开始

### 2.1 安装和初始化

```typescript
import { monitoringIntegrationService } from './monitoring';

// 初始化监控系统
await monitoringIntegrationService.initialize({
  // 自定义配置
  slaEnabled: true,
  faultRecoveryEnabled: true,
  alertEnabled: true,
  alertChannels: ['email', 'slack']
});
```

### 2.2 配置SLA目标

```typescript
import { monitoringIntegrationService } from './monitoring';

// 添加SLA目标
await monitoringIntegrationService.addSLATarget({
  id: 'sla_response_time',
  name: '响应时间',
  description: 'API响应时间SLA',
  metricName: 'api_response_time',
  threshold: 500, // 毫秒
  severity: 'critical',
  unit: 'ms',
  warningThreshold: 300 // 毫秒
});
```

### 2.3 添加故障恢复策略

```typescript
import { monitoringIntegrationService } from './monitoring';

// 添加服务不可用恢复策略
monitoringIntegrationService.addRecoveryStrategy({
  faultType: 'service_unavailable',
  name: '服务重启',
  description: '当服务不可用时自动重启',
  priority: 1,
  execute: async (context) => {
    // 执行重启逻辑
    await restartService(context.serviceId);
    return { success: true, duration: 5000, message: '服务已重启' };
  },
  canExecute: (fault) => true // 所有服务不可用故障都可以使用此策略
});
```

## 3. 监控服务使用方法

### 3.1 获取系统状态

```typescript
// 获取当前监控系统状态
const status = monitoringIntegrationService.getStatus();
console.log('系统健康评分:', status.overall.systemHealthScore);
console.log('SLA合规率:', status.overall.slaComplianceRate);
console.log('自动恢复率:', status.overall.autoRecoveryRate);
```

### 3.2 获取仪表板数据

```typescript
// 获取仪表板数据，用于UI展示
const dashboardData = await monitoringIntegrationService.getDashboardData();

// 使用仪表板数据更新UI
updateDashboardUI({
  systemHealth: dashboardData.systemHealth,
  slaMetrics: dashboardData.slaMetrics,
  faultStatistics: dashboardData.faultStatistics,
  resourceUsage: dashboardData.resourceUsage,
  recentEvents: dashboardData.recentEvents
});
```

### 3.3 生成监控报告

```typescript
// 生成指定时间范围的监控报告
const report = await monitoringIntegrationService.generateReport({
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
  end: new Date() // 现在
});

console.log('报告摘要:', report.summary);
console.log('SLA报告:', report.detailedReports.sla);
console.log('故障报告:', report.detailedReports.faults);
console.log('健康报告:', report.detailedReports.health);
```

### 3.4 监听监控事件

```typescript
// 监听告警事件
monitoringIntegrationService.on('alert', (alert) => {
  console.log(`告警: [${alert.severity}] ${alert.message}`);
  // 处理告警，例如显示通知
  showNotification(alert);
});

// 监听状态更新
monitoringIntegrationService.on('status_update', (status) => {
  console.log('系统状态已更新:', status);
  // 更新状态指示器
  updateStatusIndicator(status);
});

// 监听SLA事件
monitoringIntegrationService.on('sla_event', (event) => {
  console.log(`SLA事件: ${event.type} - ${event.metricName}`);
  // 处理SLA事件
  handleSLAEvent(event);
});
```

## 4. 配置管理

### 4.1 更新系统配置

```typescript
// 更新监控系统配置
monitoringIntegrationService.updateConfig({
  // 更新特定配置项
  slaCheckInterval: 30, // 改为30秒
  alertChannels: ['email', 'slack', 'sms'], // 添加短信告警
  logLevel: 'warn' // 降低日志级别
});

// 获取当前配置
const currentConfig = monitoringIntegrationService.getConfig();
console.log('当前配置:', currentConfig);
```

### 4.2 手动控制

```typescript
// 手动触发故障检测
await monitoringIntegrationService.triggerManualFaultDetection();

// 重启监控服务
await monitoringIntegrationService.restart();

// 停止监控服务
monitoringIntegrationService.stop();
```

## 5. 高级功能

### 5.1 自定义恢复策略

```typescript
// 添加高级恢复策略
monitoringIntegrationService.addRecoveryStrategy({
  faultType: 'high_latency',
  name: '自动扩展资源',
  description: '当检测到高延迟时自动扩展资源',
  priority: 2,
  execute: async (context) => {
    try {
      // 获取当前负载
      const load = await getCurrentLoad(context.serviceId);
      
      // 根据负载决定扩展规模
      const scaleFactor = load > 80 ? 2 : 1.5;
      
      // 执行扩展
      const result = await scaleResources(context.serviceId, scaleFactor);
      
      return {
        success: true,
        duration: result.duration,
        message: `资源已扩展 ${scaleFactor} 倍`,
        details: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        recommendations: ['检查资源配额', '手动扩展资源']
      };
    }
  },
  canExecute: (fault) => {
    // 只对特定服务的高延迟故障执行此策略
    return fault.serviceId.startsWith('api-') && fault.details.latency > 1000;
  }
});
```

### 5.2 自定义SLA指标监控

```typescript
// 添加自定义SLA指标
await monitoringIntegrationService.addSLATarget({
  id: 'custom_transaction_success_rate',
  name: '交易成功率',
  description: '重要业务交易的成功率SLA',
  metricName: 'transaction_success_rate',
  threshold: 99.9, // 99.9%成功率
  severity: 'critical',
  unit: '%',
  warningThreshold: 99.95,
  // 自定义检查函数
  customCheck: async () => {
    // 从业务系统获取交易成功率
    const successRate = await getTransactionSuccessRate('last_hour');
    return successRate;
  }
});
```

### 5.3 集成监控到现有系统

```typescript
// 在API层集成监控
import { NextApiRequest, NextApiResponse } from 'next';
import { monitoringIntegrationService } from './monitoring';

export async function withMonitoring(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    const endpoint = `${req.method} ${req.url}`;
    
    try {
      // 执行原处理函数
      const result = await handler(req, res);
      
      // 记录API响应时间
      const responseTime = Date.now() - startTime;
      
      // 更新监控指标
      await monitoringIntegrationService.updateMetric('api_response_time', {
        endpoint,
        value: responseTime,
        timestamp: new Date()
      });
      
      return result;
    } catch (error) {
      // 记录错误
      monitoringIntegrationService.recordError({
        endpoint,
        error,
        timestamp: new Date()
      });
      
      throw error;
    }
  };
}
```

## 6. 常见问题

### 6.1 如何扩展监控系统？

1. 添加新的监控指标：在预测性维护服务中定义新的指标
2. 添加新的SLA目标：使用`addSLATarget`方法
3. 添加新的故障恢复策略：使用`addRecoveryStrategy`方法
4. 集成新的告警通道：扩展告警发送逻辑

### 6.2 如何优化系统性能？

- 调整指标收集间隔
- 优化故障检测算法
- 合理设置缓存时间
- 定期清理历史数据

### 6.3 如何处理误报？

- 调整异常检测阈值
- 优化告警规则
- 添加确认机制
- 收集反馈持续改进

## 7. 最佳实践

1. **分层监控策略**：监控基础设施、应用程序、业务指标
2. **主动预防**：使用趋势预测提前识别潜在问题
3. **自动修复优先**：尽量使用自动恢复策略，减少人工干预
4. **可视化仪表盘**：使用直观的界面展示监控数据
5. **定期回顾**：分析故障模式，持续优化恢复策略
6. **渐进式实施**：先监控核心服务，再扩展到其他服务

---

## 8. 升级日志

### v1.0.0

- 初始版本发布
- 实现SLA监控核心功能
- 实现自动故障恢复机制
- 提供统一的监控集成服务

---

如有任何问题或建议，请联系系统管理员。

保持系统稳定运行，提高服务质量！ 🌹