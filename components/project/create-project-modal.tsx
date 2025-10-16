"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Monitor, Smartphone, Server, Brain, FolderPlus } from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { useProjectStore } from "@/lib/project-store"
import type { Project } from "@/types/project"

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { createProject } = useProjectStore()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "web" as Project["type"],
    visibility: "private" as Project["visibility"],
    language: "javascript",
    framework: "react",
    tags: [] as string[],
    template: "",
  })
  const [isCreating, setIsCreating] = useState(false)

  const projectTypes = [
    {
      id: "web",
      name: "Web应用",
      description: "构建现代化的Web应用程序",
      icon: Monitor,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "mobile",
      name: "移动应用",
      description: "开发跨平台移动应用",
      icon: Smartphone,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "desktop",
      name: "桌面应用",
      description: "创建桌面应用程序",
      icon: Monitor,
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "api",
      name: "API服务",
      description: "构建RESTful API和微服务",
      icon: Server,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "ai-model",
      name: "AI模型",
      description: "开发和训练AI模型",
      icon: Brain,
      color: "from-pink-500 to-rose-500",
    },
  ]

  const frameworks = {
    web: [
      { id: "react", name: "React", description: "现代化的UI库" },
      { id: "vue", name: "Vue.js", description: "渐进式框架" },
      { id: "angular", name: "Angular", description: "企业级框架" },
      { id: "svelte", name: "Svelte", description: "编译时优化" },
      { id: "nextjs", name: "Next.js", description: "React全栈框架" },
    ],
    mobile: [
      { id: "react-native", name: "React Native", description: "跨平台移动开发" },
      { id: "flutter", name: "Flutter", description: "Google移动UI框架" },
      { id: "ionic", name: "Ionic", description: "混合移动应用" },
    ],
    desktop: [
      { id: "electron", name: "Electron", description: "跨平台桌面应用" },
      { id: "tauri", name: "Tauri", description: "轻量级桌面应用" },
      { id: "flutter-desktop", name: "Flutter Desktop", description: "Flutter桌面版" },
    ],
    api: [
      { id: "express", name: "Express.js", description: "Node.js Web框架" },
      { id: "fastapi", name: "FastAPI", description: "现代Python API框架" },
      { id: "spring", name: "Spring Boot", description: "Java企业级框架" },
      { id: "gin", name: "Gin", description: "Go Web框架" },
    ],
    "ai-model": [
      { id: "tensorflow", name: "TensorFlow", description: "机器学习平台" },
      { id: "pytorch", name: "PyTorch", description: "深度学习框架" },
      { id: "huggingface", name: "Hugging Face", description: "预训练模型库" },
    ],
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      await createProject({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: "active",
        visibility: formData.visibility,
        files: [],
        team: [],
        permissions: {
          read: [],
          write: [],
          admin: [],
          deploy: [],
          share: [],
        },
        currentVersion: "1.0.0",
        deployment: {
          platforms: [],
          environments: [],
          cicd: {
            enabled: false,
            provider: "github-actions",
            config: {},
            webhooks: [],
          },
          docker: {
            enabled: false,
            dockerfile: "",
            image: "",
            registry: "",
            buildArgs: {},
          },
        },
        aiConfig: {
          codeCompletion: {
            enabled: true,
            model: "gpt-4",
            suggestions: true,
            autoComplete: true,
          },
          codeReview: {
            enabled: true,
            autoReview: false,
            qualityThreshold: 0.8,
          },
          naturalLanguage: {
            enabled: true,
            model: "gpt-4",
            contextWindow: 4000,
          },
        },
      })

      onClose()
      setStep(1)
      setFormData({
        name: "",
        description: "",
        type: "web",
        visibility: "private",
        language: "javascript",
        framework: "react",
        tags: [],
        template: "",
      })
    } catch (error) {
      console.error("创建项目失败:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-auto"
          >
            <BrandCard variant="glass" className="overflow-hidden">
              <div className="p-6">
                {/* 头部 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-lg flex items-center justify-center">
                      <FolderPlus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">创建新项目</h2>
                      <p className="text-sm text-gray-600">步骤 {step} / 3</p>
                    </div>
                  </div>
                  <BrandButton variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </BrandButton>
                </div>

                {/* 进度条 */}
                <div className="mb-8">
                  <div className="flex items-center space-x-4">
                    {[1, 2, 3].map((stepNumber) => (
                      <div key={stepNumber} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            stepNumber <= step ? "bg-cloud-blue-500 text-white" : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {stepNumber}
                        </div>
                        {stepNumber < 3 && (
                          <div className={`w-16 h-1 mx-2 ${stepNumber < step ? "bg-cloud-blue-500" : "bg-gray-200"}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>基本信息</span>
                    <span>项目类型</span>
                    <span>配置选项</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* 步骤1: 基本信息 */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">项目名称 *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50 focus:border-cloud-blue-500"
                          placeholder="输入项目名称"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">项目描述</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50 focus:border-cloud-blue-500"
                          placeholder="描述您的项目..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">可见性</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: "private", name: "私有", description: "仅您可以访问" },
                            { id: "team", name: "团队", description: "团队成员可访问" },
                            { id: "public", name: "公开", description: "所有人可访问" },
                          ].map((visibility) => (
                            <motion.label
                              key={visibility.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.visibility === visibility.id
                                  ? "border-cloud-blue-500 bg-cloud-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="visibility"
                                value={visibility.id}
                                checked={formData.visibility === visibility.id}
                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                                className="sr-only"
                              />
                              <div className="text-center">
                                <h3 className="font-medium text-gray-800">{visibility.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{visibility.description}</p>
                              </div>
                            </motion.label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 步骤2: 项目类型 */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">选择项目类型</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {projectTypes.map((type) => {
                            const Icon = type.icon
                            return (
                              <motion.label
                                key={type.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                                  formData.type === type.id
                                    ? "border-cloud-blue-500 bg-cloud-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="type"
                                  value={type.id}
                                  checked={formData.type === type.id}
                                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                  className="sr-only"
                                />
                                <div className="text-center">
                                  <div
                                    className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center mx-auto mb-3`}
                                  >
                                    <Icon className="h-6 w-6 text-white" />
                                  </div>
                                  <h3 className="font-medium text-gray-800 mb-1">{type.name}</h3>
                                  <p className="text-sm text-gray-600">{type.description}</p>
                                </div>
                              </motion.label>
                            )
                          })}
                        </div>
                      </div>

                      {/* 框架选择 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">选择技术框架</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {frameworks[formData.type]?.map((framework) => (
                            <motion.label
                              key={framework.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.framework === framework.id
                                  ? "border-cloud-blue-500 bg-cloud-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="framework"
                                value={framework.id}
                                checked={formData.framework === framework.id}
                                onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                                className="sr-only"
                              />
                              <div>
                                <h3 className="font-medium text-gray-800">{framework.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{framework.description}</p>
                              </div>
                            </motion.label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 步骤3: 配置选项 */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">编程语言</label>
                        <select
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                          <option value="go">Go</option>
                          <option value="rust">Rust</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">项目标签</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-cloud-blue-100 text-cloud-blue-700 rounded-full text-sm flex items-center space-x-1"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="text-cloud-blue-500 hover:text-cloud-blue-700"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="添加标签..."
                            className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addTag((e.target as HTMLInputElement).value)
                                ;(e.target as HTMLInputElement).value = ""
                              }
                            }}
                          />
                          <BrandButton
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.querySelector(
                                'input[placeholder="添加标签..."]',
                              ) as HTMLInputElement
                              if (input?.value) {
                                addTag(input.value)
                                input.value = ""
                              }
                            }}
                          >
                            添加
                          </BrandButton>
                        </div>
                      </div>

                      {/* 项目模板 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">选择项目模板（可选）</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: "", name: "空白项目", description: "从头开始创建项目" },
                            { id: "starter", name: "快速启动", description: "包含基础配置和示例代码" },
                            { id: "full", name: "完整模板", description: "包含完整的项目结构和功能" },
                          ].map((template) => (
                            <motion.label
                              key={template.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.template === template.id
                                  ? "border-cloud-blue-500 bg-cloud-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="template"
                                value={template.id}
                                checked={formData.template === template.id}
                                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                                className="sr-only"
                              />
                              <div>
                                <h3 className="font-medium text-gray-800">{template.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                              </div>
                            </motion.label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 底部按钮 */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <div>
                      {step > 1 && (
                        <BrandButton type="button" variant="outline" onClick={() => setStep(step - 1)}>
                          上一步
                        </BrandButton>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <BrandButton type="button" variant="ghost" onClick={onClose}>
                        取消
                      </BrandButton>
                      {step < 3 ? (
                        <BrandButton
                          type="button"
                          variant="primary"
                          onClick={() => setStep(step + 1)}
                          disabled={step === 1 && !formData.name}
                        >
                          下一步
                        </BrandButton>
                      ) : (
                        <BrandButton
                          type="submit"
                          variant="gradient"
                          loading={isCreating}
                          icon={<FolderPlus className="h-4 w-4" />}
                        >
                          创建项目
                        </BrandButton>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </BrandCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
