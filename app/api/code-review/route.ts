import { NextRequest, NextResponse } from 'next/server'

// 代码评审请求接口
interface CodeReviewRequest {
  code: string
  language: string
  title: string
  description?: string
  author: string
}

interface ReviewComment {
  id: string
  line: number
  column: number
  message: string
  type: 'suggestion' | 'issue' | 'praise' | 'question'
  severity: 'low' | 'medium' | 'high'
  author: string
  timestamp: Date
}

interface CodeReviewResult {
  id: string
  title: string
  status: 'pending' | 'approved' | 'rejected' | 'needs-work'
  score: number
  comments: ReviewComment[]
  summary: string
  recommendations: string[]
  approvalRequired: boolean
}

// 生成评审ID
function generateReviewId(): string {
  return `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 智能代码评审逻辑
function performCodeReview(code: string, language: string, title: string, author: string): CodeReviewResult {
  const lines = code.split('\n')
  const comments: ReviewComment[] = []
  const recommendations: string[] = []
  
  // 自动评审规则
  lines.forEach((line, index) => {
    const lineNumber = index + 1
    const trimmedLine = line.trim()
    
    // 检查命名规范
    if (language === 'javascript' || language === 'typescript') {
      // 变量命名检查
      const varRegex = /(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
      let match
      while ((match = varRegex.exec(line)) !== null) {
        const varName = match[1]
        if (varName.length < 3 && !['i', 'j', 'k', 'id'].includes(varName)) {
          comments.push({
            id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            line: lineNumber,
            column: match.index + 1,
            message: `变量名 "${varName}" 过短，建议使用更有意义的名称`,
            type: 'suggestion',
            severity: 'low',
            author: 'AI Review Bot',
            timestamp: new Date()
          })
        }
      }
      
      // 函数长度检查
      if (trimmedLine.includes('function') || trimmedLine.includes('=>')) {
        let openBraces = 0
        let functionLength = 0
        for (let i = index; i < lines.length; i++) {
          const currentLine = lines[i]
          openBraces += (currentLine.match(/\{/g) || []).length
          openBraces -= (currentLine.match(/\}/g) || []).length
          functionLength++
          
          if (openBraces === 0 && i > index) {
            if (functionLength > 20) {
              comments.push({
                id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                line: lineNumber,
                column: 1,
                message: `函数长度 ${functionLength} 行过长，建议拆分为更小的函数`,
                type: 'issue',
                severity: 'medium',
                author: 'AI Review Bot',
                timestamp: new Date()
              })
            }
            break
          }
        }
      }
    }
    
    // 通用检查
    // 检查注释质量
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
      if (trimmedLine.length < 10) {
        comments.push({
          id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          line: lineNumber,
          column: 1,
          message: '注释过于简单，建议提供更详细的说明',
          type: 'suggestion',
          severity: 'low',
          author: 'AI Review Bot',
          timestamp: new Date()
        })
      }
    }
    
    // 检查错误处理
    if (trimmedLine.includes('try {') || trimmedLine.includes('catch')) {
      let hasProperErrorHandling = false
      for (let i = index; i < Math.min(index + 10, lines.length); i++) {
        if (lines[i].includes('console.error') || lines[i].includes('logger') || lines[i].includes('throw')) {
          hasProperErrorHandling = true
          break
        }
      }
      
      if (!hasProperErrorHandling) {
        comments.push({
          id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          line: lineNumber,
          column: 1,
          message: '异常处理不完整，建议添加适当的日志记录或重新抛出',
          type: 'issue',
          severity: 'high',
          author: 'AI Review Bot',
          timestamp: new Date()
        })
      }
    }
    
    // 检查魔法数字
    const magicNumberRegex = /\b(\d{2,})\b/g
    if (magicNumberRegex.test(trimmedLine) && !trimmedLine.includes('//')) {
      comments.push({
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        line: lineNumber,
        column: 1,
        message: '建议将魔法数字提取为常量',
        type: 'suggestion',
        severity: 'low',
        author: 'AI Review Bot',
        timestamp: new Date()
      })
    }
    
    // 表扬优秀的代码
    if (trimmedLine.includes('async') && trimmedLine.includes('await')) {
      comments.push({
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        line: lineNumber,
        column: 1,
        message: '优秀的异步编程实践！',
        type: 'praise',
        severity: 'low',
        author: 'AI Review Bot',
        timestamp: new Date()
      })
    }
  })
  
  // 生成评审分数
  let score = 100
  comments.forEach(comment => {
    switch (comment.severity) {
      case 'high': score -= 10; break
      case 'medium': score -= 5; break
      case 'low': score -= 2; break
    }
  })
  score = Math.max(score, 0)
  
  // 生成建议
  if (score >= 90) {
    recommendations.push('代码质量优秀，可以直接合并')
    recommendations.push('继续保持这种高质量的编码标准')
  } else if (score >= 75) {
    recommendations.push('代码质量良好，建议修复轻微问题后合并')
    recommendations.push('考虑在下次提交时改进注释和命名')
  } else if (score >= 60) {
    recommendations.push('需要修复多个问题后才能合并')
    recommendations.push('重点关注错误处理和代码结构')
  } else {
    recommendations.push('代码需要重大改进，建议重新审视设计')
    recommendations.push('考虑寻求团队成员的帮助和建议')
  }
  
  // 具体建议
  const issueCount = comments.filter(c => c.type === 'issue').length
  const suggestionCount = comments.filter(c => c.type === 'suggestion').length
  
  if (issueCount > 0) {
    recommendations.push(`修复 ${issueCount} 个重要问题`)
  }
  
  if (suggestionCount > 5) {
    recommendations.push('考虑采纳部分改进建议以提升代码质量')
  }
  
  // 确定状态
  let status: 'pending' | 'approved' | 'rejected' | 'needs-work'
  if (score >= 85) {
    status = 'approved'
  } else if (score >= 60) {
    status = 'needs-work'
  } else {
    status = 'rejected'
  }
  
  return {
    id: generateReviewId(),
    title,
    status,
    score,
    comments,
    summary: `代码评审完成。总分: ${score}/100。发现 ${comments.length} 个反馈点，其中 ${issueCount} 个问题需要修复。`,
    recommendations,
    approvalRequired: score < 85
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, title, description, author }: CodeReviewRequest = await request.json()
    
    if (!code || !language || !title || !author) {
      return NextResponse.json(
        { error: '代码、语言、标题和作者参数是必需的' },
        { status: 400 }
      )
    }
    
    // 执行代码评审
    const result = performCodeReview(code, language, title, author)
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('代码评审错误:', error)
    return NextResponse.json(
      { error: '代码评审失败' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // 返回评审历史或统计信息
  return NextResponse.json({
    success: true,
    data: {
      totalReviews: 42,
      averageScore: 78,
      approvalRate: 65,
      commonIssues: [
        '变量命名不规范',
        '缺少错误处理',
        '函数过长',
        '注释不足'
      ]
    }
  })
}
