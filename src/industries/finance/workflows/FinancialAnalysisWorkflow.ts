import { YYC3WorkflowDefinition, YYC3StepType } from '@/src/core/cube/interfaces';

export const FinancialNewsAnalysisWorkflow: YYC3WorkflowDefinition = {
  id: 'financial-news-analysis',
  // 触发器配置
  trigger: {
    type: 'api',
    config: {
      endpoint: '/api/financial-news/analyze',
      parameters: {
        query: 'string'
      }
    }
  },
  
  // 工作流步骤
  steps: [
    {
      id: 'fetch-news',
      name: '获取金融新闻',
      type: YYC3StepType.PROCESS,
      module: 'yyc3-cloud-api-client',
      capability: 'request',
      input: {
        source: 'trigger',
        mapping: {
          query: 'input.query'
        }
      },
      output: {
        target: 'next',
        mapping: {
          newsData: 'output.data'
        }
      }
    },
    {
      id: 'analyze-news',
      name: '分析金融新闻',
      type: YYC3StepType.PROCESS,
      module: 'financial-news-analyzer',
      capability: 'analyze',
      input: {
        source: 'previous',
        mapping: {
          source: 'input.newsData'
        }
      },
      output: {
        target: 'next',
        mapping: {
          analysisResult: 'output.data'
        }
      }
    },
    {
      id: 'generate-report',
      name: '生成分析报告',
      type: YYC3StepType.PROCESS,
      module: 'yyc3-cloud-api-client',
      capability: 'request',
      input: {
        source: 'previous',
        mapping: {
          service: '"llm/generate"',
          prompt: '"根据以下分析结果生成一份简报：" + input.analysisResult'
        }
      },
      output: {
        target: 'result',
        mapping: {
          report: 'output.data'
        }
      }
    }
  ],
  
  // 错误处理
  errorHandling: {
    strategy: 'fail_fast',
    onError: [{
      type: 'log',
      config: {
        level: 'error'
      }
    }],
    notifications: []
  },
  
  // 超时设置（毫秒）
  timeout: 30000,
  
  // 重试策略
  retryPolicy: {
    maxAttempts: 3,
    backoffStrategy: 'exponential',
    initialDelay: 1000,
    maxDelay: 10000,
    multiplier: 2
  }
};

// 导出一个符合接口定义的对象，避免TypeScript报错
export default FinancialNewsAnalysisWorkflow;
