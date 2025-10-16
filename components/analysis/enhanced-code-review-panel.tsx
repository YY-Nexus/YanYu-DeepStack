"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Code2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Eye,
  FileText,
  Users,
  Clock,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RotateCw
} from 'lucide-react'
import { SmartEditor } from '@/components/ui/monaco-editor'
import { useToast } from '@/lib/utils/client-toast'

interface ReviewComment {
  id: string
  line: number
  column: number
  message: string
  type: 'suggestion' | 'issue' | 'praise' | 'question'
  severity: 'low' | 'medium' | 'high'
  author: string
  timestamp: Date
}

interface CodeReviewResult {
  id: string
  title: string
  status: 'pending' | 'approved' | 'rejected' | 'needs-work'
  score: number
  comments: ReviewComment[]
  summary: string
  recommendations: string[]
  approvalRequired: boolean
}

interface CodeAnalysisResult {
  issues: Array<{
    type: 'error' | 'warning' | 'info' | 'suggestion'
    severity: 'critical' | 'major' | 'minor' | 'info'
    message: string
    line: number
    column: number
    rule: string
    suggestion?: string
  }>
  metrics: {
    complexity: number
    maintainabilityIndex: number
    technicalDebt: number
    codeSmells: number
    duplicateLines: number
    linesOfCode: number
  }
  score: number
  suggestions: string[]
}

