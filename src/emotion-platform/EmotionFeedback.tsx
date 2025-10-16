"use client"

import React, { useState, useEffect } from 'react'
import { Palette, Volume2, Vibrate, Eye, Lightbulb, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface EmotionState {
  primary: string
  intensity: number
  valence: number // 情感效价 (-1 到 1，负面到正面)
  arousal: number // 情感唤醒 (0 到 1，平静到兴奋)
}

interface FeedbackConfig {
  visual: {
    enabled: boolean
    colorIntensity: number
    animationSpeed: number
    particleEffects: boolean
  }
  audio: {
    enabled: boolean
    volume: number
    spatialAudio: boolean
    adaptiveEQ: boolean
  }
  haptic: {
    enabled: boolean
    intensity: number
    pattern: 'subtle' | 'standard' | 'strong'
  }
  ambient: {
    lightAdaptation: boolean
    temperatureSync: boolean
    aromatherapy: boolean
  }
}

interface EmotionFeedbackProps {
  emotionState?: EmotionState
  onConfigChange?: (config: FeedbackConfig) => void
  onEmotionVisualization?: (emotion: string, intensity: number) => void
}

export const EmotionFeedback: React.FC<EmotionFeedbackProps> = ({
  emotionState = { primary: 'calm', intensity: 0.5, valence: 0.2, arousal: 0.3 },
  onConfigChange,
  onEmotionVisualization
}) => {
  const [config, setConfig] = useState<FeedbackConfig>({
    visual: {
      enabled: true,
      colorIntensity: 70,
      animationSpeed: 50,
      particleEffects: true
    },
    audio: {
      enabled: true,
      volume: 60,
      spatialAudio: true,
      adaptiveEQ: true
    },
    haptic: {
      enabled: true,
      intensity: 40,
      pattern: 'standard'
    },
    ambient: {
      lightAdaptation: true,
      temperatureSync: false,
      aromatherapy: false
    }
  })

  const [currentEmotion, setCurrentEmotion] = useState(emotionState)
  const [feedbackActive, setFeedbackActive] = useState(false)
  const [visualPreview, setVisualPreview] = useState('')

  // 更新配置
  const updateConfig = (category: keyof FeedbackConfig, key: string, value: any) => {
    const newConfig = {
      ...config,
      [category]: {
        ...config[category],
        [key]: value
      }
    }
    setConfig(newConfig)
    onConfigChange?.(newConfig)
  }

  // 情感可视化
  const generateEmotionVisualization = (emotion: EmotionState) => {
    const emotionColors = {
      happy: { primary: '#FFD700', secondary: '#FFA500', accent: '#FF6347' },
      excited: { primary: '#FF4500', secondary: '#FF6347', accent: '#FFD700' },
      calm: { primary: '#87CEEB', secondary: '#B0E0E6', accent: '#ADD8E6' },
      focused: { primary: '#9370DB', secondary: '#8A2BE2', accent: '#DDA0DD' },
      curious: { primary: '#32CD32', secondary: '#98FB98', accent: '#90EE90' },
      frustrated: { primary: '#DC143C', secondary: '#B22222', accent: '#FF6B6B' },
      confident: { primary: '#FF8C00', secondary: '#FFA500', accent: '#FFB347' }
    }

    const colors = emotionColors[emotion.primary as keyof typeof emotionColors] || emotionColors.calm
    return colors
  }

  // 音频反馈控制
  const generateAudioFeedback = (emotion: EmotionState) => {
    const audioProfiles = {
      happy: { frequency: 'major', tempo: 'upbeat', instruments: ['piano', 'strings'] },
      excited: { frequency: 'major', tempo: 'fast', instruments: ['drums', 'synth'] },
      calm: { frequency: 'minor', tempo: 'slow', instruments: ['ambient', 'nature'] },
      focused: { frequency: 'neutral', tempo: 'steady', instruments: ['white-noise', 'binaural'] },
      curious: { frequency: 'major', tempo: 'medium', instruments: ['chimes', 'bells'] },
      frustrated: { frequency: 'minor', tempo: 'irregular', instruments: ['muted', 'bass'] },
      confident: { frequency: 'major', tempo: 'strong', instruments: ['brass', 'percussion'] }
    }

    return audioProfiles[emotion.primary as keyof typeof audioProfiles] || audioProfiles.calm
  }

  // 触觉反馈模式
  const getHapticPattern = (emotion: string, intensity: number) => {
    const patterns = {
      happy: '轻快脉动',
      excited: '强烈震动',
      calm: '柔和波动',
      focused: '稳定节拍',
      curious: '探索性点击',
      frustrated: '不规则震动',
      confident: '坚定敲击'
    }

    return patterns[emotion as keyof typeof patterns] || '标准反馈'
  }

  // 模拟情感状态变化
  const simulateEmotionChange = () => {
    const emotions = ['happy', 'excited', 'calm', 'focused', 'curious', 'confident']
    const newEmotion = emotions[Math.floor(Math.random() * emotions.length)]
    
    const newEmotionState: EmotionState = {
      primary: newEmotion,
      intensity: Math.random(),
      valence: (Math.random() - 0.5) * 2,
      arousal: Math.random()
    }

    setCurrentEmotion(newEmotionState)
    onEmotionVisualization?.(newEmotion, newEmotionState.intensity)
  }

  // 启动情感反馈演示
  const startFeedbackDemo = () => {
    setFeedbackActive(true)
    simulateEmotionChange()
    
    // 演示持续5秒
    setTimeout(() => {
      setFeedbackActive(false)
    }, 5000)
  }

  useEffect(() => {
    const colors = generateEmotionVisualization(currentEmotion)
    setVisualPreview(`linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`)
  }, [currentEmotion])

  const getEmotionEmoji = (emotion: string) => {
    const emojis = {
      happy: '😊',
      excited: '🤩',
      calm: '😌',
      focused: '🧘‍♂️',
      curious: '🤔',
      frustrated: '😤',
      confident: '😎'
    }
    return emojis[emotion as keyof typeof emojis] || '😐'
  }

  return (
    <div className="space-y-6">
      {/* 情感状态可视化 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="text-pink-500" />
            情感反馈系统
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 当前情感显示 */}
            <div className="text-center space-y-4">
              <div 
                className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl shadow-lg transition-all duration-1000"
                style={{ 
                  background: visualPreview,
                  transform: feedbackActive ? 'scale(1.1)' : 'scale(1)',
                  filter: feedbackActive ? 'brightness(1.2) saturate(1.3)' : 'brightness(1) saturate(1)'
                }}
              >
                {getEmotionEmoji(currentEmotion.primary)}
              </div>
              
              <div className="space-y-2">
                <Badge className="text-lg px-4 py-2">
                  {currentEmotion.primary.toUpperCase()}
                </Badge>
                
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">强度</div>
                    <Progress value={currentEmotion.intensity * 100} className="h-2 mt-1" />
                    <div className="text-xs mt-1">{(currentEmotion.intensity * 100).toFixed(0)}%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500">情感效价</div>
                    <Progress 
                      value={((currentEmotion.valence + 1) / 2) * 100} 
                      className="h-2 mt-1" 
                    />
                    <div className="text-xs mt-1">{currentEmotion.valence > 0 ? '正面' : '负面'}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500">唤醒度</div>
                    <Progress value={currentEmotion.arousal * 100} className="h-2 mt-1" />
                    <div className="text-xs mt-1">{currentEmotion.arousal > 0.5 ? '兴奋' : '平静'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={startFeedbackDemo} disabled={feedbackActive}>
                {feedbackActive ? '反馈演示中...' : '启动情感反馈演示'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 视觉反馈配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="text-blue-500" />
            视觉反馈设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>启用视觉反馈</Label>
            <Switch 
              checked={config.visual.enabled}
              onCheckedChange={(checked) => updateConfig('visual', 'enabled', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>色彩强度: {config.visual.colorIntensity}%</Label>
            <Slider
              value={[config.visual.colorIntensity]}
              onValueChange={([value]) => updateConfig('visual', 'colorIntensity', value)}
              max={100}
              step={1}
              disabled={!config.visual.enabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label>动画速度: {config.visual.animationSpeed}%</Label>
            <Slider
              value={[config.visual.animationSpeed]}
              onValueChange={([value]) => updateConfig('visual', 'animationSpeed', value)}
              max={100}
              step={1}
              disabled={!config.visual.enabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>粒子效果</Label>
            <Switch 
              checked={config.visual.particleEffects}
              onCheckedChange={(checked) => updateConfig('visual', 'particleEffects', checked)}
              disabled={!config.visual.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* 音频反馈配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="text-green-500" />
            音频反馈设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>启用音频反馈</Label>
            <Switch 
              checked={config.audio.enabled}
              onCheckedChange={(checked) => updateConfig('audio', 'enabled', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>音量: {config.audio.volume}%</Label>
            <Slider
              value={[config.audio.volume]}
              onValueChange={([value]) => updateConfig('audio', 'volume', value)}
              max={100}
              step={1}
              disabled={!config.audio.enabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>空间音效</Label>
            <Switch 
              checked={config.audio.spatialAudio}
              onCheckedChange={(checked) => updateConfig('audio', 'spatialAudio', checked)}
              disabled={!config.audio.enabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>自适应均衡器</Label>
            <Switch 
              checked={config.audio.adaptiveEQ}
              onCheckedChange={(checked) => updateConfig('audio', 'adaptiveEQ', checked)}
              disabled={!config.audio.enabled}
            />
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium mb-2">当前音频配置:</div>
            <div className="text-xs space-y-1">
              {(() => {
                const audioProfile = generateAudioFeedback(currentEmotion)
                return (
                  <>
                    <div>音调: {audioProfile.frequency}</div>
                    <div>节拍: {audioProfile.tempo}</div>
                    <div>乐器: {audioProfile.instruments.join(', ')}</div>
                  </>
                )
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 触觉反馈配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vibrate className="text-purple-500" />
            触觉反馈设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>启用触觉反馈</Label>
            <Switch 
              checked={config.haptic.enabled}
              onCheckedChange={(checked) => updateConfig('haptic', 'enabled', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>震动强度: {config.haptic.intensity}%</Label>
            <Slider
              value={[config.haptic.intensity]}
              onValueChange={([value]) => updateConfig('haptic', 'intensity', value)}
              max={100}
              step={1}
              disabled={!config.haptic.enabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label>震动模式</Label>
            <div className="flex gap-2">
              {(['subtle', 'standard', 'strong'] as const).map((pattern) => (
                <Button
                  key={pattern}
                  variant={config.haptic.pattern === pattern ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateConfig('haptic', 'pattern', pattern)}
                  disabled={!config.haptic.enabled}
                >
                  {pattern === 'subtle' ? '轻微' : pattern === 'standard' ? '标准' : '强烈'}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium mb-1">当前触觉模式:</div>
            <div className="text-xs">
              {getHapticPattern(currentEmotion.primary, currentEmotion.intensity)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 环境氛围配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500" />
            环境氛围设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>智能光线适配</Label>
            <Switch 
              checked={config.ambient.lightAdaptation}
              onCheckedChange={(checked) => updateConfig('ambient', 'lightAdaptation', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>温度同步</Label>
            <Switch 
              checked={config.ambient.temperatureSync}
              onCheckedChange={(checked) => updateConfig('ambient', 'temperatureSync', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>香氛疗法</Label>
            <Switch 
              checked={config.ambient.aromatherapy}
              onCheckedChange={(checked) => updateConfig('ambient', 'aromatherapy', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}