"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Zap, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  GitBranch,
  Server,
  Database,
  Globe
} from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"

interface AutomationTask {
  id: string
  name: string
  type: "build" | "deploy" | "test" | "backup"
  status: "running" | "completed" | "failed" | "pending"
  schedule: string
  lastRun?: Date
  nextRun?: Date
  duration?: string
}

interface Pipeline {
  id: string
  name: string
  tasks: AutomationTask[]
  status: "active" | "paused" | "stopped"
  progress: number
}

export default function AutomationProduction() {
  const [activeTab, setActiveTab] = useState("pipelines")
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null)

  const pipelines: Pipeline[] = [
    {
      id: "1",
      name: "前端应用部署",
      status: "active",
      progress: 75,
      tasks: [
        {
          id: "1-1",
          name: "代码构建",
          type: "build",
          status: "completed",
          schedule: "每次推送",
          lastRun: new Date(Date.now() - 1000 * 60 * 10),
          duration: "2分钟"
        },
        {
          id: "1-2", 
          name: "运行测试",
          type: "test",
          status: "running",
          schedule: "每次推送",
          lastRun: new Date(),
          duration: "5分钟"
        },
        {
          id: "1-3",
          name: "部署到生产",
          type: "deploy",
          status: "pending",
          schedule: "每次推送",
          nextRun: new Date(Date.now() + 1000 * 60 * 5)
        }
      ]
    },
    {
      id: "2",
      name: "数据库备份",
      status: "active",
      progress: 100,
      tasks: [
        {
          id: "2-1",
          name: "创建备份",
          type: "backup",
          status: "completed",
          schedule: "每天 02:00",
          lastRun: new Date(Date.now() - 1000 * 60 * 60 * 6),
          duration: "15分钟"
        }
      ]
    },
    {
      id: "3",
      name: "API服务部署",
      status: "paused",
      progress: 0,
      tasks: [
        {
          id: "3-1",
          name: "代码构建",
          type: "build",
          status: "pending",
          schedule: "手动触发"
        },
        {
          id: "3-2",
          name: "部署到测试环境",
          type: "deploy", 
          status: "pending",
          schedule: "手动触发"
        }
      ]
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />
      case "pending": return <Clock className="h-4 w-4 text-gray-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "build": return <Settings className="h-4 w-4" />
      case "deploy": return <Server className="h-4 w-4" />
      case "test": return <CheckCircle className="h-4 w-4" />
      case "backup": return <Database className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "running": return "info"
      case "completed": return "success"
      case "failed": return "error"
      case "pending": return "warning"
      default: return "primary"
    }
  }

  const tabs = [
    { id: "pipelines", name: "流水线", icon: <GitBranch className="h-4 w-4" /> },
    { id: "tasks", name: "任务", icon: <Settings className="h-4 w-4" /> },
    { id: "schedule", name: "调度", icon: <Clock className="h-4 w-4" /> }
  ]

  return (
    <div className="h-full">
      <BrandCard variant="glass" className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-lemon-yellow/10 to-coral-pink/10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-lemon-yellow to-coral-pink rounded-xl flex items-center justify-center shadow-glow">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">自动化生产</h2>
                  <p className="text-gray-600">CI/CD流水线与任务调度</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <BrandButton variant="outline" size="sm" icon={<Plus className="h-4 w-4" />}>
                  新建流水线
                </BrandButton>
                <BrandButton variant="gradient" size="sm" icon={<Play className="h-4 w-4" />}>
                  全部运行
                </BrandButton>
              </div>
            </motion.div>
          </div>

          {/* 导航标签 */}
          <div className="px-6 pt-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-lemon-yellow shadow-sm"
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
            {activeTab === "pipelines" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {pipelines.map((pipeline) => (
                  <BrandCard 
                    key={pipeline.id} 
                    variant="outlined" 
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedPipeline(pipeline.id === selectedPipeline ? null : pipeline.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-lemon-yellow to-coral-pink rounded-lg flex items-center justify-center">
                          <GitBranch className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{pipeline.name}</h3>
                          <p className="text-sm text-gray-600">{pipeline.tasks.length} 个任务</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BrandBadge 
                          variant={pipeline.status === "active" ? "success" : pipeline.status === "paused" ? "warning" : "error"}
                        >
                          {pipeline.status === "active" ? "运行中" : pipeline.status === "paused" ? "已暂停" : "已停止"}
                        </BrandBadge>
                        <div className="flex space-x-1">
                          <BrandButton variant="outline" size="sm" icon={<Play className="h-3 w-3" />}>
                            运行
                          </BrandButton>
                          <BrandButton variant="outline" size="sm" icon={<Pause className="h-3 w-3" />}>
                            暂停
                          </BrandButton>
                          <BrandButton variant="outline" size="sm" icon={<Settings className="h-3 w-3" />}>
                            设置
                          </BrandButton>
                        </div>
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>执行进度</span>
                        <span>{pipeline.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pipeline.progress}%` }}
                          transition={{ duration: 1 }}
                          className="bg-gradient-to-r from-lemon-yellow to-coral-pink h-2 rounded-full"
                        />
                      </div>
                    </div>

                    {/* 任务列表 */}
                    {selectedPipeline === pipeline.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2 pt-4 border-t border-gray-200"
                      >
                        {pipeline.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getTaskIcon(task.type)}
                              <div>
                                <p className="font-medium text-gray-800">{task.name}</p>
                                <p className="text-xs text-gray-600">{task.schedule}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {task.duration && (
                                <span className="text-xs text-gray-500">{task.duration}</span>
                              )}
                              <BrandBadge variant={getStatusBadgeVariant(task.status)} size="sm">
                                {task.status === "running" ? "运行中" : 
                                 task.status === "completed" ? "已完成" :
                                 task.status === "failed" ? "失败" : "等待中"}
                              </BrandBadge>
                              {getStatusIcon(task.status)}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </BrandCard>
                ))}
              </motion.div>
            )}

            {activeTab === "tasks" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">任务管理</h3>
                <p className="text-gray-600 mb-4">统一管理所有自动化任务</p>
                <BrandButton variant="gradient" icon={<Plus className="h-4 w-4" />}>
                  创建任务
                </BrandButton>
              </motion.div>
            )}

            {activeTab === "schedule" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">调度管理</h3>
                <p className="text-gray-600 mb-4">配置任务的执行时间和触发条件</p>
                <BrandButton variant="gradient" icon={<Plus className="h-4 w-4" />}>
                  添加调度
                </BrandButton>
              </motion.div>
            )}
          </div>
        </div>
      </BrandCard>
    </div>
  )
}
