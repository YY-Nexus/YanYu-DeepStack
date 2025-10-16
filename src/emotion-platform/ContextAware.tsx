"use client"

import React, { useState, useEffect } from 'react'
import { Lightbulb, MapPin, Clock, Users, Smartphone, Sun, Moon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface ContextData {
  location: string
  timeOfDay: string
  deviceType: string
  networkStatus: string
  batteryLevel: number
  lightLevel: string
  noiseLevel: string
  userActivity: string
}

interface ScenarioSuggestion {
  scenario: string
  confidence: number
  actions: string[]
  uiAdaptations: string[]
}

interface ContextAwareProps {
  onContextChange?: (context: ContextData) => void
  onScenarioDetected?: (scenario: ScenarioSuggestion) => void
}

export const ContextAware: React.FC<ContextAwareProps> = ({
  onContextChange,
  onScenarioDetected
}) => {
  const [contextData, setContextData] = useState<ContextData>({
    location: '学习环境',
    timeOfDay: '上午',
    deviceType: 'Desktop',
    networkStatus: 'WiFi',
    batteryLevel: 85,
    lightLevel: '充足',
    noiseLevel: '安静',
    userActivity: '编程学习'
  })

  const [currentScenario, setCurrentScenario] = useState<ScenarioSuggestion | null>(null)
  const [isAutoAdapt, setIsAutoAdapt] = useState(true)
  const [detectionHistory, setDetectionHistory] = useState<ScenarioSuggestion[]>([])

  // 模拟场景检测
  const detectScenario = () => {
    const scenarios = [
      {
        scenario: '专注学习模式',
        confidence: 0.9,
        actions: ['降低通知频率', '启用专注音效', '优化界面亮度'],
        uiAdaptations: ['简化界面', '隐藏干扰元素', '启用护眼模式']
      },
      {
        scenario: '创意编程模式',
        confidence: 0.85,
        actions: ['开启代码助手', '推荐创意资源', '启用灵感收集'],
        uiAdaptations: ['展开工具栏', '显示参考面板', '彩色代码主题']
      },
      {
        scenario: '协作学习模式',
        confidence: 0.8,
        actions: ['启用实时同步', '开启语音通话', '共享屏幕'],
        uiAdaptations: ['多人视图', '协作工具栏', '状态指示器']
      },
      {
        scenario: '休息放松模式',
        confidence: 0.75,
        actions: ['播放轻音乐', '显示放松提醒', '推荐休息活动'],
        uiAdaptations: ['柔和色彩', '减少信息密度', '大字体显示']
      }
    ]

    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)]
    setCurrentScenario(randomScenario)
    setDetectionHistory(prev => [...prev.slice(-4), randomScenario])
    onScenarioDetected?.(randomScenario)
  }

  // 模拟环境数据更新
  const updateContext = () => {
    const locations = ['学习环境', '图书馆', '咖啡厅', '宿舍', '教室']
    const timeOptions = ['早晨', '上午', '中午', '下午', '晚上', '深夜']
    const activities = ['编程学习', '阅读文档', '观看视频', '做练习', '项目开发']

    const newContext: ContextData = {
      ...contextData,
      location: locations[Math.floor(Math.random() * locations.length)],
      timeOfDay: timeOptions[Math.floor(Math.random() * timeOptions.length)],
      userActivity: activities[Math.floor(Math.random() * activities.length)],
      batteryLevel: Math.floor(Math.random() * 100),
      lightLevel: Math.random() > 0.5 ? '充足' : '较暗',
      noiseLevel: Math.random() > 0.5 ? '安静' : '嘈杂'
    }

    setContextData(newContext)
    onContextChange?.(newContext)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      updateContext()
      if (isAutoAdapt) {
        detectScenario()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoAdapt])

  const getScenarioIcon = (scenario: string) => {
    if (scenario.includes('专注')) return <Lightbulb className="w-4 h-4" />
    if (scenario.includes('创意')) return <Sun className="w-4 h-4" />
    if (scenario.includes('协作')) return <Users className="w-4 h-4" />
    if (scenario.includes('休息')) return <Moon className="w-4 h-4" />
    return <MapPin className="w-4 h-4" />
  }

  const getScenarioColor = (confidence: number) => {
    if (confidence > 0.8) return 'bg-green-500'
    if (confidence > 0.6) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* 智能感知控制 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="text-blue-500" />
            场景感知系统
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="auto-adapt"
              checked={isAutoAdapt}
              onCheckedChange={setIsAutoAdapt}
            />
            <Label htmlFor="auto-adapt">智能场景自适应</Label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-1">
              <MapPin className="w-6 h-6 mx-auto text-blue-500" />
              <div className="text-sm font-medium">{contextData.location}</div>
              <div className="text-xs text-gray-500">位置</div>
            </div>
            
            <div className="text-center space-y-1">
              <Clock className="w-6 h-6 mx-auto text-purple-500" />
              <div className="text-sm font-medium">{contextData.timeOfDay}</div>
              <div className="text-xs text-gray-500">时间</div>
            </div>
            
            <div className="text-center space-y-1">
              <Smartphone className="w-6 h-6 mx-auto text-green-500" />
              <div className="text-sm font-medium">{contextData.deviceType}</div>
              <div className="text-xs text-gray-500">设备</div>
            </div>
            
            <div className="text-center space-y-1">
              <Users className="w-6 h-6 mx-auto text-orange-500" />
              <div className="text-sm font-medium">{contextData.userActivity}</div>
              <div className="text-xs text-gray-500">活动</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 当前场景识别 */}
      {currentScenario && (
        <Card>
          <CardHeader>
            <CardTitle>智能场景识别</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getScenarioIcon(currentScenario.scenario)}
                  <span className="font-medium">{currentScenario.scenario}</span>
                </div>
                <Badge className={`${getScenarioColor(currentScenario.confidence)} text-white`}>
                  {(currentScenario.confidence * 100).toFixed(0)}% 确信度
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">🔧 智能操作建议</h4>
                  <div className="space-y-1">
                    {currentScenario.actions.map((action, index) => (
                      <Badge key={index} variant="secondary" className="mr-2">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">🎨 界面自适应</h4>
                  <div className="space-y-1">
                    {currentScenario.uiAdaptations.map((adaptation, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {adaptation}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 环境监测详情 */}
      <Card>
        <CardHeader>
          <CardTitle>环境监测详情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">网络状态</div>
              <Badge variant="outline">{contextData.networkStatus}</Badge>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-gray-500">电量水平</div>
              <Badge variant="outline">{contextData.batteryLevel}%</Badge>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-gray-500">光线环境</div>
              <Badge variant="outline">{contextData.lightLevel}</Badge>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-gray-500">噪音水平</div>
              <Badge variant="outline">{contextData.noiseLevel}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 历史场景记录 */}
      {detectionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>场景切换历史</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {detectionHistory.slice(-3).reverse().map((scenario, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {getScenarioIcon(scenario.scenario)}
                    <span className="text-sm">{scenario.scenario}</span>
                  </div>
                  <Badge variant="outline">
                    {(scenario.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}