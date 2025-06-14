"use client"

import { motion } from "framer-motion"
import { CloudOff, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BrandLogo } from "@/components/ui/brand-logo"

export default function OfflinePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud-blue-50 via-white to-mint-green/20 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="mb-6">
          <BrandLogo variant="default" size="lg" />
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CloudOff className="w-12 h-12 text-gray-400" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">您当前处于离线状态</h1>
        <p className="text-gray-600 mb-8">
          无法连接到互联网。请检查您的网络连接，然后重试。部分功能在离线模式下仍然可用。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-cloud-blue-500 hover:bg-cloud-blue-600"
          >
            <RefreshCw className="w-4 h-4" />
            重新连接
          </Button>
          <Button onClick={() => router.push("/")} variant="outline" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            返回主页
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>离线模式下可用功能：</p>
          <ul className="mt-2 space-y-1">
            <li>• 查看已缓存的项目</li>
            <li>• 使用本地模型</li>
            <li>• 编辑离线文档</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
