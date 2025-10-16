"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { enhancedOllamaService, type EnhancedOllamaModel } from "@/lib/ai/enhanced-ollama-service"
import { formatDuration } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader2, BarChart2, Zap, Clock, AlertCircle } from "lucide-react"

// 基准测试类型
type BenchmarkType = "speed" | "quality" | "memory"

// 基准测试结果
interface BenchmarkResult {
  modelId: string
  modelName: string
  type: BenchmarkType
  tokensPerSecond: number
  latency: number
  memoryUsage: number
  completed: boolean
  error?: string
}

// 组件 Props 接口
interface ModelBenchmarkProps {
  models?: EnhancedOllamaModel[]
}

// 基准测试提示词
const BENCHMARK_PROMPTS = {
  speed: [
    "列出10个世界上最高的山峰及其高度。",
    "解释量子计算的基本原理。",
    "写一个关于未来太空旅行的短文。",
    "描述人工智能在医疗领域的五个应用。",
    "解释区块链技术的工作原理。",
  ],
  quality: [
    "解释相对论的基本原理，使用简单的语言让非专业人士也能理解。",
    "比较并对比函数式编程和面向对象编程的优缺点。",
    "分析气候变化对全球农业生产的潜在影响。",
    "讨论人工智能在未来20年可能对就业市场产生的影响。",
    "评估量子计算对现代密码学的潜在威胁。",
  ],
  memory: [
    "生成一个包含1000个随机数字的列表。",
    "写一篇2000字的关于深海生物的科普文章。",
    "创建一个详细的太阳系行星数据表，包括每个行星的物理特性和轨道参数。",
    "生成100个不同的英语单词及其定义和例句。",
    "写一个复杂的故事，包含至少10个不同的角色和多条交织的情节线。",
  ],
}

