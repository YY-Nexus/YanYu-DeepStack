"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Shield,
  Activity,
  Zap,
  TrendingUp,
  Users,
  RefreshCw,
  Terminal,
  Eye
} from 'lucide-react'
import { useToast } from '@/lib/utils/client-toast'

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
  metrics: {
    responseTime: number
    errorRate: number
    throughput: number
    availability: number
  }
}

interface DeploymentHistory {
  id: string
  environment: string
  version: string
  branch: string
  status: 'success' | 'failed' | 'in-progress'
  startTime: Date
  endTime?: Date
  duration?: number
  deployedBy: string
  changes: string[]
}

interface DeploymentStats {
  totalDeployments: number
  successRate: number
  averageDuration: number
  deploymentsThisWeek: number
}

export function EnhancedDeploymentManager() {
  const [activeTab, setActiveTab] = useState('environments')
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([])
  const [history, setHistory] = useState<DeploymentHistory[]>([])
  const [stats, setStats] = useState<DeploymentStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [deployingEnv, setDeployingEnv] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState('main')
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([])
  const [showLogs, setShowLogs] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/deployment/environments')
      const result = await response.json()
      
      if (result.success) {
        setEnvironments(result.data.environments)
        setHistory(result.data.history)
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('加载部署数据失败:', error)
      toast({
        title: "错误",
        description: "加载部署数据失败",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deployToEnvironment = async (environmentId: string, branch: string) => {
    setDeployingEnv(environmentId)
    setDeploymentLogs([])
    setShowLogs(true)
    
    try {
      const response = await fetch('/api/deployment/environments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          environmentId,
          branch,
          version: `v1.2.${Math.floor(Math.random() * 10)}`
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setDeploymentLogs(result.data.logs)
        
        if (result.data.status === 'success') {
          // 更新环境信息
          setEnvironments(prev => 
            prev.map(env => 
              env.id === environmentId ? result.data.environment : env
            )
          )
          
          toast({
            title: "部署成功",
            description: `已成功部署到 ${result.data.environment.name}`,
            variant: "default"
          })
        } else {
          toast({
            title: "部署失败",
            description: "请查看部署日志了解详情",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error('部署失败:', error)
      toast({
        title: "错误",
        description: "部署请求失败",
        variant: "destructive"
      })
    } finally {
      setDeployingEnv(null)
    }
  }

  const rollbackEnvironment = async (environmentId: string, version: string) => {
    setDeployingEnv(environmentId)
    
    try {
      const response = await fetch('/api/deployment/environments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          environmentId,
          branch: 'main',
          version,
          rollback: true
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setEnvironments(prev => 
          prev.map(env => 
            env.id === environmentId ? result.data.environment : env
          )
        )
        
        toast({
          title: "回滚成功",
          description: `已成功回滚到版本 ${version}`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error('回滚失败:', error)
      toast({
        title: "错误",
        description: "回滚失败",
        variant: "destructive"
      })
    } finally {
      setDeployingEnv(null)
    }
  }

  const performHealthCheck = async (environmentId: string) => {
    try {
      const response = await fetch('/api/deployment/environments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ environmentId }),
      })

      const result = await response.json()
      
      if (result.success) {
        setEnvironments(prev => 
          prev.map(env => 
            env.id === environmentId ? result.data.environment : env
          )
        )
        
        toast({
          title: "健康检查完成",
          description: `${result.data.environment.name} 状态已更新`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error('健康检查失败:', error)
      toast({
        title: "错误",
        description: "健康检查失败",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'deploying': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-50 text-green-700 border-green-200'
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'error': return 'bg-red-50 text-red-700 border-red-200'
      case 'deploying': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getEnvironmentIcon = (type: string) => {
    switch (type) {
      case 'development': return <Monitor className="h-4 w-4" />
      case 'staging': return <Settings className="h-4 w-4" />
      case 'production': return <Globe className="h-4 w-4" />
      default: return <Server className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* 头部统计 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">总部署次数</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.totalDeployments}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">成功率</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.successRate}%</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">平均耗时</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.averageDuration}s</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">本周部署</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.deploymentsThisWeek}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 主要内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="environments">环境管理</TabsTrigger>
          <TabsTrigger value="deploy">快速部署</TabsTrigger>
          <TabsTrigger value="history">部署历史</TabsTrigger>
          <TabsTrigger value="monitoring">监控面板</TabsTrigger>
        </TabsList>

        <TabsContent value="environments">
          <div className="space-y-4">
            {environments.map((env) => (
              <Card key={env.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getEnvironmentIcon(env.type)}
                      <div>
                        <CardTitle className="text-lg">{env.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{env.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(env.status)}>
                        {getStatusIcon(env.status)}
                        <span className="ml-1">{env.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">版本</span>
                      <p className="font-medium">{env.version}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">分支</span>
                      <p className="font-medium flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {env.branch}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">实例数</span>
                      <p className="font-medium">{env.instances}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">运行时间</span>
                      <p className="font-medium">{env.uptime}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU 使用率</span>
                        <span>{env.cpu}%</span>
                      </div>
                      <Progress value={env.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>内存使用率</span>
                        <span>{env.memory}%</span>
                      </div>
                      <Progress value={env.memory} className="h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">响应时间</span>
                      <p className="font-medium">{env.metrics.responseTime}ms</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">错误率</span>
                      <p className="font-medium">{env.metrics.errorRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">吞吐量</span>
                      <p className="font-medium">{env.metrics.throughput}/min</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">可用性</span>
                      <p className="font-medium">{env.metrics.availability.toFixed(2)}%</p>
                    </div>
                  </div>

                  <Separator className="my-4" />
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => deployToEnvironment(env.id, selectedBranch)}
                      disabled={deployingEnv === env.id}
                      className="flex items-center gap-1"
                    >
                      {deployingEnv === env.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Rocket className="h-3 w-3" />
                      )}
                      部署
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => rollbackEnvironment(env.id, 'v1.2.0')}
                      disabled={deployingEnv === env.id}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      回滚
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => performHealthCheck(env.id)}
                      className="flex items-center gap-1"
                    >
                      <Activity className="h-3 w-3" />
                      健康检查
                    </Button>

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(env.url, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      访问
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deploy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                快速部署
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="branch-select" className="text-sm font-medium">选择分支</label>
                  <select 
                    id="branch-select"
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="main">main</option>
                    <option value="develop">develop</option>
                    <option value="feature/new-ui">feature/new-ui</option>
                    <option value="release/1.3.0">release/1.3.0</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {environments.map((env) => (
                    <Card key={env.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          {getEnvironmentIcon(env.type)}
                          <span className="font-medium">{env.name}</span>
                          {getStatusIcon(env.status)}
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => deployToEnvironment(env.id, selectedBranch)}
                          disabled={deployingEnv === env.id}
                        >
                          {deployingEnv === env.id ? '部署中...' : '部署到此环境'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 部署日志 */}
          {showLogs && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    部署日志
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setShowLogs(false)}>
                    关闭
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 bg-black text-green-400 p-4 rounded-md font-mono text-sm">
                  {deploymentLogs.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                部署历史
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {history.map((deploy) => (
                    <div key={deploy.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {environments.find(env => env.id === deploy.environment)?.name}
                          </Badge>
                          <Badge className={
                            deploy.status === 'success' ? 'bg-green-100 text-green-800' :
                            deploy.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {deploy.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(deploy.startTime).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">版本:</span>
                          <span className="ml-1 font-medium">{deploy.version}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">分支:</span>
                          <span className="ml-1 font-medium">{deploy.branch}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">耗时:</span>
                          <span className="ml-1 font-medium">{deploy.duration}s</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">部署者:</span>
                          <span className="ml-1 font-medium">{deploy.deployedBy}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium">变更内容:</span>
                        <ul className="mt-1 text-sm text-muted-foreground space-y-1">
                          {deploy.changes.map((change, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span>•</span>
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>系统监控</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {environments.map((env) => (
                    <div key={env.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{env.name}</span>
                        {getStatusIcon(env.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>CPU: {env.cpu}%</div>
                        <div>内存: {env.memory}%</div>
                        <div>响应: {env.metrics.responseTime}ms</div>
                        <div>可用性: {env.metrics.availability.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>告警中心</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      预发布环境响应时间超过阈值 (180ms {'>'} 150ms)
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      预发布环境错误率偏高 (2.1% {'>'} 1%)
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center text-muted-foreground text-sm mt-6">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    其他环境运行正常
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
