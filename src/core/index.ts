// YYC³ 核心架构统一导出文件
// 提供完整的4层架构接口定义和类型支持

// 导出言(Yan)层 - 输入处理层
export * from './yan/interfaces'

// 导出语(Yu)层 - 智能分析层
export * from './yu/interfaces'

// 导出云(Cloud)层 - 云端服务层
export * from './cloud/interfaces'

// 导出立方³(Cube)层 - 系统集成层
export * from './cube/interfaces'

// YYC³ 核心架构接口联合类型
import type { YYC3YanTypes } from './yan/interfaces'
import type { YYC3YuTypes } from './yu/interfaces'
import type { YYC3CloudTypes } from './cloud/interfaces'
import type { YYC3CubeTypes } from './cube/interfaces'

// 统一的YYC³架构类型
export type YYC3ArchitectureTypes = 
  | YYC3YanTypes 
  | YYC3YuTypes 
  | YYC3CloudTypes 
  | YYC3CubeTypes

// YYC³ 4层架构枚举
export enum YYC3Layer {
  YAN = 'yan',      // 言层 - 输入处理
  YU = 'yu',        // 语层 - 智能分析
  CLOUD = 'cloud',  // 云层 - 云端服务
  CUBE = 'cube'     // 立方³层 - 系统集成
}

// YYC³ 架构版本信息
export const YYC3_ARCHITECTURE_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  build: new Date().toISOString().split('T')[0].replace(/-/g, ''),
  full: '1.0.0',
  codename: 'YanYuCloudCube-Genesis'
}

// YYC³ 品牌标识常量
export const YYC3_BRAND_IDENTITY = {
  name: 'YYC³',
  fullName: 'YanYuCloudCube',
  description: '言语云立方³ - 多模态智能处理平台',
  
  // 层级标识
  layers: {
    yan: { name: '言', description: '输入处理层', color: '#FF6B6B' },
    yu: { name: '语', description: '智能分析层', color: '#4ECDC4' },
    cloud: { name: '云', description: '云端服务层', color: '#45B7D1' },
    cube: { name: '立方³', description: '系统集成层', color: '#96CEB4' }
  },
  
  // 命名规范
  namingConvention: {
    prefix: 'YYC3',
    separator: '_',
    casing: 'SCREAMING_SNAKE_CASE',
    patterns: {
      constant: 'YYC3_{LAYER}_{NAME}',
      interface: 'YYC3{Layer}{Purpose}',
      class: 'YYC3{Layer}{Component}',
      enum: 'YYC3{Layer}{Category}',
      type: 'YYC3{Layer}Types'
    }
  },
  
  // 版权信息
  copyright: {
    year: new Date().getFullYear(),
    owner: 'YanYu Technology',
    license: 'MIT',
    url: 'https://yyc3.dev'
  }
}

// YYC³ 架构能力清单
export const YYC3_ARCHITECTURE_CAPABILITIES = {
  // 言层能力
  yan: [
    'multi_modal_input',     // 多模态输入
    'device_integration',    // 设备集成
    'user_context',         // 用户上下文
    'input_validation',     // 输入验证
    'preprocessing',        // 预处理
    'normalization'         // 标准化
  ],
  
  // 语层能力
  yu: [
    'nlp_analysis',         // 自然语言处理
    'entity_extraction',    // 实体抽取
    'sentiment_analysis',   // 情感分析
    'intent_recognition',   // 意图识别
    'semantic_understanding', // 语义理解
    'context_awareness'     // 上下文感知
  ],
  
  // 云层能力
  cloud: [
    'ai_service_integration', // AI服务集成
    'data_synchronization',   // 数据同步
    'authentication',         // 身份认证
    'scalability',           // 可扩展性
    'monitoring',            // 监控
    'security'               // 安全
  ],
  
  // 立方³层能力
  cube: [
    'module_management',     // 模块管理
    'workflow_orchestration', // 工作流编排
    'system_integration',    // 系统集成
    'configuration_management', // 配置管理
    'lifecycle_management',  // 生命周期管理
    'extensibility'         // 可扩展性
  ]
}

