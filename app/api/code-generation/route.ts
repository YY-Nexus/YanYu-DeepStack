import { type NextRequest, NextResponse } from "next/server"
import { enhancedOllamaService } from "@/lib/ai/enhanced-ollama-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, modelId, options } = body

    if (!prompt) {
      return NextResponse.json({ error: "提示词不能为空" }, { status: 400 })
    }

    if (!modelId) {
      return NextResponse.json({ error: "未指定模型ID" }, { status: 400 })
    }

    // 构建增强提示词
    let enhancedPrompt = prompt

    // 根据选项添加语言和框架信息
    if (options?.language) {
      enhancedPrompt = `使用 ${options.language} ${options.framework ? `和 ${options.framework} 框架 ` : ""}实现以下功能:\n\n${prompt}`
    }

    // 添加注释要求
    if (options?.includeComments) {
      enhancedPrompt += "\n\n请提供详细的中文注释，解释代码的关键部分。"
    }

    // 添加优化要求
    if (options?.optimizeFor) {
      const optimizationMap: Record<string, string> = {
        readability: "可读性",
        performance: "性能",
        security: "安全性",
      }
      enhancedPrompt += `\n\n请特别注重代码的${optimizationMap[options.optimizeFor] || "可读性"}。`
    }

    // 调用模型生成代码
    const startTime = Date.now()
    const result = await enhancedOllamaService.generateText(modelId, enhancedPrompt, {
      temperature: options?.temperature || 0.7,
      maxTokens: options?.maxTokens || 2048,
    })
    const endTime = Date.now()

    if (result.success && result.text) {
      // 提取代码块
      const code = extractCodeFromResponse(result.text)

      return NextResponse.json({
        success: true,
        code,
        originalResponse: result.text,
        metrics: {
          latency: endTime - startTime,
          tokensGenerated: result.tokens?.completion || 0,
          tokensPerSecond: result.tokens?.completion
            ? (result.tokens.completion / (result.timing?.evalTime || 1e9)) * 1e9
            : 0,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "生成失败",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("代码生成API错误:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 },
    )
  }
}

// 从响应中提取代码块
function extractCodeFromResponse(text: string): string {
  // 尝试提取代码块（使用```包围的内容）
  const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/g
  const matches = [...text.matchAll(codeBlockRegex)]

  if (matches.length > 0) {
    // 提取所有代码块并合并
    return matches.map((match) => match[1].trim()).join("\n\n")
  }

  // 如果没有找到代码块，返回原始文本
  return text
}
