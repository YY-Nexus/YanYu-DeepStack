"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Zap,
  Code,
  Puzzle,
  Building,
  Download,
} from "lucide-react"
import { frameworkAnalyzer, type CompletenessReport, type AnalysisStatus } from "@/lib/analysis/framework-analyzer"

export default function FrameworkAnalysisDashboard() {
  const [report, setReport] = useState<CompletenessReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    generateReport()
  }, [])

  const generateReport = () => {
    setLoading(true)
    // 模拟异步操作
    setTimeout(() => {
      const newReport = frameworkAnalyzer.generateCompletenessReport()
      setReport(newReport)
      setLoading(false)
    }, 1000)
  }

  const getStatusColor = (status: AnalysisStatus) => {
    switch (status) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "satisfactory":
        return "text-yellow-600"
      case "needs-improvement":
        return "text-orange-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBadge = (status: AnalysisStatus) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">优秀</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">良好</Badge>
      case "satisfactory":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">满意</Badge>
      case "needs-improvement":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">需改进</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">严重问题</Badge>
      default:
        return <Badge>未知</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <RefreshCw className="h-8 w-8 text-cloud-blue-500 mx-auto mb-4" />
          </motion.div>
          <p className="text-muted-foreground">分析应用框架中...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">无法生成分析报告</p>
          <Button onClick={generateReport} className="mt-4">
            重试
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">应用框架分析</h2>
          <p className="text-muted-foreground">
            生成于 {report.generatedAt.toLocaleString("zh-CN", { hour12: false })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={generateReport} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            刷新分析
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 总体完成度卡片 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>总体完成度</span>
            {getStatusBadge(report.status)}
          </CardTitle>
          <CardDescription>应用框架整体完成情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">完成度</span>
                <span className={`text-sm font-bold ${getStatusColor(report.status)}`}>
                  {report.overallCompleteness.toFixed(1)}%
                </span>
              </div>
              <Progress value={report.overallCompleteness} className="h-2" />
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">待解决问题</div>
              <div className="text-xl font-bold">{report.issueCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 模块完成度 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {report.moduleBreakdown.map((module) => (
          <Card key={module.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{module.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">完成度</span>
                <span className="text-xs font-medium">{module.completeness.toFixed(1)}%</span>
              </div>
              <Progress value={module.completeness} className="h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 详细分析标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span>概览</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>改进建议</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>详细分析</span>
          </TabsTrigger>
        </TabsList>

        {/* 概览标签内容 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  核心功能完成度
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>AI代码生成</span>
                    <span>95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>应用开发</span>
                    <span>90%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>实时预览</span>
                    <span>85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>自动化生产</span>
                    <span>92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>文件审查</span>
                    <span>88%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>评分分析</span>
                    <span>94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>部署管理</span>
                    <span>93%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  企业级功能完成度
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>多租户架构</span>
                    <span>96%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>企业级认证</span>
                    <span>92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>阿里云集成</span>
                    <span>94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>本地服务器管理</span>
                    <span>90%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>企业支持服务</span>
                    <span>88%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>混合云管理</span>
                    <span>91%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5" />
                  集成能力完成度
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>阿里云服务</span>
                    <span>95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>本地服务器</span>
                    <span>92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ollama模型</span>
                    <span>88%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>数据流处理</span>
                    <span>90%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>数据湖</span>
                    <span>87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>边缘计算</span>
                    <span>85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  性能与安全
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span>页面加载速度</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span>响应时间</span>
                      <span>90%</span>
                    </div>
                    <Progress value={90} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span>认证机制</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span>数据加密</span>
                      <span>90%</span>
                    </div>
                    <Progress value={90} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span>输入验证</span>
                      <span>86%</span>
                    </div>
                    <Progress value={86} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 改进建议标签内容 */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>改进建议</CardTitle>
              <CardDescription>基于分析结果的优化建议</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-0.5">
                      <CheckCircle className="h-5 w-5 text-cloud-blue-500" />
                    </div>
                    <div>
                      <p>{recommendation}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 详细分析标签内容 */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>详细分析报告</CardTitle>
              <CardDescription>各模块详细分析结果</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">核心功能模块</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                      <div>模块名称</div>
                      <div>完成度</div>
                      <div>待解决问题</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>AI代码生成</div>
                      <div>
                        <Progress value={95} className="h-2" />
                        <span className="text-xs">95%</span>
                      </div>
                      <div>无</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>实时预览</div>
                      <div>
                        <Progress value={85} className="h-2" />
                        <span className="text-xs">85%</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          3D模型加载优化
                        </Badge>
                        <Badge variant="outline" className="text-xs ml-1">
                          HTML预览安全增强
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>文件审查</div>
                      <div>
                        <Progress value={88} className="h-2" />
                        <span className="text-xs">88%</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          大文件处理优化
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">企业级功能</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                      <div>功能名称</div>
                      <div>完成度</div>
                      <div>待解决问题</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>企业级认证</div>
                      <div>
                        <Progress value={92} className="h-2" />
                        <span className="text-xs">92%</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          SAML集成优化
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>本地服务器管理</div>
                      <div>
                        <Progress value={90} className="h-2" />
                        <span className="text-xs">90%</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          远程命令执行安全增强
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>企业支持服务</div>
                      <div>
                        <Progress value={88} className="h-2" />
                        <span className="text-xs">88%</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          SLA监控完善
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">安全性分析</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                      <div>安全方面</div>
                      <div>完成度</div>
                      <div>待解决问题</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>输入验证</div>
                      <div>
                        <Progress value={86} className="h-2" />
                        <span className="text-xs">86%</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          HTML预览输入验证增强
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>审计日志</div>
                      <div>
                        <Progress value={88} className="h-2" />
                        <span className="text-xs">88%</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          日志完整性优化
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
