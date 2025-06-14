#!/usr/bin/env node

/**
 * 中文优化AI模型安装脚本
 * 专门安装和配置适合中文编程的AI模型
 */

import { execSync, spawn } from "child_process"
import { createWriteStream, existsSync } from "fs"
import { mkdir } from "fs/promises"

interface ChineseModel {
  name: string
  displayName: string
  description: string
  size: string
  sizeGB: number
  category: "lightweight" | "balanced" | "powerful"
  chineseOptimized: boolean
  codingCapability: "basic" | "good" | "excellent"
  priority: number
  recommended: boolean
  downloadUrl?: string
  requirements: {
    minRAM: number // GB
    minDisk: number // GB
    recommendedRAM: number // GB
  }
}

class ChineseModelInstaller {
  private models: ChineseModel[] = [
    {
      name: "qwen2.5:0.5b",
      displayName: "Qwen2.5 0.5B",
      description: "超轻量级中文模型，适合资源受限环境",
      size: "0.4GB",
      sizeGB: 0.4,
      category: "lightweight",
      chineseOptimized: true,
      codingCapability: "basic",
      priority: 1,
      recommended: true,
      requirements: {
        minRAM: 1,
        minDisk: 1,
        recommendedRAM: 2,
      },
    },
    {
      name: "qwen2.5:1.5b",
      displayName: "Qwen2.5 1.5B",
      description: "轻量级中文编程模型，平衡性能与资源消耗",
      size: "0.9GB",
      sizeGB: 0.9,
      category: "lightweight",
      chineseOptimized: true,
      codingCapability: "good",
      priority: 2,
      recommended: true,
      requirements: {
        minRAM: 2,
        minDisk: 2,
        recommendedRAM: 4,
      },
    },
    {
      name: "qwen2.5:3b",
      displayName: "Qwen2.5 3B",
      description: "中等规模中文模型，优秀的代码生成能力",
      size: "1.9GB",
      sizeGB: 1.9,
      category: "balanced",
      chineseOptimized: true,
      codingCapability: "excellent",
      priority: 3,
      recommended: true,
      requirements: {
        minRAM: 4,
        minDisk: 3,
        recommendedRAM: 6,
      },
    },
    {
      name: "qwen2.5:7b",
      displayName: "Qwen2.5 7B",
      description: "高性能中文编程模型，专业级代码生成",
      size: "4.4GB",
      sizeGB: 4.4,
      category: "balanced",
      chineseOptimized: true,
      codingCapability: "excellent",
      priority: 4,
      recommended: true,
      requirements: {
        minRAM: 8,
        minDisk: 6,
        recommendedRAM: 12,
      },
    },
    {
      name: "qwen2.5:14b",
      displayName: "Qwen2.5 14B",
      description: "大规模中文模型，顶级编程和推理能力",
      size: "8.2GB",
      sizeGB: 8.2,
      category: "powerful",
      chineseOptimized: true,
      codingCapability: "excellent",
      priority: 5,
      recommended: false,
      requirements: {
        minRAM: 16,
        minDisk: 10,
        recommendedRAM: 24,
      },
    },
    {
      name: "qwen2.5-coder:1.5b",
      displayName: "Qwen2.5-Coder 1.5B",
      description: "专门的中文代码生成模型，轻量高效",
      size: "0.9GB",
      sizeGB: 0.9,
      category: "lightweight",
      chineseOptimized: true,
      codingCapability: "excellent",
      priority: 6,
      recommended: true,
      requirements: {
        minRAM: 2,
        minDisk: 2,
        recommendedRAM: 4,
      },
    },
    {
      name: "qwen2.5-coder:7b",
      displayName: "Qwen2.5-Coder 7B",
      description: "专业中文代码生成模型，支持多种编程语言",
      size: "4.4GB",
      sizeGB: 4.4,
      category: "balanced",
      chineseOptimized: true,
      codingCapability: "excellent",
      priority: 7,
      recommended: true,
      requirements: {
        minRAM: 8,
        minDisk: 6,
        recommendedRAM: 12,
      },
    },
    {
      name: "deepseek-coder:1.3b",
      displayName: "DeepSeek-Coder 1.3B",
      description: "轻量级代码专用模型，支持中文注释",
      size: "0.7GB",
      sizeGB: 0.7,
      category: "lightweight",
      chineseOptimized: true,
      codingCapability: "excellent",
      priority: 8,
      recommended: false,
      requirements: {
        minRAM: 2,
        minDisk: 1,
        recommendedRAM: 3,
      },
    },
    {
      name: "deepseek-coder:6.7b",
      displayName: "DeepSeek-Coder 6.7B",
      description: "高性能代码生成模型，优秀的中文编程能力",
      size: "3.8GB",
      sizeGB: 3.8,
      category: "balanced",
      chineseOptimized: true,
      codingCapability: "excellent",
      priority: 9,
      recommended: false,
      requirements: {
        minRAM: 8,
        minDisk: 5,
        recommendedRAM: 10,
      },
    },
  ]

