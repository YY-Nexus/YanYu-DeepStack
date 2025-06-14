"use client"

import { motion } from "framer-motion"
import { Rocket } from "lucide-react"

export default function DeploymentManagement() {
  return (
    <div className="h-full bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-mint-green to-sky-blue rounded-full flex items-center justify-center mx-auto mb-6">
          <Rocket className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">部署管理模块</h2>
        <p className="text-gray-600 text-lg mb-8">多环境部署控制</p>
        <div className="bg-gradient-to-r from-mint-green/10 to-sky-blue/10 p-6 rounded-lg">
          <p className="text-gray-700">🚧 功能开发中，即将上线</p>
        </div>
      </motion.div>
    </div>
  )
}
