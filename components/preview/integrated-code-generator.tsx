"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Sparkles, FileText, Copy, Download, Play, Settings, History, Wand2, Code2, Loader2 } from "lucide-react"
import { useModelCodeIntegration } from "@/lib/ai/model-code-integration"
import { useTemplateStore } from "@/lib/templates/template-store"
import { useToast } from "@/hooks/use-toast"
import MonacoEditor from "@/components/ui/monaco-editor"

export default function IntegratedCodeGenerator() {
  // 状态管理
  const [prompt, setPrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("prompt")

  // 生成选项
  const [language, setLanguage] = useState("typescript")
  const [framework, setFramework] = useState("react")
  const [temperature, setTemperature] = useState([0.7])
  const [maxTokens, setMaxTokens] = useState([2048])
  const [includeComments, setIncludeComments] = useState(true)
  const [optimizeFor, setOptimizeFor] = useState<"readability" | "performance" | "security" | "balanced"> ("readability")

  // Hooks
  const {
    availableModels,
    selectedModelId,
    isLoadingModels,
    generationHistory,
    selectModel,
    generateCode,
    loadAvailableModels,
  } = useModelCodeIntegration()

  const { templates, getFilteredTemplates, incrementUsageCount } = useTemplateStore()
  const { toast } = useToast()

  // 初始化
  useEffect(() => {
    loadAvailableModels()
  }, [loadAvailableModels])

  // 获取适用的模板
  const applicableTemplates = getFilteredTemplates().filter(
    (template) => !template.language || template.language === language,
  )

  // 处理模板选择
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    setSelectedTemplate(templateId)
    setPrompt(template.prompt)

    // 提取模板变量
    const variables: Record<string, string> = {}
    const variableMatches = template.prompt.match(/\{\{(\w+)\}\}/g)
    if (variableMatches) {
      variableMatches.forEach((match) => {
        const variable = match.replace(/[{}]/g, "")
        variables[variable] = ""
      })
    }
    setTemplateVariables(variables)

    // 应用模板选项
    if (template.options) {
      if (template.options.temperature !== undefined) {
        setTemperature([template.options.temperature])
      }
      if (template.options.maxTokens !== undefined) {
        setMaxTokens([template.options.maxTokens])
      }
      if (template.options.includeComments !== undefined) {
        setIncludeComments(template.options.includeComments)
      }
      if (template.options.optimizeFor !== undefined) {
        setOptimizeFor(template.options.optimizeFor)
      }
    }

    // 更新语言和框架
    if (template.language) {
      setLanguage(template.language)
    }
    if (template.framework) {
      setFramework(template.framework)
    }

    toast({
      title: "模板已应用",
      description: `已应用模板 "${template.name}"`,
    })
  }

  // 处理代码生成
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "提示词为空",
        description: "请输入代码生成提示词",
        variant: "destructive",
      })
      return
    }

    if (!selectedModelId) {
      toast({
        title: "未选择模型",
        description: "请先选择一个AI模型",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // 替换模板变量
      let finalPrompt = prompt
      Object.entries(templateVariables).forEach(([key, value]) => {
        finalPrompt = finalPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value)
      })

      // 生成代码
      const result = await generateCode(finalPrompt, {
        temperature: temperature[0],
        maxTokens: maxTokens[0],
        language,
        framework,
        includeComments,
        // 只传递generateCode函数支持的值
        optimizeFor: optimizeFor === "balanced" ? undefined : optimizeFor,
      })

      if (result.success) {
        setGeneratedCode(result.code)
        setActiveTab("result")

        // 如果使用了模板，增加使用次数
        if (selectedTemplate) {
          incrementUsageCount(selectedTemplate)
        }

        toast({
          title: "代码生成成功",
          description: `生成了 ${result.metrics.tokensGenerated} 个token，耗时 ${result.metrics.latency.toFixed(0)}ms`,
        })
      } else {
        toast({
          title: "代码生成失败",
          description: result.error || "未知错误",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "生成过程出错",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // 复制代码
  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    toast({
      title: "代码已复制",
      description: "代码已复制到剪贴板",
    })
  }

  // 下载代码
  const downloadCode = () => {
    const fileExtension = language === "javascript" ? "js" : language === "typescript" ? "ts" : language
    const blob = new Blob([generatedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `generated-code.${fileExtension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* 模型选择和设置 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>AI模型</Label>
          <Select value={selectedModelId || ""} onValueChange={selectModel} disabled={isLoadingModels}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingModels ? "加载中..." : "选择模型"} />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center space-x-2">
                    <span>{model.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {model.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>编程语言</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>框架</Label>
          <Select value={framework} onValueChange={setFramework}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="vue">Vue.js</SelectItem>
              <SelectItem value="angular">Angular</SelectItem>
              <SelectItem value="next.js">Next.js</SelectItem>
              <SelectItem value="express">Express</SelectItem>
              <SelectItem value="django">Django</SelectItem>
              <SelectItem value="flask">Flask</SelectItem>
              <SelectItem value="spring">Spring</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 主要内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prompt">提示词</TabsTrigger>
          <TabsTrigger value="templates">模板</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
          <TabsTrigger value="result">结果</TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5" />
                <span>代码生成提示词</span>
              </CardTitle>
              <CardDescription>描述您想要生成的代码功能和要求</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="请描述您想要生成的代码功能，例如：创建一个React组件，实现用户登录表单，包含邮箱和密码输入框，以及登录按钮..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="resize-none"
              />

              {/* 模板变量 */}
              {Object.keys(templateVariables).length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">模板变量</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(templateVariables).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{key}</Label>
                        <Input
                          placeholder={`输入 ${key} 的值`}
                          value={value}
                          onChange={(e) =>
                            setTemplateVariables((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  {selectedTemplate && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>使用模板</span>
                    </Badge>
                  )}
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating || !selectedModelId}>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? "生成中..." : "生成代码"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>代码模板</span>
              </CardTitle>
              <CardDescription>选择预设模板快速开始代码生成</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applicableTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? "border-cloud-blue-500 bg-cloud-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {template.language && (
                            <Badge variant="secondary" className="text-xs">
                              {template.language}
                            </Badge>
                          )}
                          {template.framework && (
                            <Badge variant="secondary" className="text-xs">
                              {template.framework}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{template.usageCount} 次使用</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>生成设置</span>
              </CardTitle>
              <CardDescription>调整代码生成的参数和选项</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>创造性 (Temperature): {temperature[0]}</Label>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">较低的值生成更保守的代码，较高的值生成更有创意的代码</p>
              </div>

              <div className="space-y-3">
                <Label>最大Token数: {maxTokens[0]}</Label>
                <Slider
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                  max={4096}
                  min={512}
                  step={256}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">控制生成代码的长度</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>包含注释</Label>
                  <p className="text-xs text-muted-foreground">在生成的代码中包含详细注释</p>
                </div>
                <Switch checked={includeComments} onCheckedChange={setIncludeComments} />
              </div>

              <div className="space-y-3">
                <Label>优化重点</Label>
                <Select value={optimizeFor} onValueChange={(value: any) => setOptimizeFor(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="readability">可读性</SelectItem>
                    <SelectItem value="performance">性能</SelectItem>
                    <SelectItem value="security">安全性</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="result" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code2 className="h-5 w-5" />
                  <span>生成结果</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={copyCode} disabled={!generatedCode}>
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCode} disabled={!generatedCode}>
                    <Download className="h-4 w-4 mr-1" />
                    下载
                  </Button>
                  <Button variant="outline" size="sm" disabled={!generatedCode}>
                    <Play className="h-4 w-4 mr-1" />
                    运行
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedCode ? (
                <div className="border rounded-md h-[500px]">
                  <MonacoEditor
                    language={language}
                    value={generatedCode}
                    onChange={setGeneratedCode}
                    options={{
                      readOnly: false,
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[500px] border rounded-md bg-gray-50">
                  <div className="text-center space-y-2">
                    <Code2 className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-gray-500">生成的代码将在这里显示</p>
                    <p className="text-sm text-gray-400">请先输入提示词并点击"生成代码"</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 历史记录 */}
      {generationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>生成历史</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generationHistory.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setPrompt(record.prompt)
                    setGeneratedCode(record.code)
                    setActiveTab("result")
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{record.prompt}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {record.modelName}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{record.timestamp.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{record.metrics.tokensGenerated} tokens</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
