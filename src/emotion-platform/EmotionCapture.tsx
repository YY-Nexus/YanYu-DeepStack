"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Mic, Camera, Heart, Brain, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface EmotionData {
  emotion: string
  confidence: number
  intensity: number
  timestamp: number
}

interface EmotionCaptureProps {
  onEmotionDetected?: (emotion: EmotionData) => void
  enableVoice?: boolean
  enableVideo?: boolean
  enableText?: boolean
}

export const EmotionCapture: React.FC<EmotionCaptureProps> = ({
  onEmotionDetected,
  enableVoice = true,
  enableVideo = true,
  enableText = true
}) => {
  const [isCapturing, setIsCapturing] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null)
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 模拟情感检测
  const detectEmotion = () => {
    const emotions = ['happy', 'excited', 'calm', 'focused', 'curious', 'confident']
    const emotion = emotions[Math.floor(Math.random() * emotions.length)]
    const confidence = 0.7 + Math.random() * 0.3
    const intensity = Math.random()
    
    const emotionData: EmotionData = {
      emotion,
      confidence,
      intensity,
      timestamp: Date.now()
    }
    
    setCurrentEmotion(emotionData)
    setEmotionHistory(prev => [...prev.slice(-9), emotionData])
    onEmotionDetected?.(emotionData)
  }

  const startCapture = async () => {
    setIsCapturing(true)
    
    if (enableVideo && videoRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoRef.current.srcObject = stream
      } catch (error) {
      }
    }
    
    // 定期检测情感
    const interval = setInterval(detectEmotion, 2000)
    return () => clearInterval(interval)
  }

  const stopCapture = () => {
    setIsCapturing(false)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'bg-yellow-500',
      excited: 'bg-orange-500',
      calm: 'bg-blue-500',
      focused: 'bg-purple-500',
      curious: 'bg-green-500',
      confident: 'bg-red-500'
    }
    return colors[emotion as keyof typeof colors] || 'bg-gray-500'
  }

  const getEmotionEmoji = (emotion: string) => {
    const emojis = {
      happy: '😊',
      excited: '🤩',
      calm: '😌',
      focused: '🧐',
      curious: '🤔',
      confident: '😎'
    }
    return emojis[emotion as keyof typeof emojis] || '😐'
  }

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="text-red-500" />
            情感捕获引擎
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button
              onClick={isCapturing ? stopCapture : startCapture}
              variant={isCapturing ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isCapturing ? (
                <>
                  <Zap className="w-4 h-4" />
                  停止捕获
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  开始捕获
                </>
              )}
            </Button>
            
            {enableVoice && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Mic className="w-3 h-3" />
                语音
              </Badge>
            )}
            
            {enableVideo && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Camera className="w-3 h-3" />
                视觉
              </Badge>
            )}
          </div>
          
          {/* 视频预览 */}
          {enableVideo && (
            <div className="relative w-64 h-48 mx-auto mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ display: 'none' }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 当前情感状态 */}
      {currentEmotion && (
        <Card>
          <CardHeader>
            <CardTitle>当前情感状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-6xl">
                {getEmotionEmoji(currentEmotion.emotion)}
              </div>
              <div className="space-y-2">
                <Badge className={`${getEmotionColor(currentEmotion.emotion)} text-white`}>
                  {currentEmotion.emotion.toUpperCase()}
                </Badge>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>置信度</span>
                    <span>{(currentEmotion.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={currentEmotion.confidence * 100} />
                  
                  <div className="flex justify-between text-sm">
                    <span>情感强度</span>
                    <span>{(currentEmotion.intensity * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={currentEmotion.intensity * 100} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 情感历史 */}
      {emotionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>情感变化趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {emotionHistory.slice(-10).map((emotion, index) => (
                <div key={index} className="text-center space-y-1">
                  <div className="text-2xl">
                    {getEmotionEmoji(emotion.emotion)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(emotion.timestamp).toLocaleTimeString().slice(0, 5)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}