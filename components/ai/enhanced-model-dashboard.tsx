"use client"

import { useState, useEffect } from "react"
import {
  enhancedOllamaService,
  type EnhancedOllamaModel,
  type DownloadTask,
  type ModelStatistics,
} from "@/lib/ai/enhanced-ollama-service"
import {
  Download,
  Check,
  AlertCircle,
  Clock,
  Code,
  MessageSquare,
  Activity,
  HardDrive,
  Trash2,
  Play,
  RefreshCw,
  Search,
  Eye,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ModelPreviewModal } from "./model-preview-modal"
import { ModelSearchFilters, type ModelFilters } from "./model-search-filters"
import { ModelBenchmark } from "./model-benchmark"

export default function EnhancedModelDashboard() {
  const [models, setModels] = useState<EnhancedOllamaModel[]>([])
  const [downloads, setDownloads] = useState<DownloadTask[]>([])
  const [stats, setStats] = useState<ModelStatistics | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "reconnecting">(
    "disconnected",
  )
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [previewModel, setPreviewModel] = useState<EnhancedOllamaModel | null>(null)
  const [showBenchmark, setShowBenchmark] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [filters, setFilters] = useState<ModelFilters>({
    search: "",
    types: [],
    status: [],
    parameters: [],
    quantization: [],
  })

  useEffect(() => {
    // 初始化数据
    loadData()

    // 监听服务事件
    const handleServiceReady = () => {
      console.log("🎉 Enhanced Ollama服务就绪")
      loadData()
    }

    const handleConnectionEstablished = () => {
      setConnectionStatus("connected")
    }

    const handleConnectionLost = () => {
      setConnectionStatus("disconnected")
    }

    const handleModelUpdated = (model: EnhancedOllamaModel) => {
      setModels((prev) => prev.map((m) => (m.id === model.id ? model : m)))
    }

    const handleDownloadProgress = (progress: any) => {
      console.log(`📥 下载进度: ${progress.modelId} - ${progress.progress}%`)
    }

    const handleDownloadCompleted = (task: DownloadTask) => {
      console.log(`✅ 下载完成: ${task.modelId}`)
      loadData()
    }

    const handleDownloadFailed = (task: DownloadTask) => {
      console.error(`❌ 下载失败: ${task.modelId} - ${task.error}`)
      loadData()
    }

    // 注册事件监听器
    enhancedOllamaService.on("service:ready", handleServiceReady)
    enhancedOllamaService.on("connection:established", handleConnectionEstablished)
    enhancedOllamaService.on("connection:lost", handleConnectionLost)
    enhancedOllamaService.on("model:updated", handleModelUpdated)
    enhancedOllamaService.on("download:progress", handleDownloadProgress)
    enhancedOllamaService.on("download:completed", handleDownloadCompleted)
    enhancedOllamaService.on("download:failed", handleDownloadFailed)

    // 定期刷新数据
    const interval = setInterval(loadData, 5000)

    return () => {
      // 清理事件监听器
      enhancedOllamaService.off("service:ready", handleServiceReady)
      enhancedOllamaService.off("connection:established", handleConnectionEstablished)
      enhancedOllamaService.off("connection:lost", handleConnectionLost)
      enhancedOllamaService.off("model:updated", handleModelUpdated)
      enhancedOllamaService.off("download:progress", handleDownloadProgress)
      enhancedOllamaService.off("download:completed", handleDownloadCompleted)
      enhancedOllamaService.off("download:failed", handleDownloadFailed)

      clearInterval(interval)
    }
  }, [])

  const loadData = async () => {
    try {
      const allModels = enhancedOllamaService.getAllModels()
      const activeDownloads = enhancedOllamaService.getActiveDownloads()
      const queuedDownloads = enhancedOllamaService.getDownloadQueue()
      const statistics = enhancedOllamaService.getModelStatistics()
      const status = enhancedOllamaService.getConnectionStatus()

      setModels(allModels)
      setDownloads([...activeDownloads, ...queuedDownloads])
      setStats(statistics)
      setConnectionStatus(status)
      setLoading(false)
    } catch (error) {
      console.error("加载数据失败:", error)
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleDownload = async (modelId: string) => {
    try {
      await enhancedOllamaService.downloadModel(modelId)
    } catch (error) {
      console.error("下载模型失败:", error)
    }
  }

  const handleDelete = async (modelId: string) => {
    if (confirm(`确定要删除模型 ${modelId} 吗？`)) {
      try {
        await enhancedOllamaService.deleteModel(modelId)
        await loadData()
      } catch (error) {
        console.error("删除模型失败:", error)
      }
    }
  }

  const handlePreview = (model: EnhancedOllamaModel) => {
    setPreviewModel(model)
  }

  const getFilteredModels = () => {
    let filteredModels = models

    // 根据标签过滤
    if (activeTab === "ready") {
      filteredModels = filteredModels.filter((m) => m.status === "ready")
    } else if (activeTab === "downloading") {
      filteredModels = filteredModels.filter((m) => ["downloading", "queued"].includes(m.status))
    } else if (activeTab === "chat") {
      filteredModels = filteredModels.filter((m) => m.type === "chat")
    } else if (activeTab === "code") {
      filteredModels = filteredModels.filter((m) => m.type === "code")
    } else if (activeTab === "multimodal") {
      filteredModels = filteredModels.filter((m) => m.type === "multimodal")
    }

    // 应用搜索过滤器
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredModels = filteredModels.filter(
        (m) => m.name.toLowerCase().includes(searchLower) || m.id.toLowerCase().includes(searchLower),
      )
    }

    // 应用类型过滤器
    if (filters.types.length > 0) {
      filteredModels = filteredModels.filter((m) => filters.types.includes(m.type))
    }

    // 应用状态过滤器
    if (filters.status.length > 0) {
      filteredModels = filteredModels.filter((m) => filters.status.includes(m.status))
    }

    // 应用参数过滤器
    if (filters.parameters.length > 0) {
      filteredModels = filteredModels.filter((m) => filters.parameters.includes(m.parameters))
    }

    // 应用量化过滤器
    if (filters.quantization.length > 0) {
      filteredModels = filteredModels.filter((m) => filters.quantization.includes(m.quantization))
    }

    return filteredModels
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <Check className="h-4 w-4 text-green-500" />
      case "busy":
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case "downloading":
        return <Download className="h-4 w-4 text-blue-500 animate-bounce" />
      case "queued":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "not_downloaded":
        return <HardDrive className="h-4 w-4 text-gray-500" />
      case "download_failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      ready: "就绪",
      busy: "使用中",
      downloading: "下载中",
      queued: "队列中",
      not_downloaded: "未下载",
      download_failed: "下载失败",
    }
    return statusMap[status] || "未知"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "chat":
        return <MessageSquare className="h-4 w-4" />
      case "code":
        return <Code className="h-4 w-4" />
      case "multimodal":
        return <Eye className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      chat: "对话",
      code: "代码",
      multimodal: "多模态",
      embedding: "嵌入",
    }
    return typeMap[type] || type
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500"
      case "reconnecting":
        return "text-yellow-500"
      default:
        return "text-red-500"
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "已连接"
      case "reconnecting":
        return "重连中"
      default:
        return "未连接"
    }
  }

  const filteredModels = getFilteredModels()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载模型数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">增强模型管理</h2>
          <Badge variant="outline" className={getConnectionStatusColor()}>
            <Activity className="h-3 w-3 mr-1" />
            {getConnectionStatusText()}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowBenchmark(true)}>
            <Activity className="h-4 w-4 mr-2" />
            性能测试
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总模型数</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalModels}</div>
              <p className="text-xs text-muted-foreground">已下载 {stats.downloadedModels} 个</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">就绪模型</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.readyModels}</div>
              <p className="text-xs text-muted-foreground">可立即使用</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">下载中</CardTitle>
              <Download className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.downloadingModels}</div>
              <p className="text-xs text-muted-foreground">正在下载</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">存储使用</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
              <p className="text-xs text-muted-foreground">磁盘占用</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和过滤器 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索模型..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
        <ModelSearchFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">全部 ({models.length})</TabsTrigger>
          <TabsTrigger value="ready">就绪 ({models.filter((m) => m.status === "ready").length})</TabsTrigger>
          <TabsTrigger value="downloading">
            下载中 ({models.filter((m) => ["downloading", "queued"].includes(m.status)).length})
          </TabsTrigger>
          <TabsTrigger value="chat">对话 ({models.filter((m) => m.type === "chat").length})</TabsTrigger>
          <TabsTrigger value="code">代码 ({models.filter((m) => m.type === "code").length})</TabsTrigger>
          <TabsTrigger value="multimodal">多模态 ({models.filter((m) => m.type === "multimodal").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* 模型列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <Card key={model.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(model.type)}
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(model.status)}
                      <Badge variant="secondary" className="text-xs">
                        {getStatusText(model.status)}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">{model.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 模型信息 */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">类型:</span>
                      <span className="ml-1">{getTypeText(model.type)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">参数:</span>
                      <span className="ml-1">{model.parameters}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">量化:</span>
                      <span className="ml-1">{model.quantization}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">大小:</span>
                      <span className="ml-1">{formatFileSize(model.size)}</span>
                    </div>
                  </div>

                  {/* 下载进度 */}
                  {model.status === "downloading" && model.downloadProgress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>下载进度</span>
                        <span>{model.downloadProgress}%</span>
                      </div>
                      <Progress value={model.downloadProgress} className="h-2" />
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreview(model)}>
                        <Eye className="h-3 w-3 mr-1" />
                        预览
                      </Button>
                      {model.status === "ready" && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedModel(model.id)}>
                          <Play className="h-3 w-3 mr-1" />
                          使用
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {model.status === "not_downloaded" && (
                        <Button variant="default" size="sm" onClick={() => handleDownload(model.id)}>
                          <Download className="h-3 w-3 mr-1" />
                          下载
                        </Button>
                      )}
                      {model.status === "ready" && (
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(model.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 空状态 */}
          {filteredModels.length === 0 && (
            <div className="text-center py-12">
              <HardDrive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">没有找到模型</h3>
              <p className="text-muted-foreground">尝试调整搜索条件或过滤器</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 模型预览弹窗 */}
      {previewModel && (
        <ModelPreviewModal
          model={previewModel}
          open={!!previewModel}
          onOpenChange={(open) => !open && setPreviewModel(null)}
        />
      )}

      {/* 性能测试弹窗 */}
      {showBenchmark && (
        <Dialog open={showBenchmark} onOpenChange={setShowBenchmark}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>模型性能测试</DialogTitle>
              <DialogDescription>测试不同模型的推理性能和质量</DialogDescription>
            </DialogHeader>
            <ModelBenchmark models={models.filter((m) => m.status === "ready")} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
