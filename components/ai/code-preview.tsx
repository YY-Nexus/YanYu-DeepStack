"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Copy, CheckCircle2, Code, FileCode2, Play, Download } from "lucide-react"
import MonacoEditor from "@/components/ui/monaco-editor"
import { detectLanguage, formatDuration } from "@/lib/utils"

interface CodePreviewProps {
  code: string
  isLoading?: boolean
  metrics?: {
    latency: number
    tokensGenerated: number
    tokensPerSecond: number
  }
  onRun?: (code: string) => void
  onSave?: (code: string) => void
  className?: string
}

export default function CodePreview({
  code,
  isLoading = false,
  metrics,
  onRun,
  onSave,
  className = "",
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false)
  const [editorCode, setEditorCode] = useState(code)
  const [language, setLanguage] = useState("javascript")
  const [activeTab, setActiveTab] = useState<string>("preview")

  // 当代码变化时更新编辑器内容和检测语言
  useEffect(() => {
    setEditorCode(code)
    const detectedLang = detectLanguage(code)
    setLanguage(detectedLang)
  }, [code])

  // 复制代码
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editorCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("复制失败:", err)
    }
  }

  // 运行代码
  const handleRun = () => {
    if (onRun) {
      onRun(editorCode)
    }
  }

  // 保存代码
  const handleSave = () => {
    if (onSave) {
      onSave(editorCode)
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FileCode2 className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium">生成的代码</h3>
          {language && <Badge variant="outline">{language.toUpperCase()}</Badge>}
        </div>
        <div className="flex items-center space-x-2">
          {metrics && (
            <div className="text-xs text-muted-foreground mr-2">
              {formatDuration(metrics.latency)} | {metrics.tokensPerSecond.toFixed(1)} t/s
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={isLoading || !code} className="h-8 px-2">
            {copied ? <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "已复制" : "复制"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="preview" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              预览
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-1">
              <FileCode2 className="h-4 w-4" />
              编辑
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            {onRun && (
              <Button variant="outline" size="sm" onClick={handleRun} disabled={isLoading || !code} className="h-8">
                <Play className="h-4 w-4 mr-1" />
                运行
              </Button>
            )}
            {onSave && (
              <Button variant="outline" size="sm" onClick={handleSave} disabled={isLoading || !code} className="h-8">
                <Download className="h-4 w-4 mr-1" />
                保存
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 mt-2 border rounded-md overflow-hidden">
          <TabsContent value="preview" className="h-full m-0 data-[state=active]:flex-1">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-muted-foreground">生成代码中...</p>
                </div>
              </div>
            ) : code ? (
              <div className="h-full">
                <MonacoEditor
                  value={code}
                  language={language}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Code className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-muted-foreground">代码将显示在这里</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="h-full m-0 data-[state=active]:flex-1">
            <div className="h-full">
              <MonacoEditor
                value={editorCode}
                language={language}
                onChange={setEditorCode}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