export function EnhancedCodeReviewPanel() {
  const [activeTab, setActiveTab] = useState('review')
  const [code, setCode] = useState(`function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// TODO: 优化性能
console.log(fibonacci(10));`)
  const [language, setLanguage] = useState('javascript')
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null)
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedComment, setSelectedComment] = useState<ReviewComment | null>(null)
  
  const { toast } = useToast()

  const performCodeReview = async () => {
    if (!code.trim()) {
      toast({
        title: "错误",
        description: "请输入要评审的代码",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/code-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          title: '代码评审',
          author: '当前用户'
        }),
      })

      const result = await response.json()
      if (result.success) {
        setReviewResult(result.data)
        toast({
          title: "评审完成",
          description: `代码评审已完成，得分 ${result.data.score}/100`,
          variant: "default"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('代码评审失败:', error)
      toast({
        title: "错误",
        description: "代码评审失败，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const performCodeAnalysis = async () => {
    if (!code.trim()) {
      toast({
        title: "错误",
        description: "请输入要分析的代码",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/code-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          options: {
            checkSecurity: true,
            checkPerformance: true,
            checkMaintainability: true,
            checkComplexity: true
          }
        }),
      })

      const result = await response.json()
      if (result.success) {
        setAnalysisResult(result.data)
        toast({
          title: "分析完成",
          description: `代码分析已完成，发现 ${result.data.issues.length} 个问题`,
          variant: "default"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('代码分析失败:', error)
      toast({
        title: "错误",
        description: "代码分析失败，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      case 'needs-work': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-200'
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200'
      case 'needs-work': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default: return 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'major': return 'bg-orange-100 text-orange-800'
      case 'minor': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Sparkles className="h-3 w-3" />
      case 'issue': return <AlertTriangle className="h-3 w-3" />
      case 'praise': return <ThumbsUp className="h-3 w-3" />
      case 'question': return <MessageSquare className="h-3 w-3" />
      default: return <Eye className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* 头部控制区 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            智能代码评审与分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <label htmlFor="language-select" className="sr-only">
                选择语言
              </label>
              <select 
                id="language-select"
                aria-label="选择语言"
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
              </select>
              <Button 
                onClick={performCodeReview} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                开始评审
              </Button>
              <Button 
                onClick={performCodeAnalysis} 
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                代码分析
              </Button>
            </div>
            
            <div className="h-96 border rounded-md">
              <SmartEditor
                value={code}
                onChange={(value) => setCode(value || '')}
                language={language}
                height="h-96"
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  folding: true,
                  wordWrap: 'on'
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 结果展示区 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review">代码评审</TabsTrigger>
          <TabsTrigger value="analysis">质量分析</TabsTrigger>
          <TabsTrigger value="metrics">指标监控</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          {reviewResult ? (
            <div className="space-y-4">
              {/* 评审结果概览 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(reviewResult.status)}
                      {reviewResult.title}
                    </CardTitle>
                    <Badge className={getStatusColor(reviewResult.status)}>
                      {reviewResult.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">评分:</span>
                        <span className="text-lg font-bold">{reviewResult.score}/100</span>
                      </div>
                      <Progress value={reviewResult.score} className="flex-1 max-w-48" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{reviewResult.summary}</p>
                    
                    {reviewResult.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">建议:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {reviewResult.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 评审意见 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    评审意见 ({reviewResult.comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {reviewResult.comments.map((comment) => (
                        <div 
                          key={comment.id}
                          className="border rounded-lg p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedComment(comment)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-1 rounded ${
                              comment.type === 'praise' ? 'bg-green-100 text-green-600' :
                              comment.type === 'issue' ? 'bg-red-100 text-red-600' :
                              comment.type === 'suggestion' ? 'bg-blue-100 text-blue-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {getCommentTypeIcon(comment.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground">行 {comment.line}</span>
                                <Badge variant="outline" className="text-xs">
                                  {comment.type}
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${getSeverityColor(comment.severity)}`}>
                                  {comment.severity}
                                </Badge>
                              </div>
                              <p className="text-sm">{comment.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {comment.author} • {new Date(comment.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <Code2 className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">开始代码评审以查看结果</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis">
          {analysisResult ? (
            <div className="space-y-4">
              {/* 分析结果概览 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">质量评分</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{analysisResult.score}/100</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">发现问题</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{analysisResult.issues.length}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">可维护指数</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{analysisResult.metrics.maintainabilityIndex}</p>
                  </CardContent>
                </Card>
              </div>

              {/* 详细指标 */}
              <Card>
                <CardHeader>
                  <CardTitle>代码指标</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">复杂度</span>
                      <p className="text-lg font-semibold">{analysisResult.metrics.complexity}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">技术债务</span>
                      <p className="text-lg font-semibold">{analysisResult.metrics.technicalDebt}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">代码异味</span>
                      <p className="text-lg font-semibold">{analysisResult.metrics.codeSmells}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">重复行数</span>
                      <p className="text-lg font-semibold">{analysisResult.metrics.duplicateLines}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">代码行数</span>
                      <p className="text-lg font-semibold">{analysisResult.metrics.linesOfCode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 问题列表 */}
              {analysisResult.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>发现的问题</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {analysisResult.issues.map((issue, index) => (
                          <Alert key={index} className="p-3">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  行 {issue.line}:{issue.column}
                                </span>
                                <Badge variant="outline" className="text-xs">{issue.rule}</Badge>
                              </div>
                              <p className="text-sm">{issue.message}</p>
                              {issue.suggestion && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  建议: {issue.suggestion}
                                </p>
                              )}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* 改进建议 */}
              {analysisResult.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>改进建议</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">开始代码分析以查看详细结果</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>评审统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>总评审数</span>
                    <span className="font-semibold">42</span>
                  </div>
                  <div className="flex justify-between">
                    <span>平均评分</span>
                    <span className="font-semibold">78/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>通过率</span>
                    <span className="font-semibold">65%</span>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">常见问题</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 变量命名不规范</li>
                      <li>• 缺少错误处理</li>
                      <li>• 函数过长</li>
                      <li>• 注释不足</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>质量趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>本周平均分</span>
                    <span className="font-semibold text-green-600">↑ 82</span>
                  </div>
                  <div className="flex justify-between">
                    <span>本月平均分</span>
                    <span className="font-semibold">78</span>
                  </div>
                  <div className="flex justify-between">
                    <span>上月平均分</span>
                    <span className="font-semibold text-red-600">↓ 75</span>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">改进建议</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 加强代码规范培训</li>
                      <li>• 推广最佳实践</li>
                      <li>• 定期代码重构</li>
                      <li>• 增加单元测试覆盖率</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
