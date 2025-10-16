// NLPAnalyzer 自然语言分析器实现
import { 
  YYC3YuBase, 
  YYC3YuInput, 
  YYC3YuOutput, 
  YYC3AnalysisType, 
  YYC3Entity, 
  YYC3Sentiment, 
  YYC3Intent, 
  YYC3Concept, 
  YYC3Relation, 
  YYC3YuError, 
  YYC3YuErrorCode,
  YYC3YuConfig,
  YYC3AnalysisContext,
  YYC3EntityType,
  YYC3ConfidenceScores
} from '../interfaces';

// 输入验证结果类型
export interface YYC3ValidationResult {
  valid: boolean;
  errors: YYC3YuError[];
}

/**
 * NLP分析器实现
 * 负责执行各种自然语言处理任务，包括实体提取、情感分析、意图识别等
 */
export class YYC3YuNLPAnalyzer extends YYC3YuBase {
  private supportedLanguages: string[] = [];
  private enabledAnalysisTypes: YYC3AnalysisType[] = [];

  /**
   * 初始化分析器
   */
  protected initialize(): void {
    // 从配置中获取支持的语言
    this.supportedLanguages = this.config.languages || ['en', 'zh', 'ja'];
    
    // 从配置中获取启用的分析类型
    this.enabledAnalysisTypes = this.config.enabledAnalysis || [
      YYC3AnalysisType.ENTITY_EXTRACTION,
      YYC3AnalysisType.SENTIMENT
    ];
    
    console.log(`YYC3YuNLPAnalyzer initialized with supported languages: ${this.supportedLanguages.join(', ')}`);
    console.log(`Enabled analysis types: ${this.enabledAnalysisTypes.join(', ')}`);
  }

