// YYC³ 四层架构模块注册与动态加载系统
// 基于 "言-语-云-立方" 架构设计

import React, { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// YYC³模块定义接口
export interface YYC3ModuleDefinition {
  id: string
  name: string
  version: string
  brandId: 'YYC3'
  layer: YYC3ArchitectureLayer
  category: YYC3ModuleCategory
  dependencies: string[]
  optional: boolean
  lazy: boolean
  component?: React.ComponentType<any>
  config?: YYC3ModuleConfig
}

// YYC³架构层定义
export enum YYC3ArchitectureLayer {
  YAN = 'yan',     // 言层：输入处理
  YU = 'yu',       // 语层：智能解析
  CLOUD = 'cloud', // 云层：云端服务
  CUBE = 'cube'    // 立方层：模块组装
}

export enum YYC3ModuleCategory {
  YAN_INPUT_PROCESSOR = 'yan-input-processor',
  YAN_VALIDATOR = 'yan-validator',
  YU_NLP_ANALYZER = 'yu-nlp-analyzer',
  YU_ENTITY_EXTRACTOR = 'yu-entity-extractor',
  CLOUD_API_CLIENT = 'cloud-api-client',
  CLOUD_DATA_SYNC = 'cloud-data-sync',
  CUBE_MODULE_MANAGER = 'cube-module-manager',
  CUBE_WORKFLOW = 'cube-workflow',
  COMMON_UTILITY = 'common-utility'
}

export interface YYC3ModuleConfig {
  [key: string]: any
}

// YYC³模块注册表 - 立方层核心管理器
export class YYC3ModuleRegistry {
  private modules: Map<string, YYC3ModuleDefinition> = new Map()
  private loadedModules: Map<string, any> = new Map()
  private moduleConfigs: Map<string, YYC3ModuleConfig> = new Map()
  private brandId: string = 'YYC3'
  
  constructor() {
    this.registerYYC3CoreModules()
  }

  // 注册YYC³模块
  register(module: YYC3ModuleDefinition) {
    this.validateYYC3Module(module)
    this.modules.set(module.id, module)
  }

  // 批量注册YYC³模块
  registerModules(modules: YYC3ModuleDefinition[]) {
    modules.forEach(module => this.register(module))
  }

  // 动态加载YYC³模块
  async loadModule(moduleId: string, config?: YYC3ModuleConfig): Promise<any> {
    const module = this.modules.get(moduleId)
    if (!module) {
      throw new Error(`模块 ${moduleId} 未找到`)
    }

    // 检查依赖
    await this.resolveDependencies(module.dependencies)

    // 设置配置
    if (config) {
      this.moduleConfigs.set(moduleId, config)
    }

    // 懒加载模块
    if (module.lazy && !this.loadedModules.has(moduleId)) {
      const loadedModule = await this.dynamicImport(moduleId)
      this.loadedModules.set(moduleId, loadedModule)
      return loadedModule
    }

    return this.loadedModules.get(moduleId) || module.component
  }

  // 卸载模块
  unloadModule(moduleId: string) {
    this.loadedModules.delete(moduleId)
    this.moduleConfigs.delete(moduleId)
  }

  // 获取YYC³模块配置
  getModuleConfig(moduleId: string): YYC3ModuleConfig | undefined {
    return this.moduleConfigs.get(moduleId)
  }

  // 获取已加载的YYC³模块
  getLoadedModules(): string[] {
    return Array.from(this.loadedModules.keys())
  }

  // 根据架构层获取模块
  getModulesByLayer(layer: YYC3ArchitectureLayer): YYC3ModuleDefinition[] {
    return Array.from(this.modules.values()).filter(
      module => module.layer === layer
    )
  }

  // 根据类别获取模块
  getModulesByCategory(category: YYC3ModuleCategory): YYC3ModuleDefinition[] {
    return Array.from(this.modules.values()).filter(
      module => module.category === category
    )
  }

  // 获取单个模块定义
  getModule(moduleId: string): YYC3ModuleDefinition | undefined {
    return this.modules.get(moduleId)
  }

  // 依赖解析
  private async resolveDependencies(dependencies: string[]): Promise<void> {
    for (const depId of dependencies) {
      if (!this.loadedModules.has(depId)) {
        await this.loadModule(depId)
      }
    }
  }

  // 动态导入
  private async dynamicImport(moduleId: string): Promise<any> {
    try {
      // 根据模块ID动态导入
      const modulePath = this.getYYC3ModulePath(moduleId)
      const module = await import(modulePath)
      return module.default || module
    } catch (error) {
      throw new Error(`加载模块 ${moduleId} 失败: ${error}`)
    }
  }

  // 获取YYC³模块路径
  private getYYC3ModulePath(moduleId: string): string {
    const pathMap: { [key: string]: string } = {
      // 言(Yan)层模块
      'yyc3-yan-voice-processor': '@/src/yan/yyc3-yan-voice-processor',
      'yyc3-yan-text-processor': '@/src/yan/yyc3-yan-text-processor',
      'yyc3-yan-input-validator': '@/src/yan/yyc3-yan-input-validator',
      
      // 语(Yu)层模块
      'yyc3-yu-nlp-analyzer': '@/src/yu/yyc3-yu-nlp-analyzer',
      'yyc3-yu-entity-extractor': '@/src/yu/yyc3-yu-entity-extractor',
      'yyc3-yu-sentiment-analyzer': '@/src/yu/yyc3-yu-sentiment-analyzer',
      
      // 云(Cloud)层模块
      'yyc3-cloud-api-client': '@/src/cloud/yyc3-cloud-api-client',
      'yyc3-cloud-data-sync': '@/src/cloud/yyc3-cloud-data-sync',
      'yyc3-cloud-security': '@/src/cloud/yyc3-cloud-security',
      
      // 立方(Cube)层模块
      'yyc3-cube-module-manager': '@/src/cube/yyc3-cube-module-manager',
      'yyc3-cube-workflow': '@/src/cube/yyc3-cube-workflow',
      'yyc3-cube-lifecycle': '@/src/cube/yyc3-cube-lifecycle',
      
      // 子产品模块
      'yyc3-edu-k12-platform': '@/src/products/yyc3-edu/yyc3-edu-k12-platform',
      'yyc3-med-telemedicine': '@/src/products/yyc3-med/yyc3-med-telemedicine',
      'yyc3-retail-ecommerce': '@/src/products/yyc3-retail/yyc3-retail-ecommerce'
    }

    return pathMap[moduleId] || `@/src/modules/${moduleId}`
  }

  // 验证YYC³模块
  private validateYYC3Module(module: YYC3ModuleDefinition) {
    if (!module.id || !module.name || !module.version) {
      throw new Error('YYC³模块必须包含 id、name 和 version')
    }

    if (module.brandId !== 'YYC3') {
      throw new Error(`模块 ${module.id} 必须使用 YYC3 品牌标识`)
    }

    if (!module.id.startsWith('yyc3-')) {
      throw new Error(`模块 ${module.id} ID必须以 'yyc3-' 开头`)
    }

    if (this.modules.has(module.id)) {
      throw new Error(`YYC³模块 ${module.id} 已存在`)
    }
  }

  // 注册YYC³核心模块
  private registerYYC3CoreModules() {
    const yyc3CoreModules: YYC3ModuleDefinition[] = [
      // 言(Yan)层核心模块
      {
        id: 'yyc3-yan-voice-processor',
        name: 'YYC³ 言层语音处理器',
        version: '1.0.0',
        brandId: 'YYC3',
        layer: YYC3ArchitectureLayer.YAN,
        category: YYC3ModuleCategory.YAN_INPUT_PROCESSOR,
        dependencies: [],
        optional: true,
        lazy: true
      },
      {
        id: 'yyc3-yan-text-processor',
        name: 'YYC³ 言层文本处理器',
        version: '1.0.0',
        brandId: 'YYC3',
        layer: YYC3ArchitectureLayer.YAN,
        category: YYC3ModuleCategory.YAN_INPUT_PROCESSOR,
        dependencies: [],
        optional: true,
        lazy: true
      },
      
      // 语(Yu)层核心模块
      {
        id: 'yyc3-yu-nlp-analyzer',
        name: 'YYC³ 语层NLP分析器',
        version: '1.0.0',
        brandId: 'YYC3',
        layer: YYC3ArchitectureLayer.YU,
        category: YYC3ModuleCategory.YU_NLP_ANALYZER,
        dependencies: ['yyc3-yan-text-processor'],
        optional: true,
        lazy: true
      },
      
      // 云(Cloud)层核心模块
      {
        id: 'yyc3-cloud-api-client',
        name: 'YYC³ 云层API客户端',
        version: '1.0.0',
        brandId: 'YYC3',
        layer: YYC3ArchitectureLayer.CLOUD,
        category: YYC3ModuleCategory.CLOUD_API_CLIENT,
        dependencies: [],
        optional: false,
        lazy: true
      },
      
      // 立方(Cube)层核心模块
      {
        id: 'yyc3-cube-module-manager',
        name: 'YYC³ 立方层模块管理器',
        version: '1.0.0',
        brandId: 'YYC3',
        layer: YYC3ArchitectureLayer.CUBE,
        category: YYC3ModuleCategory.CUBE_MODULE_MANAGER,
        dependencies: [],
        optional: false,
        lazy: false
      }
    ]

    this.registerModules(yyc3CoreModules)
  }
}

// YYC³配置加载器
export class YYC3ConfigurationLoader {
  private config: any = null
  private brandId: string = 'YYC3'

  async loadYYC3Configuration(configPath: string = './yyc3.config.json') {
    try {
      const response = await fetch(configPath)
      this.config = await response.json()
      
      // 验证配置文件品牌标识
      if (this.config.brandId !== 'YYC3') {
        throw new Error('配置文件必须包含 YYC3 品牌标识')
      }
      
      return this.config
    } catch (error) {
      console.warn('YYC³配置文件加载失败，使用默认配置')
      return this.getDefaultYYC3Config()
    }
  }

  getYYC3FeatureConfig(featureName: string): any {
    return this.config?.features?.[featureName] || {}
  }

  isYYC3FeatureEnabled(featureName: string): boolean {
    return this.config?.features?.[featureName]?.enabled !== false
  }

  getYYC3ModuleConfigs(): { [moduleId: string]: YYC3ModuleConfig } {
    return this.config?.modules || {}
  }

  private getDefaultYYC3Config() {
    return {
      brandId: 'YYC3',
      name: 'yyc3-default-platform',
      version: '1.0.0',
      product: {
        id: 'default',
        name: 'YYC³ AI-Powered Default Platform',
        edition: 'standard',
        domain: 'common'
      },
      architecture: {
        layers: {
          yan: { enabled: true },
          yu: { enabled: true },
          cloud: { enabled: true },
          cube: { enabled: true }
        }
      },
      features: {
        'yyc3-yan-voice-processor': { enabled: true },
        'yyc3-yu-nlp-analyzer': { enabled: true },
        'yyc3-cloud-api-client': { enabled: true }
      },
      modules: {}
    }
  }
}

// React Hook for YYC³模块管理
export function useYYC3ModuleSystem() {
  const [registry] = React.useState(() => new YYC3ModuleRegistry())
  const [configLoader] = React.useState(() => new YYC3ConfigurationLoader())
  const [loadedModules, setLoadedModules] = React.useState<string[]>([])

  React.useEffect(() => {
    initializeYYC3Modules()
  }, [])

  const initializeYYC3Modules = async () => {
    try {
      // 加载YYC³配置
      const config = await configLoader.loadYYC3Configuration()
      
      // 根据配置加载YYC³模块
      const moduleConfigs = configLoader.getYYC3ModuleConfigs()
      const enabledModules = Object.keys(moduleConfigs).filter(
        moduleId => configLoader.isYYC3FeatureEnabled(moduleId)
      )
      
      // 批量加载YYC³模块
      for (const moduleId of enabledModules) {
        await registry.loadModule(moduleId, moduleConfigs[moduleId])
      }
      
      setLoadedModules(registry.getLoadedModules())
    } catch (error) {
      console.error('YYC³模块系统初始化失败:', error)
    }
  }

  const loadYYC3Module = async (moduleId: string, config?: YYC3ModuleConfig): Promise<any> => {
    try {
      const loadedModule = await registry.loadModule(moduleId, config)
      setLoadedModules(registry.getLoadedModules())
      return loadedModule
    } catch (error) {
      console.error(`加载YYC³模块 ${moduleId} 失败:`, error)
      throw error // 重新抛出错误以便调用者能够处理
    }
  }

  const unloadYYC3Module = (moduleId: string) => {
    registry.unloadModule(moduleId)
    setLoadedModules(registry.getLoadedModules())
  }

  const isYYC3ModuleLoaded = (moduleId: string): boolean => {
    return loadedModules.includes(moduleId)
  }

  return {
    registry,
    loadedModules,
    loadModule: loadYYC3Module,
    unloadModule: unloadYYC3Module,
    isModuleLoaded: isYYC3ModuleLoaded,
    getModulesByLayer: (layer: YYC3ArchitectureLayer) => 
      registry.getModulesByLayer(layer),
    getModulesByCategory: (category: YYC3ModuleCategory) => 
      registry.getModulesByCategory(category)
  }
}

// 动态组件加载器
interface DynamicModuleLoaderProps {
  moduleId: string
  fallback?: React.ReactNode
  config?: YYC3ModuleConfig
  onLoad?: (module: any) => void
  onError?: (error: Error) => void
}

export const DynamicModuleLoader: React.FC<DynamicModuleLoaderProps> = ({
  moduleId,
  fallback = <Skeleton className="h-32 w-full" />,
  config,
  onLoad,
  onError
}) => {
  const { registry, loadModule, isModuleLoaded } = useYYC3ModuleSystem()
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null)

  React.useEffect(() => {
    if (!isModuleLoaded(moduleId)) {
      loadModule(moduleId, config)
        .then((loadedModule) => {
          if (loadedModule) {
            setComponent(() => loadedModule)
            onLoad?.(loadedModule)
          }
        })
        .catch(error => {
          console.error(`动态加载模块 ${moduleId} 失败:`, error)
          onError?.(error)
        })
    } else {
      // 如果模块已加载，直接获取并设置组件
      loadModule(moduleId, config)
        .then((loadedModule) => {
          if (loadedModule) {
            setComponent(() => loadedModule)
          }
        })
    }
  }, [moduleId, config, loadModule, isModuleLoaded, onLoad, onError])

  if (!Component) {
    return <Suspense fallback={fallback}>{fallback}</Suspense>
  }

  return <Component {...(config || {})} />
}

