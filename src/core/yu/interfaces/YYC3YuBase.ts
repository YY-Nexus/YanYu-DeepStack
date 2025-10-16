// YYC3 Yu 层基础抽象类
export abstract class YYC3YuBase {
  protected config: Record<string, any>;

  constructor(config: Record<string, any> = {}) {
    this.config = config;
    this.initialize();
  }

  protected abstract initialize(): void;

  abstract process(data: any): Promise<any>;

  abstract validate(data: any): boolean;

  abstract getOutputSchema(): Record<string, any>;

  // 获取配置选项
  getConfig<T = any>(key: string, defaultValue?: T): T {
    if (key in this.config) {
      return this.config[key] as T;
    }
    return defaultValue as T;
  }

  // 更新配置
  updateConfig(config: Record<string, any>): void {
    this.config = { ...this.config, ...config };
  }

  // 生命周期钩子 - 在处理前调用
  protected async beforeProcess(data: any): Promise<any> {
    return data;
  }

  // 生命周期钩子 - 在处理后调用
  protected async afterProcess(result: any): Promise<any> {
    return result;
  }

  // 处理错误的默认实现
  protected handleError(error: Error): never {
    console.error(`[${this.constructor.name}] Error:`, error);
    throw error;
  }

  // 生成唯一ID
  protected generateId(prefix: string = ''): string {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}