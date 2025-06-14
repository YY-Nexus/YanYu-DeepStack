"use client"

import { autoProgrammingAssistant } from "./auto-programming-assistant"

// 智能测试生成器 - 自动生成单元测试、集成测试和端到端测试
export class IntelligentTestGenerator {
  private static instance: IntelligentTestGenerator
  private supportedTestTypes: TestType[]
  private testingStrategies: Record<TestType, string[]>
  private mockingLibraries: Record<string, string[]>

  private constructor() {
    // 支持的测试类型
    this.supportedTestTypes = ["unit", "integration", "e2e", "performance", "security"]

    // 测试策略
    this.testingStrategies = {
      unit: ["函数测试", "类测试", "模块测试", "边界值测试", "异常测试"],
      integration: ["组件集成测试", "API集成测试", "数据库集成测试", "服务集成测试"],
      e2e: ["用户流程测试", "场景测试", "回归测试"],
      performance: ["负载测试", "压力测试", "耐久测试", "基准测试"],
      security: ["渗透测试", "漏洞扫描", "安全合规测试"],
    }

    // 模拟库
    this.mockingLibraries = {
      javascript: ["jest.mock", "sinon", "nock", "mock-service-worker"],
      typescript: ["jest.mock", "sinon", "nock", "mock-service-worker", "ts-mockito"],
      python: ["unittest.mock", "pytest-mock", "responses", "moto"],
      java: ["mockito", "easymock", "powermock", "wiremock"],
      "c#": ["moq", "nsubstitute", "fakeiteasy", "rhino mocks"],
      go: ["gomock", "httptest", "testify/mock"],
      rust: ["mockall", "wiremock-rs"],
      php: ["phpunit mocks", "mockery", "prophecy"],
      ruby: ["rspec-mocks", "mocha", "webmock"],
      swift: ["swift-mock", "mockingbird"],
      kotlin: ["mockk", "mockito-kotlin"],
      dart: ["mockito", "mocktail"],
    }
  }

  public static getInstance(): IntelligentTestGenerator {
    if (!IntelligentTestGenerator.instance) {
      IntelligentTestGenerator.instance = new IntelligentTestGenerator()
    }
    return IntelligentTestGenerator.instance
  }

  // 获取支持的测试类型
  public getSupportedTestTypes(): TestType[] {
    return this.supportedTestTypes
  }

  // 获取特定测试类型的策略
  public getTestingStrategies(testType: TestType): string[] {
    return this.testingStrategies[testType] || []
  }

  // 获取特定语言的模拟库
  public getMockingLibraries(language: string): string[] {
    return this.mockingLibraries[language] || []
  }

  // 生成单元测试
  public async generateUnitTests(
    codeSnippet: string,
    language: string,
    options: UnitTestOptions = {},
  ): Promise<TestGenerationResult> {
    try {
      // 设置默认选项
      const defaultOptions: UnitTestOptions = {
        testFramework: this.getDefaultTestFramework(language),
        mockLibrary: this.getDefaultMockLibrary(language),
        coverageTarget: 80,
        includeEdgeCases: true,
        includeNegativeTests: true,
      }

      const mergedOptions = { ...defaultOptions, ...options }

      // 构建增强提示词
      let enhancedPrompt = `为以下${language}代码生成详细的单元测试:\n\n${codeSnippet}\n\n`
      enhancedPrompt += `使用${mergedOptions.testFramework}测试框架`

      if (mergedOptions.mockLibrary) {
        enhancedPrompt += `和${mergedOptions.mockLibrary}模拟库`
      }

      enhancedPrompt += `。目标测试覆盖率为${mergedOptions.coverageTarget}%。`

      if (mergedOptions.includeEdgeCases) {
        enhancedPrompt += "包含边界条件和极端情况测试。"
      }

      if (mergedOptions.includeNegativeTests) {
        enhancedPrompt += "包含异常情况和错误处理测试。"
      }

      // 调用自动编程助手生成测试
      return await autoProgrammingAssistant.generateTests(codeSnippet, language, {
        testFramework: mergedOptions.testFramework,
        coverageTarget: mergedOptions.coverageTarget,
      })
    } catch (error) {
      throw error
    }
  }

