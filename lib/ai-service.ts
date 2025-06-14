"use client"

// AI服务类 - 处理代码补全、智能建议等功能
export class AIService {
  private static instance: AIService
  private apiKey = ""
  private baseUrl = "https://api.openai.com/v1"

  private constructor() {
    // 私有构造函数，实现单例模式
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  // 设置API配置
  public configure(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey
    if (baseUrl) {
      this.baseUrl = baseUrl
    }
  }

  // 代码补全功能
  public async getCodeCompletion(
    code: string,
    language: string,
    cursorPosition: number,
    context?: string,
  ): Promise<CodeCompletion[]> {
    try {
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 300))

      // 模拟代码补全结果
      const completions: CodeCompletion[] = [
        {
          id: "1",
          text: "console.log('Hello, World!');",
          description: "输出Hello World到控制台",
          confidence: 0.95,
          type: "statement",
          insertText: "console.log('Hello, World!');",
          range: {
            start: cursorPosition,
            end: cursorPosition,
          },
        },
        {
          id: "2",
          text: "const result = ",
          description: "声明常量变量",
          confidence: 0.88,
          type: "declaration",
          insertText: "const result = ",
          range: {
            start: cursorPosition,
            end: cursorPosition,
          },
        },
        {
          id: "3",
          text: "function handleClick() {\n  // TODO: 实现点击处理逻辑\n}",
          description: "创建点击事件处理函数",
          confidence: 0.82,
          type: "function",
          insertText: "function handleClick() {\n  // TODO: 实现点击处理逻辑\n}",
          range: {
            start: cursorPosition,
            end: cursorPosition,
          },
        },
      ]

      return completions
    } catch (error) {
      console.error("代码补全失败:", error)
      return []
    }
  }

  // 智能代码建议
  public async getCodeSuggestions(code: string, language: string, context?: string): Promise<CodeSuggestion[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const suggestions: CodeSuggestion[] = [
        {
          id: "suggestion_1",
          type: "optimization",
          title: "性能优化建议",
          description: "建议使用 useMemo 来优化计算密集型操作",
          severity: "info",
          line: 15,
          column: 10,
          fix: {
            description: "添加 useMemo 优化",
            code: "const memoizedValue = useMemo(() => expensiveCalculation(data), [data]);",
          },
          confidence: 0.85,
        },
        {
          id: "suggestion_2",
          type: "best-practice",
          title: "最佳实践建议",
          description: "建议为组件添加 PropTypes 或 TypeScript 类型定义",
          severity: "warning",
          line: 8,
          column: 1,
          fix: {
            description: "添加类型定义",
            code: "interface Props {\n  title: string;\n  onClick: () => void;\n}",
          },
          confidence: 0.92,
        },
        {
          id: "suggestion_3",
          type: "security",
          title: "安全性建议",
          description: "避免直接使用 dangerouslySetInnerHTML，考虑使用安全的替代方案",
          severity: "error",
          line: 22,
          column: 15,
          fix: {
            description: "使用安全的HTML渲染",
            code: "// 使用 DOMPurify 清理HTML内容\nconst cleanHTML = DOMPurify.sanitize(htmlContent);",
          },
          confidence: 0.98,
        },
      ]

      return suggestions
    } catch (error) {
      console.error("获取代码建议失败:", error)
      return []
    }
  }

  // 代码质量评估
  public async analyzeCodeQuality(code: string, language: string): Promise<CodeQualityReport> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const report: CodeQualityReport = {
        overallScore: 8.5,
        metrics: {
          complexity: {
            score: 7.8,
            description: "代码复杂度适中",
            details: "平均圈复杂度: 3.2，建议保持在5以下",
          },
          maintainability: {
            score: 9.1,
            description: "代码可维护性良好",
            details: "函数长度适中，命名清晰，注释完整",
          },
          readability: {
            score: 8.7,
            description: "代码可读性较好",
            details: "代码格式规范，逻辑清晰",
          },
          testability: {
            score: 7.9,
            description: "代码可测试性良好",
            details: "函数职责单一，依赖注入清晰",
          },
          security: {
            score: 9.3,
            description: "安全性评分优秀",
            details: "未发现明显安全漏洞",
          },
        },
        issues: [
          {
            type: "warning",
            message: "函数 calculateTotal 的复杂度较高，建议拆分",
            line: 45,
            severity: "medium",
          },
          {
            type: "info",
            message: "建议为异步函数添加错误处理",
            line: 67,
            severity: "low",
          },
        ],
        suggestions: [
          "考虑使用 TypeScript 提高代码类型安全性",
          "添加单元测试覆盖关键业务逻辑",
          "使用 ESLint 和 Prettier 统一代码风格",
        ],
      }

      return report
    } catch (error) {
      console.error("代码质量分析失败:", error)
      throw error
    }
  }

  // 自然语言转代码
  public async generateCodeFromNaturalLanguage(
    description: string,
    language: string,
    context?: string,
  ): Promise<GeneratedCode> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))

      // 模拟根据自然语言描述生成代码
      const generatedCode: GeneratedCode = {
        code: `// 根据描述生成的代码: ${description}
function processUserData(userData) {
  // 验证用户数据
  if (!userData || typeof userData !== 'object') {
    throw new Error('无效的用户数据');
  }

  // 处理用户数据
  const processedData = {
    id: userData.id || generateId(),
    name: userData.name?.trim() || '',
    email: userData.email?.toLowerCase() || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 验证必填字段
  if (!processedData.name || !processedData.email) {
    throw new Error('姓名和邮箱为必填字段');
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(processedData.email)) {
    throw new Error('邮箱格式不正确');
  }

  return processedData;
}

// 生成唯一ID的辅助函数
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}`,
        explanation:
          "这段代码实现了用户数据处理功能，包括数据验证、格式化和错误处理。主要功能包括：1. 验证输入数据的有效性 2. 处理和格式化用户数据 3. 验证必填字段 4. 验证邮箱格式 5. 生成唯一ID",
        confidence: 0.89,
        language: language,
        suggestions: [
          "可以考虑使用 Joi 或 Yup 等库进行更复杂的数据验证",
          "建议添加单元测试来验证各种边界情况",
          "可以将验证逻辑提取到单独的模块中以提高复用性",
        ],
      }

      return generatedCode
    } catch (error) {
      console.error("自然语言转代码失败:", error)
      throw error
    }
  }

  // 智能错误检测和修复
  public async detectAndFixErrors(code: string, language: string, errors?: string[]): Promise<ErrorFix[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))

      const fixes: ErrorFix[] = [
        {
          id: "fix_1",
          error: {
            message: "未定义的变量 'userName'",
            line: 12,
            column: 15,
            type: "ReferenceError",
          },
          fix: {
            description: "声明变量 userName",
            code: "const userName = '';",
            line: 11,
            type: "insert",
          },
          confidence: 0.95,
        },
        {
          id: "fix_2",
          error: {
            message: "缺少分号",
            line: 18,
            column: 25,
            type: "SyntaxError",
          },
          fix: {
            description: "添加分号",
            code: "const result = calculateSum(a, b);",
            line: 18,
            type: "replace",
          },
          confidence: 0.99,
        },
        {
          id: "fix_3",
          error: {
            message: "异步函数缺少 await 关键字",
            line: 25,
            column: 10,
            type: "TypeError",
          },
          fix: {
            description: "添加 await 关键字",
            code: "const data = await fetchUserData();",
            line: 25,
            type: "replace",
          },
          confidence: 0.92,
        },
      ]

      return fixes
    } catch (error) {
      console.error("错误检测和修复失败:", error)
      return []
    }
  }
}

