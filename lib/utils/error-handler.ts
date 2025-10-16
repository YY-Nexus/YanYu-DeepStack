/**
 * 错误处理中间件
 * 统一处理应用中的错误
 */

export interface AppError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

export class ErrorHandler {
  static handle(error: AppError, context?: string): void {
    console.error(`[${context || 'App'}] Error:`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
    })

    // 在生产环境中可以发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      // 发送到 Sentry 或其他错误监控服务
    }
  }

  static createError(message: string, statusCode = 500, code?: string): AppError {
    const error = new Error(message) as AppError
    error.statusCode = statusCode
    error.code = code
    return error
  }
}

// API 错误处理
export const handleApiError = (error: any): Response => {
  const appError = error as AppError
  return new Response(
    JSON.stringify({
      error: appError.message || 'Internal Server Error',
      code: appError.code,
    }),
    {
      status: appError.statusCode || 500,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
