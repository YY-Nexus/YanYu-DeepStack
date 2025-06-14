"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, Code, FileText, CuboidIcon as Cube, Split, Maximize2, Download, Share2 } from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"
import MonacoEditor from "@/components/ui/monaco-editor"
import MarkdownPreview from "@/components/ui/markdown-preview"
import Model3DPreview from "@/components/ui/model-3d-preview"

type PreviewType = "code" | "markdown" | "3d" | "html"
type LayoutMode = "split" | "preview-only" | "editor-only"

export default function RealTimePreview() {
  const [previewType, setPreviewType] = useState<PreviewType>("code")
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 默认内容
  const defaultContent = {
    code: `// 欢迎使用言語云³实时预览
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 生成斐波那契数列
const sequence = [];
for (let i = 0; i < 10; i++) {
  sequence.push(fibonacci(i));
}

console.log("斐波那契数列:", sequence);
// 输出: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`,
    markdown: `# 言語云³ 深度堆栈全栈智创引擎

## 功能特色

### 🤖 AI代码生成
- 支持多种编程语言
- 智能代码补全
- 质量评分分析

### 👁️ 实时预览
- **代码高亮**：支持语法高亮和错误提示
- **Markdown渲染**：实时预览Markdown文档
- **3D模型**：支持GLB/OBJ格式预览
- **HTML预览**：即时HTML渲染

### 🛠️ 应用开发
- 低代码可视化开发
- 拖拽式界面搭建
- 组件库复用

## 技术栈

\`\`\`javascript
const techStack = {
  frontend: ["Next.js", "React", "TypeScript"],
  styling: ["Tailwind CSS", "Framer Motion"],
  3d: ["Three.js", "React Three Fiber"],
  ui: ["Radix UI", "Monaco Editor"]
};
\`\`\`

> 万象归元于云枢，深栈智启新纪元`,
    html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>言語云³ 演示页面</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 2.5rem;
            font-weight: bold;
            background: linear-gradient(45deg, #1890FF, #4ECDC4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .feature {
            display: flex;
            align-items: center;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .feature-icon {
            font-size: 1.5rem;
            margin-right: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">言語云³</div>
            <p>深度堆栈全栈智创引擎</p>
        </div>
        
        <div class="feature">
            <span class="feature-icon">🤖</span>
            <div>
                <h3>AI代码生成</h3>
                <p>智能生成高质量代码，支持多种编程语言</p>
            </div>
        </div>
        
        <div class="feature">
            <span class="feature-icon">👁️</span>
            <div>
                <h3>实时预览</h3>
                <p>支持代码、Markdown、3D模型的实时预览</p>
            </div>
        </div>
        
        <div class="feature">
            <span class="feature-icon">🛠️</span>
            <div>
                <h3>应用开发</h3>
                <p>低代码可视化开发，快速构建应用</p>
            </div>
        </div>
    </div>
</body>
</html>`,
  }

  // 初始化内容
  useEffect(() => {
    setContent(defaultContent[previewType] || "")
  }, [previewType])

  const previewTypes = [
    { id: "code", name: "代码", icon: Code, color: "primary" },
    { id: "markdown", name: "Markdown", icon: FileText, color: "success" },
    { id: "3d", name: "3D模型", icon: Cube, color: "warning" },
    { id: "html", name: "HTML", icon: Eye, color: "info" },
  ] as const

  const languages = ["javascript", "typescript", "python", "java", "cpp", "html", "css", "json", "xml"]

  return (
    <div className="h-full">
      <BrandCard variant="glass" className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 头部控制区 */}
          <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-cloud-blue-50 to-mint-green/10">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-sky-blue to-mint-green rounded-xl flex items-center justify-center shadow-glow">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">实时预览</h2>
                  <p className="text-sm text-gray-600">多格式内容实时预览与编辑</p>
                </div>
              </motion.div>

              <div className="flex items-center space-x-2">
                {/* 布局模式切换 */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { mode: "editor-only", icon: Code, tooltip: "仅编辑器" },
                    { mode: "split", icon: Split, tooltip: "分屏模式" },
                    { mode: "preview-only", icon: Eye, tooltip: "仅预览" },
                  ].map(({ mode, icon: Icon, tooltip }) => (
                    <motion.button
                      key={mode}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLayoutMode(mode as LayoutMode)}
                      className={`p-2 rounded-md transition-colors ${
                        layoutMode === mode
                          ? "bg-white shadow-sm text-cloud-blue-500"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      title={tooltip}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.button>
                  ))}
                </div>

                {/* 操作按钮 */}
                <BrandButton variant="outline" size="sm" icon={<Download className="h-4 w-4" />}>
                  导出
                </BrandButton>
                <BrandButton variant="outline" size="sm" icon={<Share2 className="h-4 w-4" />}>
                  分享
                </BrandButton>
                <BrandButton
                  variant="ghost"
                  size="sm"
                  icon={<Maximize2 className="h-4 w-4" />}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? "退出全屏" : "全屏"}
                </BrandButton>
              </div>
            </div>

            {/* 预览类型选择 */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex space-x-2">
                {previewTypes.map(({ id, name, icon: Icon, color }) => (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPreviewType(id as PreviewType)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      previewType === id
                        ? "bg-cloud-blue-500 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{name}</span>
                  </motion.button>
                ))}
              </div>

              {/* 语言选择（仅代码模式显示） */}
              {previewType === "code" && (
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 主内容区 */}
          <div className="flex-1 flex overflow-hidden">
            <AnimatePresence mode="wait">
              {layoutMode === "split" && (
                <motion.div
                  key="split"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex w-full h-full"
                >
                  {/* 编辑器区域 */}
                  <div className="w-1/2 border-r border-gray-200/50">
                    <EditorPanel
                      previewType={previewType}
                      content={content}
                      language={language}
                      onChange={setContent}
                    />
                  </div>
                  {/* 预览区域 */}
                  <div className="w-1/2">
                    <PreviewPanel previewType={previewType} content={content} language={language} />
                  </div>
                </motion.div>
              )}

              {layoutMode === "editor-only" && (
                <motion.div
                  key="editor-only"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <EditorPanel previewType={previewType} content={content} language={language} onChange={setContent} />
                </motion.div>
              )}

              {layoutMode === "preview-only" && (
                <motion.div
                  key="preview-only"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <PreviewPanel previewType={previewType} content={content} language={language} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </BrandCard>
    </div>
  )
}

// 编辑器面板组件
function EditorPanel({
  previewType,
  content,
  language,
  onChange,
}: {
  previewType: PreviewType
  content: string
  language: string
  onChange: (value: string) => void
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 bg-gray-50 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">编辑器</h3>
          <BrandBadge variant="info" size="sm">
            {previewType === "code" ? language.toUpperCase() : previewType.toUpperCase()}
          </BrandBadge>
        </div>
      </div>
      <div className="flex-1">
        {previewType === "3d" ? (
          <Model3DUploader onChange={onChange} />
        ) : (
          <MonacoEditor
            value={content}
            language={previewType === "markdown" ? "markdown" : previewType === "html" ? "html" : language}
            onChange={onChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
        )}
      </div>
    </div>
  )
}

// 预览面板组件
function PreviewPanel({
  previewType,
  content,
  language,
}: {
  previewType: PreviewType
  content: string
  language: string
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 bg-gray-50 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">预览</h3>
          <BrandBadge variant="success" size="sm">
            实时同步
          </BrandBadge>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {previewType === "code" && <CodePreview content={content} language={language} />}
        {previewType === "markdown" && <MarkdownPreview content={content} />}
        {previewType === "3d" && <Model3DPreview modelUrl={content} />}
        {previewType === "html" && <HTMLPreview content={content} />}
      </div>
    </div>
  )
}

// 3D模型上传组件
function Model3DUploader({ onChange }: { onChange: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onChange(url)
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-24 h-24 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-2xl flex items-center justify-center mx-auto mb-4 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Cube className="h-12 w-12 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">上传3D模型</h3>
        <p className="text-sm text-gray-600 mb-4">支持 GLB、OBJ、FBX 格式</p>
        <BrandButton variant="outline" onClick={() => fileInputRef.current?.click()}>
          选择文件
        </BrandButton>
        <input ref={fileInputRef} type="file" accept=".glb,.obj,.fbx" onChange={handleFileUpload} className="hidden" />
      </div>
    </div>
  )
}

// 代码预览组件
function CodePreview({ content, language }: { content: string; language: string }) {
  return (
    <div className="h-full p-4">
      <div className="bg-gray-900 rounded-lg h-full overflow-auto">
        <pre className="p-4 text-green-400 font-mono text-sm">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  )
}

// HTML预览组件
function HTMLPreview({ content }: { content: string }) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 验证HTML内容
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, "text/html")
      if (doc.querySelector("parsererror")) {
        setError("HTML解析错误，请检查语法")
      } else {
        setError(null)
      }
    } catch (err) {
      setError("HTML验证失败")
    }
  }, [content])

  return (
    <div className="h-full relative">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-red-500 text-center p-4">
            <div className="font-bold mb-2">预览错误</div>
            <div>{error}</div>
          </div>
        </div>
      ) : (
        <iframe
          srcDoc={content}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          title="HTML预览"
          onError={() => setError("预览加载失败")}
        />
      )}
    </div>
  )
}
