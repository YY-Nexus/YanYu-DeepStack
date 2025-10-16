import { YYC3Response } from '../../common/types';

// 新增步骤类型
export type StepType = 'sequential' | 'parallel' | 'condition' | 'loop';

// 高级工作流步骤
export interface AdvancedWorkflowStep {
  id: string;
  name: string;
  type: StepType;
  module?: string;
  capability?: string;
  input?: Record<string, any>;
  // 通用输入
  inputFrom?: string | string[]; // 支持多个输入源
  // 并行步骤
  parallelSteps?: AdvancedWorkflowStep[];
  // 条件分支
  condition?: (context: Map<string, any>) => boolean; // 纯函数，根据上下文判断
  elseSteps?: AdvancedWorkflowStep[];
  // 循环
  loopCondition?: (context: Map<string, any>) => boolean; // 循环条件
  loopSteps?: AdvancedWorkflowStep[];
}

export interface AdvancedWorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  steps: AdvancedWorkflowStep[];
  version?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
