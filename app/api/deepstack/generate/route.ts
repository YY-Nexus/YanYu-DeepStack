import { type NextRequest, NextResponse } from "next/server"
import { deepStackService } from "@/lib/ai/deepstack-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, language, framework, type = "generate", context } = body

    if (!prompt) {
      return NextResponse.json({ error: "提示词不能为空" }, { status: 400 })
    }

    let result

    switch (type) {
      case "generate":
        result = await deepStackService.generateCode(prompt, {
          language,
          framework,
          context,
          includeExamples: true,
        })
        break

      case "optimize":
        if (!context) {
          return NextResponse.json({ error: "优化代码时需要提供原始代码" }, { status: 400 })
        }
        result = await deepStackService.optimizeCode(context, language || "JavaScript", "readability")
        break

      case "explain":
        if (!context) {
          return NextResponse.json({ error: "解释代码时需要提供代码内容" }, { status: 400 })
        }
        result = await deepStackService.explainCode(context, language || "JavaScript")
        break

      case "fix":
        if (!context) {
          return NextResponse.json({ error: "修复代码时需要提供代码内容" }, { status: 400 })
        }
        result = await deepStackService.fixCode(context, language || "JavaScript", prompt)
        break

      default:
        result = await deepStackService.generateCode(prompt, { language, framework })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("DeepStack API错误:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 },
    )
  }
}
