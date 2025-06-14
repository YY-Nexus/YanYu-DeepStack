"use client"

import { motion } from "framer-motion"
import { type ModuleType, moduleConfigs } from "@/types/modules"
import { BrandLogo } from "@/components/ui/brand-logo"
import { BrandCard } from "@/components/ui/brand-card"

interface SidebarProps {
  activeModule: ModuleType
  onModuleChange: (module: ModuleType) => void
}

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <div className="w-64 h-full bg-white/90 backdrop-blur-md border-r border-gray-200/50 shadow-xl">
      {/* Logo区域 */}
      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-br from-cloud-blue-50 to-mint-green/10">
        <BrandLogo context="sidebar" interactive={true} className="w-full flex justify-center" />
      </div>

      {/* 导航菜单 */}
      <nav className="p-4 space-y-2">
        {moduleConfigs.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <BrandCard
              variant={activeModule === module.id ? "glass" : "default"}
              hover={true}
              className={`cursor-pointer transition-all duration-300 ${
                activeModule === module.id
                  ? `border-l-4 border-cloud-blue-500 bg-gradient-to-r from-cloud-blue-50 to-transparent shadow-glow`
                  : "hover:bg-gray-50"
              }`}
              onClick={() => onModuleChange(module.id)}
            >
              <div className="p-3">
                <div className="flex items-center space-x-3">
                  <motion.span
                    className="text-2xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {module.icon}
                  </motion.span>
                  <div>
                    <h3
                      className={`font-medium transition-colors ${
                        activeModule === module.id ? "text-cloud-blue-600" : "text-gray-700"
                      }`}
                    >
                      {module.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                  </div>
                </div>
              </div>
            </BrandCard>
          </motion.div>
        ))}
      </nav>

      {/* 底部信息 */}
      <div className="absolute bottom-4 left-4 right-4">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <BrandCard variant="glass" className="text-center">
            <div className="p-3">
              <p className="text-xs text-gray-600 font-medium">言枢象限·语启未来</p>
              <div className="mt-2 flex justify-center space-x-1">
                {[1, 2, 3].map((dot) => (
                  <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-cloud-blue-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: dot * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </BrandCard>
        </motion.div>
      </div>
    </div>
  )
}
