"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Activity, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Bell,
  Settings,
  User,
  Code,
  GitBranch,
  Database,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw
} from "lucide-react"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"
import { BrandButton } from "@/components/ui/brand-button"

interface Notification {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface Task {
  id: string
  title: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  estimatedTime?: string
}

interface RightPanelProps {
  collapsed?: boolean;
}

export default function RightPanel({ collapsed = false }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "notifications" | "tasks" | "assistant">("dashboard")
  const [realTimeData, setRealTimeData] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    activeUsers: 12,
    tasksCompleted: 8,
    deploymentsToday: 3,
    codeQualityScore: 85
  })

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "部署成功",
      message: "生产环境部署已完成",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false
    },
    {
      id: "2", 
      type: "warning",
      title: "性能警告",
      message: "API响应时间超过阈值",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      read: false
    },
    {
      id: "3",
      type: "info",
      title: "代码审查",
      message: "新的PR等待审查",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: true
    }
  ])

  const [currentTasks, setCurrentTasks] = useState<Task[]>([
    {
      id: "1",
      title: "代码构建",
      status: "running",
      progress: 75,
      estimatedTime: "2分钟"
    },
    {
      id: "2",
      title: "单元测试",
      status: "completed",
      progress: 100
    },
    {
      id: "3",
      title: "部署到测试环境",
      status: "pending",
      progress: 0,
      estimatedTime: "5分钟"
    }
  ])

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData((prev) => ({
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        activeUsers: Math.max(5, Math.min(25, prev.activeUsers + Math.floor((Math.random() - 0.5) * 4))),
        tasksCompleted: prev.tasksCompleted + (Math.random() > 0.8 ? 1 : 0),
        deploymentsToday: prev.deploymentsToday + (Math.random() > 0.9 ? 1 : 0),
        codeQualityScore: Math.max(70, Math.min(95, prev.codeQualityScore + (Math.random() - 0.5) * 2))
      }))

      // 模拟任务进度更新
      setCurrentTasks(prev => prev.map(task => {
        if (task.status === "running" && Math.random() > 0.7) {
          const newProgress = Math.min(100, task.progress + Math.random() * 15)
          return {
            ...task,
            progress: newProgress,
            status: newProgress >= 100 ? "completed" : "running"
          }
        }
        return task
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error": return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
      case "completed": return <CheckCircle className="h-3 w-3 text-green-500" />
      case "failed": return <XCircle className="h-3 w-3 text-red-500" />
      default: return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  const runningTasks = currentTasks.filter(task => task.status === "running").length

  const tabs = [
    { id: "dashboard", label: "仪表板", icon: Activity, badge: undefined },
    { id: "notifications", label: "通知", icon: Bell, badge: unreadNotifications },
    { id: "tasks", label: "任务", icon: Settings, badge: runningTasks > 0 ? runningTasks : undefined },
    { id: "assistant", label: "助手", icon: MessageSquare, badge: undefined },
  ] as const

  return (
    <div className={`h-full bg-white/90 backdrop-blur-md border-l border-gray-200/50 shadow-lg flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-80"}`}>
      {/* 标签页导航 */}
      <motion.div 
        animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
        className="flex border-b border-gray-200/50 overflow-hidden"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 p-3 text-xs font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-sky-blue bg-sky-blue/10"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center space-y-1">
                <div className="relative">
                  <Icon className="h-4 w-4" />
                  {tab.badge && tab.badge > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </div>
                  )}
                </div>
                <span>{tab.label}</span>
              </div>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-blue"
                />
              )}
            </motion.button>
          )
        })}
      </motion.div>

      {/* 内容区域 */}
      <motion.div 
        animate={{ 
          opacity: collapsed ? 0 : 1, 
          padding: collapsed ? 0 : "16px",
          height: collapsed ? 0 : "auto"
        }}
        className="flex-1 overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              {/* 系统状态概览 */}
              <BrandCard variant="glass" className="p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  系统状态
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">CPU使用率</span>
                      <span className="font-medium">{realTimeData.cpuUsage.toFixed(0)}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <motion.div
                        animate={{ width: `${realTimeData.cpuUsage}%` }}
                        className={`h-full rounded-full transition-colors duration-300 ${
                          realTimeData.cpuUsage > 70 ? "bg-red-500" : 
                          realTimeData.cpuUsage > 50 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">内存使用率</span>
                      <span className="font-medium">{realTimeData.memoryUsage.toFixed(0)}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <motion.div
                        animate={{ width: `${realTimeData.memoryUsage}%` }}
                        className={`h-full rounded-full transition-colors duration-300 ${
                          realTimeData.memoryUsage > 70 ? "bg-red-500" : 
                          realTimeData.memoryUsage > 50 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </BrandCard>

              {/* 今日统计 */}
              <div className="grid grid-cols-2 gap-3">
                <BrandCard variant="outlined" className="p-3 text-center">
                  <div className="w-8 h-8 bg-mint-green/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User className="h-4 w-4 text-mint-green" />
                  </div>
                  <div className="text-lg font-bold text-gray-800">{realTimeData.activeUsers}</div>
                  <div className="text-xs text-gray-600">在线用户</div>
                </BrandCard>

                <BrandCard variant="outlined" className="p-3 text-center">
                  <div className="w-8 h-8 bg-sky-blue/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-4 w-4 text-sky-blue" />
                  </div>
                  <div className="text-lg font-bold text-gray-800">{realTimeData.tasksCompleted}</div>
                  <div className="text-xs text-gray-600">完成任务</div>
                </BrandCard>

                <BrandCard variant="outlined" className="p-3 text-center">
                  <div className="w-8 h-8 bg-coral-pink/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-4 w-4 text-coral-pink" />
                  </div>
                  <div className="text-lg font-bold text-gray-800">{realTimeData.deploymentsToday}</div>
                  <div className="text-xs text-gray-600">今日部署</div>
                </BrandCard>

                <BrandCard variant="outlined" className="p-3 text-center">
                  <div className="w-8 h-8 bg-lemon-yellow/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-4 w-4 text-lemon-yellow" />
                  </div>
                  <div className="text-lg font-bold text-gray-800">{realTimeData.codeQualityScore.toFixed(0)}</div>
                  <div className="text-xs text-gray-600">代码质量</div>
                </BrandCard>
              </div>

              {/* 快速操作 */}
              <BrandCard variant="outlined" className="p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">快速操作</h4>
                <div className="space-y-2">
                  <BrandButton variant="outline" size="sm" className="w-full justify-start" icon={<Code className="h-3 w-3" />}>
                    生成代码
                  </BrandButton>
                  <BrandButton variant="outline" size="sm" className="w-full justify-start" icon={<GitBranch className="h-3 w-3" />}>
                    创建分支
                  </BrandButton>
                  <BrandButton variant="outline" size="sm" className="w-full justify-start" icon={<Database className="h-3 w-3" />}>
                    数据备份
                  </BrandButton>
                </div>
              </BrandCard>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800">通知中心</h4>
                <BrandButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                >
                  全部已读
                </BrandButton>
              </div>
              
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    notification.read 
                      ? "bg-gray-50 border-gray-200" 
                      : "bg-white border-sky-blue/30 shadow-sm"
                  }`}
                  onClick={() => setNotifications(prev => 
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                  )}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-medium text-gray-800 truncate">{notification.title}</h5>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-sky-blue rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "tasks" && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-3"
            >
              <h4 className="text-sm font-semibold text-gray-800">当前任务</h4>
              
              {currentTasks.map((task) => (
                <BrandCard key={task.id} variant="outlined" className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTaskStatusIcon(task.status)}
                      <h5 className="text-sm font-medium text-gray-800">{task.title}</h5>
                    </div>
                    <BrandBadge 
                      variant={
                        task.status === "completed" ? "success" :
                        task.status === "running" ? "info" :
                        task.status === "failed" ? "error" : "warning"
                      }
                      size="sm"
                    >
                      {task.status === "completed" ? "完成" :
                       task.status === "running" ? "运行中" :
                       task.status === "failed" ? "失败" : "等待"}
                    </BrandBadge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">进度</span>
                      <span className="font-medium">{task.progress}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <motion.div
                        animate={{ width: `${task.progress}%` }}
                        className="h-full bg-sky-blue rounded-full"
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    {task.estimatedTime && (
                      <div className="text-xs text-gray-500">
                        预计剩余: {task.estimatedTime}
                      </div>
                    )}
                  </div>
                </BrandCard>
              ))}
            </motion.div>
          )}

          {activeTab === "assistant" && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              <h4 className="text-sm font-semibold text-gray-800">AI助手建议</h4>
              
              <div className="space-y-3">
                <BrandCard variant="glass" className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-sky-blue to-mint-green rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-800 mb-1">代码优化建议</h5>
                      <p className="text-xs text-gray-600 mb-2">检测到可以优化的算法复杂度，建议使用更高效的数据结构。</p>
                      <BrandButton variant="outline" size="sm">查看详情</BrandButton>
                    </div>
                  </div>
                </BrandCard>

                <BrandCard variant="glass" className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-coral-pink to-lemon-yellow rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-800 mb-1">安全提醒</h5>
                      <p className="text-xs text-gray-600 mb-2">发现潜在的SQL注入风险，建议使用参数化查询。</p>
                      <BrandButton variant="outline" size="sm">立即修复</BrandButton>
                    </div>
                  </div>
                </BrandCard>

                <BrandCard variant="glass" className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-mint-green to-sky-blue rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-800 mb-1">性能优化</h5>
                      <p className="text-xs text-gray-600 mb-2">数据库查询响应时间较慢，建议添加索引优化。</p>
                      <BrandButton variant="outline" size="sm">优化</BrandButton>
                    </div>
                  </div>
                </BrandCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