  // 生成集成测试
  public async generateIntegrationTests(
    components: ComponentDefinition[],
    language: string,
    options: IntegrationTestOptions = {},
  ): Promise<TestGenerationResult> {
    try {
      // 设置默认选项
      const defaultOptions: IntegrationTestOptions = {
        testFramework: this.getDefaultTestFramework(language),
        mockExternalDependencies: true,
        testEnvironment: "node",
        includeSetupTeardown: true,
      }

      const mergedOptions = { ...defaultOptions, ...options }

      // 构建组件代码和关系描述
      let componentsCode = ""
      let relationshipDescription = "组件间关系:\n"

      components.forEach((component, index) => {
        componentsCode += `// 组件 ${index + 1}: ${component.name}\n`
        componentsCode += `${component.code}\n\n`

        if (component.dependencies && component.dependencies.length > 0) {
          relationshipDescription += `- ${component.name} 依赖于: ${component.dependencies.join(", ")}\n`
        }
      })

      // 构建增强提示词
      let enhancedPrompt = `为以下${language}组件生成集成测试:\n\n${componentsCode}\n\n`
      enhancedPrompt += `${relationshipDescription}\n\n`
      enhancedPrompt += `使用${mergedOptions.testFramework}测试框架，测试环境为${mergedOptions.testEnvironment}。`

      if (mergedOptions.mockExternalDependencies) {
        enhancedPrompt += "模拟外部依赖，但保留组件间的真实交互。"
      }

      if (mergedOptions.includeSetupTeardown) {
        enhancedPrompt += "包含完整的测试前准备和测试后清理代码。"
      }

      // 调用自动编程助手生成测试
      return await autoProgrammingAssistant.generateTests(enhancedPrompt, language, {
        testFramework: mergedOptions.testFramework,
        coverageTarget: 70, // 集成测试通常覆盖率目标较低
      })
    } catch (error) {
      throw error
    }
  }

  // 生成端到端测试
  public async generateE2ETests(
    userFlows: UserFlow[],
    framework: string,
    options: E2ETestOptions = {},
  ): Promise<TestGenerationResult> {
    try {
      // 确定语言
      let language = "javascript" // 默认
      if (["react", "vue", "angular", "next.js"].includes(framework)) {
        language = "javascript"
      } else if (["django", "flask", "fastapi"].includes(framework)) {
        language = "python"
      } else if (["spring", "hibernate"].includes(framework)) {
        language = "java"
      }

      // 设置默认选项
      const defaultOptions: E2ETestOptions = {
        testFramework: this.getDefaultE2EFramework(framework),
        browser: "chrome",
        includeScreenshots: true,
        includeVideos: false,
        retryFailedTests: true,
      }

      const mergedOptions = { ...defaultOptions, ...options }

      // 构建用户流程描述
      let userFlowsDescription = "用户流程:\n"
      userFlows.forEach((flow, index) => {
        userFlowsDescription += `\n流程 ${index + 1}: ${flow.name}\n`
        userFlowsDescription += `描述: ${flow.description}\n`
        userFlowsDescription += "步骤:\n"

        flow.steps.forEach((step, stepIndex) => {
          userFlowsDescription += `${stepIndex + 1}. ${step}\n`
        })

        if (flow.expectedOutcome) {
          userFlowsDescription += `预期结果: ${flow.expectedOutcome}\n`
        }
      })

      // 构建增强提示词
      let enhancedPrompt = `为${framework}应用生成端到端测试:\n\n${userFlowsDescription}\n\n`
      enhancedPrompt += `使用${mergedOptions.testFramework}测试框架，在${mergedOptions.browser}浏览器中运行。`

      if (mergedOptions.includeScreenshots) {
        enhancedPrompt += "在关键步骤捕获屏幕截图。"
      }

      if (mergedOptions.includeVideos) {
        enhancedPrompt += "记录测试执行视频。"
      }

      if (mergedOptions.retryFailedTests) {
        enhancedPrompt += "配置失败测试自动重试。"
      }

      // 调用自动编程助手生成测试
      return await autoProgrammingAssistant.generateTests(enhancedPrompt, language, {
        testFramework: mergedOptions.testFramework,
        coverageTarget: 60, // 端到端测试通常覆盖率目标更低
      })
    } catch (error) {
      throw error
    }
  }

