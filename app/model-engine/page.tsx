'use client'
import React, { useState, useEffect } from "react"
import { useModelManagement } from "@/lib/ai/model-management-center"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, RefreshCw, ChevronDown, Settings, Star, Download, Delete, CheckCircle, Clock, Zap, Cpu, Database, Lock, Unlock, Loader2, Sparkles, Copy, AlertCircle } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

// 模型参数接口
interface ModelParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
  isProxyEnabled: boolean;
  proxyUrl: string;
}

// 初始默认参数
const defaultParameters: ModelParameters = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.95,
  systemPrompt: "你是一个有用的AI助手，请根据用户的问题提供准确、详细的回答。",
  isProxyEnabled: false,
  proxyUrl: "http://localhost:8080/proxy",
}

export default function ModelEnginePage() {
  const { models, refreshModels, downloadModel, deleteModel } = useModelManagement() || {}
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("discovery")
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [expandedModel, setExpandedModel] = useState<string | null>(null)
  const [modelParameters, setModelParameters] = useState<Record<string, ModelParameters>>({})
  const [favorites, setFavorites] = useState<string[]>([])

  // 加载收藏的模型
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteModels')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // 保存收藏到本地存储
  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites)
    localStorage.setItem('favoriteModels', JSON.stringify(newFavorites))
  }

  // 切换收藏状态
  const toggleFavorite = (modelId: string) => {
    if (favorites.includes(modelId)) {
      saveFavorites(favorites.filter(id => id !== modelId))
    } else {
      saveFavorites([...favorites, modelId])
    }
  }

  // 初始化模型参数
  useEffect(() => {
    if (models) {
      const newParams: Record<string, ModelParameters> = { ...modelParameters }
      models.forEach(model => {
        if (!newParams[model.id]) {
          const savedParams = localStorage.getItem(`modelParams_${model.id}`)
          newParams[model.id] = savedParams ? JSON.parse(savedParams) : { ...defaultParameters }
        }
      })
      setModelParameters(newParams)
    }
  }, [models])

  // 保存模型参数
  const saveParameters = (modelId: string, params: ModelParameters) => {
    const newParams = { ...modelParameters, [modelId]: params }
    setModelParameters(newParams)
    localStorage.setItem(`modelParams_${modelId}`, JSON.stringify(params))
  }

  // 刷新模型列表
  const handleRefresh = async () => {
    if (refreshModels) {
      setIsRefreshing(true)
      await refreshModels()
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  // 下载模型
  const handleDownloadModel = async (modelId: string) => {
    if (downloadModel) {
        try {
          setDownloadingModels(prev => new Set(prev).add(modelId));
          setDownloadProgress(prev => ({ ...prev, [modelId]: 0 }));
          setDownloadStatus(prev => ({ ...prev, [modelId]: '开始下载...' }));
          
          // 直接调用downloadModel函数，不传递额外参数
          await downloadModel(modelId);
          
          // 模拟进度更新（在实际API调用中可能不会有）
          const simulateProgress = async () => {
            for (let progress = 10; progress <= 100; progress += 10) {
              setDownloadProgress(prev => ({ ...prev, [modelId]: progress }));
              setDownloadStatus(prev => ({ ...prev, [modelId]: `下载中... ${progress}%` }));
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          };
          
          // 启动模拟进度（仅用于UI演示）
          simulateProgress();
        } catch (error) {
          console.error('下载模型失败:', error);
          setDownloadStatus(prev => ({ ...prev, [modelId]: `下载失败: ${error instanceof Error ? error.message : '未知错误'}` }));
        } finally {
          // 下载完成或失败后更新状态
          setTimeout(() => {
            setDownloadingModels(prev => {
              const newSet = new Set(prev);
              newSet.delete(modelId);
              return newSet;
            });
          }, 1000);
        }
      }
  }

  // 删除模型
  const handleDeleteModel = async (modelId: string) => {
    if (deleteModel && confirm(`确定要删除模型 ${modelId} 吗？`)) {
      try {
        await deleteModel(modelId);
        // 清除相关下载状态
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[modelId];
          return newProgress;
        });
        setDownloadStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[modelId];
          return newStatus;
        });
      } catch (error) {
        console.error('删除模型失败:', error);
      }
    }
  }

  // 获取模型热度（基于使用次数）
  const getModelHeatLevel = (model: any): number => {
    const usageCount = model.usageCount || 0
    if (usageCount === 0) return 0
    if (usageCount < 5) return 1
    if (usageCount < 20) return 2
    if (usageCount < 50) return 3
    return 4
  }

  // 复制文本到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // 复制成功提示
      console.log('文本已复制到剪贴板:', text);
    }).catch(err => {
      console.error('复制失败:', err);
    });
  };

  // 渲染热度指示器
  const renderHeatIndicator = (model: any) => {
    const level = getModelHeatLevel(model)
    return (
      <div className="flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-orange-500" /> {/* 替换为Sparkles图标 */}
        <div className="flex">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1.5 w-4 rounded-full ${i < level ? 'bg-orange-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
  )
}
  // 下载进度状态
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [downloadStatus, setDownloadStatus] = useState<Record<string, string>>({});
  const [downloadingModels, setDownloadingModels] = useState<Set<string>>(new Set());

  // 渲染模型卡片
  const renderModelCard = (model: any) => {
    const isExpanded = expandedModel === model.id
    const isFavorite = favorites.includes(model.id)
    const params = modelParameters[model.id] || defaultParameters
    const isReady = model.status === 'ready'
    const isDownloading = downloadingModels.has(model.id) || model.status === 'downloading'

    return (
      <Card key={model.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardContent className="p-0">
          <div className="p-4">
            {/* 模型状态指示器 */}
            <div className="flex items-center gap-2 mb-2">
              {isReady ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  已就绪
                </span>
              ) : isDownloading ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Download className="h-3 w-3 mr-1 animate-pulse" />
                  下载中 ({downloadProgress[model.id] || 0}%)
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  未就绪
                </span>
              )}
              {isFavorite && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  收藏
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    {model.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleFavorite(model.id)}
                    >
                      <Star
                        className={`h-4 w-4 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                      />
                    </Button>
                  </h3>
                  {renderHeatIndicator(model)}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <div className="relative">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full flex items-center gap-1">
                      {model.id}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1 hover:bg-gray-200"
                        onClick={() => copyToClipboard(model.id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full">{model.type}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full">{model.provider}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setExpandedModel(isExpanded ? null : model.id)}
              >
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </Button>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              {model.parameters && (
                <div className="flex items-center gap-1">
                  <Database className="h-3.5 w-3.5" />
                  <span>{model.parameters}</span>
                </div>
              )}
              {model.quantization && (
                <div className="flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>{model.quantization}</span>
                </div>
              )}
              {model.lastUsed && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>最近使用: {new Date(model.lastUsed).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
            
            {/* 底部常驻操作按钮区域 */}
            <div className="p-3 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {model.tags && model.tags.length > 0 && (
                    model.tags.slice(0, 3).map((tag: any, index: number) => (
                      <span key={index} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                        {tag}
                      </span>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  {!isReady && !isDownloading && downloadModel !== undefined && (
                    <Button
                      size="sm"
                      onClick={() => handleDownloadModel(model.id)}
                      className="gap-1 h-8 px-3 text-white sm:flex items-center justify-center"
                    >
                      <Download className="h-3.5 w-3.5 text-white" />
                      <span className="hidden sm:inline">下载</span>
                    </Button>
                  )}
                  {isReady && deleteModel !== undefined && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteModel(model.id)}
                      className="gap-1 h-8 px-3"
                    >
                      <Delete className="h-3.5 w-3.5" />
                      删除
                    </Button>
                  )}
                </div>
              </div>
            </div>

          {isExpanded && (
            <div className="border-t">
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    模型参数设置
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">温度 (Temperature)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Slider
                          value={[params.temperature]}
                          min={0}
                          max={2}
                          step={0.1}
                          className="flex-1"
                          onValueChange={(value) => saveParameters(model.id, { ...params, temperature: value[0] })}
                        />
                        <span className="text-sm min-w-[3rem]">{params.temperature.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">最大令牌数</Label>
                      <Input
                        type="number"
                        value={params.maxTokens}
                        onChange={(e) => saveParameters(model.id, { ...params, maxTokens: parseInt(e.target.value) || 2048 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Top P</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Slider
                          value={[params.topP]}
                          min={0}
                          max={1}
                          step={0.01}
                          className="flex-1"
                          onValueChange={(value) => saveParameters(model.id, { ...params, topP: value[0] })}
                        />
                        <span className="text-sm min-w-[3rem]">{params.topP.toFixed(2)}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">代理模式</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Switch
                          checked={params.isProxyEnabled}
                          onCheckedChange={(checked) => saveParameters(model.id, { ...params, isProxyEnabled: checked })}
                        />
                        <Label>{params.isProxyEnabled ? '已启用' : '已禁用'}</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">系统提示词</Label>
                  <Textarea
                    value={params.systemPrompt}
                    onChange={(e) => saveParameters(model.id, { ...params, systemPrompt: e.target.value })}
                    placeholder="输入系统提示词..."
                    className="mt-1 h-24"
                  />
                </div>

                {params.isProxyEnabled && (
                  <div>
                    <Label className="text-xs text-gray-500">代理地址</Label>
                    <Input
                      value={params.proxyUrl}
                      onChange={(e) => saveParameters(model.id, { ...params, proxyUrl: e.target.value })}
                      placeholder="代理服务器地址"
                      className="mt-1"
                    />
                  </div>
                )}

                <Separator />

                {/* 下载进度条 */}
                {isDownloading && (
                  <div className="mb-4">
                    <Label className="text-xs text-gray-500 block mb-1">下载进度</Label>
                    <Progress 
                      value={downloadProgress[model.id] || 0}
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {downloadProgress[model.id] || 0}% - {downloadStatus[model.id] || '准备中...'}
                    </p>
                  </div>
                )}
              
              <div className="flex justify-end gap-2">
                  {!isReady && !isDownloading && downloadModel !== undefined && (
                    <Button
                      onClick={() => handleDownloadModel(model.id)}
                      className="gap-2 text-white sm:flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 text-white" />
                      <span className="hidden sm:inline">下载模型</span>
                    </Button>
                  )}
                  {isReady && deleteModel !== undefined && (
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteModel(model.id)}
                      className="gap-2"
                    >
                      <Delete className="h-4 w-4" />
                      删除模型
                    </Button>
                  )}
                  {isDownloading && (
                      <Button
                        variant="secondary"
                        disabled
                        className="gap-2"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        下载中...
                      </Button>
                    )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 获取收藏的模型
  const favoriteModels = models?.filter(model => favorites.includes(model.id)) || []

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="h-8 w-8 p-0 rounded-full">
            <ChevronDown className="h-5 w-5 rotate-90" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-blue-500" />
              本地模型引擎
            </h1>
            <p className="text-gray-500">发现、调用和优化本地AI模型</p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing || !refreshModels} variant="default" className="px-3 text-white">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          刷新模型列表
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList>
          <TabsTrigger value="discovery">模型发现</TabsTrigger>
          <TabsTrigger value="favorites">收藏模型 ({favorites.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="discovery">
          <div className="grid grid-cols-1 gap-4">
            {models && models.length > 0 ? (
              models.map(model => renderModelCard(model))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">暂无模型，请点击刷新按钮获取模型列表</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid grid-cols-1 gap-4">
            {favoriteModels.length > 0 ? (
              favoriteModels.map(model => renderModelCard(model))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">暂无收藏的模型，点击模型卡片上的星标图标添加收藏</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}