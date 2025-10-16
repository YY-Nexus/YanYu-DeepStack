/**
 * @file SLA监控配置页面
 * @description 定义和跟踪服务级别协议（SLA）的监控系统
 * @module monitoring
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Tabs, TabsContent, TabsList, TabsTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Badge, Separator, Checkbox, Progress, RadioGroup, RadioGroupItem, Label, Slider } from '@/components/ui/';
import { Plus, Trash2, Edit, Save, X, Check, Bell, LineChart, Shield, Target, Calendar, Clock, ChevronRight, HelpCircle, RefreshCw, Award, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/';
import { TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line } from 'recharts';

// SLA类型定义
type SLAType = 'uptime' | 'response_time' | 'error_rate' | 'throughput' | 'custom';

// SLA目标单位
type SLATargetUnit = 'percent' | 'ms' | 'seconds' | 'requests_per_minute' | 'custom';

// 通知策略
type NotificationStrategy = 'breach_only' | 'recovery' | 'both' | 'periodic';

// SLA协议接口
interface SLAAgreement {
  id: string;
  name: string;
  description: string;
  type: SLAType;
  targetValue: number;
  targetUnit: SLATargetUnit;
  monitoringScope: {
    services: string[];
    environments: string[];
    endpoints?: string[];
  };
  measurementPeriod: {
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    startTime?: string;
  };
  gracePeriod: number; // 秒
  notificationStrategy: NotificationStrategy;
  notificationChannels: string[];
  notificationRecipients: string[];
  autoRemediationActions: string[];
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// SLA历史数据接口
interface SLAPerformanceHistory {
  id: string;
  slaId: string;
  periodStart: string;
  periodEnd: string;
  actualValue: number;
  targetValue: number;
  achieved: boolean;
  measurementCount: number;
  violationCount: number;
  averageResponseTime?: number;
  peakResponseTime?: number;
  availabilityPercentage?: number;
}

// SLA表单数据
interface SLAFormData extends Partial<SLAAgreement> {
  isNew?: boolean;
}

// 自动修复操作接口
interface AutoRemediationAction {
  id: string;
  name: string;
  description: string;
  type: 'restart_service' | 'scale_service' | 'clear_cache' | 'failover' | 'run_script' | 'custom';
  parameters: Record<string, any>;
  enabled: boolean;
  requiresApproval: boolean;
  executionTimeout: number;
}

/**
 * SLA监控配置页面
 */
