// 导入必要的接口和类型
import { YYC3YuInput, YYC3YuOutput, YYC3Entity, YYC3IntentScore, YYC3Sentiment, YYC3ConfidenceScores, YYC3EntityType, YYC3AnalysisType, YYC3YuErrorCode } from '../../../core/yu/interfaces';
import { YYC3InputType } from '../../../core/yan/interfaces';
import { YYC3Response } from '../../../core/common/types';

// 导入基础分析器
import { YYC3YuNLPAnalyzer } from '../../../core/yu/implementations/NLPAnalyzer';

// 金融新闻分析器类，扩展基础NLP分析器
export class FinancialNewsAnalyzer extends YYC3YuNLPAnalyzer {
  // 实现分析方法，返回符合YYC3YuOutput类型的结果
  async analyze(input: YYC3YuInput): Promise<YYC3YuOutput> {
    const startTime = Date.now();
    try {
      // 创建符合YYC3YuOutput接口定义的输出对象
      const output: YYC3YuOutput = {
        intent: {
          primary: {
            intent: '',
            score: 0,
            confidence: 0
          } as YYC3IntentScore,
          alternatives: [],
          parameters: [],
          confidence: 0
        },
        entities: [],
        sentiment: {
          overall: {
            label: 'neutral',
            score: 0.5,
            confidence: 0.95
          },
          aspects: [],
          emotions: [],
          confidence: 0.95
        },
        concepts: [],
        relations: [],
        confidence: {
          overall: 0,
          entity: 0,
          sentiment: 0,
          intent: 0,
          concept: 0,
          relation: 0
        },
        processingTime: 0,
        timestamp: new Date(),
        success: true
      };
      
      // 从输入中获取文本内容
      const text = input.source?.processedContent || '';
      
      // 创建符合YYC3YuInput接口的输入对象，用于调用processInput方法
      const nlpInput: YYC3YuInput = {
        source: {
          processedContent: text,
          type: YYC3InputType.TEXT,
          timestamp: new Date(),
          processingTime: 0,
          success: true
        },
        analysisType: [
          YYC3AnalysisType.ENTITY_EXTRACTION,
          YYC3AnalysisType.SENTIMENT,
          YYC3AnalysisType.INTENT
        ]
      };
      
      // 使用父类的processInput方法进行基础分析
      const nlpResult = await this.processInput(nlpInput);
      
      // 金融领域特定的实体和意图提取
      const financialEntities = this.extractFinancialEntities(text);
      const financialIntent = this.identifyFinancialIntent(text);
      
      // 合并实体结果
      output.entities.push(...financialEntities);
      
      // 更新意图信息
      if (financialIntent.length > 0) {
        output.intent.alternatives.push(...financialIntent);
        output.intent.primary = financialIntent[0] as YYC3IntentScore;
        output.intent.confidence = financialIntent[0].confidence;
      }

      // 覆盖通用情感分析，使用金融领域特定情感分析
      output.sentiment = this.analyzeFinancialSentiment(text);

      // 设置置信度评分
      output.confidence = {
        overall: 0.9,
        entity: 0.95,
        sentiment: 0.95,
        intent: output.intent.confidence,
        concept: 0.8,
        relation: 0.7
      };
      
      // 设置处理时间
      output.processingTime = Date.now() - startTime;

      // 返回成功结果
      return output;
    } catch (error) {
      // 处理异常情况，返回符合YYC3YuOutput接口的错误结果
      return {
        entities: [],
        sentiment: {
          overall: { score: 0, label: 'neutral', confidence: 0 },
          aspects: [],
          emotions: [],
          confidence: 0
        },
        intent: {
          primary: { intent: 'UNKNOWN', score: 0, confidence: 0 },
          alternatives: [],
          parameters: [],
          confidence: 0
        },
        concepts: [],
        relations: [],
        confidence: {
          overall: 0,
          entity: 0,
          sentiment: 0,
          intent: 0,
          concept: 0,
          relation: 0
        },
        processingTime: Date.now() - startTime,
        timestamp: new Date(),
        success: false,
        errors: [{ code: YYC3YuErrorCode.ANALYSIS_FAILED, message: (error as Error).message, timestamp: new Date() }]
      };
    }
  }

  // 提取金融实体，返回符合YYC3Entity类型的数组
  private extractFinancialEntities(text: string): YYC3Entity[] {
    const entities: YYC3Entity[] = [];
    // 简单示例：提取股票代码 (如: AAPL, 600519.SH)
    const stockRegex = /\b([A-Z]{2,4}|\d{6}\.(SH|SZ))\b/g;
    let match;
    while ((match = stockRegex.exec(text)) !== null) {
      entities.push({
        id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: match[0],
        type: YYC3EntityType.PRODUCT,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.95
      });
    }
    return entities;
  }

  // 识别金融意图，返回符合YYC3IntentScore类型的数组
  private identifyFinancialIntent(text: string): YYC3IntentScore[] {
    if (/涨|跌|上涨|下跌|利好|利空/.test(text)) {
      return [{
        intent: 'market_sentiment_inquiry',
        score: 0.8,
        confidence: 0.8
      } as YYC3IntentScore];
    }
    return [];
  }

  // 分析金融情感，返回符合YYC3Sentiment类型的结果
  private analyzeFinancialSentiment(text: string): YYC3Sentiment {
    // 金融领域的情感分析，根据关键词判断情感倾向
    if (/利好|上涨|大涨/.test(text)) {
      return {
        overall: {
          label: 'positive',
          score: 0.9,
          confidence: 0.95
        },
        aspects: [],
        emotions: [],
        confidence: 0.95
      };
    }
    if (/利空|下跌|大跌/.test(text)) {
      return {
        overall: {
          label: 'negative',
          score: 0.1,
          confidence: 0.95
        },
        aspects: [],
        emotions: [],
        confidence: 0.95
      };
    }
    return {
      overall: {
        label: 'neutral',
        score: 0.5,
        confidence: 0.95
      },
      aspects: [],
      emotions: [],
      confidence: 0.95
    };
  }

  // 实现基类的getOutputSchema方法
  getOutputSchema(): Record<string, any> {
    return {
      type: 'object',
      properties: {
        intent: {
          type: 'object',
          properties: {
            primary: { type: 'object' },
            alternatives: { type: 'array' },
            parameters: { type: 'array' },
            confidence: { type: 'number' }
          }
        },
        entities: { type: 'array' },
        sentiment: { type: 'object' },
        concepts: { type: 'array' },
        relations: { type: 'array' },
        confidence: { type: 'object' },
        processingTime: { type: 'number' },
        timestamp: { type: 'string' },
        success: { type: 'boolean' }
      }
    };
  }

  // 实现基类的validate方法
  validate(data: any): boolean {
    return typeof data === 'string' && data.length > 0;
  }
}