// YYC³模块配置编辑器组件
interface YYC3ModuleConfigEditorProps {
  moduleId: string
  onConfigChange: (config: YYC3ModuleConfig) => void
}

export const YYC3ModuleConfigEditor: React.FC<YYC3ModuleConfigEditorProps> = ({
  moduleId,
  onConfigChange
}) => {
  const { registry } = useYYC3ModuleSystem()
  const [config, setConfig] = React.useState<YYC3ModuleConfig>(
    registry.getModuleConfig(moduleId) || {}
  )

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onConfigChange(newConfig)
  }

  const module = registry.getModule(moduleId)
  if (!module) {
    return <div>YYC³模块 {moduleId} 未找到</div>
  }

  return (
    <div className="space-y-4 p-4 border rounded">
      <h3 className="font-semibold">
        {module.name} 配置
        <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {module.layer}层
        </span>
      </h3>
      <div className="space-y-2">
        <label>
          启用:
          <input
            type="checkbox"
            checked={config.enabled !== false}
            onChange={(e) => updateConfig('enabled', e.target.checked)}
            className="ml-2"
          />
        </label>
        
        {/* 根据YYC³架构层显示不同的配置选项 */}
        {(module.layer === YYC3ArchitectureLayer.YAN || module.layer === YYC3ArchitectureLayer.YU) && (
          <>
            <label>
              置信度阈值:
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.confidenceThreshold || 0.7}
                onChange={(e) => updateConfig('confidenceThreshold', parseFloat(e.target.value))}
                className="ml-2"
              />
              <span className="ml-2">{config.confidenceThreshold || 0.7}</span>
            </label>
          </>
        )}
        
        {module.layer === YYC3ArchitectureLayer.CLOUD && (
          <>
            <label>
              API端点:
              <input
                type="text"
                value={config.apiEndpoint || ''}
                onChange={(e) => updateConfig('apiEndpoint', e.target.value)}
                className="ml-2 border p-1 rounded"
              />
            </label>
          </>
        )}
      </div>
    </div>
  )
}

// YYC³全局模块系统实例
export const globalYYC3ModuleRegistry = new YYC3ModuleRegistry()
export const globalYYC3ConfigLoader = new YYC3ConfigurationLoader()