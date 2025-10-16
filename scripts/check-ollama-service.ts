#!/usr/bin/env node

/**
 * Ollama服务检查和管理脚本
 * 检查Ollama服务状态，管理模型，提供故障排除
 */

import { execSync } from "child_process"

interface OllamaModel {
  name: string
  size: string
  modified: string
}

interface OllamaServiceInfo {
  isRunning: boolean
  version?: string
  models: OllamaModel[]
  url: string
}

class OllamaServiceChecker {
  private defaultUrl = "http://localhost:11434"

  // 检查Ollama是否已安装
  private checkOllamaInstallation(): boolean {
    try {
      const version = execSync("ollama --version", { encoding: "utf-8", stdio: "pipe" })
      console.log(`✅ Ollama已安装: ${version.trim()}`)
      return true
    } catch {
      console.log("❌ Ollama未安装")
      return false
    }
  }

  // 检查Ollama服务状态
  private async checkOllamaService(url: string = this.defaultUrl): Promise<boolean> {
    try {
      const response = await fetch(`${url}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      })
      return response.ok
    } catch {
      return false
    }
  }

  // 获取Ollama版本信息
  private async getOllamaVersion(url: string): Promise<string | null> {
    try {
      const response = await fetch(`${url}/api/version`, {
        signal: AbortSignal.timeout(3000),
      })
      if (response.ok) {
        const data = await response.json()
        return data.version
      }
    } catch {
      // 忽略错误
    }
    return null
  }

  // 获取已安装的模型列表
  private async getInstalledModels(url: string): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${url}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      })
      if (response.ok) {
        const data = await response.json()
        return data.models || []
      }
    } catch {
      // 忽略错误
    }
    return []
  }

  // 测试模型推理
  private async testModelInference(url: string, model: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt: "Hello",
          stream: false,
        }),
        signal: AbortSignal.timeout(10000),
      })
      return response.ok
    } catch {
      return false
    }
  }

  // 获取推荐模型列表
  private getRecommendedModels(): Array<{ name: string; description: string; size: string }> {
    return [
      {
        name: "llama3.2",
        description: "通用对话模型，适合日常交互",
        size: "2.0GB",
      },
      {
        name: "codellama",
        description: "专业代码生成模型",
        size: "3.8GB",
      },
      {
        name: "qwen2.5",
        description: "中文优化模型，支持中文对话",
        size: "4.4GB",
      },
      {
        name: "llama3.2:1b",
        description: "轻量级模型，快速响应",
        size: "1.3GB",
      },
      {
        name: "deepseek-coder",
        description: "深度代码理解模型",
        size: "6.9GB",
      },
    ]
  }

  // 提供安装指导
  private provideInstallationGuide(): void {
    console.log("\n📖 Ollama安装指南:")
    console.log("=".repeat(40))

    console.log("\n🖥️ 各平台安装方法:")
    console.log("  macOS:")
    console.log("    curl -fsSL https://ollama.ai/install.sh | sh")
    console.log("    或下载: https://ollama.ai/download/Ollama-darwin.zip")

    console.log("\n  Linux:")
    console.log("    curl -fsSL https://ollama.ai/install.sh | sh")

    console.log("\n  Windows:")
    console.log("    下载安装包: https://ollama.ai/download/OllamaSetup.exe")

    console.log("\n  Docker:")
    console.log("    docker run -d -p 11434:11434 --name ollama ollama/ollama")

    console.log("\n🚀 安装后启动服务:")
    console.log("    ollama serve")

    console.log("\n📦 下载推荐模型:")
    const recommended = this.getRecommendedModels()
    recommended.forEach((model) => {
      console.log(`    ollama pull ${model.name}  # ${model.description} (${model.size})`)
    })
  }

