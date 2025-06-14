"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  GitBranch,
  Package,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Code,
  Database,
  Cloud,
  Zap,
} from "lucide-react"
import { useProjectStore } from "@/lib/project-store"

interface IntegrationStatus {
  id: string
  name: string
  status: "connected" | "disconnected" | "pending" | "error"
  type: "git" | "database" | "api" | "cloud" | "ai"
  lastSync?: Date
  config?: Record<string, any>
}

interface ProjectIntegrationPanelProps {
  projectId?: string
  onIntegrationChange?: (integrations: IntegrationStatus[]) => void
}

export default function ProjectIntegrationPanel({ projectId, onIntegrationChange }: ProjectIntegrationPanelProps) {
  const { projects, updateProject } = useProjectStore()
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      id: "git",
      name: "Git 版本控制",
      status: "connected",
      type: "git",
      lastSync: new Date(Date.now() - 5 * 60 * 1000),
      config: { branch: "main", remote: "origin" },
    },
    {
      id: "database",
      name: "数据库连接",
      status: "connected",
      type: "database",
      lastSync: new Date(Date.now() - 2 * 60 * 1000),
      config: { type: "PostgreSQL", host: "localhost:5432" },
    },
    {
      id: "api",
      name: "API 服务",
      status: "pending",
      type: "api",
      config: { endpoint: "https://api.example.com" },
    },
    {
      id: "cloud",
      name: "云服务部署",
      status: "disconnected",
      type: "cloud",
      config: { provider: "Vercel", region: "us-east-1" },
    },
    {
      id: "ai",
      name: "AI 模型集成",
      status: "connected",
      type: "ai",
      lastSync: new Date(Date.now() - 1 * 60 * 1000),
      config: { model: "qwen2:72b", endpoint: "http://localhost:11434" },
    },
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<string>("git")

  // 获取状态图标
  const getStatusIcon = (status: IntegrationStatus["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  // 获取类型图标
  const getTypeIcon = (type: IntegrationStatus["type"]) => {
    switch (type) {
      case "git":
        return <GitBranch className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      case "api":
        return <Code className="h-4 w-4" />
      case "cloud":
        return <Cloud className="h-4 w-4" />
      case "ai":
        return <Zap className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: IntegrationStatus["status"]) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // 刷新集成状态
  const refreshIntegrations = async () => {
    setIsRefreshing(true)

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 更新状态
    setIntegrations((prev) =>
      prev.map((integration) => ({
        ...integration,
        lastSync: new Date(),
        status: Math.random() > 0.2 ? "connected" : "pending",
      })),
    )

    setIsRefreshing(false)
  }

  // 切换集成状态
  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? {
              ...integration,
              status: integration.status === "connected" ? "disconnected" : "connected",
              lastSync: integration.status === "disconnected" ? new Date() : integration.lastSync,
            }
          : integration,
      ),
    )
  }

  // 计算整体健康度
  const calculateHealthScore = () => {
    const connectedCount = integrations.filter((i) => i.status === "connected").length
    return Math.round((connectedCount / integrations.length) * 100)
  }

  useEffect(() => {
    onIntegrationChange?.(integrations)
  }, [integrations, onIntegrationChange])

  const healthScore = calculateHealthScore()
  const selectedIntegrationData = integrations.find((i) => i.id === selectedIntegration)

  return (
    <div className="space-y-6">
      {/* 整体状态概览 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                项目集成面板
              </CardTitle>
              <CardDescription>管理项目的各种集成服务和连接状态</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshIntegrations} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              刷新状态
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 健康度指标 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">整体健康度</span>
              <span className="text-2xl font-bold text-green-600">{healthScore}%</span>
            </div>
            <Progress value={healthScore} className="h-2" />

            {/* 快速状态概览 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {integrations.map((integration) => (
                <motion.div
                  key={integration.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 p-2 rounded-lg border bg-card"
                >
                  {getTypeIcon(integration.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{integration.name}</div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(integration.status)}
                      <span className="text-xs text-muted-foreground">
                        {integration.status === "connected"
                          ? "已连接"
                          : integration.status === "pending"
                            ? "连接中"
                            : integration.status === "error"
                              ? "错误"
                              : "未连接"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细集成管理 */}
      <Card>
        <CardHeader>
          <CardTitle>集成服务管理</CardTitle>
          <CardDescription>配置和管理各种集成服务的详细设置</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedIntegration} onValueChange={setSelectedIntegration}>
            <TabsList className="grid w-full grid-cols-5">
              {integrations.map((integration) => (
                <TabsTrigger key={integration.id} value={integration.id} className="flex items-center gap-1">
                  {getTypeIcon(integration.type)}
                  <span className="hidden sm:inline">{integration.name.split(" ")[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {integrations.map((integration) => (
              <TabsContent key={integration.id} value={integration.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(integration.type)}
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status === "connected"
                            ? "已连接"
                            : integration.status === "pending"
                              ? "连接中"
                              : integration.status === "error"
                                ? "错误"
                                : "未连接"}
                        </Badge>
                        {integration.lastSync && (
                          <span className="text-xs text-muted-foreground">
                            最后同步: {integration.lastSync.toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleIntegration(integration.id)}>
                      {integration.status === "connected" ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          断开连接
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          连接
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      配置
                    </Button>
                  </div>
                </div>

                {/* 配置详情 */}
                {integration.config && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">配置信息</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(integration.config).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-2 bg-muted rounded">
                          <span className="text-sm font-medium capitalize">{key}:</span>
                          <span className="text-sm text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作历史 */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">最近活动</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>连接状态检查完成</span>
                      <span className="ml-auto">2分钟前</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <RefreshCw className="h-3 w-3 text-blue-500" />
                      <span>配置已更新</span>
                      <span className="ml-auto">5分钟前</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
