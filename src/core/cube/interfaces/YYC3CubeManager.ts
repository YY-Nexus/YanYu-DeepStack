// YYC3CubeManager 模块管理器接口
export interface YYC3Module {
  id: string;
  name: string;
  version: string;
  type: string;
  description: string;
  initialize(config: Record<string, any>): Promise<void>;
  execute(...args: any[]): Promise<any>;
  shutdown(): Promise<void>;
  getStatus(): Record<string, any>;
}

export interface YYC3CubeManager {
  registerModule(module: YYC3Module): boolean;
  unregisterModule(moduleId: string): boolean;
  getModule(moduleId: string): YYC3Module | null;
  getModules(): Record<string, YYC3Module>;
  executeWorkflow(workflowId: string, params: Record<string, any>): Promise<any>;
  registerWorkflow(workflowId: string, moduleIds: string[]): boolean;
  unregisterWorkflow(workflowId: string): boolean;
  getWorkflows(): Record<string, string[]>;
  getModuleDependencies(moduleId: string): string[];
  resolveModuleDependencies(moduleId: string): Promise<boolean>;
}