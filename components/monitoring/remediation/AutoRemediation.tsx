/**
 * @file 自动故障恢复管理页面
 * @description 定义和管理自动修复操作，用于在SLA违反时自动执行恢复措施
 * @module monitoring
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Tabs, TabsContent, TabsList, TabsTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Badge, Separator, Checkbox, Label, Textarea } from '@/components/ui/';
import { Plus, Trash2, Edit, Save, X, Check, AlertTriangle, RefreshCw, PlayCircle, PauseCircle, Shield, Cpu, Database, Zap, FileCode, Settings, ChevronRight, HelpCircle, History, Users, Server } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/';
import { TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line } from 'recharts';

// 自动修复操作类型
type RemediationActionType = 'restart_service' | 'scale_service' | 'clear_cache' | 'failover' | 'run_script' | 'custom';

// 自动修复操作接口
interface AutoRemediationAction {
  id: string;
  name: string;
  description: string;
  type: RemediationActionType;
  parameters: Record<string, any>;
  enabled: boolean;
  requiresApproval: boolean;
  executionTimeout: number;
  retryCount: number;
  retryDelay: number;
  createdAt: string;
  updatedAt: string;
}

// 修复操作执行历史接口
interface RemediationExecution {
  id: string;
  actionId: string;
  actionName: string;
  actionType: RemediationActionType;
  trigger: 'sla_violation' | 'manual' | 'scheduled';
  triggerDetails: string;
  startTime: string;
  endTime: string | null;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'canceled';
  executionLog: string;
  result: any;
  executedBy: string;
  approvedBy?: string;
  approvalTime?: string;
}

// 自动修复操作表单数据
interface RemediationActionFormData extends Partial<AutoRemediationAction> {
  isNew?: boolean;
}

// 服务类型
type ServiceType = 'api' | 'database' | 'cache' | 'message_queue' | 'storage' | 'compute';

// 服务接口
interface Service {
  id: string;
  name: string;
  type: ServiceType;
  environment: string;
  instances: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  resourceGroup: string;
}

/**
 * 自动故障恢复管理页面
 */
