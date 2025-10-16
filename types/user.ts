// 用户相关类型定义

/**
 * 用户基本信息配置
 */
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
}

/**
 * 用户个人资料信息
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest' | 'student' | 'teacher';
  preferences: UserPreferences;
  isActive: boolean;
  lastLoginAt: number | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * 情感数据类型
 */
export interface EmotionData {
  type: string;
  intensity: number;
  timestamp: number;
  context?: string;
}

/**
 * 上下文感知数据
 */
export interface ContextData {
  location?: string;
  deviceType?: string;
  networkType?: string;
  timeOfDay?: string;
  activity?: string;
}

/**
 * 交互记录
 */
export interface InteractionRecord {
  id: string;
  type: string;
  timestamp: number;
  duration?: number;
  success?: boolean;
  metadata?: Record<string, any>;
}

/**
 * 课程数据
 */
export interface CourseData {
  id: string;
  title: string;
  description: string;
  instructor?: string;
  startDate: number;
  endDate?: number;
  progress?: number;
  tags?: string[];
}

/**
 * 学习进度数据
 */
export interface ProgressData {
  totalCompleted: number;
  totalAttempted: number;
  accuracy: number;
  lastActivity?: number;
  goals?: Array<{id: string; achieved: boolean; targetDate: number}>;
}

/**
 * 自适应配置
 */
export interface AdaptiveConfig {
  learningRate: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLearningStyle?: string;
  feedbackFrequency?: 'high' | 'medium' | 'low';
}

/**
 * 无障碍设置
 */
export interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  reducedMotion: boolean;
  colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}