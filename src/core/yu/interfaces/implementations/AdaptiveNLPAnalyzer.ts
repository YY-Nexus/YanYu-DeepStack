import { YYC3YuNLPAnalyzer } from '../../implementations/NLPAnalyzer';
import { YYC3YuInput, YYC3YuOutput, YYC3Entity, YYC3Sentiment, YYC3Intent, YYC3ConfidenceScores, YYC3YuErrorCode } from '../';
import { YYC3Response } from '../../../common/types';

// 简单的内存存储，生产环境应使用数据库
const feedbackStore = new Map<string, number[]>();

export class AdaptiveNLPAnalyzer extends YYC3YuNLPAnalyzer {
  private sentimentThreshold = 0.6; // 可学习的阈值

  // 核心分析方法
  async analyze(input: YYC3YuInput): Promise<YYC3YuOutput> {
    try {
      // 使用父类的processInput方法进行基础处理
      const nlpResult = await this.processInput(input);
      
      // 构建符合YYC3YuOutput格式的响应
      const output: YYC3YuOutput = {
        entities: nlpResult.entities?.map((entity, index) => ({
          id: `entity-${Date.now()}-${index}`,
          text: entity.text || '',
          type: entity.type || 'concept',
          startIndex: 0,
          endIndex: entity.text?.length || 0,
          confidence: entity.confidence || 0.5
        })) || [],
        sentiment: {
          overall: {
            label: 'neutral',
            score: Math.random() * 0.4 + 0.3, // 模拟情感分数
            confidence: 0.8
          },
          aspects: [],
          emotions: [],
          confidence: 0.8
        },
        intent: {
          primary: {
            intent: 'analysis',
            score: 0.7,
            confidence: 0.7
          },
          alternatives: [],
          parameters: [],
          confidence: 0.7
        },
        concepts: [],
        relations: [],
        confidence: {
          overall: 0.85,
          entity: 0.8,
          sentiment: 0.8,
          intent: 0.7,
          concept: 0.5,
          relation: 0.5
        },
        processingTime: Date.now() - input.source.timestamp.getTime(),
        timestamp: new Date(),
        success: true
      };
      
      // 使用自适应阈值调整情感判断
      const score = output.sentiment.overall.score;
      if (score > this.sentimentThreshold) {
        output.sentiment.overall.label = 'positive';
      } else if (score < 1 - this.sentimentThreshold) {
        output.sentiment.overall.label = 'negative';
      } else {
        output.sentiment.overall.label = 'neutral';
      }
      
      // 为本次分析生成一个ID，用于后续反馈
      const analysisId = `analysis-${Date.now()}`;
      (output as any).id = analysisId;

      return output;
    } catch (error) {
      console.error(`[AdaptiveNLPAnalyzer] Analysis error:`, error);
      // 返回最小化的输出对象，并标记为失败
      return {
        entities: [],
        sentiment: { 
          overall: { label: 'neutral', score: 0, confidence: 0 },
          aspects: [],
          emotions: [],
          confidence: 0
        },
        intent: {
          primary: { intent: 'unknown', score: 0, confidence: 0 },
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
        processingTime: 0,
        timestamp: new Date(),
        success: false,
        errors: [{ code: YYC3YuErrorCode.ANALYSIS_FAILED, message: (error as Error).message || 'Analysis failed', timestamp: new Date() }]
      };
    }
  }

  // 新增：反馈接口
  feedback(analysisId: string, rating: number): void {
    if (!feedbackStore.has(analysisId)) {
      feedbackStore.set(analysisId, []);
    }
    feedbackStore.get(analysisId)!.push(rating);
    
    // 简单的自学习逻辑：根据所有反馈的平均值调整阈值
    this.updateThreshold();
  }

  private updateThreshold(): void {
    const allRatings = Array.from(feedbackStore.values()).flat();
    if (allRatings.length === 0) return;

    const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
    // 假设评分是1-5分，3分是中性。我们希望模型对高分更敏感
    this.sentimentThreshold = 0.5 + (avgRating - 3) * 0.1;
    this.sentimentThreshold = Math.max(0.1, Math.min(0.9, this.sentimentThreshold)); // 限制范围
    
    console.log(`[AdaptiveNLPAnalyzer] Threshold updated to: ${this.sentimentThreshold}`);
  }
}
