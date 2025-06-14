"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { enhancedOllamaService, type EnhancedOllamaModel } from "@/lib/ai/enhanced-ollama-service"
import { formatDuration } from "@/lib/utils"
import { Loader2, Zap, MessageSquare, Code, ImageIcon, Copy, CheckCircle2, BarChart2 } from "lucide-react"

interface ModelPreviewModalProps {
  model: EnhancedOllamaModel | null
  isOpen: boolean
  onClose: () => void
}

// 预设提示词
const PROMPT_PRESETS = {
  chat: [
    { name: "自我介绍", prompt: "请简要介绍一下你自己，包括你的能力和限制。" },
    { name: "创意故事", prompt: '请以"一个意外的发现"为主题，写一个简短的故事。' },
    { name: "知识问答", prompt: "请解释量子计算的基本原理，用通俗易懂的语言。" },
  ],
  code: [
    { name: "排序算法", prompt: "请用Python实现快速排序算法，并解释其时间复杂度。" },
    { name: "React组件", prompt: "创建一个React函数组件，实现一个带搜索功能的下拉选择器。" },
    { name: "SQL查询", prompt: "编写SQL查询，从用户表和订单表中获取过去30天内消费最高的10名用户。" },
  ],
  multimodal: [
    { name: "图像描述", prompt: "请描述这张图片中的内容。[图像将在此处]" },
    { name: "视觉问答", prompt: "这张图片中有几个人？他们在做什么？[图像将在此处]" },
    { name: "图文创作", prompt: "基于这张图片，创作一个简短的故事。[图像将在此处]" },
  ],
}

