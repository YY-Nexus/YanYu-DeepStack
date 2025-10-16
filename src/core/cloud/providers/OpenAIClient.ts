import { YYC3Response } from '../../common/types';
import { YYC3CloudClient, YYC3CloudConfig, YYC3CloudProvider, YYC3CloudAuthentication, YYC3AuthType } from '../interfaces';

interface OpenAIMessage { role: 'user' | 'assistant' | 'system'; content: string; }

// 扩展YYC3CloudConfig接口以添加apiKey属性
export interface OpenAIClientConfig extends YYC3CloudConfig {
  apiKey: string;
  region?: string;
  endpoint?: string;
}

export class OpenAIClient implements YYC3CloudClient {
  public config: OpenAIClientConfig;
  private apiKey: string;
  public provider: YYC3CloudProvider = YYC3CloudProvider.CUSTOM;
  public region: string;
  public endpoint: string;
  public authentication: YYC3CloudAuthentication;

  constructor(config: OpenAIClientConfig) {
    this.config = config;
    this.apiKey = config.apiKey;
    this.region = config.region || 'us-west-1';
    this.endpoint = config.endpoint || 'https://api.openai.com';
    this.authentication = {
      type: YYC3AuthType.API_KEY,
      credentials: { apiKey: this.apiKey }
    };
  }

  async connect(): Promise<YYC3Response<boolean>> {
    // OpenAI API 是无状态的，连接检查可以是一个简单的API调用
    // 这里简化处理
    console.log('[OpenAIClient] Initialized with API key.');
    return { success: true, data: true };
  }

  async request(service: string, payload: any): Promise<YYC3Response<any>> {
    if (service === 'llm/generate') {
      return this.generateText(payload.messages || [{ role: 'user', content: payload.prompt }]);
    }
    return { success: false, error: `Unsupported service: ${service}` };
  }

  private async generateText(messages: OpenAIMessage[]): Promise<YYC3Response<string>> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // 可以从配置中读取
          messages: messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenAI API request failed');
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;
      return { success: true, data: generatedText.trim() };

    } catch (error: any) {
      console.error('[OpenAIClient] Error:', error);
      return { success: false, error: error.message };
    }
  }

  async disconnect(): Promise<void> {
    console.log('[OpenAIClient] No explicit disconnection needed.');
  }
}
