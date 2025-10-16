// 错误处理与监控系统

import React, { Component, ErrorInfo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// 1. 全局错误边界
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class GlobalErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到监控系统
    this.logErrorToService(error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // 发送到错误监控服务
    fetch('/api/error-logging', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(console.error)
    
    // 同时记录到本地存储作为备份
    const errorLog = {
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      component: errorInfo.componentStack
    }
    
    const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]')
    existingLogs.push(errorLog)
    
    // 只保留最近50条错误记录
    if (existingLogs.length > 50) {
      existingLogs.splice(0, existingLogs.length - 50)
    }
    
    localStorage.setItem('error_logs', JSON.stringify(existingLogs))
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                应用出现错误
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                抱歉，应用遇到了意外错误。我们已经记录了这个问题，请稍后重试。
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="bg-muted p-2 rounded text-xs">
                  <summary className="cursor-pointer font-medium">
                    错误详情（开发模式）
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新加载
                </Button>
                
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                >
                  刷新页面
                </Button>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="ghost"
                className="w-full"
              >
                返回首页
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// 2. 网络错误处理
export class NetworkErrorHandler {
  private retryAttempts: Map<string, number> = new Map()
  private maxRetries = 3
  private retryDelay = 1000

  async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    customMaxRetries?: number
  ): Promise<Response> {
    const maxRetries = customMaxRetries ?? this.maxRetries
    const attemptKey = `${url}-${JSON.stringify(options)}`
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(10000) // 10秒超时
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        // 成功后清理重试计数
        this.retryAttempts.delete(attemptKey)
        return response
        
      } catch (error) {
        console.error(`请求失败 (尝试 ${attempt}/${maxRetries}):`, error)
        
        // 最后一次尝试失败
        if (attempt === maxRetries) {
          this.retryAttempts.set(attemptKey, attempt)
          throw new Error(
            `网络请求失败: ${error instanceof Error ? error.message : '未知错误'}`
          )
        }
        
        // 等待后重试
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * attempt)
        )
      }
    }
    
    throw new Error('请求重试失败')
  }
}

// 3. 用户反馈组件
interface ErrorFeedbackProps {
  error?: Error
  onFeedbackSubmit?: (feedback: string) => void
}

export function ErrorFeedback({ error, onFeedbackSubmit }: ErrorFeedbackProps) {
  const [feedback, setFeedback] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const handleSubmit = async () => {
    if (!feedback.trim()) return
    
    setIsSubmitting(true)
    
    try {
      await fetch('/api/error-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          error: error?.message,
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      })
      
      setIsSubmitted(true)
      onFeedbackSubmit?.(feedback)
    } catch (err) {
      console.error('反馈提交失败:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-4">
          <p className="text-sm text-green-600">
            ✅ 感谢您的反馈！我们会尽快处理这个问题。
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">帮助我们改进</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="请描述您遇到的问题或操作步骤..."
          className="w-full p-2 border rounded text-sm min-h-[80px] resize-none"
        />
        <Button 
          onClick={handleSubmit}
          disabled={!feedback.trim() || isSubmitting}
          size="sm"
          className="w-full"
        >
          {isSubmitting ? '提交中...' : '发送反馈'}
        </Button>
      </CardContent>
    </Card>
  )
}

// 4. 性能监控
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map()

  startTiming(label: string) {
    this.metrics.set(label, performance.now())
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(label)
    if (!startTime) return 0
    
    const duration = performance.now() - startTime
    this.metrics.delete(label)
    
    // 记录性能数据
    this.logPerformance(label, duration)
    
    return duration
  }

  private logPerformance(label: string, duration: number) {
    // 只记录慢操作（超过100ms）
    if (duration > 100) {
      fetch('/api/performance-logging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: label,
          duration,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(console.error)
    }
  }

  // 监控组件渲染性能
  measureComponentRender<T extends React.ComponentType<any>>(
    Component: T,
    componentName: string
  ): T {
    return React.forwardRef((props, ref) => {
      const renderStart = React.useRef<number | undefined>(undefined)
      
      React.useLayoutEffect(() => {
        renderStart.current = performance.now()
      })
      
      React.useEffect(() => {
        if (renderStart.current) {
          const renderTime = performance.now() - renderStart.current
          this.logPerformance(`${componentName}_render`, renderTime)
        }
      })
      
      return React.createElement(Component, { ...props, ref })
    }) as unknown as T
  }
}

// 5. 全局实例
export const networkErrorHandler = new NetworkErrorHandler()
export const performanceMonitor = new PerformanceMonitor()

// 6. 自定义Hook for API调用
export function useApiCall<T>(
  url: string,
  options: RequestInit = {}
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const execute = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      performanceMonitor.startTiming(`api_call_${url}`)
      const response = await networkErrorHandler.fetchWithRetry(url, options)
      const result = await response.json()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '请求失败'
      setError(errorMessage)
    } finally {
      performanceMonitor.endTiming(`api_call_${url}`)
      setLoading(false)
    }
  }, [url, options])

  React.useEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, retry: execute }
}