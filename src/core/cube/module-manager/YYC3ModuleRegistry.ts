import { YYC3CubeModule } from '../interfaces';

/**
 * 模块定义接口
 */
export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  module: YYC3CubeModule;
  dependencies?: string[];
}

/**
 * 模块注册表类
 * 负责管理所有模块的注册、加载和依赖解析
 */
export class YYC3ModuleRegistry {
  private modules: Map<string, ModuleDefinition> = new Map();
  private loadedModules: Map<string, YYC3CubeModule> = new Map();

  /**
   * 注册一个新模块
   * @param definition 模块定义
   */
  register(definition: ModuleDefinition): void {
    if (this.modules.has(definition.id)) {
      throw new Error(`Module with id "${definition.id}" already registered.`);
    }
    
    this.modules.set(definition.id, definition);
    console.log(`[ModuleRegistry] Registered module: ${definition.name} (${definition.id})`);
  }

  /**
   * 获取一个已注册的模块
   * @param moduleId 模块ID
   * @returns 模块实例或undefined
   */
  get(moduleId: string): YYC3CubeModule | undefined {
    if (!this.loadedModules.has(moduleId)) {
      // 如果模块未加载，尝试加载它
      this.loadModule(moduleId);
    }
    
    return this.loadedModules.get(moduleId);
  }

  /**
   * 加载指定模块
   * @param moduleId 模块ID
   * @returns 是否加载成功
   */
  private loadModule(moduleId: string): boolean {
    const definition = this.modules.get(moduleId);
    if (!definition) {
      console.error(`[ModuleRegistry] Module "${moduleId}" not found.`);
      return false;
    }

    try {
      // 解析依赖
      if (definition.dependencies) {
        for (const dependencyId of definition.dependencies) {
          if (!this.loadModule(dependencyId)) {
            console.error(`[ModuleRegistry] Failed to load dependency "${dependencyId}" for module "${moduleId}".`);
            return false;
          }
        }
      }

      // 初始化模块
      const module = definition.module;
      
      // 存储加载的模块
      this.loadedModules.set(moduleId, module);
      console.log(`[ModuleRegistry] Loaded module: ${definition.name} (${definition.id})`);
      return true;
    } catch (error) {
      console.error(`[ModuleRegistry] Error loading module "${moduleId}":`, error);
      return false;
    }
  }

  /**
   * 获取所有已注册的模块ID
   * @returns 模块ID数组
   */
  getAllModuleIds(): string[] {
    return Array.from(this.modules.keys());
  }

  /**
   * 获取所有已注册的模块定义
   * @returns 模块定义数组
   */
  getAllModules(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /**
   * 获取模块的依赖关系
   * @param moduleId 模块ID
   * @returns 依赖模块ID数组
   */
  getModuleDependencies(moduleId: string): string[] {
    const definition = this.modules.get(moduleId);
    return definition?.dependencies || [];
  }

  /**
   * 卸载模块
   * @param moduleId 模块ID
   * @returns 是否卸载成功
   */
  unloadModule(moduleId: string): boolean {
    if (!this.loadedModules.has(moduleId)) {
      return false;
    }

    // 检查是否有其他模块依赖于此模块
    for (const [id, definition] of this.modules.entries()) {
      if (id !== moduleId && 
          definition.dependencies && 
          definition.dependencies.includes(moduleId) && 
          this.loadedModules.has(id)) {
        console.error(`[ModuleRegistry] Cannot unload module "${moduleId}" as it is used by module "${id}".`);
        return false;
      }
    }

    this.loadedModules.delete(moduleId);
    console.log(`[ModuleRegistry] Unloaded module: ${moduleId}`);
    return true;
  }

  /**
   * 卸载所有模块
   */
  unloadAllModules(): void {
    this.loadedModules.clear();
    console.log('[ModuleRegistry] Unloaded all modules.');
  }

  /**
   * 检查模块是否已注册
   * @param moduleId 模块ID
   * @returns 是否已注册
   */
  isRegistered(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }

  /**
   * 检查模块是否已加载
   * @param moduleId 模块ID
   * @returns 是否已加载
   */
  isLoaded(moduleId: string): boolean {
    return this.loadedModules.has(moduleId);
  }

  /**
   * 动态导入模块
   * @param path 模块路径
   * @returns 模块实例
   */
  private async dynamicImport(path: string): Promise<any> {
    try {
      const module = await import(path);
      return module.default || module;
    } catch (error) {
      console.error(`[ModuleRegistry] Failed to dynamically import module from "${path}":`, error);
      throw error;
    }
  }
}