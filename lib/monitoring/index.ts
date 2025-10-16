/**
 * @file 监控模块入口
 * @description 导出所有监控服务和类型定义
 * @module monitoring
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

// 导出监控集成服务
export { monitoringIntegrationService } from './monitoring-integration-service';
export type { 
  MonitoringConfig, 
  MonitoringStatus, 
  MonitoringDashboardData 
} from './monitoring-integration-service';

// 导出SLA监控服务
export { slaMonitoringService } from './sla-monitoring-service';
export type { 
  SLATarget, 
  SLAMetric, 
  SLAEvent, 
  SLAComplianceReport,
  SLAMonitoringConfig
} from './sla-monitoring-service';

// 导出故障恢复服务
export { faultRecoveryService } from './fault-recovery-service';
export type { 
  Fault, 
  FaultType, 
  FaultStatus, 
  RecoveryResult, 
  RecoveryStrategy, 
  RecoveryAction,
  RecoveryContext,
  RecoveryOptions
} from './fault-recovery-service';

// 从预测性维护服务重新导出常用类型
export type { 
  MetricDefinition, 
  MetricDataPoint, 
  Anomaly, 
  AnomalySeverity, 
  HealthScoreResult 
} from '../ai/predictive-maintenance';

// 默认导出监控集成服务
export default { 
  monitoringIntegrationService, 
  slaMonitoringService, 
  faultRecoveryService 
};