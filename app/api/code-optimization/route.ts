import { NextRequest, NextResponse } from 'next/server'

// 代码优化请求接口
interface CodeOptimizationRequest {
  code: string
  language: string
  optimizationType: 'performance' | 'readability' | 'security' | 'all'
  preserveComments?: boolean
}

interface OptimizationSuggestion {
  line: number
  original: string
  optimized: string
  reason: string
  impact: 'high' | 'medium' | 'low'
  category: 'performance' | 'readability' | 'security' | 'maintainability'
}

interface CodeOptimizationResult {
  originalCode: string
  optimizedCode: string
  suggestions: OptimizationSuggestion[]
  summary: {
    totalChanges: number
    performanceGains: string
    readabilityScore: number
    securityImprovements: number
  }
}

// 代码优化逻辑
function optimizeCode(code: string, language: string, type: string): CodeOptimizationResult {
  const lines = code.split('\n')
  const suggestions: OptimizationSuggestion[] = []
  let optimizedLines = [...lines]
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    
    if (language === 'javascript' || language === 'typescript') {
      // 性能优化
      if (type === 'performance' || type === 'all') {
        // 优化循环
        if (trimmedLine.includes('for (let i = 0; i < array.length; i++)')) {
          const optimized = line.replace(
            'for (let i = 0; i < array.length; i++)',
            'for (let i = 0, len = array.length; i < len; i++)'
          )
          suggestions.push({
            line: index + 1,
            original: line,
            optimized,
            reason: '缓存数组长度以避免重复计算',
            impact: 'medium',
            category: 'performance'
          })
          optimizedLines[index] = optimized
        }
        
        // 优化字符串拼接
        if (trimmedLine.includes('str + ') && trimmedLine.includes('+=')) {
          const optimized = line.replace(/str \+= .+/g, (match) => {
            if (match.includes("'") || match.includes('"')) {
              return match.replace(/str \+=/, 'str = `${str}') + '`'
            }
            return match
          })
          if (optimized !== line) {
            suggestions.push({
              line: index + 1,
              original: line,
              optimized,
              reason: '使用模板字符串替代字符串拼接',
              impact: 'low',
              category: 'performance'
            })
            optimizedLines[index] = optimized
          }
        }
        
        // 优化对象属性访问
        if (trimmedLine.includes('.') && trimmedLine.split('.').length > 3) {
          const parts = trimmedLine.split('.')
          if (parts.length > 3) {
            suggestions.push({
              line: index + 1,
              original: line,
              optimized: `// 建议：${line.replace(/^\s+/, '')}\n${' '.repeat(line.length - line.trimStart().length)}const cached = ${parts.slice(0, 2).join('.')}; // 缓存对象引用`,
              reason: '避免深层对象属性重复访问',
              impact: 'low',
              category: 'performance'
            })
          }
        }
      }
      
      // 可读性优化
      if (type === 'readability' || type === 'all') {
        // 优化变量命名
        const singleLetterVars = /\b[a-z]\b/g
        if (singleLetterVars.test(trimmedLine) && !trimmedLine.includes('for (')) {
          suggestions.push({
            line: index + 1,
            original: line,
            optimized: '// 建议使用更有意义的变量名',
            reason: '单字母变量名降低代码可读性',
            impact: 'medium',
            category: 'readability'
          })
        }
        
        // 优化条件表达式
        if (trimmedLine.includes('? ') && trimmedLine.includes(' : ')) {
          const complexity = (trimmedLine.match(/\?|\:/g) || []).length
          if (complexity > 2) {
            suggestions.push({
              line: index + 1,
              original: line,
              optimized: '// 建议：将复杂三元表达式重构为 if-else 语句',
              reason: '简化复杂的三元表达式以提高可读性',
              impact: 'high',
              category: 'readability'
            })
          }
        }
        
        // 优化魔法数字
        const magicNumbers = /\b(\d{2,})\b/g
        if (magicNumbers.test(trimmedLine)) {
          suggestions.push({
            line: index + 1,
            original: line,
            optimized: `// 建议：定义常量\nconst MAGIC_NUMBER = ${trimmedLine.match(/\b(\d{2,})\b/)?.[0]};\n${line}`,
            reason: '将魔法数字提取为常量',
            impact: 'medium',
            category: 'readability'
          })
        }
      }
      
      // 安全优化
      if (type === 'security' || type === 'all') {
        // 检查 eval 使用
        if (trimmedLine.includes('eval(')) {
          suggestions.push({
            line: index + 1,
            original: line,
            optimized: '// 安全警告：避免使用 eval()，考虑使用 JSON.parse() 或其他安全替代方案',
            reason: 'eval() 存在代码注入风险',
            impact: 'high',
            category: 'security'
          })
        }
        
        // 检查 innerHTML 使用
        if (trimmedLine.includes('innerHTML')) {
          const optimized = line.replace('innerHTML', 'textContent')
          suggestions.push({
            line: index + 1,
            original: line,
            optimized,
            reason: '使用 textContent 替代 innerHTML 防止 XSS 攻击',
            impact: 'high',
            category: 'security'
          })
          optimizedLines[index] = optimized
        }
        
        // 检查硬编码密钥
        if (trimmedLine.includes('password') || trimmedLine.includes('secret') || trimmedLine.includes('key')) {
          if (trimmedLine.includes('=') && (trimmedLine.includes('"') || trimmedLine.includes("'"))) {
            suggestions.push({
              line: index + 1,
              original: line,
              optimized: '// 安全警告：不要在代码中硬编码敏感信息，使用环境变量',
              reason: '硬编码的敏感信息存在安全风险',
              impact: 'high',
              category: 'security'
            })
          }
        }
      }
    }
    
    // 通用优化
    // 移除多余的空行
    if (trimmedLine === '' && index > 0 && lines[index - 1].trim() === '') {
      optimizedLines[index] = null as any // 标记为删除
      suggestions.push({
        line: index + 1,
        original: line,
        optimized: '',
        reason: '移除多余的空行',
        impact: 'low',
        category: 'readability'
      })
    }
    
    // 统一缩进
    if (line.startsWith('\t') && lines.some(l => l.startsWith('  '))) {
      const optimized = line.replace(/^\t+/, (tabs) => '  '.repeat(tabs.length))
      if (optimized !== line) {
        suggestions.push({
          line: index + 1,
          original: line,
          optimized,
          reason: '统一使用空格缩进',
          impact: 'low',
          category: 'readability'
        })
        optimizedLines[index] = optimized
      }
    }
  })
  
  // 过滤掉标记为删除的行
  const finalOptimizedLines = optimizedLines.filter(line => line !== null)
  
  // 计算统计信息
  const performanceChanges = suggestions.filter(s => s.category === 'performance').length
  const securityChanges = suggestions.filter(s => s.category === 'security').length
  const readabilityChanges = suggestions.filter(s => s.category === 'readability').length
  
  return {
    originalCode: code,
    optimizedCode: finalOptimizedLines.join('\n'),
    suggestions,
    summary: {
      totalChanges: suggestions.length,
      performanceGains: performanceChanges > 0 ? `${performanceChanges} 个性能优化` : '无性能改进',
      readabilityScore: Math.max(85 - readabilityChanges * 5, 60),
      securityImprovements: securityChanges
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      code, 
      language, 
      optimizationType, 
      preserveComments = true 
    }: CodeOptimizationRequest = await request.json()
    
    if (!code || !language || !optimizationType) {
      return NextResponse.json(
        { error: '代码、语言和优化类型参数是必需的' },
        { status: 400 }
      )
    }
    
    if (!['performance', 'readability', 'security', 'all'].includes(optimizationType)) {
      return NextResponse.json(
        { error: '无效的优化类型' },
        { status: 400 }
      )
    }
    
    // 执行代码优化
    const result = optimizeCode(code, language, optimizationType)
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('代码优化错误:', error)
    return NextResponse.json(
      { error: '代码优化失败' },
      { status: 500 }
    )
  }
}
