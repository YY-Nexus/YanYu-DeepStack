// 从common/types导入YYC3Response
import { YYC3Response } from '../../common/types';
import {
  YYC3WorkflowEngine,
  YYC3WorkflowDefinition,
  YYC3WorkflowStep,
  YYC3WorkflowExecution,
  YYC3StepType,
  YYC3ErrorHandling,
  YYC3WorkflowMetrics,
  YYC3CubeModule,
  YYC3ExecutionStatus
} from '../interfaces';

/**
 * 高级工作流引擎实现
 * 提供工作流定义、执行、监控和错误处理功能
 */
export class AdvancedWorkflowEngine extends YYC3WorkflowEngine {
  // 工作流定义存储
  private workflowDefinitions: Map<string, YYC3WorkflowDefinition> = new Map();
  // 工作流执行记录
  private executions: Map<string, YYC3WorkflowExecution> = new Map();
  // 模块注册表引用
  private moduleRegistry: { getModule(id: string): YYC3CubeModule | null; loadModule(id: string): Promise<YYC3CubeModule> };
  // 工作流指标收集器
  private metricsCollector: (execution: YYC3WorkflowExecution) => void;

  /**
   * 构造函数
   * @param registry 模块注册表
   * @param metricsCollector 指标收集器（可选）
   */
  constructor(
    registry: { getModule(id: string): YYC3CubeModule | null; loadModule(id: string): Promise<YYC3CubeModule> },
    metricsCollector?: (execution: YYC3WorkflowExecution) => void
  ) {
    super();
    this.moduleRegistry = registry;
    this.metricsCollector = metricsCollector || this.defaultMetricsCollector;
  }

  /**
   * 定义工作流
   * @param definition 工作流定义
   */
  public define(definition: YYC3WorkflowDefinition): void {
    // 验证工作流定义
    this.validateDefinition(definition);
    
    this.workflowDefinitions.set(definition.id, definition);
    console.log(`Workflow defined: ${definition.id}`);
  }

