import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const task = await request.json()

    // 根据任务类型选择合适的处理方式
    let result

    switch (task.type) {
      case "code-generation":
        result = await executeCodeGeneration(task)
        break
      case "text-generation":
        result = await executeTextGeneration(task)
        break
      case "analysis":
        result = await executeAnalysis(task)
        break
      default:
        result = await executeGenericTask(task)
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "任务执行失败",
        duration: 0,
        cost: 0,
      },
      { status: 500 },
    )
  }
}

// 执行代码生成任务
async function executeCodeGeneration(task: any) {
  const startTime = Date.now()

  try {
    // 优先使用本地Ollama服务
    const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434"

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5-coder:latest",
        prompt: task.input,
        stream: false,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        result: data.response,
        model: "qwen2.5-coder:latest",
        duration: Date.now() - startTime,
        cost: 0, // 本地模型无成本
        confidence: 0.8,
      }
    }

    // 如果本地模型不可用，尝试使用云端API
    return await executeWithCloudAPI(task, startTime)
  } catch (error) {
    return {
      success: false,
      error: "代码生成失败",
      duration: Date.now() - startTime,
      cost: 0,
    }
  }
}

// 执行文本生成任务
async function executeTextGeneration(task: any) {
  const startTime = Date.now()

  try {
    // 优先使用本地模型
    const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434"

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:latest",
        prompt: task.input,
        stream: false,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        result: data.response,
        model: "qwen2.5:latest",
        duration: Date.now() - startTime,
        cost: 0,
        confidence: 0.8,
      }
    }

    return await executeWithCloudAPI(task, startTime)
  } catch (error) {
    return {
      success: false,
      error: "文本生成失败",
      duration: Date.now() - startTime,
      cost: 0,
    }
  }
}

// 执行分析任务
async function executeAnalysis(task: any) {
  const startTime = Date.now()

  try {
    // 分析任务使用更强的模型
    const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434"

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2:72b", // 使用用户的72B模型
        prompt: task.input,
        stream: false,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        result: data.response,
        model: "qwen2:72b",
        duration: Date.now() - startTime,
        cost: 0,
        confidence: 0.9,
      }
    }

    return await executeWithCloudAPI(task, startTime)
  } catch (error) {
    return {
      success: false,
      error: "分析任务失败",
      duration: Date.now() - startTime,
      cost: 0,
    }
  }
}

// 执行通用任务
async function executeGenericTask(task: any) {
  const startTime = Date.now()

  try {
    const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434"

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2:latest",
        prompt: task.input,
        stream: false,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        result: data.response,
        model: "qwen2:latest",
        duration: Date.now() - startTime,
        cost: 0,
        confidence: 0.8,
      }
    }

    return await executeWithCloudAPI(task, startTime)
  } catch (error) {
    return {
      success: false,
      error: "任务执行失败",
      duration: Date.now() - startTime,
      cost: 0,
    }
  }
}

// 使用云端API执行任务（仅在本地模型不可用时）
async function executeWithCloudAPI(task: any, startTime: number) {
  // 只有在配置了API密钥的情况下才尝试云端API
  const openaiKey = process.env.OPENAI_API_KEY

  if (openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: task.input }],
          max_tokens: 2048,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          result: data.choices[0].message.content,
          model: "gpt-3.5-turbo",
          duration: Date.now() - startTime,
          cost: calculateOpenAICost(data.usage),
          confidence: 0.9,
        }
      }
    } catch (error) {
      console.error("云端API调用失败:", error)
    }
  }

  return {
    success: false,
    error: "所有AI服务都不可用",
    duration: Date.now() - startTime,
    cost: 0,
  }
}

// 计算OpenAI成本
function calculateOpenAICost(usage: any) {
  if (!usage) return 0

  const inputCost = (usage.prompt_tokens / 1000) * 0.0015
  const outputCost = (usage.completion_tokens / 1000) * 0.002

  return inputCost + outputCost
}
