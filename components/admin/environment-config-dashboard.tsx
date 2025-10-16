"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Cloud,
  Shield,
  Activity,
  Users,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { environmentValidator } from "@/lib/config/environment-validator"

export default function EnvironmentConfigDashboard() {
  const [validationResults, setValidationResults] = useState<any[]>([])
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { toast } = useToast()

  // 加载配置状态
  useEffect(() => {
    loadConfigurationStatus()
  }, [])

  const loadConfigurationStatus = () => {
    setIsRefreshing(true)

    // 模拟加载延迟
    setTimeout(() => {
      const results = environmentValidator.getValidationResults()
      const status = environmentValidator.getConfigurationStatus()

      setValidationResults(results)
      setConfigStatus(status)
      setIsRefreshing(false)
    }, 1000)
  }

  // 刷新配置
  const refreshConfiguration = () => {
    loadConfigurationStatus()
    toast({
      title: "配置已刷新",
      description: "环境变量配置状态已更新",
    })
  }

  // 复制配置值
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "已复制",
      description: "配置值已复制到剪贴板",
    })
  }

  // 切换密钥显示
  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // 获取状态图标
  const getStatusIcon = (result: any) => {
    if (!result.configured) {
      return result.required ? (
        <XCircle className="h-4 w-4 text-red-500" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
      )
    }

    return result.valid ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  // 获取状态颜色
  const getStatusColor = (result: any) => {
    if (!result.configured) {
      return result.required ? "destructive" : "secondary"
    }
    return result.valid ? "default" : "destructive"
  }

  // 按类别分组结果
  const groupedResults = validationResults.reduce(
    (groups, result) => {
      const category = result.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(result)
      return groups
    },
    {} as Record<string, any[]>,
  )

  // 类别信息
  const categoryInfo = {
    core: { name: "核心服务", icon: Settings, color: "blue" },
    ai: { name: "AI服务", icon: Activity, color: "purple" },
    auth: { name: "身份认证", icon: Shield, color: "green" },
    cloud: { name: "云服务", icon: Cloud, color: "cyan" },
    monitoring: { name: "监控追踪", icon: Activity, color: "orange" },
    collaboration: { name: "协作通信", icon: Users, color: "pink" },
  }

  // 获取配置指南链接
  const getConfigGuideUrl = (key: string) => {
    const guides: Record<string, string> = {
      NEXT_PUBLIC_OPENAI_API_KEY: "https://platform.openai.com/api-keys",
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: "https://console.cloud.google.com/",
      NEXT_PUBLIC_GITHUB_CLIENT_ID: "https://github.com/settings/developers",
      ALIYUN_ACCESS_KEY_ID: "https://ram.console.aliyun.com/",
    }
    return guides[key]
  }

  if (!configStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">加载配置状态中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 配置概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{configStatus.total}</p>
                <p className="text-sm text-muted-foreground">总配置项</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{configStatus.configured}</p>
                <p className="text-sm text-muted-foreground">已配置</p>
              </div>
            </div>
            <Progress value={configStatus.completeness} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{configStatus.valid}</p>
                <p className="text-sm text-muted-foreground">格式正确</p>
              </div>
            </div>
            <Progress value={configStatus.validity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{configStatus.requiredConfigured}</p>
                <p className="text-sm text-muted-foreground">必需项</p>
              </div>
            </div>
            <div className="mt-2">
              {configStatus.canStart ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  可以启动
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  无法启动
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">环境变量配置</h2>
        <Button onClick={refreshConfiguration} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          刷新配置
        </Button>
      </div>

      {/* 配置详情 */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">全部配置</TabsTrigger>
          <TabsTrigger value="required">必需配置</TabsTrigger>
          <TabsTrigger value="missing">缺失配置</TabsTrigger>
          <TabsTrigger value="invalid">格式错误</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-6">
            {Object.entries(groupedResults).map(([category, results]) => {
              const info = categoryInfo[category as keyof typeof categoryInfo]
              // 明确指定results的类型，包含所有必要的属性
              const typedResults = results as Array<{
                key: string;
                configured: boolean;
                value?: string;
                valid?: boolean;
                required?: boolean;
                message?: string;
                category: string;
                description?: string;
              }>
              const IconComponent = info?.icon || Settings

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5" />
                      <span>{info?.name || category}</span>
                      <Badge variant="outline">
                        {typedResults.filter((r) => r.configured).length}/{typedResults.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {typedResults.map((result) => (
                        <motion.div
                          key={result.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(result)}
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{result.key}</p>
                                <Badge variant={getStatusColor(result) as any}>{result.message}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{result.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {result.configured && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => toggleSecretVisibility(result.key)}>
                                  {showSecrets[result.key] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.key)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {getConfigGuideUrl(result.key) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(getConfigGuideUrl(result.key), "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="required">
          <Card>
            <CardHeader>
              <CardTitle>必需配置项</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationResults
                  .filter((result) => result.required)
                  .map((result) => (
                    <div key={result.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result)}
                        <div>
                          <p className="font-medium">{result.key}</p>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(result) as any}>{result.message}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing">
          <Card>
            <CardHeader>
              <CardTitle>缺失配置项</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationResults
                  .filter((result) => !result.configured)
                  .map((result) => (
                    <div key={result.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result)}
                        <div>
                          <p className="font-medium">{result.key}</p>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={result.required ? "destructive" : "secondary"}>
                          {result.required ? "必需" : "可选"}
                        </Badge>
                        {getConfigGuideUrl(result.key) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getConfigGuideUrl(result.key), "_blank")}
                          >
                            获取配置
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invalid">
          <Card>
            <CardHeader>
              <CardTitle>格式错误配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationResults
                  .filter((result) => result.configured && !result.valid)
                  .map((result) => (
                    <div key={result.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result)}
                        <div>
                          <p className="font-medium">{result.key}</p>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                        </div>
                      </div>
                      <Badge variant="destructive">格式错误</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