  private logFile: string
  private installationLog: string[] = []

  constructor() {
    this.logFile = `./logs/chinese-models-install-${new Date().toISOString().slice(0, 10)}.log`
    this.ensureLogDirectory()
  }

  // 确保日志目录存在
  private async ensureLogDirectory(): Promise<void> {
    try {
      if (!existsSync("./logs")) {
        await mkdir("./logs", { recursive: true })
      }
    } catch (error) {
      console.warn("创建日志目录失败:", error)
    }
  }

  // 记录日志
  private log(message: string, level: "info" | "warn" | "error" = "info"): void {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`

    console.log(logMessage)
    this.installationLog.push(logMessage)

    // 写入文件
    try {
      const stream = createWriteStream(this.logFile, { flags: "a" })
      stream.write(logMessage + "\n")
      stream.end()
    } catch (error) {
      // 忽略文件写入错误
    }
  }

  // 检查系统资源
  private async checkSystemResources(): Promise<{
    totalRAM: number
    availableRAM: number
    availableDisk: number
  }> {
    try {
      // 检查内存
      const memInfo = execSync("free -g", { encoding: "utf-8" })
      const memLines = memInfo.split("\n")
      const memLine = memLines[1].split(/\s+/)
      const totalRAM = Number.parseInt(memLine[1]) || 8 // 默认8GB
      const availableRAM = Number.parseInt(memLine[6]) || 4 // 默认4GB

      // 检查磁盘空间
      const diskInfo = execSync("df -BG .", { encoding: "utf-8" })
      const diskLines = diskInfo.split("\n")
      const diskLine = diskLines[1].split(/\s+/)
      const availableDisk = Number.parseInt(diskLine[3].replace("G", "")) || 10 // 默认10GB

      return { totalRAM, availableRAM, availableDisk }
    } catch (error) {
      this.log(`获取系统资源信息失败: ${error}`, "warn")
      // 返回保守估计值
      return { totalRAM: 8, availableRAM: 4, availableDisk: 10 }
    }
  }

  // 检查Ollama服务状态
  private async checkOllamaService(): Promise<boolean> {
    try {
      const response = await fetch("http://localhost:11434/api/tags", {
        signal: AbortSignal.timeout(5000),
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

  // 推荐模型选择
  private recommendModels(systemResources: {
    totalRAM: number
    availableRAM: number
    availableDisk: number
  }): ChineseModel[] {
    const { availableRAM, availableDisk } = systemResources
    const recommended: ChineseModel[] = []

    this.log(`系统资源: RAM ${availableRAM}GB, 磁盘 ${availableDisk}GB`)

    // 按优先级排序
    const sortedModels = [...this.models].sort((a, b) => a.priority - b.priority)

    let totalSize = 0
    for (const model of sortedModels) {
      // 检查资源要求
      if (
        model.requirements.minRAM <= availableRAM &&
        model.requirements.minDisk + totalSize <= availableDisk * 0.8 // 保留20%空间
      ) {
        recommended.push(model)
        totalSize += model.sizeGB

        // 优先安装推荐模型
        if (model.recommended && recommended.length >= 3) {
          break
        }
      }
    }

    return recommended
  }

  // 显示模型信息
  private displayModelInfo(): void {
    console.log("\n🤖 中文优化AI模型列表")
    console.log("=" * 80)

    const categories = ["lightweight", "balanced", "powerful"]
    const categoryNames = {
      lightweight: "🚀 轻量级模型 (适合开发测试)",
      balanced: "⚖️ 平衡型模型 (推荐生产使用)",
      powerful: "💪 强力模型 (高性能需求)",
    }

    for (const category of categories) {
      console.log(`\n${categoryNames[category as keyof typeof categoryNames]}:`)

      const categoryModels = this.models.filter((m) => m.category === category)
      for (const model of categoryModels) {
        const badge = model.recommended ? "⭐" : "  "
        const chinese = model.chineseOptimized ? "🇨🇳" : "  "
        const coding = model.codingCapability === "excellent" ? "💻" : model.codingCapability === "good" ? "📝" : "📄"

        console.log(
          `  ${badge}${chinese}${coding} ${model.displayName.padEnd(25)} ${model.size.padEnd(8)} ${model.description}`,
        )
        console.log(`      内存需求: ${model.requirements.minRAM}GB (推荐: ${model.requirements.recommendedRAM}GB)`)
      }
    }

    console.log("\n📖 图例:")
    console.log("  ⭐ 推荐安装  🇨🇳 中文优化  💻 代码专家  📝 代码良好  📄 代码基础")
  }

  // 安装单个模型
  private async installModel(model: ChineseModel): Promise<boolean> {
    this.log(`开始安装模型: ${model.displayName} (${model.name})`)

    try {
      // 创建进度显示
      console.log(`\n📦 正在安装: ${model.displayName}`)
      console.log(`   大小: ${model.size}`)
      console.log(`   描述: ${model.description}`)

      // 使用spawn来实时显示进度
      const child = spawn("ollama", ["pull", model.name], {
        stdio: ["inherit", "pipe", "pipe"],
      })

      let output = ""
      let lastProgress = ""

      child.stdout?.on("data", (data) => {
        const text = data.toString()
        output += text

        // 解析进度信息
        const lines = text.split("\n")
        for (const line of lines) {
          if (line.includes("pulling") || line.includes("downloading") || line.includes("%")) {
            if (line !== lastProgress) {
              process.stdout.write(`\r   ${line.trim()}`)
              lastProgress = line
            }
          }
        }
      })

      child.stderr?.on("data", (data) => {
        const text = data.toString()
        if (!text.includes("pulling") && !text.includes("downloading")) {
          console.error(`   错误: ${text}`)
        }
      })

      // 等待安装完成
      const exitCode = await new Promise<number>((resolve) => {
        child.on("close", resolve)
      })

      if (exitCode === 0) {
        console.log(`\n✅ ${model.displayName} 安装成功`)
        this.log(`模型安装成功: ${model.name}`)

        // 测试模型
        await this.testModel(model)
        return true
      } else {
        console.log(`\n❌ ${model.displayName} 安装失败 (退出码: ${exitCode})`)
        this.log(`模型安装失败: ${model.name}, 退出码: ${exitCode}`, "error")
        return false
      }
    } catch (error) {
      console.log(`\n❌ ${model.displayName} 安装异常`)
      this.log(`模型安装异常: ${model.name}, 错误: ${error}`, "error")
      return false
    }
  }

  // 测试模型
  private async testModel(model: ChineseModel): Promise<boolean> {
    console.log(`🧪 测试模型: ${model.displayName}`)

    try {
      const testPrompts = ["你好，请用一句话介绍自己", "用Python写一个Hello World程序", "解释什么是递归算法"]

      const randomPrompt = testPrompts[Math.floor(Math.random() * testPrompts.length)]

      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model.name,
          prompt: randomPrompt,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000), // 30秒超时
      })

      if (response.ok) {
        const data = await response.json()
        if (data.response && data.response.length > 10) {
          console.log(`✅ 模型测试成功`)
          console.log(`   提问: ${randomPrompt}`)
          console.log(`   回答: ${data.response.substring(0, 100)}...`)
          this.log(`模型测试成功: ${model.name}`)
          return true
        }
      }
    } catch (error) {
      this.log(`模型测试失败: ${model.name}, 错误: ${error}`, "warn")
    }

    console.log(`⚠️ 模型测试未通过，但安装可能成功`)
    return false
  }

  // 配置环境变量
  private configureEnvironment(installedModels: string[]): void {
    console.log("\n🔧 环境配置建议:")
    console.log("=" * 50)

    // 推荐默认模型
    const defaultModel = installedModels.find((m) => m.includes("qwen2.5:1.5b")) || installedModels[0]

    if (defaultModel) {
      console.log(`建议设置默认模型: ${defaultModel}`)
      console.log(`在 .env.local 中添加:`)
      console.log(`NEXT_PUBLIC_DEFAULT_MODEL=${defaultModel}`)
    }

    // 显示所有已安装的中文模型
    console.log(`\n已安装的中文优化模型:`)
    installedModels.forEach((model, index) => {
      console.log(`  ${index + 1}. ${model}`)
    })
  }

  // 生成使用指南
  private generateUsageGuide(installedModels: string[]): void {
    console.log("\n📚 使用指南:")
    console.log("=" * 40)

    console.log("1. 代码生成示例:")
    console.log(`   curl -X POST http://localhost:11434/api/generate \\`)
    console.log(`     -H "Content-Type: application/json" \\`)
    console.log(`     -d '{`)
    console.log(`       "model": "${installedModels[0] || "qwen2.5:1.5b"}",`)
    console.log(`       "prompt": "用Python写一个快速排序算法，添加中文注释",`)
    console.log(`       "stream": false`)
    console.log(`     }'`)

    console.log("\n2. 在DeepStack中使用:")
    console.log("   - 访问: http://localhost:3000/modules/deepstack-generator")
    console.log("   - 选择中文优化模型")
    console.log("   - 输入编程需求，获得中文注释的代码")

    console.log("\n3. 模型性能对比:")
    installedModels.forEach((model) => {
      const modelInfo = this.models.find((m) => m.name === model)
      if (modelInfo) {
        console.log(`   ${model}:`)
        console.log(
          `     - 适用场景: ${modelInfo.category === "lightweight" ? "快速开发" : modelInfo.category === "balanced" ? "生产环境" : "高性能需求"}`,
        )
        console.log(`     - 代码能力: ${modelInfo.codingCapability}`)
        console.log(`     - 内存需求: ${modelInfo.requirements.recommendedRAM}GB`)
      }
    })
  }

