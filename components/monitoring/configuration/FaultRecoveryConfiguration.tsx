/**
 * @file 故障恢复配置页面
 * @description 允许用户管理故障检测规则和自动恢复策略
 * @module monitoring
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Tabs, TabsContent, TabsList, TabsTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Badge, Separator, Tooltip, Alert, AlertDescription, AlertTitle } from '@/components/ui/';
import { Plus, Trash2, Edit, Save, X, Check, AlertTriangle, RefreshCw, Shield, Zap, Play, Pause, Code, Database, Server, Settings, BookOpen, Layers, Repeat } from 'lucide-react';
import { faultRecoveryService, RecoveryAction, RecoveryPolicy, FailureType, RecoveryOperation } from '@/lib/monitoring/monitoring';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/';
import { TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RecoveryPolicyFormData extends Partial<RecoveryPolicy> {
  isNew?: boolean;
}

interface RecoveryActionFormData extends Partial<RecoveryAction> {
  isNew?: boolean;
  executionOrder: number;
}

/**
 * 故障恢复配置页面
 */
const FaultRecoveryConfiguration: React.FC = () => {
  // 故障恢复策略列表状态
  const [recoveryPolicies, setRecoveryPolicies] = useState<RecoveryPolicy[]>([
    {
      id: 'policy_service_unavailable',
      name: '服务不可用恢复策略',
      description: '当检测到服务不可用时自动执行恢复操作',
      failureType: 'service_unavailable',
      detectionThreshold: 3,
      detectionWindow: 60, // 秒
      autoExecute: true,
      enabled: true,
      recoveryActions: [
        {
          id: 'action_restart_service',
          name: '重启服务',
          description: '重启目标服务进程',
          operation: 'restart_service',
          parameters: { serviceName: '{{serviceName}}' },
          timeout: 30,
          retryCount: 1,
          retryDelay: 10,
          executionOrder: 1,
        },
        {
          id: 'action_health_check',
          name: '健康检查',
          description: '重启后执行健康检查',
          operation: 'health_check',
          parameters: { endpoint: '{{healthEndpoint}}' },
          timeout: 60,
          retryCount: 0,
          retryDelay: 0,
          executionOrder: 2,
        },
      ],
      failureDetectionRule: {
        metric: 'service_health',
        condition: 'equals',
        value: 'unhealthy',
        duration: 30,
      },
      successCriteria: {
        metric: 'service_health',
        condition: 'equals',
        value: 'healthy',
        duration: 60,
      },
    },
    {
      id: 'policy_high_latency',
      name: '高延迟恢复策略',
      description: '当检测到服务响应延迟超过阈值时执行恢复操作',
      failureType: 'high_latency',
      detectionThreshold: 5,
      detectionWindow: 120, // 秒
      autoExecute: true,
      enabled: true,
      recoveryActions: [
        {
          id: 'action_clear_cache',
          name: '清除缓存',
          description: '清除应用缓存以减轻负载',
          operation: 'clear_cache',
          parameters: { cacheType: 'application' },
          timeout: 10,
          retryCount: 0,
          retryDelay: 0,
          executionOrder: 1,
        },
        {
          id: 'action_scale_up',
          name: '扩容实例',
          description: '增加服务实例数量',
          operation: 'scale_service',
          parameters: { serviceName: '{{serviceName}}', instances: '{{scaleInstances}}' },
          timeout: 300,
          retryCount: 0,
          retryDelay: 0,
          executionOrder: 2,
        },
      ],
      failureDetectionRule: {
        metric: 'api_response_time',
        condition: 'greater_than',
        value: 1000,
        duration: 60,
      },
      successCriteria: {
        metric: 'api_response_time',
        condition: 'less_than',
        value: 500,
        duration: 120,
      },
    },
    {
      id: 'policy_high_error_rate',
      name: '高错误率恢复策略',
      description: '当检测到API错误率超过阈值时执行恢复操作',
      failureType: 'high_error_rate',
      detectionThreshold: 10,
      detectionWindow: 60, // 秒
      autoExecute: true,
      enabled: true,
      recoveryActions: [
        {
          id: 'action_log_analysis',
          name: '日志分析',
          description: '收集错误日志进行分析',
          operation: 'collect_logs',
          parameters: { serviceName: '{{serviceName}}', logLevel: 'error', duration: 300 },
          timeout: 60,
          retryCount: 0,
          retryDelay: 0,
          executionOrder: 1,
        },
        {
          id: 'action_rollback_deployment',
          name: '回滚部署',
          description: '回滚到上一个稳定版本',
          operation: 'rollback_deployment',
          parameters: { serviceName: '{{serviceName}}', rollbackTo: 'previous' },
          timeout: 300,
          retryCount: 0,
          retryDelay: 0,
          executionOrder: 2,
        },
      ],
      failureDetectionRule: {
        metric: 'api_error_rate',
        condition: 'greater_than',
        value: 5,
        duration: 30,
      },
      successCriteria: {
        metric: 'api_error_rate',
        condition: 'less_than',
        value: 1,
        duration: 60,
      },
    },
    {
      id: 'policy_database_degradation',
      name: '数据库性能下降恢复策略',
      description: '当检测到数据库性能下降时执行恢复操作',
      failureType: 'database_degradation',
      detectionThreshold: 3,
      detectionWindow: 120, // 秒
      autoExecute: false, // 数据库操作需要手动确认
      enabled: true,
      recoveryActions: [
        {
          id: 'action_analyze_queries',
          name: '分析慢查询',
          description: '分析并优化慢查询',
          operation: 'analyze_queries',
          parameters: { database: '{{databaseName}}', threshold: 1000 },
          timeout: 300,
          retryCount: 0,
          retryDelay: 0,
          executionOrder: 1,
        },
        {
          id: 'action_clear_connection_pool',
          name: '清除连接池',
          description: '重置数据库连接池',
          operation: 'reset_connection_pool',
          parameters: { database: '{{databaseName}}' },
          timeout: 30,
          retryCount: 0,
          retryDelay: 0,
          executionOrder: 2,
        },
      ],
      failureDetectionRule: {
        metric: 'database_query_time',
        condition: 'greater_than',
        value: 500,
        duration: 60,
      },
      successCriteria: {
        metric: 'database_query_time',
        condition: 'less_than',
        value: 200,
        duration: 120,
      },
    },
  ]);

  // 故障类型列表
  const [failureTypes] = useState<FailureType[]>([
    { id: 'service_unavailable', name: '服务不可用', description: '服务无法访问或响应' },
    { id: 'high_latency', name: '高延迟', description: '服务响应时间超过阈值' },
    { id: 'high_error_rate', name: '高错误率', description: 'API错误率超过阈值' },
    { id: 'database_degradation', name: '数据库性能下降', description: '数据库响应缓慢' },
    { id: 'memory_usage_high', name: '内存使用率过高', description: '内存使用率超过阈值' },
    { id: 'cpu_usage_high', name: 'CPU使用率过高', description: 'CPU使用率超过阈值' },
    { id: 'disk_space_low', name: '磁盘空间不足', description: '磁盘空间低于阈值' },
    { id: 'connection_pool_exhausted', name: '连接池耗尽', description: '数据库连接池已耗尽' },
    { id: 'cache_miss_rate_high', name: '缓存命中率低', description: '缓存命中率低于阈值' },
    { id: 'queue_backpressure', name: '队列积压', description: '消息队列积压严重' },
  ]);

  // 可用的恢复操作
  const [recoveryOperations] = useState<RecoveryOperation[]>([
    { id: 'restart_service', name: '重启服务', description: '重启指定的服务' },
    { id: 'health_check', name: '健康检查', description: '执行服务健康检查' },
    { id: 'clear_cache', name: '清除缓存', description: '清除应用或系统缓存' },
    { id: 'scale_service', name: '服务扩容', description: '增加服务实例数量' },
    { id: 'scale_down_service', name: '服务缩容', description: '减少服务实例数量' },
    { id: 'collect_logs', name: '收集日志', description: '收集指定服务的日志' },
    { id: 'rollback_deployment', name: '回滚部署', description: '回滚到上一个稳定版本' },
    { id: 'analyze_queries', name: '分析慢查询', description: '分析数据库慢查询' },
    { id: 'reset_connection_pool', name: '重置连接池', description: '重置数据库连接池' },
    { id: 'optimize_database', name: '数据库优化', description: '执行数据库优化操作' },
    { id: 'cleanup_resources', name: '清理资源', description: '清理临时文件和资源' },
    { id: 'execute_custom_script', name: '执行自定义脚本', description: '执行指定的自定义脚本' },
  ]);

  // 可用的监控指标
  const [availableMetrics] = useState([
    { value: 'service_health', label: '服务健康状态' },
    { value: 'api_response_time', label: 'API响应时间' },
    { value: 'api_error_rate', label: 'API错误率' },
    { value: 'database_query_time', label: '数据库查询时间' },
    { value: 'memory_usage', label: '内存使用率' },
    { value: 'cpu_usage', label: 'CPU使用率' },
    { value: 'disk_space', label: '磁盘空间' },
    { value: 'connection_pool_usage', label: '连接池使用率' },
    { value: 'cache_hit_rate', label: '缓存命中率' },
    { value: 'queue_depth', label: '队列深度' },
  ]);

  // 可用的条件操作符
  const [conditionOperators] = useState([
    { value: 'equals', label: '等于' },
    { value: 'not_equals', label: '不等于' },
    { value: 'greater_than', label: '大于' },
    { value: 'less_than', label: '小于' },
    { value: 'greater_than_or_equal', label: '大于等于' },
    { value: 'less_than_or_equal', label: '小于等于' },
  ]);

  // 表单状态
  const [editingPolicy, setEditingPolicy] = useState<RecoveryPolicyFormData | null>(null);
  const [editingAction, setEditingAction] = useState<RecoveryActionFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('policies');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  // 加载故障恢复配置
  useEffect(() => {
    const loadFaultRecoveryConfig = async () => {
      try {
        // 这里应该从服务获取实际数据
        // const policies = await faultRecoveryService.getRecoveryPolicies();
        // setRecoveryPolicies(policies);
      } catch (error) {
        console.error('加载故障恢复配置失败:', error);
      }
    };

    loadFaultRecoveryConfig();
  }, []);

  // 处理保存策略
  const handleSavePolicy = async () => {
    if (!editingPolicy) return;

    setIsSaving(true);
    try {
      // 这里应该调用服务保存数据
      // await faultRecoveryService.updateRecoveryPolicy(editingPolicy);
      
      const updatedPolicies = [...recoveryPolicies];
      if (editingPolicy.isNew) {
        // 为新策略生成ID
        const newPolicy: RecoveryPolicy = {
          id: editingPolicy.id || `policy_${Date.now()}`,
          name: editingPolicy.name || '',
          description: editingPolicy.description || '',
          failureType: editingPolicy.failureType || 'service_unavailable',
          detectionThreshold: editingPolicy.detectionThreshold || 3,
          detectionWindow: editingPolicy.detectionWindow || 60,
          autoExecute: editingPolicy.autoExecute !== false,
          enabled: editingPolicy.enabled !== false,
          recoveryActions: editingPolicy.recoveryActions || [],
          failureDetectionRule: editingPolicy.failureDetectionRule || {
            metric: 'service_health',
            condition: 'equals',
            value: 'unhealthy',
            duration: 30,
          },
          successCriteria: editingPolicy.successCriteria || {
            metric: 'service_health',
            condition: 'equals',
            value: 'healthy',
            duration: 60,
          },
        };
        updatedPolicies.push(newPolicy);
      } else {
        // 更新现有策略
        const index = updatedPolicies.findIndex(p => p.id === editingPolicy.id);
        if (index !== -1) {
          updatedPolicies[index] = { ...updatedPolicies[index], ...editingPolicy };
        }
      }
      
      setRecoveryPolicies(updatedPolicies);
      setEditingPolicy(null);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('保存恢复策略失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理保存操作
  const handleSaveAction = async () => {
    if (!editingPolicy || !editingAction) return;

    setIsSaving(true);
    try {
      // 更新策略中的操作列表
      const updatedActions = [...(editingPolicy.recoveryActions || [])];
      
      if (editingAction.isNew) {
        // 为新操作生成ID
        const newAction: RecoveryAction = {
          id: editingAction.id || `action_${Date.now()}`,
          name: editingAction.name || '',
          description: editingAction.description || '',
          operation: editingAction.operation || 'restart_service',
          parameters: editingAction.parameters || {},
          timeout: editingAction.timeout || 30,
          retryCount: editingAction.retryCount || 0,
          retryDelay: editingAction.retryDelay || 0,
          executionOrder: editingAction.executionOrder,
        };
        updatedActions.push(newAction);
      } else {
        // 更新现有操作
        const index = updatedActions.findIndex(a => a.id === editingAction.id);
        if (index !== -1) {
          updatedActions[index] = { ...updatedActions[index], ...editingAction };
        }
      }
      
      // 按执行顺序排序
      updatedActions.sort((a, b) => a.executionOrder - b.executionOrder);
      
      // 更新策略
      const updatedPolicy = { ...editingPolicy, recoveryActions: updatedActions };
      setEditingPolicy(updatedPolicy);
      setEditingAction(null);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('保存恢复操作失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理删除策略
  const handleDeletePolicy = async () => {
    if (!itemToDelete) return;

    try {
      // 这里应该调用服务删除数据
      // await faultRecoveryService.deleteRecoveryPolicy(itemToDelete);
      
      const updatedPolicies = recoveryPolicies.filter(p => p.id !== itemToDelete);
      setRecoveryPolicies(updatedPolicies);
      setItemToDelete(null);
      setShowConfirmDialog(false);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('删除恢复策略失败:', error);
    }
  };

  // 处理删除操作
  const handleDeleteAction = async () => {
    if (!itemToDelete || !editingPolicy) return;

    try {
      // 更新策略中的操作列表
      const updatedActions = (editingPolicy.recoveryActions || []).filter(a => a.id !== itemToDelete);
      
      // 重新编号执行顺序
      updatedActions.forEach((action, index) => {
        action.executionOrder = index + 1;
      });
      
      // 更新策略
      const updatedPolicy = { ...editingPolicy, recoveryActions: updatedActions };
      setEditingPolicy(updatedPolicy);
      setItemToDelete(null);
      setShowConfirmDialog(false);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('删除恢复操作失败:', error);
    }
  };

  // 打开编辑策略表单
  const handleEditPolicy = (policy: RecoveryPolicy) => {
    setEditingPolicy({ ...policy });
    setSelectedPolicyId(policy.id);
  };

  // 打开编辑操作表单
  const handleEditAction = (action: RecoveryAction) => {
    setEditingAction({ ...action });
  };

  // 创建新策略
  const handleCreatePolicy = () => {
    setEditingPolicy({
      isNew: true,
      id: '',
      name: '',
      description: '',
      failureType: 'service_unavailable',
      detectionThreshold: 3,
      detectionWindow: 60,
      autoExecute: true,
      enabled: true,
      recoveryActions: [],
      failureDetectionRule: {
        metric: 'service_health',
        condition: 'equals',
        value: 'unhealthy',
        duration: 30,
      },
      successCriteria: {
        metric: 'service_health',
        condition: 'equals',
        value: 'healthy',
        duration: 60,
      },
    });
    setSelectedPolicyId(null);
  };

  // 创建新操作
  const handleCreateAction = () => {
    if (!editingPolicy) return;
    
    // 计算新操作的执行顺序
    const maxOrder = editingPolicy.recoveryActions?.reduce(
      (max, action) => Math.max(max, action.executionOrder),
      0
    ) || 0;
    
    setEditingAction({
      isNew: true,
      id: '',
      name: '',
      description: '',
      operation: 'restart_service',
      parameters: {},
      timeout: 30,
      retryCount: 0,
      retryDelay: 0,
      executionOrder: maxOrder + 1,
    });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingPolicy(null);
    setEditingAction(null);
    setSelectedPolicyId(null);
  };

  // 处理确认删除
  const handleConfirmDelete = (id: string) => {
    setItemToDelete(id);
    setShowConfirmDialog(true);
  };

  // 获取故障类型信息
  const getFailureTypeInfo = (failureTypeId: string) => {
    return failureTypes.find(ft => ft.id === failureTypeId) || {
      id: failureTypeId,
      name: failureTypeId,
      description: '未知故障类型',
    };
  };

  // 获取恢复操作信息
  const getOperationInfo = (operationId: string) => {
    return recoveryOperations.find(ro => ro.id === operationId) || {
      id: operationId,
      name: operationId,
      description: '未知操作',
    };
  };

  // 获取指标标签
  const getMetricLabel = (metricId: string) => {
    return availableMetrics.find(m => m.value === metricId)?.label || metricId;
  };

  // 获取条件标签
  const getConditionLabel = (conditionId: string) => {
    return conditionOperators.find(c => c.value === conditionId)?.label || conditionId;
  };

  // 格式化时间（秒转为可读格式）
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分`;
    return `${Math.floor(seconds / 3600)}小时`;
  };

  // 渲染策略表格
  const renderPoliciesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>策略名称</TableHead>
          <TableHead>故障类型</TableHead>
          <TableHead>检测规则</TableHead>
          <TableHead>自动执行</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recoveryPolicies.map((policy) => {
          const failureTypeInfo = getFailureTypeInfo(policy.failureType);
          
          return (
            <TableRow key={policy.id}>
              <TableCell className="font-medium">{policy.name}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <TooltipTrigger>
                    <Badge variant="secondary">{failureTypeInfo.name}</Badge>
                    <TooltipContent>
                      <p>{failureTypeInfo.description}</p>
                    </TooltipContent>
                  </TooltipTrigger>
                </TooltipProvider>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                <TooltipProvider>
                  <TooltipTrigger>
                    <span className="text-sm">
                      {getMetricLabel(policy.failureDetectionRule.metric)} {getConditionLabel(policy.failureDetectionRule.condition)} {policy.failureDetectionRule.value} (持续{policy.failureDetectionRule.duration}秒)
                    </span>
                    <TooltipContent>
                      <p>{policy.description}</p>
                    </TooltipContent>
                  </TooltipTrigger>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <Switch checked={policy.autoExecute} onCheckedChange={() => {}} disabled />
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={policy.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {policy.enabled ? '已启用' : '已禁用'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditPolicy(policy)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleConfirmDelete(policy.id)}>
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

  // 渲染策略详情表单
  const renderPolicyForm = () => (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {editingPolicy?.isNew ? '创建新恢复策略' : '编辑恢复策略'}
        </CardTitle>
        <CardDescription>配置故障检测规则和恢复操作</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ID *</label>
            <Input
              value={editingPolicy?.id || ''}
              onChange={(e) => editingPolicy && setEditingPolicy({ ...editingPolicy, id: e.target.value })}
              placeholder="输入策略ID（小写英文）"
              disabled={!editingPolicy?.isNew}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">名称 *</label>
            <Input
              value={editingPolicy?.name || ''}
              onChange={(e) => editingPolicy && setEditingPolicy({ ...editingPolicy, name: e.target.value })}
              placeholder="输入策略名称"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">描述</label>
            <Input
              value={editingPolicy?.description || ''}
              onChange={(e) => editingPolicy && setEditingPolicy({ ...editingPolicy, description: e.target.value })}
              placeholder="输入策略描述"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">故障类型 *</label>
            <Select
              value={editingPolicy?.failureType || 'service_unavailable'}
              onValueChange={(value) => editingPolicy && setEditingPolicy({ ...editingPolicy, failureType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择故障类型" />
              </SelectTrigger>
              <SelectContent>
                {failureTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">检测阈值</label>
            <Input
              type="number"
              value={editingPolicy?.detectionThreshold || 3}
              onChange={(e) => editingPolicy && setEditingPolicy({ ...editingPolicy, detectionThreshold: parseInt(e.target.value) })}
              placeholder="输入检测阈值"
            />
            <p className="text-xs text-gray-500">在检测窗口内触发的次数达到此值时执行恢复操作</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">检测窗口（秒）</label>
            <Input
              type="number"
              value={editingPolicy?.detectionWindow || 60}
              onChange={(e) => editingPolicy && setEditingPolicy({ ...editingPolicy, detectionWindow: parseInt(e.target.value) })}
              placeholder="输入检测窗口（秒）"
            />
            <p className="text-xs text-gray-500">故障检测的时间窗口大小</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">自动执行</label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingPolicy?.autoExecute !== false}
                onCheckedChange={(checked) => editingPolicy && setEditingPolicy({ ...editingPolicy, autoExecute: checked })}
              />
              <span className="text-sm text-gray-500">是否自动执行恢复操作</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">启用策略</label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingPolicy?.enabled !== false}
                onCheckedChange={(checked) => editingPolicy && setEditingPolicy({ ...editingPolicy, enabled: checked })}
              />
              <span className="text-sm text-gray-500">是否启用此恢复策略</span>
            </div>
          </div>
        </div>

        {/* 故障检测规则配置 */}
        <div className="space-y-4 mt-6">
          <h3 className="text-sm font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
            故障检测规则
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">监控指标 *</label>
              <Select
                value={editingPolicy?.failureDetectionRule?.metric || 'service_health'}
                onValueChange={(value) => {
                  if (!editingPolicy || !editingPolicy.failureDetectionRule) return;
                  setEditingPolicy({
                    ...editingPolicy,
                    failureDetectionRule: {
                      ...editingPolicy.failureDetectionRule,
                      metric: value,
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择监控指标" />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics.map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">条件 *</label>
              <Select
                value={editingPolicy?.failureDetectionRule?.condition || 'equals'}
                onValueChange={(value) => {
                  if (!editingPolicy || !editingPolicy.failureDetectionRule) return;
                  setEditingPolicy({
                    ...editingPolicy,
                    failureDetectionRule: {
                      ...editingPolicy.failureDetectionRule,
                      condition: value,
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择条件" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOperators.map((operator) => (
                    <SelectItem key={operator.value} value={operator.value}>
                      {operator.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">阈值 *</label>
              <Input
                type="text"
                value={editingPolicy?.failureDetectionRule?.value || ''}
                onChange={(e) => {
                  if (!editingPolicy || !editingPolicy.failureDetectionRule) return;
                  setEditingPolicy({
                    ...editingPolicy,
                    failureDetectionRule: {
                      ...editingPolicy.failureDetectionRule,
                      value: e.target.value,
                    },
                  });
                }}
                placeholder="输入阈值"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">持续时间（秒） *</label>
              <Input
                type="number"
                value={editingPolicy?.failureDetectionRule?.duration || 30}
                onChange={(e) => {
                  if (!editingPolicy || !editingPolicy.failureDetectionRule) return;
                  setEditingPolicy({
                    ...editingPolicy,
                    failureDetectionRule: {
                      ...editingPolicy.failureDetectionRule,
                      duration: parseInt(e.target.value),
                    },
                  });
                }}
                placeholder="输入持续时间"
              />
            </div>
          </div>
        </div>

        {/* 成功条件配置 */}
        <div className="space-y-4 mt-6">
          <h3 className="text-sm font-medium flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            恢复成功条件
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">监控指标 *</label>
              <Select
                value={editingPolicy?.successCriteria?.metric || 'service_health'}
                onValueChange={(value) => {
                  if (!editingPolicy || !editingPolicy.successCriteria) return;
                  setEditingPolicy({
                    ...editingPolicy,
                    successCriteria: {
                      ...editingPolicy.successCriteria,
                      metric: value,
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择监控指标" />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics.map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">条件 *</label>
              <Select
                value={editingPolicy?.successCriteria?.condition || 'equals'}
                onValueChange={(value) => {
                  if (!editingPolicy || !editingPolicy.successCriteria) return;
                  setEditingPolicy({
                    ...editingPolicy,
                    successCriteria: {
                      ...editingPolicy.successCriteria,
                      condition: value,
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择条件" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOperators.map((operator) => (
                    <SelectItem key={operator.value} value={operator.value}>
                      {operator.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">阈值 *</label>
              <Input
                type="text"
                value={editingPolicy?.successCriteria?.value || ''}
                onChange={(e) => {
                  if (!editingPolicy || !editingPolicy.successCriteria) return;
                  setEditingPolicy({
                    ...editingPolicy,
                    successCriteria: {
                      ...editingPolicy.successCriteria,
                      value: e.target.value,
                    },
                  });
                }}
                placeholder="输入阈值"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">持续时间（秒） *</label>
              <Input
                type="number"
                value={editingPolicy?.successCriteria?.duration || 60}
                onChange={(e) => {
                  if (!editingPolicy || !editingPolicy.successCriteria) return;
                  setEditingPolicy({
                    ...editingPolicy,
                    successCriteria: {
                      ...editingPolicy.successCriteria,
                      duration: parseInt(e.target.value),
                    },
                  });
                }}
                placeholder="输入持续时间"
              />
            </div>
          </div>
        </div>

        {/* 恢复操作列表 */}
        <div className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-blue-500" />
              恢复操作列表
            </h3>
            <Button size="sm" onClick={handleCreateAction} disabled={isSaving || !!editingAction}>
              <Plus className="h-4 w-4 mr-2" />
              添加操作
            </Button>
          </div>
          
          {editingPolicy?.recoveryActions && editingPolicy.recoveryActions.length > 0 ? (
            <div className="space-y-3">
              {editingPolicy.recoveryActions.map((action) => {
                const operationInfo = getOperationInfo(action.operation);
                
                return (
                  <div key={action.id} className="p-4 border rounded-md bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">#{action.executionOrder}</Badge>
                          <span className="font-medium">{action.name}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{operationInfo.name}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditAction(action)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleConfirmDelete(action.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>暂无恢复操作，请添加操作</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="secondary" onClick={handleCancelEdit} disabled={isSaving}>
            取消
          </Button>
          <Button
            onClick={handleSavePolicy}
            disabled={
              isSaving ||
              !editingPolicy?.id ||
              !editingPolicy?.name ||
              !editingPolicy?.failureType ||
              !editingPolicy?.failureDetectionRule ||
              !editingPolicy?.successCriteria
            }
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // 渲染操作编辑表单
  const renderActionForm = () => (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {editingAction?.isNew ? '创建新恢复操作' : '编辑恢复操作'}
        </CardTitle>
        <CardDescription>配置恢复操作的详细参数</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <label className="text-sm font-medium">执行顺序</label>
            <Input
              type="number"
              value={editingAction?.executionOrder || 1}
              onChange={(e) => editingAction && setEditingAction({ ...editingAction, executionOrder: parseInt(e.target.value) })}
              placeholder="输入执行顺序"
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium">操作类型 *</label>
            <Select
              value={editingAction?.operation || 'restart_service'}
              onValueChange={(value) => editingAction && setEditingAction({ ...editingAction, operation: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择操作类型" />
              </SelectTrigger>
              <SelectContent>
                {recoveryOperations.map((operation) => (
                  <SelectItem key={operation.id} value={operation.id}>
                    <div className="font-medium">{operation.name}</div>
                    <div className="text-xs text-gray-500">{operation.description}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">描述</label>
            <Input
              value={editingAction?.description || ''}
              onChange={(e) => editingAction && setEditingAction({ ...editingAction, description: e.target.value })}
              placeholder="输入操作描述"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">超时时间（秒）</label>
            <Input
              type="number"
              value={editingAction?.timeout || 30}
              onChange={(e) => editingAction && setEditingAction({ ...editingAction, timeout: parseInt(e.target.value) })}
              placeholder="输入超时时间"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">重试次数</label>
            <Input
              type="number"
              value={editingAction?.retryCount || 0}
              onChange={(e) => editingAction && setEditingAction({ ...editingAction, retryCount: parseInt(e.target.value) })}
              placeholder="输入重试次数"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">重试延迟（秒）</label>
            <Input
              type="number"
              value={editingAction?.retryDelay || 0}
              onChange={(e) => editingAction && setEditingAction({ ...editingAction, retryDelay: parseInt(e.target.value) })}
              placeholder="输入重试延迟"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">参数（JSON格式）</label>
            <Input
              value={JSON.stringify(editingAction?.parameters || {}, null, 2)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  editingAction && setEditingAction({ ...editingAction, parameters: params });
                } catch (error) {
                  // JSON格式错误，不更新
                }
              }}
              placeholder="输入JSON参数"
              className="min-h-[100px] font-mono text-xs"
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <p className="text-xs text-gray-500">使用 {{serviceName}} 等占位符可以动态替换参数</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="secondary" onClick={() => setEditingAction(null)} disabled={isSaving}>
            取消
          </Button>
          <Button
            onClick={handleSaveAction}
            disabled={
              isSaving ||
              !editingAction?.id ||
              !editingAction?.name ||
              !editingAction?.operation
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">故障恢复配置</h1>
            <p className="text-gray-500 dark:text-gray-400">管理故障检测规则和自动恢复策略</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="secondary" size="sm" className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新配置
            </Button>
            <Button variant="secondary" size="sm" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              查看日志
            </Button>
          </div>
        </div>

        {/* 保存成功提示 */}
        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4" />
            <AlertTitle>保存成功</AlertTitle>
            <AlertDescription>
              配置已成功保存到系统中
            </AlertDescription>
          </Alert>
        )}

        {/* 编辑表单 */}
        {editingPolicy && renderPolicyForm()}
        {editingAction && renderActionForm()}

        {/* 配置标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-1 mb-4">
            <TabsTrigger value="policies">恢复策略</TabsTrigger>
          </TabsList>

          {/* 恢复策略标签页 */}
          <TabsContent value="policies">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-medium">故障恢复策略管理</CardTitle>
                    <CardDescription>定义和管理故障自动恢复策略</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleCreatePolicy} disabled={!!editingPolicy}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加策略
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderPoliciesTable()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 删除确认对话框 */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除此配置项吗？此操作无法撤销，可能会影响现有的故障恢复机制。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={!!editingPolicy && !!editingAction ? handleDeleteAction : handleDeletePolicy}>
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default FaultRecoveryConfiguration;