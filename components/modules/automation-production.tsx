"use client"

import { motion } from "framer-motion"
import { Zap } from "lucide-react"

export default function AutomationProduction() {
  return (
    <div className="h-full bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-lemon-yellow to-coral-pink rounded-full flex items-center justify-center mx-auto mb-6">
          <Zap className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">自动化生产模块</h2>
        <p className="text-gray-600 text-lg mb-8">任务调度与自动化部署</p>
        <div className="bg-gradient-to-r from-lemon-yellow/10 to-coral-pink/10 p-6 rounded-lg">
          <p className="text-gray-700">🚧 功能开发中，即将上线</p>
        </div>
      </motion.div>
    </div>
  )
}
