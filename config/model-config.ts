/**
 * 模型配置文件
 * 根据本地已安装的模型进行优化配置
 */

export const MODEL_CONFIG = {
  // 默认模型配置
  DEFAULT_MODELS: {
    chinese_primary: "qwen2:72b", // 主力中文模型
    chinese_secondary: "qwen2:latest", // 备用中文模型
    code_specialist: "codellama:latest", // 代码专用模型
    fast_response: "phi3:latest", // 快速响应模型
    multilingual: "mixtral:latest", // 多语言模型
    english_primary: "llama3:70b", // 英文主力模型
  },

  // 任务模型映射
  TASK_MODEL_MAPPING: {
    中文编程: "qwen2:72b",
    英文编程: "llama3:70b",
    代码生成: "codellama:latest",
    快速查询: "phi3:latest",
    复杂推理: "qwen2:72b",
    多语言: "mixtral:latest",
    日常对话: "qwen2:latest",
  },

  // 模型性能配置
  PERFORMANCE_CONFIG: {
    "qwen2:72b": {
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 4096,
      timeout: 60000,
    },
    "qwen2:latest": {
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 2048,
      timeout: 30000,
    },
    "codellama:latest": {
      temperature: 0.2,
      top_p: 0.8,
      max_tokens: 2048,
      timeout: 30000,
    },
    "phi3:latest": {
      temperature: 0.4,
      top_p: 0.9,
      max_tokens: 1024,
      timeout: 15000,
    },
  },

  // 环境变量建议
  ENV_SUGGESTIONS: {
    NEXT_PUBLIC_DEFAULT_MODEL: "qwen2:latest",
    NEXT_PUBLIC_CHINESE_MODEL: "qwen2:72b",
    NEXT_PUBLIC_CODE_MODEL: "codellama:latest",
    NEXT_PUBLIC_FAST_MODEL: "phi3:latest",
  },
}
