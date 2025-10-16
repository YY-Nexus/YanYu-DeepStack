"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Cpu, 
  Shield, 
  Zap, 
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Code,
  Database,
  Network
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalysisResult {
  id: string
  type: 'security' | 'performance' | 'quality' | 'maintainability'
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  score: number
  files: string[]
  suggestions: string[]
  autoFixAvailable: boolean
}

interface CodeMetrics {
  complexity: number
  maintainabilityIndex: number
  technicalDebt: number
  codeSmells: number
  coverage: number
  duplicateLines: number
  linesOfCode: number
}

export function IntelligentCodeAnalysis() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [metrics, setMetrics] = useState<CodeMetrics | null>(null)
  const [progress, setProgress] = useState(0)

  // 模拟分析过程
  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setProgress(0)

    // 模拟分析进度
    const steps = [
      { name: '扫描代码文件', progress: 20 },
      { name: '分析语法结构', progress: 40 },
      { name: '检测安全问题', progress: 60 },
      { name: '评估性能风险', progress: 80 },
      { name: '生成报告', progress: 100 }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setProgress(step.progress)
    }

    // 模拟分析结果
    const mockResults: AnalysisResult[] = [
      {
        id: '1',
        type: 'security',
        title: 'SQL注入风险',
        description: '发现潜在的SQL注入漏洞，建议使用参数化查询',
        severity: 'critical',
        score: 25,
        files: ['src/api/users.ts', 'src/services/database.ts'],
        suggestions: [
          '使用参数化查询替代字符串拼接',
          '实施输入验证和清理',
          '使用ORM框架如Prisma或TypeORM'
        ],
        autoFixAvailable: true
      },
      {
        id: '2',
        type: 'performance',
        title: '内存泄漏风险',
        description: '检测到可能的内存泄漏，事件监听器未正确清理',
        severity: 'high',
        score: 40,
        files: ['src/components/RealTimeChart.tsx'],
        suggestions: [
          '在useEffect的cleanup函数中移除事件监听器',
          '使用AbortController取消异步请求',
          '检查定时器是否正确清除'
        ],
        autoFixAvailable: true
      },
      {
        id: '3',
        type: 'quality',
        title: '代码复杂度过高',
        description: '函数圈复杂度超过推荐值，建议重构',
        severity: 'medium',
        score: 65,
        files: ['src/utils/dataProcessor.ts'],
        suggestions: [
          '将复杂函数拆分为更小的函数',
          '使用策略模式减少条件分支',
          '提取公共逻辑到工具函数'
        ],
        autoFixAvailable: false
      },
      {
        id: '4',
        type: 'maintainability',
        title: '缺少类型定义',
        description: '部分函数和变量缺少明确的类型注解',
        severity: 'low',
        score: 80,
        files: ['src/hooks/useApi.ts', 'src/components/DataTable.tsx'],
        suggestions: [
          '为所有函数参数添加类型注解',
          '定义接口类型替代any类型',
          '启用严格的TypeScript配置'
        ],
        autoFixAvailable: true
      }
    ]

    const mockMetrics: CodeMetrics = {
      complexity: 7.2,
      maintainabilityIndex: 68,
      technicalDebt: 4.5,
      codeSmells: 12,
      coverage: 85,
      duplicateLines: 156,
      linesOfCode: 15420
    }

    setAnalysisResults(mockResults)
    setMetrics(mockMetrics)
    setIsAnalyzing(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-5 h-5" />
      case 'performance': return <Zap className="w-5 h-5" />
      case 'quality': return <Target className="w-5 h-5" />
      case 'maintainability': return <Code className="w-5 h-5" />
      default: return <Brain className="w-5 h-5" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">智能代码分析</h2>
          <p className="text-muted-foreground">AI驱动的代码质量分析和建议</p>
        </div>
        <Button 
          onClick={runAnalysis} 
          disabled={isAnalyzing}
          className="relative"
        >
          <Brain className="w-4 h-4 mr-2" />
          {isAnalyzing ? '分析中...' : '开始分析'}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-primary/20 rounded-md animate-pulse" />
          )}
        </Button>
      </div>

      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">分析进度</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                正在使用AI引擎分析代码质量、安全性和性能...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {metrics && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="issues">问题列表</TabsTrigger>
            <TabsTrigger value="metrics">代码指标</TabsTrigger>
            <TabsTrigger value="recommendations">建议</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总体评分</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68/100</div>
                  <p className="text-xs text-muted-foreground">
                    较上次 +5 分
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">安全评分</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">25/100</div>
                  <p className="text-xs text-muted-foreground">
                    发现 2 个关键问题
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">性能评分</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">72/100</div>
                  <p className="text-xs text-muted-foreground">
                    需要优化 3 个区域
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">可维护性</CardTitle>
                  <Code className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">85/100</div>
                  <p className="text-xs text-muted-foreground">
                    代码结构良好
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">关键问题</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResults.filter(r => r.severity === 'critical' || r.severity === 'high').map(result => (
                    <div key={result.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={cn("p-1 rounded", getSeverityColor(result.severity))}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{result.title}</h4>
                        <p className="text-sm text-muted-foreground">{result.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className={getSeverityColor(result.severity)}>
                            {result.severity}
                          </Badge>
                          {result.autoFixAvailable && (
                            <Badge variant="secondary">
                              <Cpu className="w-3 h-3 mr-1" />
                              自动修复
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">分析统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">代码覆盖率</span>
                      <span className="text-sm font-medium">{metrics.coverage}%</span>
                    </div>
                    <Progress value={metrics.coverage} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">可维护性指数</span>
                      <span className="text-sm font-medium">{metrics.maintainabilityIndex}/100</span>
                    </div>
                    <Progress value={metrics.maintainabilityIndex} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold">{metrics.codeSmells}</div>
                      <div className="text-xs text-muted-foreground">代码异味</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{metrics.technicalDebt}h</div>
                      <div className="text-xs text-muted-foreground">技术债务</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <div className="space-y-4">
              {analysisResults.map(result => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn("p-2 rounded", getSeverityColor(result.severity))}>
                          {getTypeIcon(result.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{result.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(result.severity)}>
                          {result.severity}
                        </Badge>
                        <div className={cn("text-lg font-bold", getScoreColor(result.score))}>
                          {result.score}/100
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">影响文件</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.files.map(file => (
                            <Badge key={file} variant="outline" className="font-mono text-xs">
                              {file}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">修复建议</h4>
                        <ul className="space-y-1">
                          {result.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <span className="mr-2">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-end space-x-2">
                        {result.autoFixAvailable && (
                          <Button size="sm" variant="outline">
                            <Cpu className="w-4 h-4 mr-2" />
                            自动修复
                          </Button>
                        )}
                        <Button size="sm">
                          查看详情
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">圈复杂度</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{metrics.complexity}</div>
                  <Progress value={(metrics.complexity / 10) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    建议保持在 10 以下
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">重复代码</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{metrics.duplicateLines}</div>
                  <p className="text-xs text-muted-foreground">
                    重复行数 / 总行数: {Math.round((metrics.duplicateLines / metrics.linesOfCode) * 100)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">代码行数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{metrics.linesOfCode.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    不包括注释和空行
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>代码质量趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  代码质量趋势图表 (可集成图表库)
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI 智能建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">优先修复安全问题</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          检测到 SQL 注入风险，这是一个关键安全漏洞。建议立即修复，可以将整体安全评分提升到 85 分以上。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">代码结构优秀</h4>
                        <p className="text-sm text-green-700 mt-1">
                          您的代码遵循了良好的设计模式，可维护性指数较高。继续保持这种编码风格。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">性能优化建议</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          考虑实施懒加载和代码分割，这可以将应用启动时间减少约 30%。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Database className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-800">数据库优化</h4>
                        <p className="text-sm text-purple-700 mt-1">
                          添加适当的数据库索引可以将查询性能提升 60%。建议对frequently accessed columns添加索引。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default IntelligentCodeAnalysis