  /**
   * 处理语言分析输入
   * @param input 输入数据
   * @returns 分析结果
   */
  public async processInput(input: YYC3YuInput): Promise<YYC3YuOutput> {
    const startTime = Date.now();
    
    // 验证输入
    const validationResult = this.validateInput(input);
    if (!validationResult.valid) {
      return this.formatOutput(
        [], // 空实体数组
        undefined, // 无情感分析结果
        input,
        Date.now() - startTime,
        false,
        validationResult.errors
      );
    }

    try {
      // 确保输入内容是字符串
      if (typeof input.source.processedContent !== 'string') {
        throw this.createError(
          YYC3YuErrorCode.ANALYSIS_FAILED,
          'Content must be a string for NLP analysis'
        );
      }

      // 使用上下文中指定的语言或默认英语
      const language = input.context?.language || 'en';

      // 检查语言是否受支持
      if (!this.supportedLanguages.includes(language)) {
        throw this.createError(
          YYC3YuErrorCode.UNSUPPORTED_LANGUAGE,
          `Language ${language} is not supported by this analyzer`
        );
      }

      // 执行各种分析任务
      const entities: YYC3Entity[] = [];
      let sentiment: YYC3Sentiment | undefined;
      
      // 实体提取
      if (this.enabledAnalysisTypes.includes(YYC3AnalysisType.ENTITY_EXTRACTION)) {
        const extractedEntities = this.extractEntitiesInternal(input.source.processedContent, language);
        entities.push(...extractedEntities);
      }
      
      // 情感分析
      if (this.enabledAnalysisTypes.includes(YYC3AnalysisType.SENTIMENT)) {
        sentiment = this.analyzeSentimentInternal(input.source.processedContent, language);
      }
      
      // 记录处理时间
      const processingTime = Date.now() - startTime;
      
      return this.formatOutput(
        entities,
        sentiment,
        input,
        processingTime,
        true,
        [],
        {
          language
        }
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorObj = this.createError(
        YYC3YuErrorCode.ANALYSIS_FAILED,
        error instanceof Error ? error.message : 'Unknown analysis error'
      );
      
      return this.formatOutput(
        [], // 空实体数组
        undefined, // 无情感分析结果
        input,
        processingTime,
        false,
        [errorObj]
      );
    }
  }

  /**
   * 格式化输出结果
   */
  private formatOutput(
    entities: YYC3Entity[],
    sentiment: YYC3Sentiment | undefined,
    input: YYC3YuInput,
    processingTime: number,
    success: boolean,
    errors?: YYC3YuError[],
    metadata?: Record<string, any>
  ): YYC3YuOutput {
    // 计算实体提取的平均置信度
    const entitiesConfidence = entities.length > 0 
      ? entities.reduce((sum, entity) => sum + (entity.confidence || 0.5), 0) / entities.length 
      : 0.5;

    // 获取情感分析的置信度
    const sentimentConfidence = sentiment?.confidence || 0.5;

    return {
      entities,
      sentiment: sentiment || {
        overall: {
          label: 'neutral',
          score: 0,
          confidence: 0.5
        },
        aspects: [],
        emotions: [],
        confidence: 0.5
      },
      intent: {
        primary: {
          intent: 'UNKNOWN',
          score: 0.5,
          confidence: 0.5
        },
        alternatives: [],
        parameters: [],
        confidence: 0.5
      },
      concepts: [],
      relations: [],
      confidence: {
        overall: (entitiesConfidence + sentimentConfidence + 0.5 + 0.5 + 0.5) / 5, // 计算所有分析类型的平均置信度
        entity: entitiesConfidence,
        sentiment: sentimentConfidence,
        intent: 0.5,
        concept: 0.5,
        relation: 0.5
      },
      processingTime,
      timestamp: new Date(),
      success,
      errors: errors || []
    };
  }

  /**
   * 验证输入数据
   * @param input 输入数据
   * @returns 验证结果
   */
  public validateInput(input: YYC3YuInput): YYC3ValidationResult {
    const errors: YYC3YuError[] = [];
    
    // 验证内容
    if (!input.source.processedContent) {
      errors.push(
        this.createError(
          YYC3YuErrorCode.ANALYSIS_FAILED,
          'Input content cannot be empty'
        )
      );
    } else if (typeof input.source.processedContent !== 'string') {
      errors.push(
        this.createError(
          YYC3YuErrorCode.ANALYSIS_FAILED,
          'Content must be a string'
        )
      );
    } else {
      // 验证长度
      const maxLength = 100000; // 默认100KB
      if (input.source.processedContent.length > maxLength) {
        errors.push(
          this.createError(
            YYC3YuErrorCode.ANALYSIS_FAILED,
            `Input exceeds maximum length of ${maxLength} characters`
          )
        );
      }
    }
    
    // 验证请求的分析类型
    if (input.analysisType) {
      const unsupportedTypes = input.analysisType.filter(
        type => !this.enabledAnalysisTypes.includes(type)
      );
      
      if (unsupportedTypes.length > 0) {
        errors.push(
          this.createError(
            YYC3YuErrorCode.ANALYSIS_FAILED,
            `Unsupported analysis types: ${unsupportedTypes.join(', ')}`
          )
        );
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 实现抽象方法：分析输入
   */
  public async analyze(input: YYC3YuInput): Promise<YYC3YuOutput> {
    // 调用现有的processInput方法进行处理
    return this.processInput(input);
  }

  /**
   * 实现抽象方法：提取实体
   */
  public async extractEntities(text: string, context?: YYC3AnalysisContext): Promise<YYC3Entity[]> {
    const language = context?.language || 'en';
    return this.extractEntitiesInternal(text, language);
  }

  /**
   * 实现抽象方法：分析情感
   */
  public async analyzeSentiment(text: string, context?: YYC3AnalysisContext): Promise<YYC3Sentiment> {
    const language = context?.language || 'en';
    return this.analyzeSentimentInternal(text, language);
  }

  /**
   * 实现抽象方法：识别意图
   */
  public async recognizeIntent(text: string, context?: YYC3AnalysisContext): Promise<YYC3Intent> {
    // 简单的意图识别实现
    const language = context?.language || 'en';
    const lowerText = text.toLowerCase();
    
    // 基于关键词的简单意图识别
    if (lowerText.includes('what') || lowerText.includes('how') || lowerText.includes('why')) {
      return {
        primary: {
          intent: 'QUESTION',
          score: 0.8,
          confidence: 0.8
        },
        alternatives: [],
        parameters: [],
        confidence: 0.8
      };
    } else if (lowerText.includes('help') || lowerText.includes('support')) {
      return {
        primary: {
          intent: 'HELP',
          score: 0.7,
          confidence: 0.7
        },
        alternatives: [],
        parameters: [],
        confidence: 0.7
      };
    } else if (lowerText.includes('thank') || lowerText.includes('thanks')) {
      return {
        primary: {
          intent: 'GRATITUDE',
          score: 0.9,
          confidence: 0.9
        },
        alternatives: [],
        parameters: [],
        confidence: 0.9
      };
    }
    
    // 默认意图
    return {
      primary: {
        intent: 'INFORMATIONAL',
        score: 0.5,
        confidence: 0.5
      },
      alternatives: [],
      parameters: [],
      confidence: 0.5
    };
  }

  /**
   * 提取实体的内部实现
   * @param text 输入文本
   * @param language 语言代码
   * @returns 实体列表
   */
  private extractEntitiesInternal(text: string, language: string): YYC3Entity[] {
    const entities: YYC3Entity[] = [];
    
    // 数字实体提取
    const numberMatches = text.match(/\d+(\.\d+)?/g) || [];
    numberMatches.forEach(num => {
      entities.push({
        id: `entity_${entities.length}_${Date.now()}`,
        text: num,
        type: YYC3EntityType.NUMBER,
        startIndex: text.indexOf(num),
        endIndex: text.indexOf(num) + num.length,
        confidence: 0.95
      });
    });
    
    // 根据语言添加特定的实体提取逻辑
    if (language === 'en') {
      // 简单的英文人名提取
        const nameRegex = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
        const nameMatches = text.match(nameRegex) || [];
        nameMatches.forEach(name => {
          entities.push({
            id: `entity_${entities.length}_${Date.now()}`,
            text: name,
            type: YYC3EntityType.PERSON,
            startIndex: text.indexOf(name),
            endIndex: text.indexOf(name) + name.length,
            confidence: 0.7
          });
        });
    } else if (language === 'zh') {
      // 中文人名提取示例
      // 这里使用简化的模式，实际应用中需要更复杂的规则或专门的中文NLP库
    }
    
    return entities;
  }

  /**
   * 分析情感的内部实现
   * @param text 输入文本
   * @param language 语言代码
   * @returns 情感分析结果
   */
  private analyzeSentimentInternal(text: string, language: string): YYC3Sentiment {
    // 根据不同语言使用不同的情感词典
    const positiveWords: string[] = [];
    const negativeWords: string[] = [];
    
    if (language === 'en') {
      // 英文情感词典
      positiveWords.push('good', 'excellent', 'great', 'positive', 'happy', 'success', 'love', 'like', 'wonderful', 'amazing');
      negativeWords.push('bad', 'terrible', 'poor', 'negative', 'sad', 'failure', 'hate', 'dislike', 'horrible', 'awful');
    } else if (language === 'zh') {
      // 中文情感词典
      positiveWords.push('好', '优秀', '很棒', '积极', '开心', '成功', '爱', '喜欢', '精彩', '令人惊叹');
      negativeWords.push('坏', '糟糕', '差', '消极', '难过', '失败', '讨厌', '不喜欢', '可怕', '糟糕透顶');
    }
    
    let positiveCount = 0;
    let negativeCount = 0;
    const words = text.toLowerCase().split(/\s+/);
    
    // 计算情感词出现次数
    words.forEach(word => {
      if (positiveWords.some(posWord => word.includes(posWord))) positiveCount++;
      if (negativeWords.some(negWord => word.includes(negWord))) negativeCount++;
    });
    
    // 计算情感得分和标签
    let score = 0;
    let label: 'positive' | 'negative' | 'neutral' = 'neutral';
    
    if (positiveCount > negativeCount) {
      label = 'positive';
      score = positiveCount / (positiveCount + negativeCount || 1);
    } else if (negativeCount > positiveCount) {
      label = 'negative';
      score = -(negativeCount / (positiveCount + negativeCount || 1));
    }
    
    return {
      overall: {
        label,
        score,
        confidence: Math.max(0.3, Math.abs(score)) // 确保最低置信度
      },
      aspects: [],
      emotions: [],
      confidence: Math.max(0.3, Math.abs(score))
    };
  }

  /**
   * 语言检测
   * @param text 输入文本
   * @returns 语言检测结果
   */
  private detectLanguage(text: string): { language: string; confidence: number; alternatives: any[] } {
    // 检测中文字符
    const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
    // 检测日文字符
    const japaneseChars = text.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || [];
    // 检测韩文字符
    const koreanChars = text.match(/[\uac00-\ud7af]/g) || [];
    
    const totalChars = text.length;
    
    // 计算各种文字的比例
    const chineseRatio = chineseChars.length / totalChars;
    const japaneseRatio = japaneseChars.length / totalChars;
    const koreanRatio = koreanChars.length / totalChars;
    
    // 判断主要语言
    let language = 'en'; // 默认英语
    let confidence = 0.5;
    
    if (chineseRatio > 0.3) {
      language = 'zh';
      confidence = Math.min(1.0, chineseRatio * 2);
    } else if (japaneseRatio > 0.3) {
      language = 'ja';
      confidence = Math.min(1.0, japaneseRatio * 2);
    } else if (koreanRatio > 0.3) {
      language = 'ko';
      confidence = Math.min(1.0, koreanRatio * 2);
    }
    
    return {
      language,
      confidence,
      alternatives: []
    };
  }

  /**
   * 分词
   * @param text 输入文本
   * @param language 语言代码
   * @returns 分词结果
   */
  private tokenize(text: string, language: string): { tokens: string[]; detailedTokens: Array<{ text: string; span: { start: number; end: number } }> } {
    let tokens: Array<{ text: string; span: { start: number; end: number } }> = [];
    
    if (language === 'en' || language === 'ja' || language === 'ko') {
      // 英文、日文、韩文使用空格分词
      const tokenMatches = Array.from(text.matchAll(/\S+/g));
      tokens = tokenMatches.map(match => ({
        text: match[0],
        span: {
          start: match.index || 0,
          end: (match.index || 0) + match[0].length
        }
      }));
    } else if (language === 'zh') {
      // 中文分词（简化版本）
      // 实际应用中应使用专门的中文分词库如jieba、HanLP等
      for (let i = 0; i < text.length; i++) {
        // 简单地将每个字符作为一个词
        tokens.push({
          text: text[i],
          span: {
            start: i,
            end: i + 1
          }
        });
      }
    }
    
    return {
      tokens: tokens.map(t => t.text),
      detailedTokens: tokens
    };
  }

  /**
   * 语法分析
   * @param text 输入文本
   * @param language 语言代码
   * @returns 语法分析结果
   */
  private analyzeSyntax(text: string, language: string): { sentences: string[]; partsOfSpeech: Array<{ text: string; tag: string; span: { start: number; end: number } }>; dependencies: any[] } {
    // 分句
    const sentences = text.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
    
    // 分词
    const tokenResult = this.tokenize(text, language);
    
    // 简化的词性标注
    const partsOfSpeech = tokenResult.detailedTokens.map(token => ({
      text: token.text,
      tag: this.detectPartOfSpeech(token.text, language),
      span: token.span
    }));
    
    return {
      sentences,
      partsOfSpeech,
      dependencies: [] // 依赖解析在简化实现中省略
    };
  }

  /**
   * 提取关键词
   * @param text 输入文本
   * @param language 语言代码
   * @returns 关键词列表
   */
  private extractKeyPhrases(text: string, language: string): string[] {
    // 分词
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    // 停用词表
    const stopwords = new Set();
    
    if (language === 'en') {
      stopwords.add('the').add('a').add('an').add('and').add('or').add('but').add('is').add('are').add('was').add('were');
    } else if (language === 'zh') {
      stopwords.add('的').add('了').add('是').add('在').add('有').add('和').add('就').add('不').add('人').add('都');
    }
    
    // 过滤停用词并返回前5个关键词
    return words.filter(word => !stopwords.has(word)).slice(0, 5);
  }

  /**
   * 词性检测
   * @param word 单词
   * @param language 语言代码
   * @returns 词性标签
   */
  private detectPartOfSpeech(word: string, language: string): string {
    // 非常简化的词性检测
    // 实际应用中应使用专门的词性标注库
    
    if (language === 'en') {
      const nouns = ['apple', 'banana', 'computer', 'book', 'person', 'city', 'country'];
      const verbs = ['run', 'walk', 'eat', 'read', 'write', 'see', 'hear'];
      const adjectives = ['red', 'blue', 'happy', 'sad', 'big', 'small', 'good', 'bad'];
      
      const lowerWord = word.toLowerCase();
      if (nouns.includes(lowerWord)) return 'NOUN';
      if (verbs.includes(lowerWord)) return 'VERB';
      if (adjectives.includes(lowerWord)) return 'ADJ';
    }
    
    return 'UNKNOWN';
  }

  /**
   * 计算总体置信度
   * @param scores 置信度分数
   * @returns 总体置信度
   */
  protected calculateOverallConfidence(scores: YYC3ConfidenceScores): number {
    const weights = {
      entity: 0.3,
      sentiment: 0.2,
      intent: 0.3,
      concept: 0.1,
      relation: 0.1
    }
    
    return (
      scores.entity * weights.entity +
      scores.sentiment * weights.sentiment +
      scores.intent * weights.intent +
      scores.concept * weights.concept +
      scores.relation * weights.relation
    )
  }
}

/**
 * 创建NLP分析器实例的工厂函数
 * @param config 配置参数
 * @returns NLP分析器实例
 */
export function createNLPAnalyzer(config: Partial<YYC3YuConfig> = {}): YYC3YuNLPAnalyzer {
  const defaultConfig: YYC3YuConfig = {
    languages: ['en', 'zh', 'ja'],
    enabledAnalysis: [
      YYC3AnalysisType.ENTITY_EXTRACTION,
      YYC3AnalysisType.SENTIMENT
    ],
    confidenceThreshold: 0.7,
    timeout: 10000,
    caching: false,
    models: []
  };
  
  // 合并用户配置和默认配置
  const mergedConfig = { ...defaultConfig, ...config };
  
  return new YYC3YuNLPAnalyzer(mergedConfig);
}