// YYC³ 配置标准
export interface YYC3ArchitectureConfig {
  // 架构版本
  version: string
  
  // 启用的层级
  enabledLayers: YYC3Layer[]
  
  // 品牌合规性
  brandCompliance: {
    enabled: boolean
    strictMode: boolean
    autofix: boolean
    reportingLevel: 'error' | 'warning' | 'info'
  }
  
  // 性能配置
  performance: {
    enableCaching: boolean
    maxMemoryUsage: number    // MB
    timeoutLimits: {
      yan: number            // ms
      yu: number             // ms
      cloud: number          // ms
      cube: number           // ms
    }
  }
  
  // 开发配置
  development: {
    debugMode: boolean
    verbose: boolean
    hotReload: boolean
    sourceMaps: boolean
  }
  
  // 生产配置
  production: {
    minification: boolean
    compression: boolean
    monitoring: boolean
    errorReporting: boolean
  }
}

// YYC³ 默认配置
export const YYC3_DEFAULT_CONFIG: YYC3ArchitectureConfig = {
  version: YYC3_ARCHITECTURE_VERSION.full,
  enabledLayers: [YYC3Layer.YAN, YYC3Layer.YU, YYC3Layer.CLOUD, YYC3Layer.CUBE],
  
  brandCompliance: {
    enabled: true,
    strictMode: false,
    autofix: true,
    reportingLevel: 'warning'
  },
  
  performance: {
    enableCaching: true,
    maxMemoryUsage: 512,
    timeoutLimits: {
      yan: 5000,
      yu: 10000,
      cloud: 30000,
      cube: 60000
    }
  },
  
  development: {
    debugMode: process.env.NODE_ENV === 'development',
    verbose: false,
    hotReload: true,
    sourceMaps: true
  },
  
  production: {
    minification: true,
    compression: true,
    monitoring: true,
    errorReporting: true
  }
}

// YYC³ 错误定义
export enum YYC3ArchitectureError {
  // 通用错误
  UNKNOWN_ERROR = 'YYC3_UNKNOWN_ERROR',
  CONFIGURATION_ERROR = 'YYC3_CONFIG_ERROR',
  VALIDATION_ERROR = 'YYC3_VALIDATION_ERROR',
  
  // 层级错误
  YAN_LAYER_ERROR = 'YYC3_YAN_ERROR',
  YU_LAYER_ERROR = 'YYC3_YU_ERROR',
  CLOUD_LAYER_ERROR = 'YYC3_CLOUD_ERROR',
  CUBE_LAYER_ERROR = 'YYC3_CUBE_ERROR',
  
  // 集成错误
  MODULE_LOAD_ERROR = 'YYC3_MODULE_LOAD_ERROR',
  DEPENDENCY_ERROR = 'YYC3_DEPENDENCY_ERROR',
  INTERFACE_MISMATCH = 'YYC3_INTERFACE_MISMATCH',
  
  // 品牌合规错误
  NAMING_VIOLATION = 'YYC3_NAMING_VIOLATION',
  ARCHITECTURE_VIOLATION = 'YYC3_ARCHITECTURE_VIOLATION',
  BRAND_COMPLIANCE_ERROR = 'YYC3_BRAND_COMPLIANCE_ERROR'
}

// YYC³ 架构异常类
export class YYC3ArchitectureException extends Error {
  public readonly code: YYC3ArchitectureError
  public readonly layer?: YYC3Layer
  public readonly timestamp: Date
  public readonly context?: any
  
  constructor(
    code: YYC3ArchitectureError,
    message: string,
    layer?: YYC3Layer,
    context?: any
  ) {
    super(message)
    this.name = 'YYC3ArchitectureException'
    this.code = code
    this.layer = layer
    this.timestamp = new Date()
    this.context = context
  }
  
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      layer: this.layer,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack
    }
  }
}

// YYC³ 架构验证器
export class YYC3ArchitectureValidator {
  private config: YYC3ArchitectureConfig
  
