"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Wrench, 
  Plus, 
  Eye, 
  Code, 
  Database, 
  Globe, 
  Smartphone, 
  Server,
  GitBranch,
  Play,
  Settings
} from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"

export default function AppDevelopment() {
  const [activeTab, setActiveTab] = useState("templates")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const templates = [
    {
      id: "react-app",
      name: "React Web应用",
      description: "现代化的React单页应用",
      tech: ["React", "TypeScript", "Tailwind CSS"],
      difficulty: "中级",
      time: "30分钟",
      color: "blue"
    },
    {
      id: "next-fullstack",
      name: "Next.js全栈应用",
      description: "带后端API的全栈应用",
      tech: ["Next.js", "Prisma", "PostgreSQL"],
      difficulty: "高级",
      time: "60分钟",
      color: "green"
    },
    {
      id: "mobile-app",
      name: "React Native移动应用",
      description: "跨平台移动应用开发",
      tech: ["React Native", "Expo", "Firebase"],
      difficulty: "中级",
      time: "45分钟",
      color: "purple"
    },
    {
      id: "api-service",
      name: "API微服务",
      description: "RESTful API微服务",
      tech: ["Node.js", "Express", "MongoDB"],
      difficulty: "初级",
      time: "20分钟",
      color: "orange"
    }
  ];

  const tools = [
    { icon: <Code className="h-5 w-5" />, name: "代码编辑器", status: "active" },
    { icon: <Database className="h-5 w-5" />, name: "数据库设计", status: "active" },
    { icon: <Globe className="h-5 w-5" />, name: "API管理", status: "active" },
    { icon: <Eye className="h-5 w-5" />, name: "实时预览", status: "active" },
    { icon: <GitBranch className="h-5 w-5" />, name: "版本控制", status: "coming" },
    { icon: <Server className="h-5 w-5" />, name: "部署管理", status: "coming" }
  ];

  const tabs = [
    { id: "templates", name: "模板库", icon: <Plus className="h-4 w-4" /> },
    { id: "tools", name: "开发工具", icon: <Wrench className="h-4 w-4" /> },
    { id: "projects", name: "我的项目", icon: <Code className="h-4 w-4" /> }
  ];

  return (
    <div className="h-full">
      <BrandCard variant="glass" className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-mint-green/10 to-sky-blue/10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-mint-green to-sky-blue rounded-xl flex items-center justify-center shadow-glow">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">应用开发模块</h2>
                <p className="text-gray-600">低代码可视化开发平台</p>
              </div>
            </motion.div>
          </div>

          {/* 导航标签 */}
          <div className="px-6 pt-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-mint-green shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 p-6 overflow-auto">
            {activeTab === "templates" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">选择项目模板</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        className="cursor-pointer"
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <BrandCard 
                          variant={selectedTemplate === template.id ? "glass" : "outlined"}
                          className={`p-4 transition-all duration-200 ${
                            selectedTemplate === template.id ? "ring-2 ring-mint-green" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">{template.name}</h4>
                            <BrandBadge variant={template.color as any} size="sm">
                              {template.difficulty}
                            </BrandBadge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {template.tech.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-700"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>预计时间: {template.time}</span>
                            {selectedTemplate === template.id && (
                              <BrandButton size="sm" variant="gradient">
                                使用模板
                              </BrandButton>
                            )}
                          </div>
                        </BrandCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "tools" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">开发工具箱</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tools.map((tool, index) => (
                      <motion.div
                        key={tool.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <BrandCard variant="outlined" className="p-4 text-center">
                          <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                            tool.status === "active" 
                              ? "bg-gradient-to-r from-mint-green to-sky-blue text-white" 
                              : "bg-gray-100 text-gray-400"
                          }`}>
                            {tool.icon}
                          </div>
                          <h4 className="font-medium text-gray-800 mb-2">{tool.name}</h4>
                          <BrandBadge 
                            variant={tool.status === "active" ? "success" : "warning"} 
                            size="sm"
                          >
                            {tool.status === "active" ? "可用" : "即将推出"}
                          </BrandBadge>
                        </BrandCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "projects" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无项目</h3>
                <p className="text-gray-600 mb-4">从模板开始创建你的第一个项目</p>
                <BrandButton 
                  variant="gradient" 
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => setActiveTab("templates")}
                >
                  创建新项目
                </BrandButton>
              </motion.div>
            )}
          </div>
        </div>
      </BrandCard>
    </div>
  )
}
