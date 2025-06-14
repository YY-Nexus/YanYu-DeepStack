"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle, Settings, Cloud, RefreshCw, Play, Server, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ConfigStatus {
  key: string
  name: string
  configured: boolean
  required: boolean
  status: "success" | "warning" | "error"
  description: string
}

export default function SimplifiedEnvironmentDashboard() {
  const [coreConfigs, setCoreConfigs] = useState<ConfigStatus[]>([])
  const [optionalConfigs, setOptionalConfigs] = useState<ConfigStatus[]>([])
  const [systemStatus, setSystemStatus] = useState({
    canStart: false,
    coreComplete: 0,
    optionalEnabled: 0,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { toast } = useToast()

  // 模拟加载配置状态
  useEffect(() => {
    loadConfigurationStatus()
  }, [])

  const loadConfigurationStatus = () => {
    setIsRefreshing(true)

    // 模拟检查用户已配置的核心环境变量
    const coreStatus: ConfigStatus[] = [
      {
        key: "NEXT_PUBLIC_OLLAMA_URL",
        name: "Ollama AI服务",
        configured: false, // 需要检测
        required: true,
        status: "warning",
        description: "本地AI模型服务地址",
      },
      {
        key: "NODE_ENV",
        name: "运行环境",
        configured: true, // 用户已配置
        required: true,
        status: "success",
        description: "应用运行环境设置",
      },
      {
        key: "NEXT_PUBLIC_APP_NAME",
        name: "应用名称",
        configured: true, // 用户已配置
        required: true,
        status: "success",
        description: "应用显示名称",
      },
      {
        key: "NEXT_PUBLIC_APP_VERSION",
        name: "应用版本",
        configured: true, // 用户已配置
        required: true,
        status: "success",
        description: "当前应用版本号",
      },
      {
        key: "NEXT_PUBLIC_API_BASE_URL",
        name: "API基础地址",
        configured: true, // 用户已配置
        required: true,
        status: "success",
        description: "API服务基础URL",
      },
    ]

    const optionalStatus: ConfigStatus[] = [
      {
        key: "NEXT_PUBLIC_OPENAI_API_KEY",
        name: "OpenAI服务",
        configured: false,
        required: false,
        status: "warning",
        description: "增强AI功能支持",
      },
      {
        key: "NEXT_PUBLIC_GITHUB_CLIENT_ID",
        name: "GitHub登录",
        configured: false,
        required: false,
        status: "warning",
        description: "GitHub OAuth认证",
      },
      {
        key: "ALIYUN_ACCESS_KEY_ID",
        name: "阿里云服务",
        configured: false,
        required: false,
        status: "warning",
        description: "云服务集成支持",
      },
      {
        key: "JAEGER_ENDPOINT",
        name: "分布式追踪",
        configured: false,
        required: false,
        status: "warning",
        description: "性能监控和追踪",
      },
    ]

    setCoreConfigs(coreStatus)
    setOptionalConfigs(optionalStatus)

    // 计算系统状态
    const coreConfigured = coreStatus.filter((c) => c.configured).length
    const optionalConfigured = optionalStatus.filter((c) => c.configured).length

    setSystemStatus({
      canStart: coreConfigured >= 4, // 至少需要4个核心配置 (除了Ollama可以后配置)
      coreComplete: Math.round((coreConfigured / coreStatus.length) * 100),
      optionalEnabled: optionalConfigured,
    })

    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // 刷新配置
  const refreshConfiguration = () => {
    loadConfigurationStatus()
    toast({
      title: "配置已刷新",
      description: "环境变量配置状态已更新",
    })
  }

  // 启动应用
  const startApplication = () => {
    toast({
      title: "启动应用",
      description: "正在启动开发服务器...",
    })
    // 这里可以添加实际的启动逻辑
  }

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* 系统状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{systemStatus.coreComplete}%</p>
                <p className="text-sm text-muted-foreground">核心配置完成度</p>
              </div>
            </div>
            <Progress value={systemStatus.coreComplete} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{systemStatus.optionalEnabled}</p>
                <p className="text-sm text-muted-foreground">可选功能已启用</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-green-500" />
              <div>
                <div className="flex items-center space-x-2">
                  {systemStatus.canStart ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      可以启动
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      配置不完整
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">系统状态</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">环境配置状态</h2>
        <div className="flex space-x-2">
          <Button onClick={refreshConfiguration} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            刷新状态
          </Button>
          {systemStatus.canStart && (
            <Button onClick={startApplication}>
              <Play className="h-4 w-4 mr-2" />
              启动应用
            </Button>
          )}
        </div>
      </div>

      {/* 配置详情 */}
      <Tabs defaultValue="core" className="space-y-4">
        <TabsList>
          <TabsTrigger value="core">核心配置</TabsTrigger>
          <TabsTrigger value="optional">可选配置</TabsTrigger>
          <TabsTrigger value="guide">配置指南</TabsTrigger>
        </TabsList>

        <TabsContent value="core">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>核心配置项</span>
                <Badge variant="outline">
                  {coreConfigs.filter((c) => c.configured).length}/{coreConfigs.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coreConfigs.map((config) => (
                  <motion.div
                    key={config.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(config.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{config.name}</p>
                          <Badge variant={config.configured ? "default" : "secondary"}>
                            {config.configured ? "已配置" : "未配置"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                        <p className="text-xs text-muted-foreground">{config.key}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optional">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5" />
                <span>可选配置项</span>
                <Badge variant="outline">按需启用</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optionalConfigs.map((config) => (
                  <motion.div
                    key={config.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(config.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{config.name}</p>
                          <Badge variant="secondary">可选</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                        <p className="text-xs text-muted-foreground">{config.key}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      配置
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>Ollama配置指南</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. 安装Ollama</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    curl -fsSL https://ollama.ai/install.sh | sh
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. 启动服务</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono">ollama serve</div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">3. 下载模型</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    ollama pull llama3.2
                    <br />
                    ollama pull qwen2.5
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>快速启动</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">当前配置状态</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">应用名称</span>
                      <Badge variant="default">✅ 言語云³深度堆栈</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API地址</span>
                      <Badge variant="default">✅ nettrack.yyhnit.com</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">运行环境</span>
                      <Badge variant="default">✅ development</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">启动命令</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    npm run dev
                    <br /># 或者
                    <br />
                    ./start.sh
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
