"use client"

import { useState, useEffect } from "react"
import { Eye, Code, FileText, Split, Maximize2, Download, Play, Terminal } from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import MonacoEditor from "@/components/ui/monaco-editor"
import MarkdownPreview from "@/components/ui/markdown-preview"
import { useModelCodeIntegration } from "@/lib/ai/model-code-integration"
import { detectLanguage } from "@/lib/utils"

type LayoutMode = "split" | "preview-only" | "editor-only"

interface IntegratedCodePreviewProps {
  initialCode?: string
  initialLanguage?: string
  className?: string
}

export default function IntegratedCodePreview({
  initialCode = "",
  initialLanguage = "javascript",
  className = "",
}: IntegratedCodePreviewProps) {
  const [code, setCode] = useState(initialCode)
  const [language, setLanguage] = useState(initialLanguage)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState("code")
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  const { generateCode, isGenerating } = useModelCodeIntegration()

  // 当初始代码变化时更新
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode)
      const detectedLang = detectLanguage(initialCode)
      setLanguage(detectedLang)
    }
  }, [initialCode])

  // 运行代码
  const handleRunCode = async () => {
    if (!code.trim()) return

    setIsRunning(true)
    setRunError(null)
    setConsoleOutput([])

    try {
      // 创建一个安全的执行环境
      const originalConsoleLog = console.log
      const logs: string[] = []

      // 重写console.log
      console.log = (...args) => {
        const output = args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
          .join(" ")
        logs.push(output)
      }

      // 执行代码
      try {
        // 使用Function构造函数创建可执行的函数
        // 注意：这在生产环境中存在安全风险，应该使用沙箱或服务端执行
        const executableCode = `
          try {
            ${code}
          } catch (error) {
            console.log('执行错误:', error.message);
          }
        `
        // eslint-disable-next-line no-new-func
        const runFunction = new Function(executableCode)
        await runFunction()
      } catch (error) {
        logs.push(`执行错误: ${error instanceof Error ? error.message : String(error)}`)
      }

      // 恢复原始console.log
      console.log = originalConsoleLog

      // 更新输出
      setConsoleOutput(logs)
      setActiveTab("console")
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "代码执行失败")
    } finally {
      setIsRunning(false)
    }
  }

  // 优化代码
  const handleOptimizeCode = async () => {
    if (!code.trim()) return

    try {
      const prompt = `请优化以下${language}代码，提高可读性、性能和最佳实践，并添加中文注释解释关键部分：\n\n${code}`

      const result = await generateCode(prompt, {
        temperature: 0.3, // 低温度以获得更确定性的结果
        includeComments: true,
      })

      if (result.success) {
        setCode(result.code)
      } else {
        setRunError(result.error || "优化代码失败")
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "优化代码失败")
    }
  }

  // 解释代码
  const handleExplainCode = async () => {
    if (!code.trim()) return

    try {
      const prompt = `请详细解释以下${language}代码的功能、结构和工作原理，使用中文并以markdown格式输出：\n\n${code}`

      const result = await generateCode(prompt, {
        temperature: 0.3,
      })

      if (result.success) {
        setConsoleOutput([result.code])
        setActiveTab("console")
      } else {
        setRunError(result.error || "解释代码失败")
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "解释代码失败")
    }
  }

  // 切换全屏模式
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // 下载代码
  const handleDownloadCode = () => {
    const fileExtension = getFileExtensionForLanguage(language)
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code${fileExtension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 根据语言获取文件扩展名
  const getFileExtensionForLanguage = (lang: string): string => {
    const extensionMap: Record<string, string> = {
      javascript: ".js",
      typescript: ".ts",
      python: ".py",
      java: ".java",
      csharp: ".cs",
      cpp: ".cpp",
      go: ".go",
      rust: ".rs",
      php: ".php",
      ruby: ".rb",
      html: ".html",
      css: ".css",
      sql: ".sql",
    }

    return extensionMap[lang] || ".txt"
  }

  return (
    <div className={`h-full ${className}`}>
      <BrandCard 
        variant="glass" 
        className={`h-full overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      >
        <div className="h-full flex flex-col">
          {/* 头部工具栏 */}
          <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-cloud-blue-50 to-mint-green/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-lg flex items-center justify-center shadow-glow">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-800">代码预览</h3>
                  <BrandBadge variant="outline" size="sm">
                    {language.toUpperCase()}
                  </BrandBadge>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* 布局切换 */}
                <div className="flex items-center border rounded-md overflow-hidden">
                  <button
                    onClick={() => setLayoutMode("editor-only")}
                    className={`p-1.5 ${layoutMode === "editor-only" ? "bg-gray-100" : "bg-white"}`}
                    title="仅编辑器"
                  >
                    <Code className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setLayoutMode("split")}
                    className={`p-1.5 ${layoutMode === "split" ? "bg-gray-100" : "bg-white"}`}
                    title="分屏模式"
                  >
                    <Split className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setLayoutMode("preview-only")}
                    className={`p-1.5 ${layoutMode === "preview-only" ? "bg-gray-100" : "bg-white"}`}
                    title="仅预览"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                
                {/* 全屏切换 */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 border rounded-md"
                  title="全屏切换"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                
                {/* 下载代码 */}
                <button
                  onClick={handleDownloadCode}
                  className="p-1.5 border rounded-md"
                  title="下载代码"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 主要内容区 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 编辑器区域 */}
            {layoutMode !== "preview-only" && (
              <div className={`${layoutMode === "split" ? "w-1/2" : "w-full"} h-full border-r border-gray-200/50`}>
                <MonacoEditor
                  value={code}
                  language={language}
                  onChange={setCode}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            )}
            
            {/* 预览区域 */}
            {layoutMode !== "editor-only" && (
              <div className={`${layoutMode === "split" ? "w-1/2" : "w-full"} h-full flex flex-col`}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <div className="border-b border-gray-200/50 px-4">
                    <TabsList className="h-12">
                      <TabsTrigger value="preview" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        预览
                      </TabsTrigger>
                      <TabsTrigger value="console" className="flex items-center gap-1">
                        <Terminal className="h-4 w-4" />
                        控制台
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="preview" className="flex-1 p-4 overflow-auto">
                    <div className="h-full">
                      {language === "markdown" ? (
                        <MarkdownPreview content={code} />
                      ) : language === "html" ? (
                        <iframe
                          srcDoc={code}
                          className="w-full h-full border-0"
                          title="HTML Preview"
                          sandbox="allow-scripts"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm text-muted-foreground">
                              {language === "javascript" || language === "typescript" 
                                ? "点击"运行"按钮执行代码" 
                                : `${language.toUpperCase()} 代码预览不可用`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="console" className="flex-1 p-0 overflow-hidden">
                    <div className="h-full flex flex-col">
                      <div className="flex-1 bg-gray-900 text-gray-100 p-4 font-mono text-sm overflow-auto">\
                        {consoleOutput.length > 0 ? (
                          <div>
                            {consoleOutput.map((output, index) => (
                              <div key={index} className="mb-1">
                                {output.startsWith('\`\`\`') ? (
                                  <MarkdownPreview content={output} />
                                ) : (
                                  <pre className="whitespace-pre-wrap">{output}</pre>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">控制台输出将显示在这里。</div>
                        )}
                      </div>
                      
                      {runError && (
                        <Alert variant="destructive" className="m-2">
                          <AlertDescription>{runError}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="p-2 border-t border-gray-700 bg-gray-800 flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {isRunning ? "执行中..." : consoleOutput.length > 0 ? `${consoleOutput.length} 条输出` : ""}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setConsoleOutput([])}
                            className="text-xs text-gray-400 hover:text-white"
                          >
                            清除
                          </button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          <div className="p-4 border-t border-gray-200/50 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {code.length} 字符 | {code.split('\n').length} 行
              </div>
              
              <div className="flex items-center space-x-2">
                <BrandButton
                  variant="outline"
                  size="sm"
                  onClick={handleExplainCode}
                  loading={isGenerating}
                  disabled={!code.trim() || isGenerating || isRunning}
                  icon={<FileText className="h-4 w-4" />}
                >
                  解释代码
                </BrandButton>
                
                <BrandButton
                  variant="outline"
                  size="sm"
                  onClick={handleOptimizeCode}
                  loading={isGenerating}
                  disabled={!code.trim() || isGenerating || isRunning}
                  icon={<Code className="h-4 w-4" />}
                >
                  优化代码
                </BrandButton>
                
                <BrandButton
                  variant="gradient"
                  size="sm"
                  onClick={handleRunCode}
                  loading={isRunning}
                  disabled={!code.trim() || isRunning || isGenerating || (language !== "javascript" && language !== "typescript")}
                  icon={<Play className="h-4 w-4" />}
                >
                  运行
                </BrandButton>
              </div>
            </div>
          </div>
        </div>
      </BrandCard>
    </div>
  )
}