  // 提供故障排除指导
  private provideTroubleshootingGuide(): void {
    console.log("\n🔧 故障排除指南:")
    console.log("=".repeat(40))

    console.log("\n❓ 常见问题:")

    console.log("\n1. 服务无法启动:")
    console.log("   - 检查端口11434是否被占用: lsof -i :11434")
    console.log("   - 尝试指定不同端口: OLLAMA_HOST=0.0.0.0:11435 ollama serve")
    console.log("   - 检查防火墙设置")

    console.log("\n2. 模型下载失败:")
    console.log("   - 检查网络连接")
    console.log("   - 尝试使用代理: HTTPS_PROXY=http://proxy:port ollama pull model")
    console.log("   - 检查磁盘空间")

    console.log("\n3. 推理速度慢:")
    console.log("   - 使用GPU加速 (需要NVIDIA GPU)")
    console.log("   - 选择更小的模型")
    console.log("   - 增加系统内存")

    console.log("\n4. 内存不足:")
    console.log("   - 关闭其他应用程序")
    console.log("   - 使用更小的模型 (如 llama3.2:1b)")
    console.log("   - 调整模型参数")

    console.log("\n🔍 诊断命令:")
    console.log("   ollama list                    # 查看已安装模型")
    console.log("   ollama show model-name         # 查看模型详情")
    console.log("   ollama ps                      # 查看运行中的模型")
    console.log("   curl http://localhost:11434/api/tags  # 测试API")
  }

  // 主要检查流程
  public async check(): Promise<void> {
    console.log("🔍 Ollama服务检查")
    console.log("=".repeat(50))

    // 检查安装状态
    const isInstalled = this.checkOllamaInstallation()
    if (!isInstalled) {
      this.provideInstallationGuide()
      return
    }

    // 检查服务状态
    console.log("\n🔗 检查服务状态...")
    const isRunning = await this.checkOllamaService()

    if (!isRunning) {
      console.log("❌ Ollama服务未运行")
      console.log("\n🚀 启动服务:")
      console.log("   ollama serve")
      console.log("   或后台运行: nohup ollama serve > ollama.log 2>&1 &")

      this.provideTroubleshootingGuide()
      return
    }

    console.log("✅ Ollama服务正在运行")

    // 获取版本信息
    const version = await this.getOllamaVersion(this.defaultUrl)
    if (version) {
      console.log(`📦 服务版本: ${version}`)
    }

    // 获取模型列表
    console.log("\n📋 已安装模型:")
    const models = await this.getInstalledModels(this.defaultUrl)

    if (models.length === 0) {
      console.log("   ⚠️ 未安装任何模型")
      console.log("\n📦 推荐安装以下模型:")
      const recommended = this.getRecommendedModels()
      recommended.slice(0, 3).forEach((model) => {
        console.log(`   ollama pull ${model.name}  # ${model.description}`)
      })
    } else {
      for (const model of models) {
        console.log(`   ✅ ${model.name} (${model.size})`)

        // 测试模型推理
        console.log(`      🧪 测试推理...`)
        const canInfer = await this.testModelInference(this.defaultUrl, model.name)
        if (canInfer) {
          console.log(`      ✅ 推理正常`)
        } else {
          console.log(`      ❌ 推理失败`)
        }
      }
    }

    // 性能建议
    console.log("\n⚡ 性能优化建议:")
    if (models.length > 3) {
      console.log("   - 考虑删除不常用的模型以节省空间")
    }
    console.log("   - 使用GPU加速可显著提升性能")
    console.log("   - 根据用途选择合适大小的模型")

    // 环境变量建议
    console.log("\n🔧 环境变量配置:")
    console.log(`   NEXT_PUBLIC_OLLAMA_URL=${this.defaultUrl}`)

    console.log("\n🎉 Ollama服务检查完成!")
    console.log("   服务地址:", this.defaultUrl)
    console.log("   可用模型:", models.length)
    console.log("   状态: 正常运行")
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const checker = new OllamaServiceChecker()
  checker.check()
}

export { OllamaServiceChecker }
