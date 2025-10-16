"use client"

import React, { useState } from 'react'
import { Heart, Brain, Sparkles, Settings, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

// 导入各个子组件
import { EmotionCapture } from './EmotionCapture'
import { ContextAware } from './ContextAware'
import { PersonalityEngine } from './PersonalityEngine'
import { NaturalDialog } from './NaturalDialog'
import { EmotionFeedback } from './EmotionFeedback'

interface EmotionPlatformProps {
  className?: string
}

export const EmotionPlatform: React.FC<EmotionPlatformProps> = ({
  className = ""
}) => {
  const [activeModules, setActiveModules] = useState({
    capture: true,
    context: true,
    personality: true,
    dialog: true,
    feedback: true
  })

  const [platformStats, setPlatformStats] = useState({
    totalInteractions: 147,
    emotionAccuracy: 89,
    adaptationScore: 92,
    userSatisfaction: 94
  })

  const toggleModule = (module: keyof typeof activeModules) => {
    setActiveModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }))
  }

  const getModuleIcon = (module: string) => {
    const icons = {
      capture: <Heart className="w-4 h-4" />,
      context: <Activity className="w-4 h-4" />,
      personality: <Brain className="w-4 h-4" />,
      dialog: <Sparkles className="w-4 h-4" />,
      feedback: <Settings className="w-4 h-4" />
    }
    return icons[module as keyof typeof icons]
  }

  const getModuleName = (module: string) => {
    const names = {
      capture: '情感捕获',
      context: '场景感知', 
      personality: '个性引擎',
      dialog: '自然对话',
      feedback: '情感反馈'
    }
    return names[module as keyof typeof names]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 平台概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="text-red-500" />
            多模态情感交互平台
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-blue-600">{platformStats.totalInteractions}</div>
              <div className="text-sm text-gray-500">总交互次数</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-green-600">{platformStats.emotionAccuracy}%</div>
              <div className="text-sm text-gray-500">情感识别准确率</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-purple-600">{platformStats.adaptationScore}%</div>
              <div className="text-sm text-gray-500">智能适配评分</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-orange-600">{platformStats.userSatisfaction}%</div>
              <div className="text-sm text-gray-500">用户满意度</div>
            </div>
          </div>
          
          {/* 模块管理 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(activeModules).map(([key, enabled]) => (
              <Badge 
                key={key}
                className={`flex items-center gap-2 cursor-pointer ${enabled ? 'bg-primary/10 hover:bg-primary/20 text-primary' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                onClick={() => toggleModule(key as keyof typeof activeModules)}
              >
                {getModuleIcon(key)}
                {getModuleName(key)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* 功能模块区域 */}
      <Tabs defaultValue="capture" className="space-y-6">
        {activeModules.capture && (
          <TabsTrigger value="capture" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            情感捕获
          </TabsTrigger>
        )}
        
        {activeModules.context && (
          <TabsTrigger value="context" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            场景感知
          </TabsTrigger>
        )}
        
        {activeModules.personality && (
          <TabsTrigger value="personality" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            个性引擎
          </TabsTrigger>
        )}
        
        {activeModules.dialog && (
          <TabsTrigger value="dialog" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            自然对话
          </TabsTrigger>
        )}
        
        {activeModules.feedback && (
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            情感反馈
          </TabsTrigger>
        )}
        
        {activeModules.capture && (
          <TabsContent value="capture">
            <EmotionCapture />
          </TabsContent>
        )}
        
        {activeModules.context && (
          <TabsContent value="context">
            <ContextAware />
          </TabsContent>
        )}
        
        {activeModules.personality && (
          <TabsContent value="personality">
            <PersonalityEngine />
          </TabsContent>
        )}
        
        {activeModules.dialog && (
          <TabsContent value="dialog">
            <NaturalDialog />
          </TabsContent>
        )}
        
        {activeModules.feedback && (
          <TabsContent value="feedback">
            <EmotionFeedback />
          </TabsContent>
        )}
      </Tabs>
      
      {/* 平台控制按钮 */}
      <div className="flex justify-center space-x-4">
        <Button className="gap-2">
          <Settings className="w-4 h-4" />
          平台设置
        </Button>
        <Button variant="secondary" className="gap-2">
          <Activity className="w-4 h-4" />
          性能监控
        </Button>
      </div>
    </div>
  )
}

export default EmotionPlatform