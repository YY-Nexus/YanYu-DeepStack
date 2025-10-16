// YYC3 Yan 层输入接口定义
import { YYC3InputType } from './index';

// 注意：YYC3YanInput接口已在index.ts中定义

export interface YYC3YanInputConfig {
  maxLength?: number;
  supportedTypes?: YYC3InputType[];
  validationRules?: Record<string, any>;
}