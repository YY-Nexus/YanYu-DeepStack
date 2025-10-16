# YYC³ 系统接口文档

## 目录

1. [核心模块接口](#核心模块接口)
2. [四层架构组件接口](#四层架构组件接口)
3. [工具服务接口](#工具服务接口)
4. [事件系统接口](#事件系统接口)
5. [数据模型接口](#数据模型接口)
6. [错误处理接口](#错误处理接口)

## 核心模块接口

### 1. 模块管理器接口

```typescript
/**
 * 模块管理器 - 负责管理所有YYC³模块的生命周期
 */
export interface YYC3ModuleManager {
  /**
   * 注册模块
   * @param module 模块实例
   */
  registerModule(module: YYC3Module): void;
  
  /**
   * 获取已注册的模块
   * @param moduleId 模块ID
   * @returns 模块实例
   */
  getModule(moduleId: string): YYC3Module | null;
  
  /**
   * 启动所有模块
   */
  startAll(): Promise<void>;
  
  /**
   * 停止所有模块
   */
  stopAll(): Promise<void>;
  
  /**
   * 获取所有模块的状态
   * @returns 模块状态映射
   */
  getModulesStatus(): Map<string, ModuleStatus>;
}
```

### 2. 配置管理器接口

```typescript
/**
 * 配置管理器 - 负责管理系统配置
 */
export interface YYC3ConfigManager {
  /**
   * 获取配置
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 配置值
   */
  get<T>(key: string, defaultValue?: T): T;
  
  /**
   * 设置配置
   * @param key 配置键
   * @param value 配置值
   */
  set<T>(key: string, value: T): void;
  
  /**
   * 加载配置
   * @param configPath 配置文件路径
   */
  load(configPath: string): Promise<void>;
  
  /**
   * 保存配置
   * @param configPath 配置文件路径
   */
  save(configPath: string): Promise<void>;
  
  /**
   * 验证配置
   * @param schema 配置验证模式
   * @returns 验证结果
   */
  validate(schema: Record<string, any>): boolean;
}
```

## 四层架构组件接口

### 1. 言层组件接口

```typescript
/**
 * 言层组件接口 - 处理原始输入数据
 */
export interface YYC3YanComponent extends YYC3Component {
  /**
   * 处理输入数据
   * @param input 原始输入数据
   * @returns 处理后的标准化数据
   */
  process(input: RawInput): Promise<StandardizedInput>;
  
  /**
   * 支持的输入类型
   */
  supportedInputTypes: string[];
  
  /**
   * 验证输入数据
   * @param input 输入数据
   * @returns 验证结果
   */
  validateInput(input: RawInput): boolean;
}

/**
 * 原始输入数据接口
 */
export interface RawInput {
  id: string;
  type: string;
  content: any;
  metadata?: Record<string, any>;
}

/**
 * 标准化输入数据接口
 */
export interface StandardizedInput {
  id: string;
  type: string;
  content: any;
  features?: Record<string, any>;
  metadata: Record<string, any>;
}
```

### 2. 语层组件接口

```typescript
/**
 * 语层组件接口 - 处理语言理解和转换
 */
export interface YYC3YuComponent extends YYC3Component {
  /**
   * 处理输入数据
   * @param input 标准化输入数据
   * @returns 语言处理结果
   */
  process(input: StandardizedInput): Promise<LanguageProcessedResult>;
  
  /**
   * 支持的语言
   */
  supportedLanguages: string[];
  
  /**
   * 分析语义
   * @param text 文本内容
   * @returns 语义分析结果
   */
  analyzeSemantics(text: string): Promise<SemanticAnalysis>;
}

/**
 * 语言处理结果接口
 */
export interface LanguageProcessedResult {
  id: string;
  intent?: string;
  entities?: Entity[];
  semantics?: SemanticAnalysis;
  transformedContent?: any;
  metadata: Record<string, any>;
}

/**
 * 实体接口
 */
export interface Entity {
  type: string;
  value: string;
  confidence: number;
  start: number;
  end: number;
}

/**
 * 语义分析结果接口
 */
export interface SemanticAnalysis {
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
  concepts?: string[];
  relationships?: Relationship[];
}

/**
 * 关系接口
 */
export interface Relationship {
  type: string;
  subject: string;
  object: string;
  confidence: number;
}
```

### 3. 云层组件接口

```typescript
/**
 * 云层组件接口 - 处理业务逻辑和数据处理
 */
export interface YYC3CloudComponent extends YYC3Component {
  /**
   * 处理输入数据
   * @param input 语言处理结果
   * @returns 业务处理结果
   */
  process(input: LanguageProcessedResult): Promise<BusinessProcessedResult>;
  
  /**
   * 支持的业务操作
   */
  supportedOperations: string[];
  
  /**
   * 执行业务操作
   * @param operation 操作名称
   * @param payload 操作数据
   * @returns 操作结果
   */
  executeOperation(operation: string, payload: any): Promise<any>;
}

/**
 * 业务处理结果接口
 */
export interface BusinessProcessedResult {
  id: string;
  operation: string;
  result: any;
  metadata: Record<string, any>;
  timestamp: number;
  processingTime: number;
}
```

### 4. 立方³层组件接口

```typescript
/**
 * 立方³层组件接口 - 处理多模态融合和输出
 */
export interface YYC3CubeComponent extends YYC3Component {
  /**
   * 处理输入数据
   * @param inputs 多模态输入数据数组
   * @returns 融合后的输出结果
   */
  process(inputs: BusinessProcessedResult[]): Promise<FinalOutput>;
  
  /**
   * 支持的输出格式
   */
  supportedOutputFormats: string[];
  
  /**
   * 评估输出质量
   * @param output 输出结果
   * @returns 质量评分
   */
  evaluateOutputQuality(output: FinalOutput): Promise<QualityScore>;
}

/**
 * 最终输出接口
 */
export interface FinalOutput {
  id: string;
  type: string;
  content: any;
  confidence?: number;
  metadata: Record<string, any>;
  sources?: string[];
}

/**
 * 质量评分接口
 */
export interface QualityScore {
  relevance: number;
  accuracy: number;
  completeness: number;
  consistency: number;
  overall: number;
  feedback?: string;
}
```

## 工具服务接口

### 1. 日志服务接口

```typescript
/**
 * 日志服务接口
 */
export interface YYC3Logger {
  /**
   * 记录调试日志
   * @param message 日志消息
   * @param data 附加数据
   */
  debug(message: string, data?: any): void;
  
  /**
   * 记录信息日志
   * @param message 日志消息
   * @param data 附加数据
   */
  info(message: string, data?: any): void;
  
  /**
   * 记录警告日志
   * @param message 日志消息
   * @param data 附加数据
   */
  warn(message: string, data?: any): void;
  
  /**
   * 记录错误日志
   * @param message 日志消息
   * @param error 错误对象
   * @param data 附加数据
   */
  error(message: string, error?: Error, data?: any): void;
  
  /**
   * 记录致命错误日志
   * @param message 日志消息
   * @param error 错误对象
   * @param data 附加数据
   */
  fatal(message: string, error?: Error, data?: any): void;
  
  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLevel(level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'): void;
}
```

### 2. 缓存服务接口

```typescript
/**
 * 缓存服务接口
 */
export interface YYC3CacheService {
  /**
   * 获取缓存值
   * @param key 缓存键
   * @returns 缓存值或null
   */
  get<T>(key: string): Promise<T | null>;
  
  /**
   * 设置缓存值
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒）
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  
  /**
   * 删除缓存值
   * @param key 缓存键
   */
  delete(key: string): Promise<void>;
  
  /**
   * 清除所有缓存
   */
  clear(): Promise<void>;
  
  /**
   * 获取缓存统计信息
   * @returns 统计信息
   */
  getStats(): Promise<CacheStats>;
}

/**
 * 缓存统计信息接口
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage?: number;
  evictions: number;
}
```

### 3. 监控服务接口

```typescript
/**
 * 监控服务接口
 */
export interface YYC3MonitoringService {
  /**
   * 记录指标
   * @param name 指标名称
   * @param value 指标值
   * @param tags 标签
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void;
  
  /**
   * 记录事件
   * @param name 事件名称
   * @param data 事件数据
   */
  recordEvent(name: string, data?: Record<string, any>): void;
  
  /**
   * 记录错误
   * @param error 错误对象
   * @param context 上下文信息
   */
  recordError(error: Error, context?: Record<string, any>): void;
  
  /**
   * 记录操作延迟
   * @param operation 操作名称
   * @param duration 延迟时间（毫秒）
   * @param success 是否成功
   */
  recordLatency(operation: string, duration: number, success?: boolean): void;
  
  /**
   * 获取系统健康状态
   * @returns 健康状态
   */
  getHealthStatus(): Promise<HealthStatus>;
}

/**
 * 健康状态接口
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, ComponentHealth>;
  timestamp: number;
  checks: HealthCheck[];
}

/**
 * 组件健康状态接口
 */
export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  details?: Record<string, any>;
  timestamp: number;
}

/**
 * 健康检查接口
 */
export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  error?: string;
  duration: number;
}
```

## 事件系统接口

```typescript
/**
 * 事件总线接口
 */
export interface YYC3EventBus {
  /**
   * 订阅事件
   * @param event 事件名称
   * @param listener 事件监听器
   */
  subscribe(event: string, listener: (data: any) => void): void;
  
  /**
   * 取消订阅事件
   * @param event 事件名称
   * @param listener 事件监听器
   */
  unsubscribe(event: string, listener: (data: any) => void): void;
  
  /**
   * 发布事件
   * @param event 事件名称
   * @param data 事件数据
   */
  publish(event: string, data: any): void;
  
  /**
   * 发布事件（异步）
   * @param event 事件名称
   * @param data 事件数据
   * @returns Promise
   */
  publishAsync(event: string, data: any): Promise<void>;
  
  /**
   * 获取事件订阅者数量
   * @param event 事件名称
   * @returns 订阅者数量
   */
  getSubscriberCount(event: string): number;
}

/**
 * 标准事件接口
 */
export interface YYC3Event {
  /**
   * 事件ID
   */
  id: string;
  /**
   * 事件类型
   */
  type: string;
  /**
   * 事件数据
   */
  data: any;
  /**
   * 事件源
   */
  source: string;
  /**
   * 事件时间戳
   */
  timestamp: number;
}
```

## 数据模型接口

### 1. 项目相关接口

```typescript
/**
 * 项目接口
 */
export interface Project {
  /**
   * 项目ID
   */
  id: string;
  /**
   * 项目名称
   */
  name: string;
  /**
   * 项目描述
   */
  description: string;
  /**
   * 项目类型
   */
  type: 'web' | 'mobile' | 'desktop' | 'api' | 'ai-model';
  /**
   * 项目状态
   */
  status: 'active' | 'archived' | 'template';
  /**
   * 项目可见性
   */
  visibility: 'private' | 'public' | 'team';
  /**
   * 项目元数据
   */
  metadata: ProjectMetadata;
  /**
   * 项目文件
   */
  files: ProjectFile[];
  /**
   * 团队成员
   */
  team: TeamMember[];
  /**
   * 项目权限
   */
  permissions: ProjectPermissions;
  /**
   * 项目版本
   */
  versions: ProjectVersion[];
  /**
   * 当前版本
   */
  currentVersion: string;
  /**
   * 部署配置
   */
  deployment: DeploymentConfig;
  /**
   * AI配置
   */
  aiConfig: AIConfig;
}

/**
 * 项目元数据接口
 */
export interface ProjectMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  language: string;
  framework: string;
  version: string;
}

/**
 * 项目文件接口
 */
export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  size: number;
  lastModified: string;
  modifiedBy: string;
  parent?: string;
  children?: string[];
}
```

### 2. 用户相关接口

```typescript
/**
 * 用户接口
 */
export interface User {
  /**
   * 用户ID
   */
  id: string;
  /**
   * 用户名
   */
  username: string;
  /**
   * 用户邮箱
   */
  email: string;
  /**
   * 用户角色
   */
  role: 'admin' | 'user' | 'guest' | 'student' | 'teacher';
  /**
   * 用户个人资料
   */
  profile: UserProfile;
  /**
   * 用户偏好设置
   */
  preferences: UserPreferences;
  /**
   * 账户状态
   */
  isActive: boolean;
  /**
   * 最后登录时间
   */
  lastLoginAt?: number;
  /**
   * 创建时间
   */
  createdAt: number;
  /**
   * 更新时间
   */
  updatedAt: number;
}

/**
 * 用户偏好设置接口
 */
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  defaultEditor?: 'vscode' | 'atom' | 'sublime';
  fontsize?: number;
}
```

### 3. 模型相关接口

```typescript
/**
 * 模型接口
 */
export interface Model {
  /**
   * 模型ID
   */
  id: string;
  /**
   * 模型名称
   */
  name: string;
  /**
   * 模型版本
   */
  version: string;
  /**
   * 模型状态
   */
  status: 'RUNNING' | 'STOPPED' | 'STARTING' | 'STOPPING' | 'UPDATING';
  /**
   * 启动时间
   */
  startTime?: string;
  /**
   * 每秒查询数
   */
  qps?: number;
  /**
   * 模型参数
   */
  params: ModelParameters;
  /**
   * 是否需要更新
   */
  needsUpdate?: boolean;
}

/**
 * 模型参数接口
 */
export interface ModelParameters {
  learningRate: number;
  batchSize: number;
  maxSeqLength: number;
  temperature: number;
  topP?: number;
  topK?: number;
}
```

## 错误处理接口

### 1. 错误类接口

```typescript
/**
 * YYC3错误基类
 */
export class YYC3Error extends Error {
  /**
   * 错误码
   */
  public code: string;
  
  /**
   * 错误级别
   */
  public severity: 'info' | 'warning' | 'error' | 'critical';
  
  /**
   * 错误上下文
   */
  public context?: Record<string, any>;
  
  /**
   * 错误时间戳
   */
  public timestamp: number;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param code 错误码
   * @param severity 错误级别
   * @param context 错误上下文
   */
  constructor(message: string, code: string, severity?: 'info' | 'warning' | 'error' | 'critical', context?: Record<string, any>);
  
  /**
   * 转换为JSON格式
   */
  toJSON(): Record<string, any>;
}

/**
 * 输入错误类
 */
export class YYC3InputError extends YYC3Error {
  /**
   * 构造函数
   * @param message 错误消息
   * @param context 错误上下文
   */
  constructor(message: string, context?: Record<string, any>);
}

/**
 * 处理错误类
 */
export class YYC3ProcessingError extends YYC3Error {
  /**
   * 构造函数
   * @param message 错误消息
   * @param context 错误上下文
   */
  constructor(message: string, context?: Record<string, any>);
}

/**
 * 依赖错误类
 */
export class YYC3DependencyError extends YYC3Error {
  /**
   * 构造函数
   * @param message 错误消息
   * @param context 错误上下文
   */
  constructor(message: string, context?: Record<string, any>);
}
```

### 2. 错误处理服务接口

```typescript
/**
 * 错误处理服务接口
 */
export interface YYC3ErrorHandler {
  /**
   * 处理错误
   * @param error 错误对象
   * @param context 错误上下文
   * @returns 标准化的错误对象
   */
  handle(error: unknown, context?: Record<string, any>): YYC3Error;
  
  /**
   * 注册错误处理器
   * @param handler 错误处理器
   */
  registerErrorHandler(handler: (error: YYC3Error) => void): void;
  
  /**
   * 带重试的异步操作
   * @param fn 异步函数
   * @param maxRetries 最大重试次数
   * @param retryDelay 重试延迟
   * @returns 函数执行结果
   */
  withRetry<T>(fn: () => Promise<T>, maxRetries?: number, retryDelay?: number): Promise<T>;
  
  /**
   * 获取错误统计信息
   * @returns 错误统计
   */
  getErrorStats(): ErrorStats;
}

/**
 * 错误统计接口
 */
export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recentErrors: RecentError[];
}

/**
 * 最近错误接口
 */
export interface RecentError {
  error: YYC3Error;
  timestamp: number;
  context?: Record<string, any>;
}
```

---

本接口文档提供了YYC³系统所有核心接口的详细定义，包括四层架构组件、工具服务、事件系统、数据模型和错误处理等方面。开发人员在实现新功能或集成现有功能时，请严格遵循这些接口规范。