"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Server,
  Zap,
  Brain,
  Code2,
  Globe,
  Gauge,
  HardDrive,
  Clock,
  Star,
  TrendingUp,
  Settings,
  Play,
} from "lucide-react"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandBadge } from "@/components/ui/brand-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { localModelOptimizer, type LocalModel } from "@/lib/ai/local-model-optimizer"

export default function LocalModelDashboard() {
  const [models] = useState<LocalModel[]>(localModelOptimizer.getLocalModels())
  const [selectedModel, setSelectedModel] = useState<LocalModel | null>(null)
  const [isTestingModel, setIsTestingModel] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const resourceUsage = localModelOptimizer.getResourceUsage()
  const recommendations = localModelOptimizer.generateUsageRecommendations()

  // 测试模型响应
  const testModel = async (model: LocalModel) => {
    setIsTestingModel(model.name)

    try {
      const testPrompt =
        model.chineseSupport === "excellent"
          ? "用Python写一个简单的Hello World程序，添加中文注释"
          : "Write a simple Hello World program in Python"

      const startTime = Date.now()

      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model.name,
          prompt: testPrompt,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000),
      })

      const endTime = Date.now()
      const data = await response.json()

      if (response.ok && data.response) {
        setTestResults((prev) => ({
          ...prev,
          [model.name]: {
            success: true,
            responseTime: endTime - startTime,
            response: data.response.substring(0, 200) + "...",
            tokensPerSecond: data.eval_count ? (data.eval_count / (data.eval_duration / 1e9)).toFixed(1) : "N/A",
          },
        }))
      } else {
        throw new Error("模型响应失败")
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [model.name]: {
          success: false,
          error: error instanceof Error ? error.message : "测试失败",
        },
      }))
    } finally {
      setIsTestingModel(null)
    }
  }

  // 获取性能颜色
  const getPerformanceColor = (level: string) => {
    switch (level) {
      case "outstanding":
        return "text-purple-600"
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "basic":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  // 获取速度图标
  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case "fast":
        return <Zap className="h-4 w-4 text-green-500" />
      case "medium":
        return <Gauge className="h-4 w-4 text-yellow-500" />
      case "slow":
        return <Clock className="h-4 w-4 text-red-500" />
      default:
        return <Gauge className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="h-full">
      <BrandCard variant="glass" className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-cloud-blue-50 to-mint-green/10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-xl flex items-center justify-center shadow-glow">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">本地模型管理中心</h2>
                  <p className="text-gray-600">管理和优化您的 {models.length} 个本地AI模型</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-cloud-blue-600">{resourceUsage.totalSize.toFixed(1)} GB</div>
                  <div className="text-sm text-gray-500">总存储占用</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 主要内容 */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">概览</TabsTrigger>
                  <TabsTrigger value="models">模型列表</TabsTrigger>
                  <TabsTrigger value="recommendations">使用建议</TabsTrigger>
                  <TabsTrigger value="performance">性能测试</TabsTrigger>
                </TabsList>
              </div>

              {/* 概览标签页 */}
              <TabsContent value="overview" className="flex-1 p-6 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* 统计卡片 */}
                  <BrandCard variant="outlined" className="p-4">
                    <div className="flex items-center space-x-3">
                      <Server className="h-8 w-8 text-cloud-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{resourceUsage.totalModels}</div>
                        <div className="text-sm text-gray-500">已安装模型</div>
                      </div>
                    </div>
                  </BrandCard>

                  <BrandCard variant="outlined" className="p-4">
                    <div className="flex items-center space-x-3">
                      <HardDrive className="h-8 w-8 text-mint-green" />
                      <div>
                        <div className="text-2xl font-bold">{resourceUsage.totalSize.toFixed(1)}GB</div>
                        <div className="text-sm text-gray-500">存储占用</div>
                      </div>
                    </div>
                  </BrandCard>

                  <BrandCard variant="outlined" className="p-4">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-8 w-8 text-coral-pink" />
                      <div>
                        <div className="text-2xl font-bold">
                          {models.filter((m) => m.chineseSupport === "excellent").length}
                        </div>
                        <div className="text-sm text-gray-500">中文优化</div>
                      </div>
                    </div>
                  </BrandCard>

                  <BrandCard variant="outlined" className="p-4">
                    <div className="flex items-center space-x-3">
                      <Code2 className="h-8 w-8 text-lemon-yellow" />
                      <div>
                        <div className="text-2xl font-bold">
                          {models.filter((m) => m.codingAbility === "excellent").length}
                        </div>
                        <div className="text-sm text-gray-500">编程专家</div>
                      </div>
                    </div>
                  </BrandCard>
                </div>

                {/* 模型分类分布 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BrandCard variant="outlined" className="p-6">
                    <h3 className="text-lg font-semibold mb-4">模型分类分布</h3>
                    <div className="space-y-3">
                      {Object.entries(resourceUsage.categoryBreakdown).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {category === "large" && <Brain className="h-4 w-4 text-purple-500" />}
                            {category === "code" && <Code2 className="h-4 w-4 text-green-500" />}
                            {category === "chinese" && <Globe className="h-4 w-4 text-red-500" />}
                            {category === "general" && <Star className="h-4 w-4 text-blue-500" />}
                            <span className="capitalize">{category}</span>
                          </div>
                          <BrandBadge variant="outline">{count}个</BrandBadge>
                        </div>
                      ))}
                    </div>
                  </BrandCard>

                  <BrandCard variant="outlined" className="p-6">
                    <h3 className="text-lg font-semibold mb-4">推荐配置</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">主力模型</span>
                          <BrandBadge variant="default">{recommendations.primary.name}</BrandBadge>
                        </div>
                        <p className="text-xs text-gray-500">{recommendations.primary.recommendedFor[0]}</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">备用模型</span>
                          <BrandBadge variant="outline">{recommendations.secondary.name}</BrandBadge>
                        </div>
                        <p className="text-xs text-gray-500">{recommendations.secondary.recommendedFor[0]}</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">快速响应</span>
                          <BrandBadge variant="secondary">{recommendations.fast.name}</BrandBadge>
                        </div>
                        <p className="text-xs text-gray-500">{recommendations.fast.recommendedFor[0]}</p>
                      </div>
                    </div>
                  </BrandCard>
                </div>
              </TabsContent>

              {/* 模型列表标签页 */}
              <TabsContent value="models" className="flex-1 p-6 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {models.map((model) => (
                    <BrandCard
                      key={model.name}
                      variant="outlined"
                      className={`p-6 cursor-pointer transition-all hover:border-cloud-blue-300 ${
                        selectedModel?.name === model.name ? "border-cloud-blue-500 bg-cloud-blue-50" : ""
                      }`}
                      onClick={() => setSelectedModel(model)}
                    >
                      <div className="space-y-4">
                        {/* 模型头部信息 */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{model.name}</h3>
                            <p className="text-sm text-gray-500">
                              {model.size} • {model.modified}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getSpeedIcon(model.performance.speed)}
                            <BrandBadge variant="outline" size="sm">
                              {model.category}
                            </BrandBadge>
                          </div>
                        </div>

                        {/* 能力指标 */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">中文支持</div>
                            <div className={`text-sm font-medium ${getPerformanceColor(model.chineseSupport)}`}>
                              {model.chineseSupport}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">编程能力</div>
                            <div className={`text-sm font-medium ${getPerformanceColor(model.codingAbility)}`}>
                              {model.codingAbility}
                            </div>
                          </div>
                        </div>

                        {/* 推荐用途 */}
                        <div>
                          <div className="text-xs text-gray-500 mb-2">推荐用途</div>
                          <div className="flex flex-wrap gap-1">
                            {model.recommendedFor.slice(0, 3).map((use, index) => (
                              <BrandBadge key={index} variant="secondary" size="sm">
                                {use}
                              </BrandBadge>
                            ))}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex space-x-2">
                          <BrandButton
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              testModel(model)
                            }}
                            loading={isTestingModel === model.name}
                            icon={<Play className="h-3 w-3" />}
                          >
                            测试
                          </BrandButton>
                          <BrandButton variant="ghost" size="sm" icon={<Settings className="h-3 w-3" />}>
                            配置
                          </BrandButton>
                        </div>

                        {/* 测试结果 */}
                        {testResults[model.name] && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            {testResults[model.name].success ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-green-600">✅ 测试成功</span>
                                  <span className="text-gray-500">{testResults[model.name].responseTime}ms</span>
                                </div>
                                <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded">
                                  {testResults[model.name].response}
                                </div>
                                <div className="text-xs text-gray-500">
                                  速度: {testResults[model.name].tokensPerSecond} tokens/s
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-red-600">❌ {testResults[model.name].error}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </BrandCard>
                  ))}
                </div>
              </TabsContent>

              {/* 使用建议标签页 */}
              <TabsContent value="recommendations" className="flex-1 p-6 overflow-auto">
                <div className="space-y-6">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>基于您的模型配置，以下是优化使用建议</AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 任务推荐 */}
                    <BrandCard variant="outlined" className="p-6">
                      <h3 className="text-lg font-semibold mb-4">任务模型推荐</h3>
                      <div className="space-y-4">
                        {[
                          { task: "中文编程", models: localModelOptimizer.recommendModelForTask("chinese_coding") },
                          { task: "英文编程", models: localModelOptimizer.recommendModelForTask("english_coding") },
                          { task: "复杂推理", models: localModelOptimizer.recommendModelForTask("complex_reasoning") },
                          { task: "快速响应", models: localModelOptimizer.recommendModelForTask("fast_response") },
                        ].map(({ task, models }) => (
                          <div key={task}>
                            <div className="text-sm font-medium mb-2">{task}</div>
                            <div className="flex flex-wrap gap-1">
                              {models.slice(0, 3).map((model, index) => (
                                <BrandBadge key={model.name} variant={index === 0 ? "default" : "outline"} size="sm">
                                  {model.name}
                                </BrandBadge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </BrandCard>

                    {/* 使用技巧 */}
                    <BrandCard variant="outlined" className="p-6">
                      <h3 className="text-lg font-semibold mb-4">使用技巧</h3>
                      <div className="space-y-3">
                        {recommendations.tips.map((tip, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-cloud-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-sm text-gray-600">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </BrandCard>
                  </div>

                  {/* DeepStack配置建议 */}
                  <BrandCard variant="outlined" className="p-6">
                    <h3 className="text-lg font-semibold mb-4">DeepStack 配置建议</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">中文编程首选</h4>
                        <p className="text-sm text-green-600 mb-2">qwen2:72b</p>
                        <p className="text-xs text-green-500">最佳中文理解和代码生成能力</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">日常开发推荐</h4>
                        <p className="text-sm text-blue-600 mb-2">qwen2:latest</p>
                        <p className="text-xs text-blue-500">平衡性能和资源消耗</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-800 mb-2">代码专用</h4>
                        <p className="text-sm text-purple-600 mb-2">codellama:latest</p>
                        <p className="text-xs text-purple-500">专门的代码生成和优化</p>
                      </div>
                    </div>
                  </BrandCard>
                </div>
              </TabsContent>

              {/* 性能测试标签页 */}
              <TabsContent value="performance" className="flex-1 p-6 overflow-auto">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">模型性能测试</h3>
                    <BrandButton
                      variant="outline"
                      onClick={() => {
                        models.forEach((model) => testModel(model))
                      }}
                      loading={isTestingModel !== null}
                    >
                      批量测试
                    </BrandButton>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {models.map((model) => (
                      <BrandCard key={model.name} variant="outlined" className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="font-medium">{model.name}</h4>
                              <p className="text-sm text-gray-500">{model.size}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            {testResults[model.name] && testResults[model.name].success && (
                              <div className="text-right">
                                <div className="text-sm font-medium">{testResults[model.name].responseTime}ms</div>
                                <div className="text-xs text-gray-500">
                                  {testResults[model.name].tokensPerSecond} t/s
                                </div>
                              </div>
                            )}

                            <BrandButton
                              variant="ghost"
                              size="sm"
                              onClick={() => testModel(model)}
                              loading={isTestingModel === model.name}
                              icon={<Play className="h-3 w-3" />}
                            >
                              测试
                            </BrandButton>
                          </div>
                        </div>

                        {testResults[model.name] && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {testResults[model.name].success ? (
                              <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                                {testResults[model.name].response}
                              </div>
                            ) : (
                              <div className="text-sm text-red-600">错误: {testResults[model.name].error}</div>
                            )}
                          </div>
                        )}
                      </BrandCard>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BrandCard>
    </div>
  )
}
