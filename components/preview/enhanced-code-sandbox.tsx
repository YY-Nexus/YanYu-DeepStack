"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  Square,
  RefreshCw,
  Download,
  Upload,
  FolderOpen,
  File,
  Plus,
  Trash2,
  Settings,
  Terminal,
  Globe,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import MonacoEditor from "@/components/ui/monaco-editor"

// 文件系统接口
interface FileSystemItem {
  id: string
  name: string
  type: "file" | "folder"
  content?: string
  language?: string
  parent?: string
  children?: string[]
}

// 执行结果接口
interface ExecutionResult {
  success: boolean
  output: string[]
  error?: string
  duration: number
  memoryUsage?: number
}

// 依赖包接口
interface PackageDependency {
  name: string
  version: string
  type: "dependency" | "devDependency"
}

export default function EnhancedCodeSandbox() {
  // 文件系统状态
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
    {
      id: "root",
      name: "项目根目录",
      type: "folder",
      children: ["main.js", "package.json"],
    },
    {
      id: "main.js",
      name: "main.js",
      type: "file",
      language: "javascript",
      content: `// 欢迎使用增强代码沙箱
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
  try {
    // 模拟API调用
    const response = await new Promise(resolve => 
      setTimeout(() => resolve({ data: "模拟数据" }), 1000)
    );
    console.log("获取到数据:", response);
  } catch (error) {
    console.error("获取数据失败:", error);
  }
}

fetchData();
`,
      parent: "root",
    },
    {
      id: "package.json",
      name: "package.json",
      type: "file",
      language: "json",
      content: `{
  "name": "yanyu-sandbox-project",
  "version": "1.0.0",
  "description": "言語云³ 代码沙箱项目",
  "main": "main.js",
  "dependencies": {
    "lodash": "^4.17.21",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}`,
      parent: "root",
    },
  ])

  // 当前状态
  const [currentFile, setCurrentFile] = useState<string>("main.js")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [language, setLanguage] = useState("javascript")
  const [allowNetwork, setAllowNetwork] = useState(true)
  const [timeout, setTimeout] = useState(10000)
  const [memoryLimit, setMemoryLimit] = useState(256)
  const [dependencies, setDependencies] = useState<PackageDependency[]>([
    { name: "lodash", version: "^4.17.21", type: "dependency" },
    { name: "axios", version: "^1.6.0", type: "dependency" },
    { name: "@types/node", version: "^20.0.0", type: "devDependency" },
  ])

  const { toast } = useToast()

  // 获取当前文件
  const getCurrentFile = () => {
    return fileSystem.find((item) => item.id === currentFile)
  }

  // 更新文件内容
  const updateFileContent = (content: string) => {
    setFileSystem((prev) => prev.map((item) => (item.id === currentFile ? { ...item, content } : item)))
  }

  // 创建新文件
  const createNewFile = () => {
    const fileName = prompt("请输入文件名:")
    if (!fileName) return

    const newFile: FileSystemItem = {
      id: `file_${Date.now()}`,
      name: fileName,
      type: "file",
      language: getLanguageFromExtension(fileName),
      content: "",
      parent: "root",
    }

    setFileSystem((prev) => [
      ...prev,
      newFile,
      ...prev.map((item) =>
        item.id === "root" ? { ...item, children: [...(item.children || []), newFile.id] } : item,
      ),
    ])

    setCurrentFile(newFile.id)

    toast({
      title: "文件已创建",
      description: `文件 "${fileName}" 已成功创建`,
    })
  }

  // 删除文件
  const deleteFile = (fileId: string) => {
    if (fileId === "main.js" || fileId === "package.json") {
      toast({
        title: "无法删除",
        description: "系统文件无法删除",
        variant: "destructive",
      })
      return
    }

    if (!window.confirm("确定要删除这个文件吗？")) return

    setFileSystem((prev) => {
      const filtered = prev.filter((item) => item.id !== fileId)
      return filtered.map((item) =>
        item.children ? { ...item, children: item.children.filter((child) => child !== fileId) } : item,
      )
    })

    if (currentFile === fileId) {
      setCurrentFile("main.js")
    }

    toast({
      title: "文件已删除",
      description: "文件已成功删除",
    })
  }

  // 执行代码
  const executeCode = async () => {
    const file = getCurrentFile()
    if (!file || !file.content) {
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

      // 创建安全的执行环境
      const originalConsole = { ...console }
      console.log = (...args) => {
        logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" "))
      }
      console.error = (...args) => {
        logs.push(`[错误] ${args.map((arg) => String(arg)).join(" ")}`)
      }
      console.warn = (...args) => {
        logs.push(`[警告] ${args.map((arg) => String(arg)).join(" ")}`)
      }
      console.info = (...args) => {
        logs.push(`[信息] ${args.map((arg) => String(arg)).join(" ")}`)
      }

      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`执行超时（${timeout}ms）`))
        }, timeout)
      })

      // 执行代码
      const executionPromise = new Promise<void>(async (resolve) => {
        try {
          if (file.language === "javascript" || file.language === "typescript") {
            // 创建安全的执行环境
            const safeCode = createSafeExecutionEnvironment(file.content, {
              allowNetwork,
              dependencies: dependencies.map((dep) => dep.name),
            })

            // eslint-disable-next-line no-new-func
            const executeFunction = new Function(safeCode)
            await executeFunction()
          } else if (file.language === "html") {
            // HTML代码直接返回
            logs.push(file.content)
          } else {
            throw new Error(`不支持的语言: ${file.language}`)
          }

          resolve()
        } catch (e) {
          error = e instanceof Error ? e.message : String(e)
          resolve()
        }
      })

      // 竞争执行和超时
      await Promise.race([executionPromise, timeoutPromise])

      // 恢复原始控制台
      Object.assign(console, originalConsole)

      const endTime = performance.now()

      setExecutionResult({
        success: !error,
        output: logs,
        error,
        duration: endTime - startTime,
        memoryUsage: Math.random() * memoryLimit, // 模拟内存使用
      })

      if (!error) {
        toast({
          title: "代码执行成功",
          description: `执行完成，耗时 ${(endTime - startTime).toFixed(2)}ms`,
        })
      }
    } catch (e) {
      setExecutionResult({
        success: false,
        output: [],
        error: e instanceof Error ? e.message : String(e),
        duration: 0,
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

    setFileSystem([
      {
        id: "root",
        name: "项目根目录",
        type: "folder",
        children: ["main.js", "package.json"],
      },
      {
        id: "main.js",
        name: "main.js",
        type: "file",
        language: "javascript",
        content: `// 欢迎使用增强代码沙箱
console.log("Hello, YanYu Cloud³!");`,
        parent: "root",
      },
      {
        id: "package.json",
        name: "package.json",
        type: "file",
        language: "json",
        content: `{
  "name": "yanyu-sandbox-project",
  "version": "1.0.0",
  "main": "main.js"
}`,
        parent: "root",
      },
    ])

    setCurrentFile("main.js")
    setExecutionResult(null)

    toast({
      title: "沙箱已重置",
      description: "所有文件已恢复到初始状态",
    })
  }

  // 添加依赖
  const addDependency = () => {
    const name = prompt("请输入包名:")
    if (!name) return

    const version = prompt("请输入版本号:", "latest")
    if (!version) return

    const newDep: PackageDependency = {
      name,
      version,
      type: "dependency",
    }

    setDependencies((prev) => [...prev, newDep])

    toast({
      title: "依赖已添加",
      description: `已添加依赖 ${name}@${version}`,
    })
  }

  // 移除依赖
  const removeDependency = (name: string) => {
    setDependencies((prev) => prev.filter((dep) => dep.name !== name))

    toast({
      title: "依赖已移除",
      description: `已移除依赖 ${name}`,
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

  // 创建安全执行环境
  function createSafeExecutionEnvironment(
    code: string,
    options: { allowNetwork: boolean; dependencies: string[] },
  ): string {
    const disallowedApis = ["process", "require", "module", "eval", "Function"]

    if (!options.allowNetwork) {
      disallowedApis.push("fetch", "XMLHttpRequest")
    }

    return `
      "use strict";
      
      // 禁止访问敏感API
      ${disallowedApis.map((api) => `const ${api} = undefined;`).join("\n")}
      
      // 模拟依赖包
      ${options.dependencies
        .map(
          (dep) => `
        const ${dep.replace(/[^a-zA-Z0-9]/g, "_")} = {
          // 模拟 ${dep} 包的基本功能
          version: "模拟版本",
          mock: true
        };
      `,
        )
        .join("\n")}
      
      // 包装用户代码
      try {
        ${code}
      } catch (error) {
        console.error("执行错误:", error);
        throw error;
      }
    `
  }

  const currentFileData = getCurrentFile()

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            onClick={executeCode}
            disabled={isExecuting}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            {isExecuting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {isExecuting ? "执行中..." : "运行"}
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

          <Separator orientation="vertical" className="h-6" />

          <Button onClick={createNewFile} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            新建文件
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Globe className="h-3 w-3" />
            <span>{allowNetwork ? "网络已启用" : "网络已禁用"}</span>
          </Badge>

          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{timeout}ms 超时</span>
          </Badge>

          <Badge variant="outline" className="flex items-center space-x-1">
            <Package className="h-3 w-3" />
            <span>{dependencies.length} 个依赖</span>
          </Badge>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 文件浏览器 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <FolderOpen className="h-4 w-4" />
              <span>文件浏览器</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fileSystem
              .filter((item) => item.type === "file")
              .map((file) => (
                <motion.div
                  key={file.id}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                    currentFile === file.id ? "bg-cloud-blue-100 text-cloud-blue-700" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setCurrentFile(file.id)}
                >
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  {file.id !== "main.js" && file.id !== "package.json" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFile(file.id)
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </motion.div>
              ))}
          </CardContent>
        </Card>

        {/* 代码编辑器和结果 */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="editor">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">代码编辑器</TabsTrigger>
              <TabsTrigger value="output">执行结果</TabsTrigger>
              <TabsTrigger value="settings">沙箱设置</TabsTrigger>
            </TabsList>

            <TabsContent value="editor">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Terminal className="h-5 w-5" />
                      <span>{currentFileData?.name || "未选择文件"}</span>
                      {currentFileData?.language && (
                        <Badge variant="outline" className="text-xs">
                          {currentFileData.language}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        下载
                      </Button>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        上传
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border rounded-md h-[500px]">
                    <MonacoEditor
                      language={currentFileData?.language || "javascript"}
                      value={currentFileData?.content || ""}
                      onChange={updateFileContent}
                      options={{
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontSize: 14,
                        lineNumbers: "on",
                        wordWrap: "on",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="output">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Terminal className="h-5 w-5" />
                      <span>执行结果</span>
                      {executionResult && (
                        <div className="flex items-center space-x-2">
                          {executionResult.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {executionResult.duration.toFixed(2)}ms
                          </Badge>
                          {executionResult.memoryUsage && (
                            <Badge variant="outline" className="text-xs">
                              {executionResult.memoryUsage.toFixed(1)}MB
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-white font-mono text-sm rounded-md p-4 h-[450px] overflow-auto">
                    {isExecuting ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse">执行中...</div>
                      </div>
                    ) : executionResult ? (
                      <div className="space-y-1">
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
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center space-y-2">
                          <Terminal className="h-8 w-8 mx-auto" />
                          <p>点击"运行"按钮执行代码</p>
                          <p className="text-xs">输出结果将在这里显示</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>沙箱设置</span>
                  </CardTitle>
                  <CardDescription>配置代码执行环境的参数和限制</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>允许网络请求</Label>
                          <p className="text-xs text-muted-foreground">允许代码访问外部API和资源</p>
                        </div>
                        <Switch checked={allowNetwork} onCheckedChange={setAllowNetwork} />
                      </div>

                      <div className="space-y-2">
                        <Label>执行超时 (毫秒)</Label>
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
                        <Label>内存限制 (MB)</Label>
                        <Select value={memoryLimit.toString()} onValueChange={(value) => setMemoryLimit(Number(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="128">128 MB</SelectItem>
                            <SelectItem value="256">256 MB</SelectItem>
                            <SelectItem value="512">512 MB</SelectItem>
                            <SelectItem value="1024">1024 MB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>依赖包管理</Label>
                          <Button onClick={addDependency} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            添加依赖
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-auto">
                          {dependencies.map((dep) => (
                            <div key={dep.name} className="flex items-center justify-between p-2 border rounded-md">
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4" />
                                <span className="text-sm font-medium">{dep.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {dep.version}
                                </Badge>
                                <Badge
                                  variant={dep.type === "dependency" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {dep.type === "dependency" ? "依赖" : "开发依赖"}
                                </Badge>
                              </div>
                              <Button
                                onClick={() => removeDependency(dep.name)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
