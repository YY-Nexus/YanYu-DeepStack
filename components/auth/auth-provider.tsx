"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "user" | "guest"
  preferences: {
    theme: "light" | "dark" | "auto"
    language: "zh-CN" | "en-US"
    autoSave: boolean
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<boolean>
  updateProfile: (updates: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 模拟用户数据
  const mockUser: User = {
    id: "1",
    name: "开发者",
    email: "developer@yanyu.cloud",
    avatar: "/images/avatar-placeholder.png",
    role: "admin",
    preferences: {
      theme: "light",
      language: "zh-CN",
      autoSave: true,
    },
  }

  // 初始化时检查本地存储
  useEffect(() => {
    const savedUser = localStorage.getItem("yanyu-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email === "developer@yanyu.cloud" && password === "123456") {
      setUser(mockUser)
      localStorage.setItem("yanyu-user", JSON.stringify(mockUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("yanyu-user")
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: "user",
      preferences: {
        theme: "light",
        language: "zh-CN",
        autoSave: true,
      },
    }

    setUser(newUser)
    localStorage.setItem("yanyu-user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("yanyu-user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