const SLAMonitoring: React.FC = () => {
  // SLA协议列表
  const [slaAgreements, setSlaAgreements] = useState<SLAAgreement[]>([
    {
      id: 'sla_api_uptime',
      name: 'API服务可用性SLA',
      description: '保证核心API服务99.99%的可用性',
      type: 'uptime',
      targetValue: 99.99,
      targetUnit: 'percent',
      monitoringScope: {
        services: ['api-gateway', 'auth-service', 'data-service'],
        environments: ['production'],
        endpoints: ['/api/v1/users', '/api/v1/products', '/api/v1/orders']
      },
      measurementPeriod: {
        type: 'monthly',
        startTime: '2024-01-01T00:00:00Z'
      },
      gracePeriod: 300, // 5分钟
      notificationStrategy: 'both',
      notificationChannels: ['email', 'slack'],
      notificationRecipients: ['admin@example.com', 'sla-team@example.com'],
      autoRemediationActions: ['restart_service', 'failover'],
      enabled: true,
      createdBy: 'system-admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'sla_response_time',
      name: 'API响应时间SLA',
      description: '确保API请求平均响应时间不超过200ms',
      type: 'response_time',
      targetValue: 200,
      targetUnit: 'ms',
      monitoringScope: {
        services: ['api-gateway', 'data-service'],
        environments: ['production'],
        endpoints: ['/api/v1/products', '/api/v1/search']
      },
      measurementPeriod: {
        type: 'daily'
      },
      gracePeriod: 180, // 3分钟
      notificationStrategy: 'breach_only',
      notificationChannels: ['email', 'slack'],
      notificationRecipients: ['performance@example.com', 'dev-team@example.com'],
      autoRemediationActions: ['clear_cache', 'scale_service'],
      enabled: true,
      createdBy: 'performance-engineer',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-02-01T14:20:00Z'
    },
    {
      id: 'sla_error_rate',
      name: 'API错误率SLA',
      description: '保证API错误率不超过0.1%',
      type: 'error_rate',
      targetValue: 0.1,
      targetUnit: 'percent',
      monitoringScope: {
        services: ['api-gateway', 'auth-service', 'payment-service'],
        environments: ['production']
      },
      measurementPeriod: {
        type: 'hourly'
      },
      gracePeriod: 60, // 1分钟
      notificationStrategy: 'breach_only',
      notificationChannels: ['email', 'slack', 'sms'],
      notificationRecipients: ['ops@example.com', 'emergency@example.com'],
      autoRemediationActions: ['restart_service'],
      enabled: true,
      createdBy: 'operations-manager',
      createdAt: '2024-01-15T12:00:00Z',
      updatedAt: '2024-03-10T09:15:00Z'
    },
    {
      id: 'sla_throughput',
      name: '系统吞吐量SLA',
      description: '确保系统在高峰时段每分钟处理至少10000个请求',
      type: 'throughput',
      targetValue: 10000,
      targetUnit: 'requests_per_minute',
      monitoringScope: {
        services: ['api-gateway', 'message-queue'],
        environments: ['production']
      },
      measurementPeriod: {
        type: 'weekly'
      },
      gracePeriod: 300, // 5分钟
      notificationStrategy: 'breach_only',
      notificationChannels: ['email', 'slack'],
      notificationRecipients: ['capacity@example.com', 'devops@example.com'],
      autoRemediationActions: ['scale_service'],
      enabled: true,
      createdBy: 'capacity-planner',
      createdAt: '2024-02-01T16:00:00Z',
      updatedAt: '2024-02-20T11:45:00Z'
    }
  ]);

  // SLA性能历史数据
  const [slaPerformanceHistory, setSlaPerformanceHistory] = useState<SLAPerformanceHistory[]>([
    {
      id: 'perf_1',
      slaId: 'sla_api_uptime',
      periodStart: '2024-09-01T00:00:00Z',
      periodEnd: '2024-09-30T23:59:59Z',
      actualValue: 99.997,
      targetValue: 99.99,
      achieved: true,
      measurementCount: 43200,
      violationCount: 3,
      availabilityPercentage: 99.997
    },
    {
      id: 'perf_2',
      slaId: 'sla_api_uptime',
      periodStart: '2024-08-01T00:00:00Z',
      periodEnd: '2024-08-31T23:59:59Z',
      actualValue: 99.985,
      targetValue: 99.99,
      achieved: false,
      measurementCount: 44640,
      violationCount: 6,
      availabilityPercentage: 99.985
    },
    {
      id: 'perf_3',
      slaId: 'sla_api_uptime',
      periodStart: '2024-07-01T00:00:00Z',
      periodEnd: '2024-07-31T23:59:59Z',
      actualValue: 99.992,
      targetValue: 99.99,
      achieved: true,
      measurementCount: 44640,
      violationCount: 4,
      availabilityPercentage: 99.992
    },
    {
      id: 'perf_4',
      slaId: 'sla_api_uptime',
      periodStart: '2024-06-01T00:00:00Z',
      periodEnd: '2024-06-30T23:59:59Z',
      actualValue: 99.995,
      targetValue: 99.99,
      achieved: true,
      measurementCount: 43200,
      violationCount: 2,
      availabilityPercentage: 99.995
    }
  ]);

  // 自动修复操作列表
  const [autoRemediationActions, setAutoRemediationActions] = useState<AutoRemediationAction[]>([
    {
      id: 'action_restart_service',
      name: '重启服务',
      description: '自动重启指定的服务实例',
      type: 'restart_service',
      parameters: {
        serviceName: '',
        restartDelay: 10,
        maxRetries: 2,
        timeout: 300
      },
      enabled: true,
      requiresApproval: false,
      executionTimeout: 300
    },
    {
      id: 'action_scale_service',
      name: '服务扩容',
      description: '自动增加服务实例数量',
      type: 'scale_service',
      parameters: {
        serviceName: '',
        minInstances: 2,
        maxInstances: 10,
        scaleUpBy: 2,
        coolDownPeriod: 300
      },
      enabled: true,
      requiresApproval: false,
      executionTimeout: 600
    },
    {
      id: 'action_clear_cache',
      name: '清除缓存',
      description: '自动清除指定服务的缓存',
      type: 'clear_cache',
      parameters: {
        serviceName: '',
        cacheType: 'all',
        batchSize: 1000
      },
      enabled: true,
      requiresApproval: false,
      executionTimeout: 120
    },
    {
      id: 'action_failover',
      name: '故障转移',
      description: '自动将流量切换到备用实例',
      type: 'failover',
      parameters: {
        serviceName: '',
        primaryGroup: '',
        backupGroup: '',
        healthCheckTimeout: 30
      },
      enabled: true,
      requiresApproval: true,
      executionTimeout: 180
    },
    {
      id: 'action_run_script',
      name: '执行脚本',
      description: '自动运行指定的修复脚本',
      type: 'run_script',
      parameters: {
        scriptPath: '',
        arguments: '',
        user: 'system'
      },
      enabled: false,
      requiresApproval: true,
      executionTimeout: 600
    }
  ]);

  // 可用的服务列表
  const [availableServices] = useState([
    { value: 'api-gateway', label: 'API网关' },
    { value: 'auth-service', label: '认证服务' },
    { value: 'data-service', label: '数据服务' },
    { value: 'payment-service', label: '支付服务' },
    { value: 'notification-service', label: '通知服务' },
    { value: 'search-service', label: '搜索服务' },
    { value: 'message-queue', label: '消息队列' },
    { value: 'cache-service', label: '缓存服务' },
    { value: 'database-service', label: '数据库服务' },
    { value: 'file-storage', label: '文件存储服务' }
  ]);

  // 可用的环境列表
  const [availableEnvironments] = useState([
    { value: 'production', label: '生产环境' },
    { value: 'staging', label: '预发布环境' },
    { value: 'testing', label: '测试环境' },
    { value: 'development', label: '开发环境' }
  ]);

  // SLA类型信息
  const [slaTypes] = useState<{ value: SLAType; label: string; icon: React.ReactNode }[]>([
    { value: 'uptime', label: '服务可用性', icon: <Shield className="h-4 w-4" /> },
    { value: 'response_time', label: '响应时间', icon: <Clock className="h-4 w-4" /> },
    { value: 'error_rate', label: '错误率', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: 'throughput', label: '吞吐量', icon: <LineChart className="h-4 w-4" /> },
    { value: 'custom', label: '自定义', icon: <Target className="h-4 w-4" /> }
  ]);

  // SLA目标单位
  const [targetUnits] = useState<{ value: SLATargetUnit; label: string; suffix: string }[]>([
    { value: 'percent', label: '百分比', suffix: '%' },
    { value: 'ms', label: '毫秒', suffix: 'ms' },
    { value: 'seconds', label: '秒', suffix: 's' },
    { value: 'requests_per_minute', label: '每分钟请求数', suffix: 'req/min' },
    { value: 'custom', label: '自定义单位', suffix: '' }
  ]);

  // 测量周期
  const [measurementPeriods] = useState([
    { value: 'hourly', label: '每小时' },
    { value: 'daily', label: '每日' },
    { value: 'weekly', label: '每周' },
    { value: 'monthly', label: '每月' },
    { value: 'quarterly', label: '每季度' },
    { value: 'annually', label: '每年' }
  ]);

  // 通知策略
  const [notificationStrategies] = useState([
    { value: 'breach_only', label: '仅SLA违反时通知' },
    { value: 'recovery', label: '仅恢复时通知' },
    { value: 'both', label: '违反和恢复时都通知' },
    { value: 'periodic', label: '定期报告（无论是否违反）' }
  ]);

  // 通知渠道
  const [notificationChannels] = useState([
    { value: 'email', label: '邮件' },
    { value: 'slack', label: 'Slack' },
    { value: 'sms', label: '短信' },
    { value: 'phone', label: '电话' },
    { value: 'webhook', label: 'Webhook' }
  ]);

  // 表单状态
  const [editingSLA, setEditingSLA] = useState<SLAFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('agreements');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedSLAId, setSelectedSLAId] = useState<string | null>(null);

  // 加载SLA配置
  useEffect(() => {
    const loadSLAConfig = async () => {
      try {
        // 这里应该从服务获取实际数据
        // const agreements = await slaService.getSLAAgreements();
        // setSlaAgreements(agreements);
        // 
        // const history = await slaService.getSLAPerformanceHistory();
        // setSlaPerformanceHistory(history);
        // 
        // const actions = await slaService.getAutoRemediationActions();
        // setAutoRemediationActions(actions);
      } catch (error) {
        console.error('加载SLA配置失败:', error);
      }
    };

    loadSLAConfig();
  }, []);

  // 处理保存SLA协议
  const handleSaveSLA = async () => {
    if (!editingSLA) return;

    setIsSaving(true);
    try {
      // 这里应该调用服务保存数据
      // await slaService.updateSLAAgreement(editingSLA);
      
      const updatedAgreements = [...slaAgreements];
      if (editingSLA.isNew) {
        // 为新协议生成ID
        const newSLA: SLAAgreement = {
          id: editingSLA.id || `sla_${Date.now()}`,
          name: editingSLA.name || '',
          description: editingSLA.description || '',
          type: editingSLA.type || 'uptime',
          targetValue: editingSLA.targetValue || 99.9,
          targetUnit: editingSLA.targetUnit || 'percent',
          monitoringScope: editingSLA.monitoringScope || {
            services: [],
            environments: []
          },
          measurementPeriod: editingSLA.measurementPeriod || {
            type: 'daily'
          },
          gracePeriod: editingSLA.gracePeriod || 0,
          notificationStrategy: editingSLA.notificationStrategy || 'breach_only',
          notificationChannels: editingSLA.notificationChannels || [],
          notificationRecipients: editingSLA.notificationRecipients || [],
          autoRemediationActions: editingSLA.autoRemediationActions || [],
          enabled: editingSLA.enabled !== false,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updatedAgreements.push(newSLA);
      } else {
        // 更新现有协议
        const index = updatedAgreements.findIndex(s => s.id === editingSLA.id);
        if (index !== -1) {
          updatedAgreements[index] = { 
            ...updatedAgreements[index], 
            ...editingSLA,
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      setSlaAgreements(updatedAgreements);
      setEditingSLA(null);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('保存SLA协议失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理删除SLA协议
  const handleDeleteSLA = async () => {
    if (!itemToDelete) return;

    try {
      // 这里应该调用服务删除数据
      // await slaService.deleteSLAAgreement(itemToDelete);
      
      const updatedAgreements = slaAgreements.filter(s => s.id !== itemToDelete);
      setSlaAgreements(updatedAgreements);
      setItemToDelete(null);
      setShowConfirmDialog(false);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('删除SLA协议失败:', error);
    }
  };

  // 打开编辑SLA协议表单
  const handleEditSLA = (sla: SLAAgreement) => {
    setEditingSLA({ ...sla });
  };

  // 创建新SLA协议
  const handleCreateSLA = () => {
    setEditingSLA({
      isNew: true,
      id: '',
      name: '',
      description: '',
      type: 'uptime',
      targetValue: 99.9,
      targetUnit: 'percent',
      monitoringScope: {
        services: [],
        environments: []
      },
      measurementPeriod: {
        type: 'daily'
      },
      gracePeriod: 300,
      notificationStrategy: 'breach_only',
      notificationChannels: [],
      notificationRecipients: [],
      autoRemediationActions: [],
      enabled: true
    });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingSLA(null);
  };

  // 处理确认删除
  const handleConfirmDelete = (id: string) => {
    setItemToDelete(id);
    setShowConfirmDialog(true);
  };

  // 获取SLA类型信息
  const getSLATypeInfo = (type: SLAType) => {
    return slaTypes.find(s => s.value === type) || {
      value: type,
      label: type,
      icon: <Target className="h-4 w-4" />
    };
  };

  // 获取目标单位信息
  const getTargetUnitInfo = (unit: SLATargetUnit) => {
    return targetUnits.find(u => u.value === unit) || {
      value: unit,
      label: unit,
      suffix: ''
    };
  };

  // 获取测量周期标签
  const getMeasurementPeriodLabel = (period: string) => {
    return measurementPeriods.find(p => p.value === period)?.label || period;
  };

  // 获取通知策略标签
  const getNotificationStrategyLabel = (strategy: string) => {
    return notificationStrategies.find(s => s.value === strategy)?.label || strategy;
  };

  // 获取通知渠道标签
  const getNotificationChannelLabel = (channel: string) => {
    return notificationChannels.find(c => c.value === channel)?.label || channel;
  };

  // 获取服务名称
  const getServiceName = (serviceId: string) => {
    return availableServices.find(s => s.value === serviceId)?.label || serviceId;
  };

  // 获取环境名称
  const getEnvironmentName = (envId: string) => {
    return availableEnvironments.find(e => e.value === envId)?.label || envId;
  };

  // 获取自动修复操作名称
  const getActionName = (actionId: string) => {
    return autoRemediationActions.find(a => a.id === `action_${actionId}`)?.name || actionId;
  };

  // 获取SLA性能历史图表数据
  const getPerformanceChartData = () => {
    return slaPerformanceHistory
      .filter(perf => perf.slaId === selectedSLAId)
      .sort((a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime())
      .map(perf => ({
        period: new Date(perf.periodStart).toLocaleDateString('zh-CN', { month: 'short', year: 'numeric' }),
        actual: perf.actualValue,
        target: perf.targetValue,
        achieved: perf.achieved
      }));
  };

  // 计算SLA总体达成率
  const calculateOverallSLACompliance = () => {
    const totalPeriods = slaPerformanceHistory.length;
    if (totalPeriods === 0) return 0;
    
    const successfulPeriods = slaPerformanceHistory.filter(perf => perf.achieved).length;
    return (successfulPeriods / totalPeriods) * 100;
  };

  // 渲染SLA协议表格
  const renderAgreementsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SLA名称</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>目标</TableHead>
          <TableHead>监控范围</TableHead>
          <TableHead>测量周期</TableHead>
          <TableHead>通知策略</TableHead>
          <TableHead>自动修复</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {slaAgreements.map((sla) => {
          const slaTypeInfo = getSLATypeInfo(sla.type);
          const unitInfo = getTargetUnitInfo(sla.targetUnit);
          
          return (
            <TableRow key={sla.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  {slaTypeInfo.icon}
                  <span className="ml-2">{sla.name}</span>
                </div>
              </TableCell>
              <TableCell>{slaTypeInfo.label}</TableCell>
              <TableCell>
                <Badge variant={sla.type === 'error_rate' ? 'outline' : 'secondary'}>
                  {sla.targetValue} {unitInfo.suffix}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">服务</div>
                  <div className="flex flex-wrap gap-1">
                    {sla.monitoringScope.services.slice(0, 2).map(service => (
                      <Badge key={service} variant="outline" className="text-xs">
                        {getServiceName(service)}
                      </Badge>
                    ))}
                    {sla.monitoringScope.services.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{sla.monitoringScope.services.length - 2}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">环境</div>
                  <div className="flex flex-wrap gap-1">
                    {sla.monitoringScope.environments.map(env => (
                      <Badge key={env} variant="outline" className="text-xs">
                        {getEnvironmentName(env)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TableCell>
              <TableCell>{getMeasurementPeriodLabel(sla.measurementPeriod.type)}</TableCell>
              <TableCell>{getNotificationStrategyLabel(sla.notificationStrategy)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {sla.autoRemediationActions.slice(0, 2).map(action => (
                    <Badge key={action} variant="outline" className="text-xs">
                      {getActionName(action)}
                    </Badge>
                  ))}
                  {sla.autoRemediationActions.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{sla.autoRemediationActions.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={sla.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {sla.enabled ? '已启用' : '已禁用'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setSelectedSLAId(sla.id);
                    setActiveTab('performance');
                  }}>
                    <LineChart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEditSLA(sla)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleConfirmDelete(sla.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  // 渲染SLA性能页面
  const renderPerformancePage = () => {
    const selectedSLA = slaAgreements.find(s => s.id === selectedSLAId);
    const performanceData = getPerformanceChartData();
    const overallCompliance = calculateOverallSLACompliance();
    
    // 模拟最近7天的性能数据
    const recentDailyPerformance = [
      { day: '周一', value: 99.995 },
      { day: '周二', value: 99.988 },
      { day: '周三', value: 100 },
      { day: '周四', value: 99.992 },
      { day: '周五', value: 99.997 },
      { day: '周六', value: 99.999 },
      { day: '周日', value: 99.985 }
    ];

    return (
      <div className="space-y-6">
        {selectedSLA ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {selectedSLA.name} - 性能分析
                    </CardTitle>
                    <CardDescription>{selectedSLA.description}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('agreements')}>
                    返回列表
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">目标</div>
                    <div className="text-2xl font-bold">
                      {selectedSLA.targetValue} {getTargetUnitInfo(selectedSLA.targetUnit).suffix}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      每{getMeasurementPeriodLabel(selectedSLA.measurementPeriod.type)}测量
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">最近达成率</div>
                    <div className="text-2xl font-bold text-green-600">
                      {performanceData.length > 0 ? performanceData[performanceData.length - 1].actual.toFixed(4) : 'N/A'}
                      {getTargetUnitInfo(selectedSLA.targetUnit).suffix}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {performanceData.length > 0 && performanceData[performanceData.length - 1].achieved ? (
                        <span className="text-green-500 flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          达成SLA目标
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          未达成SLA目标
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">总体达成率</div>
                    <div className="text-2xl font-bold">
                      {overallCompliance.toFixed(2)}%
                    </div>
                    <Progress value={overallCompliance} className="h-2 mt-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      {slaPerformanceHistory.filter(perf => perf.achieved).length} / {slaPerformanceHistory.length} 个周期达成
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">历史性能趋势</CardTitle>
                <CardDescription>展示最近几个测量周期的SLA达成情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={selectedSLA.type === 'error_rate' ? [0, Math.max(...performanceData.map(d => d.actual)) * 1.5] : [
                        Math.min(...performanceData.map(d => d.actual)) * 0.95,
                        Math.max(...performanceData.map(d => d.actual)) * 1.05
                      ]} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="实际值" strokeWidth={2} />
                      <Line type="monotone" dataKey="target" stroke="#ef4444" name="目标值" strokeDasharray="5 5" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">最近7天性能</CardTitle>
                <CardDescription>展示最近7天的SLA达成情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recentDailyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[
                        Math.min(...recentDailyPerformance.map(d => d.value)) * 0.99,
                        Math.max(...recentDailyPerformance.map(d => d.value)) * 1.01
                      ]} />
                      <RechartsTooltip />
                      <Bar 
                        dataKey="value" 
                        name="SLA达成率"
                        fill={(entry) => {
                          const targetValue = selectedSLA.targetValue;
                          return entry.value >= targetValue ? '#10b981' : '#ef4444';
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">SLA违反历史</CardTitle>
                <CardDescription>最近的SLA违反事件</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>违反时间</TableHead>
                      <TableHead>持续时间</TableHead>
                      <TableHead>原因</TableHead>
                      <TableHead>影响范围</TableHead>
                      <TableHead>自动修复</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2024-09-25 14:30</TableCell>
                      <TableCell>12分钟</TableCell>
                      <TableCell>数据库连接池耗尽</TableCell>
                      <TableCell>支付服务</TableCell>
                      <TableCell>已执行重启</TableCell>
                      <TableCell><Badge variant="secondary" className="bg-green-100 text-green-800">已恢复</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-09-18 09:15</TableCell>
                      <TableCell>4分钟</TableCell>
                      <TableCell>缓存服务故障</TableCell>
                      <TableCell>API网关、搜索服务</TableCell>
                      <TableCell>已执行故障转移</TableCell>
                      <TableCell><Badge variant="secondary" className="bg-green-100 text-green-800">已恢复</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-09-10 22:45</TableCell>
                      <TableCell>8分钟</TableCell>
                      <TableCell>网络延迟过高</TableCell>
                      <TableCell>全服务</TableCell>
                      <TableCell>已执行扩容</TableCell>
                      <TableCell><Badge variant="secondary" className="bg-green-100 text-green-800">已恢复</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">请选择SLA协议</h3>
              <p className="text-gray-500 text-center max-w-md">
                从SLA协议列表中选择一个协议来查看其详细性能数据和分析报告
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveTab('agreements')}>
                返回SLA列表
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // 渲染SLA协议表单
  const renderSLAForm = () => (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {editingSLA?.isNew ? '创建新SLA协议' : '编辑SLA协议'}
        </CardTitle>
        <CardDescription>定义服务级别协议（SLA）的目标和监控范围</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ID *</label>
            <Input
              value={editingSLA?.id || ''}
              onChange={(e) => editingSLA && setEditingSLA({ ...editingSLA, id: e.target.value })}
              placeholder="输入SLA ID（小写英文）"
              disabled={!editingSLA?.isNew}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">名称 *</label>
            <Input
              value={editingSLA?.name || ''}
              onChange={(e) => editingSLA && setEditingSLA({ ...editingSLA, name: e.target.value })}
              placeholder="输入SLA名称"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">描述</label>
            <Input
              value={editingSLA?.description || ''}
              onChange={(e) => editingSLA && setEditingSLA({ ...editingSLA, description: e.target.value })}
              placeholder="输入SLA描述"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">SLA类型 *</label>
            <Select
              value={editingSLA?.type || 'uptime'}
              onValueChange={(value: SLAType) => {
                if (!editingSLA) return;
                
                // 根据类型设置默认单位
                let defaultUnit: SLATargetUnit = 'percent';
                let defaultValue = 99.9;
                
                switch (value) {
                  case 'uptime':
                    defaultUnit = 'percent';
                    defaultValue = 99.9;
                    break;
                  case 'response_time':
                    defaultUnit = 'ms';
                    defaultValue = 200;
                    break;
                  case 'error_rate':
                    defaultUnit = 'percent';
                    defaultValue = 0.1;
                    break;
                  case 'throughput':
                    defaultUnit = 'requests_per_minute';
                    defaultValue = 1000;
                    break;
                  default:
                    defaultUnit = 'custom';
                    defaultValue = 0;
                }
                
                setEditingSLA({
                  ...editingSLA,
                  type: value,
                  targetUnit: defaultUnit,
                  targetValue: defaultValue
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择SLA类型" />
              </SelectTrigger>
              <SelectContent>
                {slaTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center">
                      {type.icon}
                      <span className="ml-2">{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">目标值 *</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                step={editingSLA?.type === 'error_rate' ? '0.01' : '0.1'}
                value={editingSLA?.targetValue || ''}
                onChange={(e) => editingSLA && setEditingSLA({ ...editingSLA, targetValue: parseFloat(e.target.value) })}
                placeholder="输入目标值"
                className="flex-grow"
              />
              <Select
                value={editingSLA?.targetUnit || 'percent'}
                onValueChange={(value: SLATargetUnit) => editingSLA && setEditingSLA({ ...editingSLA, targetUnit: value })}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="单位" />
                </SelectTrigger>
                <SelectContent>
                  {targetUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* 监控范围 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <Shield className="h-4 w-4 mr-2 text-blue-500" />
            监控范围
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">监控服务 *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableServices.map((service) => {
                  const isSelected = editingSLA?.monitoringScope?.services?.includes(service.value) || false;
                  
                  return (
                    <div key={service.value} className="flex items-center space-x-2 p-2 border rounded-md">
                      <Checkbox
                        id={`service-${service.value}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (!editingSLA) return;
                          const currentServices = [...(editingSLA.monitoringScope?.services || [])];
                          
                          if (checked) {
                            // 添加服务
                            if (!currentServices.includes(service.value)) {
                              currentServices.push(service.value);
                            }
                          } else {
                            // 移除服务
                            const index = currentServices.indexOf(service.value);
                            if (index !== -1) {
                              currentServices.splice(index, 1);
                            }
                          }
                          
                          setEditingSLA({
                            ...editingSLA,
                            monitoringScope: {
                              ...editingSLA.monitoringScope,
                              services: currentServices
                            }
                          });
                        }}
                      />
                      <label htmlFor={`service-${service.value}`} className="text-sm cursor-pointer">
                        {service.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">监控环境 *</label>
              <div className="grid grid-cols-2 gap-2">
                {availableEnvironments.map((environment) => {
                  const isSelected = editingSLA?.monitoringScope?.environments?.includes(environment.value) || false;
                  
                  return (
                    <div key={environment.value} className="flex items-center space-x-2 p-2 border rounded-md">
                      <Checkbox
                        id={`env-${environment.value}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (!editingSLA) return;
                          const currentEnvironments = [...(editingSLA.monitoringScope?.environments || [])];
                          
                          if (checked) {
                            // 添加环境
                            if (!currentEnvironments.includes(environment.value)) {
                              currentEnvironments.push(environment.value);
                            }
                          } else {
                            // 移除环境
                            const index = currentEnvironments.indexOf(environment.value);
                            if (index !== -1) {
                              currentEnvironments.splice(index, 1);
                            }
                          }
                          
                          setEditingSLA({
                            ...editingSLA,
                            monitoringScope: {
                              ...editingSLA.monitoringScope,
                              environments: currentEnvironments
                            }
                          });
                        }}
                      />
                      <label htmlFor={`env-${environment.value}`} className="text-sm cursor-pointer">
                        {environment.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {editingSLA?.monitoringScope?.services?.includes('api-gateway') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">监控端点（可选）</label>
                <Input
                  value={editingSLA?.monitoringScope?.endpoints?.join(', ') || ''}
                  onChange={(e) => {
                    if (!editingSLA) return;
                    const endpoints = e.target.value
                      .split(',')
                      .map(endpoint => endpoint.trim())
                      .filter(endpoint => endpoint);
                    setEditingSLA({
                      ...editingSLA,
                      monitoringScope: {
                        ...editingSLA.monitoringScope,
                        endpoints
                      }
                    });
                  }}
                  placeholder="输入API端点，多个用逗号分隔，如：/api/users,/api/products"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* 测量周期 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            测量配置
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">测量周期 *</label>
              <Select
                value={editingSLA?.measurementPeriod?.type || 'daily'}
                onValueChange={(value) => {
                  if (!editingSLA) return;
                  setEditingSLA({
                    ...editingSLA,
                    measurementPeriod: {
                      ...editingSLA.measurementPeriod,
                      type: value as any
                    }
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择测量周期" />
                </SelectTrigger>
                <SelectContent>
                  {measurementPeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">宽限期（秒）</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={editingSLA?.gracePeriod || 300}
                  onChange={(e) => editingSLA && setEditingSLA({ ...editingSLA, gracePeriod: parseInt(e.target.value) })}
                  placeholder="输入宽限期"
                  className="flex-grow"
                />
                <span className="flex items-center text-sm text-gray-500">
                  {editingSLA?.gracePeriod && `${Math.floor(editingSLA.gracePeriod / 60)}分钟${editingSLA.gracePeriod % 60}秒`}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                SLA违反后等待多长时间才触发告警和自动修复操作
              </p>
            </div>
          </div>
        </div>
        
        {/* 通知配置 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <Bell className="h-4 w-4 mr-2 text-blue-500" />
            通知配置
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">通知策略 *</label>
              <RadioGroup
                value={editingSLA?.notificationStrategy || 'breach_only'}
                onValueChange={(value) => editingSLA && setEditingSLA({ ...editingSLA, notificationStrategy: value as NotificationStrategy })}
                className="space-y-2"
              >
                {notificationStrategies.map((strategy) => (
                  <div key={strategy.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={strategy.value} id={`strategy-${strategy.value}`} />
                    <Label htmlFor={`strategy-${strategy.value}`} className="text-sm">
                      {strategy.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">通知渠道 *</label>
              <div className="grid grid-cols-2 gap-2">
                {notificationChannels.map((channel) => {
                  const isSelected = editingSLA?.notificationChannels?.includes(channel.value) || false;
                  
                  return (
                    <div key={channel.value} className="flex items-center space-x-2 p-2 border rounded-md">
                      <Checkbox
                        id={`channel-${channel.value}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (!editingSLA) return;
                          const currentChannels = [...(editingSLA.notificationChannels || [])];
                          
                          if (checked) {
                            // 添加渠道
                            if (!currentChannels.includes(channel.value)) {
                              currentChannels.push(channel.value);
                            }
                          } else {
                            // 移除渠道
                            const index = currentChannels.indexOf(channel.value);
                            if (index !== -1) {
                              currentChannels.splice(index, 1);
                            }
                          }
                          
                          setEditingSLA({ ...editingSLA, notificationChannels: currentChannels });
                        }}
                      />
                      <label htmlFor={`channel-${channel.value}`} className="text-sm cursor-pointer">
                        {channel.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">通知接收者 *</label>
              <Input
                value={editingSLA?.notificationRecipients?.join(', ') || ''}
                onChange={(e) => {
                  if (!editingSLA) return;
                  const recipients = e.target.value
                    .split(',')
                    .map(recipient => recipient.trim())
                    .filter(recipient => recipient);
                  setEditingSLA({ ...editingSLA, notificationRecipients: recipients });
                }}
                placeholder="输入通知接收者，多个用逗号分隔"
              />
            </div>
          </div>
        </div>
        
        {/* 自动修复配置 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
            自动修复配置
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">自动修复操作</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {autoRemediationActions
                  .filter(action => action.enabled)
                  .map((action) => {
                    const isSelected = editingSLA?.autoRemediationActions?.includes(action.type) || false;
                    
                    return (
                      <div key={action.id} className="flex items-center space-x-2 p-2 border rounded-md">
                        <Checkbox
                          id={`action-${action.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (!editingSLA) return;
                            const currentActions = [...(editingSLA.autoRemediationActions || [])];
                            
                            if (checked) {
                              // 添加操作
                              if (!currentActions.includes(action.type)) {
                                currentActions.push(action.type);
                              }
                            } else {
                              // 移除操作
                              const index = currentActions.indexOf(action.type);
                              if (index !== -1) {
                                currentActions.splice(index, 1);
                              }
                            }
                            
                            setEditingSLA({ ...editingSLA, autoRemediationActions: currentActions });
                          }}
                        />
                        <label htmlFor={`action-${action.id}`} className="text-sm cursor-pointer">
                          {action.name}
                        </label>
                        {action.requiresApproval && (
                          <TooltipProvider>
                            <TooltipTrigger>
                              <Badge variant="outline" className="text-xs ml-1">
                                需要审批
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">执行此操作需要人工审批</p>
                            </TooltipContent>
                          </TooltipProvider>
                        )}
                      </div>
                    );
                  })}
              </div>
              <p className="text-xs text-gray-500">
                SLA违反时自动执行的修复操作，按照选择顺序执行
              </p>
            </div>
          </div>
        </div>
        
        {/* 状态配置 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">启用SLA</label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingSLA?.enabled !== false}
              onCheckedChange={(checked) => editingSLA && setEditingSLA({ ...editingSLA, enabled: checked })}
            />
            <span className="text-sm text-gray-500">是否启用此SLA协议监控</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="secondary" onClick={handleCancelEdit} disabled={isSaving}>
            取消
          </Button>
          <Button
            onClick={handleSaveSLA}
            disabled={
              isSaving ||
              !editingSLA?.id ||
              !editingSLA?.name ||
              !editingSLA?.type ||
              editingSLA?.targetValue === undefined ||
              !editingSLA?.targetUnit ||
              !editingSLA?.monitoringScope?.services ||
              editingSLA.monitoringScope.services.length === 0 ||
              !editingSLA?.monitoringScope?.environments ||
              editingSLA.monitoringScope.environments.length === 0 ||
              !editingSLA?.notificationChannels ||
              editingSLA.notificationChannels.length === 0 ||
              !editingSLA?.notificationRecipients ||
              editingSLA.notificationRecipients.length === 0
            }
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SLA监控管理</h1>
            <p className="text-gray-500 dark:text-gray-400">定义、跟踪和管理服务级别协议</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Award className="h-3 w-3 mr-1" />
              总体达成率: {calculateOverallSLACompliance().toFixed(2)}%
            </Badge>
          </div>
        </div>

        {/* 保存成功提示 */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2" />
              <span>保存成功</span>
            </div>
          </div>
        )}

        {/* 编辑表单 */}
        {editingSLA && renderSLAForm()}

        {/* 配置标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
            <TabsTrigger value="agreements">SLA协议</TabsTrigger>
            <TabsTrigger value="performance">性能分析</TabsTrigger>
          </TabsList>

          {/* SLA协议标签页 */}
          <TabsContent value="agreements">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-medium">SLA协议管理</CardTitle>
                    <CardDescription>定义和管理服务级别协议</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleCreateSLA} disabled={!!editingSLA}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加SLA协议
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderAgreementsTable()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 性能分析标签页 */}
          <TabsContent value="performance">
            {renderPerformancePage()}
          </TabsContent>
        </Tabs>

        {/* 删除确认对话框 */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除此SLA协议吗？此操作无法撤销，将同时删除相关的历史性能数据。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSLA}>
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SLAMonitoring;