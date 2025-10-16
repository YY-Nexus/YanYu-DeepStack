// YYC³ 核心架构 - 语(Yu)层接口定义  
// 负责所有智能解析处理的标准化接口

import { YYC3YanOutput } from '@/src/core/yan/interfaces'

// 基础解析输入接口
export interface YYC3YuInput {
  source: YYC3YanOutput
  analysisType: YYC3AnalysisType[]
  context?: YYC3AnalysisContext
  options?: YYC3AnalysisOptions
}

// 解析输出接口
export interface YYC3YuOutput {
  entities: YYC3Entity[]
  sentiment: YYC3Sentiment
  intent: YYC3Intent
  concepts: YYC3Concept[]
  relations: YYC3Relation[]
  confidence: YYC3ConfidenceScores
  processingTime: number
  timestamp: Date
  success: boolean
  errors?: YYC3YuError[]
}

// 分析类型枚举
export enum YYC3AnalysisType {
  NLP = 'nlp',                    // 自然语言处理
  ENTITY_EXTRACTION = 'entity',   // 实体提取
  SENTIMENT = 'sentiment',        // 情感分析
  INTENT = 'intent',             // 意图识别
  CONCEPT = 'concept',           // 概念提取
  RELATION = 'relation',         // 关系抽取
  EMOTION = 'emotion',           // 情感计算
  KNOWLEDGE = 'knowledge'        // 知识推理
}

// 分析上下文
export interface YYC3AnalysisContext {
  domain: string                 // 领域上下文（如医疗、教育、金融）
  language: string              // 语言
  previousContext?: YYC3YuOutput  // 上一次分析结果
  userProfile?: YYC3UserProfile  // 用户画像
  sessionHistory?: YYC3SessionHistory  // 会话历史
}

// 分析选项
export interface YYC3AnalysisOptions {
  precision: 'fast' | 'standard' | 'accurate'  // 精度级别
  maxEntities?: number          // 最大实体数量
  confidenceThreshold: number   // 置信度阈值
  enabledModels: string[]       // 启用的模型列表
  customRules?: YYC3CustomRule[]  // 自定义规则
}

// 实体定义
export interface YYC3Entity {
  id: string
  text: string
  type: YYC3EntityType
  startIndex: number
  endIndex: number
  confidence: number
  attributes?: YYC3EntityAttributes
  linkedData?: YYC3LinkedData
}

// 实体类型枚举
export enum YYC3EntityType {
  PERSON = 'person',
  ORGANIZATION = 'organization',
  LOCATION = 'location',
  DATE = 'date',
  TIME = 'time',
  NUMBER = 'number',
  MONEY = 'money',
  PRODUCT = 'product',
  EVENT = 'event',
  CONCEPT = 'concept',
  EMOTION = 'emotion',
  INTENT = 'intent'
}

// 实体属性
export interface YYC3EntityAttributes {
  category?: string
  subcategory?: string
  properties?: Record<string, any>
  metadata?: Record<string, any>
}

// 链接数据
export interface YYC3LinkedData {
  source: string
  url?: string
  description?: string
  additionalInfo?: Record<string, any>
}

// 情感分析结果
export interface YYC3Sentiment {
  overall: YYC3SentimentScore
  aspects: YYC3AspectSentiment[]
  emotions: YYC3EmotionScore[]
  confidence: number
}

// 情感评分
export interface YYC3SentimentScore {
  label: 'positive' | 'neutral' | 'negative'
  score: number  // -1 到 1
  confidence: number
}

// 方面情感
export interface YYC3AspectSentiment {
  aspect: string
  sentiment: YYC3SentimentScore
  mentions: YYC3AspectMention[]
}

// 方面提及
export interface YYC3AspectMention {
  text: string
  startIndex: number
  endIndex: number
}

// 情感评分
export interface YYC3EmotionScore {
  emotion: YYC3EmotionType
  intensity: number  // 0 到 1
  confidence: number
}

// 情感类型
export enum YYC3EmotionType {
  JOY = 'joy',
  SADNESS = 'sadness',
  ANGER = 'anger',
  FEAR = 'fear',
  SURPRISE = 'surprise',
  DISGUST = 'disgust',
  TRUST = 'trust',
  ANTICIPATION = 'anticipation'
}

// 意图识别结果
export interface YYC3Intent {
  primary: YYC3IntentScore
  alternatives: YYC3IntentScore[]
  parameters: YYC3IntentParameter[]
  confidence: number
}

// 意图评分
export interface YYC3IntentScore {
  intent: string
  score: number
  confidence: number
  domain?: string
}

// 意图参数
export interface YYC3IntentParameter {
  name: string
  value: any
  type: string
  required: boolean
  confidence: number
}

// 概念提取结果
export interface YYC3Concept {
  id: string
  name: string
  type: string
  relevance: number
  confidence: number
  dbpediaUri?: string
  wikipediaUrl?: string
  properties?: Record<string, any>
}

// 关系抽取结果
export interface YYC3Relation {
  id: string
  subject: YYC3Entity
  predicate: string
  object: YYC3Entity
  confidence: number
  type: YYC3RelationType
}

// 关系类型
export enum YYC3RelationType {
  IS_A = 'is_a',
  PART_OF = 'part_of',
  LOCATED_IN = 'located_in',
  WORKS_FOR = 'works_for',
  BORN_IN = 'born_in',
  CREATED_BY = 'created_by',
  HAPPENS_AT = 'happens_at',
  CAUSES = 'causes'
}

// 置信度评分
export interface YYC3ConfidenceScores {
  overall: number
  entity: number
  sentiment: number
  intent: number
  concept: number
  relation: number
}

