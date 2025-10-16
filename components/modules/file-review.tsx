"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { 
  Search, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  BarChart3,
  Bug,
  Shield,
  Zap
} from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"

interface FileIssue {
  type: "error" | "warning" | "info"
  message: string
  line: number
  column: number
  severity: "high" | "medium" | "low"
}

interface ReviewResult {
  fileName: string
  fileSize: string
  language: string
  issues: FileIssue[]
  score: number
  metrics: {
    complexity: number
    maintainability: number
    security: number
    performance: number
  }
}

export default function FileReview() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [reviewResults, setReviewResults] = useState<ReviewResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 模拟文件分析
  const analyzeFiles = async () => {
    setIsAnalyzing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockResults: ReviewResult[] = selectedFiles.map((file, index) => ({
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      language: getLanguageFromExtension(file.name),
      score: 75 + Math.random() * 20,
      issues: [
        {
          type: "warning",
          message: "函数复杂度过高，建议拆分",
          line: 42,
          column: 5,
          severity: "medium"
        },
        {
          type: "error",
          message: "潜在的空指针引用",
          line: 18,
          column: 12,
          severity: "high"
        },
        {
          type: "info",
          message: "建议添加类型注释",
          line: 7,
          column: 3,
          severity: "low"
        }
      ],
      metrics: {
        complexity: Math.floor(Math.random() * 40) + 60,
        maintainability: Math.floor(Math.random() * 30) + 70,
        security: Math.floor(Math.random() * 25) + 75,
        performance: Math.floor(Math.random() * 35) + 65
      }
    }))

    setReviewResults(mockResults)
    setIsAnalyzing(false)
    setActiveTab("results")
  }

  const getLanguageFromExtension = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const langMap: Record<string, string> = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'go': 'Go',
      'rs': 'Rust',
      'php': 'PHP'
    }
    return langMap[ext || ''] || 'Unknown'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="h-4 w-4 text-red-500" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info": return <CheckCircle className="h-4 w-4 text-blue-500" />
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "success"
    if (score >= 60) return "warning"
    return "error"
  }

  const tabs = [
    { id: "upload", name: "上传文件", icon: <Upload className="h-4 w-4" /> },
    { id: "results", name: "分析结果", icon: <BarChart3 className="h-4 w-4" /> }
  ]

  return (
    <div className="h-full">
      <BrandCard variant="glass" className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-light-blue/10 to-mint-green/10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-light-blue to-mint-green rounded-xl flex items-center justify-center shadow-glow">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">文件审查模块</h2>
                <p className="text-gray-600">代码质量检测与安全分析</p>
              </div>
            </motion.div>
          </div>

          {/* 导航标签 */}
          <div className="px-6 pt-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-light-blue shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 p-6 overflow-auto">
            {activeTab === "upload" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 文件上传区 */}
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-light-blue transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">上传代码文件</h3>
                    <p className="text-gray-600 mb-4">支持 .js, .ts, .py, .java, .cpp 等格式</p>
                    <BrandButton variant="outline">选择文件</BrandButton>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".js,.ts,.py,.java,.cpp,.c,.go,.rs,.php"
                      onChange={handleFileSelect}
                      className="hidden"
                      aria-label="选择要分析的代码文件"
                      title="选择要分析的代码文件"
                    />
                  </motion.div>
                </div>

                {/* 已选择的文件 */}
                {selectedFiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">已选择的文件</h3>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <BrandCard key={index} variant="outlined" className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-light-blue" />
                              <div>
                                <p className="font-medium text-gray-800">{file.name}</p>
                                <p className="text-sm text-gray-600">
                                  {(file.size / 1024).toFixed(1)} KB • {getLanguageFromExtension(file.name)}
                                </p>
                              </div>
                            </div>
                            <BrandBadge variant="info" size="sm">
                              待分析
                            </BrandBadge>
                          </div>
                        </BrandCard>
                      ))}
                    </div>

                    {/* 分析按钮 */}
                    <div className="mt-6 text-center">
                      <BrandButton
                        variant="gradient"
                        size="lg"
                        onClick={analyzeFiles}
                        loading={isAnalyzing}
                        icon={<Search className="h-4 w-4" />}
                      >
                        {isAnalyzing ? "分析中..." : "开始分析"}
                      </BrandButton>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "results" && reviewResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {reviewResults.map((result, index) => (
                  <BrandCard key={index} variant="glass" className="p-6">
                    {/* 文件信息头部 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-light-blue" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{result.fileName}</h3>
                          <p className="text-sm text-gray-600">{result.fileSize} • {result.language}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BrandBadge variant={getScoreColor(result.score)} size="lg">
                          质量分: {result.score.toFixed(0)}/100
                        </BrandBadge>
                      </div>
                    </div>

                    {/* 质量指标 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Zap className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600">复杂度</p>
                        <p className="font-semibold text-gray-800">{result.metrics.complexity}/100</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600">可维护性</p>
                        <p className="font-semibold text-gray-800">{result.metrics.maintainability}/100</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Shield className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-sm text-gray-600">安全性</p>
                        <p className="font-semibold text-gray-800">{result.metrics.security}/100</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Bug className="h-6 w-6 text-yellow-600" />
                        </div>
                        <p className="text-sm text-gray-600">性能</p>
                        <p className="font-semibold text-gray-800">{result.metrics.performance}/100</p>
                      </div>
                    </div>

                    {/* 问题列表 */}
                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-3">发现的问题</h4>
                      <div className="space-y-2">
                        {result.issues.map((issue, issueIndex) => (
                          <div
                            key={issueIndex}
                            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                          >
                            {getIssueIcon(issue.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{issue.message}</p>
                              <p className="text-xs text-gray-600">
                                第 {issue.line} 行, 第 {issue.column} 列 • 
                                <BrandBadge 
                                  variant={issue.severity === "high" ? "error" : issue.severity === "medium" ? "warning" : "info"} 
                                  size="sm" 
                                  className="ml-1"
                                >
                                  {issue.severity === "high" ? "高" : issue.severity === "medium" ? "中" : "低"}
                                </BrandBadge>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </BrandCard>
                ))}
              </motion.div>
            )}

            {activeTab === "results" && reviewResults.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无分析结果</h3>
                <p className="text-gray-600 mb-4">请先上传文件进行分析</p>
                <BrandButton 
                  variant="gradient" 
                  onClick={() => setActiveTab("upload")}
                >
                  上传文件
                </BrandButton>
              </div>
            )}
          </div>
        </div>
      </BrandCard>
    </div>
  )
}
