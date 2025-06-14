"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, User, Settings, Bell, Menu, LogOut, UserCircle } from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { useAuth } from "@/components/auth/auth-provider"

interface TopBarProps {
  onToggleRightPanel: () => void
  showRightPanel: boolean
  onShowLogin: () => void
  user: any
}

export default function TopBar({ onToggleRightPanel, showRightPanel, onShowLogin, user }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { logout } = useAuth()

  return (
    <div className="h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* 左侧：移动端菜单按钮 + 搜索 */}
        <div className="flex items-center space-x-4 flex-1">
          <BrandButton variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </BrandButton>

          {/* 全局搜索 */}
          <motion.div initial={{ width: 200 }} whileFocus={{ width: 300 }} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索功能、项目或文档..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-50/80 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50 focus:border-cloud-blue-500 transition-all"
            />
          </motion.div>
        </div>

        {/* 右侧：环境切换 + 用户操作 */}
        <div className="flex items-center space-x-3">
          {/* 环境切换 */}
          <motion.select
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1.5 bg-mint-green/10 border border-mint-green/30 rounded-lg text-sm font-medium text-mint-green focus:outline-none focus:ring-2 focus:ring-mint-green/50"
          >
            <option value="local">本地环境</option>
            <option value="cloud">公有云</option>
            <option value="hybrid">混合云</option>
          </motion.select>

          {/* 通知按钮 */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <BrandButton variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-coral-pink rounded-full animate-pulse"></span>
            </BrandButton>
          </motion.div>

          {/* 设置按钮 */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <BrandButton variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </BrandButton>
          </motion.div>

          {/* 用户信息 */}
          {user ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-cloud-blue-50 rounded-lg cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </motion.button>

              {/* 用户菜单 */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 z-50"
                >
                  <BrandCard variant="elevated">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2">
                          <UserCircle className="h-4 w-4" />
                          <span>个人资料</span>
                        </button>
                        <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>设置</span>
                        </button>
                        <button
                          onClick={() => {
                            logout()
                            setShowUserMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>退出登录</span>
                        </button>
                      </div>
                    </div>
                  </BrandCard>
                </motion.div>
              )}
            </div>
          ) : (
            <BrandButton variant="primary" size="sm" onClick={onShowLogin}>
              登录
            </BrandButton>
          )}

          {/* 右侧面板切换 */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <BrandButton
              variant="ghost"
              size="sm"
              onClick={onToggleRightPanel}
              className={showRightPanel ? "bg-cloud-blue-100 text-cloud-blue-600" : ""}
            >
              <div className="flex flex-col space-y-0.5">
                <div className="w-3 h-0.5 bg-current"></div>
                <div className="w-3 h-0.5 bg-current"></div>
                <div className="w-3 h-0.5 bg-current"></div>
              </div>
            </BrandButton>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
