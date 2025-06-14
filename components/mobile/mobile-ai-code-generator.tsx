"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Copy, Download, Play, Loader2, FileText, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MobileAICodeGeneratorProps {
  onBack: () => void
}

// 模板接口
interface CodeTemplate {
  id: string
  name: string
  description: string
  category: string
  prompt: string
}

// 生成历史接口
interface GenerationHistory {
  id: string
  prompt: string
  code: string
  language: string
  timestamp: Date
}

export default function MobileAICodeGenerator({ onBack }: MobileAICodeGeneratorProps) {
  // 状态管理
  const [prompt, setPrompt] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [framework, setFramework] = useState("react")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("prompt")

  // 模板数据
  const [templates] = useState<CodeTemplate[]>([
    {
      id: "1",
      name: "React组件",
      description: "创建React功能组件",
      category: "前端",
      prompt: "创建一个React组件，实现{{功能描述}}",
    },
    {
      id: "2",
      name: "API接口",
      description: "创建RESTful API",
      category: "后端",
      prompt: "创建一个{{语言}}的API接口，实现{{功能描述}}",
    },
    {
      id: "3",
      name: "数据处理",
      description: "数据处理函数",
      category: "工具",
      prompt: "编写一个{{语言}}函数，用于{{数据处理需求}}",
    },
  ])

  // 生成历史
  const [history] = useState<GenerationHistory[]>([
    {
      id: "1",
      prompt: "创建一个用户登录表单",
      code: "// React登录表单组件\nconst LoginForm = () => {\n  // 组件逻辑\n}",
      language: "javascript",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: "2",
      prompt: "实现冒泡排序算法",
      code: "function bubbleSort(arr) {\n  // 排序逻辑\n}",
      language: "javascript",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
    },
  ])

  const { toast } = useToast()

  // 生成代码
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "提示词为空",
        description: "请输入代码生成提示词",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockCode = `// 生成的${language}代码
// 提示词: ${prompt}

${
  language === "javascript"
    ? `
function generatedFunction() {
  console.log("这是根据您的提示词生成的代码");
  
  // 实现具体功能
  const result = {
    success: true,
    message: "代码生成成功",
    data: []
  };
  
  return result;
}

// 使用示例
const output = generatedFunction();
console.log(output);
`
    : language === "python"
      ? `
def generated_function():
    """根据您的提示词生成的Python代码"""
    print("这是生成的Python代码")
    
    # 实现具体功能
    result = {
        "success": True,
        "message": "代码生成成功",
        "data": []
    }
    
    return result

# 使用示例
output = generated_function()
print(output)
`
      : `
// TypeScript代码
interface GeneratedResult {
  success: boolean;
  message: string;
  data: any[];
}

function generatedFunction(): GeneratedResult {
  console.log("这是生成的TypeScript代码");
  
  // 实现具体功能
  const result: GeneratedResult = {
    success: true,
    message: "代码生成成功",
    data: []
  };
  
  return result;
}

// 使用示例
const output = generatedFunction();
console.log(output);
`
}`

      setGeneratedCode(mockCode)
      setActiveTab("result")

      toast({
        title: "代码生成成功",
        description: "已生成符合要求的代码",
      })
    } catch (error) {
      toast({
        title: "生成失败",
        description: "代码生成过程中出现错误",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // 应用模板
  const applyTemplate = (template: CodeTemplate) => {
    setPrompt(template.prompt)
    setActiveTab("prompt")

    toast({
      title: "模板已应用",
      description: `已应用模板 "${template.name}"`,
    })
  }

  // 复制代码
  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    toast({
      title: "代码已复制",
      description: "代码已复制到剪贴板",
    })
  }

  // 运行代码
  const runCode = () => {
    toast({
      title: "跳转到沙箱",
      description: "将在代码沙箱中运行此代码",
    })
    // 这里可以跳转到沙箱页面
  }

  return (
    <div className="h-full flex flex-col">
      {/* 主要内容 */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 py-2 bg-white border-b">
            <TabsList className="grid w-full grid-cols-4 h-9">
              <TabsTrigger value="prompt" className="text-xs">
                提示词
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">
                模板
              </TabsTrigger>
              <TabsTrigger value="result" className="text-xs">
                结果
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                历史
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="prompt" className="h-full m-0">
              <div className="p-4 space-y-4 h-full flex flex-col">
                {/* 语言和框架选择 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">编程语言</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">框架</label>
                    <Select value={framework} onValueChange={setFramework}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue.js</SelectItem>
                        <SelectItem value="angular">Angular</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 提示词输入 */}
                <div className="flex-1 flex flex-col space-y-2">
                  <label className="text-sm font-medium">代码生成提示词</label>
                  <Textarea
                    placeholder="请描述您想要生成的代码功能，例如：创建一个React组件，实现用户登录表单..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 resize-none text-sm"
                  />
                </div>

                {/* 生成按钮 */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      生成代码
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {templates.map((template) => (
                    <motion.div key={template.id} whileTap={{ scale: 0.98 }}>
                      <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => applyTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">点击应用模板</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="result" className="h-full m-0">
              <div className="h-full flex flex-col">
                {generatedCode ? (
                  <>
                    {/* 操作按钮 */}
                    <div className="p-4 bg-white border-b flex space-x-2">
                      <Button onClick={copyCode} variant="outline" size="sm" className="flex-1">
                        <Copy className="h-4 w-4 mr-1" />
                        复制
                      </Button>
                      <Button onClick={runCode} variant="outline" size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-1" />
                        运行
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        下载
                      </Button>
                    </div>

                    {/* 代码显示 */}
                    <ScrollArea className="flex-1">
                      <div className="p-4">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                          <code>{generatedCode}</code>
                        </pre>
                      </div>
                    </ScrollArea>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center space-y-3">
                      <Wand2 className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-gray-500">生成的代码将在这里显示</p>
                      <p className="text-sm text-gray-400">请先输入提示词并点击"生成代码"</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {history.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {item.language}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.timestamp.toLocaleString()}</span>
                          </div>
                          <p className="text-sm font-medium line-clamp-2">{item.prompt}</p>
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto line-clamp-3">
                            <code>{item.code}</code>
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