// 格式化字节大小
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export default function ModelPreviewModal({ model, isOpen, onClose }: ModelPreviewModalProps) {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)
  const [activeTab, setActiveTab] = useState("chat")
  const [generateStats, setGenerateStats] = useState<{
    latency: number
    tokensPerSecond: number
    promptTokens: number
    completionTokens: number
  } | null>(null)
  const [copied, setCopied] = useState(false)

  // 当模型变化时，根据模型类型设置默认提示词
  useEffect(() => {
    if (model) {
      const presets = PROMPT_PRESETS[model.type as keyof typeof PROMPT_PRESETS] || PROMPT_PRESETS.chat
      setPrompt(presets[0].prompt)
      setActiveTab(model.type)
    }
  }, [model])

  // 处理提示词预设选择
  const handlePresetSelect = (preset: string) => {
    setPrompt(preset)
  }

  // 处理生成
  const handleGenerate = async () => {
    if (!model || !prompt.trim()) return

    setIsGenerating(true)
    setResponse("")
    setGenerateStats(null)

    try {
      const result = await enhancedOllamaService.generateText(model.id, prompt, {
        temperature,
        maxTokens,
      })

      if (result.success && result.text) {
        setResponse(result.text)

        // 设置生成统计
        setGenerateStats({
          latency: result.latency || 0,
          tokensPerSecond: result.tokens?.completion
            ? (result.tokens.completion / (result.timing?.evalTime || 1e9)) * 1e9
            : 0,
          promptTokens: result.tokens?.prompt || 0,
          completionTokens: result.tokens?.completion || 0,
        })
      } else {
        setResponse(`生成失败: ${result.error || "未知错误"}`)
      }
    } catch (error) {
      setResponse(`发生错误: ${error instanceof Error ? error.message : "未知错误"}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // 复制响应
  const handleCopy = () => {
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 获取模型类型图标
  const getModelTypeIcon = () => {
    if (!model) return <MessageSquare className="h-5 w-5" />

    switch (model.type) {
      case "code":
        return <Code className="h-5 w-5" />
      case "multimodal":
        return <ImageIcon className="h-5 w-5" />
      default:
        return <MessageSquare className="h-5 w-5" />
    }
  }

  return (
    <Dialog open={isOpen && !!model} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getModelTypeIcon()}
            {model?.name}
            <Badge variant="outline" className="ml-2">
              {model?.parameters}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            模型ID: {model?.id} | 量化: {model?.quantization} | 大小: {formatBytes(model?.size || 0)}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              对话
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              代码
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              参数设置
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden flex flex-col">
            <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
                {/* 输入区 */}
                <div className="flex flex-col h-full">
                  <div className="mb-2 flex justify-between items-center">
                    <h3 className="text-sm font-medium">输入提示词</h3>
                    <div className="flex gap-1">
                      {PROMPT_PRESETS.chat.map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePresetSelect(preset.prompt)}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="输入提示词..."
                    className="flex-1 min-h-[300px] font-mono text-sm"
                  />
                </div>

                {/* 输出区 */}
                <div className="flex flex-col h-full">
                  <div className="mb-2 flex justify-between items-center">
                    <h3 className="text-sm font-medium">模型响应</h3>
                    {response && (
                      <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2">
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        {copied ? "已复制" : "复制"}
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-md p-3 overflow-auto min-h-[300px]">
                    {isGenerating ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap font-mono text-sm">
                        {response || "模型响应将显示在这里..."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="flex-1 overflow-hidden flex flex-col mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
                {/* 输入区 */}
                <div className="flex flex-col h-full">
                  <div className="mb-2 flex justify-between items-center">
                    <h3 className="text-sm font-medium">代码生成提示词</h3>
                    <div className="flex gap-1">
                      {PROMPT_PRESETS.code.map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePresetSelect(preset.prompt)}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="输入代码生成提示词..."
                    className="flex-1 min-h-[300px] font-mono text-sm"
                  />
                </div>

                {/* 输出区 */}
                <div className="flex flex-col h-full">
                  <div className="mb-2 flex justify-between items-center">
                    <h3 className="text-sm font-medium">生成的代码</h3>
                    {response && (
                      <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2">
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        {copied ? "已复制" : "复制"}
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-md p-3 overflow-auto min-h-[300px]">
                    {isGenerating ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {response || "生成的代码将显示在这里..."}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">温度 (Temperature): {temperature}</h3>
                    <p className="text-xs text-gray-500 mb-2">
                      控制生成文本的随机性。较低的值使输出更确定，较高的值使输出更多样化。
                    </p>
                    <Slider
                      value={[temperature]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={(value) => setTemperature(value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>确定性 (0)</span>
                      <span>创造性 (1)</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">最大生成Token数: {maxTokens}</h3>
                    <p className="text-xs text-gray-500 mb-2">
                      限制模型生成的最大Token数量。较大的值允许更长的回复，但可能增加延迟。
                    </p>
                    <Slider
                      value={[maxTokens]}
                      min={128}
                      max={4096}
                      step={128}
                      onValueChange={(value) => setMaxTokens(value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>较短 (128)</span>
                      <span>较长 (4096)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-3">模型性能统计</h3>

                  {generateStats ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-md p-3 shadow-sm">
                          <div className="text-xs text-gray-500">延迟</div>
                          <div className="text-lg font-semibold">{formatDuration(generateStats.latency)}</div>
                        </div>
                        <div className="bg-white rounded-md p-3 shadow-sm">
                          <div className="text-xs text-gray-500">生成速度</div>
                          <div className="text-lg font-semibold">{generateStats.tokensPerSecond.toFixed(1)} t/s</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-md p-3 shadow-sm">
                          <div className="text-xs text-gray-500">提示词Token数</div>
                          <div className="text-lg font-semibold">{generateStats.promptTokens}</div>
                        </div>
                        <div className="bg-white rounded-md p-3 shadow-sm">
                          <div className="text-xs text-gray-500">生成Token数</div>
                          <div className="text-lg font-semibold">{generateStats.completionTokens}</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        注: Token数量和速度为估计值，可能与实际略有差异。
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <BarChart2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>生成内容后显示性能统计</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Zap className="h-4 w-4 mr-1" />
            {model?.usageStats.totalCalls || 0} 次调用 | {formatDuration(model?.usageStats.averageLatency || 0)}{" "}
            平均延迟
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="min-w-[100px]">
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {isGenerating ? "生成中..." : "生成"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 添加命名导出
export { ModelPreviewModal }
