"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Play,
  Square,
  RefreshCw,
  Download,
  Upload,
  File,
  Plus,
  Trash2,
  Terminal,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  MemoryStick,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MobileCodeSandboxProps {
  onBack: () => void
}

// 文件接口
interface SandboxFile {
  id: string
  name: string
  content: string
  language: string
}

// 执行结果接口
interface ExecutionResult {
  success: boolean
  output: string[]
  error?: string
  duration: number
  memoryUsage: number
}

export default function MobileCodeSandbox({ onBack }: MobileCodeSandboxProps) {
  // 状态管理
  const [files, setFiles] = useState<SandboxFile[]>([
    {
      id: "main",
      name: "main.js",
      content: `// 欢迎使用移动代码沙箱
console.log("Hello, YanYu Cloud³!");

// 示例：计算斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 计算前10个斐波那契数
for (let i = 0; i < 10; i++) {
  console.log(\`fibonacci(\${i}) = \${fibonacci(i)}\`);
}

// 异步示例
async function fetchData() {
  console.log("开始获取数据...");
  
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log("数据获取完成!");
  return { message: "成功获取数据" };
}

fetchData().then(result => {
  console.log("结果:", result);
});`,
      language: "javascript",
    },
  ])

  const [currentFileId, setCurrentFileId] = useState("main")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [language, setLanguage] = useState("javascript")
  const [allowNetwork, setAllowNetwork] = useState(true)
  const [timeout, setTimeout] = useState(10000)
  const [activeTab, setActiveTab] = useState("editor")

  const { toast } = useToast()

  // 获取当前文件
  const getCurrentFile = () => {
    return files.find((file) => file.id === currentFileId) || files[0]
  }

  // 更新文件内容
  const updateFileContent = (content: string) => {
    setFiles((prev) => prev.map((file) => (file.id === currentFileId ? { ...file, content } : file)))
  }

  // 创建新文件
  const createNewFile = () => {
    const fileName = prompt("请输入文件名:")
    if (!fileName) return

    const newFile: SandboxFile = {
      id: `file_${Date.now()}`,
      name: fileName,
      content: "",
      language: getLanguageFromExtension(fileName),
    }

    setFiles((prev) => [...prev, newFile])
    setCurrentFileId(newFile.id)

    toast({
      title: "文件已创建",
      description: `文件 "${fileName}" 已成功创建`,
    })
  }

  // 删除文件
  const deleteFile = (fileId: string) => {
    if (files.length <= 1) {
      toast({
        title: "无法删除",
        description: "至少需要保留一个文件",
        variant: "destructive",
      })
      return
    }

    if (!window.confirm("确定要删除这个文件吗？")) return

    setFiles((prev) => prev.filter((file) => file.id !== fileId))

    if (currentFileId === fileId) {
      setCurrentFileId(files[0].id)
    }

    toast({
      title: "文件已删除",
      description: "文件已成功删除",
    })
  }

  // 执行代码
  const executeCode = async () => {
    const currentFile = getCurrentFile()
    if (!currentFile || !currentFile.content.trim()) {
      toast({
        title: "没有可执行的代码",
        description: "请先编写一些代码",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)
    setExecutionResult(null)

    try {
      const startTime = performance.now()
      const logs: string[] = []
      let error: string | undefined

      // 模拟代码执行
      const delay = 1500;
      await new Promise((resolve) => window.setTimeout(resolve, delay))

      // 模拟执行结果
      if (currentFile.language === "javascript") {
        logs.push("Hello, YanYu Cloud³!")
        logs.push("fibonacci(0) = 0")
        logs.push("fibonacci(1) = 1")
        logs.push("fibonacci(2) = 1")
        logs.push("fibonacci(3) = 2")
        logs.push("fibonacci(4) = 3")
        logs.push("fibonacci(5) = 5")
        logs.push("fibonacci(6) = 8")
        logs.push("fibonacci(7) = 13")
        logs.push("fibonacci(8) = 21")
        logs.push("fibonacci(9) = 34")
        logs.push("开始获取数据...")
        logs.push("数据获取完成!")
        logs.push("结果: { message: '成功获取数据' }")
      } else {
        logs.push("代码执行完成")
      }

      const endTime = performance.now()

      setExecutionResult({
        success: !error,
        output: logs,
        error,
        duration: endTime - startTime,
        memoryUsage: Math.random() * 50 + 10, // 模拟内存使用
      })

      setActiveTab("output")

      toast({
        title: "代码执行成功",
        description: `执行完成，耗时 ${(endTime - startTime).toFixed(0)}ms`,
      })
    } catch (e) {
      setExecutionResult({
        success: false,
        output: [],
        error: e instanceof Error ? e.message : "未知错误",
        duration: 0,
        memoryUsage: 0,
      })

      toast({
        title: "执行失败",
        description: e instanceof Error ? e.message : "未知错误",
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  // 停止执行
  const stopExecution = () => {
    setIsExecuting(false)
    toast({
      title: "执行已停止",
      description: "代码执行已被用户停止",
    })
  }

  // 重置沙箱
  const resetSandbox = () => {
    if (!window.confirm("确定要重置沙箱吗？这将清除所有更改。")) return

    setFiles([
      {
        id: "main",
        name: "main.js",
        content: `// 欢迎使用移动代码沙箱
console.log("Hello, YanYu Cloud³!");`,
        language: "javascript",
      },
    ])

    setCurrentFileId("main")
    setExecutionResult(null)

    toast({
      title: "沙箱已重置",
      description: "所有文件已恢复到初始状态",
    })
  }

  // 获取语言从文件扩展名
  function getLanguageFromExtension(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "js":
        return "javascript"
      case "ts":
        return "typescript"
      case "py":
        return "python"
      case "html":
        return "html"
      case "css":
        return "css"
      case "json":
        return "json"
      default:
        return "plaintext"
    }
  }

  const currentFile = getCurrentFile()

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Button
              onClick={executeCode}
              disabled={isExecuting}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isExecuting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
              {isExecuting ? "执行中" : "运行"}
            </Button>

            {isExecuting && (
              <Button onClick={stopExecution} variant="destructive" size="sm">
                <Square className="h-4 w-4 mr-1" />
                停止
              </Button>
            )}

            <Button onClick={resetSandbox} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              重置
            </Button>
          </div>

          <Button onClick={createNewFile} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            新建
          </Button>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {allowNetwork ? "网络已启用" : "网络已禁用"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {timeout}ms 超时
          </Badge>
          {executionResult && (
            <Badge variant={executionResult.success ? "default" : "destructive"} className="text-xs">
              {executionResult.success ? "执行成功" : "执行失败"}
            </Badge>
          )}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 py-2 bg-white border-b">
            <TabsList className="grid w-full grid-cols-4 h-9">
              <TabsTrigger value="files" className="text-xs">
                文件
              </TabsTrigger>
              <TabsTrigger value="editor" className="text-xs">
                编辑器
              </TabsTrigger>
              <TabsTrigger value="output" className="text-xs">
                输出
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                设置
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="files" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentFileId === file.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setCurrentFileId(file.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.language}</p>
                        </div>
                      </div>
                      {files.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteFile(file.id)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="editor" className="h-full m-0">
              <div className="h-full flex flex-col">
                {/* 文件信息 */}
                <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4" />
                    <span className="text-sm font-medium">{currentFile.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {currentFile.language}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 代码编辑器 */}
                <div className="flex-1 p-4">
                  <Textarea
                    value={currentFile.content}
                    onChange={(e) => updateFileContent(e.target.value)}
                    className="w-full h-full resize-none font-mono text-sm"
                    placeholder="在这里编写代码..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="output" className="h-full m-0">
              <div className="h-full flex flex-col">
                {/* 执行信息 */}
                {executionResult && (
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {executionResult.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">{executionResult.success ? "执行成功" : "执行失败"}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{executionResult.duration.toFixed(0)}ms</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MemoryStick className="h-3 w-3" />
                          <span>{executionResult.memoryUsage.toFixed(1)}MB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 输出内容 */}
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    {isExecuting ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-center space-y-2">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                          <p className="text-sm text-muted-foreground">代码执行中...</p>
                        </div>
                      </div>
                    ) : executionResult ? (
                      <div className="bg-black text-white font-mono text-xs rounded-lg p-4 space-y-1">
                        {executionResult.output.map((line, index) => (
                          <div key={index} className="whitespace-pre-wrap">
                            {line}
                          </div>
                        ))}
                        {executionResult.error && (
                          <div className="text-red-400 mt-2 whitespace-pre-wrap">错误: {executionResult.error}</div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-center space-y-2">
                          <Terminal className="h-8 w-8 mx-auto text-gray-400" />
                          <p className="text-sm text-muted-foreground">点击"运行"按钮执行代码</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">执行设置</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">允许网络请求</p>
                          <p className="text-xs text-muted-foreground">允许代码访问外部API和资源</p>
                        </div>
                        <Switch checked={allowNetwork} onCheckedChange={setAllowNetwork} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">执行超时 (毫秒)</label>
                        <Select value={timeout.toString()} onValueChange={(value) => setTimeout(Number(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5000">5000 ms</SelectItem>
                            <SelectItem value="10000">10000 ms</SelectItem>
                            <SelectItem value="30000">30000 ms</SelectItem>
                            <SelectItem value="60000">60000 ms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">默认语言</label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">存储管理</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>已用存储</span>
                          <span className="font-medium">1.2 GB / 2 GB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }} />
                        </div>
                        <Button variant="outline" className="w-full" size="sm">
                          清理缓存
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
