// types/llm.ts
import type { ReactNode } from 'react';

// 模型状态枚举值
export type ModelStatusKey = "RUNNING" | "STOPPED" | "STARTING" | "STOPPING" | "UPDATING";

// 模型状态的详细信息（用于UI展示）
export interface ModelStatusInfo {
  text: string;
  color: string;
  icon: ReactNode;
}

// 模型核心结构
export interface Model {
  id: string;
  name: string;
  version: string;
  status: ModelStatusKey;      // 关联状态枚举
  startTime?: string;          // 启动时间（仅RUNNING状态有效）
  qps?: number;                // 每秒查询数（仅RUNNING状态有效）
  params: {                    // 模型参数
    learningRate: number;      // 学习率
    batchSize: number;         // 批大小
    maxSeqLength: number;      // 最大序列长度
    temperature: number;       // 温度系数
  };
  needsUpdate?: boolean;       // 是否需要更新
}