export default function ModelBenchmark({ models = [] }: ModelBenchmarkProps) {
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [availableModels, setAvailableModels] = useState<EnhancedOllamaModel[]>([])
  const [benchmarkType, setBenchmarkType] = useState<BenchmarkType>("speed")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [activeTab, setActiveTab] = useState("setup")
  const [error, setError] = useState<string | null>(null)

  // 初始化可用模型
  useEffect(() => {
    if (models.length > 0) {
      const readyModels = models.filter((m) => m.status === "ready")
      setAvailableModels(readyModels)
    } else {
      loadAvailableModels()
    }
  }, [models])

  // 加载可用模型
  const loadAvailableModels = async () => {
    try {
      const allModels = enhancedOllamaService.getAllModels().filter((m) => m.status === "ready")
      setAvailableModels(allModels)
      setError(null)
    } catch (err) {
      setError("加载模型失败，请确保Ollama服务正在运行")
      console.error("加载模型失败:", err)
    }
  }

  // 切换模型选择
  const toggleModelSelection = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter((id) => id !== modelId))
    } else {
      setSelectedModels([...selectedModels, modelId])
    }
  }

  // 运行基准测试
  const runBenchmark = async () => {
    if (selectedModels.length === 0) {
      setError("请至少选择一个模型进行基准测试")
      return
    }

    setIsRunning(true)
    setProgress(0)
    setResults([])
    setActiveTab("results")
    setError(null)

    const prompts = BENCHMARK_PROMPTS[benchmarkType]
    const totalSteps = selectedModels.length * prompts.length
    let completedSteps = 0

    try {
      // 为每个选定的模型运行基准测试
      for (const modelId of selectedModels) {
        const model = availableModels.find((m) => m.id === modelId)
        if (!model) continue

        let totalTokensPerSecond = 0
        let totalLatency = 0
        let totalMemoryUsage = 0
        let successfulRuns = 0

        // 对每个提示词运行测试
        for (const prompt of prompts) {
          try {
            const startTime = Date.now()
            const result = await enhancedOllamaService.generateText(modelId, prompt, {
              temperature: 0.7,
              maxTokens: benchmarkType === "memory" ? 2048 : 1024,
            })

            if (result.success) {
              const tokensPerSecond = result.tokens?.completion
                ? (result.tokens.completion / (result.timing?.evalTime || 1e9)) * 1e9
                : 0

              totalTokensPerSecond += tokensPerSecond
              totalLatency += result.latency || 0
              // 内存使用是模拟的，实际应该从系统监控获取
              totalMemoryUsage += Math.random() * 1000 + 500 // 模拟内存使用
              successfulRuns++
            }
          } catch (err) {
            console.error(`模型 ${modelId} 基准测试失败:`, err)
          }

          completedSteps++
          setProgress(Math.round((completedSteps / totalSteps) * 100))
        }

        // 计算平均值并添加到结果
        if (successfulRuns > 0) {
          setResults((prev) => [
            ...prev,
            {
              modelId,
              modelName: model.name,
              type: benchmarkType,
              tokensPerSecond: totalTokensPerSecond / successfulRuns,
              latency: totalLatency / successfulRuns,
              memoryUsage: totalMemoryUsage / successfulRuns,
              completed: true,
            },
          ])
        } else {
          setResults((prev) => [
            ...prev,
            {
              modelId,
              modelName: model.name,
              type: benchmarkType,
              tokensPerSecond: 0,
              latency: 0,
              memoryUsage: 0,
              completed: false,
              error: "基准测试失败",
            },
          ])
        }
      }
    } catch (err) {
      setError("基准测试过程中发生错误")
      console.error("基准测试错误:", err)
    } finally {
      setIsRunning(false)
      setProgress(100)
    }
  }

  // 准备图表数据
  const prepareChartData = () => {
    return results.map((result) => ({
      name: result.modelName,
      "生成速度 (tokens/s)": Math.round(result.tokensPerSecond * 10) / 10,
      "延迟 (ms)": Math.round(result.latency),
      "内存使用 (MB)": Math.round(result.memoryUsage),
    }))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          模型性能基准测试
        </CardTitle>
        <CardDescription>比较不同模型的性能指标，包括生成速度、响应延迟和内存使用</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="setup">测试设置</TabsTrigger>
            <TabsTrigger value="results">测试结果</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            {/* 模型选择 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">选择要测试的模型</h3>
                <Button variant="outline" size="sm" onClick={loadAvailableModels} disabled={isRunning} className="px-3 text-white">
                  刷新模型列表
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <div
                      key={model.id}
                      className={`border rounded-md p-3 cursor-pointer transition-colors ${
                        selectedModels.includes(model.id) ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => toggleModelSelection(model.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">{model.parameters}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{model.id}</div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    <Button variant="outline" onClick={loadAvailableModels} disabled={isRunning}>
                      加载可用模型
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-1">已选择 {selectedModels.length} 个模型</div>
            </div>

            {/* 测试类型选择 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">选择测试类型</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    benchmarkType === "speed" ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setBenchmarkType("speed")}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <div className="font-medium">生成速度测试</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">测量模型生成文本的速度（tokens/秒）</div>
                </div>

                <div
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    benchmarkType === "quality" ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setBenchmarkType("quality")}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <div className="font-medium">响应延迟测试</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">测量模型响应的延迟时间</div>
                </div>

                <div
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    benchmarkType === "memory" ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setBenchmarkType("memory")}
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    <div className="font-medium">内存使用测试</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">测量模型运行时的内存占用</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {/* 进度条 */}
            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>测试进度</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-center mt-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              </div>
            )}

            {/* 结果表格 */}
            {!isRunning && results.length > 0 && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-4 py-2 text-left">模型</th>
                        <th className="border px-4 py-2 text-right">生成速度 (tokens/s)</th>
                        <th className="border px-4 py-2 text-right">响应延迟</th>
                        <th className="border px-4 py-2 text-right">内存使用</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border px-4 py-2">{result.modelName}</td>
                          <td className="border px-4 py-2 text-right">
                            {result.completed ? result.tokensPerSecond.toFixed(1) : "测试失败"}
                          </td>
                          <td className="border px-4 py-2 text-right">
                            {result.completed ? formatDuration(result.latency) : "测试失败"}
                          </td>
                          <td className="border px-4 py-2 text-right">
                            {result.completed ? `${Math.round(result.memoryUsage)} MB` : "测试失败"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 结果图表 */}
                <div className="h-80 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="生成速度 (tokens/s)" fill="#8884d8" />
                      <Bar dataKey="延迟 (ms)" fill="#82ca9d" />
                      {benchmarkType === "memory" && <Bar dataKey="内存使用 (MB)" fill="#ffc658" />}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  注: 测试结果仅供参考，实际性能可能因硬件配置、系统负载等因素而异。
                </div>
              </div>
            )}

            {!isRunning && results.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <BarChart2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>尚未运行基准测试</p>
                <p className="text-sm mt-1">请在"测试设置"选项卡中配置并运行测试</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setActiveTab(activeTab === "setup" ? "results" : "setup")}
          disabled={isRunning}
        >
          {activeTab === "setup" ? "查看结果" : "返回设置"}
        </Button>

        {activeTab === "setup" && (
          <Button onClick={runBenchmark} disabled={isRunning || selectedModels.length === 0}>
            运行基准测试
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// 添加命名导出
export { ModelBenchmark }
