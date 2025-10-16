/**
 * @file SLA监控系统组件
 * @description 监控和可视化服务水平协议指标，提供SLA违反警报和历史数据
 * @module monitoring
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Tabs, TabsContent, TabsList, TabsTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Badge, Separator, Checkbox, Label, Textarea, BarChart as LucideBarChart, PieChart as LucidePieChart, LineChart as LucideLineChart } from '@/components/ui/';
import { AlertCircle, CheckCircle2, XCircle, Clock, AlertTriangle, TrendingUp, TrendingDown, Info, Plus, Edit, Trash2, Calendar, Filter, RefreshCw, Download, ChevronDown, ChevronUp, Eye, Settings, BellRing, ThumbsUp, ThumbsDown, Target, AlertSquare, Zap } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/';
import { TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { AreaChart, Area } from 'recharts';

// SLA指标类型
type SLAMetricType = 'availability' | 'response_time' | 'throughput' | 'error_rate' | 'latency' | 'custom';

// SLA目标接口
interface SLATarget {
  id: string;
  name: string;
  description: string;
  serviceId: string;
  serviceName: string;
  metricType: SLAMetricType;
  targetValue: number;
  thresholdValue: number;
  measurementUnit: string;
  evaluationWindow: string;
  violationThreshold: number;
  enabled: boolean;
  autoRemediationActionId?: string;
  createdAt: string;
  updatedAt: string;
}

// SLA违反记录接口
interface SLAViolation {
  id: string;
  slaTargetId: string;
  slaTargetName: string;
  serviceId: string;
  serviceName: string;
  metricType: SLAMetricType;
  metricValue: number;
  thresholdValue: number;
  violationTime: string;
  resolvedTime?: string;
  duration?: number;
  status: 'open' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredActions: string[];
  notes?: string;
}

// SLA度量数据接口
interface SLAMeasurement {
  timestamp: string;
  value: number;
  status: 'normal' | 'warning' | 'violation';
}

// 服务接口
interface Service {
  id: string;
  name: string;
  type: string;
  environment: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  resourceGroup: string;
}

// SLA性能数据接口
interface SLAPerformanceData {
  timeRange: string;
  totalChecks: number;
  violations: number;
  uptimePercentage: number;
  averageValue: number;
  p95Value: number;
  p99Value: number;
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * SLA监控系统组件
 */