const AutoRemediation: React.FC = () => {
  // 自动修复操作列表
  const [remediationActions, setRemediationActions] = useState<AutoRemediationAction[]>([
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
      executionTimeout: 300,
      retryCount: 2,
      retryDelay: 30,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
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
      executionTimeout: 600,
      retryCount: 1,
      retryDelay: 60,
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-02-01T14:20:00Z'
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
      executionTimeout: 120,
      retryCount: 3,
      retryDelay: 20,
      createdAt: '2024-01-15T12:00:00Z',
      updatedAt: '2024-03-10T09:15:00Z'
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
      executionTimeout: 180,
      retryCount: 1,
      retryDelay: 60,
      createdAt: '2024-02-01T16:00:00Z',
      updatedAt: '2024-02-20T11:45:00Z'
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
      executionTimeout: 600,
      retryCount: 0,
      retryDelay: 0,
      createdAt: '2024-02-15T09:00:00Z',
      updatedAt: '2024-02-15T09:00:00Z'
    }
  ]);

  // 修复操作执行历史
  const [executionHistory, setExecutionHistory] = useState<RemediationExecution[]>([
    {
      id: 'exec_1',
      actionId: 'action_restart_service',
      actionName: '重启服务',
      actionType: 'restart_service',
      trigger: 'sla_violation',
      triggerDetails: 'API服务可用性SLA违反',
      startTime: '2024-09-25T14:30:15Z',
      endTime: '2024-09-25T14:33:20Z',
      status: 'success',
      executionLog: '开始重启服务 api-gateway\n停止实例 api-gateway-01\n停止实例 api-gateway-02\n启动实例 api-gateway-01\n启动实例 api-gateway-02\n服务重启完成，健康检查通过',
      result: { success: true, restartedInstances: 2 },
      executedBy: 'system',
    },
    {
      id: 'exec_2',
      actionId: 'action_failover',
      actionName: '故障转移',
      actionType: 'failover',
      trigger: 'sla_violation',
      triggerDetails: 'API响应时间SLA违反',
      startTime: '2024-09-18T09:15:00Z',
      endTime: '2024-09-18T09:18:45Z',
      status: 'success',
      executionLog: '检测到主服务异常\n准备切换到备用服务\n更新负载均衡配置\n开始流量切换\n完成流量切换\n确认备用服务健康',
      result: { success: true, failoverTarget: 'backup-group-1' },
      executedBy: 'system',
      approvedBy: 'oncall-engineer',
      approvalTime: '2024-09-18T09:15:30Z'
    },
    {
      id: 'exec_3',
      actionId: 'action_scale_service',
      actionName: '服务扩容',
      actionType: 'scale_service',
      trigger: 'sla_violation',
      triggerDetails: '系统吞吐量SLA违反',
      startTime: '2024-09-10T22:45:30Z',
      endTime: '2024-09-10T22:52:10Z',
      status: 'success',
      executionLog: '开始扩容 data-service\n从 4 实例扩展到 6 实例\n创建实例 data-service-05\n创建实例 data-service-06\n等待实例就绪\n实例就绪，更新负载均衡\n扩容完成',
      result: { success: true, fromInstances: 4, toInstances: 6 },
      executedBy: 'system'
    },
    {
      id: 'exec_4',
      actionId: 'action_clear_cache',
      actionName: '清除缓存',
      actionType: 'clear_cache',
      trigger: 'manual',
      triggerDetails: '管理员手动触发',
      startTime: '2024-09-05T16:20:45Z',
      endTime: '2024-09-05T16:22:10Z',
      status: 'success',
      executionLog: '开始清除 cache-service 缓存\n清除用户会话缓存\n清除数据缓存\n清除配置缓存\n缓存清除完成',
      result: { success: true, clearedItems: 15420 },
      executedBy: 'admin-user'
    },
    {
      id: 'exec_5',
      actionId: 'action_restart_service',
      actionName: '重启服务',
      actionType: 'restart_service',
      trigger: 'sla_violation',
      triggerDetails: 'API错误率SLA违反',
      startTime: '2024-09-01T11:30:00Z',
      endTime: '2024-09-01T11:35:20Z',
      status: 'failed',
      executionLog: '开始重启服务 payment-service\n停止实例 payment-service-01\n启动实例 payment-service-01\n实例启动失败: 数据库连接超时\n尝试重试...\n再次启动实例 payment-service-01\n实例启动失败: 数据库连接超时\n操作失败',
      result: { success: false, error: '实例启动失败' },
      executedBy: 'system'
    }
  ]);

  // 服务列表
  const [services, setServices] = useState<Service[]>([
    { id: 'svc-001', name: 'api-gateway', type: 'api', environment: 'production', instances: 4, status: 'healthy', resourceGroup: 'rg-api' },
    { id: 'svc-002', name: 'auth-service', type: 'api', environment: 'production', instances: 2, status: 'healthy', resourceGroup: 'rg-api' },
    { id: 'svc-003', name: 'data-service', type: 'api', environment: 'production', instances: 6, status: 'healthy', resourceGroup: 'rg-data' },
    { id: 'svc-004', name: 'payment-service', type: 'api', environment: 'production', instances: 2, status: 'degraded', resourceGroup: 'rg-payments' },
    { id: 'svc-005', name: 'notification-service', type: 'api', environment: 'production', instances: 2, status: 'healthy', resourceGroup: 'rg-common' },
    { id: 'svc-006', name: 'cache-service', type: 'cache', environment: 'production', instances: 3, status: 'healthy', resourceGroup: 'rg-data' },
    { id: 'svc-007', name: 'db-primary', type: 'database', environment: 'production', instances: 1, status: 'healthy', resourceGroup: 'rg-data' },
    { id: 'svc-008', name: 'db-replica', type: 'database', environment: 'production', instances: 2, status: 'healthy', resourceGroup: 'rg-data' },
    { id: 'svc-009', name: 'message-queue', type: 'message_queue', environment: 'production', instances: 3, status: 'healthy', resourceGroup: 'rg-messaging' },
    { id: 'svc-010', name: 'file-storage', type: 'storage', environment: 'production', instances: 2, status: 'healthy', resourceGroup: 'rg-storage' }
  ]);

  // 修复操作类型
  const [actionTypes] = useState<{ value: RemediationActionType; label: string; description: string; icon: React.ReactNode }[]>([
    { value: 'restart_service', label: '重启服务', description: '重启指定的服务实例', icon: <RefreshCw className="h-4 w-4" /> },
    { value: 'scale_service', label: '服务扩容', description: '增加或减少服务实例数量', icon: <Zap className="h-4 w-4" /> },
    { value: 'clear_cache', label: '清除缓存', description: '清除服务缓存数据', icon: <Database className="h-4 w-4" /> },
    { value: 'failover', label: '故障转移', description: '将流量切换到备用实例', icon: <Shield className="h-4 w-4" /> },
    { value: 'run_script', label: '执行脚本', description: '运行自定义修复脚本', icon: <FileCode className="h-4 w-4" /> },
    { value: 'custom', label: '自定义操作', description: '自定义修复操作', icon: <Settings className="h-4 w-4" /> }
  ]);

  // 缓存类型
  const [cacheTypes] = useState([
    { value: 'all', label: '所有缓存' },
    { value: 'user_session', label: '用户会话缓存' },
    { value: 'data_cache', label: '数据缓存' },
    { value: 'config_cache', label: '配置缓存' },
    { value: 'application_cache', label: '应用缓存' }
  ]);

  // 执行状态
  const [executionStatuses] = useState([
    { value: 'pending', label: '等待中', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in_progress', label: '执行中', color: 'bg-blue-100 text-blue-800' },
    { value: 'success', label: '成功', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: '失败', color: 'bg-red-100 text-red-800' },
    { value: 'canceled', label: '已取消', color: 'bg-gray-100 text-gray-800' }
  ]);

  // 触发器类型
  const [triggerTypes] = useState([
    { value: 'sla_violation', label: 'SLA违反', icon: <AlertTriangle className="h-3 w-3" /> },
    { value: 'manual', label: '手动触发', icon: <Users className="h-3 w-3" /> },
    { value: 'scheduled', label: '定时触发', icon: <Server className="h-3 w-3" /> }
  ]);

  // 表单状态
  const [editingAction, setEditingAction] = useState<RemediationActionFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('actions');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);

  // 加载数据
  useEffect(() => {
    const loadRemediationData = async () => {
      try {
        // 这里应该从服务获取实际数据
        // const actions = await remediationService.getRemediationActions();
        // setRemediationActions(actions);
        // 
        // const history = await remediationService.getExecutionHistory();
        // setExecutionHistory(history);
        // 
        // const serviceList = await serviceRegistryService.getServices();
        // setServices(serviceList);
      } catch (error) {
        console.error('加载自动修复数据失败:', error);
      }
    };

    loadRemediationData();
  }, []);

  // 处理保存修复操作
  const handleSaveAction = async () => {
    if (!editingAction) return;

    setIsSaving(true);
    try {
      // 这里应该调用服务保存数据
      // await remediationService.updateRemediationAction(editingAction);
      
      const updatedActions = [...remediationActions];
      if (editingAction.isNew) {
        // 为新操作生成ID
        const newAction: AutoRemediationAction = {
          id: editingAction.id || `action_${Date.now()}`,
          name: editingAction.name || '',
          description: editingAction.description || '',
          type: editingAction.type || 'custom',
          parameters: editingAction.parameters || {},
          enabled: editingAction.enabled !== false,
          requiresApproval: editingAction.requiresApproval || false,
          executionTimeout: editingAction.executionTimeout || 300,
          retryCount: editingAction.retryCount || 0,
          retryDelay: editingAction.retryDelay || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updatedActions.push(newAction);
      } else {
        // 更新现有操作
        const index = updatedActions.findIndex(a => a.id === editingAction.id);
        if (index !== -1) {
          updatedActions[index] = { 
            ...updatedActions[index], 
            ...editingAction,
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      setRemediationActions(updatedActions);
      setEditingAction(null);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('保存修复操作失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理删除修复操作
  const handleDeleteAction = async () => {
    if (!itemToDelete) return;

    try {
      // 这里应该调用服务删除数据
      // await remediationService.deleteRemediationAction(itemToDelete);
      
      const updatedActions = remediationActions.filter(a => a.id !== itemToDelete);
      setRemediationActions(updatedActions);
      setItemToDelete(null);
      setShowConfirmDialog(false);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('删除修复操作失败:', error);
    }
  };

  // 打开编辑修复操作表单
  const handleEditAction = (action: AutoRemediationAction) => {
    setEditingAction({ ...action });
  };

  // 创建新修复操作
  const handleCreateAction = () => {
    setEditingAction({
      isNew: true,
      id: '',
      name: '',
      description: '',
      type: 'restart_service',
      parameters: {
        serviceName: '',
        restartDelay: 10,
        maxRetries: 2,
        timeout: 300
      },
      enabled: true,
      requiresApproval: false,
      executionTimeout: 300,
      retryCount: 2,
      retryDelay: 30
    });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingAction(null);
  };

  // 处理确认删除
  const handleConfirmDelete = (id: string) => {
    setItemToDelete(id);
    setShowConfirmDialog(true);
  };

  // 处理执行详情查看
  const handleViewExecutionDetails = (id: string) => {
    setSelectedExecutionId(id);
    setActiveTab('execution-details');
  };

  // 处理参数变更
  const handleParameterChange = (key: string, value: any) => {
    if (!editingAction) return;
    
    setEditingAction({
      ...editingAction,
      parameters: {
        ...editingAction.parameters,
        [key]: value
      }
    });
  };

  // 获取操作类型信息
  const getActionTypeInfo = (type: RemediationActionType) => {
    return actionTypes.find(a => a.value === type) || {
      value: type,
      label: type,
      description: type,
      icon: <Settings className="h-4 w-4" />
    };
  };

  // 获取执行状态信息
  const getExecutionStatusInfo = (status: string) => {
    return executionStatuses.find(s => s.value === status) || {
      value: status,
      label: status,
      color: 'bg-gray-100 text-gray-800'
    };
  };

  // 获取触发器类型信息
  const getTriggerTypeInfo = (trigger: string) => {
    return triggerTypes.find(t => t.value === trigger) || {
      value: trigger,
      label: trigger,
      icon: <Server className="h-3 w-3" />
    };
  };

  // 获取服务信息
  const getServiceInfo = (serviceId: string) => {
    return services.find(s => s.id === serviceId || s.name === serviceId) || null;
  };

  // 获取服务状态颜色
  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 渲染操作表格
  const renderActionsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>操作名称</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>描述</TableHead>
          <TableHead>需要审批</TableHead>
          <TableHead>超时设置</TableHead>
          <TableHead>重试设置</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {remediationActions.map((action) => {
          const typeInfo = getActionTypeInfo(action.type);
          
          return (
            <TableRow key={action.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  {typeInfo.icon}
                  <span className="ml-2">{action.name}</span>
                </div>
              </TableCell>
              <TableCell>{typeInfo.label}</TableCell>
              <TableCell className="max-w-xs truncate">{action.description}</TableCell>
              <TableCell>
                <Badge variant="outline" className={action.requiresApproval ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                  {action.requiresApproval ? '是' : '否'}
                </Badge>
              </TableCell>
              <TableCell>{action.executionTimeout}秒</TableCell>
              <TableCell>{action.retryCount > 0 ? `${action.retryCount}次，间隔${action.retryDelay}秒` : '不重试'}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={action.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {action.enabled ? '已启用' : '已禁用'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditAction(action)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleConfirmDelete(action.id)}>
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

  // 渲染执行历史表格
  const renderExecutionHistoryTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>操作名称</TableHead>
          <TableHead>触发类型</TableHead>
          <TableHead>触发详情</TableHead>
          <TableHead>开始时间</TableHead>
          <TableHead>执行时长</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>执行用户</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {executionHistory.map((execution) => {
          const statusInfo = getExecutionStatusInfo(execution.status);
          const triggerInfo = getTriggerTypeInfo(execution.trigger);
          
          // 计算执行时长
          let duration = '';
          if (execution.startTime && execution.endTime) {
            const start = new Date(execution.startTime);
            const end = new Date(execution.endTime);
            const diffSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
            const minutes = Math.floor(diffSeconds / 60);
            const seconds = diffSeconds % 60;
            duration = `${minutes}分${seconds}秒`;
          }
          
          return (
            <TableRow key={execution.id}>
              <TableCell>{execution.actionName}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {triggerInfo.icon}
                  <span className="ml-1">{triggerInfo.label}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">{execution.triggerDetails}</TableCell>
              <TableCell>{new Date(execution.startTime).toLocaleString('zh-CN')}</TableCell>
              <TableCell>{duration || '-'}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </TableCell>
              <TableCell>{execution.executedBy}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleViewExecutionDetails(execution.id)}>
                  查看详情
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  // 渲染执行详情
  const renderExecutionDetails = () => {
    const execution = executionHistory.find(e => e.id === selectedExecutionId);
    
    if (!execution) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">无执行记录</h3>
            <p className="text-gray-500 text-center max-w-md">
              请从执行历史列表中选择一个执行记录查看详情
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveTab('history')}>
              返回历史列表
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    const statusInfo = getExecutionStatusInfo(execution.status);
    const triggerInfo = getTriggerTypeInfo(execution.trigger);
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-medium">执行详情</CardTitle>
              <CardDescription>自动修复操作执行的详细信息</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('history')}>
              返回历史列表
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-3">基本信息</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">操作名称:</span>
                  <span className="text-sm font-medium">{execution.actionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">执行ID:</span>
                  <span className="text-sm font-mono">{execution.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">操作类型:</span>
                  <span className="text-sm font-medium">{execution.actionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">触发类型:</span>
                  <div className="flex items-center">
                    {triggerInfo.icon}
                    <span className="ml-1 text-sm font-medium">{triggerInfo.label}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-3">执行状态</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">执行状态:</span>
                  <Badge variant="secondary" className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">开始时间:</span>
                  <span className="text-sm">{new Date(execution.startTime).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">结束时间:</span>
                  <span className="text-sm">
                    {execution.endTime ? new Date(execution.endTime).toLocaleString('zh-CN') : '进行中'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">执行用户:</span>
                  <span className="text-sm">{execution.executedBy}</span>
                </div>
                {execution.approvedBy && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">审批用户:</span>
                    <span className="text-sm">{execution.approvedBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">触发详情</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm">{execution.triggerDetails}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">执行日志</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-60">
              <pre className="text-sm font-mono whitespace-pre-wrap">{execution.executionLog}</pre>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">执行结果</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm font-mono whitespace-pre-wrap">{JSON.stringify(execution.result, null, 2)}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 渲染服务监控状态
  const renderServiceMonitoring = () => {
    const filteredServices = selectedServiceType 
      ? services.filter(s => s.type === selectedServiceType)
      : services;
      
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-medium">服务监控状态</CardTitle>
              <CardDescription>显示所有可执行自动修复操作的服务</CardDescription>
            </div>
            <Select
              value={selectedServiceType || ''}
              onValueChange={(value) => setSelectedServiceType(value || null)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="筛选服务类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">所有类型</SelectItem>
                <SelectItem value="api">API服务</SelectItem>
                <SelectItem value="database">数据库服务</SelectItem>
                <SelectItem value="cache">缓存服务</SelectItem>
                <SelectItem value="message_queue">消息队列服务</SelectItem>
                <SelectItem value="storage">存储服务</SelectItem>
                <SelectItem value="compute">计算服务</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const serviceActions = remediationActions.filter(action => 
                action.enabled && action.type === 'restart_service'
              );
              
              return (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
                        <CardDescription>{service.environment} | {service.resourceGroup}</CardDescription>
                      </div>
                      <Badge variant="secondary" className={getServiceStatusColor(service.status)}>
                        {service.status === 'healthy' ? '正常' : service.status === 'degraded' ? '性能下降' : '异常'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">实例数:</span>
                      <span>{service.instances}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">服务类型:</span>
                      <span>{getServiceTypeLabel(service.type)}</span>
                    </div>
                    {service.status !== 'healthy' && (
                      <div className="pt-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          执行修复操作
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // 获取服务类型标签
  const getServiceTypeLabel = (type: ServiceType) => {
    const typeMap = {
      'api': 'API服务',
      'database': '数据库',
      'cache': '缓存',
      'message_queue': '消息队列',
      'storage': '存储',
      'compute': '计算'
    };
    return typeMap[type] || type;
  };

  // 渲染修复操作表单
  const renderActionForm = () => (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {editingAction?.isNew ? '创建新修复操作' : '编辑修复操作'}
        </CardTitle>
        <CardDescription>定义自动修复操作的参数和配置</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ID *</label>
            <Input
              value={editingAction?.id || ''}
              onChange={(e) => editingAction && setEditingAction({ ...editingAction, id: e.target.value })}
              placeholder="输入操作ID（小写英文）"
              disabled={!editingAction?.isNew}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">名称 *</label>
            <Input
              value={editingAction?.name || ''}
              onChange={(e) => editingAction && setEditingAction({ ...editingAction, name: e.target.value })}
              placeholder="输入操作名称"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">描述</label>
            <Textarea
              value={editingAction?.description || ''}
              onChange={(e) => editingAction && setEditingAction({ ...editingAction, description: e.target.value })}
              placeholder="输入操作描述"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">操作类型 *</label>
            <Select
              value={editingAction?.type || 'restart_service'}
              onValueChange={(value: RemediationActionType) => {
                if (!editingAction) return;
                
                // 根据操作类型设置默认参数
                let defaultParams: Record<string, any> = {};
                
                switch (value) {
                  case 'restart_service':
                    defaultParams = {
                      serviceName: '',
                      restartDelay: 10,
                      maxRetries: 2,
                      timeout: 300
                    };
                    break;
                  case 'scale_service':
                    defaultParams = {
                      serviceName: '',
                      minInstances: 2,
                      maxInstances: 10,
                      scaleUpBy: 2,
                      coolDownPeriod: 300
                    };
                    break;
                  case 'clear_cache':
                    defaultParams = {
                      serviceName: '',
                      cacheType: 'all',
                      batchSize: 1000
                    };
                    break;
                  case 'failover':
                    defaultParams = {
                      serviceName: '',
                      primaryGroup: '',
                      backupGroup: '',
                      healthCheckTimeout: 30
                    };
                    break;
                  case 'run_script':
                    defaultParams = {
                      scriptPath: '',
                      arguments: '',
                      user: 'system'
                    };
                    break;
                  default:
                    defaultParams = {};
                }
                
                setEditingAction({
                  ...editingAction,
                  type: value,
                  parameters: defaultParams
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择操作类型" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-start">
                      <div className="mr-2">{type.icon}</div>
                      <div>
                        <div>{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">需要审批</label>
            <Switch
              checked={editingAction?.requiresApproval || false}
              onCheckedChange={(checked) => editingAction && setEditingAction({ ...editingAction, requiresApproval: checked })}
            />
          </div>
        </div>
        
        {/* 操作参数 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <Settings className="h-4 w-4 mr-2 text-blue-500" />
            操作参数
          </h3>
          
          {editingAction?.type && (
            <div className="space-y-4">
              {/* 重启服务参数 */}
              {editingAction.type === 'restart_service' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">服务名称 *</label>
                    <Select
                      value={editingAction?.parameters?.serviceName || ''}
                      onValueChange={(value) => handleParameterChange('serviceName', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择服务" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.name}>
                            <div className="flex justify-between">
                              <span>{service.name}</span>
                              <Badge variant="outline" className={getServiceStatusColor(service.status)}>
                                {getServiceTypeLabel(service.type)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">重启延迟（秒）</label>
                      <Input
                        type="number"
                        value={editingAction?.parameters?.restartDelay || 10}
                        onChange={(e) => handleParameterChange('restartDelay', parseInt(e.target.value))}
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">最大重试次数</label>
                      <Input
                        type="number"
                        value={editingAction?.parameters?.maxRetries || 2}
                        onChange={(e) => handleParameterChange('maxRetries', parseInt(e.target.value))}
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">超时时间（秒）</label>
                      <Input
                        type="number"
                        value={editingAction?.parameters?.timeout || 300}
                        onChange={(e) => handleParameterChange('timeout', parseInt(e.target.value))}
                        min="10"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* 服务扩容参数 */}
              {editingAction.type === 'scale_service' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">服务名称 *</label>
                    <Select
                      value={editingAction?.parameters?.serviceName || ''}
                      onValueChange={(value) => handleParameterChange('serviceName', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择服务" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.name}>
                            <div className="flex justify-between">
                              <span>{service.name}</span>
                              <Badge variant="outline" className={getServiceStatusColor(service.status)}>
                                {getServiceTypeLabel(service.type)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">最小实例数</label>
                      <Input
                        type="number"
                        value={editingAction?.parameters?.minInstances || 2}
                        onChange={(e) => handleParameterChange('minInstances', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">最大实例数</label>
                      <Input
                        type="number"
                        value={editingAction?.parameters?.maxInstances || 10}
                        onChange={(e) => handleParameterChange('maxInstances', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">扩容数量</label>
                      <Input
                        type="number"
                        value={editingAction?.parameters?.scaleUpBy || 2}
                        onChange={(e) => handleParameterChange('scaleUpBy', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">冷却期（秒）</label>
                      <Input
                        type="number"
                        value={editingAction?.parameters?.coolDownPeriod || 300}
                        onChange={(e) => handleParameterChange('coolDownPeriod', parseInt(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* 清除缓存参数 */}
              {editingAction.type === 'clear_cache' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">服务名称 *</label>
                    <Select
                      value={editingAction?.parameters?.serviceName || ''}
                      onValueChange={(value) => handleParameterChange('serviceName', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择服务" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.filter(s => s.type === 'cache' || s.type === 'api').map((service) => (
                          <SelectItem key={service.id} value={service.name}>
                            <div className="flex justify-between">
                              <span>{service.name}</span>
                              <Badge variant="outline" className={getServiceStatusColor(service.status)}>
                                {getServiceTypeLabel(service.type)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">缓存类型</label>
                      <Select
                        value={editingAction?.parameters?.cacheType || 'all'}
                        onValueChange={(value) => handleParameterChange('cacheType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择缓存类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {cacheTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">批处理大小</label>
                      <Input
                        type="number"
                        value={editingAction?.parameters?.batchSize || 1000}
                        onChange={(e) => handleParameterChange('batchSize', parseInt(e.target.value))}
                        min="100"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* 故障转移参数 */}
              {editingAction.type === 'failover' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">服务名称 *</label>
                    <Select
                      value={editingAction?.parameters?.serviceName || ''}
                      onValueChange={(value) => handleParameterChange('serviceName', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择服务" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.name}>
                            <div className="flex justify-between">
                              <span>{service.name}</span>
                              <Badge variant="outline" className={getServiceStatusColor(service.status)}>
                                {getServiceTypeLabel(service.type)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">主服务组 *</label>
                      <Input
                        value={editingAction?.parameters?.primaryGroup || ''}
                        onChange={(e) => handleParameterChange('primaryGroup', e.target.value)}
                        placeholder="输入主服务组名称"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">备用服务组 *</label>
                      <Input
                        value={editingAction?.parameters?.backupGroup || ''}
                        onChange={(e) => handleParameterChange('backupGroup', e.target.value)}
                        placeholder="输入备用服务组名称"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">健康检查超时（秒）</label>
                      <Input
                        type="number"
                        value={editingAction?.parameters?.healthCheckTimeout || 30}
                        onChange={(e) => handleParameterChange('healthCheckTimeout', parseInt(e.target.value))}
                        min="5"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* 执行脚本参数 */}
              {editingAction.type === 'run_script' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">脚本路径 *</label>
                    <Input
                      value={editingAction?.parameters?.scriptPath || ''}
                      onChange={(e) => handleParameterChange('scriptPath', e.target.value)}
                      placeholder="输入脚本路径"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">脚本参数</label>
                    <Input
                      value={editingAction?.parameters?.arguments || ''}
                      onChange={(e) => handleParameterChange('arguments', e.target.value)}
                      placeholder="输入脚本参数"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">执行用户</label>
                    <Input
                      value={editingAction?.parameters?.user || 'system'}
                      onChange={(e) => handleParameterChange('user', e.target.value)}
                      placeholder="输入执行用户"
                    />
                  </div>
                </div>
              )}
              
              {/* 自定义操作参数 */}
              {editingAction.type === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">自定义参数（JSON格式）</label>
                  <Textarea
                    value={JSON.stringify(editingAction?.parameters || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const params = JSON.parse(e.target.value);
                        handleParameterChange('', params);
                      } catch (error) {
                        // 忽略JSON解析错误，在保存时验证
                      }
                    }}
                    placeholder="输入JSON格式的参数"
                    rows={5}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 执行配置 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <Cpu className="h-4 w-4 mr-2 text-blue-500" />
            执行配置
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">执行超时（秒）</label>
              <Input
                type="number"
                value={editingAction?.executionTimeout || 300}
                onChange={(e) => editingAction && setEditingAction({ ...editingAction, executionTimeout: parseInt(e.target.value) })}
                min="10"
              />
              <p className="text-xs text-gray-500">
                操作执行的最长时间，超过此时间将被终止
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">重试次数</label>
              <Input
                type="number"
                value={editingAction?.retryCount || 0}
                onChange={(e) => editingAction && setEditingAction({ ...editingAction, retryCount: parseInt(e.target.value) })}
                min="0"
                max="5"
              />
              <p className="text-xs text-gray-500">
                操作失败后重试的次数
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">重试间隔（秒）</label>
              <Input
                type="number"
                value={editingAction?.retryDelay || 0}
                onChange={(e) => editingAction && setEditingAction({ ...editingAction, retryDelay: parseInt(e.target.value) })}
                min="0"
              />
              <p className="text-xs text-gray-500">
                重试之间的等待时间
              </p>
            </div>
          </div>
        </div>
        
        {/* 状态配置 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">启用操作</label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingAction?.enabled !== false}
              onCheckedChange={(checked) => editingAction && setEditingAction({ ...editingAction, enabled: checked })}
            />
            <span className="text-sm text-gray-500">是否启用此修复操作</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="secondary" onClick={handleCancelEdit} disabled={isSaving}>
            取消
          </Button>
          <Button
            onClick={handleSaveAction}
            disabled={
              isSaving ||
              !editingAction?.id ||
              !editingAction?.name ||
              !editingAction?.type ||
              (editingAction.type !== 'custom' && !editingAction?.parameters?.serviceName)
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">自动故障恢复管理</h1>
            <p className="text-gray-500 dark:text-gray-400">定义和管理自动修复操作，在SLA违反时自动执行恢复措施</p>
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
        {editingAction && renderActionForm()}

        {/* 配置标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4">
            <TabsTrigger value="actions">修复操作</TabsTrigger>
            <TabsTrigger value="history">执行历史</TabsTrigger>
            <TabsTrigger value="execution-details">执行详情</TabsTrigger>
            <TabsTrigger value="services">服务状态</TabsTrigger>
          </TabsList>

          {/* 修复操作标签页 */}
          <TabsContent value="actions">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-medium">修复操作管理</CardTitle>
                    <CardDescription>定义和管理自动修复操作</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleCreateAction} disabled={!!editingAction}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加修复操作
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderActionsTable()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 执行历史标签页 */}
          <TabsContent value="history">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">执行历史</CardTitle>
                <CardDescription>自动修复操作的执行记录</CardDescription>
              </CardHeader>
              <CardContent>
                {renderExecutionHistoryTable()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 执行详情标签页 */}
          <TabsContent value="execution-details">
            {renderExecutionDetails()}
          </TabsContent>

          {/* 服务状态标签页 */}
          <TabsContent value="services">
            {renderServiceMonitoring()}
          </TabsContent>
        </Tabs>

        {/* 删除确认对话框 */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除此修复操作吗？此操作无法撤销，将不会删除相关的执行历史数据。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAction}>
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AutoRemediation;