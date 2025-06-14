"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Play, RefreshCw, Download, Copy, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { codeSandbox, type SupportedLanguage, type ExecutionResult } from "@/lib/code/code-sandbox"
import MonacoEditor from "@/components/ui/monaco-editor"

export default function CodeSandboxExplorer() {
  const [language, setLanguage] = useState<SupportedLanguage>("javascript")
  const [code, setCode] = useState<string>("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [allowNetwork, setAllowNetwork] = useState(false)
  const [timeout, setTimeout] = useState(5000)

  const { toast } = useToast()

  // 执行代码
  const executeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "代码为空",
        description: "请输入要执行的代码",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)
    setResult(null)

    try {
      let executionResult: ExecutionResult

      if (language === "javascript" || language === "typescript") {
        executionResult = await codeSandbox.executeJavaScript(code, {
          timeout,
          allowNetwork,
        })
      } else if (language === "html") {
        executionResult = await codeSandbox.executeHTML(code)
      } else {
        throw new Error(`不支持的语言: ${language}`)
      }

      setResult(executionResult)

      if (!executionResult.success) {
        toast({
          title: "执行出错",
          description: executionResult.error || "未知错误",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "执行失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  // 重置代码
  const resetCode = () => {
    if (!code.trim() || window.confirm("确定要清空当前代码吗？")) {
      setCode("")
      setResult(null)
    }
  }

  // 复制代码
  const copyCode = () => {
    navigator.clipboard.writeText(code)

    toast({
      title: "代码已复制",
      description: "代码已复制到剪贴板",
    })
  }

  // 下载代码
  const downloadCode = () => {
    const fileExtension = language === "javascript" ? "js" : language === "typescript" ? "ts" : "html"
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${fileExtension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 获取示例代码
  const getExampleCode = () => {
    switch (language) {
      case "javascript":
        return `// 示例：计算斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 计算前10个斐波那契数
for (let i = 0; i < 10; i++) {
  console.log(\`fibonacci(\${i}) = \${fibonacci(i)}\`);
}
`
      case "typescript":
        return `// 示例：计算斐波那契数列（TypeScript版本）
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 计算前10个斐波那契数
for (let i = 0; i < 10; i++) {
  console.log(\`fibonacci(\${i}) = \${fibonacci(i)}\`);
}
`
      case "html":
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML示例</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      line-height: 1.5;
      padding: 2rem;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
    }
    h1 {
      color: #0070f3;
    }
    button {
      background: #0070f3;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #005cc5;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>HTML沙箱示例</h1>
    <p>这是一个简单的HTML示例，您可以在这里测试HTML、CSS和JavaScript。</p>
    <button id="btn">点击我</button>
    <p id="output"></p>
  </div>

  <script>
    document.getElementById('btn').addEventListener('click', function() {
      const output = document.getElementById('output');
      output.textContent = '按钮被点击了！当前时间: ' + new Date().toLocaleTimeString();
    });
  </script>
</body>
</html>
`
      default:
        return ""
    }
  }

  // 加载示例代码
  const loadExampleCode = () => {
    if (code.trim() && !window.confirm("加载示例代码将覆盖当前代码，是否继续？")) {
      return
    }

    setCode(getExampleCode())
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">代码沙箱</h2>
        <p className="text-muted-foreground">安全执行和测试代码，支持多种编程语言</p>
      </div>

      {/* 主体内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 代码编辑器 */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>代码编辑器</CardTitle>
            <Select value={language} onValueChange={(value) => setLanguage(value as SupportedLanguage)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择语言" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-md h-[400px]">
              <MonacoEditor
                language={language}
                value={code}
                onChange={setCode}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={loadExampleCode}>
                加载示例
              </Button>
              <Button variant="outline" size="sm" onClick={resetCode}>
                <RefreshCw className="h-4 w-4 mr-1" />
                重置
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={copyCode}>
                <Copy className="h-4 w-4 mr-1" />
                复制
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCode}>
                <Download className="h-4 w-4 mr-1" />
                下载
              </Button>
              <Button size="sm" onClick={executeCode} disabled={isExecuting}>
                <Play className="h-4 w-4 mr-1" />
                {isExecuting ? "执行中..." : "执行"}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* 执行结果 */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>执行结果</CardTitle>
            {result && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{result.duration.toFixed(2)} ms</span>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {language === "html" && result?.success ? (
              <div className="border rounded-md h-[400px] overflow-auto">
                <iframe srcDoc={result.output[0]} className="w-full h-full" sandbox="allow-scripts" title="HTML预览" />
              </div>
            ) : (
              <Tabs defaultValue="output">
                <TabsList className="mb-2">
                  <TabsTrigger value="output">输出</TabsTrigger>
                  <TabsTrigger value="error">错误</TabsTrigger>
                </TabsList>

                <TabsContent value="output">
                  <div className="border rounded-md h-[350px] overflow-auto p-4 bg-black text-white font-mono text-sm">
                    {isExecuting ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse">执行中...</div>
                      </div>
                    ) : result ? (
                      result.output.length > 0 ? (
                        result.output.map((line, index) => (
                          <div key={index} className="whitespace-pre-wrap">
                            {line}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400">（无输出）</div>
                      )
                    ) : (
                      <div className="text-gray-400">点击"执行"按钮运行代码</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="error">
                  <div className="border rounded-md h-[350px] overflow-auto p-4 bg-black text-white font-mono text-sm">
                    {isExecuting ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse">执行中...</div>
                      </div>
                    ) : result?.error ? (
                      <div className="text-red-400 whitespace-pre-wrap">{result.error}</div>
                    ) : (
                      <div className="text-gray-400">（无错误）</div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          <CardFooter className="pt-4">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch id="allow-network" checked={allowNetwork} onCheckedChange={setAllowNetwork} />
                  <Label htmlFor="allow-network">允许网络请求</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="timeout">超时（毫秒）：</Label>
                  <Select value={timeout.toString()} onValueChange={(value) => setTimeout(Number.parseInt(value))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="选择超时时间" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1000 ms</SelectItem>
                      <SelectItem value="3000">3000 ms</SelectItem>
                      <SelectItem value="5000">5000 ms</SelectItem>
                      <SelectItem value="10000">10000 ms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
