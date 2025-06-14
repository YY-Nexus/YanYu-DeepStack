"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, MessageSquare, Clock, TrendingUp } from "lucide-react"

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<"tasks" | "logs" | "assistant" | "analytics">("tasks")
  const [realTimeData, setRealTimeData] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    activeUsers: 12,
    tasksCompleted: 8,
  })

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData((prev) => ({
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        activeUsers: Math.max(5, Math.min(25, prev.activeUsers + Math.floor((Math.random() - 0.5) * 4))),
        tasksCompleted: prev.tasksCompleted + (Math.random() > 0.7 ? 1 : 0),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: "tasks", label: "任务", icon: Activity },
    { id: "logs", label: "日志", icon: Clock },
    { id: "assistant", label: "助手", icon: MessageSquare },
    { id: "analytics", label: "分析", icon: TrendingUp },
  ] as const

  return (
    <div className="h-full bg-white/90 backdrop-blur-md border-l border-gray-200/50 shadow-lg flex flex-col">
      {/* 标签页导航 */}
      <div className="flex border-b border-gray-200/50">
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
              <Icon className="h-4 w-4 mx-auto mb-1" />
              <div>{tab.label}</div>
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-blue" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full p-4"
          >
            {activeTab === "tasks" && <TasksPanel realTimeData={realTimeData} />}
            {activeTab === "logs" && <LogsPanel />}
            {activeTab === "assistant" && <AssistantPanel />}
            {activeTab === "analytics" && <AnalyticsPanel realTimeData={realTimeData} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// 任务面板组件
function TasksPanel({ realTimeData }: { realTimeData: any }) {
  const tasks = [
    { name: "AI代码生成", progress: 75, status: "running", color: "coral-pink" },
    { name: "质量检测", progress: 45, status: "running", color: "mint-green" },
    { name: "部署准备", progress: 20, status: "pending", color: "sky-blue" },
    { name: "文档生成", progress: 100, status: "completed", color: "lemon-yellow" },
  ]

  return (
    <div className="space-y-4">
      {/* 系统状态 */}
      <div className="bg-gradient-to-r from-sky-blue/10 to-mint-green/10 p-3 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">系统状态</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>CPU: {realTimeData.cpuUsage.toFixed(0)}%</div>
          <div>内存: {realTimeData.memoryUsage.toFixed(0)}%</div>
          <div>用户: {realTimeData.activeUsers}</div>
          <div>完成: {realTimeData.tasksCompleted}</div>
        </div>
      </div>

      {/* 任务列表 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">当前任务</h4>
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <motion.div
              key={task.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">{task.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : task.status === "running"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {task.status === "completed" ? "已完成" : task.status === "running" ? "进行中" : "等待中"}
                </span>
              </div>
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  className={`h-full bg-${task.color} rounded-full`}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{task.progress}% 完成</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 日志面板组件
function LogsPanel() {
  const [logs] = useState([
    { time: "12:34:56", level: "info", message: "系统启动完成" },
    { time: "12:35:02", level: "info", message: "加载AI模型中..." },
    { time: "12:35:08", level: "warning", message: "内存使用率较高" },
    { time: "12:35:15", level: "success", message: "代码生成完成" },
    { time: "12:35:22", level: "error", message: "网络连接超时" },
    { time: "12:35:30", level: "info", message: "准备就绪" },
  ])

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      case "success":
        return "text-green-600"
      default:
        return "text-blue-600"
    }
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-3">实时日志</h4>
      <div className="bg-gray-900 rounded-lg p-3 h-80 overflow-y-auto text-xs font-mono">
        {logs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`mb-1 ${getLevelColor(log.level)}`}
          >
            <span className="text-gray-400">[{log.time}]</span> {log.message}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// AI助手面板组件
function AssistantPanel() {
  const suggestions = [
    { icon: "💡", title: "性能优化", desc: "建议优化代码结构，提升性能表现" },
    { icon: "🔧", title: "代码重构", desc: "检测到重复代码，建议进行重构" },
    { icon: "🚀", title: "部署建议", desc: "推荐使用CDN加速静态资源加载" },
    { icon: "📊", title: "数据分析", desc: "用户行为数据显示异常，需要关注" },
  ]

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700">AI智能建议</h4>
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={suggestion.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gradient-to-r from-sky-blue/5 to-mint-green/5 p-3 rounded-lg border border-sky-blue/20 hover-lift cursor-pointer"
        >
          <div className="flex items-start space-x-3">
            <span className="text-lg">{suggestion.icon}</span>
            <div className="flex-1">
              <h5 className="text-sm font-medium text-gray-800 mb-1">{suggestion.title}</h5>
              <p className="text-xs text-gray-600">{suggestion.desc}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// 分析面板组件
function AnalyticsPanel({ realTimeData }: { realTimeData: any }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700">实时分析</h4>

      {/* 性能指标 */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <h5 className="text-sm font-medium text-gray-800 mb-2">性能指标</h5>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">CPU使用率</span>
            <span className="text-xs font-medium">{realTimeData.cpuUsage.toFixed(0)}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-1.5">
            <motion.div
              animate={{ width: `${realTimeData.cpuUsage}%` }}
              className="h-full bg-coral-pink rounded-full"
            />
          </div>
        </div>
      </div>

      {/* 用户活动 */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <h5 className="text-sm font-medium text-gray-800 mb-2">用户活动</h5>
        <div className="text-2xl font-bold text-mint-green">{realTimeData.activeUsers}</div>
        <div className="text-xs text-gray-600">当前在线用户</div>
      </div>

      {/* 任务统计 */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <h5 className="text-sm font-medium text-gray-800 mb-2">任务统计</h5>
        <div className="text-2xl font-bold text-sky-blue">{realTimeData.tasksCompleted}</div>
        <div className="text-xs text-gray-600">今日完成任务</div>
      </div>
    </div>
  )
}