// 用户画像
export interface YYC3UserProfile {
  demographics?: YYC3Demographics
  interests?: string[]
  expertise?: YYC3ExpertiseLevel[]
  communicationStyle?: YYC3CommunicationStyle
  emotionalProfile?: YYC3EmotionalProfile
}

// 人口统计
export interface YYC3Demographics {
  ageGroup?: string
  location?: string
  occupation?: string
  education?: string
}

// 专业水平
export interface YYC3ExpertiseLevel {
  domain: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

// 沟通风格
export interface YYC3CommunicationStyle {
  formality: 'formal' | 'informal' | 'mixed'
  verbosity: 'concise' | 'detailed' | 'verbose'
  emotionalExpression: 'low' | 'medium' | 'high'
}

// 情感画像
export interface YYC3EmotionalProfile {
  dominantEmotions: YYC3EmotionType[]
  emotionalStability: number
  empathy: number
  openness: number
}

// 会话历史
export interface YYC3SessionHistory {
  messages: YYC3HistoryMessage[]
  topics: string[]
  emotions: YYC3EmotionType[]
  intents: string[]
  duration: number
}

// 历史消息
export interface YYC3HistoryMessage {
  timestamp: Date
  content: string
  analysis: YYC3YuOutput
  userFeedback?: YYC3UserFeedback
}

// 用户反馈
export interface YYC3UserFeedback {
  rating: number  // 1-5
  comments?: string
  corrections?: YYC3Correction[]
}

// 纠正信息
export interface YYC3Correction {
  type: 'entity' | 'sentiment' | 'intent'
  original: any
  corrected: any
  reason?: string
}

// 自定义规则
export interface YYC3CustomRule {
  id: string
  name: string
  type: 'pattern' | 'logic' | 'ml'
  rule: any
  priority: number
  enabled: boolean
}

// 语层错误定义
export interface YYC3YuError {
  code: YYC3YuErrorCode
  message: string
  details?: any
  timestamp: Date
}

// 语层错误代码
export enum YYC3YuErrorCode {
  ANALYSIS_FAILED = 'YYC3_YU_ANALYSIS_FAILED',
  MODEL_NOT_LOADED = 'YYC3_YU_MODEL_NOT_LOADED',
  UNSUPPORTED_LANGUAGE = 'YYC3_YU_UNSUPPORTED_LANGUAGE',
  INSUFFICIENT_DATA = 'YYC3_YU_INSUFFICIENT_DATA',
  TIMEOUT = 'YYC3_YU_TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'YYC3_YU_RATE_LIMIT_EXCEEDED'
}

// 语层抽象基类
export abstract class YYC3YuBase {
  protected brandId: string = 'YYC3'
  protected layer: string = 'yu'
  
  constructor(
    protected config: YYC3YuConfig
  ) {}
  
  // 抽象方法：分析输入
  abstract analyze(input: YYC3YuInput): Promise<YYC3YuOutput>
  
  // 抽象方法：提取实体
  abstract extractEntities(text: string, context?: YYC3AnalysisContext): Promise<YYC3Entity[]>
  
  // 抽象方法：分析情感
  abstract analyzeSentiment(text: string, context?: YYC3AnalysisContext): Promise<YYC3Sentiment>
  
  // 抽象方法：识别意图
  abstract recognizeIntent(text: string, context?: YYC3AnalysisContext): Promise<YYC3Intent>
  
  // 通用方法：计算总体置信度
  protected calculateOverallConfidence(scores: YYC3ConfidenceScores): number {
    const weights = {
      entity: 0.3,
      sentiment: 0.2,
      intent: 0.3,
      concept: 0.1,
      relation: 0.1
    }
    
    return (
      scores.entity * weights.entity +
      scores.sentiment * weights.sentiment +
      scores.intent * weights.intent +
      scores.concept * weights.concept +
      scores.relation * weights.relation
    )
  }
  
  // 通用方法：创建错误
  protected createError(
    code: YYC3YuErrorCode,
    message: string,
    details?: any
  ): YYC3YuError {
    return {
      code,
      message,
      details,
      timestamp: new Date()
    }
  }
}

// 语层配置接口
export interface YYC3YuConfig {
  models: YYC3ModelConfig[]
  languages: string[]
  enabledAnalysis: YYC3AnalysisType[]
  confidenceThreshold: number
  timeout: number
  caching: boolean
}

// 模型配置
export interface YYC3ModelConfig {
  name: string
  type: 'local' | 'cloud' | 'hybrid'
  endpoint?: string
  apiKey?: string
  version: string
  capabilities: YYC3AnalysisType[]
}

// 语层常量
export const YYC3_YU_CONSTANTS = {
  DEFAULT_CONFIDENCE_THRESHOLD: 0.7,
  DEFAULT_TIMEOUT: 10000, // 10秒
  MAX_TEXT_LENGTH: 50000, // 50K字符
  MAX_ENTITIES: 1000,
  SUPPORTED_LANGUAGES: ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de'],
  DEFAULT_ANALYSIS_TYPES: [
    YYC3AnalysisType.NLP,
    YYC3AnalysisType.ENTITY_EXTRACTION,
    YYC3AnalysisType.SENTIMENT,
    YYC3AnalysisType.INTENT
  ]
}

// 导出类型联合
export type YYC3YuInputTypes = YYC3YuInput | YYC3YuOutput
export type YYC3YuConfigTypes = YYC3YuConfig | YYC3ModelConfig | YYC3AnalysisOptions
export type YYC3YuResultTypes = YYC3Entity | YYC3Sentiment | YYC3Intent | YYC3Concept | YYC3Relation
// 统一的语层类型
export type YYC3YuTypes = YYC3YuInput | YYC3YuOutput | YYC3YuConfig | YYC3ModelConfig | YYC3AnalysisOptions | YYC3Entity | YYC3Sentiment | YYC3Intent | YYC3Concept | YYC3Relation