// 提供完整的情感声效交互UI组件

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Play, Settings, Heart, Brain, Sliders, Layers, Mic, Frown, Smile, Frown as SentimentVeryDissatisfied, Frown as SentimentDissatisfied, Meh, Smile as SentimentSatisfied, Smile as SentimentVerySatisfied } from 'lucide-react'
import { BrandCard } from '@/components/ui/brand-card'
import { BrandButton } from '@/components/ui/brand-button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { CardContent, CardHeader } from '@/components/ui/card'

// 导入类型和钩子
import { useYYC3EmotionSound } from './index';
import { YYC3PrimaryEmotion } from './emotion-sound-types';
import type { YYC3EmotionState, YYC3SoundParameters } from './emotion-sound-types';

// YYC³ 情感声效控制面板组件
export const YYC3EmotionSoundControlPanel: React.FC<{
  className?: string
  compact?: boolean
}> = ({ className, compact = false }) => {
  const { setEnabled, setVolume, getCurrentEmotion } = useYYC3EmotionSound()
  const [isEnabled, setIsEnabled] = useState(true)
  const [volume, setVolumeState] = useState(0.3)
  const [showSettings, setShowSettings] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<YYC3EmotionState | null>(null)

  useEffect(() => {
    setEnabled(isEnabled)
  }, [isEnabled, setEnabled])

  useEffect(() => {
    setVolume(volume)
  }, [volume, setVolume])

  useEffect(() => {
    const interval = setInterval(() => {
      const emotion = getCurrentEmotion()
      if (emotion) {
        setCurrentEmotion(emotion)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [getCurrentEmotion])

  const handleEnabledChange = (checked: boolean) => {
    setIsEnabled(checked)
  }

  const getEmotionIcon = (emotion: YYC3PrimaryEmotion): React.ReactNode => {
    const iconMap: Record<YYC3PrimaryEmotion, React.ReactNode> = {
      [YYC3PrimaryEmotion.JOY]: <SentimentVerySatisfied className="text-emerald-500" />,
      [YYC3PrimaryEmotion.SADNESS]: <SentimentVeryDissatisfied className="text-blue-500" />,
      [YYC3PrimaryEmotion.ANGER]: <SentimentDissatisfied className="text-red-500" />,
      [YYC3PrimaryEmotion.FEAR]: <SentimentDissatisfied className="text-orange-500" />,
      [YYC3PrimaryEmotion.SURPRISE]: <SentimentSatisfied className="text-purple-500" />,
      [YYC3PrimaryEmotion.DISGUST]: <Meh className="text-gray-500" />,
      [YYC3PrimaryEmotion.NEUTRAL]: <Smile className="text-gray-400" />
    }
    return iconMap[emotion] || <Smile />
  }
  
  if (compact) {
    return (
      <div className={`${className} p-2 flex items-center gap-2 bg-white rounded-lg shadow-sm`}>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <Slider
          value={[volume * 100]}
          min={0}
          max={100}
          step={1}
          className="w-20"
          onValueChange={(value) => setVolumeState(value[0] / 100)}
        />
        {currentEmotion && getEmotionIcon(currentEmotion.primaryEmotion as YYC3PrimaryEmotion)}
      </div>
    )
  }
  
  return (
    <BrandCard className={className} variant="elevated">
      <CardHeader className="pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="bg-cloud-blue-500">
            <Brain className="h-4 w-4 text-white" />
          </Avatar>
          <h3 className="text-lg font-semibold">情感声效控制</h3>
        </div>
        <BrandButton variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
          <Settings className="h-4 w-4" />
        </BrandButton>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={handleEnabledChange}
            />
            <Label htmlFor="emotion-sound-toggle">启用情感声效</Label>
          </div>
          
          <div>
            <Label htmlFor="volume-control" className="text-sm text-gray-500">
              音量控制
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <VolumeX className="h-4 w-4 text-gray-500" />
              <Slider
                id="volume-control"
                value={[volume * 100]}
                min={0}
                max={100}
                step={1}
                className="flex-1"
                onValueChange={(value) => setVolumeState(value[0] / 100)}
              />
              <Volume2 className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          
          {currentEmotion && (
            <div>
              <Label className="text-sm text-gray-500 block mb-2">
                当前情感状态
              </Label>
              <YYC3EmotionStateDisplay emotion={currentEmotion} />
            </div>
          )}
          
          {/* 设置对话框 */}
          <YYC3EmotionSoundSettings
            open={showSettings}
            onClose={() => setShowSettings(false)}
          />
        </div>
      </CardContent>
    </BrandCard>
  )
}

// 这里只修复了第一部分，其余部分需要类似的修复...
// YYC³ 情感状态显示组件
export const YYC3EmotionStateDisplay: React.FC<{
  emotion: YYC3EmotionState
  showDetails?: boolean
}> = ({ emotion, showDetails = false }) => {
  const getEmotionColor = (primaryEmotion: YYC3PrimaryEmotion): string => {
    const colorMap = {
      [YYC3PrimaryEmotion.JOY]: '#4caf50',      // 绿色 - 快乐
      [YYC3PrimaryEmotion.SADNESS]: '#2196f3',  // 蓝色 - 悲伤
      [YYC3PrimaryEmotion.ANGER]: '#f44336',    // 红色 - 愤怒
      [YYC3PrimaryEmotion.FEAR]: '#ff9800',     // 橙色 - 恐惧
      [YYC3PrimaryEmotion.SURPRISE]: '#9c27b0', // 紫色 - 惊讶
      [YYC3PrimaryEmotion.DISGUST]: '#795548',  // 棕色 - 厌恶
      [YYC3PrimaryEmotion.NEUTRAL]: '#9e9e9e'   // 灰色 - 中性
    }
    return colorMap[primaryEmotion]
  }
  
  const getEmotionLabel = (primaryEmotion: YYC3PrimaryEmotion): string => {
    const labelMap = {
      [YYC3PrimaryEmotion.JOY]: '快乐',
      [YYC3PrimaryEmotion.SADNESS]: '悲伤',
      [YYC3PrimaryEmotion.ANGER]: '愤怒',
      [YYC3PrimaryEmotion.FEAR]: '恐惧',
      [YYC3PrimaryEmotion.SURPRISE]: '惊讶',
      [YYC3PrimaryEmotion.DISGUST]: '厌恶',
      [YYC3PrimaryEmotion.NEUTRAL]: '中性'
    }
    return labelMap[primaryEmotion]
  }
  
  const emotionColor = getEmotionColor(emotion.primaryEmotion)
  
  // 情感颜色类名映射
  const getEmotionColorClass = (emotionColor: string): string => {
    const colorClassMap: Record<string, string> = {
      '#4caf50': 'bg-emerald-500',
      '#2196f3': 'bg-blue-500',
      '#f44336': 'bg-red-500',
      '#ff9800': 'bg-orange-500',
      '#9c27b0': 'bg-purple-500',
      '#795548': 'bg-amber-700',
      '#9e9e9e': 'bg-gray-500'
    }
    return colorClassMap[emotionColor] || 'bg-gray-500'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`
          p-4 rounded-lg shadow-sm
          border-l-4 transition-all duration-300
          bg-gradient-to-r from-white to-gray-50
        `}
        style={{ borderLeftColor: emotionColor }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`
              text-white text-xs px-2 py-1 rounded-full font-medium
              ${getEmotionColorClass(emotionColor)}
            `}
          >
            {getEmotionLabel(emotion.primaryEmotion)}
          </span>
            <span className="text-sm text-gray-500">
              强度: <span className="font-medium">{(emotion.emotionIntensity * 100).toFixed(0)}%</span>
            </span>
            <span className="text-sm text-gray-500">
              置信度: <span className="font-medium">{(emotion.confidence * 100).toFixed(0)}%</span>
            </span>
          </div>
          
          {showDetails && (
            <div className="space-y-4 mt-2">
              <div>
              <label className="text-xs text-gray-500 block mb-1">
                效价 (正面/负面)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">负面</span>
                <Progress
                  value={(emotion.valence + 1) * 50}
                  className="h-2 flex-1 rounded-full"
                  style={{ backgroundColor: '#f0f0f0' }}
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">正面</span>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                唤醒度 (兴奋/平静)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">平静</span>
                <Progress
                  value={(emotion.arousal + 1) * 50}
                  className="h-2 flex-1 rounded-full bg-amber-100"
                  style={{ backgroundColor: '#f0f0f0' }}
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">兴奋</span>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                支配性 (主动/被动)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">被动</span>
                <Progress
                  value={(emotion.dominance + 1) * 50}
                  className="h-2 flex-1 rounded-full bg-purple-100"
                  style={{ backgroundColor: '#f0f0f0' }}
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">主动</span>
              </div>
            </div>
          </div>
          )}
          
          {emotion.secondaryEmotions.length > 0 && (
            <div className="mt-3">
              <label className="text-xs text-gray-500 block mb-2">
                次级情绪
              </label>
              <div className="flex flex-wrap gap-2">
                {emotion.secondaryEmotions.map((secondaryEmotion, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {secondaryEmotion.toString()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// YYC³ 情感声效可视化组件
export const YYC3EmotionSoundVisualizer: React.FC<{
  emotion: YYC3EmotionState
}> = ({ emotion }) => {
  const [animationFrame, setAnimationFrame] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  
  const getSoundParameters = useMemo(() => {
    // 根据情感状态生成声音参数
    const baseFrequency = 440 // A4音
    const frequency = baseFrequency + (emotion.valence * 100) // 效价影响音高
    const amplitude = 0.5 + (emotion.arousal * 0.25) // 唤醒度影响音量
    const complexity = 0.1 + (emotion.dominance * 0.3) // 支配性影响复杂度
    
    return {
      frequency,
      amplitude,
      complexity,
      duration: 0.5 + (emotion.emotionIntensity * 1.5)
    }
  }, [emotion])
  
  const renderVisualization = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // 清空画布
    ctx.clearRect(0, 0, width, height)
    
    // 设置样式
    ctx.lineWidth = 2
    ctx.strokeStyle = getEmotionColor(emotion.primaryEmotion)
    
    // 绘制波形
    ctx.beginPath()
    
    const centerY = height / 2
    const barWidth = width / 50
    
    for (let i = 0; i < 50; i++) {
      // 基于情感状态生成波形
      const phase = animationFrame + (i * 0.1)
      const amplitude = getSoundParameters.amplitude * (height * 0.3) * (0.5 + Math.sin(phase * getSoundParameters.complexity) * 0.5)
      const y = centerY + Math.sin(phase) * amplitude
      
      if (i === 0) {
        ctx.moveTo(i * barWidth, y)
      } else {
        ctx.lineTo(i * barWidth, y)
      }
    }
    
    ctx.stroke()
    
    // 绘制频谱
    ctx.fillStyle = getEmotionColor(emotion.primaryEmotion) + '30'
    
    for (let i = 0; i < 50; i++) {
      const phase = animationFrame + (i * 0.1)
      const barHeight = getSoundParameters.amplitude * (height * 0.3) * Math.abs(Math.sin(phase * 0.8))
      const x = i * barWidth + (barWidth * 0.2)
      const barActualWidth = barWidth * 0.6
      
      ctx.fillRect(x, centerY, barActualWidth, barHeight)
      ctx.fillRect(x, centerY - barHeight, barActualWidth, barHeight)
    }
    
    // 更新动画帧
    setAnimationFrame(prev => (prev + 0.05) % (Math.PI * 2))
    
    // 继续动画
    animationRef.current = requestAnimationFrame(renderVisualization)
  }, [animationFrame, emotion, getSoundParameters])
  
  // 获取情感颜色，复用之前定义的函数
  const getEmotionColor = (primaryEmotion: YYC3PrimaryEmotion): string => {
    const colorMap = {
      [YYC3PrimaryEmotion.JOY]: '#4caf50',      // 绿色 - 快乐
      [YYC3PrimaryEmotion.SADNESS]: '#2196f3',  // 蓝色 - 悲伤
      [YYC3PrimaryEmotion.ANGER]: '#f44336',    // 红色 - 愤怒
      [YYC3PrimaryEmotion.FEAR]: '#ff9800',     // 橙色 - 恐惧
      [YYC3PrimaryEmotion.SURPRISE]: '#9c27b0', // 紫色 - 惊讶
      [YYC3PrimaryEmotion.DISGUST]: '#795548',  // 棕色 - 厌恶
      [YYC3PrimaryEmotion.NEUTRAL]: '#9e9e9e'   // 灰色 - 中性
    }
    return colorMap[primaryEmotion]
  }
  
  useEffect(() => {
    // 开始动画
    animationRef.current = requestAnimationFrame(renderVisualization)
    
    // 清理函数
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [renderVisualization])
  
  return (
    <div 
      className="p-4 bg-transparent border border-gray-200 rounded-lg"
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        style={{
          width: '100%',
          height: 'auto'
        }}
      />
    </div>
  )
}

// YYC³ 情感声效预设选择器
export const YYC3EmotionSoundPresetSelector: React.FC<{
  onPresetChange: (presetId: string) => void
  selectedPreset?: string
}> = ({ onPresetChange, selectedPreset }) => {
  // 情感预设配置
  const presets: Array<{
    id: string;
    name: string;
    targetEmotion: YYC3PrimaryEmotion | string;
    usage: string;
    soundParameters: {
      frequency: number;
      amplitude: number;
      duration: number;
      waveform: string;
      envelope: {
        attack: number;
        decay: number;
        sustain: number;
        release: number;
      };
      volume: number;
      pitch: number;
      timbre: string;
      emotionalTone: string;
      dynamicParams: {
        frequencyModulation: { enabled: boolean; rate: number; depth: number; waveform: string };
        amplitudeModulation: { enabled: boolean; rate: number; depth: number; waveform: string };
        filterSweep: { enabled: boolean; startFreq: number; endFreq: number; duration: number; curve: string };
        stereoPanning?: { enabled: boolean; startPan: number; endPan: number; duration: number };
      };
      spatialAudio: {
        enabled: boolean;
        position: { x: number; y: number; z: number };
        radius: number;
      };
      learningParams: {
        enabled: boolean;
        adaptationRate: number;
        memorySize: number;
        userFeedbackWeight: number;
        behaviorPatternWeight: number;
        emotionAccuracyWeight: number;
        forgettingFactor: number;
      };
    };  
  }> = [
    {
      id: 'neutral',
      name: '中性模式',
      targetEmotion: 'neutral',
      usage: 'feedback',
      soundParameters: {
          frequency: 440,
          amplitude: 0.7,
          duration: 500,
          waveform: 'sine',
          envelope: {
            attack: 50,
            decay: 100,
            sustain: 0.7,
            release: 200
          },
          volume: 0.7,
          pitch: 0,
          timbre: 'sine',
          emotionalTone: 'serene',
          dynamicParams: {
            frequencyModulation: { enabled: false, rate: 0, depth: 0, waveform: 'sine' },
            amplitudeModulation: { enabled: false, rate: 0, depth: 0, waveform: 'sine' },
            filterSweep: { enabled: false, startFreq: 0, endFreq: 0, duration: 0, curve: 'linear' },
            stereoPanning: { enabled: false, startPan: 0, endPan: 0, duration: 0 }
          },
          spatialAudio: {
              enabled: false,
              position: { x: 0, y: 0, z: 0 },
              radius: 1
            },
          learningParams: { 
            enabled: false, 
            adaptationRate: 0.1, 
            memorySize: 10,
            userFeedbackWeight: 0.5,
            behaviorPatternWeight: 0.5,
            emotionAccuracyWeight: 0.5,
            forgettingFactor: 0.1
          }
        }
    },
    {
      id: 'joyful',
      name: '愉悦模式',
      targetEmotion: 'joy',
      usage: 'celebration',
      soundParameters: {
          frequency: 523,
          amplitude: 0.8,
          duration: 600,
          waveform: 'triangle',
          envelope: {
            attack: 30,
            decay: 150,
            sustain: 0.8,
            release: 300
          },
          volume: 0.8,
          pitch: 2,
          timbre: 'triangle',
          emotionalTone: 'happy',
          dynamicParams: {
            frequencyModulation: { enabled: true, rate: 5, depth: 0.1, waveform: 'sine' },
            amplitudeModulation: { enabled: true, rate: 2, depth: 0.2, waveform: 'sine' },
            filterSweep: { enabled: false, startFreq: 0, endFreq: 0, duration: 0, curve: 'linear' }
          },
          spatialAudio: {
              enabled: true,
              position: { x: 0.5, y: 0, z: 0 },
              radius: 1.5
            },
          learningParams: { 
            enabled: true, 
            adaptationRate: 0.2, 
            memorySize: 15,
            userFeedbackWeight: 0.6,
            behaviorPatternWeight: 0.7,
            emotionAccuracyWeight: 0.8,
            forgettingFactor: 0.15
          }
        }
    },
    {
      id: 'calm',
      name: '平静模式',
      targetEmotion: 'sadness',
      usage: 'meditation',
      soundParameters: {
          frequency: 349,
          amplitude: 0.5,
          duration: 800,
          waveform: 'sawtooth',
          envelope: {
            attack: 100,
            decay: 200,
            sustain: 0.5,
            release: 500
          },
          volume: 0.5,
          pitch: -3,
          timbre: 'sawtooth',
          emotionalTone: 'calm',
          dynamicParams: {
            frequencyModulation: { enabled: false, rate: 0, depth: 0, waveform: 'sine' },
            amplitudeModulation: { enabled: false, rate: 0, depth: 0, waveform: 'sine' },
            filterSweep: { enabled: false, startFreq: 0, endFreq: 0, duration: 0, curve: 'linear' }
          },
          spatialAudio: {
            enabled: false,
            position: { x: 0, y: 0, z: 0 },
            radius: 1
          },
          learningParams: { 
            enabled: true, 
            adaptationRate: 0.15, 
            memorySize: 12,
            userFeedbackWeight: 0.5,
            behaviorPatternWeight: 0.6,
            emotionAccuracyWeight: 0.7,
            forgettingFactor: 0.1
          }
        }
    },
    {
      id: 'energetic',
      name: '活力模式',
      targetEmotion: 'anger',
      usage: 'feedback',
      soundParameters: {
          frequency: 587,
          amplitude: 0.9,
          duration: 400,
          waveform: 'square',
          envelope: {
            attack: 20,
            decay: 80,
            sustain: 0.9,
            release: 150
          },
          volume: 0.9,
          pitch: 4,
          timbre: 'square',
          emotionalTone: 'tense',
          dynamicParams: {
            frequencyModulation: { enabled: true, rate: 8, depth: 0.2, waveform: 'square' },
            amplitudeModulation: { enabled: true, rate: 5, depth: 0.3, waveform: 'square' },
            filterSweep: { enabled: false, startFreq: 0, endFreq: 0, duration: 0, curve: 'linear' }
          },
          spatialAudio: {
              enabled: true,
              position: { x: -0.5, y: 0, z: 0 },
              radius: 1.2
            },
          learningParams: { 
            enabled: true, 
            adaptationRate: 0.25, 
            memorySize: 18,
            userFeedbackWeight: 0.7,
            behaviorPatternWeight: 0.8,
            emotionAccuracyWeight: 0.6,
            forgettingFactor: 0.2
          }
        }
    },
    {
      id: 'curious',
      name: '探索模式',
      targetEmotion: 'surprise',
      usage: 'focus',
      soundParameters: {
          frequency: 440,
          amplitude: 0.7,
          duration: 550,
          waveform: 'triangle',
          envelope: {
            attack: 60,
            decay: 120,
            sustain: 0.7,
            release: 250
          },
          volume: 0.7,
          pitch: 1,
          timbre: 'triangle',
          emotionalTone: 'excited',
          dynamicParams: {
            frequencyModulation: { enabled: true, rate: 3, depth: 0.15, waveform: 'sine' },
            amplitudeModulation: { enabled: false, rate: 0, depth: 0, waveform: 'sine' },
            filterSweep: { enabled: false, startFreq: 0, endFreq: 0, duration: 0, curve: 'linear' }
          },
          spatialAudio: {
              enabled: true,
              position: { x: 0, y: 0.3, z: 0 },
              radius: 1.3
            },
          learningParams: { 
            enabled: true, 
            adaptationRate: 0.2, 
            memorySize: 16,
            userFeedbackWeight: 0.7,
            behaviorPatternWeight: 0.75,
            emotionAccuracyWeight: 0.8,
            forgettingFactor: 0.15
          }
        }
    },
    {
      id: 'focused',
      name: '专注模式',
      targetEmotion: 'joy',
      usage: 'focus',
      soundParameters: {
          frequency: 392,
          amplitude: 0.6,
          duration: 650,
          waveform: 'sine',
          envelope: {
            attack: 80,
            decay: 150,
            sustain: 0.6,
            release: 400
          },
          volume: 0.6,
          pitch: -1,
          timbre: 'sine',
          emotionalTone: 'relaxed',
          dynamicParams: {
            frequencyModulation: { enabled: false, rate: 0, depth: 0, waveform: 'sine' },
            amplitudeModulation: { enabled: false, rate: 0, depth: 0, waveform: 'sine' },
            filterSweep: { enabled: false, startFreq: 0, endFreq: 0, duration: 0, curve: 'linear' }
          },
          spatialAudio: {
            enabled: false,
            position: { x: 0, y: 0, z: 0 },
            radius: 1
          },
          learningParams: { 
            enabled: true, 
            adaptationRate: 0.1, 
            memorySize: 10,
            userFeedbackWeight: 0.6,
            behaviorPatternWeight: 0.7,
            emotionAccuracyWeight: 0.9,
            forgettingFactor: 0.05
          }
        }
    }
  ]
  
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">
        快速选择预设
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {presets.map((preset) => (
          <motion.div
            key={preset.id}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div
              className={`cursor-pointer transition-all border rounded-lg p-3 ${selectedPreset === preset.id ? 'border-2 border-blue-500' : 'border-gray-200'}`}
              onClick={() => onPresetChange(preset.id)}
            >
              <div className="font-medium text-sm truncate">
                {preset.name}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full border border-blue-500 text-blue-500">
                  {preset.targetEmotion}
                </span>
                <span className="text-xs text-gray-500">
                  {preset.usage}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// YYC³ 情感声效测试器组件
export const YYC3EmotionSoundTester: React.FC = () => {
  const { playEmotionSound } = useYYC3EmotionSound()
  const [testEmotion, setTestEmotion] = useState<YYC3EmotionState>({
    valence: 0,
    arousal: 0,
    dominance: 0,
    primaryEmotion: YYC3PrimaryEmotion.NEUTRAL,
    emotionIntensity: 0.5,
    secondaryEmotions: [],
    confidence: 1.0,
    timestamp: new Date()
  })
  
  const handleEmotionChange = <K extends keyof YYC3EmotionState>(key: K, value: YYC3EmotionState[K]): void => {
    setTestEmotion(prev => ({
      ...prev,
      [key]: value,
      timestamp: new Date()
    }))
  }
  
  const handlePlaySound = async (): Promise<void> => {
    await playEmotionSound(testEmotion)
  }
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">情感声效测试器</h2>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={handlePlaySound}
        >
          播放测试音效
        </button>
      </div>
      <div className="p-4 space-y-6">
        <div>
          <label className="text-sm text-gray-700 block mb-2">
            效价 (负面 ↔ 正面)
          </label>
          <Slider
            value={[testEmotion.valence]}
            onValueChange={(value) => handleEmotionChange('valence', value[0])}
            min={-1}
            max={1}
            step={0.1}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>负面</span>
            <span>中性</span>
            <span>正面</span>
          </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-700 block mb-2">
              唤醒度 (平静 ↔ 兴奋)
            </label>
            <Slider
              value={[testEmotion.arousal]}
              onValueChange={(value) => handleEmotionChange('arousal', value[0])}
              min={-1}
              max={1}
              step={0.1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>平静</span>
              <span>中等</span>
              <span>兴奋</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-700 block mb-2">
              支配性 (被动 ↔ 主动)
            </label>
            <Slider
              value={[testEmotion.dominance]}
              onValueChange={(value) => handleEmotionChange('dominance', value[0])}
              min={-1}
              max={1}
              step={0.1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>被动</span>
              <span>中性</span>
              <span>主动</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-700 block mb-2">
              情绪强度
            </label>
            <Slider
              value={[testEmotion.emotionIntensity]}
              onValueChange={(value) => handleEmotionChange('emotionIntensity', value[0])}
              min={0}
              max={1}
              step={0.1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>微弱</span>
              <span>中等</span>
              <span>强烈</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">主要情绪</label>
            <select 
              value={testEmotion.primaryEmotion}
              onChange={(event) => {
                handleEmotionChange('primaryEmotion', event.target.value as YYC3PrimaryEmotion);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={YYC3PrimaryEmotion.JOY}>快乐</option>
              <option value={YYC3PrimaryEmotion.SADNESS}>悲伤</option>
              <option value={YYC3PrimaryEmotion.ANGER}>愤怒</option>
              <option value={YYC3PrimaryEmotion.FEAR}>恐惧</option>
              <option value={YYC3PrimaryEmotion.SURPRISE}>惊讶</option>
              <option value={YYC3PrimaryEmotion.DISGUST}>厌恶</option>
              <option value={YYC3PrimaryEmotion.NEUTRAL}>中性</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">当前情感状态预览</label>
            <YYC3EmotionStateDisplay emotion={testEmotion} showDetails />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">声效可视化</label>
            <YYC3EmotionSoundVisualizer emotion={testEmotion} />
          </div>
        </div>
      </div>
  );
}

// YYC³ 情感声效设置对话框
export const YYC3EmotionSoundSettings: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  const [settings, setSettings] = useState({
    sensitivity: 0.5,
    adaptation: 0.3,
    spatialAudio: false,
    culturalAdaptation: true,
    personalityAware: true
  })
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle>情感声效设置</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              情感敏感度
            </label>
            <Slider
              value={[settings.sensitivity]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, sensitivity: value }))}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              适应速度
            </label>
            <Slider
              value={[settings.adaptation]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, adaptation: value }))}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.spatialAudio}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, spatialAudio: checked }))}
            />
            <Label className="cursor-pointer">启用空间音频</Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.culturalAdaptation}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, culturalAdaptation: checked }))}
            />
            <Label className="cursor-pointer">文化适应性调整</Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.personalityAware}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, personalityAware: checked }))}
            />
            <Label className="cursor-pointer">个性化音效</Label>
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <BrandButton variant="secondary" onClick={onClose}>取消</BrandButton>
        <BrandButton onClick={onClose}>保存</BrandButton>
      </DialogFooter>
    </Dialog>
  )
}