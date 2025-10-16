/**
 * @file 监控告警配置页面
 * @description 允许用户配置告警规则和通知渠道
 * @module monitoring
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Tabs, TabsContent, TabsList, TabsTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Badge, Separator, Checkbox } from '@/components/ui/';
import { Plus, Trash2, Edit, Save, X, Check, Bell, Mail, Send, Slack, Phone, Users, Settings, AlertCircle, Shield, Info, Zap, Clock, Filter, ChevronRight, HelpCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/';
import { TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// 告警级别定义
type AlertSeverity = 'critical' | 'warning' | 'info' | 'debug';

// 通知渠道定义
type NotificationChannel = 'email' | 'slack' | 'phone' | 'webhook' | 'sms' | 'in_app';

// 告警规则接口
interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: string;
  threshold: number | string;
  duration: number; // 秒
  severity: AlertSeverity;
  enabled: boolean;
  notifyChannels: NotificationChannel[];
  notifyUsers: string[];
  tags: string[];
  silenceSchedule?: {
    start: string;
    end: string;
    recurring?: boolean;
    recurrence?: string; // cron表达式
  };
  cooldownPeriod: number; // 秒
  createdBy: string;
  updatedAt: string;
}

// 通知渠道配置接口
interface ChannelConfiguration {
  id: string;
  name: string;
  type: NotificationChannel;
  configuration: Record<string, any>;
  enabled: boolean;
  description?: string;
}

// 告警规则表单数据
interface AlertRuleFormData extends Partial<AlertRule> {
  isNew?: boolean;
}

// 通知渠道表单数据
interface ChannelFormData extends Partial<ChannelConfiguration> {
  isNew?: boolean;
}

/**
 * 监控告警配置页面
 */
