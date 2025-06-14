"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Cloud, Server, Users, Shield, BarChart3, Cpu, HardDrive, Network, Database } from "lucide-react"
import { aliyunServiceManager } from "@/lib/enterprise/aliyun-service-manager"
import { localServerManager } from "@/lib/enterprise/local-server-manager"
import { multiTenantManager } from "@/lib/enterprise/multi-tenant-manager"
import { enterpriseSupportService } from "@/lib/enterprise/enterprise-support-service"

export default function HybridCloudDashboard() {
  const [aliyunResources, setAliyunResources] = useState<any>(null)
  const [localServers, setLocalServers] = useState<any[]>([])
  const [tenantStats, setTenantStats] = useState<any>(null)
  const [supportStats, setSupportStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // 加载阿里云资源
      const [ecsInstances, rdsInstances, ossBuckets, slbInstances] = await Promise.all([
        aliyunServiceManager.listECSInstances(),
        aliyunServiceManager.listRDSInstances(),
        aliyunServiceManager.listOSSBuckets(),
        aliyunServiceManager.listSLBInstances(),
      ])

      const resourceUsage = await aliyunServiceManager.getResourceUsage()

      setAliyunResources({
        ecs: ecsInstances,
        rds: rdsInstances,
        oss: ossBuckets,
        slb: slbInstances,
        usage: resourceUsage,
      })

      // 加载本地服务器
      const servers = localServerManager.getServers()
      setLocalServers(servers)

      // 加载租户统计
      const tenantData = multiTenantManager.getTenantStats()
      setTenantStats(tenantData)

      // 加载支持统计
      const supportData = enterpriseSupportService.getSupportStats()
      setSupportStats(supportData)
    } catch (error) {
      console.error("加载仪表板数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载企业级混合云数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">阿里云资源</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aliyunResources
                ? aliyunResources.usage.ecs.total +
                  aliyunResources.usage.rds.total +
                  aliyunResources.usage.oss.total +
                  aliyunResources.usage.slb.total
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">ECS {aliyunResources?.usage.ecs.running || 0}台运行中</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本地服务器</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localServers.length}</div>
            <p className="text-xs text-muted-foreground">
              {localServers.filter((s) => s.status === "online").length}台在线
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃租户</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenantStats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">总计 {tenantStats?.total || 0} 个租户</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">支持工单</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportStats?.openTickets || 0}</div>
            <p className="text-xs text-muted-foreground">待处理工单</p>
          </CardContent>
        </Card>
      </div>

      {/* 详细信息标签页 */}
      <Tabs defaultValue="aliyun" className="space-y-4">
        <TabsList>
          <TabsTrigger value="aliyun">阿里云服务</TabsTrigger>
          <TabsTrigger value="local">本地服务器</TabsTrigger>
          <TabsTrigger value="tenants">多租户管理</TabsTrigger>
          <TabsTrigger value="support">企业支持</TabsTrigger>
        </TabsList>

        {/* 阿里云服务 */}
        <TabsContent value="aliyun" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ECS实例 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  ECS实例
                </CardTitle>
                <CardDescription>云服务器实例管理</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aliyunResources?.ecs.slice(0, 3).map((instance: any) => (
                    <div key={instance.instanceId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{instance.instanceName}</div>
                        <div className="text-sm text-muted-foreground">
                          {instance.instanceType} • {instance.cpu}核 {instance.memory}MB
                        </div>
                      </div>
                      <Badge variant={instance.status === "Running" ? "default" : "secondary"}>{instance.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* RDS数据库 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  RDS数据库
                </CardTitle>
                <CardDescription>云数据库实例管理</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aliyunResources?.rds.map((instance: any) => (
                    <div
                      key={instance.dbInstanceId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{instance.dbInstanceDescription}</div>
                        <div className="text-sm text-muted-foreground">
                          {instance.engine} {instance.engineVersion} • {instance.dbInstanceClass}
                        </div>
                      </div>
                      <Badge variant={instance.dbInstanceStatus === "Running" ? "default" : "secondary"}>
                        {instance.dbInstanceStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* OSS存储 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  OSS存储
                </CardTitle>
                <CardDescription>对象存储服务</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aliyunResources?.oss.map((bucket: any) => (
                    <div key={bucket.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{bucket.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {bucket.location} • {bucket.storageClass}
                        </div>
                      </div>
                      <Badge variant="outline">{bucket.acl}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SLB负载均衡 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  负载均衡
                </CardTitle>
                <CardDescription>SLB负载均衡实例</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aliyunResources?.slb.map((lb: any) => (
                    <div key={lb.loadBalancerId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{lb.loadBalancerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {lb.address} • {lb.bandwidth}Mbps
                        </div>
                      </div>
                      <Badge variant={lb.loadBalancerStatus === "active" ? "default" : "secondary"}>
                        {lb.loadBalancerStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 本地服务器 */}
        <TabsContent value="local" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {localServers.map((server) => (
              <Card key={server.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {server.name}
                    </span>
                    <Badge variant={server.status === "online" ? "default" : "secondary"}>{server.status}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {server.host} • {server.type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">CPU</div>
                        <div className="font-medium">{server.specs.cpu}核</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">内存</div>
                        <div className="font-medium">{Math.round(server.specs.memory / 1024)}GB</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">存储</div>
                        <div className="font-medium">{Math.round(server.specs.disk / 1024)}GB</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">网络</div>
                        <div className="font-medium">{server.specs.network}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">运行服务</div>
                      <div className="flex flex-wrap gap-1">
                        {server.services.slice(0, 4).map((service: string) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {server.services.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{server.services.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        监控
                      </Button>
                      <Button size="sm" variant="outline">
                        部署
                      </Button>
                      <Button size="sm" variant="outline">
                        终端
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 多租户管理 */}
        <TabsContent value="tenants" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 租户统计 */}
            <Card>
              <CardHeader>
                <CardTitle>租户概览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>总租户数</span>
                    <span className="font-medium">{tenantStats?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>活跃租户</span>
                    <span className="font-medium text-green-600">{tenantStats?.active || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>暂停租户</span>
                    <span className="font-medium text-orange-600">{tenantStats?.suspended || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>总用户数</span>
                    <span className="font-medium">{tenantStats?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>总项目数</span>
                    <span className="font-medium">{tenantStats?.totalProjects || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 计划分布 */}
            <Card>
              <CardHeader>
                <CardTitle>订阅计划分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>基础版</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(tenantStats?.byPlan?.basic / tenantStats?.total) * 100 || 0} className="w-16" />
                      <span className="text-sm font-medium">{tenantStats?.byPlan?.basic || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>专业版</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(tenantStats?.byPlan?.professional / tenantStats?.total) * 100 || 0}
                        className="w-16"
                      />
                      <span className="text-sm font-medium">{tenantStats?.byPlan?.professional || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>企业版</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(tenantStats?.byPlan?.enterprise / tenantStats?.total) * 100 || 0}
                        className="w-16"
                      />
                      <span className="text-sm font-medium">{tenantStats?.byPlan?.enterprise || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 资源使用 */}
            <Card>
              <CardHeader>
                <CardTitle>资源使用情况</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>存储使用</span>
                      <span>{Math.round((tenantStats?.totalStorage || 0) / 1024)}GB</span>
                    </div>
                    <Progress value={Math.min((tenantStats?.totalStorage || 0) / 10240, 100)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>API调用</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>AI请求</span>
                      <span>62%</span>
                    </div>
                    <Progress value={62} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 企业支持 */}
        <TabsContent value="support" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 工单统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  工单统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{supportStats?.openTickets || 0}</div>
                    <div className="text-sm text-muted-foreground">待处理</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{supportStats?.resolvedTickets || 0}</div>
                    <div className="text-sm text-muted-foreground">已解决</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{Math.round(supportStats?.avgResolutionTime || 0)}h</div>
                    <div className="text-sm text-muted-foreground">平均解决时间</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{supportStats?.avgCustomerRating?.toFixed(1) || "0.0"}</div>
                    <div className="text-sm text-muted-foreground">客户满意度</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 支持代理状态 */}
            <Card>
              <CardHeader>
                <CardTitle>支持代理状态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supportStats?.agentStats?.map((agent: any) => (
                    <div key={agent.agentId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {agent.resolvedTickets}/{agent.totalTickets} 已解决 • 评分 {agent.rating}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={agent.status === "available" ? "default" : "secondary"}>{agent.status}</Badge>
                        <div className="text-sm text-muted-foreground mt-1">工作负载: {agent.currentWorkload}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 知识库统计 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  知识库统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{supportStats?.knowledgeBaseStats?.totalArticles || 0}</div>
                    <div className="text-sm text-muted-foreground">知识库文章</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{supportStats?.knowledgeBaseStats?.totalViews || 0}</div>
                    <div className="text-sm text-muted-foreground">总浏览量</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {Math.round(supportStats?.knowledgeBaseStats?.avgHelpfulRating || 0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">有用率</div>
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
