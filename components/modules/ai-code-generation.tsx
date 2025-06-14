"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Code, Copy, Save, Star, Download, Play, Sparkles } from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"

export default function AICodeGeneration() {
  const [prompt, setPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [language, setLanguage] = useState("python")

  // 模拟代码生成
  const handleGenerate = async () => {
    setIsGenerating(true)
    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 模拟生成的代码
    const sampleCode = `# ${prompt || "生成的代码示例"}
def bubble_sort(arr):
    """
    冒泡排序算法实现
    时间复杂度: O(n²)
    空间复杂度: O(1)
    """
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# 使用示例
if __name__ == "__main__":
    numbers = [64, 34, 25, 12, 22, 11, 90]
    print("原始数组:", numbers)
    sorted_numbers = bubble_sort(numbers.copy())
    print("排序后数组:", sorted_numbers)`

    setGeneratedCode(sampleCode)
    setIsGenerating(false)
  }

  const models = [
    { id: "gpt-4", name: "GPT-4", status: "在线", color: "success" },
    { id: "claude-3", name: "Claude-3", status: "在线", color: "success" },
    { id: "llama3", name: "Llama3", status: "在线", color: "success" },
    { id: "qwen2", name: "Qwen2", status: "维护中", color: "warning" },
    { id: "codellama", name: "CodeLlama", status: "离线", color: "error" },
  ]

  const languages = ["python", "javascript", "typescript", "java", "cpp", "go", "rust", "php"]

  return (
    <div className="h-full">
      <BrandCard variant="glass" className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 头部标题区 */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-cloud-blue-50 to-mint-green/10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-xl flex items-center justify-center shadow-glow">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                  <span>AI代码生成</span>
                  <Sparkles className="h-5 w-5 text-cloud-blue-500" />
                </h2>
                <p className="text-gray-600">通过自然语言描述生成高质量代码</p>
              </div>
            </motion.div>
          </div>

          {/* 主要内容区 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 左侧输入区 */}
            <div className="w-1/2 p-6 border-r border-gray-200/50">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="h-full flex flex-col space-y-4"
              >
                {/* 模型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择AI模型</label>
                  <div className="relative">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50 focus:border-cloud-blue-500 bg-white"
                    >
                      {models.map((model) => (
                        <option key={model.id} value={model.id} disabled={model.status !== "在线"}>
                          {model.name} - {model.status}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                      {models.map(
                        (model) =>
                          model.id === selectedModel && (
                            <BrandBadge key={model.id} variant={model.color as any} size="sm">
                              {model.status}
                            </BrandBadge>
                          ),
                      )}
                    </div>
                  </div>
                </div>

                {/* 编程语言选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">目标语言</label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <motion.button
                        key={lang}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 ${
                          language === lang
                            ? "bg-cloud-blue-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {lang}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 提示词输入 */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">描述你的需求</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="例如：生成一个Python冒泡排序算法，包含详细注释和使用示例"
                    className="w-full h-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50 focus:border-cloud-blue-500 bg-white"
                  />
                </div>

                {/* 生成按钮 */}
                <BrandButton
                  variant="gradient"
                  size="lg"
                  onClick={handleGenerate}
                  loading={isGenerating}
                  disabled={!prompt.trim()}
                  icon={<Play className="h-4 w-4" />}
                  className="w-full"
                >
                  {isGenerating ? "生成中..." : "生成代码"}
                </BrandButton>
              </motion.div>
            </div>

            {/* 右侧代码展示区 */}
            <div className="w-1/2 p-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="h-full flex flex-col"
              >
                {/* 操作栏 */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">生成结果</h3>
                  {generatedCode && (
                    <div className="flex space-x-2">
                      <BrandButton variant="outline" size="sm" icon={<Copy className="h-4 w-4" />}>
                        复制
                      </BrandButton>
                      <BrandButton variant="outline" size="sm" icon={<Save className="h-4 w-4" />}>
                        保存
                      </BrandButton>
                      <BrandButton variant="outline" size="sm" icon={<Star className="h-4 w-4" />}>
                        评分
                      </BrandButton>
                      <BrandButton variant="outline" size="sm" icon={<Download className="h-4 w-4" />}>
                        导出
                      </BrandButton>
                    </div>
                  )}
                </div>

                {/* 代码显示区 */}
                <BrandCard variant="outlined" className="flex-1 overflow-hidden">
                  {generatedCode ? (
                    <motion.pre
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full p-4 text-sm text-green-400 font-mono overflow-auto bg-gray-900 rounded-lg"
                    >
                      <code>{generatedCode}</code>
                    </motion.pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        </motion.div>
                        <p>在左侧输入需求描述，点击生成代码</p>
                      </div>
                    </div>
                  )}
                </BrandCard>

                {/* 质量评分显示 */}
                {generatedCode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4"
                  >
                    <BrandCard variant="glass">
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">代码质量评分</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <motion.div
                                  key={star}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: star * 0.1 }}
                                >
                                  <Star
                                    className={`h-4 w-4 ${
                                      star <= 4 ? "text-lemon-yellow fill-current" : "text-gray-300"
                                    }`}
                                  />
                                </motion.div>
                              ))}
                            </div>
                            <BrandBadge variant="success" size="sm">
                              4.2/5.0
                            </BrandBadge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">代码结构清晰，注释完整，建议添加异常处理</p>
                      </div>
                    </BrandCard>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </BrandCard>
    </div>
  )
}
