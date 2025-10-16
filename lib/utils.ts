import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化字节大小
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

// 格式化持续时间（毫秒）为人类可读格式
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`
  } else {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(1)
    return `${minutes}m ${seconds}s`
  }
}

// 检测代码语言
export function detectLanguage(code: string): string {
  // 简单的语言检测逻辑
  if (!code) return "javascript"

  const lowerCode = code.toLowerCase()

  // 检查文件扩展名模式
  if (
    lowerCode.includes("```python") ||
    lowerCode.includes("def ") ||
    (lowerCode.includes("import ") && lowerCode.includes(":"))
  ) {
    return "python"
  }

  if (
    lowerCode.includes("```java") ||
    lowerCode.includes("public class ") ||
    lowerCode.includes("public static void main")
  ) {
    return "java"
  }

  if (lowerCode.includes("```c#") || lowerCode.includes("using system;") || lowerCode.includes("namespace ")) {
    return "csharp"
  }

  if (lowerCode.includes("```go") || lowerCode.includes("package main") || lowerCode.includes("func main()")) {
    return "go"
  }

  if (lowerCode.includes("```rust") || lowerCode.includes("fn main()") || lowerCode.includes("let mut ")) {
    return "rust"
  }

  if (lowerCode.includes("```php") || lowerCode.includes("<?php")) {
    return "php"
  }

  if (lowerCode.includes("```ruby") || (lowerCode.includes("def ") && lowerCode.includes("end"))) {
    return "ruby"
  }

  if (lowerCode.includes("```html") || lowerCode.includes("<!doctype html>") || lowerCode.includes("<html>")) {
    return "html"
  }

  if (
    lowerCode.includes("```css") ||
    lowerCode.includes("@media") ||
    (lowerCode.includes("{") && lowerCode.includes(":") && lowerCode.includes(";"))
  ) {
    return "css"
  }

  if (lowerCode.includes("```sql") || (lowerCode.includes("select ") && lowerCode.includes("from "))) {
    return "sql"
  }

  if (
    lowerCode.includes("```typescript") ||
    lowerCode.includes("interface ") ||
    (lowerCode.includes(": ") && lowerCode.includes("type "))
  ) {
    return "typescript"
  }

  // 默认为JavaScript
  return "javascript"
}

// 格式化数字
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

// 计算相对时间
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "刚刚"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}小时前`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays}天前`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}个月前`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears}年前`
}

// 生成随机ID
export function generateId(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 获取文件扩展名
export function getFileExtension(language: string): string {
  const extensionMap: Record<string, string> = {
    javascript: '.js',
    typescript: '.ts',
    python: '.py',
    java: '.java',
    csharp: '.cs',
    go: '.go',
    rust: '.rs',
    php: '.php',
    ruby: '.rb',
    html: '.html',
    css: '.css',
    sql: '.sql',
    markdown: '.md',
  };
  
  return extensionMap[language.toLowerCase()] || '.txt';
}
