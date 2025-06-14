"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database,
  Brain,
  BarChart3,
  Zap,
  Activity,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Cpu,
  Network,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Download,
  Search,
  RefreshCw,
} from "lucide-react"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandBadge } from "@/components/ui/brand-badge"
import { ollamaService } from "@/lib/ai/ollama-service"
import { streamProcessor } from "@/lib/data/stream-processor"
import { dataLakeManager } from "@/lib/data/data-lake"

export default function DataPlatformDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "models" | "streams" | "lake" | "analytics">("overview")
  const [ollamaModels, setOllamaModels] = useState<any[]>([])
  const [streamStats, setStreamStats] = useState<any>({})
  const [lakeStats, setLakeStats] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [realTimeData, setRealTimeData] = useState<any>({})

  // 初始化数据
  useEffect(() => {
    initializePlatform()
    const interval = setInterval(updateRealTimeData, 5000)
    return () => clearInterval(interval)
  }, [])

  const initializePlatform = async () => {
    try {
      setIsLoading(true)

      // 获取Ollama模型列表
      const models = await ollamaService.listModels()
      setOllamaModels(models)

      // 启动流处理系统
      streamProcessor.start()

      // 获取初始统计数据
      await updateStats()

      console.log("数据智能化平台初始化完成")
    } catch (error) {
      console.error("平台初始化失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStats = async () => {
    // 获取流处理统计
    const streamTopics = ["ai-model-usage", "user-events", "system-metrics", "code-generation"]
    const topicStats = {}
    streamTopics.forEach((topic) => {
      topicStats[topic] = streamProcessor.getTopicStats(topic)
    })
    setStreamStats(topicStats)

    // 获取数据湖统计
    const lakeTopics = ["ai_model_usage", "user_events", "code_generation", "system_metrics"]
    const tableStats = {}
    lakeTopics.forEach((table) => {
      tableStats[table] = dataLakeManager.getTableStats(table)
    })
    setLakeStats(tableStats)

    setLakeStats(tableStats)
  }

  const updateRealTimeData = async () => {
    // 模拟实时数据更新
    const newData = {
      activeModels: ollamaModels.filter((m) => Math.random() > 0.3).length,
      totalRequests: Math.floor(Math.random() * 1000) + 500,
      avgLatency: Math.floor(Math.random() * 500) + 200,
      successRate: 0.95 + Math.random() * 0.05,
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      networkIO: Math.floor(Math.random() * 1000),
    }
    setRealTimeData(newData)
    await updateStats()
  }

  const testOllamaModel = async (modelName: string) => {
    try {
      const result = await ollamaService.generateText(modelName, "你好，请简单介绍一下你自己。", { maxTokens: 100 })

      if (result.success) {
        // 发送使用日志到流处理系统
        const producer = streamProcessor.createProducer("test-producer")
        await streamProcessor.sendMessage(producer.id, "ai-model-usage", {
          key: `test-${modelName}`,
          value: {
            modelId: modelName,
            userId: "test-user",
            taskType: "test",
            tokens: result.tokens,
            latency: result.latency,
            success: true,
            timestamp: Date.now(),
          },
        })

        alert(`模型 ${modelName} 测试成功！\n响应: ${result.text?.substring(0, 100)}...`)
      } else {
        alert(`模型 ${modelName} 测试失败: ${result.error}`)
      }
    } catch (error) {
      alert(`测试失败: ${error}`)
    }
  }

  const executeQuery = async (sql: string) => {
    try {
      const result = await dataLakeManager.queryData(sql)
      if (result.success) {
        console.log("查询结果:", result)
        alert(`查询成功！返回 ${result.rowCount} 行数据`)
      } else {
        alert(`查询失败: ${result.error}`)
      }
    } catch (error) {
      alert(`查询执行失败: ${error}`)
    }
  }

  const tabs = [
    { id: "overview", name: "总览", icon: BarChart3 },
    { id: "models", name: "本地模型", icon: Brain },
    { id: "streams", name: "数据流", icon: Zap },
    { id: "lake", name: "数据湖", icon: Database },
    { id: "analytics", name: "智能分析", icon: TrendingUp },
  ]

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Sparkles className="h-12 w-12 text-cloud-blue-500" />
        </motion.div>
        <span className="ml-4 text-lg text-gray-600">初始化数据智能化平台...</span>
      </div>
    )
  }

  return (
    <div className="h-full">
      <BrandCard variant="glass" className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 头部标题区 */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-cloud-blue-50 to-mint-green/10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-xl flex items-center justify-center shadow-glow">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                    <span>数据智能化平台</span>
                    <Sparkles className="h-5 w-5 text-cloud-blue-500" />
                  </h2>
                  <p className="text-gray-600">实时数据流处理 · 数据湖建设 · 机器学习 · 商业智能</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* 实时状态指示器 */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">实时同步</span>
                </div>

                <BrandButton variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />}>
                  刷新
                </BrandButton>
              </div>
            </motion.div>
          </div>

          {/* 标签页导航 */}
          <div className="px-6 py-4 border-b border-gray-200/50">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-cloud-blue-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* 主要内容区 */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  {/* 总览仪表板 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* 活跃模型数 */}
                    <BrandCard variant="outlined" className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">活跃模型</p>
                          <p className="text-2xl font-bold text-gray-800">{realTimeData.activeModels || 0}</p>
                        </div>
                        <Brain className="h-8 w-8 text-cloud-blue-500" />
                      </div>
                      <div className="mt-2">
                        <BrandBadge variant="success" size="sm">
                          在线
                        </BrandBadge>
                      </div>
                    </BrandCard>

                    {/* 总请求数 */}
                    <BrandCard variant="outlined" className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">总请求数</p>
                          <p className="text-2xl font-bold text-gray-800">{realTimeData.totalRequests || 0}</p>
                        </div>
                        <Activity className="h-8 w-8 text-mint-green" />
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-green-600">↗ +12.5%</span>
                      </div>
                    </BrandCard>

                    {/* 平均延迟 */}
                    <BrandCard variant="outlined" className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">平均延迟</p>
                          <p className="text-2xl font-bold text-gray-800">{realTimeData.avgLatency || 0}ms</p>
                        </div>
                        <Clock className="h-8 w-8 text-lemon-yellow" />
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-green-600">↘ -5.2%</span>
                      </div>
                    </BrandCard>

                    {/* 成功率 */}
                    <BrandCard variant="outlined" className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">成功率</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {((realTimeData.successRate || 0) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="mt-2">
                        <BrandBadge variant="success" size="sm">
                          优秀
                        </BrandBadge>
                      </div>
                    </BrandCard>
                  </div>

                  {/* 系统资源监控 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <BrandCard variant="outlined" className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <Cpu className="h-5 w-5 text-cloud-blue-500" />
                        <span>系统资源</span>
                      </h3>
                      <div className="space-y-4">
                        {/* CPU使用率 */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">CPU使用率</span>
                            <span className="text-sm font-medium">{(realTimeData.cpuUsage || 0).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${realTimeData.cpuUsage || 0}%` }}
                              className="bg-cloud-blue-500 h-2 rounded-full"
                            />
                          </div>
                        </div>

                        {/* 内存使用率 */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">内存使用率</span>
                            <span className="text-sm font-medium">{(realTimeData.memoryUsage || 0).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${realTimeData.memoryUsage || 0}%` }}
                              className="bg-mint-green h-2 rounded-full"
                            />
                          </div>
                        </div>

                        {/* 磁盘使用率 */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">磁盘使用率</span>
                            <span className="text-sm font-medium">{(realTimeData.diskUsage || 0).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${realTimeData.diskUsage || 0}%` }}
                              className="bg-lemon-yellow h-2 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </BrandCard>

                    <BrandCard variant="outlined" className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <Network className="h-5 w-5 text-cloud-blue-500" />
                        <span>网络流量</span>
                      </h3>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-800 mb-2">
                            {realTimeData.networkIO || 0} MB/s
                          </div>
                          <p className="text-sm text-gray-600">实时网络IO</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">↓ 245 MB/s</div>
                            <div className="text-gray-600">入站流量</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">↑ 128 MB/s</div>
                            <div className="text-gray-600">出站流量</div>
                          </div>
                        </div>
                      </div>
                    </BrandCard>
                  </div>

                  {/* 快速操作 */}
                  <BrandCard variant="outlined" className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">快速操作</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <BrandButton
                        variant="outline"
                        className="h-20 flex-col space-y-2"
                        onClick={() => setActiveTab("models")}
                      >
                        <Brain className="h-6 w-6" />
                        <span>模型管理</span>
                      </BrandButton>
                      <BrandButton
                        variant="outline"
                        className="h-20 flex-col space-y-2"
                        onClick={() => setActiveTab("streams")}
                      >
                        <Zap className="h-6 w-6" />
                        <span>数据流</span>
                      </BrandButton>
                      <BrandButton
                        variant="outline"
                        className="h-20 flex-col space-y-2"
                        onClick={() => setActiveTab("lake")}
                      >
                        <Database className="h-6 w-6" />
                        <span>数据湖</span>
                      </BrandButton>
                      <BrandButton
                        variant="outline"
                        className="h-20 flex-col space-y-2"
                        onClick={() => setActiveTab("analytics")}
                      >
                        <TrendingUp className="h-6 w-6" />
                        <span>智能分析</span>
                      </BrandButton>
                    </div>
                  </BrandCard>
                </motion.div>
              )}

              {activeTab === "models" && (
                <motion.div
                  key="models"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  {/* 本地模型管理 */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Ollama本地模型</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {ollamaModels.map((model, index) => (
                        <motion.div
                          key={model.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <BrandCard variant="outlined" className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-800">{model.name}</h4>
                              <BrandBadge variant="success" size="sm">
                                可用
                              </BrandBadge>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                              <div className="flex justify-between">
                                <span>大小:</span>
                                <span>{(model.size / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
                              </div>
                              <div className="flex justify-between">
                                <span>更新时间:</span>
                                <span>{new Date(model.modified_at).toLocaleDateString()}</span>
                              </div>
                              {model.details && (
                                <div className="flex justify-between">
                                  <span>参数:</span>
                                  <span>{model.details.parameter_size}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex space-x-2">
                              <BrandButton
                                variant="primary"
                                size="sm"
                                className="flex-1"
                                onClick={() => testOllamaModel(model.name)}
                              >
                                测试
                              </BrandButton>
                              <BrandButton variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                              </BrandButton>
                            </div>
                          </BrandCard>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* 模型推荐 */}
                  <BrandCard variant="outlined" className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">智能推荐</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">代码生成任务</h4>
                        <p className="text-sm text-blue-600 mb-3">推荐使用 codellama:latest</p>
                        <BrandButton variant="outline" size="sm">
                          使用推荐
                        </BrandButton>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">对话聊天任务</h4>
                        <p className="text-sm text-green-600 mb-3">推荐使用 llama3:latest</p>
                        <BrandButton variant="outline" size="sm">
                          使用推荐
                        </BrandButton>
                      </div>
                    </div>
                  </BrandCard>
                </motion.div>
              )}

              {activeTab === "streams" && (
                <motion.div
                  key="streams"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  {/* 数据流管理 */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">实时数据流</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(streamStats).map(([topicName, stats]: [string, any]) => (
                        <BrandCard key={topicName} variant="outlined" className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">{topicName}</h4>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600">活跃</span>
                            </div>
                          </div>

                          {stats && (
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>消息数:</span>
                                <span>{stats.messageCount || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>分区数:</span>
                                <span>{stats.partitionCount || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>数据大小:</span>
                                <span>{((stats.bytesCount || 0) / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2 mt-4">
                            <BrandButton variant="outline" size="sm">
                              <Play className="h-4 w-4" />
                            </BrandButton>
                            <BrandButton variant="outline" size="sm">
                              <Pause className="h-4 w-4" />
                            </BrandButton>
                            <BrandButton variant="outline" size="sm">
                              <RotateCcw className="h-4 w-4" />
                            </BrandButton>
                          </div>
                        </BrandCard>
                      ))}
                    </div>
                  </div>

                  {/* 流处理器状态 */}
                  <BrandCard variant="outlined" className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">流处理器</h3>
                    <div className="space-y-4">
                      {["ai-usage-analyzer", "user-behavior-analyzer", "performance-monitor"].map((processor) => (
                        <div key={processor} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="font-medium text-gray-800">{processor}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">处理中: 1,234 条/秒</span>
                            <BrandBadge variant="success" size="sm">
                              运行中
                            </BrandBadge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </BrandCard>
                </motion.div>
              )}

              {activeTab === "lake" && (
                <motion.div
                  key="lake"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  {/* 数据湖管理 */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">数据湖表</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(lakeStats).map(([tableName, stats]: [string, any]) => (
                        <BrandCard key={tableName} variant="outlined" className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">{tableName}</h4>
                            <BrandBadge variant="info" size="sm">
                              v{stats?.version || 1}
                            </BrandBadge>
                          </div>

                          {stats && (
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                              <div className="flex justify-between">
                                <span>行数:</span>
                                <span>{stats.rowCount?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>大小:</span>
                                <span>{((stats.sizeBytes || 0) / (1024 * 1024)).toFixed(1)} MB</span>
                              </div>
                              <div className="flex justify-between">
                                <span>分区:</span>
                                <span>{stats.partitionCount || 0}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <BrandButton
                              variant="outline"
                              size="sm"
                              onClick={() => executeQuery(`SELECT * FROM ${tableName} LIMIT 10`)}
                            >
                              <Search className="h-4 w-4" />
                            </BrandButton>
                            <BrandButton variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </BrandButton>
                            <BrandButton variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </BrandButton>
                          </div>
                        </BrandCard>
                      ))}
                    </div>
                  </div>

                  {/* SQL查询界面 */}
                  <BrandCard variant="outlined" className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">SQL查询</h3>
                    <div className="space-y-4">
                      <textarea
                        className="w-full h-32 p-3 border border-gray-200 rounded-lg font-mono text-sm"
                        placeholder="输入SQL查询语句..."
                        defaultValue="SELECT model_id, COUNT(*) as usage_count, AVG(latency_ms) as avg_latency 
FROM ai_model_usage 
WHERE date >= '2024-01-01' 
GROUP BY model_id 
ORDER BY usage_count DESC 
LIMIT 10"
                      />
                      <div className="flex space-x-2">
                        <BrandButton variant="primary">
                          <Play className="h-4 w-4 mr-2" />
                          执行查询
                        </BrandButton>
                        <BrandButton variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          导出结果
                        </BrandButton>
                      </div>
                    </div>
                  </BrandCard>
                </motion.div>
              )}

              {activeTab === "analytics" && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  {/* 智能分析 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <BrandCard variant="outlined" className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">模型使用趋势</h3>
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center text-gray-500">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>图表组件加载中...</p>
                        </div>
                      </div>
                    </BrandCard>

                    <BrandCard variant="outlined" className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">用户行为分析</h3>
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>用户行为热力图</p>
                        </div>
                      </div>
                    </BrandCard>
                  </div>

                  {/* AI洞察 */}
                  <BrandCard variant="outlined" className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-cloud-blue-500" />
                      <span>AI智能洞察</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">性能优化建议</h4>
                        <p className="text-sm text-blue-600">检测到 qwen2:72b 模型响应时间较长，建议优化GPU内存分配</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">使用模式发现</h4>
                        <p className="text-sm text-green-600">代码生成任务在工作日14:00-16:00达到峰值</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">资源预警</h4>
                        <p className="text-sm text-yellow-600">预计在未来7天内磁盘使用率将达到85%</p>
                      </div>
                    </div>
                  </BrandCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </BrandCard>
    </div>
  )
}
