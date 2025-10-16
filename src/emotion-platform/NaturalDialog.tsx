"use client"

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Mic, Volume2, Heart, Brain, Sparkles, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface DialogMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  emotion?: string
  confidence?: number
}

interface DialogContext {
  topic: string
  mood: string
  userPreferences: string[]
  conversationFlow: string[]
}

interface NaturalDialogProps {
  onMessageSent?: (message: DialogMessage) => void
  onEmotionDetected?: (emotion: string, confidence: number) => void
  userName?: string
  assistantName?: string
}

export const NaturalDialog: React.FC<NaturalDialogProps> = ({
  onMessageSent,
  onEmotionDetected,
  userName = '学习者',
  assistantName = 'AI助手'
}) => {
  const [messages, setMessages] = useState<DialogMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是你的专属AI学习伙伴，今天想学习什么呢？我会根据你的情绪和学习状态来调整我的回应方式哦！😊',
      timestamp: Date.now() - 1000,
      emotion: 'friendly',
      confidence: 0.9
    }
  ])
  
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [dialogContext, setDialogContext] = useState<DialogContext>({
    topic: '编程学习',
    mood: 'encouraging',
    userPreferences: ['实践导向', '互动式学习'],
    conversationFlow: ['问候', '需求了解']
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 模拟AI智能回复
  const generateAIResponse = (userMessage: string, userEmotion: string = 'neutral') => {
    const responses = {
      encouraging: [
        '太棒了！你的想法很有创意，让我们一起把它实现出来吧！🚀',
        '我能感受到你的学习热情，这种积极的态度会帮助你更快进步！💪',
        '很好的问题！让我用一个有趣的方式来为你解答...',
      ],
      supportive: [
        '我理解这可能有些困难，但请记住，每个专家都曾是初学者。让我们一步步来解决这个问题。',
        '感觉有点挫折是很正常的，让我们换个角度来看这个问题，也许会有新的发现！',
        '不用担心，学习就是一个不断试错的过程。让我来帮你梳理一下思路...',
      ],
      curious: [
        '哇，你问了一个非常有深度的问题！让我来详细为你解释...',
        '你的好奇心真的很棒！这正是成为优秀开发者的重要品质。',
        '很高兴看到你在深入思考！让我们一起探索这个有趣的概念...',
      ]
    }
    
    const emotionResponses = responses.encouraging // 默认鼓励型
    if (userEmotion === 'frustrated') return responses.supportive[Math.floor(Math.random() * responses.supportive.length)]
    if (userEmotion === 'curious') return responses.curious[Math.floor(Math.random() * responses.curious.length)]
    
    const randomResponse = emotionResponses[Math.floor(Math.random() * emotionResponses.length)]
    return randomResponse
  }

  // 检测用户情感
  const detectUserEmotion = (message: string) => {
    const frustrationWords = ['难', '不懂', '复杂', '困惑', '错误']
    const excitementWords = ['太好了', '明白了', '学会了', '有趣', '酷']
    const questionWords = ['为什么', '怎么', '如何', '什么', '哪个']
    
    if (frustrationWords.some(word => message.includes(word))) {
      return { emotion: 'frustrated', confidence: 0.8 }
    }
    
    if (excitementWords.some(word => message.includes(word))) {
      return { emotion: 'excited', confidence: 0.9 }
    }
    
    if (questionWords.some(word => message.includes(word))) {
      return { emotion: 'curious', confidence: 0.7 }
    }
    
    return { emotion: 'neutral', confidence: 0.5 }
  }

  // 发送消息
  const sendMessage = () => {
    if (!inputMessage.trim()) return
    
    const userEmotion = detectUserEmotion(inputMessage)
    
    const userMessage: DialogMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: Date.now(),
      emotion: userEmotion.emotion,
      confidence: userEmotion.confidence
    }
    
    setMessages(prev => [...prev, userMessage])
    onMessageSent?.(userMessage)
    onEmotionDetected?.(userEmotion.emotion, userEmotion.confidence)
    
    setInputMessage('')
    setIsTyping(true)
    
    // 模拟AI思考时间
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, userEmotion.emotion)
      
      const aiMessage: DialogMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
        emotion: 'helpful',
        confidence: 0.9
      }
      
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
      onMessageSent?.(aiMessage)
      
      // 更新对话上下文
      setDialogContext(prev => ({
        ...prev,
        conversationFlow: [...prev.conversationFlow.slice(-5), 'ai_response']
      }))
    }, 1000 + Math.random() * 2000)
  }

  // 语音输入模拟
  const toggleListening = () => {
    setIsListening(!isListening)
    if (!isListening) {
      // 模拟语音识别
      setTimeout(() => {
        setInputMessage('这是通过语音输入的消息示例')
        setIsListening(false)
      }, 2000)
    }
  }

  const getEmotionIcon = (emotion: string) => {
    const icons = {
      friendly: '😊',
      helpful: '🤝',
      excited: '🎉',
      curious: '🤔',
      frustrated: '😔',
      neutral: '😐'
    }
    return icons[emotion as keyof typeof icons] || '💬'
  }

  const getEmotionColor = (emotion: string) => {
    const colors = {
      friendly: 'text-green-600',
      helpful: 'text-blue-600',
      excited: 'text-yellow-600',
      curious: 'text-purple-600',
      frustrated: 'text-red-600',
      neutral: 'text-gray-600'
    }
    return colors[emotion as keyof typeof colors] || 'text-gray-600'
  }

  return (
    <div className="space-y-4">
      {/* 对话上下文显示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="text-blue-500" />
            自然对话系统
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">当前话题</div>
              <Badge variant="outline">{dialogContext.topic}</Badge>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">对话氛围</div>
              <Badge variant="outline">{dialogContext.mood}</Badge>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">轮次</div>
              <Badge variant="outline">{Math.floor(messages.length / 2)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 对话区域 */}
      <Card className="h-96">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">情感化对话</span>
            </div>
            {isTyping && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Brain className="w-4 h-4 animate-pulse" />
                {assistantName} 正在思考...
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-64 px-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.role === 'user' ? '/placeholder-user.webp' : '/placeholder-logo.svg'} />
                    <AvatarFallback>
                      {message.role === 'user' ? userName[0] : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.role === 'user' ? userName : assistantName}
                      </span>
                      {message.emotion && (
                        <span className={`text-xs ${getEmotionColor(message.emotion)}`}>
                          {getEmotionIcon(message.emotion)}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className={`p-3 rounded-lg max-w-md ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white ml-auto' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.content}
                    </div>
                    
                    {message.confidence && message.confidence > 0.7 && (
                      <div className="text-xs text-gray-400 mt-1">
                        情感置信度: {(message.confidence * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 输入区域 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? "正在听取语音输入..." : "输入你想说的话..."}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isListening || isTyping}
              className={isListening ? "border-red-300 bg-red-50" : ""}
            />
            
            <Button
              onClick={toggleListening}
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              disabled={isTyping}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
            </Button>
            
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping || isListening}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                智能情感识别
              </span>
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                上下文理解
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                个性化回应
              </span>
            </div>
            
            <div>
              按回车发送
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}