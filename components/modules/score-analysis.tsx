"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter
} from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"
import styles from "./score-analysis.module.css"

interface ScoreData {
  date: string
  overall: number
  performance: number
  security: number
  maintainability: number
  complexity: number
}

interface RecommendationItem {
  type: "critical" | "warning" | "suggestion"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  effort: "low" | "medium" | "high"
}

export default function ScoreAnalysis() {
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("overall")
  const [scoreData, setScoreData] = useState<ScoreData[]>([])
  const [currentScore, setCurrentScore] = useState(0)
  const [trend, setTrend] = useState(0)

  // 模拟数据生成
  useEffect(() => {
    const generateMockData = () => {
      const data: ScoreData[] = []
      const baseDate = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(baseDate)
        date.setDate(baseDate.getDate() - i)
        
        data.push({
          date: date.toISOString().split('T')[0],
          overall: 75 + Math.random() * 20,
          performance: 70 + Math.random() * 25,
          security: 80 + Math.random() * 15,
          maintainability: 65 + Math.random() * 30,
          complexity: 60 + Math.random() * 35
        })
      }
      
      setScoreData(data)
      setCurrentScore(data[data.length - 1]?.overall || 0)
      
      // 计算趋势
      if (data.length >= 2) {
        const current = data[data.length - 1][selectedMetric as keyof ScoreData] as number
        const previous = data[data.length - 2][selectedMetric as keyof ScoreData] as number
        setTrend(current - previous)
      }
    }

    generateMockData()
  }, [selectedMetric, timeRange])

  const recommendations: RecommendationItem[] = [
    {
      type: "critical",
      title: "修复安全漏洞",
      description: "发现3个高危安全问题需要立即处理",
      impact: "high",
      effort: "medium"
    },
    {
      type: "warning",
      title: "减少代码复杂度",
      description: "5个函数的圈复杂度超过建议值",
      impact: "medium",
      effort: "high"
    },
    {
      type: "suggestion",
      title: "添加单元测试",
      description: "测试覆盖率仅为45%，建议提升至80%以上",
      impact: "medium",
      effort: "medium"
    },
    {
      type: "suggestion",
      title: "优化代码注释",
      description: "部分函数缺少文档注释",
      impact: "low",
      effort: "low"
    }
  ]

  const metrics = [
    { key: "overall", name: "总体评分", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "performance", name: "性能", icon: <TrendingUp className="h-4 w-4" /> },
    { key: "security", name: "安全性", icon: <AlertCircle className="h-4 w-4" /> },
    { key: "maintainability", name: "可维护性", icon: <CheckCircle className="h-4 w-4" /> },
    { key: "complexity", name: "复杂度", icon: <Target className="h-4 w-4" /> }
  ]

  const timeRanges = [
    { key: "7d", name: "最近7天" },
    { key: "30d", name: "最近30天" },
    { key: "90d", name: "最近90天" }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "success"
    if (score >= 60) return "warning"
    return "error"
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "critical": return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning": return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "suggestion": return <CheckCircle className="h-5 w-5 text-blue-500" />
      default: return <CheckCircle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="h-full">
      <BrandCard variant="glass" className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-coral-pink/10 to-lemon-yellow/10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-coral-pink to-lemon-yellow rounded-xl flex items-center justify-center shadow-glow">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">评分分析模块</h2>
                  <p className="text-gray-600">质量评估与优化建议</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-pink/50"
                  title="选择时间范围"
                >
                  {timeRanges.map((range) => (
                    <option key={range.key} value={range.key}>
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            <div className="space-y-6">
              {/* 总体评分卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BrandCard variant="glass" className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="2"
                          strokeDasharray={`${currentScore}, 100`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>
                          {currentScore.toFixed(0)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">总体评分</h3>
                    <div className="flex items-center justify-center space-x-2">
                      <BrandBadge variant={getScoreBadgeVariant(currentScore)}>
                        {currentScore >= 80 ? "优秀" : currentScore >= 60 ? "良好" : "需改进"}
                      </BrandBadge>
                      {trend !== 0 && (
                        <div className={`flex items-center space-x-1 text-sm ${
                          trend > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          <span>{Math.abs(trend).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </BrandCard>

                <BrandCard variant="outlined" className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Award className="h-6 w-6 text-lemon-yellow" />
                    <h3 className="text-lg font-semibold text-gray-800">目标达成</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">本周目标</span>
                      <span className="text-sm font-medium text-green-600">已达成</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-green-500 h-2 rounded-full transition-all duration-500 ${styles.progressBar}`}
                        data-width={Math.min((currentScore / 80) * 100, 100)} // 通过 data 属性传递宽度
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>目标: 80分</span>
                      <span>当前: {currentScore.toFixed(0)}分</span>
                    </div>
                  </div>
                </BrandCard>

                <BrandCard variant="outlined" className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="h-6 w-6 text-coral-pink" />
                    <h3 className="text-lg font-semibold text-gray-800">改进趋势</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-coral-pink mb-1">+12%</div>
                    <div className="text-sm text-gray-600">较上周提升</div>
                    <div className="mt-3 flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div
                          key={day}
                          className={`w-2 bg-coral-pink rounded-full transition-all duration-300 ${styles.trendBar}`}
                          data-bar-height={Math.random() * 20 + 10} // 用 data 属性传递高度
                        />
                      ))}
                    </div>
                  </div>
                </BrandCard>
              </div>

              {/* 指标选择器 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">详细指标</h3>
                <div className="flex flex-wrap gap-2">
                  {metrics.map((metric) => (
                    <BrandButton
                      key={metric.key}
                      variant={selectedMetric === metric.key ? "gradient" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMetric(metric.key)}
                      icon={metric.icon}
                    >
                      {metric.name}
                    </BrandButton>
                  ))}
                </div>
              </div>

              {/* 趋势图表区域 */}
              <BrandCard variant="outlined" className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {metrics.find(m => m.key === selectedMetric)?.name} 趋势
                </h3>
                <div className="h-48 flex items-end justify-between space-x-2">
                  {scoreData.map((data, index) => {
                    const value = data[selectedMetric as keyof ScoreData] as number
                    const height = (value / 100) * 100
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: index * 0.1 }}
                          className={`w-full bg-gradient-to-t from-coral-pink to-lemon-yellow rounded-t ${styles["min-h-4px"]}`}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(data.date).getDate()}日
                        </div>
                      </div>
                    )
                  })}
                </div>
              </BrandCard>

              {/* 优化建议 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">优化建议</h3>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <BrandCard variant="outlined" className="p-4">
                        <div className="flex items-start space-x-4">
                          {getRecommendationIcon(rec.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-800">{rec.title}</h4>
                              <div className="flex space-x-2">
                                <BrandBadge 
                                  variant={rec.impact === "high" ? "error" : rec.impact === "medium" ? "warning" : "info"} 
                                  size="sm"
                                >
                                  影响: {rec.impact === "high" ? "高" : rec.impact === "medium" ? "中" : "低"}
                                </BrandBadge>
                                <BrandBadge 
                                  variant={rec.effort === "high" ? "error" : rec.effort === "medium" ? "warning" : "success"} 
                                  size="sm"
                                >
                                  工作量: {rec.effort === "high" ? "高" : rec.effort === "medium" ? "中" : "低"}
                                </BrandBadge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                        </div>
                      </BrandCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </BrandCard>
    </div>
  )
}
