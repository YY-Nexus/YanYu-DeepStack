"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { serviceRegistry } from "@/lib/microservices/service-registry"
import { apiGateway } from "@/lib/microservices/api-gateway"
import { distributedTracing } from "@/lib/microservices/distributed-tracing"
import { Activity, Server, Network, Eye, AlertTriangle, CheckCircle } from "lucide-react"

// 微服务管理仪表板
export default function ServiceDashboard() {
  const [services, setServices] = useState<any[]>([])
  const [gatewayStats, setGatewayStats] = useState<any>(null)
  const [tracingStats, setTracingStats] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 5000) // 每5秒刷新
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // 获取服务注册信息
      const allServices = serviceRegistry.getAllServices()
      const serviceList = Array.from(allServices.entries()).map(([name, instances]) => ({
        name,
        instances,
        health: serviceRegistry.getServiceHealth(name),
      }))
      setServices(serviceList)

      // 获取网关统计信息
      const gwStats = apiGateway.getGatewayStats()
      setGatewayStats(gwStats)

      // 获取追踪统计信息
      const traceStats = distributedTracing.getTracingStats()
      setTracingStats(traceStats)
    } catch (error) {
      console.error("加载仪表板数据失败:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "active":
      case "available":
        return "bg-green-500"
      case "unhealthy":
      case "error":
      case "unavailable":
        return "bg-red-500"
      case "degraded":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "active":
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "unhealthy":
      case "error":
      case "unavailable":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总服务数</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              {services.filter((s) => s.health.status === "available").length} 个健康
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总实例数</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.reduce((total, service) => total + service.instances.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {services.reduce((total, service) => total + service.health.healthyInstances, 0)} 个健康
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API路由</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gatewayStats?.totalRoutes || 0}</div>
            <p className="text-xs text-muted-foreground">{gatewayStats?.totalMiddleware || 0} 个中间件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃追踪</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracingStats?.activeTraces || 0}</div>
            <p className="text-xs text-muted-foreground">
              错误率: {((tracingStats?.errorRate || 0) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细信息标签页 */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">服务注册</TabsTrigger>
          <TabsTrigger value="gateway">API网关</TabsTrigger>
          <TabsTrigger value="tracing">分布式追踪</TabsTrigger>
          <TabsTrigger value="monitoring">监控告警</TabsTrigger>
        </TabsList>

        {/* 服务注册标签页 */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.health.status)}
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge variant={service.health.status === "available" ? "default" : "destructive"}>
                        {service.health.status}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedService(selectedService === service.name ? null : service.name)}
                    >
                      {selectedService === service.name ? "收起" : "详情"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">总实例</p>
                      <p className="text-lg font-semibold">{service.health.totalInstances}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">健康实例</p>
                      <p className="text-lg font-semibold text-green-600">{service.health.healthyInstances}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">不健康实例</p>
                      <p className="text-lg font-semibold text-red-600">{service.health.unhealthyInstances}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">健康率</p>
                      <p className="text-lg font-semibold">{(service.health.healthRatio * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>健康状态</span>
                      <span>{(service.health.healthRatio * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={service.health.healthRatio * 100} className="h-2" />
                  </div>

                  {selectedService === service.name && (
                    <div className="space-y-2">
                      <h4 className="font-medium">实例详情</h4>
                      <div className="grid gap-2">
                        {service.instances.map((instance: any) => (
                          <div key={instance.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(instance.status)}`} />
                              <span className="text-sm font-mono">
                                {instance.host}:{instance.port}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {instance.version}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">权重: {instance.weight}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* API网关标签页 */}
        <TabsContent value="gateway" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>网关统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">总路由数</p>
                    <p className="text-2xl font-bold">{gatewayStats?.totalRoutes || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">中间件数</p>
                    <p className="text-2xl font-bold">{gatewayStats?.totalMiddleware || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">熔断器数</p>
                    <p className="text-2xl font-bold">{gatewayStats?.circuitBreakers?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">限流器数</p>
                    <p className="text-2xl font-bold">{gatewayStats?.rateLimiters?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 熔断器状态 */}
            {gatewayStats?.circuitBreakers && gatewayStats.circuitBreakers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>熔断器状态</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {gatewayStats.circuitBreakers.map((cb: any) => (
                      <div key={cb.name} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(cb.state)}`} />
                          <span className="font-medium">{cb.name}</span>
                          <Badge variant={cb.state === "closed" ? "default" : "destructive"}>{cb.state}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">失败次数: {cb.failureCount}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 限流器状态 */}
            {gatewayStats?.rateLimiters && gatewayStats.rateLimiters.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>限流器状态</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {gatewayStats.rateLimiters.map((rl: any) => (
                      <div key={rl.path} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{rl.path}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          当前: {rl.currentRequests} / 总计: {rl.totalRequests}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* 分布式追踪标签页 */}
        <TabsContent value="tracing" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>追踪统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">活跃追踪</p>
                    <p className="text-2xl font-bold">{tracingStats?.activeTraces || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">已完成追踪</p>
                    <p className="text-2xl font-bold">{tracingStats?.completedTraces || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">错误追踪</p>
                    <p className="text-2xl font-bold text-red-600">{tracingStats?.errorTraces || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">总Span数</p>
                    <p className="text-2xl font-bold">{tracingStats?.totalSpans || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>性能指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">平均追踪时长</p>
                    <p className="text-lg font-semibold">
                      {tracingStats?.averageTraceDuration ? `${tracingStats.averageTraceDuration.toFixed(0)}ms` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">错误率</p>
                    <p className="text-lg font-semibold">
                      {tracingStats?.errorRate ? `${(tracingStats.errorRate * 100).toFixed(2)}%` : "0%"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">采样率</p>
                    <p className="text-lg font-semibold">
                      {tracingStats?.samplingRate ? `${(tracingStats.samplingRate * 100).toFixed(0)}%` : "100%"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 监控告警标签页 */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>系统监控</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>监控面板正在开发中...</p>
                <p className="text-sm">将集成Prometheus、Grafana和告警系统</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
