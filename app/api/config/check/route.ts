import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json()

    let configured = false
    let valid = false

    // 检查服务端环境变量配置
    switch (key) {
      case "OPENAI_API_KEY":
        configured = !!process.env.OPENAI_API_KEY
        if (configured) {
          // 简单验证API密钥格式
          valid = process.env.OPENAI_API_KEY!.startsWith("sk-")
        }
        break

      case "ANTHROPIC_API_KEY":
        configured = !!process.env.ANTHROPIC_API_KEY
        if (configured) {
          valid = process.env.ANTHROPIC_API_KEY!.startsWith("sk-ant-")
        }
        break

      case "GOOGLE_API_KEY":
        configured = !!process.env.GOOGLE_API_KEY
        if (configured) {
          valid = process.env.GOOGLE_API_KEY!.startsWith("AIza")
        }
        break

      case "ALIYUN_ACCESS_KEY_ID":
        configured = !!process.env.ALIYUN_ACCESS_KEY_ID
        if (configured) {
          valid = process.env.ALIYUN_ACCESS_KEY_ID!.startsWith("LTAI")
        }
        break

      default:
        return NextResponse.json({ error: "未知的配置项" }, { status: 400 })
    }

    return NextResponse.json({
      key,
      configured,
      valid,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "检查配置时发生错误",
      },
      { status: 500 },
    )
  }
}
