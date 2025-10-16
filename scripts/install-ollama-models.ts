#!/usr/bin/env node

/**
 * Ollama模型安装脚本
 * 自动安装推荐的AI模型
 */

import { execSync } from "child_process"

interface ModelInfo {
  name: string
  description: string
  size: string
  category: string
  priority: number
  recommended: boolean
}

class OllamaModelInstaller {
  private models: ModelInfo[] = [
    {
      name: "llama3.2:1b",
      description: "轻量级通用模型，快速响应",
      size: "1.3GB",
      category: "general",
      priority: 1,
      recommended: true,
    },
    {
      name: "qwen2.5:1.5b",
      description: "中文优化轻量模型",
      size: "1.5GB",
      category: "chinese",
      priority: 2,
      recommended: true,
    },
    {
      name: "codellama:7b",
      description: "代码生成专用模型",
      size: "3.8GB",
      category: "coding",
      priority: 3,
      recommended: true,
    },
    {
      name: "llama3.2:3b",
      description: "平衡性能和质量的通用模型",
      size: "2.0GB",
      category: "general",
      priority: 4,
      recommended: false,
    },
    {
      name: "qwen2.5:7b",
      description: "高质量中文对话模型",
      size: "4.4GB",
      category: "chinese",
      priority: 5,
      recommended: false,
    },
    {
      name: "deepseek-coder:6.7b",
      description: "深度代码理解模型",
      size: "6.9GB",
      category: "coding",
      priority: 6,
      recommended: false,
    },
    {
      name: "llama3.1:8b",
      description: "高性能通用大模型",
      size: "4.7GB",
      category: "general",
      priority: 7,
      recommended: false,
    },
  ]

  // 检查Ollama是否可用
  private checkOllamaAvailable(): boolean {
    try {
      execSync("ollama --version", { stdio: "pipe" })
      return true
    } catch {
      return false
    }
  }

  // 检查Ollama服务是否运行
  private async checkOllamaService(): Promise<boolean> {
    try {
      const response = await fetch("http://localhost:11434/api/tags", {
        signal: AbortSignal.timeout(3000),
      })
      return response.ok
    } catch {
      return false
    }
  }

  // 获取已安装的模型
  private getInstalledModels(): string[] {
    try {
      const output = execSync("ollama list", { encoding: "utf-8", stdio: "pipe" })
      const lines = output.split("\n").slice(1) // 跳过标题行
      return lines
        .filter((line) => line.trim())
        .map((line) => line.split(/\s+/)[0])
        .filter((name) => name && name !== "NAME")
    } catch {
      return []
    }
  }

