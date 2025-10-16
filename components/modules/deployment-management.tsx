"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Rocket, 
  Server, 
  Globe, 
  Shield, 
  Activity,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  GitBranch,
  Database,
  Cloud
} from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"

interface Environment {
  id: string
  name: string
  type: "development" | "staging" | "production"
  status: "healthy" | "warning" | "error" | "deploying"
  url: string
  lastDeployment: Date
  version: string
  services: Service[]
}

interface Service {
  id: string
  name: string
  status: "running" | "stopped" | "error"
  instances: number
  cpu: number
  memory: number
}

export default function DeploymentManagement() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("prod")
  const [activeTab, setActiveTab] = useState("overview")

  const environments: Environment[] = [
    {
      id: "prod",
      name: "生产环境",
      type: "production",
      status: "healthy",
      url: "https://app.example.com",
      lastDeployment: new Date(Date.now() - 1000 * 60 * 60 * 2),
      version: "v2.3.1",
      services: [
        { id: "web", name: "Web服务", status: "running", instances: 3, cpu: 45, memory: 65 },
        { id: "api", name: "API服务", status: "running", instances: 2, cpu: 30, memory: 50 },
        { id: "db", name: "数据库", status: "running", instances: 1, cpu: 20, memory: 40 }
      ]
    },
    {
      id: "staging",
      name: "预发布环境",
      type: "staging",
      status: "deploying",
      url: "https://staging.example.com",
      lastDeployment: new Date(),
      version: "v2.4.0-beta",
      services: [
        { id: "web", name: "Web服务", status: "running", instances: 1, cpu: 25, memory: 35 },
        { id: "api", name: "API服务", status: "error", instances: 1, cpu: 0, memory: 0 },
        { id: "db", name: "数据库", status: "running", instances: 1, cpu: 15, memory: 30 }
      ]
    },
    {
      id: "dev",
      name: "开发环境",
      type: "development",
      status: "warning",
      url: "https://dev.example.com",
      lastDeployment: new Date(Date.now() - 1000 * 60 * 60 * 24),
      version: "v2.4.0-dev",
      services: [
        { id: "web", name: "Web服务", status: "running", instances: 1, cpu: 60, memory: 80 },
        { id: "api", name: "API服务", status: "running", instances: 1, cpu: 40, memory: 55 },
        { id: "db", name: "数据库", status: "stopped", instances: 0, cpu: 0, memory: 0 }
      ]
    }
  ]

  const getEnvironmentIcon = (type: string) => {
    switch (type) {
      case "production": return <Server className="h-5 w-5" />
      case "staging": return <GitBranch className="h-5 w-5" />
      case "development": return <Settings className="h-5 w-5" />
      default: return <Server className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "deploying": return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "healthy": return "success"
      case "warning": return "warning"
      case "error": return "error"
      case "deploying": return "info"
      default: return "primary"
    }
  }

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case "running": return "text-green-600"
      case "stopped": return "text-gray-500"
      case "error": return "text-red-600"
      default: return "text-gray-500"
    }
  }

  const selectedEnv = environments.find(env => env.id === selectedEnvironment)

  const tabs = [
    { id: "overview", name: "概览", icon: <Activity className="h-4 w-4" /> },
    { id: "services", name: "服务", icon: <Server className="h-4 w-4" /> },
    { id: "logs", name: "日志", icon: <Eye className="h-4 w-4" /> }
  ]

  return (
    <div className="h-full">
      <BrandCard variant="glass" className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-mint-green/10 to-sky-blue/10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-mint-green to-sky-blue rounded-xl flex items-center justify-center shadow-glow">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">部署管理</h2>
                  <p className="text-gray-600">多环境部署与监控</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <BrandButton variant="outline" size="sm" icon={<GitBranch className="h-4 w-4" />}>
                  回滚
                </BrandButton>
                <BrandButton variant="gradient" size="sm" icon={<Rocket className="h-4 w-4" />}>
                  部署
                </BrandButton>
              </div>
            </motion.div>
          </div>

          {/* 环境选择器 */}
          <div className="px-6 pt-4">
            <div className="flex space-x-2">
              {environments.map((env) => (
                <motion.button
                  key={env.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEnvironment(env.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedEnvironment === env.id
                      ? "bg-white shadow-md border-2 border-mint-green"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {getEnvironmentIcon(env.type)}
                  <span className="font-medium text-gray-800">{env.name}</span>
                  {getStatusIcon(env.status)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 环境信息卡片 */}
          {selectedEnv && (
            <div className="px-6 pt-4">
              <BrandCard variant="outlined" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{selectedEnv.name}</h3>
                      <p className="text-sm text-gray-600">{selectedEnv.url}</p>
                    </div>
                    <BrandBadge variant={getStatusBadgeVariant(selectedEnv.status)}>
                      {selectedEnv.status === "healthy" ? "健康" : 
                       selectedEnv.status === "warning" ? "警告" :
                       selectedEnv.status === "error" ? "错误" : "部署中"}
                    </BrandBadge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">版本: {selectedEnv.version}</p>
                    <p className="text-xs text-gray-500">
                      最后部署: {selectedEnv.lastDeployment.toLocaleString()}
                    </p>
                  </div>
                </div>
              </BrandCard>
            </div>
          )}

          {/* 导航标签 */}
          <div className="px-6 pt-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-mint-green shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 p-6 overflow-auto">
            {activeTab === "overview" && selectedEnv && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 服务状态概览 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">服务状态</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedEnv.services.map((service) => (
                      <BrandCard key={service.id} variant="outlined" className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Database className="h-5 w-5 text-mint-green" />
                            <h4 className="font-medium text-gray-800">{service.name}</h4>
                          </div>
                          <BrandBadge 
                            variant={service.status === "running" ? "success" : service.status === "error" ? "error" : "warning"}
                            size="sm"
                          >
                            {service.status === "running" ? "运行中" : service.status === "error" ? "错误" : "已停止"}
                          </BrandBadge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">实例数</span>
                            <span className={getServiceStatusColor(service.status)}>{service.instances}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">CPU使用率</span>
                            <span className={getServiceStatusColor(service.status)}>{service.cpu}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">内存使用率</span>
                            <span className={getServiceStatusColor(service.status)}>{service.memory}%</span>
                          </div>
                        </div>
                      </BrandCard>
                    ))}
                  </div>
                </div>

                {/* 快速操作 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">快速操作</h3>
                  <div className="flex flex-wrap gap-3">
                    <BrandButton variant="outline" icon={<Play className="h-4 w-4" />}>
                      启动服务
                    </BrandButton>
                    <BrandButton variant="outline" icon={<Pause className="h-4 w-4" />}>
                      停止服务
                    </BrandButton>
                    <BrandButton variant="outline" icon={<RotateCcw className="h-4 w-4" />}>
                      重启服务
                    </BrandButton>
                    <BrandButton variant="outline" icon={<Settings className="h-4 w-4" />}>
                      配置管理
                    </BrandButton>
                    <BrandButton variant="outline" icon={<Eye className="h-4 w-4" />}>
                      查看日志
                    </BrandButton>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "services" && selectedEnv && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {selectedEnv.services.map((service) => (
                  <BrandCard key={service.id} variant="glass" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-mint-green to-sky-blue rounded-lg flex items-center justify-center">
                          <Database className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{service.name}</h4>
                          <p className="text-sm text-gray-600">实例数: {service.instances}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BrandBadge 
                          variant={service.status === "running" ? "success" : service.status === "error" ? "error" : "warning"}
                        >
                          {service.status === "running" ? "运行中" : service.status === "error" ? "错误" : "已停止"}
                        </BrandBadge>
                        <BrandButton variant="outline" size="sm" icon={<Settings className="h-3 w-3" />}>
                          管理
                        </BrandButton>
                      </div>
                    </div>

                    {/* 资源使用情况 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">CPU使用率</span>
                          <span className="font-medium">{service.cpu}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-mint-green h-2 rounded-full transition-all duration-300 cpu-bar"
                            data-width={Math.min(service.cpu, 100)}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">内存使用率</span>
                          <span className="font-medium">{service.memory}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-sky-blue h-2 rounded-full transition-all duration-300 memory-bar"
                            data-width={Math.min(service.memory, 100)}
                          />
                        </div>
                      </div>
                    </div>
                  </BrandCard>
                ))}
              </motion.div>
            )}

            {activeTab === "logs" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <BrandCard variant="outlined" className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">实时日志</h3>
                    <div className="flex space-x-2">
                      <BrandButton variant="outline" size="sm">
                        暂停
                      </BrandButton>
                      <BrandButton variant="outline" size="sm">
                        清除
                      </BrandButton>
                      <BrandButton variant="outline" size="sm">
                        下载
                      </BrandButton>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
                    <div className="font-mono text-sm space-y-1">
                      <div className="text-green-400">[2024-07-03 15:30:12] INFO: Application started successfully</div>
                      <div className="text-blue-400">[2024-07-03 15:30:13] DEBUG: Database connection established</div>
                      <div className="text-white">[2024-07-03 15:30:14] INFO: Server listening on port 3000</div>
                      <div className="text-yellow-400">[2024-07-03 15:30:15] WARN: High memory usage detected</div>
                      <div className="text-green-400">[2024-07-03 15:30:16] INFO: Health check passed</div>
                      <div className="text-white">[2024-07-03 15:30:17] INFO: Processing request GET /api/users</div>
                      <div className="text-red-400">[2024-07-03 15:30:18] ERROR: Database query timeout</div>
                      <div className="text-green-400">[2024-07-03 15:30:19] INFO: Request completed successfully</div>
                    </div>
                  </div>
                </BrandCard>
              </motion.div>
            )}
          </div>
        </div>
      </BrandCard>
    </div>
  )
}