const AlertConfiguration: React.FC = () => {
  // 告警规则列表状态
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'rule_high_cpu',
      name: 'CPU使用率过高告警',
      description: '当CPU使用率持续超过80%时触发告警',
      metric: 'cpu_usage',
      condition: 'greater_than',
      threshold: 80,
      duration: 300, // 5分钟
      severity: 'warning',
      enabled: true,
      notifyChannels: ['email', 'slack'],
      notifyUsers: ['admin@example.com', 'team@example.com'],
      tags: ['cpu', 'performance'],
      cooldownPeriod: 1800, // 30分钟
      createdBy: 'system',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rule_memory_exhaustion',
      name: '内存即将耗尽告警',
      description: '当内存使用率持续超过90%时触发严重告警',
      metric: 'memory_usage',
      condition: 'greater_than',
      threshold: 90,
      duration: 180, // 3分钟
      severity: 'critical',
      enabled: true,
      notifyChannels: ['email', 'slack', 'sms'],
      notifyUsers: ['admin@example.com', 'emergency@example.com'],
      tags: ['memory', 'critical'],
      cooldownPeriod: 300, // 5分钟
      createdBy: 'admin',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rule_api_error_rate',
      name: 'API错误率过高告警',
      description: '当API错误率持续超过5%时触发告警',
      metric: 'api_error_rate',
      condition: 'greater_than',
      threshold: 5,
      duration: 120, // 2分钟
      severity: 'warning',
      enabled: true,
      notifyChannels: ['email', 'slack'],
      notifyUsers: ['dev-team@example.com', 'ops@example.com'],
      tags: ['api', 'error'],
      cooldownPeriod: 600, // 10分钟
      createdBy: 'dev-lead',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rule_disk_space',
      name: '磁盘空间不足告警',
      description: '当磁盘空间低于15%时触发告警',
      metric: 'disk_space_available',
      condition: 'less_than',
      threshold: 15,
      duration: 600, // 10分钟
      severity: 'warning',
      enabled: true,
      notifyChannels: ['email', 'slack'],
      notifyUsers: ['ops@example.com'],
      tags: ['disk', 'storage'],
      cooldownPeriod: 1800, // 30分钟
      createdBy: 'ops-manager',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rule_response_time',
      name: 'API响应时间过长告警',
      description: '当API平均响应时间超过1000ms时触发告警',
      metric: 'api_response_time',
      condition: 'greater_than',
      threshold: 1000,
      duration: 60, // 1分钟
      severity: 'info',
      enabled: false, // 暂时禁用
      notifyChannels: ['email'],
      notifyUsers: ['performance@example.com'],
      tags: ['api', 'performance'],
      cooldownPeriod: 300, // 5分钟
      createdBy: 'performance-team',
      updatedAt: new Date().toISOString(),
    },
  ]);

  // 通知渠道配置列表
  const [notificationChannels, setNotificationChannels] = useState<ChannelConfiguration[]>([
    {
      id: 'channel_email',
      name: '邮件通知',
      type: 'email',
      enabled: true,
      description: '通过电子邮件发送告警通知',
      configuration: {
        smtpServer: 'smtp.example.com',
        port: 587,
        username: 'alert@example.com',
        useTls: true,
        fromAddress: 'alerts@example.com',
      },
    },
    {
      id: 'channel_slack',
      name: 'Slack通知',
      type: 'slack',
      enabled: true,
      description: '通过Slack发送告警通知到指定频道',
      configuration: {
        webhookUrl: process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/PLACEHOLDER',
        channel: '#alerts',
        username: 'Monitoring Bot',
        iconEmoji: ':alert:',
      },
    },
    {
      id: 'channel_sms',
      name: '短信通知',
      type: 'sms',
      enabled: false,
      description: '通过短信发送告警通知（仅用于严重告警）',
      configuration: {
        provider: 'twilio',
        accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        authToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        fromNumber: '+1234567890',
      },
    },
    {
      id: 'channel_webhook',
      name: 'Webhook通知',
      type: 'webhook',
      enabled: true,
      description: '发送告警通知到自定义Webhook端点',
      configuration: {
        url: 'https://api.example.com/webhooks/alerts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer XXXXXXX',
        },
        timeout: 5000,
      },
    },
  ]);

  // 可用的监控指标
  const [availableMetrics] = useState([
    { value: 'cpu_usage', label: 'CPU使用率 (%)' },
    { value: 'memory_usage', label: '内存使用率 (%)' },
    { value: 'disk_space_available', label: '可用磁盘空间 (%)' },
    { value: 'api_response_time', label: 'API响应时间 (ms)' },
    { value: 'api_error_rate', label: 'API错误率 (%)' },
    { value: 'service_health', label: '服务健康状态' },
    { value: 'database_query_time', label: '数据库查询时间 (ms)' },
    { value: 'connection_pool_usage', label: '连接池使用率 (%)' },
    { value: 'cache_hit_rate', label: '缓存命中率 (%)' },
    { value: 'queue_depth', label: '队列深度' },
    { value: 'network_traffic_in', label: '入站网络流量 (MB/s)' },
    { value: 'network_traffic_out', label: '出站网络流量 (MB/s)' },
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

  // 告警级别信息
  const [severityLevels] = useState<{ value: AlertSeverity; label: string; color: string }[]>([
    { value: 'critical', label: '严重', color: 'bg-red-500' },
    { value: 'warning', label: '警告', color: 'bg-yellow-500' },
    { value: 'info', label: '信息', color: 'bg-blue-500' },
    { value: 'debug', label: '调试', color: 'bg-gray-500' },
  ]);

  // 通知渠道信息
  const [channelTypes] = useState<{ value: NotificationChannel; label: string; icon: React.ReactNode }[]>([
    { value: 'email', label: '邮件', icon: <Mail className="h-4 w-4" /> },
    { value: 'slack', label: 'Slack', icon: <Slack className="h-4 w-4" /> },
    { value: 'sms', label: '短信', icon: <Phone className="h-4 w-4" /> },
    { value: 'phone', label: '电话', icon: <Phone className="h-4 w-4" /> },
    { value: 'webhook', label: 'Webhook', icon: <Send className="h-4 w-4" /> },
    { value: 'in_app', label: '应用内', icon: <Bell className="h-4 w-4" /> },
  ]);

  // 表单状态
  const [editingRule, setEditingRule] = useState<AlertRuleFormData | null>(null);
  const [editingChannel, setEditingChannel] = useState<ChannelFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('rules');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'rule' | 'channel'>('rule');

  // 加载告警配置
  useEffect(() => {
    const loadAlertConfig = async () => {
      try {
        // 这里应该从服务获取实际数据
        // const rules = await alertService.getAlertRules();
        // setAlertRules(rules);
        // 
        // const channels = await alertService.getNotificationChannels();
        // setNotificationChannels(channels);
      } catch (error) {
        console.error('加载告警配置失败:', error);
      }
    };

    loadAlertConfig();
  }, []);

  // 处理保存告警规则
  const handleSaveRule = async () => {
    if (!editingRule) return;

    setIsSaving(true);
    try {
      // 这里应该调用服务保存数据
      // await alertService.updateAlertRule(editingRule);
      
      const updatedRules = [...alertRules];
      if (editingRule.isNew) {
        // 为新规则生成ID
        const newRule: AlertRule = {
          id: editingRule.id || `rule_${Date.now()}`,
          name: editingRule.name || '',
          description: editingRule.description || '',
          metric: editingRule.metric || 'cpu_usage',
          condition: editingRule.condition || 'greater_than',
          threshold: editingRule.threshold || 0,
          duration: editingRule.duration || 60,
          severity: editingRule.severity || 'warning',
          enabled: editingRule.enabled !== false,
          notifyChannels: editingRule.notifyChannels || [],
          notifyUsers: editingRule.notifyUsers || [],
          tags: editingRule.tags || [],
          silenceSchedule: editingRule.silenceSchedule,
          cooldownPeriod: editingRule.cooldownPeriod || 300,
          createdBy: 'current-user',
          updatedAt: new Date().toISOString(),
        };
        updatedRules.push(newRule);
      } else {
        // 更新现有规则
        const index = updatedRules.findIndex(r => r.id === editingRule.id);
        if (index !== -1) {
          updatedRules[index] = { 
            ...updatedRules[index], 
            ...editingRule,
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      setAlertRules(updatedRules);
      setEditingRule(null);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('保存告警规则失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理保存通知渠道
  const handleSaveChannel = async () => {
    if (!editingChannel) return;

    setIsSaving(true);
    try {
      // 这里应该调用服务保存数据
      // await alertService.updateNotificationChannel(editingChannel);
      
      const updatedChannels = [...notificationChannels];
      if (editingChannel.isNew) {
        // 为新渠道生成ID
        const newChannel: ChannelConfiguration = {
          id: editingChannel.id || `channel_${Date.now()}`,
          name: editingChannel.name || '',
          type: editingChannel.type || 'email',
          configuration: editingChannel.configuration || {},
          enabled: editingChannel.enabled !== false,
          description: editingChannel.description || '',
        };
        updatedChannels.push(newChannel);
      } else {
        // 更新现有渠道
        const index = updatedChannels.findIndex(c => c.id === editingChannel.id);
        if (index !== -1) {
          updatedChannels[index] = { ...updatedChannels[index], ...editingChannel };
        }
      }
      
      setNotificationChannels(updatedChannels);
      setEditingChannel(null);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('保存通知渠道失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理删除告警规则
  const handleDeleteRule = async () => {
    if (!itemToDelete) return;

    try {
      // 这里应该调用服务删除数据
      // await alertService.deleteAlertRule(itemToDelete);
      
      const updatedRules = alertRules.filter(r => r.id !== itemToDelete);
      setAlertRules(updatedRules);
      setItemToDelete(null);
      setShowConfirmDialog(false);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('删除告警规则失败:', error);
    }
  };

  // 处理删除通知渠道
  const handleDeleteChannel = async () => {
    if (!itemToDelete) return;

    try {
      // 这里应该调用服务删除数据
      // await alertService.deleteNotificationChannel(itemToDelete);
      
      const updatedChannels = notificationChannels.filter(c => c.id !== itemToDelete);
      setNotificationChannels(updatedChannels);
      setItemToDelete(null);
      setShowConfirmDialog(false);
      setSaveSuccess(true);
      
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('删除通知渠道失败:', error);
    }
  };

  // 打开编辑告警规则表单
  const handleEditRule = (rule: AlertRule) => {
    setEditingRule({ ...rule });
  };

  // 打开编辑通知渠道表单
  const handleEditChannel = (channel: ChannelConfiguration) => {
    setEditingChannel({ ...channel });
  };

  // 创建新告警规则
  const handleCreateRule = () => {
    setEditingRule({
      isNew: true,
      id: '',
      name: '',
      description: '',
      metric: 'cpu_usage',
      condition: 'greater_than',
      threshold: 0,
      duration: 60,
      severity: 'warning',
      enabled: true,
      notifyChannels: [],
      notifyUsers: [],
      tags: [],
      cooldownPeriod: 300,
    });
  };

  // 创建新通知渠道
  const handleCreateChannel = () => {
    setEditingChannel({
      isNew: true,
      id: '',
      name: '',
      type: 'email',
      configuration: {},
      enabled: true,
      description: '',
    });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingRule(null);
    setEditingChannel(null);
  };

  // 处理确认删除
  const handleConfirmDelete = (id: string, type: 'rule' | 'channel') => {
    setItemToDelete(id);
    setDeleteType(type);
    setShowConfirmDialog(true);
  };

  // 获取指标标签
  const getMetricLabel = (metricId: string) => {
    return availableMetrics.find(m => m.value === metricId)?.label || metricId;
  };

  // 获取条件标签
  const getConditionLabel = (conditionId: string) => {
    return conditionOperators.find(c => c.value === conditionId)?.label || conditionId;
  };

  // 获取严重级别信息
  const getSeverityInfo = (severity: AlertSeverity) => {
    return severityLevels.find(s => s.value === severity) || {
      value: severity,
      label: severity,
      color: 'bg-gray-500',
    };
  };

  // 获取通知渠道信息
  const getChannelTypeInfo = (channelType: NotificationChannel) => {
    return channelTypes.find(c => c.value === channelType) || {
      value: channelType,
      label: channelType,
      icon: <Bell className="h-4 w-4" />,
    };
  };

  // 格式化时间（秒转为可读格式）
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`;
  };

  // 渲染告警规则表格
  const renderRulesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>告警规则名称</TableHead>
          <TableHead>监控指标</TableHead>
          <TableHead>条件</TableHead>
          <TableHead>持续时间</TableHead>
          <TableHead>严重级别</TableHead>
          <TableHead>通知渠道</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alertRules.map((rule) => {
          const severityInfo = getSeverityInfo(rule.severity);
          
          return (
            <TableRow key={rule.id}>
              <TableCell className="font-medium">{rule.name}</TableCell>
              <TableCell>{getMetricLabel(rule.metric)}</TableCell>
              <TableCell>
                {getConditionLabel(rule.condition)} {rule.threshold}
              </TableCell>
              <TableCell>{formatTime(rule.duration)}</TableCell>
              <TableCell>
                <Badge className={`${severityInfo.color} text-white`}>
                  {severityInfo.label}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  {rule.notifyChannels.map(channel => {
                    const channelInfo = getChannelTypeInfo(channel);
                    return (
                      <TooltipProvider key={channel}>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="flex items-center">
                            {channelInfo.icon}
                            <span className="ml-1 text-xs">{channelInfo.label}</span>
                          </Badge>
                        </TooltipTrigger>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={rule.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {rule.enabled ? '已启用' : '已禁用'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleConfirmDelete(rule.id, 'rule')}>
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

  // 渲染通知渠道表格
  const renderChannelsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>通知渠道名称</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>描述</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notificationChannels.map((channel) => {
          const channelInfo = getChannelTypeInfo(channel.type);
          
          return (
            <TableRow key={channel.id}>
              <TableCell className="font-medium">{channel.name}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {channelInfo.icon}
                  <span className="ml-2">{channelInfo.label}</span>
                </div>
              </TableCell>
              <TableCell>{channel.description}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={channel.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {channel.enabled ? '已启用' : '已禁用'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditChannel(channel)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleConfirmDelete(channel.id, 'channel')}>
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

  // 渲染告警规则表单
  const renderRuleForm = () => (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {editingRule?.isNew ? '创建新告警规则' : '编辑告警规则'}
        </CardTitle>
        <CardDescription>配置监控指标和告警条件</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ID *</label>
            <Input
              value={editingRule?.id || ''}
              onChange={(e) => editingRule && setEditingRule({ ...editingRule, id: e.target.value })}
              placeholder="输入规则ID（小写英文）"
              disabled={!editingRule?.isNew}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">名称 *</label>
            <Input
              value={editingRule?.name || ''}
              onChange={(e) => editingRule && setEditingRule({ ...editingRule, name: e.target.value })}
              placeholder="输入规则名称"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">描述</label>
            <Input
              value={editingRule?.description || ''}
              onChange={(e) => editingRule && setEditingRule({ ...editingRule, description: e.target.value })}
              placeholder="输入规则描述"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">监控指标 *</label>
            <Select
              value={editingRule?.metric || 'cpu_usage'}
              onValueChange={(value) => editingRule && setEditingRule({ ...editingRule, metric: value })}
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
              value={editingRule?.condition || 'greater_than'}
              onValueChange={(value) => editingRule && setEditingRule({ ...editingRule, condition: value })}
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
              value={editingRule?.threshold || ''}
              onChange={(e) => editingRule && setEditingRule({ ...editingRule, threshold: e.target.value })}
              placeholder="输入阈值"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">持续时间（秒） *</label>
            <Input
              type="number"
              value={editingRule?.duration || 60}
              onChange={(e) => editingRule && setEditingRule({ ...editingRule, duration: parseInt(e.target.value) })}
              placeholder="输入持续时间"
            />
            <p className="text-xs text-gray-500">指标超过阈值持续多长时间后触发告警</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">严重级别 *</label>
            <Select
              value={editingRule?.severity || 'warning'}
              onValueChange={(value: AlertSeverity) => editingRule && setEditingRule({ ...editingRule, severity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择严重级别" />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full ${level.color} mr-2`}></span>
                      {level.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">冷却期（秒）</label>
            <Input
              type="number"
              value={editingRule?.cooldownPeriod || 300}
              onChange={(e) => editingRule && setEditingRule({ ...editingRule, cooldownPeriod: parseInt(e.target.value) })}
              placeholder="输入冷却期"
            />
            <p className="text-xs text-gray-500">同一告警再次触发的最小间隔时间</p>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">通知渠道 *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {notificationChannels
                .filter(channel => channel.enabled)
                .map((channel) => {
                  const channelInfo = getChannelTypeInfo(channel.type);
                  const isSelected = editingRule?.notifyChannels?.includes(channel.type) || false;
                  
                  return (
                    <div key={channel.id} className="flex items-center space-x-2 p-2 border rounded-md">
                      <Checkbox
                        id={`channel-${channel.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (!editingRule) return;
                          const currentChannels = [...(editingRule.notifyChannels || [])];
                          
                          if (checked) {
                            // 添加渠道
                            if (!currentChannels.includes(channel.type)) {
                              currentChannels.push(channel.type);
                            }
                          } else {
                            // 移除渠道
                            const index = currentChannels.indexOf(channel.type);
                            if (index !== -1) {
                              currentChannels.splice(index, 1);
                            }
                          }
                          
                          setEditingRule({ ...editingRule, notifyChannels: currentChannels });
                        }}
                      />
                      <label htmlFor={`channel-${channel.id}`} className="flex items-center cursor-pointer">
                        {channelInfo.icon}
                        <span className="ml-2 text-sm">{channel.name}</span>
                      </label>
                    </div>
                  );
                })}
            </div>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">通知接收者</label>
            <Input
              value={editingRule?.notifyUsers?.join(', ') || ''}
              onChange={(e) => {
                if (!editingRule) return;
                const users = e.target.value
                  .split(',')
                  .map(user => user.trim())
                  .filter(user => user);
                setEditingRule({ ...editingRule, notifyUsers: users });
              }}
              placeholder="输入通知接收者，多个用逗号分隔"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">标签</label>
            <Input
              value={editingRule?.tags?.join(', ') || ''}
              onChange={(e) => {
                if (!editingRule) return;
                const tags = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag);
                setEditingRule({ ...editingRule, tags });
              }}
              placeholder="输入标签，多个用逗号分隔"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">启用规则</label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingRule?.enabled !== false}
                onCheckedChange={(checked) => editingRule && setEditingRule({ ...editingRule, enabled: checked })}
              />
              <span className="text-sm text-gray-500">是否启用此告警规则</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="secondary" onClick={handleCancelEdit} disabled={isSaving}>
            取消
          </Button>
          <Button
            onClick={handleSaveRule}
            disabled={
              isSaving ||
              !editingRule?.id ||
              !editingRule?.name ||
              !editingRule?.metric ||
              !editingRule?.condition ||
              !editingRule?.threshold ||
              !editingRule?.duration ||
              !editingRule?.severity ||
              (!editingRule?.notifyChannels || editingRule.notifyChannels.length === 0)
            }
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // 渲染通知渠道表单
  const renderChannelForm = () => {
    if (!editingChannel) return null;
    
    // 根据渠道类型渲染不同的配置字段
    const renderChannelConfiguration = () => {
      switch (editingChannel.type) {
        case 'email':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">SMTP服务器 *</label>
                <Input
                  value={editingChannel.configuration?.smtpServer || ''}
                  onChange={(e) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        smtpServer: e.target.value,
                      },
                    });
                  }}
                  placeholder="输入SMTP服务器地址"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">端口 *</label>
                <Input
                  type="number"
                  value={editingChannel.configuration?.port || 587}
                  onChange={(e) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        port: parseInt(e.target.value),
                      },
                    });
                  }}
                  placeholder="输入端口号"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">用户名 *</label>
                <Input
                  value={editingChannel.configuration?.username || ''}
                  onChange={(e) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        username: e.target.value,
                      },
                    });
                  }}
                  placeholder="输入SMTP用户名"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">密码 *</label>
                <Input
                  type="password"
                  value={editingChannel.configuration?.password || ''}
                  onChange={(e) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        password: e.target.value,
                      },
                    });
                  }}
                  placeholder="输入SMTP密码"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">发件人地址 *</label>
                <Input
                  value={editingChannel.configuration?.fromAddress || ''}
                  onChange={(e) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        fromAddress: e.target.value,
                      },
                    });
                  }}
                  placeholder="输入发件人地址"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">使用TLS</label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingChannel.configuration?.useTls !== false}
                    onCheckedChange={(checked) => {
                      if (!editingChannel) return;
                      setEditingChannel({
                        ...editingChannel,
                        configuration: {
                          ...editingChannel.configuration,
                          useTls: checked,
                        },
                      });
                    }}
                  />
                  <span className="text-sm text-gray-500">是否使用TLS加密连接</span>
                </div>
              </div>
            </div>
          );
        
        case 'slack':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Webhook URL *</label>
                <Input
                  value={editingChannel.configuration?.webhookUrl || ''}
                  onChange={(e) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        webhookUrl: e.target.value,
                      },
                    });
                  }}
                  placeholder="输入Slack Webhook URL"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">频道 *</label>
                <Input
                  value={editingChannel.configuration?.channel || '#alerts'}
                  onChange={(e) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        channel: e.target.value,
                      },
                    });
                  }}
                  placeholder="输入Slack频道"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">用户名</label>
                <Input
                  value={editingChannel.configuration?.username || 'Monitoring Bot'}
                  onChange={(e) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        username: e.target.value,
                      },
                    });
                  }}
                  placeholder="输入机器人用户名"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">图标表情</label>
                <Input
                  value={editingChannel.configuration?.iconEmoji || ':alert:'}
                  onChange={(e) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        iconEmoji: e.target.value,
                      },
                    });
                  }}
                  placeholder="输入图标表情"
                />
              </div>
            </div>
          );
        
        case 'webhook':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Webhook URL *</label>
                <Input
                  value={editingChannel.configuration?.url || ''}
                  onChange={(e) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        url: e.target.value,
                      },
                    });
                  }}
                  placeholder="输入Webhook URL"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">HTTP方法 *</label>
                <Select
                  value={editingChannel.configuration?.method || 'POST'}
                  onValueChange={(value) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        method: value,
                      },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择HTTP方法" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">超时时间（毫秒）</label>
                <Input
                  type="number"
                  value={editingChannel.configuration?.timeout || 5000}
                  onChange={(e) => {
                    if (!editingChannel) return;
                    setEditingChannel({
                      ...editingChannel,
                      configuration: {
                        ...editingChannel.configuration,
                        timeout: parseInt(e.target.value),
                      },
                    });
                  }}
                  placeholder="输入超时时间"
                />
              </div>
            </div>
          );
        
        default:
          return (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">配置将在保存后可用</p>
            </div>
          );
      }
    };

    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {editingChannel?.isNew ? '创建新通知渠道' : '编辑通知渠道'}
          </CardTitle>
          <CardDescription>配置通知渠道的详细参数</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ID *</label>
              <Input
                value={editingChannel?.id || ''}
                onChange={(e) => editingChannel && setEditingChannel({ ...editingChannel, id: e.target.value })}
                placeholder="输入渠道ID（小写英文）"
                disabled={!editingChannel?.isNew}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">名称 *</label>
              <Input
                value={editingChannel?.name || ''}
                onChange={(e) => editingChannel && setEditingChannel({ ...editingChannel, name: e.target.value })}
                placeholder="输入渠道名称"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">类型 *</label>
              <Select
                value={editingChannel?.type || 'email'}
                onValueChange={(value: NotificationChannel) => editingChannel && setEditingChannel({ ...editingChannel, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择渠道类型" />
                </SelectTrigger>
                <SelectContent>
                  {channelTypes.map((channel) => (
                    <SelectItem key={channel.value} value={channel.value}>
                      <div className="flex items-center">
                        {channel.icon}
                        <span className="ml-2">{channel.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">启用渠道</label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingChannel?.enabled !== false}
                  onCheckedChange={(checked) => editingChannel && setEditingChannel({ ...editingChannel, enabled: checked })}
                />
                <span className="text-sm text-gray-500">是否启用此通知渠道</span>
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">描述</label>
              <Input
                value={editingChannel?.description || ''}
                onChange={(e) => editingChannel && setEditingChannel({ ...editingChannel, description: e.target.value })}
                placeholder="输入渠道描述"
              />
            </div>
          </div>
          
          {/* 渠道特定配置 */}
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-medium flex items-center">
              <Settings className="h-4 w-4 mr-2 text-blue-500" />
              渠道配置
            </h3>
            
            <div className="p-4 border rounded-md">
              {renderChannelConfiguration()}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={handleCancelEdit} disabled={isSaving}>
              取消
            </Button>
            <Button
              onClick={handleSaveChannel}
              disabled={
                isSaving ||
                !editingChannel?.id ||
                !editingChannel?.name ||
                !editingChannel?.type
              }
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">监控告警配置</h1>
            <p className="text-gray-500 dark:text-gray-400">管理监控告警规则和通知渠道</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="secondary" size="sm" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              测试告警
            </Button>
            <Button variant="secondary" size="sm" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              告警静默
            </Button>
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
        {editingRule && renderRuleForm()}
        {editingChannel && renderChannelForm()}

        {/* 配置标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
            <TabsTrigger value="rules">告警规则</TabsTrigger>
            <TabsTrigger value="channels">通知渠道</TabsTrigger>
          </TabsList>

          {/* 告警规则标签页 */}
          <TabsContent value="rules">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-medium">告警规则管理</CardTitle>
                    <CardDescription>定义和管理监控告警规则</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleCreateRule} disabled={!!editingRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加规则
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderRulesTable()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知渠道标签页 */}
          <TabsContent value="channels">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-medium">通知渠道管理</CardTitle>
                    <CardDescription>配置告警通知的发送渠道</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleCreateChannel} disabled={!!editingChannel}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加渠道
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderChannelsTable()}
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
                确定要删除此{deleteType === 'rule' ? '告警规则' : '通知渠道'}吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={deleteType === 'rule' ? handleDeleteRule : handleDeleteChannel}>
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AlertConfiguration;