// YYC3YanTextProcessorModule 文本处理模块实现
import { YYC3Module } from '../../cube/interfaces/YYC3CubeManager';
import { YYC3YanTextProcessor } from '../implementations/TextProcessor';
import { YYC3YanInput, YYC3InputType } from '../interfaces/index';

export class YYC3YanTextProcessorModule implements YYC3Module {
  id = 'yan-text-processor';
  name = 'Text Processor Module';
  version = '1.0.0';
  type = 'text-processing';
  description = '处理各种类型的文本输入，提供文本清洗、格式化和分析功能';
  
  private textProcessor: YYC3YanTextProcessor;
  private initialized = false;

  constructor() {
    this.textProcessor = new YYC3YanTextProcessor({ 
      timeout: 5000, 
      retryAttempts: 3, 
      enabledInputTypes: [YYC3InputType.TEXT] 
    });
  }

  async initialize(config: Record<string, any>): Promise<void> {
    try {
      if (this.initialized) {
        console.warn('TextProcessorModule already initialized');
        return;
      }

      // 确保配置对象包含所有必需的 YYC3YanConfig 属性
      const processorConfig = {
        timeout: config.timeout || 5000,
        retryAttempts: config.retryAttempts || 3,
        enabledInputTypes: config.enabledInputTypes || [YYC3InputType.TEXT],
        bufferSize: config.bufferSize,
        preprocessing: config.preprocessing
      };
      this.textProcessor = new YYC3YanTextProcessor(processorConfig);
      this.initialized = true;
      
      console.log(`TextProcessorModule initialized with config:`, config);
    } catch (error) {
      console.error('Failed to initialize TextProcessorModule:', error);
      throw error;
    }
  }

  async execute(...args: any[]): Promise<any> {
    try {
      if (!this.initialized) {
        await this.initialize({});
      }

      // 支持多种输入格式
      let input: YYC3YanInput;
      
      if (args.length === 1 && typeof args[0] === 'object') {
        // 如果传入的是对象，尝试将其转换为YYC3YanInput格式
        const data = args[0];
        
        if (data.type && data.content) {
          // 已经是YYC3YanInput格式
          input = {
            type: data.type,
            content: data.content,
            metadata: data.metadata,
            timestamp: data.timestamp || new Date(),
            sourceId: data.sourceId || `text-input-${Date.now()}`
          };
        } else if (data.text || data.content) {
          // 简化的文本输入格式
          input = {
            type: YYC3InputType.TEXT,
            content: data.text || data.content,
            metadata: data.metadata,
            timestamp: new Date(),
            sourceId: `text-input-${Date.now()}`
          };
        } else {
          throw new Error('Invalid input format: Missing required fields');
        }
      } else if (args.length === 1 && typeof args[0] === 'string') {
        // 直接传入字符串
        input = {
            type: YYC3InputType.TEXT,
            content: args[0],
            timestamp: new Date(),
            sourceId: `text-input-${Date.now()}`
          };
      } else {
        throw new Error('Invalid input format: Expected string or object');
      }

      // 使用TextProcessor处理输入
      const result = await this.textProcessor.processInput(input);
      
      console.log(`TextProcessorModule executed successfully`);
      return result;
    } catch (error) {
      console.error('Failed to execute TextProcessorModule:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      // 清理资源
      this.initialized = false;
      console.log('TextProcessorModule shutdown');
    } catch (error) {
      console.error('Error during TextProcessorModule shutdown:', error);
    }
  }

  getStatus(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      initialized: this.initialized,
      type: this.type,
      description: this.description,
      supportedTypes: [YYC3InputType.TEXT]
    };
  }

  // 提供额外的便捷方法
  async processText(text: string, options: Record<string, any> = {}): Promise<string> {
    const input: YYC3YanInput = {
      type: YYC3InputType.TEXT,
      content: text,
      metadata: options,
      timestamp: new Date(),
      sourceId: `text-input-${Date.now()}`
    };

    const output = await this.textProcessor.processInput(input);
    return output.processedContent as string;
  }

  // 批量处理文本
  async batchProcessText(texts: string[], options: Record<string, any> = {}): Promise<string[]> {
    const promises = texts.map(text => this.processText(text, options));
    return Promise.all(promises);
  }
}