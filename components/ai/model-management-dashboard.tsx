"use client"

import { useState } from "react"
import { useModelManagement } from "@/lib/ai/model-management-center"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Download, Trash2, RefreshCw, Check, AlertCircle, Clock, Code, MessageSquare, ImageIcon } from "lucide-react"
import { formatBytes } from "@/lib/utils"

export default function ModelManagementDashboard() {
  const { models, tasks, stats, loading, refreshModels, downloadModel, deleteModel, getModelsByType } =
    useModelManagement()

  const [activeTab, setActiveTab] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 处理刷新
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshModels()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // 处理下载
  const handleDownload = async (modelId: string) => {
    await downloadModel(modelId)
  }

  // 处理删除
  const handleDelete = async (modelId: string) => {
    if (confirm(`确定要删除模型 ${modelId} 吗？`)) {
      await deleteModel(modelId)
    }
  }

  // 获取当前标签页的模型
  const getFilteredModels = () => {
    switch (activeTab) {
      case "chat":
        return getModelsByType("chat")
      case "code":
        return getModelsByType("code")
      case "multimodal":
        return getModelsByType("multimodal")
      case "downloaded":
        return models.filter((model) => model.status === "ready")
      default:
        return models
    }
  }

  // 获取模型状态图标
  const getModelStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <Check className="h-4 w-4 text-green-500" />
      case "downloading":
        return <Download className="h-4 w-4 text-blue-500 animate-pulse" />
      case "not_downloaded":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "download_failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  // 获取模型类型图标
  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case "chat":
        return <MessageSquare className="h-4 w-4" />
      case "code":
        return <Code className="h-4 w-4" />
      case "multimodal":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  // 获取模型状态文本
  const getModelStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return "已就绪"
      case "downloading":
        return "下载中"
      case "not_downloaded":
        return "未下载"
      case "download_failed":
        return "下载失败"
      default:
        return "未知状态"
    }
  }

  // 获取模型类型文本
  const getModelTypeText = (type: string) => {
    switch (type) {
      case "chat":
        return "对话"
      case "code":
        return "代码"
      case "multimodal":
        return "多模态"
      default:
        return "未知"
    }
  }

  // 获取下载任务
  const getDownloadTask = (modelId: string) => {
    return tasks.find(
      (task) =>
        task.modelId === modelId && task.type === "download" && ["pending", "downloading"].includes(task.status),
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI模型管理中心</h1>
          <p className="text-gray-500">管理本地和云端AI模型</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">模型总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500 mt-1">
                {stats.ready} 个可用 / {stats.downloading} 个下载中
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">模型类型</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  对话 {stats.byType.chat}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  代码 {stats.byType.code}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  多模态 {stats.byType.multimodal}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">模型提供商</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Badge variant="outline">Ollama {stats.byProvider.ollama}</Badge>
                <Badge variant="outline">OpenAI {stats.byProvider.openai}</Badge>
                <Badge variant="outline">Anthropic {stats.byProvider.anthropic}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">存储空间</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
              <div className="text-sm text-gray-500 mt-1">本地模型总大小</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 模型列表 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">全部模型</TabsTrigger>
          <TabsTrigger value="chat">对话模型</TabsTrigger>
          <TabsTrigger value="code">代码模型</TabsTrigger>
          <TabsTrigger value="multimodal">多模态模型</TabsTrigger>
          <TabsTrigger value="downloaded">已下载</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredModels().map((model) => {
                const downloadTask = getDownloadTask(model.id)

                return (
                  <Card key={model.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getModelTypeIcon(model.type)}
                            {model.name}
                          </CardTitle>
                          <CardDescription>{model.id}</CardDescription>
                        </div>
                        <Badge
                          variant={model.status === "ready" ? "default" : "outline"}
                          className="flex items-center gap-1"
                        >
                          {getModelStatusIcon(model.status)}
                          {getModelStatusText(model.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">类型:</span> {getModelTypeText(model.type)}
                        </div>
                        <div>
                          <span className="text-gray-500">参数量:</span> {model.parameters}
                        </div>
                        <div>
                          <span className="text-gray-500">量化:</span> {model.quantization}
                        </div>
                        <div>
                          <span className="text-gray-500">大小:</span> {model.size ? formatBytes(model.size) : "未知"}
                        </div>
                      </div>

                      {downloadTask && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>下载进度</span>
                            <span>{downloadTask.progress}%</span>
                          </div>
                          <Progress value={downloadTask.progress} className="h-2" />
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-2">
                      {model.status === "ready" ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-auto"
                          onClick={() => handleDelete(model.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          删除
                        </Button>
                      ) : model.status === "downloading" ? (
                        <Button variant="outline" size="sm" className="ml-auto" disabled>
                          <Download className="h-4 w-4 mr-1 animate-pulse" />
                          下载中
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          className="ml-auto"
                          onClick={() => handleDownload(model.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          下载
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}

          {!loading && getFilteredModels().length === 0 && (
            <div className="flex flex-col items-center justify-center h-64">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium">没有找到模型</h3>
              <p className="text-gray-500">当前分类下没有可用的模型</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
