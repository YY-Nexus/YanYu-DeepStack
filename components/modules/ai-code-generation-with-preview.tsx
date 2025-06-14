"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Code, Sparkles, ArrowRight, Lightbulb } from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import ModelSelector from "@/components/ai/model-selector"
import CodeGenerationSettings from "@/components/ai/code-generation-settings"
import IntegratedCodePreview from "@/components/modules/integrated-code-preview"
import { useModelCodeIntegration, type CodeGenerationOptions } from "@/lib/ai/model-code-integration"

export default function AICodeGenerationWithPreview() {
  const [prompt, setPrompt] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [generationOptions, setGenerationOptions] = useState<CodeGenerationOptions>({
    temperature: 0.7,
    maxTokens: 2048,
    includeComments: true,
  })
  const [error, setError] = useState<string | null>(null)

  const { isGenerating, generationProgress, generateCode, selectedModelId, modelError, loadAvailableModels } =
    useModelCodeIntegration()

  // 初始化时加载模型
  useEffect(() => {
    loadAvailableModels()
  }, [loadAvailableModels])

  // 处理代码生成
  const handleGenerateCode = async () => {
    if (!prompt.trim()) return

    setError(null)

    try {
      const result = await generateCode(prompt, generationOptions)

      if (result.success) {
        setGeneratedCode(result.code)
      } else {
        setError(result.error || "生成代码失败")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成过程中发生错误")
    }
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
                  <span>AI代码生成与预览</span>
                  <Sparkles className="h-5 w-5 text-cloud-blue-500" />
                </h2>
                <p className="text-gray-600">通过自然语言描述生成高质量代码，并实时预览、运行和优化</p>
              </div>
            </motion.div>
          </div>

          {/* 主要内容区 - 使用ResizablePanelGroup */}
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* 左侧输入区 */}
              <ResizablePanel defaultSize={30} minSize={25} className="h-full">
                <div className="h-full flex flex-col p-6">
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
                          <button
                            key={index}
                            onClick={() => setPrompt(examplePrompt)}
                            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                          >
                            {examplePrompt.length > 20 ? examplePrompt.substring(0, 20) + "..." : examplePrompt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 模型选择和设置 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-700">AI模型</div>
                        <ModelSelector className="w-[180px]" />
                      </div>

                      {modelError && (
                        <Alert variant="destructive">
                          <AlertDescription className="text-xs">{modelError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-700">生成设置</div>
                        <CodeGenerationSettings options={generationOptions} onChange={setGenerationOptions} />
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
                        icon={<ArrowRight className="h-4 w-4" />}
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
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* 右侧代码预览区 */}
              <ResizablePanel defaultSize={70} className="h-full">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="h-full"
                >
                  <IntegratedCodePreview initialCode={generatedCode} className="h-full" />
                </motion.div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </BrandCard>
    </div>
  )
}