  // 生成性能测试
  public async generatePerformanceTests(
    apiEndpoints: ApiEndpoint[],
    language: string,
    options: PerformanceTestOptions = {},
  ): Promise<TestGenerationResult> {
    try {
      // 设置默认选项
      const defaultOptions: PerformanceTestOptions = {
        testFramework: this.getDefaultPerformanceFramework(language),
        concurrentUsers: 100,
        rampUpPeriod: 30,
        testDuration: 300,
        thresholds: {
          responseTime: 500, // ms
          errorRate: 1, // %
          throughput: 50, // rps
        },
      }

      const mergedOptions = { ...defaultOptions, ...options }

      // 构建API端点描述
      let endpointsDescription = "API端点:\n"
      apiEndpoints.forEach((endpoint, index) => {
        endpointsDescription += `\n端点 ${index + 1}: ${endpoint.method} ${endpoint.path}\n`
        endpointsDescription += `描述: ${endpoint.description || "无"}\n`

        if (endpoint.requestBody) {
          endpointsDescription += `请求体示例: ${JSON.stringify(endpoint.requestBody, null, 2)}\n`
        }

        if (endpoint.expectedResponse) {
          endpointsDescription += `预期响应: ${JSON.stringify(endpoint.expectedResponse, null, 2)}\n`
        }
      })

      // 构建增强提示词
      let enhancedPrompt = `为以下API端点生成性能测试:\n\n${endpointsDescription}\n\n`
      enhancedPrompt += `使用${mergedOptions.testFramework}测试框架。`
      enhancedPrompt += `模拟${mergedOptions.concurrentUsers}个并发用户，`
      enhancedPrompt += `${mergedOptions.rampUpPeriod}秒内逐步增加负载，`
      enhancedPrompt += `持续测试${mergedOptions.testDuration}秒。`
      enhancedPrompt += `\n性能指标阈值:\n`
      enhancedPrompt += `- 响应时间: ${mergedOptions.thresholds.responseTime}ms\n`
      enhancedPrompt += `- 错误率: ${mergedOptions.thresholds.errorRate}%\n`
      enhancedPrompt += `- 吞吐量: ${mergedOptions.thresholds.throughput}请求/秒\n`

      // 调用自动编程助手生成测试
      return await autoProgrammingAssistant.generateTests(enhancedPrompt, language, {
        testFramework: mergedOptions.testFramework,
        coverageTarget: 50, // 性能测试通常不关注代码覆盖率
      })
    } catch (error) {
      throw error
    }
  }

  // 生成安全测试
  public async generateSecurityTests(
    vulnerabilityTypes: string[],
    codeOrEndpoints: string | ApiEndpoint[],
    language: string,
    options: SecurityTestOptions = {},
  ): Promise<TestGenerationResult> {
    try {
      // 设置默认选项
      const defaultOptions: SecurityTestOptions = {
        testFramework: this.getDefaultSecurityFramework(language),
        includeRemediation: true,
        severity: "high",
        complianceStandards: ["OWASP Top 10"],
      }

      const mergedOptions = { ...defaultOptions, ...options }

      // 构建漏洞类型描述
      let vulnerabilitiesDescription = "安全测试目标漏洞类型:\n"
      vulnerabilityTypes.forEach((type, index) => {
        vulnerabilitiesDescription += `${index + 1}. ${type}\n`
      })

      // 构建代码或端点描述
      let targetDescription = ""
      if (typeof codeOrEndpoints === "string") {
        targetDescription = `目标代码:\n\n${codeOrEndpoints}\n\n`
      } else {
        targetDescription = "目标API端点:\n"
        codeOrEndpoints.forEach((endpoint, index) => {
          targetDescription += `\n端点 ${index + 1}: ${endpoint.method} ${endpoint.path}\n`
          targetDescription += `描述: ${endpoint.description || "无"}\n`

          if (endpoint.requestBody) {
            targetDescription += `请求体示例: ${JSON.stringify(endpoint.requestBody, null, 2)}\n`
          }
        })
      }

      // 构建增强提示词
      let enhancedPrompt = `生成安全测试以检测以下漏洞:\n\n${vulnerabilitiesDescription}\n\n`
      enhancedPrompt += `${targetDescription}\n`
      enhancedPrompt += `使用${mergedOptions.testFramework}测试框架，`
      enhancedPrompt += `专注于${mergedOptions.severity}级别的安全问题。`

      if (mergedOptions.complianceStandards && mergedOptions.complianceStandards.length > 0) {
        enhancedPrompt += `遵循以下合规标准: ${mergedOptions.complianceStandards.join(", ")}。`
      }

      if (mergedOptions.includeRemediation) {
        enhancedPrompt += "对于发现的每个漏洞，提供修复建议。"
      }

      // 调用自动编程助手生成测试
      return await autoProgrammingAssistant.generateTests(enhancedPrompt, language, {
        testFramework: mergedOptions.testFramework,
        coverageTarget: 90, // 安全测试通常需要高覆盖率
      })
    } catch (error) {
      throw error
    }
  }

