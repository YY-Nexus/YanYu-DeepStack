"use client"

import { motion } from "framer-motion"
import { type ModuleType, moduleConfigs } from "@/types/modules"
import AICodeGeneration from "@/components/modules/ai-code-generation"
import AppDevelopment from "@/components/modules/app-development"
import RealTimePreview from "@/components/modules/real-time-preview"
import AutomationProduction from "@/components/modules/automation-production"
import FileReview from "@/components/modules/file-review"
import ScoreAnalysis from "@/components/modules/score-analysis"
import DeploymentManagement from "@/components/modules/deployment-management"

interface MainContentProps {
  activeModule: ModuleType
}

export default function MainContent({ activeModule }: MainContentProps) {
  // 根据激活的模块渲染对应组件
  const renderModuleContent = () => {
    switch (activeModule) {
      case "ai-code-generation":
        return <AICodeGeneration />
      case "app-development":
        return <AppDevelopment />
      case "real-time-preview":
        return <RealTimePreview />
      case "automation-production":
        return <AutomationProduction />
      case "file-review":
        return <FileReview />
      case "score-analysis":
        return <ScoreAnalysis />
      case "deployment-management":
        return <DeploymentManagement />
      default:
        return <DefaultModuleView activeModule={activeModule} />
    }
  }

  return (
    <div className="p-6 min-h-full">
      <motion.div
        key={activeModule} // 关键：模块切换时重新动画
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        {renderModuleContent()}
      </motion.div>
    </div>
  )
}

// 默认模块视图组件（用于尚未实现的模块）
function DefaultModuleView({ activeModule }: { activeModule: ModuleType }) {
  const moduleConfig = moduleConfigs.find((m) => m.id === activeModule)

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 h-full">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-6xl mb-4"
        >
          {moduleConfig?.icon}
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{moduleConfig?.name}</h2>
        <p className="text-gray-600 text-lg">{moduleConfig?.description}</p>
      </div>

      {/* 功能预览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "核心功能", desc: "主要功能模块正在开发中" },
          { title: "智能辅助", desc: "AI驱动的智能化操作" },
          { title: "实时反馈", desc: "即时的操作结果展示" },
          { title: "数据分析", desc: "深度的数据洞察分析" },
          { title: "自动化", desc: "流程自动化处理" },
          { title: "协作共享", desc: "团队协作与分享功能" },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`bg-gradient-to-br from-white to-${moduleConfig?.color}/10 p-6 rounded-lg shadow-md hover-lift card-3d cursor-pointer`}
          >
            <div
              className={`w-12 h-12 bg-gradient-to-r from-${moduleConfig?.color} to-${moduleConfig?.color}/70 rounded-lg mb-4 flex items-center justify-center`}
            >
              <span className="text-white text-xl">✨</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.desc}</p>
            <div className="mt-4 text-xs text-gray-400">即将上线</div>
          </motion.div>
        ))}
      </div>

      {/* 开发进度指示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-coral-pink/10 to-mint-green/10 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-lemon-yellow rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">模块开发中，敬请期待</span>
        </div>
      </motion.div>
    </div>
  )
}