  constructor(config: YYC3ArchitectureConfig = YYC3_DEFAULT_CONFIG) {
    this.config = config
  }
  
  // 验证命名规范
  validateNaming(name: string, type: 'constant' | 'interface' | 'class' | 'enum' | 'type'): boolean {
    const pattern = YYC3_BRAND_IDENTITY.namingConvention.patterns[type]
    const regex = this.buildRegex(pattern)
    return regex.test(name)
  }
  
  // 验证接口合规性
  validateInterface(interfaceDefinition: any): YYC3ComplianceIssue[] {
    const issues: YYC3ComplianceIssue[] = []
    
    // 检查命名
    if (!this.validateNaming(interfaceDefinition.name, 'interface')) {
      issues.push({
        type: 'naming',
        severity: 'error',
        message: `Interface name '${interfaceDefinition.name}' does not follow YYC³ naming convention`,
        suggestion: `Rename to follow pattern: YYC3{Layer}{Purpose}`
      })
    }
    
    return issues
  }
  
  // 验证架构层级
  validateLayer(layer: YYC3Layer): boolean {
    return this.config.enabledLayers.includes(layer)
  }
  
  private buildRegex(pattern: string): RegExp {
    // 将模式转换为正则表达式
    const regexPattern = pattern
      .replace(/{LAYER}/g, '(YAN|YU|CLOUD|CUBE)')
      .replace(/{Layer}/g, '(Yan|Yu|Cloud|Cube)')
      .replace(/{NAME}/g, '[A-Z_]+')
      .replace(/{Purpose}/g, '[A-Z][a-zA-Z]*')
      .replace(/{Component}/g, '[A-Z][a-zA-Z]*')
      .replace(/{Category}/g, '[A-Z][a-zA-Z]*')
    
    return new RegExp(`^${regexPattern}$`)
  }
}

// YYC³ 架构工厂
export class YYC3ArchitectureFactory {
  private static instance: YYC3ArchitectureFactory
  private config: YYC3ArchitectureConfig
  private validator: YYC3ArchitectureValidator
  
  private constructor(config: YYC3ArchitectureConfig = YYC3_DEFAULT_CONFIG) {
    this.config = config
    this.validator = new YYC3ArchitectureValidator(config)
  }
  
  public static getInstance(config?: YYC3ArchitectureConfig): YYC3ArchitectureFactory {
    if (!YYC3ArchitectureFactory.instance) {
      YYC3ArchitectureFactory.instance = new YYC3ArchitectureFactory(config)
    }
    return YYC3ArchitectureFactory.instance
  }
  
  // 获取配置
  public getConfig(): YYC3ArchitectureConfig {
    return { ...this.config }
  }
  
  // 更新配置
  public updateConfig(updates: Partial<YYC3ArchitectureConfig>): void {
    this.config = { ...this.config, ...updates }
    this.validator = new YYC3ArchitectureValidator(this.config)
  }
  
  // 获取验证器
  public getValidator(): YYC3ArchitectureValidator {
    return this.validator
  }
  
  // 创建架构异常
  public createException(
    code: YYC3ArchitectureError,
    message: string,
    layer?: YYC3Layer,
    context?: any
  ): YYC3ArchitectureException {
    return new YYC3ArchitectureException(code, message, layer, context)
  }
}

// 导出合规性检查类型
import type { YYC3ComplianceIssue } from './cube/interfaces'
export type { YYC3ComplianceIssue }

// YYC³ 架构信息摘要
export const YYC3_ARCHITECTURE_SUMMARY = {
  brand: YYC3_BRAND_IDENTITY.name,
  version: YYC3_ARCHITECTURE_VERSION.full,
  layers: Object.keys(YYC3_BRAND_IDENTITY.layers).length,
  capabilities: Object.values(YYC3_ARCHITECTURE_CAPABILITIES).reduce((sum, caps) => sum + caps.length, 0),
  copyright: `© ${YYC3_BRAND_IDENTITY.copyright.year} ${YYC3_BRAND_IDENTITY.copyright.owner}`,
  license: YYC3_BRAND_IDENTITY.copyright.license
}