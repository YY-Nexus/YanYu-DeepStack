// 情感交互平台类型定义

// 情感数据类型
export interface EmotionData {
  emotion: string
  confidence: number
  intensity: number
  timestamp: number
}

// 情感状态类型  
export interface EmotionState {
  primary: string
  intensity: number
  valence: number // 情感效价 (-1 到 1，负面到正面)
  arousal: number // 情感唤醒 (0 到 1，平静到兴奋)
}

// 场景上下文数据
export interface ContextData {
  location: string
  timeOfDay: string
  deviceType: string
  networkStatus: string
  batteryLevel: number
  lightLevel: string
  noiseLevel: string
  userActivity: string
}

// 场景建议类型
export interface ScenarioSuggestion {
  scenario: string
  confidence: number
  actions: string[]
  uiAdaptations: string[]
}

// 用户个性类型
export interface UserPersonality {
  type: string
  traits: string[]
  preferences: {
    learningStyle: string
    interactionMode: string
    feedbackType: string
    visualTheme: string
  }
  skills: {
    name: string
    level: number
  }[]
  achievements: string[]
  growthPath: string[]
}

// 个性化设置类型
export interface PersonalizationSettings {
  uiDensity: 'compact' | 'comfortable' | 'spacious'
  colorScheme: 'light' | 'dark' | 'auto' | 'custom'
  animationLevel: 'none' | 'reduced' | 'full'
  notificationStyle: 'minimal' | 'standard' | 'rich'
}

// 对话消息类型
export interface DialogMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  emotion?: string
  confidence?: number
}

// 对话上下文类型
export interface DialogContext {
  topic: string
  mood: string
  userPreferences: string[]
  conversationFlow: string[]
}

// 情感反馈配置
export interface FeedbackConfig {
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