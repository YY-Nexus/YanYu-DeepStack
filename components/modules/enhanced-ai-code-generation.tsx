"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Code, Sparkles, History, Zap, ArrowRight, Lightbulb } from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ModelSelector from "@/components/ai/model-selector"
import CodeGenerationSettings from "@/components/ai/code-generation-settings"
import CodePreview from "@/components/ai/code-preview"
import {
  useModelCodeIntegration,
  type CodeGenerationOptions,
  type CodeGenerationRecord,
} from "@/lib/ai/model-code-integration"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

export default function EnhancedAICodeGeneration() {
  const [prompt, setPrompt] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [activeTab, setActiveTab] = useState("generate")
  const [generationOptions, setGenerationOptions] = useState<CodeGenerationOptions>({
    temperature: 0.7,
    maxTokens: 2048,
    includeComments: true,
  })
  const [generationMetrics, setGenerationMetrics] = useState<{
    latency: number
    tokensGenerated: number
    tokensPerSecond: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    isGenerating,
    generationProgress,
    generateCode,
    generationHistory,
    selectedModelId,
    modelError,
    loadAvailableModels,
  } = useModelCodeIntegration()

  // 初始化时加载模型
  useEffect(() => {
    loadAvailableModels()
  }, [loadAvailableModels])

  // 处理代码生成
  const handleGenerateCode = async () => {
    if (!prompt.trim()) return

    setError(null)
    setGeneratedCode("")
    setGenerationMetrics(null)

    try {
      const result = await generateCode(prompt, generationOptions)

      if (result.success) {
        setGeneratedCode(result.code)
        setGenerationMetrics(result.metrics)
      } else {
        setError(result.error || "生成代码失败")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成过程中发生错误")
    }
  }

  // 从历史记录加载代码
  const loadFromHistory = (record: CodeGenerationRecord) => {
    setPrompt(record.prompt)
    setGeneratedCode(record.code)
    setGenerationOptions(record.options)
    setGenerationMetrics(record.metrics)
    setActiveTab("generate")
  }

  // 示例提示词
  const examplePrompts = [
    "创建一个React组件，实现一个带搜索和过滤功能的数据表格",
    "使用Python编写一个Web爬虫，可以抓取新闻网站的标题和摘要",
    "实现一个Node.js Express API，提供用户认证和文件上传功能",
    "编写一个TypeScript工具函数，可以深度合并两个对象",
  ]

  return (
    <div className="h-full">
      <BrandCard variant="glass" className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 头部标题区 */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-cloud-blue-50 to-mint-green/10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-xl flex items-center justify-center shadow-glow">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                  <span>增强版AI代码生成</span>
                  <Sparkles className="h-5 w-5 text-cloud-blue-500" />
                </h2>
                <p className="text-gray-600">通过自然语言描述生成高质量代码，支持多种编程语言和框架</p>
              </div>
            </motion.div>
          </div>

          {/* 主要内容区 */}
          <div className="flex-1 flex overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex overflow-hidden">
              {/* 标签页切换 */}
              <div className="w-[220px] border-r border-gray-200/50 p-4">
                <TabsList className="flex flex-col h-auto gap-1">
                  <TabsTrigger value="generate" className="w-full justify-start">
                    <Code className="h-4 w-4 mr-2" />
                    代码生成
                  </TabsTrigger>
                  <TabsTrigger value="history" className="w-full justify-start">
                    <History className="h-4 w-4 mr-2" />
                    生成历史
                  </TabsTrigger>
                </TabsList>

                {/* 模型选择器 */}
                <div className="mt-6 space-y-4">
                  <div className="text-sm font-medium text-gray-700">AI模型</div>
                  <ModelSelector />

                  {modelError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription className="text-xs">{modelError}</AlertDescription>
                    </Alert>
                  )}

                  {/* 生成设置 */}
                  <div className="text-sm font-medium text-gray-700 mt-6">设置</div>
                  <CodeGenerationSettings
                    options={generationOptions}
                    onChange={setGenerationOptions}
                    className="w-full"
                  />
                </div>
              </div>

              {/* 生成标签页内容 */}
              <TabsContent value="generate" className="flex-1 p-0 m-0 overflow-hidden">
                <div className="h-full flex flex-col md:flex-row overflow-hidden">
                  {/* 左侧输入区 */}
                  <div className="w-full md:w-1/2 p-6 border-r border-gray-200/50 flex flex-col">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="h-full flex flex-col space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">输入提示词</h3>
                        <BrandBadge variant="outline" size="sm">
                          自然语言
                        </BrandBadge>
                      </div>

                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="描述你想要生成的代码功能，例如：'创建一个React组件，实现一个带搜索和过滤功能的数据表格'"
                        className="flex-1 resize-none text-base p-4"
                      />

                      {/* 示例提示词 */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Lightbulb className="h-4 w-4 mr-1" />
                          <span>示例提示词</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {examplePrompts.map((examplePrompt, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => setPrompt(examplePrompt)}
                              className="text-xs"
                            >
                              {examplePrompt.length > 30 ? examplePrompt.substring(0, 30) + "..." : examplePrompt}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* 生成按钮 */}
                      <div className="flex items-center">
                        <BrandButton
                          variant="gradient"
                          size="lg"
                          onClick={handleGenerateCode}
                          loading={isGenerating}
                          disabled={!prompt.trim() || !selectedModelId}
                          icon={<Zap className="h-4 w-4" />}
                          className="w-full"
                        >
                          {isGenerating ? "生成中..." : "生成代码"}
                        </BrandButton>
                      </div>

                      {/* 进度条 */}
                      {isGenerating && (
                        <div className="space-y-2">
                          <Progress value={generationProgress} className="h-2" />
                          <div className="text-xs text-center text-gray-500">
                            {generationProgress < 100 ? "正在生成代码..." : "完成中..."}
                          </div>
                        </div>
                      )}

                      {/* 错误提示 */}
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </motion.div>
                  </div>

                  {/* 右侧代码展示区 */}
                  <div className="w-full md:w-1/2 p-6 flex flex-col">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="h-full"
                    >
                      <CodePreview
                        code={generatedCode}
                        isLoading={isGenerating}
                        metrics={generationMetrics}
                        className="h-full"
                      />
                    </motion.div>
                  </div>
                </div>
              </TabsContent>

              {/* 历史记录标签页内容 */}
              <TabsContent value="history" className="flex-1 p-6 m-0 overflow-hidden">
                <div className="h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">生成历史记录</h3>

                  {generationHistory.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-500">暂无生成历史记录</p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1">
                      <div className="space-y-4">
                        {generationHistory.map((record) => (
                          <BrandCard
                            key={record.id}
                            variant="outlined"
                            className="p-4 hover:border-cloud-blue-300 transition-colors cursor-pointer"
                            onClick={() => loadFromHistory(record)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium text-gray-800 line-clamp-1">{record.prompt}</h4>
                                <div className="flex items-center text-xs text-gray-500 space-x-2">
                                  <span>{record.modelName}</span>
                                  <span>•</span>
                                  <span>
                                    {formatDistanceToNow(record.timestamp, {
                                      addSuffix: true,
                                      locale: zhCN,
                                    })}
                                  </span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </BrandCard>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BrandCard>
    </div>
  )
}
