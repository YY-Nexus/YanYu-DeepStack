"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Code2, Sparkles, Zap, BookOpen, Wrench, Shield, History } from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import CodePreview from "@/components/ai/code-preview"
import { deepStackService, type DeepStackOptions, type DeepStackResponse } from "@/lib/ai/deepstack-service"
import { deepStackConfig } from "@/lib/ai/deepstack-config"

interface GenerationHistory {
  id: string
  prompt: string
  response: DeepStackResponse
  timestamp: Date
  language?: string
}

export default function DeepStackCodeGenerator() {
  const [prompt, setPrompt] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [selectedFramework, setSelectedFramework] = useState<string>("")
  const [generationType, setGenerationType] = useState<"generate" | "optimize" | "explain" | "fix">("generate")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<DeepStackResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<GenerationHistory[]>([])
  const [activeTab, setActiveTab] = useState("generator")

  // 框架选项映射
  const frameworkOptions: Record<string, string[]> = {
    JavaScript: ["React", "Vue", "Angular", "Node.js", "Express", "Next.js"],
    TypeScript: ["React", "Vue", "Angular", "Node.js", "Express", "Next.js"],
    Python: ["Django", "Flask", "FastAPI", "PyTorch", "TensorFlow"],
    Java: ["Spring", "Spring Boot", "Hibernate", "Android"],
    "C#": [".NET Core", "ASP.NET", "Xamarin", "Unity"],
    Go: ["Gin", "Echo", "Fiber"],
    Rust: ["Actix", "Rocket", "Tokio"],
    PHP: ["Laravel", "Symfony", "WordPress"],
    Ruby: ["Rails", "Sinatra"],
  }

  // 示例提示词
  const examplePrompts = {
    generate: [
      "创建一个React组件，实现一个带搜索功能的用户列表",
      "用Python实现一个简单的Web爬虫",
      "编写一个JavaScript防抖函数",
      "实现一个Java单例模式的线程安全版本",
    ],
    optimize: ["优化这个排序算法的性能", "提高这段代码的可读性", "增强这个函数的安全性", "重构这个类的结构"],
    explain: [
      "解释这个算法的工作原理",
      "分析这段代码的时间复杂度",
      "说明这个设计模式的优缺点",
      "解释这个API的使用方法",
    ],
    fix: ["修复这个内存泄漏问题", "解决这个并发访问错误", "修复这个SQL注入漏洞", "解决这个性能瓶颈"],
  }

  // 处理代码生成
  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)
    setCurrentResponse(null)

    try {
      const options: DeepStackOptions = {
        language: selectedLanguage || undefined,
        framework: selectedFramework || undefined,
        temperature: 0.3,
        maxTokens: 2048,
        includeExamples: true,
      }

      let response: DeepStackResponse

      switch (generationType) {
        case "generate":
          response = await deepStackService.generateCode(prompt, options)
          break
        case "optimize":
          if (!currentResponse?.code) {
            setError("请先生成代码，然后再进行优化")
            return
          }
          response = await deepStackService.optimizeCode(
            currentResponse.code,
            selectedLanguage || "JavaScript",
            "readability",
          )
          break
        case "explain":
          if (!currentResponse?.code) {
            setError("请先生成代码，然后再进行解释")
            return
          }
          response = await deepStackService.explainCode(currentResponse.code, selectedLanguage || "JavaScript")
          break
        case "fix":
          if (!currentResponse?.code) {
            setError("请先生成代码，然后再进行修复")
            return
          }
          response = await deepStackService.fixCode(currentResponse.code, selectedLanguage || "JavaScript", prompt)
          break
        default:
          response = await deepStackService.generateCode(prompt, options)
      }

      if (response.success) {
        setCurrentResponse(response)

        // 添加到历史记录
        const historyItem: GenerationHistory = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          prompt,
          response,
          timestamp: new Date(),
          language: selectedLanguage || undefined,
        }
        setHistory((prev) => [historyItem, ...prev.slice(0, 9)]) // 保留最近10条记录
      } else {
        setError(response.error || "生成失败")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成过程中发生错误")
    } finally {
      setIsGenerating(false)
    }
  }

  // 从历史记录加载
  const loadFromHistory = (item: GenerationHistory) => {
    setPrompt(item.prompt)
    setCurrentResponse(item.response)
    if (item.language) {
      setSelectedLanguage(item.language)
    }
    setActiveTab("generator")
  }

  // 获取当前框架选项
  const currentFrameworkOptions = selectedLanguage ? frameworkOptions[selectedLanguage] || [] : []

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
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                  <span>DeepStack 代码助手</span>
                  <Sparkles className="h-5 w-5 text-cloud-blue-500" />
                </h2>
                <p className="text-gray-600">专业的多语言代码生成、优化和解释助手</p>
              </div>
            </motion.div>
          </div>

          {/* 主要内容区 */}
          <div className="flex-1 flex overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex overflow-hidden">
              {/* 标签页切换 */}
              <div className="w-[240px] border-r border-gray-200/50 p-4">
                <TabsList className="flex flex-col h-auto gap-1">
                  <TabsTrigger value="generator" className="w-full justify-start">
                    <Code2 className="h-4 w-4 mr-2" />
                    代码生成器
                  </TabsTrigger>
                  <TabsTrigger value="history" className="w-full justify-start">
                    <History className="h-4 w-4 mr-2" />
                    历史记录
                  </TabsTrigger>
                </TabsList>

                {/* 配置选项 */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">生成类型</label>
                    <Select value={generationType} onValueChange={(value: any) => setGenerationType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="generate">
                          <div className="flex items-center">
                            <Zap className="h-4 w-4 mr-2" />
                            生成代码
                          </div>
                        </SelectItem>
                        <SelectItem value="optimize">
                          <div className="flex items-center">
                            <Wrench className="h-4 w-4 mr-2" />
                            优化代码
                          </div>
                        </SelectItem>
                        <SelectItem value="explain">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-2" />
                            解释代码
                          </div>
                        </SelectItem>
                        <SelectItem value="fix">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2" />
                            修复代码
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">编程语言</label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择语言" />
                      </SelectTrigger>
                      <SelectContent>
                        {deepStackConfig.supportedLanguages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentFrameworkOptions.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">框架/库</label>
                      <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择框架" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentFrameworkOptions.map((framework) => (
                            <SelectItem key={framework} value={framework}>
                              {framework}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* 生成器标签页内容 */}
              <TabsContent value="generator" className="flex-1 p-0 m-0 overflow-hidden">
                <div className="h-full flex flex-col md:flex-row overflow-hidden">
                  {/* 左侧输入区 */}
                  <div className="w-full md:w-1/2 p-6 border-r border-gray-200/50 flex flex-col">
                    <div className="h-full flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">输入提示词</h3>
                        <BrandBadge variant="outline" size="sm">
                          {generationType === "generate" && "生成"}
                          {generationType === "optimize" && "优化"}
                          {generationType === "explain" && "解释"}
                          {generationType === "fix" && "修复"}
                        </BrandBadge>
                      </div>

                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={
                          generationType === "generate"
                            ? "描述你想要生成的代码功能..."
                            : generationType === "optimize"
                              ? "描述需要优化的方面..."
                              : generationType === "explain"
                                ? "询问需要解释的内容..."
                                : "描述遇到的问题..."
                        }
                        className="flex-1 resize-none text-base p-4"
                      />

                      {/* 示例提示词 */}
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">示例提示词：</div>
                        <div className="flex flex-wrap gap-2">
                          {examplePrompts[generationType].map((example, index) => (
                            <button
                              key={index}
                              onClick={() => setPrompt(example)}
                              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              {example.length > 25 ? example.substring(0, 25) + "..." : example}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 生成按钮 */}
                      <BrandButton
                        variant="gradient"
                        size="lg"
                        onClick={handleGenerate}
                        loading={isGenerating}
                        disabled={!prompt.trim()}
                        icon={<Zap className="h-4 w-4" />}
                        className="w-full"
                      >
                        {isGenerating ? "生成中..." : "开始生成"}
                      </BrandButton>

                      {/* 错误提示 */}
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  {/* 右侧代码展示区 */}
                  <div className="w-full md:w-1/2 p-6 flex flex-col">
                    <CodePreview
                      code={currentResponse?.code || ""}
                      isLoading={isGenerating}
                      metrics={currentResponse?.metrics}
                      className="h-full"
                    />

                    {/* 解释区域 */}
                    {currentResponse?.explanation && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">解释说明</h4>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">{currentResponse.explanation}</div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* 历史记录标签页内容 */}
              <TabsContent value="history" className="flex-1 p-6 m-0 overflow-hidden">
                <div className="h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">生成历史记录</h3>

                  {history.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-500">暂无历史记录</p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1">
                      <div className="space-y-4">
                        {history.map((item) => (
                          <BrandCard
                            key={item.id}
                            variant="outlined"
                            className="p-4 hover:border-cloud-blue-300 transition-colors cursor-pointer"
                            onClick={() => loadFromHistory(item)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {item.language && (
                                    <BrandBadge variant="outline" size="sm">
                                      {item.language}
                                    </BrandBadge>
                                  )}
                                  <span className="text-xs text-gray-500">{item.timestamp.toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-gray-400">{item.response.metrics?.latency}ms</div>
                              </div>
                              <h4 className="font-medium text-gray-800 line-clamp-2">{item.prompt}</h4>
                              {item.response.code && (
                                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded font-mono line-clamp-3">
                                  {item.response.code}
                                </div>
                              )}
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