  /**
   * 执行工作流
   * @param workflowId 工作流ID
   * @param initialInput 初始输入
   * @returns 工作流执行结果
   */
  public async execute(workflowId: string, initialInput?: any): Promise<YYC3Response<YYC3WorkflowExecution>> {
    const definition = this.workflowDefinitions.get(workflowId);
    if (!definition) {
      return { success: false, error: `Workflow "${workflowId}" not found.` };
    }

    // 创建执行实例
    const execution: YYC3WorkflowExecution = {
      id: `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      startTime: new Date(),
      status: YYC3ExecutionStatus.RUNNING,
      context: initialInput || {},
      steps: [],
      metrics: {
        totalSteps: definition.steps.length,
        completedSteps: 0,
        failedSteps: 0,
        duration: 0,
        startTime: new Date()
      }
    };

    this.executions.set(execution.id, execution);
    
    try {
      // 执行工作流
      await this.executeWorkflow(definition, execution);
      
      // 收集指标
      this.metricsCollector(execution);
      
      return { success: true, data: execution };
    } catch (error: any) {
      execution.status = YYC3ExecutionStatus.FAILED;
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      execution.error = {
        code: 'WORKFLOW_EXECUTION_ERROR',
        message: error.message,
        timestamp: new Date(),
        details: error.stack
      };
      
      // 收集失败指标
      this.metricsCollector(execution);
      
      return { success: false, error: error.message, data: execution };
    }
  }

  /**
   * 获取工作流执行状态
   * @param executionId 执行ID
   * @returns 工作流执行状态
   */
  public getExecutionStatus(executionId: string): YYC3WorkflowExecution | null {
    return this.executions.get(executionId) || null;
  }

  /**
   * 取消工作流执行
   * @param executionId 执行ID
   * @returns 是否成功取消
   */
  public cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status === 'completed' || execution.status === 'failed' || execution.status === 'cancelled') {
      return false;
    }

    execution.status = YYC3ExecutionStatus.CANCELLED;
    execution.endTime = new Date();
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
    
    // 收集指标
    this.metricsCollector(execution);
    
    return true;
  }

  /**
   * 获取工作流指标
   * @param workflowId 工作流ID
   * @returns 工作流指标
   */
  public getWorkflowMetrics(workflowId: string): YYC3WorkflowMetrics {
    const executions = Array.from(this.executions.values())
      .filter(execution => execution.workflowId === workflowId);
    
    const metrics: YYC3WorkflowMetrics = {
      totalExecutions: executions.length,
      successfulExecutions: executions.filter(e => e.status === 'completed').length,
      failedExecutions: executions.filter(e => e.status === 'failed').length,
      avgExecutionTime: executions.length > 0 
        ? executions.reduce((sum, e) => sum + (e.duration || 0), 0) / executions.length
        : 0,
      successRate: executions.length > 0 
        ? (executions.filter(e => e.status === 'completed').length / executions.length) * 100
        : 0,
      mostFailedSteps: this.calculateMostFailedSteps(executions)
    };
    
    return metrics;
  }

  /**
   * 执行工作流逻辑
   * @param definition 工作流定义
   * @param execution 执行实例
   */
  private async executeWorkflow(definition: YYC3WorkflowDefinition, execution: YYC3WorkflowExecution): Promise<void> {
    // 初始化工作流上下文
    const context = new Map<string, any>();
    context.set('initialInput', execution.context);
    
    // 执行所有步骤
    for (const step of definition.steps) {
      // 检查执行是否已取消
      if (execution.status === 'cancelled') {
        return;
      }
      
      try {
        // 执行单个步骤
        const result = await this.executeStep(step, context);
        
        // 记录步骤执行结果
        execution.steps.push({
            stepId: step.id,
            status: YYC3ExecutionStatus.COMPLETED,
            startTime: new Date(),
            endTime: new Date(),
            output: result,
            attempts: 1
          });
        
        // 更新指标
        if (!execution.metrics) {
          execution.metrics = {
            totalSteps: definition.steps.length,
            completedSteps: 1,
            failedSteps: 0,
            duration: execution.endTime?.getTime() || 0 - execution.startTime.getTime(),
            startTime: execution.startTime
          };
        } else {
          execution.metrics.completedSteps++;
        }
      } catch (error: any) {
        // 处理步骤错误
        await this.handleStepError(step, error, execution, definition.errorHandling.strategy);
        
        // 根据错误处理策略决定是否继续执行
        if (definition.errorHandling.strategy === 'fail_fast') {
          throw error;
        }
      }
    }
    
    // 完成工作流
    execution.status = YYC3ExecutionStatus.COMPLETED;
    execution.endTime = new Date();
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
  }

  /**
   * 执行单个步骤
   * @param step 工作流步骤
   * @param context 上下文
   * @returns 步骤执行结果
   */
  private async executeStep(step: YYC3WorkflowStep, context: Map<string, any>): Promise<any> {
    // 解析输入数据
    const input = this.resolveInput(step.input, context);
    
    // 根据步骤类型执行不同的逻辑
    switch (step.type) {
      case YYC3StepType.CALL:
        return await this.executeModuleCallStep(step, input);
      case YYC3StepType.BRANCH:
        return await this.executeConditionalStep(step, input, context);
      case YYC3StepType.LOOP:
        return await this.executeLoopStep(step, input, context);
      default:
        throw new Error(`Unsupported step type: ${step.type}`);
    }
  }

  /**
   * 执行模块调用步骤
   * @param step 工作流步骤
   * @param input 输入数据
   * @returns 执行结果
   */
  private async executeModuleCallStep(step: YYC3WorkflowStep, input: any): Promise<any> {
    // 加载模块
    const module = await this.moduleRegistry.loadModule(step.module!);
    
    // 调用模块能力
    const capabilityMethod = (module as any)[step.capability];
    if (typeof capabilityMethod !== 'function') {
      throw new Error(`Capability "${step.capability}" not found in module "${step.module}".`);
    }
    
    // 执行能力并返回结果
    return await capabilityMethod.call(module, input);
  }

  /**
   * 执行条件步骤
   * @param step 工作流步骤
   * @param input 输入数据
   * @param context 上下文
   * @returns 执行结果
   */
  private async executeConditionalStep(step: YYC3WorkflowStep, input: any, context: Map<string, any>): Promise<any> {
    // 简化实现：实际应根据条件执行不同路径
    const conditionResult = this.evaluateCondition(input);
    return conditionResult;
  }

  /**
   * 执行循环步骤
   * @param step 工作流步骤
   * @param input 输入数据
   * @param context 上下文
   * @returns 执行结果
   */
  private async executeLoopStep(step: YYC3WorkflowStep, input: any, context: Map<string, any>): Promise<any> {
    // 简化实现：实际应根据循环条件执行多次
    const loopResults = [];
    const iterations = Math.min(input.iterations || 1, 100); // 防止无限循环
    
    for (let i = 0; i < iterations; i++) {
      try {
        const result = await this.executeModuleCallStep(step, { ...input, iteration: i });
        loopResults.push(result);
      } catch (error) {
        if (input.breakOnError) throw error;
        loopResults.push({ error: error instanceof Error ? error.message : String(error) });
      }
    }
    
    return loopResults;
  }

  /**
   * 解析输入数据
   * @param input 输入配置
   * @param context 上下文
   * @returns 解析后的输入数据
   */
  private resolveInput(input: any, context: Map<string, any>): any {
    // 简单实现：处理输入中的表达式
    if (!input || typeof input !== 'object') return input;
    
    // 克隆输入对象
    const resolvedInput = { ...input };
    
    // 处理表达式（简化版）
    for (const key in resolvedInput) {
      const value = resolvedInput[key];
      if (typeof value === 'string' && value.startsWith('$')) {
        // 简单变量解析：$context.key
        const match = value.match(/^\$context\.([\w.]+)$/);
        if (match) {
          resolvedInput[key] = this.getNestedValue(context.get('initialInput'), match[1]);
        }
      }
    }
    
    return resolvedInput;
  }

  /**
   * 处理步骤错误
   * @param step 工作流步骤
   * @param error 错误对象
   * @param execution 执行实例
   * @param strategy 错误处理策略
   */
  private async handleStepError(
    step: YYC3WorkflowStep,
    error: Error,
    execution: YYC3WorkflowExecution,
    strategy: string
  ): Promise<void> {
    // 记录错误
    execution.steps.push({
      stepId: step.id,
      status: YYC3ExecutionStatus.FAILED,
      startTime: new Date(),
      endTime: new Date(),
      attempts: 1,
      error: {
        code: 'STEP_EXECUTION_ERROR',
        message: error.message,
        timestamp: new Date()
      }
    });
    
    // 更新指标
    if (!execution.metrics) {
      execution.metrics = {
        totalSteps: 1,
        completedSteps: 0,
        failedSteps: 1,
        duration: 0,
        startTime: new Date()
      };
    } else {
      execution.metrics.failedSteps++;
    }
  }

  /**
   * 验证工作流定义
   * @param definition 工作流定义
   */
  private validateDefinition(definition: YYC3WorkflowDefinition): void {
    if (!definition.id || !definition.steps || definition.steps.length === 0) {
      throw new Error('Invalid workflow definition: missing required fields');
    }
    
    // 验证所有步骤中的模块引用
    for (const step of definition.steps) {
      if (step.type === YYC3StepType.CALL && step.module) {
        const module = this.moduleRegistry.getModule(step.module);
        if (!module) {
          throw new Error(`Module "${step.module}" referenced in step "${step.id}" is not registered`);
        }
      }
    }
  }

  /**
   * 评估条件
   * @param input 输入数据
   * @returns 条件评估结果
   */
  private evaluateCondition(input: any): boolean {
    // 简化实现：实际应根据条件表达式执行评估
    return input.condition || false;
  }

  /**
   * 获取嵌套值
   * @param obj 对象
   * @param path 路径
   * @returns 获取的值
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    return keys.reduce((o, key) => o && o[key] !== undefined ? o[key] : undefined, obj);
  }

  /**
   * 计算最常失败的步骤
   * @param executions 执行记录
   * @returns 最常失败的步骤列表
   */
  private calculateMostFailedSteps(executions: YYC3WorkflowExecution[]): { stepId: string; failureCount: number }[] {
    const failureCounts: Record<string, number> = {};
    
    executions.forEach(execution => {
      execution.steps.forEach(step => {
        if (step.status === 'failed' && step.stepId) {
          failureCounts[step.stepId] = (failureCounts[step.stepId] || 0) + 1;
        }
      });
    });
    
    return Object.entries(failureCounts)
      .map(([stepId, count]) => ({ stepId, failureCount: count }))
      .sort((a, b) => b.failureCount - a.failureCount)
      .slice(0, 5);
  }

  /**
   * 默认指标收集器
   * @param execution 执行实例
   */
  private defaultMetricsCollector(execution: YYC3WorkflowExecution): void {
    // 简单的日志记录
    console.log(`Workflow ${execution.workflowId} (${execution.id}) ${execution.status} in ${execution.duration}ms`);
  }
}
