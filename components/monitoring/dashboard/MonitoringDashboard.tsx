/**
 * @file 监控系统仪表板组件
 * @description 展示系统健康状态、SLA指标和故障恢复历史
 * @module monitoring
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Tabs, TabsContent, TabsList, TabsTrigger, Button, Badge, Progress, Avatar, Tooltip } from '@/components/ui/';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Heart, AlertTriangle, Clock, Database, Zap, CheckCircle, XCircle, ArrowUpRight, Settings, Calendar, Activity, Cpu, Database as DatabaseIcon, Server, Cloud } from 'lucide-react';
import { monitoringIntegrationService, SLAMetric, RecoveryEvent, Alert } from '@/lib/monitoring/monitoring';
import { Separator } from '@/components/ui/';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/';

interface HealthStatusProps {
  score: number;
  trend: 'improving' | 'stable' | 'worsening';
}

interface SLAMetricCardProps {
  metric: SLAMetric;
}

interface RecoveryEventCardProps {
  event: RecoveryEvent;
}

interface AlertCardProps {
  alert: Alert;
}

/**
 * 健康状态指示器组件
 */
const HealthStatusIndicator: React.FC<HealthStatusProps> = ({ score, trend }) => {
  // 根据分数确定颜色和状态
  const getHealthStatus = () => {
    if (score >= 90) return { color: 'text-emerald-500', status: '优秀' };
    if (score >= 75) return { color: 'text-green-500', status: '良好' };
    if (score >= 60) return { color: 'text-yellow-500', status: '一般' };
    if (score >= 40) return { color: 'text-orange-500', status: '较差' };
    return { color: 'text-red-500', status: '危险' };
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
      case 'worsening':
        return <ArrowUpRight className="h-4 w-4 text-red-500 rotate-90" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const { color, status } = getHealthStatus();

  return (
    <div className="flex items-center space-x-2">
      <div className={`${color} font-bold text-xl`}>{score.toFixed(1)}</div>
      <Badge variant="outline" className={`${color} border-${color.replace('text-', 'border-')}`}>
        {status}
      </Badge>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">{getTrendIcon()}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {trend === 'improving' && '趋势改善'}
              {trend === 'worsening' && '趋势恶化'}
              {trend === 'stable' && '趋势稳定'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

/**
 * SLA指标卡片组件
 */
const SLAMetricCard: React.FC<SLAMetricCardProps> = ({ metric }) => {
  const isCompliant = metric.currentValue <= metric.threshold;
  const isWarning = !isCompliant && metric.currentValue <= metric.warningThreshold;

  const getSeverityColor = () => {
    switch (metric.severity) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getProgressColor = () => {
    if (isCompliant) return 'bg-emerald-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progressPercentage = Math.min((metric.currentValue / metric.threshold) * 100, 100);

  return (
    <Card className={`p-0 overflow-hidden ${!isCompliant && !isWarning ? 'border-red-500' : isWarning ? 'border-yellow-500' : ''}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
          <Badge variant="outline" className={getSeverityColor()}>
            {metric.severity === 'critical' && '严重'}
            {metric.severity === 'high' && '高'}
            {metric.severity === 'medium' && '中'}
            {metric.severity === 'low' && '低'}
          </Badge>
        </div>
        <CardDescription className="text-xs text-gray-500">
          {metric.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            当前值: <span className={`${isCompliant ? 'text-emerald-600' : 'text-red-600'}`}>
              {metric.currentValue} {metric.unit}
            </span>
          </span>
          <span className="text-xs text-gray-500">阈值: {metric.threshold} {metric.unit}</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className={`h-2 ${!isCompliant ? 'bg-red-100' : 'bg-green-100'}`} 
        />
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <span>达标率: {metric.complianceRate}%</span>
          <span>{isCompliant ? '✅ 达标' : '❌ 未达标'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 恢复事件卡片组件
 */
const RecoveryEventCard: React.FC<RecoveryEventCardProps> = ({ event }) => {
  const getFaultTypeIcon = () => {
    switch (event.faultType) {
      case 'service_unavailable':
        return <Server className="h-4 w-4" />;
      case 'high_latency':
        return <Clock className="h-4 w-4" />;
      case 'database_connection_error':
        return <DatabaseIcon className="h-4 w-4" />;
      case 'cache_service_error':
        return <Cloud className="h-4 w-4" />;
      case 'queue_backlog':
        return <Activity className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center">
            {getFaultTypeIcon()}
            <span className="ml-2">{event.faultType}</span>
          </CardTitle>
          <Badge variant="outline" className={event.success ? 'text-emerald-500 border-emerald-500' : 'text-red-500 border-red-500'}>
            {event.success ? '成功' : '失败'}
          </Badge>
        </div>
        <CardDescription className="text-xs text-gray-500">
          {new Date(event.timestamp).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-xs space-y-1">
          <div><strong>服务:</strong> {event.serviceId || 'N/A'}</div>
          <div><strong>恢复策略:</strong> {event.strategyName}</div>
          <div><strong>耗时:</strong> {event.duration}ms</div>
          {event.message && <div><strong>消息:</strong> {event.message}</div>}
          {!event.success && event.error && (
            <div className="text-red-500"><strong>错误:</strong> {event.error}</div>
          )}
          {event.recommendations && event.recommendations.length > 0 && (
            <div>
              <strong>建议:</strong>
              <ul className="list-disc list-inside pl-2">
                {event.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 告警卡片组件
 */
const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center">
            {getSeverityIcon()}
            <span className="ml-2">{alert.title}</span>
          </CardTitle>
          <Badge variant="outline" className={alert.severity === 'critical' ? 'text-red-500 border-red-500' : 
                                          alert.severity === 'high' ? 'text-orange-500 border-orange-500' : 
                                          alert.severity === 'medium' ? 'text-yellow-500 border-yellow-500' : 
                                          'text-blue-500 border-blue-500'}>
            {alert.severity === 'critical' && '严重'}
            {alert.severity === 'high' && '高'}
            {alert.severity === 'medium' && '中'}
            {alert.severity === 'low' && '低'}
          </Badge>
        </div>
        <CardDescription className="text-xs text-gray-500">
          {new Date(alert.timestamp).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-xs space-y-1">
          <div>{alert.message}</div>
          {alert.details && (
            <div className="mt-1 p-2 bg-gray-50 rounded text-gray-600">
              {JSON.stringify(alert.details, null, 2)}
            </div>
          )}
          {alert.resolved && (
            <Badge className="mt-1 bg-emerald-100 text-emerald-800">
              已解决
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 健康评分趋势图表
 */
const HealthScoreTrendChart: React.FC = () => {
  // 模拟数据
  const mockData = [
    { time: '00:00', score: 85 },
    { time: '04:00', score: 86 },
    { time: '08:00', score: 82 },
    { time: '12:00', score: 88 },
    { time: '16:00', score: 90 },
    { time: '20:00', score: 92 },
    { time: '23:59', score: 89 },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
        <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <RechartsTooltip />
        <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/**
 * SLA合规率图表
 */
const SLAComplianceChart: React.FC = () => {
  // 模拟数据
  const mockData = [
    { name: '系统可用性', compliance: 99.95, target: 99.9 },
    { name: 'API响应时间', compliance: 98.7, target: 99.0 },
    { name: '错误率', compliance: 99.8, target: 99.9 },
    { name: '数据库性能', compliance: 99.2, target: 99.5 },
    { name: '交易处理率', compliance: 99.6, target: 99.0 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={mockData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        barGap={0}
        barSize={20}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis domain={[95, 100]} tick={{ fontSize: 10 }} />
        <RechartsTooltip formatter={(value) => [`${value}%`, '合规率']} />
        <Bar dataKey="compliance" name="实际合规率" fill="#10b981" />
        <Bar dataKey="target" name="目标合规率" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * 系统资源使用图表
 */
const SystemResourceChart: React.FC = () => {
  // 模拟数据
  const mockData = [
    { name: 'CPU', usage: 65 },
    { name: '内存', usage: 78 },
    { name: '磁盘I/O', usage: 45 },
    { name: '网络', usage: 55 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={mockData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="usage"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {mockData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip formatter={(value) => [`${value}%`, '使用率']} />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * 监控仪表板主组件
 */
const MonitoringDashboard: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState({
    systemHealthScore: 89.5,
    slaComplianceRate: 99.5,
    activeAlerts: 3,
    resolvedIssues: 12,
    statusTrend: 'improving' as 'improving' | 'stable' | 'worsening',
  });
  
  const [slaMetrics, setSlaMetrics] = useState<SLAMetric[]>([
    {
      id: 'sla_availability',
      name: '系统可用性',
      description: '系统整体可用性SLA',
      metricName: 'system_availability',
      currentValue: 99.92,
      threshold: 99.9,
      warningThreshold: 99.95,
      severity: 'critical',
      unit: '%',
      complianceRate: 99.92,
    },
    {
      id: 'sla_response_time',
      name: 'API响应时间',
      description: '主要API端点的平均响应时间',
      metricName: 'api_response_time',
      currentValue: 480,
      threshold: 500,
      warningThreshold: 300,
      severity: 'high',
      unit: 'ms',
      complianceRate: 98.7,
    },
    {
      id: 'sla_error_rate',
      name: '错误率',
      description: 'API请求的错误率',
      metricName: 'api_error_rate',
      currentValue: 0.08,
      threshold: 0.1,
      warningThreshold: 0.05,
      severity: 'high',
      unit: '%',
      complianceRate: 99.8,
    },
    {
      id: 'sla_database_performance',
      name: '数据库性能',
      description: '数据库查询平均执行时间',
      metricName: 'database_query_time',
      currentValue: 95,
      threshold: 100,
      warningThreshold: 50,
      severity: 'medium',
      unit: 'ms',
      complianceRate: 99.2,
    },
  ]);
  
  const [recoveryEvents, setRecoveryEvents] = useState<RecoveryEvent[]>([
    {
      id: 'evt_1',
      timestamp: Date.now() - 1000 * 60 * 30, // 30分钟前
      faultType: 'service_unavailable',
      serviceId: 'api-service-1',
      strategyName: '服务自动重启',
      success: true,
      duration: 3050,
      message: '服务已成功重启',
    },
    {
      id: 'evt_2',
      timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3小时前
      faultType: 'high_latency',
      serviceId: 'api-service-2',
      strategyName: '资源扩展',
      success: true,
      duration: 5020,
      message: '资源已扩展，延迟已降低',
    },
    {
      id: 'evt_3',
      timestamp: Date.now() - 1000 * 60 * 60 * 8, // 8小时前
      faultType: 'database_connection_error',
      serviceId: 'db-service-1',
      strategyName: '数据库连接重置',
      success: false,
      duration: 2010,
      error: '无法连接到数据库服务器',
      recommendations: ['检查数据库状态', '验证网络连接', '检查数据库凭证'],
    },
  ]);
  
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'alert_1',
      timestamp: Date.now() - 1000 * 60 * 5, // 5分钟前
      title: 'API响应时间异常',
      message: '主要API端点响应时间超过阈值',
      severity: 'high',
      details: {
        endpoint: '/api/users',
        responseTime: 750,
        threshold: 500,
      },
      resolved: false,
    },
    {
      id: 'alert_2',
      timestamp: Date.now() - 1000 * 60 * 15, // 15分钟前
      title: '数据库连接池耗尽',
      message: '数据库连接池接近最大连接数',
      severity: 'medium',
      details: {
        currentConnections: 95,
        maxConnections: 100,
        database: 'primary-db',
      },
      resolved: false,
    },
    {
      id: 'alert_3',
      timestamp: Date.now() - 1000 * 60 * 45, // 45分钟前
      title: 'CPU使用率过高',
      message: '服务器CPU使用率超过85%',
      severity: 'medium',
      details: {
        cpuUsage: 87,
        serverId: 'server-01',
      },
      resolved: true,
    },
  ]);

  // 从监控服务获取实时数据
  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        // 这里应该从监控服务获取实时数据
        // const status = await monitoringIntegrationService.getStatus();
        // setSystemStatus(status.overall);
        
        // const metrics = await monitoringIntegrationService.getSLAMetrics();
        // setSlaMetrics(metrics);
        
        // const events = await monitoringIntegrationService.getRecentRecoveryEvents();
        // setRecoveryEvents(events);
        
        // const activeAlerts = await monitoringIntegrationService.getActiveAlerts();
        // setAlerts(activeAlerts);
        
        // 每30秒刷新一次数据
        const intervalId = setInterval(fetchMonitoringData, 30000);
        return () => clearInterval(intervalId);
      } catch (error) {
        console.error('获取监控数据失败:', error);
      }
    };

    fetchMonitoringData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">监控仪表板</h1>
            <p className="text-gray-500 dark:text-gray-400">系统健康状态实时监控</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button size="sm" variant="default" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              配置
            </Button>
            <Button size="sm" variant="secondary" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              历史报告
            </Button>
          </div>
        </div>

        {/* 系统状态概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">系统健康评分</CardTitle>
            </CardHeader>
            <CardContent>
              <HealthStatusIndicator score={systemStatus.systemHealthScore} trend={systemStatus.statusTrend} />
              <p className="text-xs text-gray-500 mt-2">过去24小时平均评分</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">SLA合规率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-emerald-500">{systemStatus.slaComplianceRate}%</div>
              <p className="text-xs text-gray-500 mt-2">总体服务水平达成率</p>
              <Progress value={systemStatus.slaComplianceRate} className="h-2 mt-2 bg-green-100" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">活跃告警</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-red-500">{systemStatus.activeAlerts}</div>
              <p className="text-xs text-gray-500 mt-2">需要处理的告警数量</p>
              <Button size="sm" variant="secondary" className="mt-2 text-xs">
                查看全部
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">已解决问题</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-emerald-500">{systemStatus.resolvedIssues}</div>
              <p className="text-xs text-gray-500 mt-2">过去24小时已解决问题</p>
              <Button size="sm" variant="secondary" className="mt-2 text-xs">
                查看历史
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 主要图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">健康评分趋势</CardTitle>
              <CardDescription>过去24小时系统健康评分变化</CardDescription>
            </CardHeader>
            <CardContent>
              <HealthScoreTrendChart />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">SLA合规率</CardTitle>
              <CardDescription>各指标SLA达标情况</CardDescription>
            </CardHeader>
            <CardContent>
              <SLAComplianceChart />
            </CardContent>
          </Card>
        </div>

        {/* 详细信息标签页 */}
        <Tabs defaultValue="sla" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 mb-4">
            <TabsTrigger value="sla">SLA指标</TabsTrigger>
            <TabsTrigger value="recovery">恢复事件</TabsTrigger>
            <TabsTrigger value="alerts">告警</TabsTrigger>
            <TabsTrigger value="resources">系统资源</TabsTrigger>
          </TabsList>
          
          {/* SLA指标标签页 */}
          <TabsContent value="sla" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {slaMetrics.map((metric) => (
                <SLAMetricCard key={metric.id} metric={metric} />
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="secondary" size="sm">
                查看全部SLA指标
              </Button>
            </div>
          </TabsContent>
          
          {/* 恢复事件标签页 */}
          <TabsContent value="recovery" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {recoveryEvents.map((event) => (
                <RecoveryEventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="secondary" size="sm">
                查看全部恢复事件
              </Button>
            </div>
          </TabsContent>
          
          {/* 告警标签页 */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="secondary" size="sm">
                查看全部告警
              </Button>
            </div>
          </TabsContent>
          
          {/* 系统资源标签页 */}
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">资源使用情况</CardTitle>
                <CardDescription>系统主要资源使用率</CardDescription>
              </CardHeader>
              <CardContent>
                <SystemResourceChart />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Cpu className="h-4 w-4 mr-2" />
                    CPU使用率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">65%</div>
                  <Progress value={65} className="h-2 mt-2 bg-blue-100" />
                  <p className="text-xs text-gray-500 mt-2">过去5分钟平均使用率</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    内存使用率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">78%</div>
                  <Progress value={78} className="h-2 mt-2 bg-green-100" />
                  <p className="text-xs text-gray-500 mt-2">当前内存使用情况</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center">
              <Button variant="secondary" size="sm">
                查看详细资源监控
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MonitoringDashboard;