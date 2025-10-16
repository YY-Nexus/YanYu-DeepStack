import { NextRequest, NextResponse } from 'next/server'

// 代码质量分析接口
interface CodeAnalysisRequest {
  code: string
  language: string
  options?: {
    checkSecurity?: boolean
    checkPerformance?: boolean
    checkMaintainability?: boolean
    checkComplexity?: boolean
  }
}

interface CodeIssue {
  type: 'error' | 'warning' | 'info' | 'suggestion'
  severity: 'critical' | 'major' | 'minor' | 'info'
  message: string
  line: number
  column: number
  rule: string
  suggestion?: string
}

interface CodeMetrics {
  complexity: number
  maintainabilityIndex: number
  technicalDebt: number
  codeSmells: number
  duplicateLines: number
  linesOfCode: number
}

interface CodeAnalysisResult {
  issues: CodeIssue[]
  metrics: CodeMetrics
  score: number
  suggestions: string[]
}

// 简单的代码分析逻辑
function analyzeCode(code: string, language: string): CodeAnalysisResult {
  const lines = code.split('\n')
  const issues: CodeIssue[] = []
  const suggestions: string[] = []
  
  // 基础分析规则
  lines.forEach((line, index) => {
    const lineNumber = index + 1
    const trimmedLine = line.trim()
    
    // 检查长函数
    if (trimmedLine.includes('function') && line.length > 80) {
      issues.push({
        type: 'warning',
        severity: 'minor',
        message: '函数定义过长，建议拆分',
        line: lineNumber,
        column: 1,
        rule: 'function-length',
        suggestion: '将长函数拆分为多个小函数'
      })
    }
    
    // 检查 console.log
    if (trimmedLine.includes('console.log')) {
      issues.push({
        type: 'warning',
        severity: 'minor',
        message: '生产环境中应移除调试日志',
        line: lineNumber,
        column: line.indexOf('console.log') + 1,
        rule: 'no-console',
        suggestion: '使用正式的日志记录工具'
      })
    }
    
    // 检查 TODO/FIXME
    if (trimmedLine.includes('TODO') || trimmedLine.includes('FIXME')) {
      issues.push({
        type: 'info',
        severity: 'info',
        message: '存在待完成的任务',
        line: lineNumber,
        column: 1,
        rule: 'todo-check'
      })
    }
    
    // 检查硬编码字符串
    const stringRegex = /["']([^"']{20,})["']/g
    if (stringRegex.test(trimmedLine)) {
      issues.push({
        type: 'suggestion',
        severity: 'minor',
        message: '考虑将长字符串提取为常量',
        line: lineNumber,
        column: 1,
        rule: 'no-hardcoded-strings',
        suggestion: '使用常量或配置文件管理字符串'
      })
    }
    
    // 检查复杂的条件语句
    const complexCondition = /if\s*\([^)]{50,}\)/
    if (complexCondition.test(trimmedLine)) {
      issues.push({
        type: 'warning',
        severity: 'major',
        message: '条件语句过于复杂',
        line: lineNumber,
        column: 1,
        rule: 'complex-condition',
        suggestion: '将复杂条件拆分为多个简单条件或提取为函数'
      })
    }
  })
  
  // 计算指标
  const linesOfCode = lines.filter(line => line.trim() !== '').length
  const complexity = Math.min(Math.floor(linesOfCode / 10) + issues.length, 20)
  const maintainabilityIndex = Math.max(100 - complexity * 2 - issues.length, 0)
  const technicalDebt = issues.filter(i => i.severity === 'major' || i.severity === 'critical').length * 2
  const codeSmells = issues.filter(i => i.type === 'warning' || i.type === 'suggestion').length
  const duplicateLines = 0 // 简化计算
  
  const metrics: CodeMetrics = {
    complexity,
    maintainabilityIndex,
    technicalDebt,
    codeSmells,
    duplicateLines,
    linesOfCode
  }
  
  // 计算总分
  const score = Math.max(100 - issues.length * 5 - complexity, 0)
  
  // 生成建议
  if (score < 60) {
    suggestions.push('代码质量需要重点改进，建议重构')
  } else if (score < 80) {
    suggestions.push('代码质量良好，但还有改进空间')
  } else {
    suggestions.push('代码质量优秀，继续保持')
  }
  
  if (complexity > 10) {
    suggestions.push('降低代码复杂度，考虑使用设计模式')
  }
  
  if (issues.length > 10) {
    suggestions.push('修复现有问题，提高代码健壮性')
  }
  
  return {
    issues,
    metrics,
    score,
    suggestions
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, options = {} }: CodeAnalysisRequest = await request.json()
    
    if (!code || !language) {
      return NextResponse.json(
        { error: '代码和语言参数是必需的' },
        { status: 400 }
      )
    }
    
    // 执行代码分析
    const result = analyzeCode(code, language)
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('代码分析错误:', error)
    return NextResponse.json(
      { error: '代码分析失败' },
      { status: 500 }
    )
  }
}
