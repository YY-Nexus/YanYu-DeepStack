"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandLogo } from "@/components/ui/brand-logo"
import { useAuth } from "./auth-provider"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  const { login, register, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      let success = false
      if (mode === "login") {
        success = await login(formData.email, formData.password)
      } else {
        success = await register(formData.name, formData.email, formData.password)
      }

      if (success) {
        onClose()
        setFormData({ name: "", email: "", password: "" })
      } else {
        setError(mode === "login" ? "邮箱或密码错误" : "注册失败，请重试")
      }
    } catch (err) {
      setError("网络错误，请重试")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
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
            className="w-full max-w-md"
          >
            <BrandCard variant="glass" className="overflow-hidden">
              <div className="p-6">
                {/* 头部 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <BrandLogo variant="image" size="sm" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{mode === "login" ? "登录" : "注册"}</h2>
                      <p className="text-sm text-gray-600">{mode === "login" ? "欢迎回到言語云³" : "加入言語云³"}</p>
                    </div>
                  </div>
                  <BrandButton variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </BrandButton>
                </div>

                {/* 表单 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50 focus:border-cloud-blue-500"
                          placeholder="请输入您的姓名"
                          required
                        />
                        <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50 focus:border-cloud-blue-500"
                        placeholder="请输入邮箱地址"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50 focus:border-cloud-blue-500"
                        placeholder="请输入密码"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <BrandButton
                    type="submit"
                    variant="gradient"
                    size="lg"
                    loading={isLoading}
                    icon={<LogIn className="h-4 w-4" />}
                    className="w-full"
                  >
                    {mode === "login" ? "登录" : "注册"}
                  </BrandButton>
                </form>

                {/* 切换模式 */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {mode === "login" ? "还没有账户？" : "已有账户？"}
                    <button
                      type="button"
                      onClick={() => setMode(mode === "login" ? "register" : "login")}
                      className="ml-1 text-cloud-blue-500 hover:text-cloud-blue-600 font-medium"
                    >
                      {mode === "login" ? "立即注册" : "立即登录"}
                    </button>
                  </p>
                </div>

                {/* 演示提示 */}
                {mode === "login" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-3 bg-cloud-blue-50 border border-cloud-blue-200 rounded-lg"
                  >
                    <p className="text-xs text-cloud-blue-700">
                      <strong>演示账户：</strong>
                      <br />
                      邮箱：developer@yanyu.cloud
                      <br />
                      密码：123456
                    </p>
                  </motion.div>
                )}
              </div>
            </BrandCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