  // 主安装流程
  public async install(): Promise<void> {
    console.log("🤖 中文优化AI模型安装器")
    console.log("=" * 60)
    console.log("专为中文编程和DeepStack优化")

    this.log("开始中文模型安装流程")

    // 1. 检查Ollama服务
    console.log("\n🔍 检查系统环境...")
    const isOllamaRunning = await this.checkOllamaService()
    if (!isOllamaRunning) {
      console.log("❌ Ollama服务未运行")
      console.log("请先启动Ollama服务:")
      console.log("  ollama serve")
      this.log("Ollama服务未运行，安装中止", "error")
      return
    }
    console.log("✅ Ollama服务正常")

    // 2. 检查系统资源
    const systemResources = await this.checkSystemResources()
    console.log(`✅ 系统资源检查完成`)
    console.log(`   内存: ${systemResources.availableRAM}GB 可用 / ${systemResources.totalRAM}GB 总计`)
    console.log(`   磁盘: ${systemResources.availableDisk}GB 可用`)

    // 3. 获取已安装模型
    const installedModels = this.getInstalledModels()
    console.log(`📦 已安装模型: ${installedModels.length}个`)

    // 4. 显示可用模型
    this.displayModelInfo()

    // 5. 推荐模型
    const recommendedModels = this.recommendModels(systemResources)
    console.log(`\n🎯 根据您的系统配置，推荐安装以下模型:`)

    let totalSize = 0
    recommendedModels.forEach((model, index) => {
      totalSize += model.sizeGB
      console.log(`   ${index + 1}. ${model.displayName} (${model.size})`)
      console.log(`      ${model.description}`)
    })
    console.log(`📊 总计大小: ${totalSize.toFixed(1)}GB`)

    // 6. 过滤未安装的模型
    const modelsToInstall = recommendedModels.filter((model) => !installedModels.includes(model.name))

    if (modelsToInstall.length === 0) {
      console.log("\n✅ 所有推荐的中文模型已安装")
      this.configureEnvironment(installedModels.filter((m) => this.models.some((model) => model.name === m)))
      this.generateUsageGuide(installedModels.filter((m) => this.models.some((model) => model.name === m)))
      return
    }

    console.log(`\n🚀 准备安装 ${modelsToInstall.length} 个新模型...`)

    // 7. 开始安装
    const results: Array<{ model: ChineseModel; success: boolean }> = []

    for (const model of modelsToInstall) {
      const success = await this.installModel(model)
      results.push({ model, success })

      // 安装间隔
      if (modelsToInstall.indexOf(model) < modelsToInstall.length - 1) {
        console.log("\n⏳ 等待2秒后继续...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    // 8. 安装结果统计
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log("\n📊 安装结果统计:")
    console.log("=" * 40)
    console.log(`✅ 成功安装: ${successful}个`)
    console.log(`❌ 安装失败: ${failed}个`)

    if (successful > 0) {
      console.log("\n✅ 成功安装的模型:")
      results
        .filter((r) => r.success)
        .forEach((r) => {
          console.log(`   ✓ ${r.model.displayName} - ${r.model.description}`)
        })
    }

    if (failed > 0) {
      console.log("\n❌ 安装失败的模型:")
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`   ✗ ${r.model.displayName}`)
        })
    }

    // 9. 配置和使用指南
    const allInstalledModels = this.getInstalledModels()
    const chineseModels = allInstalledModels.filter((m) => this.models.some((model) => model.name === m))

    if (chineseModels.length > 0) {
      this.configureEnvironment(chineseModels)
      this.generateUsageGuide(chineseModels)
    }

    // 10. 完成提示
    console.log("\n🎉 中文优化模型安装完成!")
    console.log("\n🚀 下一步:")
    console.log("   1. 访问 DeepStack 代码生成器")
    console.log("   2. 选择中文优化模型")
    console.log("   3. 开始智能编程之旅!")

    this.log("中文模型安装流程完成")
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const installer = new ChineseModelInstaller()
  installer.install().catch((error) => {
    console.error("安装过程中发生错误:", error)
    process.exit(1)
  })
}

export { ChineseModelInstaller }
