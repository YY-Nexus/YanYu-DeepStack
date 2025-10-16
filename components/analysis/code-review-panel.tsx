"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CodeReviewPanelProps {
  activeTab?: 'reviews' | 'issues' | 'metrics' | 'reports'
}
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  GitBranch,
  Users,
  MessageSquare,
  Star,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeReviewItem {
  id: string
  title: string
  description: string
  author: string
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected' | 'draft'
  priority: 'low' | 'medium' | 'high' | 'critical'
  filesChanged: number
  linesAdded: number
  linesRemoved: number
  comments: number
  approvals: number
  branch: string
  assignees: string[]
  labels: string[]
  score?: number
}

interface CodeIssue {
  id: string
  type: 'error' | 'warning' | 'info' | 'suggestion'
  severity: 'critical' | 'major' | 'minor' | 'info'
  message: string
  file: string
  line: number
  column: number
  rule: string
  suggestion?: string
}

export function CodeReviewPanel({ activeTab: propActiveTab }: CodeReviewPanelProps = {}) {
  const [internalActiveTab, setInternalActiveTab] = useState('reviews')
  const activeTab = propActiveTab ?? internalActiveTab
  const setActiveTab = useCallback((tab: string) => {
    setInternalActiveTab(tab)
  }, [])
  const [reviews, setReviews] = useState<CodeReviewItem[]>([])
  const [issues, setIssues] = useState<CodeIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 模拟数据
  useEffect(() => {
    const mockReviews: CodeReviewItem[] = [
      {
        id: '1',
        title: '实现用户认证系统',
        description: '添加JWT认证和权限管理功能',
        author: '张三',
        createdAt: new Date('2024-12-25'),
        status: 'pending',
        priority: 'high',
        filesChanged: 12,
        linesAdded: 245,
        linesRemoved: 38,
        comments: 3,
        approvals: 1,
        branch: 'feature/auth-system',
        assignees: ['李四', '王五'],
        labels: ['enhancement', 'security'],
        score: 85
      },
      {
        id: '2',
        title: '优化数据库查询性能',
        description: '重构复杂查询，添加索引优化',
        author: '李四',
        createdAt: new Date('2024-12-24'),
        status: 'approved',
        priority: 'medium',
        filesChanged: 5,
        linesAdded: 89,
        linesRemoved: 156,
        comments: 8,
        approvals: 2,
        branch: 'perf/db-optimization',
        assignees: ['张三'],
        labels: ['performance', 'database'],
        score: 92
      }
    ]

    const mockIssues: CodeIssue[] = [
      {
        id: '1',
        type: 'error',
        severity: 'critical',
        message: '潜在的安全漏洞：SQL注入风险',
        file: 'src/api/users.ts',
        line: 45,
        column: 12,
        rule: 'security/no-sql-injection',
        suggestion: '使用参数化查询或ORM'
      },
      {
        id: '2',
        type: 'warning',
        severity: 'major',
        message: '函数复杂度过高',
        file: 'src/utils/data-processor.ts',
        line: 123,
        column: 8,
        rule: 'complexity/max-complexity',
        suggestion: '考虑将函数拆分为更小的函数'
      },
      {
        id: '3',
        type: 'info',
        severity: 'minor',
        message: '缺少类型注解',
        file: 'src/components/UserCard.tsx',
        line: 28,
        column: 15,
        rule: 'typescript/explicit-types',
        suggestion: '添加明确的类型定义'
      }
    ]

    setReviews(mockReviews)
    setIssues(mockIssues)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />
      case 'major': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'minor': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const filteredReviews = reviews.filter(review => 
    filterStatus === 'all' || review.status === filterStatus
  )

  const startReview = useCallback(async (reviewId: string) => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('开始评审:', reviewId)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">代码评审</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            过滤
          </Button>
          <Button size="sm">
            <FileText className="w-4 h-4 mr-2" />
            新建评审
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reviews">评审列表</TabsTrigger>
          <TabsTrigger value="issues">代码问题</TabsTrigger>
          <TabsTrigger value="metrics">质量指标</TabsTrigger>
          <TabsTrigger value="reports">评审报告</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <div className="flex space-x-2 mb-4">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
              >
                {status === 'all' ? '全部' : 
                 status === 'pending' ? '待评审' :
                 status === 'approved' ? '已通过' : '已拒绝'}
              </Button>
            ))}
          </div>

          <div className="grid gap-4">
            {filteredReviews.map(review => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{review.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{review.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(review.status)}>
                        {review.status}
                      </Badge>
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        getPriorityColor(review.priority)
                      )} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{review.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-mono">{review.branch}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{review.filesChanged} 文件</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{review.comments} 评论</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4 text-sm text-muted-foreground">
                      <span className="text-green-600">+{review.linesAdded}</span>
                      <span className="text-red-600">-{review.linesRemoved}</span>
                      <span>{review.approvals} 人通过</span>
                    </div>
                    
                    {review.score && (
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{review.score}/100</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => startReview(review.id)}
                      disabled={loading}
                    >
                      开始评审
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="grid gap-3">
            {issues.map(issue => (
              <Card key={issue.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{issue.message}</p>
                        <Badge variant="outline" className="text-xs">
                          {issue.rule}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {issue.file}:{issue.line}:{issue.column}
                      </p>
                      {issue.suggestion && (
                        <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          💡 {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">代码覆盖率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">85%</div>
                <Progress value={85} className="h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">技术债务</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">2.5h</div>
                <p className="text-xs text-muted-foreground">预计修复时间</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">代码重复率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">3.2%</div>
                <Progress value={3.2} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">安全评分</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">A+</div>
                <p className="text-xs text-muted-foreground">无已知漏洞</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>质量趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                质量趋势图表 (可集成 Chart.js 或 Recharts)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>评审报告</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">本周统计</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 完成评审: 12 个</li>
                      <li>• 发现问题: 25 个</li>
                      <li>• 修复问题: 18 个</li>
                      <li>• 平均评审时间: 2.3 小时</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">团队表现</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 张三: 评审了 5 个 PR</li>
                      <li>• 李四: 评审了 3 个 PR</li>
                      <li>• 王五: 评审了 4 个 PR</li>
                      <li>• 平均响应时间: 4 小时</li>
                    </ul>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button className="w-full" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    导出详细报告
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CodeReviewPanel
