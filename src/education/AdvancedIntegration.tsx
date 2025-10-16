import React, { useState, useCallback, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"

// AI智能编程助手
export const AICodeAssistant: React.FC<{
  currentCode: string
  educationLevel: string
  onSuggestion: (suggestion: string) => void
}> = ({ currentCode, educationLevel, onSuggestion }) => {
  const [isActive, setIsActive] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [currentTip, setCurrentTip] = useState("")

  // 智能代码分析
  const analyzeCode = useCallback((code: string) => {
    const analysis = {
      complexity: calculateComplexity(code),
      errors: detectErrors(code),
      improvements: generateImprovements(code, educationLevel)
    }
    return analysis
  }, [educationLevel])

  // 计算代码复杂度
  const calculateComplexity = (code: string): 'simple' | 'medium' | 'complex' => {
    const componentCount = (code.match(/<[A-Z]/g) || []).length
    if (componentCount < 3) return 'simple'
    if (componentCount < 8) return 'medium'
    return 'complex'
  }

  // 错误检测
  const detectErrors = (code: string) => {
    const errors = []
    if (!code.includes('className')) errors.push('建议添加样式类名')
    if (code.includes('onclick') && !code.includes('onClick')) {
      errors.push('React中应使用onClick而不是onclick')
    }
    return errors
  }

  // 生成改进建议
  const generateImprovements = (code: string, level: string) => {
    const improvements = []
    if (level === '小学' || level === '初中') {
      improvements.push('可以尝试添加更多颜色使界面更美观')
      improvements.push('为按钮添加点击效果')
    } else {
      improvements.push('考虑添加响应式设计')
      improvements.push('优化组件结构和性能')
    }
    return improvements
  }

  // 实时提示
  useEffect(() => {
    if (isActive && currentCode) {
      const analysis = analyzeCode(currentCode)
      if (analysis.errors.length > 0) {
        setCurrentTip(`⚠️ ${analysis.errors[0]}`)
      } else if (analysis.improvements.length > 0) {
        setCurrentTip(`💡 ${analysis.improvements[0]}`)
      }
    }
  }, [currentCode, isActive, analyzeCode])

  return (
    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-purple-800 flex items-center gap-2">
          🤖 AI智能编程助手
        </h3>
        <Button
          size="sm"
          onClick={() => setIsActive(!isActive)}
          className={`${isActive ? 'bg-purple-600' : 'bg-gray-400'} hover:opacity-90`}
        >
          {isActive ? '🟢 已启用' : '⚫ 已禁用'}
        </Button>
      </div>

      {isActive && (
        <div className="space-y-3">
          {/* 当前提示 */}
          {currentTip && (
            <div className="bg-white rounded-lg p-3 border-l-4 border-purple-500">
              <p className="text-sm text-gray-700">{currentTip}</p>
            </div>
          )}

          {/* 快速操作 */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onSuggestion('添加颜色')}>
              🎨 美化界面
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSuggestion('添加交互')}>
              ⚡ 添加交互
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSuggestion('优化布局')}>
              📐 优化布局
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// 实时协作系统
export const RealTimeCollaboration: React.FC<{
  roomId: string
  userId: string
  userRole: 'student' | 'teacher'
}> = ({ roomId, userId, userRole }) => {
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<any[]>([])

  // 模拟协作者状态
  useEffect(() => {
    setCollaborators([
      { id: '1', name: '小明', role: 'student', status: 'active', cursor: { x: 100, y: 200 } },
      { id: '2', name: '李老师', role: 'teacher', status: 'active', cursor: { x: 300, y: 150 } }
    ])
    setIsConnected(true)
  }, [])

  const sendMessage = (message: string) => {
    const newMessage = {
      id: Date.now(),
      userId,
      message,
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages([...messages, newMessage])
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-green-800 flex items-center gap-2">
          🤝 实时协作
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        </h3>
        <span className="text-sm text-gray-500">{collaborators.length} 人在线</span>
      </div>

      {/* 协作者列表 */}
      <div className="flex gap-2 mb-3">
        {collaborators.map(collab => (
          <div key={collab.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
            <div className={`w-2 h-2 rounded-full ${
              collab.role === 'teacher' ? 'bg-blue-400' : 'bg-green-400'
            }`} />
            <span className="text-xs">{collab.name}</span>
          </div>
        ))}
      </div>

      {/* 实时消息 */}
      <div className="max-h-32 overflow-y-auto mb-2 bg-gray-50 rounded p-2">
        {messages.map(msg => (
          <div key={msg.id} className="text-xs mb-1">
            <span className="font-medium text-blue-600">{msg.userId}:</span>
            <span className="text-gray-700 ml-1">{msg.message}</span>
            <span className="text-gray-400 ml-2">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* 快速交流 */}
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => sendMessage('👍 做得很好！')}>
          👍
        </Button>
        <Button size="sm" variant="outline" onClick={() => sendMessage('🤔 需要帮助')}>
          🤔
        </Button>
        <Button size="sm" variant="outline" onClick={() => sendMessage('✅ 完成了！')}>
          ✅
        </Button>
      </div>
    </div>
  )
}

// 学习进度可视化
export const ProgressVisualization: React.FC<{
  userId: string
  timeRange: 'week' | 'month' | 'year'
}> = ({ userId, timeRange }) => {
  const [progressData, setProgressData] = useState({
    studyTime: { thisWeek: 180, lastWeek: 150 }, // 分钟
    skillLevels: {
      '拖拽操作': 85,
      '组件使用': 70,
      '布局设计': 60,
      '逻辑思维': 45,
      '创意设计': 80
    },
    achievements: ['初学者', '坚持者', '创意达人'],
    completedProjects: 12,
    codeLines: 1250
  })

  const skillItems = Object.entries(progressData.skillLevels)

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 学习进度可视化
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 学习时长对比 */}
        <div className="mb-6">
          <h4 className="font-medium mb-2">本周学习时长</h4>
          <div className="flex items-end gap-4 h-20">
            <div className="flex flex-col items-center">
              <div 
                className="bg-blue-500 rounded-t w-6 transition-all"
                style={{ height: `${(progressData.studyTime.lastWeek / 300) * 100}%` }}
              />
              <span className="text-xs mt-1">上周</span>
              <span className="text-xs text-gray-500">{progressData.studyTime.lastWeek}分</span>
            </div>
            <div className="flex flex-col items-center">
              <div 
                className="bg-green-500 rounded-t w-6 transition-all"
                style={{ height: `${(progressData.studyTime.thisWeek / 300) * 100}%` }}
              />
              <span className="text-xs mt-1">本周</span>
              <span className="text-xs text-gray-500">{progressData.studyTime.thisWeek}分</span>
            </div>
          </div>
        </div>

        {/* 技能雷达图 */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">技能掌握程度</h4>
          <div className="space-y-2">
            {skillItems.map(([skill, level]) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-sm w-20 text-right">{skill}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${level}%` }}
                  />
                </div>
                <span className="text-sm w-8 text-gray-500">{level}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 学习统计 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{progressData.completedProjects}</div>
            <div className="text-sm text-blue-700">完成项目</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{progressData.codeLines}</div>
            <div className="text-sm text-green-700">代码行数</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">{progressData.achievements.length}</div>
            <div className="text-sm text-purple-700">获得徽章</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 移动端适配组件
export const MobileOptimizedInterface: React.FC<{
  isMobile: boolean
  children: React.ReactNode
}> = ({ isMobile, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (!isMobile) return <>{children}</>

  return (
    <div className="mobile-learning-interface">
      {/* 移动端工具栏 */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-2 z-50 flex justify-between items-center">
        <Button size="sm" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '📖 展开工具' : '📱 收起工具'}
        </Button>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">💾 保存</Button>
          <Button size="sm" variant="outline">▶️ 预览</Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className={`pt-14 transition-all duration-300 ${isCollapsed ? 'pb-20' : 'pb-0'}`}>
        {children}
      </div>

      {/* 底部工具栏 */}
      {isCollapsed && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
          <div className="flex justify-center gap-4">
            <Button size="sm" className="flex-1">🎨 组件</Button>
            <Button size="sm" className="flex-1">🎯 属性</Button>
            <Button size="sm" className="flex-1">📊 预览</Button>
          </div>
        </div>
      )}
    </div>
  )
}