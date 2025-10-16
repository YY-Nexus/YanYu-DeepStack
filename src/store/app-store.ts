// 全局状态管理架构建议

import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { UISlice, createUISlice } from './slices/createUISlice';
import { AccessibilitySlice, createAccessibilitySlice, AccessibilityState } from './slices/createAccessibilitySlice';
import { UserProfile, EmotionData, ContextData, InteractionRecord, CourseData, ProgressData, AdaptiveConfig } from '../../types/user';

// 1. 全局应用状态
interface AppState {
  // 用户状态
  user: UserProfile | null
  isAuthenticated: boolean
  
  // 多模态数据状态
  currentEmotion: EmotionData | null
  contextAwareness: ContextData
  interactionHistory: InteractionRecord[]
  
  // 教育系统状态
  currentCourse: CourseData | null
  learningProgress: ProgressData
  adaptiveSettings: AdaptiveConfig
  
  // UI状态
  theme: 'light' | 'dark' | 'auto'
  language: string
  accessibility: AccessibilityState
}

// 2. Actions定义
interface AppActions {
  // 用户操作
  setUser: (user: UserProfile) => void
  logout: () => void
  
  // 多模态操作
  updateEmotion: (emotion: EmotionData) => void
  updateContext: (context: ContextData) => void
  addInteraction: (interaction: InteractionRecord) => void
  
  // 教育系统操作
  setCourse: (course: CourseData) => void
  updateProgress: (progress: ProgressData) => void
  updateAdaptiveSettings: (settings: AdaptiveConfig) => void
  
  // UI操作
  toggleTheme: () => void
  setLanguageAction: (lang: string) => void
  updateAccessibility: (settings: AccessibilityState) => void
}

// 将所有状态和操作类型合并
export type AllSlices = AppState & AppActions & UISlice & AccessibilitySlice;

// 3. 创建状态管理器
export const useAppStore = create<AllSlices>()(
  subscribeWithSelector(
    persist(
      (...a) => ({
        // 合并所有Slices
        ...createUISlice(...a),
        ...createAccessibilitySlice(...a),
        
        // 用户状态
        user: null,
        isAuthenticated: false,
        
        // UI状态
        theme: 'auto',
        language: 'zh-CN',
        
        // 多模态数据状态
        currentEmotion: null,
        contextAwareness: {} as ContextData,
        interactionHistory: [],
        
        // 教育系统状态
        currentCourse: null,
        learningProgress: {} as ProgressData,
        adaptiveSettings: {} as AdaptiveConfig,

        // 用户相关Actions
        setUser: (user: UserProfile) => a[0]({ user, isAuthenticated: true }),
        logout: () => a[0]({ user: null, isAuthenticated: false }),
        
        // 多模态相关Actions
        updateEmotion: (emotion: EmotionData) => {
          a[0]({ currentEmotion: emotion })
          // 触发相关副作用
          a[1]().addInteraction({
            id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'emotion_update',
            timestamp: Date.now(),
            metadata: emotion
          })
        },
        
        updateContext: (context: ContextData) => {
          a[0]({ contextAwareness: context })
          // 自动适应UI/功能
          // 注意：ContextData类型中没有lightLevel属性，暂时注释掉这部分逻辑
          // if (context.lightLevel === '较暗') {
          //   a[0]({ theme: 'dark' })
          // }
        },
        
        addInteraction: (interaction: InteractionRecord) => a[0]((state) => ({
          interactionHistory: [...state.interactionHistory.slice(-99), interaction]
        })),
        
        // 教育系统相关Actions
        setCourse: (course: CourseData) => a[0]({ currentCourse: course }),
        updateProgress: (progress: ProgressData) => a[0]({ learningProgress: progress }),
        updateAdaptiveSettings: (settings: AdaptiveConfig) => a[0]({ adaptiveSettings: settings }),
        
        // UI相关Actions
        toggleTheme: () => a[0]((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        })),
        setLanguageAction: (lang: string) => a[0]({ language: lang })
      }),
      {
        name: 'yyc3-app-storage',
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
          language: state.language,
          accessibility: state.accessibility,
          adaptiveSettings: state.adaptiveSettings
        })
      }
    )
  )
)

// 4. 选择器hooks
export const useUser = () => useAppStore((state) => state.user)
export const useCurrentEmotion = () => useAppStore((state) => state.currentEmotion)
export const useTheme = () => useAppStore((state) => state.theme)
export const useLanguage = () => useAppStore((state) => state.language)

// 5. 数据流监听
useAppStore.subscribe(
  (state) => state.currentEmotion,
  (currentEmotion) => {
    if (currentEmotion) {
      // 自动触发相关模块
    }
  }
)