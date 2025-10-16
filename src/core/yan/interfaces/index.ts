// YYC³ 核心架构 - 言(Yan)层接口定义
// 负责所有输入处理的标准化接口

// 基础输入接口
export interface YYC3YanInput {
  content: string | ArrayBuffer | Blob
  type: YYC3InputType
  timestamp: Date
  sourceId: string
  metadata?: YYC3InputMetadata
}

// 输入输出接口
export interface YYC3YanOutput {
  processedContent: any
  type: YYC3InputType
  timestamp: Date
  processingTime: number
  success: boolean
  errors?: YYC3YanError[]
}

// 输入类型枚举
export enum YYC3InputType {
  VOICE = 'voice',
  TEXT = 'text', 
  IMAGE = 'image',
  VIDEO = 'video',
  GESTURE = 'gesture',
  EMOTION = 'emotion'
}

// 输入元数据
export interface YYC3InputMetadata {
  language?: string
  encoding?: string
  sampleRate?: number
  channels?: number
  format?: string
  deviceInfo?: YYC3DeviceInfo
  userContext?: YYC3UserContext
}

// 设备信息
export interface YYC3DeviceInfo {
  deviceId: string
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'iot'
  platform: string
  capabilities: YYC3DeviceCapabilities
}

// 设备能力
export interface YYC3DeviceCapabilities {
  microphone: boolean
  camera: boolean
  touchscreen: boolean
  speakers: boolean
  sensors?: string[]
}

// 用户上下文
export interface YYC3UserContext {
  userId?: string
  sessionId: string
  preferences?: YYC3UserPreferences
  environment?: YYC3Environment
}

// 用户偏好
export interface YYC3UserPreferences {
  language: string
  accessibility: YYC3AccessibilitySettings
  interaction: YYC3InteractionSettings
}

// 无障碍设置
export interface YYC3AccessibilitySettings {
  screenReader: boolean
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  audioDescriptions: boolean
}

// 交互设置
export interface YYC3InteractionSettings {
  preferredInputMode: YYC3InputType[]
  voiceSettings: YYC3VoiceSettings
  gestureSettings: YYC3GestureSettings
}

// 语音设置
export interface YYC3VoiceSettings {
  wakeWord: string
  sensitivity: number
  noiseReduction: boolean
  voiceId: string
}

// 手势设置
export interface YYC3GestureSettings {
  enabled: boolean
  sensitivity: number
  customGestures: YYC3CustomGesture[]
}

// 自定义手势
export interface YYC3CustomGesture {
  id: string
  name: string
  pattern: number[][]
  action: string
}

// 环境信息
export interface YYC3Environment {
  location?: YYC3Location
  ambient?: YYC3AmbientConditions
  connectivity?: YYC3ConnectivityInfo
}

// 位置信息
export interface YYC3Location {
  latitude?: number
  longitude?: number
  city?: string
  country?: string
  timezone: string
}

// 环境条件
export interface YYC3AmbientConditions {
  lightLevel: 'bright' | 'normal' | 'dim' | 'dark'
  noiseLevel: 'quiet' | 'normal' | 'noisy' | 'loud'
  temperature?: number
}

// 连接信息
export interface YYC3ConnectivityInfo {
  type: 'wifi' | '4g' | '5g' | 'ethernet' | 'offline'
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  bandwidth: number
}

// 言层错误定义
export class YYC3YanError extends Error {
  code: YYC3YanErrorCode
  message: string
  details?: any
  timestamp: Date

  constructor(code: YYC3YanErrorCode, message: string, details?: any) {
    super(message);
    this.code = code;
    this.message = message;
    this.details = details;
    this.timestamp = new Date();
    this.name = 'YYC3YanError';
    
    // 确保正确的原型链
    Object.setPrototypeOf(this, YYC3YanError.prototype);
  }
}

// 言层错误代码
export enum YYC3YanErrorCode {
  INPUT_INVALID = 'YYC3_YAN_INPUT_INVALID',
  FORMAT_UNSUPPORTED = 'YYC3_YAN_FORMAT_UNSUPPORTED',
  PROCESSING_FAILED = 'YYC3_YAN_PROCESSING_FAILED',
  TIMEOUT = 'YYC3_YAN_TIMEOUT',
  DEVICE_NOT_AVAILABLE = 'YYC3_YAN_DEVICE_NOT_AVAILABLE',
  PERMISSION_DENIED = 'YYC3_YAN_PERMISSION_DENIED'
}

// 言层抽象基类
export abstract class YYC3YanBase {
  protected brandId: string = 'YYC3'
  protected layer: string = 'yan'
  
  constructor(
    protected config: YYC3YanConfig
  ) {}
  
  // 抽象方法：处理输入
  abstract processInput(input: YYC3YanInput): Promise<YYC3YanOutput>
  
  // 抽象方法：验证输入
  abstract validateInput(input: YYC3YanInput): YYC3ValidationResult
  
  // 通用方法：格式化输出
  protected formatOutput(
    processedContent: any,
    input: YYC3YanInput,
    processingTime: number,
    success: boolean = true,
    errors: YYC3YanError[] = []
  ): YYC3YanOutput {
    return {
      processedContent,
      type: input.type,
      timestamp: new Date(),
      processingTime,
      success,
      errors
    }
  }
  
  // 通用方法：创建错误
  protected createError(
    code: YYC3YanErrorCode,
    message: string,
    details?: any
  ): YYC3YanError {
    return new YYC3YanError(code, message, details);
  }
}

// 言层配置接口
export interface YYC3YanConfig {
  timeout: number
  retryAttempts: number
  bufferSize?: number
  enabledInputTypes: YYC3InputType[]
  preprocessing?: YYC3PreprocessingConfig
}

// 预处理配置
export interface YYC3PreprocessingConfig {
  noiseReduction: boolean
  normalization: boolean
  compression: boolean
  encryption: boolean
  maxLength?: number // 最大输入长度限制
}

// 验证结果接口
export interface YYC3ValidationResult {
  valid: boolean
  errors: YYC3YanError[]
  warnings?: YYC3YanWarning[]
}

// 言层警告
export interface YYC3YanWarning {
  code: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

// 言层常量
export const YYC3_YAN_CONSTANTS = {
  MAX_INPUT_SIZE: 10 * 1024 * 1024, // 10MB
  DEFAULT_TIMEOUT: 5000, // 5秒
  DEFAULT_RETRY_ATTEMPTS: 3,
  SUPPORTED_AUDIO_FORMATS: ['mp3', 'wav', 'opus', 'aac'],
  SUPPORTED_VIDEO_FORMATS: ['mp4', 'webm', 'avi', 'mov'],
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'gif']
}

// 导出类型联合
export type YYC3YanInputTypes = YYC3YanInput | YYC3YanOutput
export type YYC3YanConfigTypes = YYC3YanConfig | YYC3PreprocessingConfig
export type YYC3YanResultTypes = YYC3ValidationResult | YYC3YanError | YYC3YanWarning
// 统一的言层类型
export type YYC3YanTypes = YYC3YanInput | YYC3YanOutput | YYC3YanConfig | YYC3PreprocessingConfig | YYC3ValidationResult | YYC3YanError | YYC3YanWarning