// TextProcessor 文本处理器实现
import { 
  YYC3YanBase, 
  YYC3YanInput, 
  YYC3YanOutput, 
  YYC3InputType, 
  YYC3ValidationResult, 
  YYC3YanError, 
  YYC3YanErrorCode,
  YYC3YanConfig
} from '../interfaces';

/**
 * 文本处理器实现
 * 负责处理文本类型的输入数据，提供标准化的文本预处理功能
 */
export class YYC3YanTextProcessor extends YYC3YanBase {
  /**
   * 构造函数
   * @param config 文本处理器配置
   */
  constructor(config: YYC3YanConfig) {
    super(config);
    console.log('YYC3YanTextProcessor initialized');
  }

  /**
   * 处理文本输入
   * @param input 输入数据
   * @returns 处理后的输出结果
   */
  public async processInput(input: YYC3YanInput): Promise<YYC3YanOutput> {
    const startTime = Date.now();
    
    // 验证输入
    const validationResult = this.validateInput(input);
    if (!validationResult.valid) {
      return this.formatOutput(
        null,
        input,
        Date.now() - startTime,
        false,
        validationResult.errors
      );
    }

    try {
      // 确保输入内容是字符串
      if (typeof input.content !== 'string') {
        throw this.createError(
          YYC3YanErrorCode.FORMAT_UNSUPPORTED,
          'Content must be a string for text processing'
        );
      }

      // 处理文本内容
      let processedContent = input.content;
      
      // 应用配置中的处理规则
      if (this.config.preprocessing?.normalization !== false) {
        processedContent = this.normalizeText(processedContent);
      }
      
      if (this.config.preprocessing?.noiseReduction !== false) {
        processedContent = this.reduceNoise(processedContent);
      }
      
      // 记录处理时间
      const processingTime = Date.now() - startTime;
      
      return this.formatOutput(
        processedContent,
        input,
        processingTime
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorObj = error instanceof YYC3YanError 
        ? error 
        : this.createError(
            YYC3YanErrorCode.PROCESSING_FAILED,
            error instanceof Error ? error.message : 'Unknown processing error'
          );
      
      return this.formatOutput(
        null,
        input,
        processingTime,
        false,
        [errorObj]
      );
    }
  }

  /**
   * 验证输入数据
   * @param input 输入数据
   * @returns 验证结果
   */
  public validateInput(input: YYC3YanInput): YYC3ValidationResult {
    const errors: YYC3YanError[] = [];
    
    // 验证输入类型
    if (!this.config.enabledInputTypes.includes(YYC3InputType.TEXT)) {
      errors.push(
        this.createError(
          YYC3YanErrorCode.INPUT_INVALID,
          'TEXT input type is not enabled'
        )
      );
    }
    
    // 验证内容
    if (!input.content) {
      errors.push(
        this.createError(
          YYC3YanErrorCode.INPUT_INVALID,
          'Input content cannot be empty'
        )
      );
    } else if (typeof input.content !== 'string') {
      errors.push(
        this.createError(
          YYC3YanErrorCode.FORMAT_UNSUPPORTED,
          'Content must be a string'
        )
      );
    } else if (input.content.length > 0) {
      // 验证长度
      const maxLength = this.config.preprocessing?.maxLength || 1000000; // 默认1MB
      if (input.content.length > maxLength) {
        errors.push(
          this.createError(
            YYC3YanErrorCode.INPUT_INVALID,
            `Input exceeds maximum length of ${maxLength} characters`
          )
        );
      }
    }
    
    // 验证元数据
    if (input.metadata?.language && !['zh', 'en', 'ja', 'ko'].includes(input.metadata.language)) {
      errors.push(
        this.createError(
          YYC3YanErrorCode.FORMAT_UNSUPPORTED,
          `Language ${input.metadata.language} is not supported`
        )
      );
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 规范化文本
   * @param text 输入文本
   * @returns 规范化后的文本
   */
  private normalizeText(text: string): string {
    let normalizedText = text;
    
    // 去除多余空格
    normalizedText = normalizedText.replace(/\s+/g, ' ').trim();
    
    // 处理特殊字符
    normalizedText = normalizedText
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // 零宽字符
      .replace(/[\n\r\t]/g, ' '); // 控制字符
    
    return normalizedText;
  }

  /**
   * 降低文本噪声
   * @param text 输入文本
   * @returns 去噪后的文本
   */
  private reduceNoise(text: string): string {
    // 简单的噪声降低实现
    // 实际应用中可以集成更复杂的文本清洗算法
    return text
      .replace(/http\S+/g, '[URL]') // 替换URL
      .replace(/@\w+/g, '[MENTION]') // 替换@提及
      .replace(/#\w+/g, '[HASHTAG]') // 替换#标签
      .replace(/[^\p{L}\p{N}\s.,!?;:]/gu, ''); // 保留字母、数字和基本标点符号
  }
}