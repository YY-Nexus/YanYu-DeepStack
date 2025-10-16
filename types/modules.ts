// 模块类型定义
export type ModuleType =
  | "local-model-engine" // 模型引擎
  | "ai-code-generation" // AI代码生成
  | "app-development" // 应用开发
  | "real-time-preview" // 实时预览
  | "automation-production" // 自动化生产
  | "file-review" // 文件审查
  | "score-analysis" // 评分分析
  | "deployment-management" // 部署管理
  | "documentation" // 文档中心

// 模块配置接口
export interface ModuleConfig {
  id: ModuleType
  name: string
  description: string
  icon: string
  color: string
  path: string
}

// 模块配置数据
export const moduleConfigs: ModuleConfig[] = [
  {
    id: "documentation",
    name: "文档中心",
    description: "系统文档与实施指导",
    icon: "📚",
    color: "indigo-purple",
    path: "/docs",
  },
  {
    id: "local-model-engine",
    name: "模型引擎",
    description: "本地大模型全生命周期管理",
    icon: "🧠",
    color: "cloud-blue",
    path: "/model-engine",
  },
  {
    id: "ai-code-generation",
    name: "AI代码生成",
    description: "智能生成多语言代码",
    icon: "🤖",
    color: "coral-pink",
    path: "/ai-code",
  },
  {
    id: "app-development",
    name: "应用开发",
    description: "低代码可视化开发",
    icon: "🛠️",
    color: "mint-green",
    path: "/app-dev",
  },
  {
    id: "real-time-preview",
    name: "实时预览",
    description: "多格式内容预览",
    icon: "👁️",
    color: "sky-blue",
    path: "/preview",
  },
  {
    id: "automation-production",
    name: "自动化生产",
    description: "任务调度与部署",
    icon: "⚡",
    color: "lemon-yellow",
    path: "/automation",
  },
  {
    id: "file-review",
    name: "文件审查",
    description: "代码质量检测",
    icon: "🔍",
    color: "light-blue",
    path: "/review",
  },
  {
    id: "score-analysis",
    name: "评分分析",
    description: "质量评估与建议",
    icon: "📊",
    color: "coral-pink",
    path: "/analysis",
  },
  {
    id: "deployment-management",
    name: "部署管理",
    description: "多环境部署控制",
    icon: "🚀",
    color: "mint-green",
    path: "/deploy",
  },
]