  // 检查磁盘空间
  private checkDiskSpace(): number {
    try {
      const output = execSync("df -h .", { encoding: "utf-8", stdio: "pipe" })
      const lines = output.split("\n")
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/)
        const available = parts[3]
        // 简单解析可用空间 (GB)
        const match = available.match(/(\d+(?:\.\d+)?)([KMGT]?)/)
        if (match) {
          const [, size, unit] = match
          const sizeNum = Number.parseFloat(size)
          switch (unit) {
            case "T":
              return sizeNum * 1024
            case "G":
              return sizeNum
            case "M":
              return sizeNum / 1024
            case "K":
              return sizeNum / (1024 * 1024)
            default:
              return sizeNum / (1024 * 1024 * 1024)
          }
        }
      }
    } catch {
      // 忽略错误，返回默认值
    }
    return 10 // 默认假设有10GB可用空间
  }

  // 安装单个模型
  private async installModel(modelName: string): Promise<boolean> {
    console.log(`📦 正在安装模型: ${modelName}`)

    try {
      // 使用spawn来实时显示进度
      const process = execSync(`ollama pull ${modelName}`, {
        encoding: "utf-8",
        stdio: "inherit", // 实时显示输出
      })

      console.log(`✅ 模型安装成功: ${modelName}`)
      return true
    } catch (error) {
      console.log(`❌ 模型安装失败: ${modelName}`)
      console.log(`   错误: ${error}`)
      return false
    }
  }

  // 测试模型
  private async testModel(modelName: string): Promise<boolean> {
    console.log(`🧪 测试模型: ${modelName}`)

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          prompt: "Hello, how are you?",
          stream: false,
        }),
        signal: AbortSignal.timeout(30000), // 30秒超时
      })

      if (response.ok) {
        const data = await response.json()
        if (data.response) {
          console.log(`✅ 模型测试成功: ${modelName}`)
          console.log(`   响应: ${data.response.substring(0, 100)}...`)
          return true
        }
      }
    } catch (error) {
      console.log(`❌ 模型测试失败: ${modelName}`)
    }

    return false
  }

  // 推荐模型选择
  private recommendModels(availableSpace: number): ModelInfo[] {
    const recommended: ModelInfo[] = []
    let totalSize = 0

    // 按优先级排序
    const sortedModels = [...this.models].sort((a, b) => a.priority - b.priority)

    for (const model of sortedModels) {
      const modelSize = Number.parseFloat(model.size.replace("GB", ""))

      if (totalSize + modelSize <= availableSpace * 0.8) {
        // 保留20%空间
        recommended.push(model)
        totalSize += modelSize

        // 至少安装3个推荐模型
        if (recommended.length >= 3 && !model.recommended) {
          break
        }
      }
    }

    return recommended
  }

  // 显示模型信息
  private displayModelInfo(): void {
    console.log("\n📋 可用模型列表:")
    console.log("=".repeat(60))

    const categories = ["general", "chinese", "coding"]
    const categoryNames = {
      general: "🌟 通用模型",
      chinese: "🇨🇳 中文模型",
      coding: "💻 编程模型",
    }

    for (const category of categories) {
      console.log(`\n${categoryNames[category as keyof typeof categoryNames]}:`)

      const categoryModels = this.models.filter((m) => m.category === category)
      for (const model of categoryModels) {
        const badge = model.recommended ? "⭐" : "  "
        console.log(`  ${badge} ${model.name.padEnd(20)} ${model.size.padEnd(8)} ${model.description}`)
      }
    }
  }

  // 交互式选择模型
  private async selectModelsInteractively(): Promise<string[]> {
    // 这里简化处理，实际可以使用inquirer等库实现交互
    console.log("\n🎯 推荐安装以下模型:")

    const availableSpace = this.checkDiskSpace()
    const recommended = this.recommendModels(availableSpace)

    console.log(`💾 可用磁盘空间: ${availableSpace.toFixed(1)}GB`)
    console.log("📦 推荐模型:")

    let totalSize = 0
    for (const model of recommended) {
      const size = Number.parseFloat(model.size.replace("GB", ""))
      totalSize += size
      console.log(`   ✓ ${model.name} (${model.size}) - ${model.description}`)
    }

    console.log(`📊 总计大小: ${totalSize.toFixed(1)}GB`)

    return recommended.map((m) => m.name)
  }

  // 主要安装流程
  public async install(): Promise<void> {
    console.log("🚀 Ollama模型安装器")
    console.log("=".repeat(50))

    // 检查Ollama可用性
    if (!this.checkOllamaAvailable()) {
      console.log("❌ Ollama未安装或不可用")
      console.log("   请先安装Ollama: https://ollama.ai/")
      return
    }

    // 检查服务状态
    const isServiceRunning = await this.checkOllamaService()
    if (!isServiceRunning) {
      console.log("❌ Ollama服务未运行")
      console.log("   请启动服务: ollama serve")
      return
    }

    console.log("✅ Ollama服务正常运行")

    // 获取已安装模型
    const installedModels = this.getInstalledModels()
    console.log(`📦 已安装模型: ${installedModels.length}个`)

    if (installedModels.length > 0) {
      console.log("   已安装:")
      installedModels.forEach((model) => console.log(`     - ${model}`))
    }

    // 显示可用模型
    this.displayModelInfo()

    // 选择要安装的模型
    const modelsToInstall = await this.selectModelsInteractively()

    // 过滤已安装的模型
    const newModels = modelsToInstall.filter((model) => !installedModels.includes(model))

    if (newModels.length === 0) {
      console.log("✅ 所有推荐模型已安装")
      return
    }

    console.log(`\n🔄 准备安装 ${newModels.length} 个新模型...`)

    // 安装模型
    const results: Array<{ model: string; success: boolean }> = []

    for (const model of newModels) {
      const success = await this.installModel(model)
      results.push({ model, success })

      if (success) {
        // 测试模型
        await this.testModel(model)
      }

      console.log("") // 空行分隔
    }

    // 安装结果统计
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log("\n📊 安装结果:")
    console.log("=".repeat(30))
    console.log(`✅ 成功: ${successful}个`)
    console.log(`❌ 失败: ${failed}个`)

    if (failed > 0) {
      console.log("\n❌ 安装失败的模型:")
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`   - ${r.model}`)
        })
    }

    // 最终建议
    console.log("\n🎉 模型安装完成!")
    console.log("\n💡 使用建议:")
    console.log("   - 轻量任务使用: llama3.2:1b")
    console.log("   - 中文对话使用: qwen2.5:1.5b")
    console.log("   - 代码生成使用: codellama:7b")

    console.log("\n🔧 环境变量配置:")
    console.log("   NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434")

    console.log("\n🚀 现在可以启动应用:")
    console.log("   npm run dev")
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const installer = new OllamaModelInstaller()
  installer.install()
}

export { OllamaModelInstaller }