const SLAMonitor: React.FC = () => {
  // SLA目标列表
  const [slaTargets, setSlaTargets] = useState<SLATarget[]>([
    {
      id: 'sla-001',
      name: 'API网关可用性',
      description: '确保API网关的可用性达到99.9%',
      serviceId: 'svc-001',
      serviceName: 'api-gateway',
      metricType: 'availability',
      targetValue: 99.9,
      thresholdValue: 99.5,
      measurementUnit: '%',
      evaluationWindow: 'daily',
      violationThreshold: 5,
      enabled: true,
      autoRemediationActionId: 'action_restart_service',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'sla-002',
      name: '数据服务响应时间',
      description: '确保数据服务的平均响应时间不超过200ms',
      serviceId: 'svc-003',
      serviceName: 'data-service',
      metricType: 'response_time',
      targetValue: 200,
      thresholdValue: 300,
      measurementUnit: 'ms',
      evaluationWindow: '15m',
      violationThreshold: 3,
      enabled: true,
      autoRemediationActionId: 'action_scale_service',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-02-01T14:20:00Z'
    },
    {
      id: 'sla-003',
      name: '支付服务错误率',
      description: '确保支付服务的错误率不超过0.1%',
      serviceId: 'svc-004',
      serviceName: 'payment-service',
      metricType: 'error_rate',
      targetValue: 0.1,
      thresholdValue: 0.5,
      measurementUnit: '%',
      evaluationWindow: '5m',
      violationThreshold: 2,
      enabled: true,
      autoRemediationActionId: 'action_restart_service',
      createdAt: '2024-01-15T12:00:00Z',
      updatedAt: '2024-03-10T09:15:00Z'
    },
    {
      id: 'sla-004',
      name: '认证服务吞吐量',
      description: '确保认证服务的吞吐量不低于每秒1000请求',
      serviceId: 'svc-002',
      serviceName: 'auth-service',
      metricType: 'throughput',
      targetValue: 1000,
      thresholdValue: 800,
      measurementUnit: 'req/s',
      evaluationWindow: '1m',
      violationThreshold: 3,
      enabled: true,
      autoRemediationActionId: 'action_scale_service',
      createdAt: '2024-02-01T16:00:00Z',
      updatedAt: '2024-02-20T11:45:00Z'
    },
    {
      id: 'sla-005',
      name: '缓存服务延迟',
      description: '确保缓存服务的95%响应时间不超过10ms',
      serviceId: 'svc-006',
      serviceName: 'cache-service',
      metricType: 'latency',
      targetValue: 10,
      thresholdValue: 20,
      measurementUnit: 'ms',
      evaluationWindow: '1m',
      violationThreshold: 5,
      enabled: true,
      autoRemediationActionId: 'action_clear_cache',
      createdAt: '2024-02-15T09:00:00Z',
      updatedAt: '2024-02-15T09:00:00Z'
    }
  ]);

  // SLA违反记录
  const [slaViolations, setSlaViolations] = useState<SLAViolation[]>([
    {
      id: 'viol-001',
      slaTargetId: 'sla-002',
      slaTargetName: '数据服务响应时间',
      serviceId: 'svc-003',
      serviceName: 'data-service',
      metricType: 'response_time',
      metricValue: 350,
      thresholdValue: 300,
      violationTime: '2024-09-25T14:30:15Z',
      resolvedTime: '2024-09-25T14:33:20Z',
      duration: 185,
      status: 'resolved',
      severity: 'medium',
      triggeredActions: ['action_scale_service'],
      notes: '服务扩容后恢复正常'
    },
    {
      id: 'viol-002',
      slaTargetId: 'sla-001',
      slaTargetName: 'API网关可用性',
      serviceId: 'svc-001',
      serviceName: 'api-gateway',
      metricType: 'availability',
      metricValue: 99.2,
      thresholdValue: 99.5,
      violationTime: '2024-09-24T11:45:00Z',
      resolvedTime: '2024-09-24T11:50:30Z',
      duration: 330,
      status: 'resolved',
      severity: 'high',
      triggeredActions: ['action_restart_service'],
      notes: '服务重启后恢复'
    },
    {
      id: 'viol-003',
      slaTargetId: 'sla-003',
      slaTargetName: '支付服务错误率',
      serviceId: 'svc-004',
      serviceName: 'payment-service',
      metricType: 'error_rate',
      metricValue: 0.8,
      thresholdValue: 0.5,
      violationTime: '2024-09-23T09:20:30Z',
      resolvedTime: '2024-09-23T09:25:15Z',
      duration: 285,
      status: 'resolved',
      severity: 'high',
      triggeredActions: ['action_restart_service'],
      notes: '数据库连接问题已解决'
    },
    {
      id: 'viol-004',
      slaTargetId: 'sla-005',
      slaTargetName: '缓存服务延迟',
      serviceId: 'svc-006',
      serviceName: 'cache-service',
      metricType: 'latency',
      metricValue: 25,
      thresholdValue: 20,
      violationTime: '2024-09-22T16:10:45Z',
      resolvedTime: '2024-09-22T16:12:20Z',
      duration: 95,
      status: 'resolved',
      severity: 'medium',
      triggeredActions: ['action_clear_cache'],
      notes: '缓存清理后延迟降低'
    },
    {
      id: 'viol-005',
      slaTargetId: 'sla-004',
      slaTargetName: '认证服务吞吐量',
      serviceId: 'svc-002',
      serviceName: 'auth-service',
      metricType: 'throughput',
      metricValue: 750,
      thresholdValue: 800,
      violationTime: '2024-09-21T22:40:15Z',
      resolvedTime: '2024-09-21T22:45:30Z',
      duration: 315,
      status: 'resolved',
      severity: 'low',
      triggeredActions: ['action_scale_service'],
      notes: '扩容后吞吐量恢复'
    },
    {
      id: 'viol-006',
      slaTargetId: 'sla-001',
      slaTargetName: 'API网关可用性',
      serviceId: 'svc-001',
      serviceName: 'api-gateway',
      metricType: 'availability',
      metricValue: 98.9,
      thresholdValue: 99.5,
      violationTime: '2024-09-20T14:15:00Z',
      status: 'open',
      severity: 'critical',
      triggeredActions: ['action_failover'],
      notes: '正在处理中，已触发故障转移'
    }
  ]);

  // 服务列表
  const [services, setServices] = useState<Service[]>([
    { id: 'svc-001', name: 'api-gateway', type: 'api', environment: 'production', status: 'degraded', resourceGroup: 'rg-api' },
    { id: 'svc-002', name: 'auth-service', type: 'api', environment: 'production', status: 'healthy', resourceGroup: 'rg-api' },
    { id: 'svc-003', name: 'data-service', type: 'api', environment: 'production', status: 'healthy', resourceGroup: 'rg-data' },
    { id: 'svc-004', name: 'payment-service', type: 'api', environment: 'production', status: 'healthy', resourceGroup: 'rg-payments' },
    { id: 'svc-005', name: 'notification-service', type: 'api', environment: 'production', status: 'healthy', resourceGroup: 'rg-common' },
    { id: 'svc-006', name: 'cache-service', type: 'cache', environment: 'production', status: 'healthy', resourceGroup: 'rg-data' },
    { id: 'svc-007', name: 'db-primary', type: 'database', environment: 'production', status: 'healthy', resourceGroup: 'rg-data' },
    { id: 'svc-008', name: 'db-replica', type: 'database', environment: 'production', status: 'healthy', resourceGroup: 'rg-data' },
    { id: 'svc-009', name: 'message-queue', type: 'message_queue', environment: 'production', status: 'healthy', resourceGroup: 'rg-messaging' },
    { id: 'svc-010', name: 'file-storage', type: 'storage', environment: 'production', status: 'healthy', resourceGroup: 'rg-storage' }
  ]);

  // 自动修复操作列表
  const [remediationActions] = useState([
    { id: 'action_restart_service', name: '重启服务' },
    { id: 'action_scale_service', name: '服务扩容' },
    { id: 'action_clear_cache', name: '清除缓存' },
    { id: 'action_failover', name: '故障转移' },
    { id: 'action_run_script', name: '执行脚本' }
  ]);

  // 时间范围选择
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedSlaTarget, setSelectedSlaTarget] = useState<SLATarget | null>(null);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [editingTarget, setEditingTarget] = useState<Partial<SLATarget> | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // SLA度量数据
  const [measurementData, setMeasurementData] = useState<SLAMeasurement[]>([]);
  const [performanceData, setPerformanceData] = useState<SLAPerformanceData | null>(null);

  // 实时更新定时器
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 加载数据
  useEffect(() => {
    const loadSlaData = async () => {
      try {
        // 这里应该从服务获取实际数据
        // const targets = await slaService.getSlaTargets();
        // setSlaTargets(targets);
        // 
        // const violations = await slaService.getSlaViolations();
        // setSlaViolations(violations);
        // 
        // const serviceList = await serviceRegistryService.getServices();
        // setServices(serviceList);
      } catch (error) {
        console.error('加载SLA数据失败:', error);
      }
    };

    loadSlaData();
    
    // 模拟实时数据更新
    startRealtimeUpdates();
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  // 当选择SLA目标或时间范围改变时，加载度量数据
  useEffect(() => {
    if (selectedSlaTarget) {
      loadMeasurementData(selectedSlaTarget.id, timeRange);
    }
  }, [selectedSlaTarget, timeRange]);

  // 启动实时数据更新
  const startRealtimeUpdates = () => {
    updateIntervalRef.current = setInterval(() => {
      // 模拟实时数据更新
      if (selectedSlaTarget) {
        updateMeasurementData();
      }
    }, 5000); // 每5秒更新一次
  };

  // 加载度量数据
  const loadMeasurementData = (slaTargetId: string, timeRange: string) => {
    // 模拟加载度量数据
    const data: SLAMeasurement[] = [];
    const now = new Date();
    let points = 24; // 默认24个点
    
    // 根据时间范围调整数据点数量
    switch (timeRange) {
      case '1h':
        points = 12;
        break;
      case '24h':
        points = 24;
        break;
      case '7d':
        points = 168;
        break;
      case '30d':
        points = 720;
        break;
      default:
        points = 24;
    }
    
    // 生成模拟数据
    for (let i = points - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 3600000); // 每小时一个点
      
      // 找到对应的SLA目标
      const target = slaTargets.find(t => t.id === slaTargetId);
      if (!target) continue;
      
      let value = 0;
      let status = 'normal';
      
      // 根据不同的度量类型生成合理的随机值
      switch (target.metricType) {
        case 'availability':
          // 可用性通常很高，随机在99.8%到100%之间
          value = 99.8 + Math.random() * 0.2;
          // 最后几个点可能出现下降（模拟问题）
          if (i < 3) {
            value = 99.5 - Math.random() * 0.8;
          }
          status = value >= target.thresholdValue ? 'normal' : 'warning';
          status = value >= target.targetValue ? 'normal' : status;
          break;
        case 'response_time':
          // 响应时间，随机在100ms到300ms之间
          value = 100 + Math.random() * 200;
          // 最后几个点可能出现上升（模拟问题）
          if (i < 3) {
            value = 300 + Math.random() * 100;
          }
          status = value <= target.thresholdValue ? 'normal' : 'warning';
          status = value <= target.targetValue ? 'normal' : status;
          break;
        case 'error_rate':
          // 错误率，随机在0.01%到0.2%之间
          value = 0.01 + Math.random() * 0.19;
          // 最后几个点可能出现上升（模拟问题）
          if (i < 3) {
            value = 0.5 + Math.random() * 0.5;
          }
          status = value <= target.thresholdValue ? 'normal' : 'warning';
          status = value <= target.targetValue ? 'normal' : status;
          break;
        case 'throughput':
          // 吞吐量，随机在800到1200之间
          value = 800 + Math.random() * 400;
          // 最后几个点可能出现下降（模拟问题）
          if (i < 3) {
            value = 600 + Math.random() * 200;
          }
          status = value >= target.thresholdValue ? 'normal' : 'warning';
          status = value >= target.targetValue ? 'normal' : status;
          break;
        case 'latency':
          // 延迟，随机在5ms到20ms之间
          value = 5 + Math.random() * 15;
          // 最后几个点可能出现上升（模拟问题）
          if (i < 3) {
            value = 20 + Math.random() * 10;
          }
          status = value <= target.thresholdValue ? 'normal' : 'warning';
          status = value <= target.targetValue ? 'normal' : status;
          break;
        default:
          value = Math.random() * 100;
          status = 'normal';
      }
      
      data.push({
        timestamp: timestamp.toISOString(),
        value: parseFloat(value.toFixed(2)),
        status
      });
    }
    
    setMeasurementData(data);
    
    // 计算性能指标
    calculatePerformanceMetrics(data, target);
  };

  // 更新度量数据（实时更新）
  const updateMeasurementData = () => {
    if (!selectedSlaTarget || measurementData.length === 0) return;
    
    const newData = [...measurementData];
    const now = new Date();
    
    // 移除最旧的数据点
    newData.shift();
    
    // 添加新的数据点
    let value = 0;
    let status = 'normal';
    
    // 根据不同的度量类型生成合理的随机值
    switch (selectedSlaTarget.metricType) {
      case 'availability':
        value = 99.8 + Math.random() * 0.2;
        // 随机模拟问题
        if (Math.random() < 0.05) {
          value = 99.5 - Math.random() * 0.8;
        }
        status = value >= selectedSlaTarget.thresholdValue ? 'normal' : 'warning';
        status = value >= selectedSlaTarget.targetValue ? 'normal' : status;
        break;
      case 'response_time':
        value = 100 + Math.random() * 200;
        // 随机模拟问题
        if (Math.random() < 0.05) {
          value = 300 + Math.random() * 100;
        }
        status = value <= selectedSlaTarget.thresholdValue ? 'normal' : 'warning';
        status = value <= selectedSlaTarget.targetValue ? 'normal' : status;
        break;
      case 'error_rate':
        value = 0.01 + Math.random() * 0.19;
        // 随机模拟问题
        if (Math.random() < 0.05) {
          value = 0.5 + Math.random() * 0.5;
        }
        status = value <= selectedSlaTarget.thresholdValue ? 'normal' : 'warning';
        status = value <= selectedSlaTarget.targetValue ? 'normal' : status;
        break;
      case 'throughput':
        value = 800 + Math.random() * 400;
        // 随机模拟问题
        if (Math.random() < 0.05) {
          value = 600 + Math.random() * 200;
        }
        status = value >= selectedSlaTarget.thresholdValue ? 'normal' : 'warning';
        status = value >= selectedSlaTarget.targetValue ? 'normal' : status;
        break;
      case 'latency':
        value = 5 + Math.random() * 15;
        // 随机模拟问题
        if (Math.random() < 0.05) {
          value = 20 + Math.random() * 10;
        }
        status = value <= selectedSlaTarget.thresholdValue ? 'normal' : 'warning';
        status = value <= selectedSlaTarget.targetValue ? 'normal' : status;
        break;
      default:
        value = Math.random() * 100;
        status = 'normal';
    }
    
    newData.push({
      timestamp: now.toISOString(),
      value: parseFloat(value.toFixed(2)),
      status
    });
    
    setMeasurementData(newData);
    
    // 重新计算性能指标
    calculatePerformanceMetrics(newData, selectedSlaTarget);
  };

  // 计算性能指标
  const calculatePerformanceMetrics = (data: SLAMeasurement[], target: SLATarget | undefined) => {
    if (!target || data.length === 0) return;
    
    const values = data.map(m => m.value);
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // 计算P95和P99值
    const sortedValues = [...values].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedValues.length * 0.95);
    const p99Index = Math.floor(sortedValues.length * 0.99);
    const p95Value = sortedValues[p95Index];
    const p99Value = sortedValues[p99Index];
    
    // 计算违反次数
    let violations = 0;
    let uptimePercentage = 100;
    
    if (target.metricType === 'availability') {
      // 对于可用性，计算平均值作为运行时间百分比
      uptimePercentage = averageValue;
      // 计算违反次数
      violations = data.filter(m => m.value < target.thresholdValue).length;
    } else if (target.metricType === 'throughput') {
      // 对于吞吐量，计算低于阈值的次数作为违反次数
      violations = data.filter(m => m.value < target.thresholdValue).length;
      uptimePercentage = 100 - (violations / data.length) * 100;
    } else {
      // 对于其他指标，计算高于阈值的次数作为违反次数
      violations = data.filter(m => m.value > target.thresholdValue).length;
      uptimePercentage = 100 - (violations / data.length) * 100;
    }
    
    // 计算趋势
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    
    // 比较前一半和后一半数据的平均值
    const midPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midPoint);
    const secondHalf = data.slice(midPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length;
    
    const diff = Math.abs(secondHalfAvg - firstHalfAvg);
    const threshold = target.targetValue * 0.05; // 5%的变化被视为显著
    
    if (diff > threshold) {
      if (target.metricType === 'availability' || target.metricType === 'throughput') {
        // 这些指标值越高越好
        trend = secondHalfAvg > firstHalfAvg ? 'improving' : 'declining';
      } else {
        // 这些指标值越低越好
        trend = secondHalfAvg < firstHalfAvg ? 'improving' : 'declining';
      }
    }
    
    setPerformanceData({
      timeRange,
      totalChecks: data.length,
      violations,
      uptimePercentage: parseFloat(uptimePercentage.toFixed(2)),
      averageValue: parseFloat(averageValue.toFixed(2)),
      p95Value: parseFloat(p95Value.toFixed(2)),
      p99Value: parseFloat(p99Value.toFixed(2)),
      trend
    });
  };

  // 处理保存SLA目标
  const handleSaveSlaTarget = async () => {
    if (!editingTarget) return;

    setIsSaving(true);
    try {
      // 这里应该调用服务保存数据
      // await slaService.updateSlaTarget(editingTarget);
      
      const updatedTargets = [...slaTargets];
      if (!editingTarget.id) {
        // 为新目标生成ID
        const service = services.find(s => s.id === editingTarget.serviceId);
        if (!service) {
          throw new Error('找不到对应的服务');
        }
        
        const newTarget: SLATarget = {
          id: `sla-${Date.now()}`,
          name: editingTarget.name || '',
          description: editingTarget.description || '',
          serviceId: editingTarget.serviceId || '',
          serviceName: service.name,
          metricType: editingTarget.metricType || 'availability',
          targetValue: editingTarget.targetValue || 0,
          thresholdValue: editingTarget.thresholdValue || 0,
          measurementUnit: editingTarget.measurementUnit || '',
          evaluationWindow: editingTarget.evaluationWindow || '15m',
          violationThreshold: editingTarget.violationThreshold || 3,
          enabled: editingTarget.enabled !== false,
          autoRemediationActionId: editingTarget.autoRemediationActionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updatedTargets.push(newTarget);
      } else {
        // 更新现有目标
        const index = updatedTargets.findIndex(t => t.id === editingTarget.id);
        if (index !== -1) {
          if (editingTarget.serviceId && updatedTargets[index].serviceId !== editingTarget.serviceId) {
            const service = services.find(s => s.id === editingTarget.serviceId);
            if (service) {
              editingTarget.serviceName = service.name;
            }
          }
          
          updatedTargets[index] = { 
            ...updatedTargets[index], 
            ...editingTarget,
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      setSlaTargets(updatedTargets);
      setEditingTarget(null);
      setShowEditForm(false);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('保存SLA目标失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理删除SLA目标
  const handleDeleteSlaTarget = async () => {
    if (!itemToDelete) return;

    try {
      // 这里应该调用服务删除数据
      // await slaService.deleteSlaTarget(itemToDelete);
      
      const updatedTargets = slaTargets.filter(t => t.id !== itemToDelete);
      setSlaTargets(updatedTargets);
      setItemToDelete(null);
      setShowConfirmDialog(false);
      setSaveSuccess(true);
      
      // 如果删除的是当前选中的目标，清除选中
      if (selectedSlaTarget?.id === itemToDelete) {
        setSelectedSlaTarget(null);
        setMeasurementData([]);
        setPerformanceData(null);
      }
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('删除SLA目标失败:', error);
    }
  };

  // 处理编辑SLA目标
  const handleEditSlaTarget = (target: SLATarget) => {
    setEditingTarget({ ...target });
    setShowEditForm(true);
  };

  // 处理创建新SLA目标
  const handleCreateSlaTarget = () => {
    setEditingTarget({
      name: '',
      description: '',
      serviceId: '',
      metricType: 'availability',
      targetValue: 99.9,
      thresholdValue: 99.5,
      measurementUnit: '%',
      evaluationWindow: '15m',
      violationThreshold: 3,
      enabled: true
    });
    setShowEditForm(true);
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditingTarget(null);
    setShowEditForm(false);
  };

  // 处理确认删除
  const handleConfirmDelete = (id: string) => {
    setItemToDelete(id);
    setShowConfirmDialog(true);
  };

  // 处理查看SLA目标详情
  const handleViewSlaTarget = (target: SLATarget) => {
    setSelectedSlaTarget(target);
    setActiveTab('details');
    // 加载度量数据
    loadMeasurementData(target.id, timeRange);
  };

  // 渲染SLA概览
  const renderOverview = () => {
    // 计算摘要数据
    const totalTargets = slaTargets.length;
    const enabledTargets = slaTargets.filter(t => t.enabled).length;
    const openViolations = slaViolations.filter(v => v.status === 'open').length;
    const resolvedViolations = slaViolations.filter(v => v.status === 'resolved').length;
    
    // 计算整体SLA合规率
    const complianceRate = totalTargets > 0 ? 
      parseFloat(((enabledTargets - openViolations) / enabledTargets * 100).toFixed(1)) : 100;
    
    // 最近24小时的违反记录
    const recentViolations = slaViolations.filter(v => {
      const violationTime = new Date(v.violationTime);
      const now = new Date();
      const diffHours = (now.getTime() - violationTime.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    });
    
    // 按服务分组的SLA状态
    const serviceSlaStatus = services.map(service => {
      const serviceTargets = slaTargets.filter(t => t.serviceId === service.id && t.enabled);
      const serviceViolations = recentViolations.filter(v => v.serviceId === service.id);
      const hasOpenViolations = serviceViolations.some(v => v.status === 'open');
      
      let status = 'compliant';
      if (hasOpenViolations) {
        status = 'violated';
      } else if (serviceTargets.length === 0) {
        status = 'no_targets';
      }
      
      return {
        service,
        targets: serviceTargets.length,
        violations: serviceViolations.length,
        status
      };
    });
    
    // 准备饼图数据
    const pieChartData = [
      { name: '合规', value: enabledTargets - openViolations, color: '#10b981' }, // 绿色
      { name: '违反', value: openViolations, color: '#ef4444' }, // 红色
      { name: '已禁用', value: totalTargets - enabledTargets, color: '#6b7280' } // 灰色
    ].filter(item => item.value > 0);
    
    // 准备趋势图数据
    const trendData = [
      { day: '周一', compliance: 98.5 },
      { day: '周二', compliance: 99.2 },
      { day: '周三', compliance: 97.8 },
      { day: '周四', compliance: 99.5 },
      { day: '周五', compliance: 99.0 },
      { day: '周六', compliance: 98.7 },
      { day: '周日', compliance: complianceRate }
    ];
    
    return (
      <div className="space-y-6">
        {/* 摘要卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">总SLA目标数</div>
              <div className="text-3xl font-bold">{totalTargets}</div>
              <div className="mt-2 text-sm text-gray-500">
                已启用: {enabledTargets} | 已禁用: {totalTargets - enabledTargets}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">当前违反数</div>
              <div className="text-3xl font-bold text-red-500">{openViolations}</div>
              <div className="mt-2 text-sm text-gray-500">
                24小时内: {recentViolations.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">SLA合规率</div>
              <div className={`text-3xl font-bold ${complianceRate >= 95 ? 'text-green-500' : 'text-red-500'}`}>
                {complianceRate}%
              </div>
              <div className="mt-2 text-sm">
                <span className={`inline-flex items-center ${trendData[trendData.length-1].compliance > trendData[trendData.length-2].compliance ? 'text-green-500' : 'text-red-500'}`}>
                  {trendData[trendData.length-1].compliance > trendData[trendData.length-2].compliance ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(trendData[trendData.length-1].compliance - trendData[trendData.length-2].compliance).toFixed(1)}%
                </span>
                <span className="text-gray-500"> vs 昨天</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">已解决违反</div>
              <div className="text-3xl font-bold text-green-500">{resolvedViolations}</div>
              <div className="mt-2 text-sm text-gray-500">
                平均解决时间: 5分钟
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SLA状态分布 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">SLA状态分布</CardTitle>
              <CardDescription>显示各SLA目标的合规状态</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip formatter={(value) => [`${value} 个目标`, '数量']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* 合规率趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">SLA合规率趋势</CardTitle>
              <CardDescription>过去7天的SLA合规率变化</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[90, 100]} />
                  <RechartsTooltip formatter={(value) => [`${value}%`, '合规率']} />
                  <Line 
                    type="monotone" 
                    dataKey="compliance" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* 服务SLA状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">服务SLA状态</CardTitle>
            <CardDescription>各服务的SLA目标和违反情况</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>服务名称</TableHead>
                  <TableHead>环境</TableHead>
                  <TableHead>SLA目标数</TableHead>
                  <TableHead>24小时违反数</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceSlaStatus.map((item) => {
                  let statusBadge = '';
                  let statusColor = '';
                  
                  switch (item.status) {
                    case 'compliant':
                      statusBadge = '合规';
                      statusColor = 'bg-green-100 text-green-800';
                      break;
                    case 'violated':
                      statusBadge = '违反';
                      statusColor = 'bg-red-100 text-red-800';
                      break;
                    case 'no_targets':
                      statusBadge = '无目标';
                      statusColor = 'bg-gray-100 text-gray-800';
                      break;
                  }
                  
                  return (
                    <TableRow key={item.service.id}>
                      <TableCell className="font-medium">{item.service.name}</TableCell>
                      <TableCell>{item.service.environment}</TableCell>
                      <TableCell>{item.targets}</TableCell>
                      <TableCell>{item.violations}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColor}>
                          {statusBadge}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* 最近违反记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">最近SLA违反记录</CardTitle>
            <CardDescription>最近24小时内的SLA违反情况</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SLA目标</TableHead>
                  <TableHead>服务名称</TableHead>
                  <TableHead>违反时间</TableHead>
                  <TableHead>违反值</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>严重程度</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentViolations.slice(0, 10).map((violation) => {
                  const severityColor = {
                    'low': 'bg-blue-100 text-blue-800',
                    'medium': 'bg-yellow-100 text-yellow-800',
                    'high': 'bg-orange-100 text-orange-800',
                    'critical': 'bg-red-100 text-red-800'
                  }[violation.severity];
                  
                  return (
                    <TableRow key={violation.id}>
                      <TableCell>{violation.slaTargetName}</TableCell>
                      <TableCell>{violation.serviceName}</TableCell>
                      <TableCell>{new Date(violation.violationTime).toLocaleString('zh-CN')}</TableCell>
                      <TableCell>{violation.metricValue}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={violation.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {violation.status === 'open' ? '未解决' : '已解决'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={severityColor}>
                          {{
                            'low': '低',
                            'medium': '中',
                            'high': '高',
                            'critical': '严重'
                          }[violation.severity]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {recentViolations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="py-6">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-gray-500">24小时内无SLA违反记录</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染SLA目标列表
  const renderSlaTargetsList = () => {
    // 计算每个SLA目标的当前状态
    const targetsWithStatus = slaTargets.map(target => {
      // 查找最近的违反记录
      const recentViolation = slaViolations.find(v => 
        v.slaTargetId === target.id && v.status === 'open'
      );
      
      // 确定状态
      let status = 'compliant';
      if (!target.enabled) {
        status = 'disabled';
      } else if (recentViolation) {
        status = 'violated';
      }
      
      return {
        ...target,
        status,
        hasOpenViolation: !!recentViolation
      };
    });
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-medium">SLA目标管理</CardTitle>
              <CardDescription>定义和管理服务水平协议目标</CardDescription>
            </div>
            <Button size="sm" onClick={handleCreateSlaTarget}>
              <Plus className="h-4 w-4 mr-2" />
              添加SLA目标
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SLA目标名称</TableHead>
                <TableHead>服务</TableHead>
                <TableHead>度量类型</TableHead>
                <TableHead>目标值</TableHead>
                <TableHead>阈值</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>启用状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {targetsWithStatus.map((target) => {
                let statusColor = '';
                let statusLabel = '';
                
                switch (target.status) {
                  case 'compliant':
                    statusColor = 'bg-green-100 text-green-800';
                    statusLabel = '合规';
                    break;
                  case 'violated':
                    statusColor = 'bg-red-100 text-red-800';
                    statusLabel = '违反';
                    break;
                  case 'disabled':
                    statusColor = 'bg-gray-100 text-gray-800';
                    statusLabel = '已禁用';
                    break;
                }
                
                const metricTypeLabel = {
                  'availability': '可用性',
                  'response_time': '响应时间',
                  'throughput': '吞吐量',
                  'error_rate': '错误率',
                  'latency': '延迟',
                  'custom': '自定义'
                }[target.metricType];
                
                return (
                  <TableRow key={target.id}>
                    <TableCell className="font-medium">{target.name}</TableCell>
                    <TableCell>{target.serviceName}</TableCell>
                    <TableCell>{metricTypeLabel}</TableCell>
                    <TableCell>{target.targetValue} {target.measurementUnit}</TableCell>
                    <TableCell>{target.thresholdValue} {target.measurementUnit}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor}>
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={target.enabled}
                        onCheckedChange={async (checked) => {
                          // 这里应该调用服务更新状态
                          // await slaService.updateSlaTargetStatus(target.id, checked);
                          
                          const updatedTargets = slaTargets.map(t => 
                            t.id === target.id ? { ...t, enabled: checked } : t
                          );
                          setSlaTargets(updatedTargets);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewSlaTarget(target)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditSlaTarget(target)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleConfirmDelete(target.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  // 渲染SLA违反记录列表
  const renderViolationsList = () => {
    // 过滤和排序违反记录
    const sortedViolations = [...slaViolations].sort((a, b) => 
      new Date(b.violationTime).getTime() - new Date(a.violationTime).getTime()
    );
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">SLA违反记录</CardTitle>
          <CardDescription>所有SLA违反的详细记录</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SLA目标</TableHead>
                <TableHead>服务</TableHead>
                <TableHead>度量类型</TableHead>
                <TableHead>违反值</TableHead>
                <TableHead>阈值</TableHead>
                <TableHead>违反时间</TableHead>
                <TableHead>解决时间</TableHead>
                <TableHead>持续时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>严重程度</TableHead>
                <TableHead>触发操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedViolations.map((violation) => {
                const severityColor = {
                  'low': 'bg-blue-100 text-blue-800',
                  'medium': 'bg-yellow-100 text-yellow-800',
                  'high': 'bg-orange-100 text-orange-800',
                  'critical': 'bg-red-100 text-red-800'
                }[violation.severity];
                
                const metricTypeLabel = {
                  'availability': '可用性',
                  'response_time': '响应时间',
                  'throughput': '吞吐量',
                  'error_rate': '错误率',
                  'latency': '延迟',
                  'custom': '自定义'
                }[violation.metricType];
                
                // 格式化持续时间
                let durationStr = '-';
                if (violation.duration) {
                  const minutes = Math.floor(violation.duration / 60);
                  const seconds = violation.duration % 60;
                  durationStr = `${minutes}分${seconds}秒`;
                }
                
                // 获取触发的操作名称
                const actionNames = violation.triggeredActions.map(actionId => {
                  const action = remediationActions.find(a => a.id === actionId);
                  return action ? action.name : actionId;
                }).join(', ');
                
                return (
                  <TableRow key={violation.id}>
                    <TableCell>{violation.slaTargetName}</TableCell>
                    <TableCell>{violation.serviceName}</TableCell>
                    <TableCell>{metricTypeLabel}</TableCell>
                    <TableCell>{violation.metricValue}</TableCell>
                    <TableCell>{violation.thresholdValue}</TableCell>
                    <TableCell>{new Date(violation.violationTime).toLocaleString('zh-CN')}</TableCell>
                    <TableCell>{violation.resolvedTime ? new Date(violation.resolvedTime).toLocaleString('zh-CN') : '-'}</TableCell>
                    <TableCell>{durationStr}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={violation.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {violation.status === 'open' ? '未解决' : '已解决'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={severityColor}>
                        {{
                          'low': '低',
                          'medium': '中',
                          'high': '高',
                          'critical': '严重'
                        }[violation.severity]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{actionNames || '-'}</TableCell>
                  </TableRow>
                );
              })}
              {sortedViolations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">
                    <div className="py-6">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="text-gray-500">暂无SLA违反记录</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  // 渲染SLA详情视图
  const renderSlaDetails = () => {
    if (!selectedSlaTarget) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">未选择SLA目标</h3>
            <p className="text-gray-500 text-center max-w-md">
              请从SLA目标列表中选择一个目标查看详细信息和性能数据
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveTab('targets')}>
              查看SLA目标列表
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    const metricTypeLabel = {
      'availability': '可用性',
      'response_time': '响应时间',
      'throughput': '吞吐量',
      'error_rate': '错误率',
      'latency': '延迟',
      'custom': '自定义'
    }[selectedSlaTarget.metricType];
    
    // 查找相关的违反记录
    const targetViolations = slaViolations.filter(v => v.slaTargetId === selectedSlaTarget.id);
    const openViolations = targetViolations.filter(v => v.status === 'open');
    
    // 获取触发操作信息
    const remediationAction = selectedSlaTarget.autoRemediationActionId ? 
      remediationActions.find(a => a.id === selectedSlaTarget.autoRemediationActionId) : null;
    
    return (
      <div className="space-y-6">
        {/* SLA目标详情卡片 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-medium">SLA目标详情</CardTitle>
                <CardDescription>{selectedSlaTarget.description}</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditSlaTarget(selectedSlaTarget)}>
                  <Edit className="h-4 w-4 mr-1" />
                  编辑
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('targets')}>
                  返回列表
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 基本信息 */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-3">基本信息</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">名称:</span>
                    <span className="text-sm font-medium">{selectedSlaTarget.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">服务:</span>
                    <span className="text-sm font-medium">{selectedSlaTarget.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">度量类型:</span>
                    <span className="text-sm font-medium">{metricTypeLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">评估窗口:</span>
                    <span className="text-sm font-medium">{selectedSlaTarget.evaluationWindow}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">状态:</span>
                    <Badge variant="outline" className={selectedSlaTarget.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {selectedSlaTarget.enabled ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* 目标阈值 */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-3">目标与阈值</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">目标值:</span>
                    <span className="text-sm font-medium text-green-600">
                      {selectedSlaTarget.targetValue} {selectedSlaTarget.measurementUnit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">阈值:</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {selectedSlaTarget.thresholdValue} {selectedSlaTarget.measurementUnit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">违反阈值次数:</span>
                    <span className="text-sm font-medium">{selectedSlaTarget.violationThreshold}次</span>
                  </div>
                  {openViolations.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">当前违反数:</span>
                      <span className="text-sm font-medium text-red-600">{openViolations.length}次</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 自动修复 */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-3">自动修复配置</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">自动修复:</span>
                    <Badge variant="outline" className={!!remediationAction ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                      {!!remediationAction ? '已配置' : '未配置'}
                    </Badge>
                  </div>
                  {remediationAction && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">修复操作:</span>
                      <span className="text-sm font-medium">{remediationAction.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">总违反次数:</span>
                    <span className="text-sm font-medium">{targetViolations.length}次</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">已解决违反:</span>
                    <span className="text-sm font-medium text-green-600">
                      {targetViolations.filter(v => v.status === 'resolved').length}次
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">SLA 监控系统</h1>
          <div className="space-x-2">
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw size={16} />
              刷新数据
            </Button>
            <Button className="flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              创建目标
            </Button>
          </div>
        </div>
        
        {/* SLA 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {renderOverviewCards()}
        </div>
        
        {/* 图表区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {renderCharts()}
        </div>
        
        {/* 服务 SLA 状态表格 */}
        {renderServiceTable()}
        
        {/* SLA 详情视图 */}
        {selectedSlaTarget && renderSlaTargetDetails()}
      </div>
    </div>
  );
}