  // 获取默认测试框架
  private getDefaultTestFramework(language: string): string {
    const frameworks = {
      javascript: "jest",
      typescript: "jest",
      python: "pytest",
      java: "junit",
      "c#": "xunit",
      go: "testing",
      rust: "cargo test",
      php: "phpunit",
      ruby: "rspec",
      swift: "xctest",
      kotlin: "junit",
      dart: "flutter test",
    }

    return frameworks[language as keyof typeof frameworks] || "默认测试框架"
  }

  // 获取默认模拟库
  private getDefaultMockLibrary(language: string): string {
    const libraries = {
      javascript: "jest.mock",
      typescript: "jest.mock",
      python: "unittest.mock",
      java: "mockito",
      "c#": "moq",
      go: "gomock",
      rust: "mockall",
      php: "phpunit mocks",
      ruby: "rspec-mocks",
      swift: "swift-mock",
      kotlin: "mockk",
      dart: "mockito",
    }

    return libraries[language as keyof typeof libraries] || ""
  }

  // 获取默认端到端测试框架
  private getDefaultE2EFramework(framework: string): string {
    const frameworks = {
      react: "cypress",
      vue: "cypress",
      angular: "protractor",
      "next.js": "playwright",
      django: "selenium",
      flask: "selenium",
      spring: "selenium",
      android: "espresso",
      ios: "xctest ui",
    }

    return frameworks[framework as keyof typeof frameworks] || "cypress"
  }

  // 获取默认性能测试框架
  private getDefaultPerformanceFramework(language: string): string {
    const frameworks = {
      javascript: "k6",
      typescript: "k6",
      python: "locust",
      java: "jmeter",
      "c#": "nbomber",
      go: "vegeta",
      rust: "drill",
      php: "jmeter",
      ruby: "artillery",
    }

    return frameworks[language as keyof typeof frameworks] || "jmeter"
  }

  // 获取默认安全测试框架
  private getDefaultSecurityFramework(language: string): string {
    const frameworks = {
      javascript: "owasp zap",
      typescript: "owasp zap",
      python: "bandit",
      java: "spotbugs",
      "c#": "security code scan",
      go: "gosec",
      rust: "cargo audit",
      php: "phpcs-security-audit",
      ruby: "brakeman",
    }

    return frameworks[language as keyof typeof frameworks] || "owasp zap"
  }
}

// 类型定义
export type TestType = "unit" | "integration" | "e2e" | "performance" | "security"

export interface ComponentDefinition {
  name: string
  code: string
  dependencies?: string[]
}

export interface UserFlow {
  name: string
  description: string
  steps: string[]
  expectedOutcome?: string
}

export interface ApiEndpoint {
  method: string
  path: string
  description?: string
  requestBody?: any
  expectedResponse?: any
}

export interface UnitTestOptions {
  testFramework?: string
  mockLibrary?: string
  coverageTarget?: number
  includeEdgeCases?: boolean
  includeNegativeTests?: boolean
}

export interface IntegrationTestOptions {
  testFramework?: string
  mockExternalDependencies?: boolean
  testEnvironment?: "node" | "jsdom" | "python" | "jvm"
  includeSetupTeardown?: boolean
}

export interface E2ETestOptions {
  testFramework?: string
  browser?: "chrome" | "firefox" | "safari" | "edge" | "all"
  includeScreenshots?: boolean
  includeVideos?: boolean
  retryFailedTests?: boolean
}

export interface PerformanceTestOptions {
  testFramework?: string
  concurrentUsers?: number
  rampUpPeriod?: number // 秒
  testDuration?: number // 秒
  thresholds?: {
    responseTime?: number // 毫秒
    errorRate?: number // 百分比
    throughput?: number // 每秒请求数
  }
}

export interface SecurityTestOptions {
  testFramework?: string
  includeRemediation?: boolean
  severity?: "low" | "medium" | "high" | "critical"
  complianceStandards?: string[]
}

export interface TestGenerationResult {
  sourceCode: string
  testCode: string
  language: string
  testFramework: string
  coverageEstimate: number
  explanation: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// 导出单例实例
export const intelligentTestGenerator = IntelligentTestGenerator.getInstance()
