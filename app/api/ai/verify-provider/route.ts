import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { providerId } = await request.json()

    // 验证提供商配置
    let isValid = false
    let errorMessage = ""

    switch (providerId) {
      case "openai":
        // 验证OpenAI API密钥
        const openaiKey = process.env.OPENAI_API_KEY
        if (openaiKey) {
          try {
            const response = await fetch("https://api.openai.com/v1/models", {
              headers: {
                Authorization: `Bearer ${openaiKey}`,
              },
            })
            isValid = response.ok
            if (!isValid) {
              errorMessage = "OpenAI API密钥无效"
            }
          } catch (error) {
            errorMessage = "无法连接到OpenAI服务"
          }
        } else {
          errorMessage = "未配置OpenAI API密钥"
        }
        break

      case "anthropic":
        // 验证Anthropic API密钥
        const anthropicKey = process.env.ANTHROPIC_API_KEY
        if (anthropicKey) {
          try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "x-api-key": anthropicKey,
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: "claude-3-haiku-20240307",
                max_tokens: 1,
                messages: [{ role: "user", content: "test" }],
              }),
            })
            isValid = response.status !== 401 // 401表示密钥无效
            if (!isValid) {
              errorMessage = "Anthropic API密钥无效"
            }
          } catch (error) {
            errorMessage = "无法连接到Anthropic服务"
          }
        } else {
          errorMessage = "未配置Anthropic API密钥"
        }
        break

      case "google":
        // 验证Google API密钥
        const googleKey = process.env.GOOGLE_API_KEY
        if (googleKey) {
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${googleKey}`)
            isValid = response.ok
            if (!isValid) {
              errorMessage = "Google API密钥无效"
            }
          } catch (error) {
            errorMessage = "无法连接到Google AI服务"
          }
        } else {
          errorMessage = "未配置Google API密钥"
        }
        break

      case "local":
        // 验证本地Ollama服务
        const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434"
        try {
          const response = await fetch(`${ollamaUrl}/api/tags`)
          isValid = response.ok
          if (!isValid) {
            errorMessage = "Ollama服务不可用"
          }
        } catch (error) {
          errorMessage = "无法连接到Ollama服务"
        }
        break

      default:
        errorMessage = "未知的提供商"
    }

    return NextResponse.json({
      success: isValid,
      providerId,
      error: isValid ? null : errorMessage,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "验证过程中发生错误",
      },
      { status: 500 },
    )
  }
}
