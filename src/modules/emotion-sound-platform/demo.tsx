// 展示完整的情感声效交互功能

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

import type { YYC3EmotionState } from './index'
import { YYC3PrimaryEmotion, useYYC3EmotionSound } from './index'
import { YYC3EmotionSoundProvider } from './index.tsx'

// YYC³ 情感声效演示页面主组件
const YYC3EmotionSoundDemoPage: React.FC = () => {
  return (
    <YYC3EmotionSoundProvider>
      <EmotionSoundDemoContent />
    </YYC3EmotionSoundProvider>
  )
}

// 演示页面内容组件
const EmotionSoundDemoContent: React.FC = () => {
  const { playEmotionSound, getCurrentEmotion } = useYYC3EmotionSound()
  const [currentDemo, setCurrentDemo] = useState<'manual' | 'voice' | 'text' | 'auto'>('manual')
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [autoEmotionTimer, setAutoEmotionTimer] = useState<ReturnType<typeof setInterval> | null>(null)
  
  // 示例情感状态数组
  const emotions: YYC3EmotionState[] = [
    {
      valence: 0.8,
      arousal: 0.6,
      dominance: 0.4,
      primaryEmotion: YYC3PrimaryEmotion.JOY,
      emotionIntensity: 0.8,
      secondaryEmotions: [],
      confidence: 0.9,
      timestamp: new Date()
    },
    {
      valence: -0.6,
      arousal: 0.3,
      dominance: -0.2,
      primaryEmotion: YYC3PrimaryEmotion.SADNESS,
      emotionIntensity: 0.6,
      secondaryEmotions: [],
      confidence: 0.8,
      timestamp: new Date()
    },
    {
      valence: -0.7,
      arousal: 0.8,
      dominance: 0.6,
      primaryEmotion: YYC3PrimaryEmotion.ANGER,
      emotionIntensity: 0.9,
      secondaryEmotions: [],
      confidence: 0.85,
      timestamp: new Date()
    },
    {
      valence: -0.4,
      arousal: 0.7,
      dominance: -0.5,
      primaryEmotion: YYC3PrimaryEmotion.FEAR,
      emotionIntensity: 0.6,
      secondaryEmotions: [],
      confidence: 0.8,
      timestamp: new Date()
    }
  ]
  
  const startAutoEmotionDemo = async () => {
    let index = 0
    const timer = setInterval(async () => {
      const emotion = emotions[index % emotions.length]
      await playEmotionSound(emotion)
      
      setNotificationMessage(`播放 ${getEmotionLabel(emotion.primaryEmotion)} 情感声效`)
      setShowNotification(true)
      
      index++
      if (index >= emotions.length * 2) { // 循环2轮
        stopAutoEmotionDemo()
      }
    }, 3000)
    
    setAutoEmotionTimer(timer)
    setCurrentDemo('auto')
  }
  
  const stopAutoEmotionDemo = () => {
    if (autoEmotionTimer) {
      clearInterval(autoEmotionTimer)
      setAutoEmotionTimer(null)
    }
    setCurrentDemo('manual')
  }
  
  const getEmotionLabel = (emotion: YYC3PrimaryEmotion): string => {
    const labels = {
      [YYC3PrimaryEmotion.JOY]: '快乐',
      [YYC3PrimaryEmotion.SADNESS]: '悲伤',
      [YYC3PrimaryEmotion.ANGER]: '愤怒',
      [YYC3PrimaryEmotion.FEAR]: '恐惧',
      [YYC3PrimaryEmotion.SURPRISE]: '惊讶',
      [YYC3PrimaryEmotion.DISGUST]: '厌恶',
      [YYC3PrimaryEmotion.NEUTRAL]: '中性'
    }
    return labels[emotion]
  }
  
  // 快捷情感测试按钮
  const quickEmotionTests = [
    {
      name: '快乐',
      emotion: YYC3PrimaryEmotion.JOY,
      color: '#4caf50',
      state: {
        valence: 0.8,
        arousal: 0.6,
        dominance: 0.4,
        primaryEmotion: YYC3PrimaryEmotion.JOY,
        emotionIntensity: 0.8,
        secondaryEmotions: [],
        confidence: 0.9,
        timestamp: new Date()
      } as YYC3EmotionState
    },
    {
      name: '悲伤',
      emotion: YYC3PrimaryEmotion.SADNESS,
      color: '#2196f3',
      state: {
        valence: -0.6,
        arousal: 0.3,
        dominance: -0.2,
        primaryEmotion: YYC3PrimaryEmotion.SADNESS,
        emotionIntensity: 0.6,
        secondaryEmotions: [],
        confidence: 0.8,
        timestamp: new Date()
      } as YYC3EmotionState
    },
    {
      name: '愤怒',
      emotion: YYC3PrimaryEmotion.ANGER,
      color: '#f44336',
      state: {
        valence: -0.7,
        arousal: 0.8,
        dominance: 0.6,
        primaryEmotion: YYC3PrimaryEmotion.ANGER,
        emotionIntensity: 0.9,
        secondaryEmotions: [],
        confidence: 0.85,
        timestamp: new Date()
      } as YYC3EmotionState
    },
    {
      name: '恐惧',
      emotion: YYC3PrimaryEmotion.FEAR,
      color: '#ff9800',
      state: {
        valence: -0.4,
        arousal: 0.7,
        dominance: -0.5,
        primaryEmotion: YYC3PrimaryEmotion.FEAR,
        emotionIntensity: 0.6,
        secondaryEmotions: [],
        confidence: 0.8,
        timestamp: new Date()
      } as YYC3EmotionState
    }
  ]
  
  const handleQuickTest = async (emotionState: YYC3EmotionState) => {
    await playEmotionSound(emotionState)
    setNotificationMessage(`播放 ${getEmotionLabel(emotionState.primaryEmotion)} 情感声效`)
    setShowNotification(true)
  }
  
  // 显示通知消息
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [showNotification])
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>YYC³ 情感声效交互平台</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '15px' }}>「万象归元于云枢」- 让情感与声音共舞，创造有温度的人机交互体验</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div style={{ padding: '8px 16px', backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3', display: 'inline-block' }}>
                基于言语云立方³架构的情感化智能声效系统
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {/* 左侧：控制面板和当前状态 */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* 当前情感状态 */}
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ marginTop: '0', marginBottom: '15px' }}>当前情感状态</h3>
                {getCurrentEmotion() ? (
                  <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <div>主要情感: {getEmotionLabel(getCurrentEmotion()!.primaryEmotion)}</div>
                    <div>强度: {Math.round(getCurrentEmotion()!.emotionIntensity * 100)}%</div>
                  </div>
                ) : (
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    暂无情感数据，请播放声效进行测试
                  </p>
                )}
              </div>
              
              {/* 快捷测试按钮 */}
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ marginTop: '0', marginBottom: '15px' }}>快捷情感测试</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {quickEmotionTests.map((test) => (
                    <motion.div
                      key={test.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        style={{
                          padding: '15px',
                          textAlign: 'center' as const,
                          cursor: 'pointer',
                          backgroundColor: `${test.color}15`,
                          border: `1px solid ${test.color}40`,
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          color: test.color
                        }}
                        onClick={() => handleQuickTest(test.state)}
                      >
                        {test.name}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* 右侧：功能介绍 */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
              <h3 style={{ marginTop: '0', marginBottom: '15px' }}>自动情感演示</h3>
              <button
                onClick={autoEmotionTimer ? stopAutoEmotionDemo : startAutoEmotionDemo}
                style={{
                  padding: '8px 16px',
                  backgroundColor: autoEmotionTimer ? '#f44336' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {autoEmotionTimer ? '停止自动演示' : '开始自动演示'}
              </button>
              <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                {autoEmotionTimer ? '自动循环播放不同情感声效...' : '点击按钮开始自动演示'}
              </p>
            </div>
            
            <div>
              <h3 style={{ marginTop: '0', marginBottom: '15px', textAlign: 'center' }}>平台核心功能</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                  <h4 style={{ marginBottom: '10px' }}>情感识别</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    多模态情感识别，支持文本、语音、视觉等输入方式
                  </p>
                </div>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                  <h4 style={{ marginBottom: '10px' }}>声效合成</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    实时音频合成，基于情感状态生成对应的声效反馈
                  </p>
                </div>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                  <h4 style={{ marginBottom: '10px' }}>情感共鸣</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    智能情感映射，创造与用户情感状态同频的交互体验
                  </p>
                </div>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                  <h4 style={{ marginBottom: '10px' }}>个性化适应</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    基于用户行为和反馈，持续学习和优化声效体验
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* 通知消息 */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed' as const,
            bottom: '20px',
            left: '20px',
            backgroundColor: '#333',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}
        >
          {notificationMessage}
        </motion.div>
      )}
    </div>
  )
}

// 导出演示页面组件
export { YYC3EmotionSoundDemoPage }