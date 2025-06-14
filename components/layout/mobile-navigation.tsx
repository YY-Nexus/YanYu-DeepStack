"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, User, Settings } from "lucide-react"
import { type ModuleType, moduleConfigs } from "@/types/modules"
import { BrandLogo } from "@/components/ui/brand-logo"
import { BrandButton } from "@/components/ui/brand-button"

interface MobileNavigationProps {
  activeModule: ModuleType
  onModuleChange: (module: ModuleType) => void
  isOpen: boolean
  onToggle: () => void
}

export default function MobileNavigation({ activeModule, onModuleChange, isOpen, onToggle }: MobileNavigationProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // 滑动手势检测
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && isOpen) {
      onToggle() // 向左滑动关闭菜单
    }
    if (isRightSwipe && !isOpen) {
      onToggle() // 向右滑动打开菜单
    }
  }

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <>
      {/* 移动端顶部导航栏 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <BrandButton variant="ghost" size="sm" onClick={onToggle}>
            <Menu className="h-5 w-5" />
          </BrandButton>

          <BrandLogo context="topbar" />

          <div className="flex items-center space-x-2">
            <BrandButton variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </BrandButton>
            <BrandButton variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </BrandButton>
          </div>
        </div>
      </div>

      {/* 遮罩层 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* 侧边菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-80 bg-white shadow-2xl"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="h-full flex flex-col">
              {/* 头部 */}
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-br from-cloud-blue-50 to-mint-green/10">
                <div className="flex items-center justify-between mb-4">
                  <BrandLogo context="sidebar" />
                  <BrandButton variant="ghost" size="sm" onClick={onToggle}>
                    <X className="h-5 w-5" />
                  </BrandButton>
                </div>
                <p className="text-sm text-gray-600">万象归元于云枢，深栈智启新纪元</p>
              </div>

              {/* 导航菜单 */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {moduleConfigs.map((module, index) => (
                  <motion.button
                    key={module.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => {
                      onModuleChange(module.id)
                      onToggle()
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                      activeModule === module.id
                        ? "bg-gradient-to-r from-cloud-blue-50 to-transparent border-l-4 border-cloud-blue-500 shadow-md"
                        : "hover:bg-gray-50"
                    }`}
                  >
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
                        <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </nav>

              {/* 底部操作 */}
              <div className="p-4 border-t border-gray-200/50">
                <div className="grid grid-cols-2 gap-2">
                  <BrandButton variant="outline" size="sm" icon={<Settings className="h-4 w-4" />}>
                    设置
                  </BrandButton>
                  <BrandButton variant="outline" size="sm" icon={<User className="h-4 w-4" />}>
                    账户
                  </BrandButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
