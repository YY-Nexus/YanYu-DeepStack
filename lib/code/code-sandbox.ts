/**
 * 代码沙箱 - 用于安全执行用户代码
 * 提供隔离的执行环境，防止恶意代码执行
 */

// 支持的语言类型
export type SupportedLanguage = "javascript" | "typescript" | "python" | "html" | "css" | "json" | "markdown"

// 执行结果接口
export interface ExecutionResult {
  success: boolean
  output: string[]
  error?: string
  duration: number
}

// 执行选项接口
export interface ExecutionOptions {
  timeout?: number // 超时时间（毫秒）
  memoryLimit?: number // 内存限制（MB）
  allowNetwork?: boolean // 是否允许网络请求
  environment?: Record<string, string> // 环境变量
}

// 默认执行选项
const DEFAULT_OPTIONS: ExecutionOptions = {
  timeout: 5000, // 默认5秒超时
  memoryLimit: 100, // 默认100MB内存限制
  allowNetwork: false, // 默认不允许网络请求
  environment: {}, // 默认无环境变量
}

/**
 * 代码沙箱类
 * 提供安全的代码执行环境
 */
export class CodeSandbox {
  private static instance: CodeSandbox

  /**
   * 获取单例实例
   */
  public static getInstance(): CodeSandbox {
    if (!CodeSandbox.instance) {
      CodeSandbox.instance = new CodeSandbox()
    }
    return CodeSandbox.instance
  }

  /**
   * 执行JavaScript/TypeScript代码
   * @param code 要执行的代码
   * @param options 执行选项
   * @returns 执行结果
   */
  public async executeJavaScript(code: string, options: ExecutionOptions = {}): Promise<ExecutionResult> {
    const startTime = performance.now()
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
    const logs: string[] = []
    let error: string | undefined

    try {
      // 创建安全的执行环境
      const originalConsoleLog = console.log
      const originalConsoleError = console.error
      const originalConsoleWarn = console.warn
      const originalConsoleInfo = console.info

      // 重写控制台方法
      console.log = (...args) => {
        logs.push(args.map((arg) => this.formatOutput(arg)).join(" "))
      }
      console.error = (...args) => {
        logs.push(`[错误] ${args.map((arg) => this.formatOutput(arg)).join(" ")}`)
      }
      console.warn = (...args) => {
        logs.push(`[警告] ${args.map((arg) => this.formatOutput(arg)).join(" ")}`)
      }
      console.info = (...args) => {
        logs.push(`[信息] ${args.map((arg) => this.formatOutput(arg)).join(" ")}`)
      }

      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`执行超时（${mergedOptions.timeout}ms）`))
        }, mergedOptions.timeout)
      })

      // 执行代码
      const executionPromise = new Promise<void>(async (resolve) => {
        try {
          // 创建安全的执行环境
          const safeCode = this.createSafeExecutionEnvironment(code, mergedOptions)

          // 使用Function构造函数创建可执行的函数
          // 注意：这在生产环境中存在安全风险，应该使用更安全的沙箱
          // eslint-disable-next-line no-new-func
          const executeFunction = new Function(safeCode)
          await executeFunction()

          resolve()
        } catch (e) {
          error = e instanceof Error ? e.message : String(e)
          resolve()
        }
      })

      // 竞争执行和超时
      await Promise.race([executionPromise, timeoutPromise])

      // 恢复原始控制台方法
      console.log = originalConsoleLog
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      console.info = originalConsoleInfo

      const endTime = performance.now()

      return {
        success: !error,
        output: logs,
        error,
        duration: endTime - startTime,
      }
    } catch (e) {
      const endTime = performance.now()

      return {
        success: false,
        output: logs,
        error: e instanceof Error ? e.message : String(e),
        duration: endTime - startTime,
      }
    }
  }

  /**
   * 执行HTML代码
   * @param html HTML代码
   * @param options 执行选项
   * @returns 执行结果
   */
  public async executeHTML(html: string, options: ExecutionOptions = {}): Promise<ExecutionResult> {
    const startTime = performance.now()
    const logs: string[] = []

    try {
      // 在这里，我们只是返回HTML，实际执行会在前端的iframe中进行
      const endTime = performance.now()

      return {
        success: true,
        output: [html],
        duration: endTime - startTime,
      }
    } catch (e) {
      const endTime = performance.now()

      return {
        success: false,
        output: logs,
        error: e instanceof Error ? e.message : String(e),
        duration: endTime - startTime,
      }
    }
  }

  /**
   * 格式化输出
   * @param value 要格式化的值
   * @returns 格式化后的字符串
   */
  private formatOutput(value: any): string {
    if (value === undefined) return "undefined"
    if (value === null) return "null"

    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2)
      } catch {
        return String(value)
      }
    }

    return String(value)
  }

  /**
   * 创建安全的执行环境
   * @param code 要执行的代码
   * @param options 执行选项
   * @returns 安全的代码
   */
  private createSafeExecutionEnvironment(code: string, options: ExecutionOptions): string {
    // 禁止访问敏感API
    const disallowedApis = ["process", "require", "module", "eval", "Function", "localStorage", "sessionStorage"]

    // 如果不允许网络请求，禁止fetch和XMLHttpRequest
    if (!options.allowNetwork) {
      disallowedApis.push("fetch", "XMLHttpRequest")
    }

    // 创建安全的执行环境
    const safeCode = `
      "use strict";
      
      // 禁止访问敏感API
      ${disallowedApis.map((api) => `const ${api} = undefined;`).join("\n")}
      
      // 设置环境变量
      const env = ${JSON.stringify(options.environment || {})};
      
      // 包装用户代码
      try {
        ${code}
      } catch (error) {
        console.error(error);
      }
    `

    return safeCode
  }
}

// 导出单例实例
export const codeSandbox = CodeSandbox.getInstance()
