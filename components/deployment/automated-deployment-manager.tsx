"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Rocket, 
  GitBranch, 
  Server, 
  Monitor,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Cloud,
  Globe,
  Database,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeploymentEnvironment {
  id: string
  name: string
  type: 'development' | 'staging' | 'production'
  url: string
  status: 'healthy' | 'warning' | 'error' | 'deploying'
  lastDeploy: Date
  version: string
  branch: string
  instances: number
  cpu: number
  memory: number
  uptime: string
}

interface DeploymentHistory {
  id: string
  environment: string
  version: string
  branch: string
  status: 'success' | 'failed' | 'in-progress' | 'cancelled'
  startTime: Date
  endTime?: Date
  duration?: number
  deployedBy: string
  changes: string[]
}

interface PipelineStage {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  duration?: number
  logs?: string[]
}

export function AutomatedDeploymentManager() {
  const [activeTab, setActiveTab] = useState('environments')
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([])
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentHistory[]>([])
  const [currentPipeline, setCurrentPipeline] = useState<PipelineStage[]>([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('')

  // 模拟数据
  useEffect(() => {
    const mockEnvironments: DeploymentEnvironment[] = [
      {
        id: '1',
        name: '开发环境',
        type: 'development',
        url: 'https://dev.yanyu-cloud.com',
        status: 'healthy',
        lastDeploy: new Date('2024-12-25T10:30:00'),
        version: 'v1.2.3-dev.45',
        branch: 'develop',
        instances: 1,
        cpu: 45,
        memory: 68,
        uptime: '2天 14小时'
      },
      {
        id: '2',
        name: '预发布环境',
        type: 'staging',
        url: 'https://staging.yanyu-cloud.com',
        status: 'deploying',
        lastDeploy: new Date('2024-12-25T14:15:00'),
        version: 'v1.2.3-rc.1',
        branch: 'release/1.2.3',
        instances: 2,
        cpu: 32,
        memory: 55,
        uptime: '5天 8小时'
      },
      {
        id: '3',
        name: '生产环境',
        type: 'production',
        url: 'https://yanyu-cloud.com',
        status: 'healthy',
        lastDeploy: new Date('2024-12-24T16:45:00'),
        version: 'v1.2.2',
        branch: 'main',
        instances: 5,
        cpu: 78,
        memory: 82,
        uptime: '15天 3小时'
      }
    ]

    const mockHistory: DeploymentHistory[] = [
      {
        id: '1',
        environment: '生产环境',
        version: 'v1.2.2',
        branch: 'main',
        status: 'success',
        startTime: new Date('2024-12-24T16:40:00'),
        endTime: new Date('2024-12-24T16:45:00'),
        duration: 5,
        deployedBy: '张三',
        changes: [
          '修复用户登录问题',
          '优化查询性能',
          '更新安全配置'
        ]
      },
      {
        id: '2',
        environment: '预发布环境',
        version: 'v1.2.3-rc.1',
        branch: 'release/1.2.3',
        status: 'in-progress',
        startTime: new Date('2024-12-25T14:15:00'),
        deployedBy: '李四',
        changes: [
          '新增AI代码分析功能',
          '改进UI/UX设计',
          '添加实时协作功能'
        ]
      },
      {
        id: '3',
        environment: '开发环境',
        version: 'v1.2.1',
        branch: 'develop',
        status: 'failed',
        startTime: new Date('2024-12-23T09:20:00'),
        endTime: new Date('2024-12-23T09:25:00'),
        duration: 5,
        deployedBy: '王五',
        changes: [
          '实验性功能测试',
          '数据库迁移脚本'
        ]
      }
    ]

    const mockPipeline: PipelineStage[] = [
      {
        id: '1',
        name: '代码检出',
        status: 'success',
        duration: 15
      },
      {
        id: '2',
        name: '依赖安装',
        status: 'success',
        duration: 120
      },
      {
        id: '3',
        name: '代码检查',
        status: 'success',
        duration: 45
      },
      {
        id: '4',
        name: '单元测试',
        status: 'running',
        logs: ['Running test suite...', 'Testing authentication module...']
      },
      {
        id: '5',
        name: '构建镜像',
        status: 'pending'
      },
      {
        id: '6',
        name: '部署到环境',
        status: 'pending'
      },
      {
        id: '7',
        name: '健康检查',
        status: 'pending'
      }
    ]

    setEnvironments(mockEnvironments)
    setDeploymentHistory(mockHistory)
    setCurrentPipeline(mockPipeline)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
      case 'failed': return 'text-red-600 bg-red-50 border-red-200'
      case 'deploying':
      case 'in-progress':
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'error':
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'deploying':
      case 'in-progress':
      case 'running': return <Clock className="w-4 h-4 animate-spin" />
      case 'pending': return <Pause className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getEnvironmentTypeColor = (type: string) => {
    switch (type) {
      case 'production': return 'bg-red-500'
      case 'staging': return 'bg-yellow-500'
      case 'development': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const startDeployment = async (environmentId: string, branch: string = 'main') => {
    setIsDeploying(true)
    try {
      // 模拟部署过程
      console.log(`开始部署到环境 ${environmentId}，分支 ${branch}`)
      
      // 更新环境状态
      setEnvironments(prev => prev.map(env => 
        env.id === environmentId 
          ? { ...env, status: 'deploying' as const }
          : env
      ))

      // 模拟流水线执行
      for (let i = 0; i < currentPipeline.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        setCurrentPipeline(prev => prev.map((stage, index) => 
          index === i 
            ? { ...stage, status: 'running' as const }
            : index < i 
              ? { ...stage, status: 'success' as const }
              : stage
        ))
      }

      // 完成部署
      setEnvironments(prev => prev.map(env => 
        env.id === environmentId 
          ? { ...env, status: 'healthy' as const, lastDeploy: new Date() }
          : env
      ))
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">自动化部署管理</h2>
          <p className="text-muted-foreground">多环境部署控制和监控</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择环境" />
            </SelectTrigger>
            <SelectContent>
              {environments.map(env => (
                <SelectItem key={env.id} value={env.id}>
                  {env.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => selectedEnvironment && startDeployment(selectedEnvironment)}
            disabled={isDeploying || !selectedEnvironment}
          >
            <Rocket className="w-4 h-4 mr-2" />
            开始部署
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="environments">环境状态</TabsTrigger>
          <TabsTrigger value="pipeline">部署流水线</TabsTrigger>
          <TabsTrigger value="history">部署历史</TabsTrigger>
          <TabsTrigger value="monitoring">监控中心</TabsTrigger>
        </TabsList>

        <TabsContent value="environments" className="space-y-4">
          <div className="grid gap-4">
            {environments.map(env => (
              <Card key={env.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        getEnvironmentTypeColor(env.type)
                      )} />
                      <div>
                        <CardTitle className="text-lg">{env.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{env.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(env.status)}>
                        {getStatusIcon(env.status)}
                        <span className="ml-1 capitalize">{env.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">版本</p>
                      <p className="font-mono text-sm">{env.version}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">分支</p>
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-3 h-3" />
                        <p className="font-mono text-sm">{env.branch}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">实例数</p>
                      <div className="flex items-center space-x-1">
                        <Server className="w-3 h-3" />
                        <p className="text-sm">{env.instances}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">运行时间</p>
                      <p className="text-sm">{env.uptime}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>CPU 使用率</span>
                        <span>{env.cpu}%</span>
                      </div>
                      <Progress value={env.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>内存使用率</span>
                        <span>{env.memory}%</span>
                      </div>
                      <Progress value={env.memory} className="h-2" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      最后部署: {env.lastDeploy.toLocaleString()}
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        配置
                      </Button>
                      <Button variant="outline" size="sm">
                        <Globe className="w-4 h-4 mr-2" />
                        访问
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => startDeployment(env.id)}
                        disabled={isDeploying}
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        部署
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5" />
                <span>部署流水线</span>
                {isDeploying && <Badge variant="secondary">运行中</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentPipeline.map((stage, index) => (
                  <div key={stage.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2",
                        stage.status === 'success' && "bg-green-50 border-green-200 text-green-600",
                        stage.status === 'running' && "bg-blue-50 border-blue-200 text-blue-600",
                        stage.status === 'failed' && "bg-red-50 border-red-200 text-red-600",
                        stage.status === 'pending' && "bg-gray-50 border-gray-200 text-gray-400"
                      )}>
                        {getStatusIcon(stage.status)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{stage.name}</h4>
                        {stage.duration && (
                          <span className="text-xs text-muted-foreground">
                            {stage.duration}s
                          </span>
                        )}
                      </div>
                      {stage.logs && stage.status === 'running' && (
                        <div className="mt-2 p-2 bg-gray-900 text-green-400 rounded text-xs font-mono">
                          {stage.logs.map((log, i) => (
                            <div key={i}>{log}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    {index < currentPipeline.length - 1 && (
                      <div className="absolute left-4 mt-8 w-0.5 h-6 bg-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {deploymentHistory.map(deployment => (
              <Card key={deployment.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-2 rounded",
                        getStatusColor(deployment.status)
                      )}>
                        {getStatusIcon(deployment.status)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{deployment.environment}</h4>
                          <Badge variant="outline" className="font-mono text-xs">
                            {deployment.version}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          分支: {deployment.branch} • 部署者: {deployment.deployedBy}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          开始时间: {deployment.startTime.toLocaleString()}
                          {deployment.endTime && (
                            <> • 完成时间: {deployment.endTime.toLocaleString()}</>
                          )}
                          {deployment.duration && (
                            <> • 耗时: {deployment.duration} 分钟</>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(deployment.status)}>
                      {deployment.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 ml-11">
                    <h5 className="text-sm font-medium mb-2">变更内容:</h5>
                    <ul className="space-y-1">
                      {deployment.changes.map((change, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start">
                          <span className="mr-2">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">活跃实例</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  跨 3 个环境
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245ms</div>
                <p className="text-xs text-muted-foreground">
                  较上次 -12ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">错误率</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.02%</div>
                <p className="text-xs text-muted-foreground">
                  目标 {'<'} 0.1%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">可用性</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.98%</div>
                <p className="text-xs text-muted-foreground">
                  SLA: 99.9%
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>资源使用情况</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>总体 CPU 使用率</span>
                      <span>52%</span>
                    </div>
                    <Progress value={52} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>总体内存使用率</span>
                      <span>68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>网络带宽使用</span>
                      <span>34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>安全状态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-sm">SSL 证书</span>
                    </div>
                    <Badge className="bg-green-50 text-green-600">有效</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-green-600" />
                      <span className="text-sm">数据库连接</span>
                    </div>
                    <Badge className="bg-green-50 text-green-600">安全</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cloud className="w-4 h-4 text-green-600" />
                      <span className="text-sm">API 网关</span>
                    </div>
                    <Badge className="bg-green-50 text-green-600">正常</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AutomatedDeploymentManager