// 类型定义
export interface CodeCompletion {
  id: string
  text: string
  description: string
  confidence: number
  type: "statement" | "declaration" | "function" | "class" | "import"
  insertText: string
  range: {
    start: number
    end: number
  }
}

export interface CodeSuggestion {
  id: string
  type: "optimization" | "best-practice" | "security" | "performance" | "style"
  title: string
  description: string
  severity: "info" | "warning" | "error"
  line: number
  column: number
  fix?: {
    description: string
    code: string
  }
  confidence: number
}

export interface CodeQualityReport {
  overallScore: number
  metrics: {
    complexity: QualityMetric
    maintainability: QualityMetric
    readability: QualityMetric
    testability: QualityMetric
    security: QualityMetric
  }
  issues: QualityIssue[]
  suggestions: string[]
}

export interface QualityMetric {
  score: number
  description: string
  details: string
}

export interface QualityIssue {
  type: "error" | "warning" | "info"
  message: string
  line: number
  severity: "high" | "medium" | "low"
}

export interface GeneratedCode {
  code: string
  explanation: string
  confidence: number
  language: string
  suggestions: string[]
}

export interface ErrorFix {
  id: string
  error: {
    message: string
    line: number
    column: number
    type: string
  }
  fix: {
    description: string
    code: string
    line: number
    type: "insert" | "replace" | "delete"
  }
  confidence: number
}

// 导出AI服务实例
export const aiService = AIService.getInstance()
