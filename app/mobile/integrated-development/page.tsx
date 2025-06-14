"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Code2,
  Smartphone,
  Users,
  Play,
  FolderOpen,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Sparkles,
  Terminal,
  MessageSquare,
  History,
  WifiOff,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import MobileAICodeGenerator from "@/components/mobile/mobile-ai-code-generator"
import MobileCodeSandbox from "@/components/mobile/mobile-code-sandbox"
import MobileCollaborativeEditor from "@/components/mobile/mobile-collaborative-editor"
import MobileProjectManager from "@/components/mobile/mobile-project-manager"
import MobileStatusBar from "@/components/mobile/mobile-status-bar"
import MobileBottomNavigation from "@/components/mobile/mobile-bottom-navigation"

// 移动端页面类型
type MobilePage = "home" | "ai-generator" | "sandbox" | "collaboration" | "projects" | "settings"

// 统计数据接口
interface MobileStats {
  totalProjects: number
  codeGenerations: number
  collaborations: number
  sandboxRuns: number
  aiQuota: number
  storageUsed: number
}

export default function MobileIntegratedDevelopment() {
  // 页面状态管理
  const [currentPage, setCurrentPage] = useState<MobilePage>("home")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState(85)

  // 统计数据
  const [stats, setStats] = useState<MobileStats>({
    totalProjects: 12,
    codeGenerations: 156,
    collaborations: 8,
    sandboxRuns: 89,
    aiQuota: 75,
    storageUsed: 45,
  })

  const { toast } = useToast()

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // 模拟电池状态更新
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) => Math.max(0, prev - Math.random() * 0.5))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // 页面导航
  const navigateToPage = (page: MobilePage) => {
    setCurrentPage(page)
    setIsMenuOpen(false)
  }

  // 返回首页
  const goHome = () => {
    setCurrentPage("home")
  }

  // 渲染页面内容
  const renderPageContent = () => {
    switch (currentPage) {
      case "home":
        return <MobileHomePage stats={stats} onNavigate={navigateToPage} />
      case "ai-generator":
        return <MobileAICodeGenerator onBack={goHome} />
      case "sandbox":
        return <MobileCodeSandbox onBack={goHome} />
      case "collaboration":
        return <MobileCollaborativeEditor onBack={goHome} />
      case "projects":
        return <MobileProjectManager onBack={goHome} />
      case "settings":
        return <MobileSettingsPage onBack={goHome} />
      default:
        return <MobileHomePage stats={stats} onNavigate={navigateToPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* 移动端状态栏 */}
      <MobileStatusBar isOnline={isOnline} batteryLevel={batteryLevel} />

      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        {currentPage !== "home" && (
          <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goHome} className="p-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">
              {currentPage === "ai-generator" && "AI代码生成"}
              {currentPage === "sandbox" && "代码沙箱"}
              {currentPage === "collaboration" && "协作编辑"}
              {currentPage === "projects" && "项目管理"}
              {currentPage === "settings" && "设置"}
            </h1>
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(true)} className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* 页面内容 */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderPageContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 底部导航 */}
      {currentPage === "home" && <MobileBottomNavigation currentPage={currentPage} onNavigate={navigateToPage} />}

      {/* 侧边菜单 */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">菜单</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigateToPage("home")}>
                    <Smartphone className="h-4 w-4 mr-3" />
                    首页
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigateToPage("ai-generator")}
                  >
                    <Sparkles className="h-4 w-4 mr-3" />
                    AI代码生成
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigateToPage("sandbox")}>
                    <Terminal className="h-4 w-4 mr-3" />
                    代码沙箱
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigateToPage("collaboration")}
                  >
                    <Users className="h-4 w-4 mr-3" />
                    协作编辑
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigateToPage("projects")}>
                    <FolderOpen className="h-4 w-4 mr-3" />
                    项目管理
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigateToPage("settings")}>
                    <Settings className="h-4 w-4 mr-3" />
                    设置
                  </Button>
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 离线提示 */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-20 left-4 right-4 bg-orange-500 text-white p-3 rounded-lg shadow-lg z-30"
          >
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">当前离线模式，部分功能受限</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 移动端首页组件
function MobileHomePage({
  stats,
  onNavigate,
}: {
  stats: MobileStats
  onNavigate: (page: MobilePage) => void
}) {
  return (
    <div className="p-4 space-y-6">
      {/* 欢迎区域 */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">言語云³</h1>
              <p className="text-blue-100">移动开发工作台</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">AI额度</p>
              <p className="text-xl font-bold">{stats.aiQuota}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速操作 */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("ai-generator")}>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm">AI代码生成</h3>
              <p className="text-xs text-muted-foreground mt-1">智能生成代码</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("sandbox")}>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Terminal className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm">代码沙箱</h3>
              <p className="text-xs text-muted-foreground mt-1">安全执行测试</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate("collaboration")}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm">协作编辑</h3>
              <p className="text-xs text-muted-foreground mt-1">团队实时协作</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("projects")}>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm">项目管理</h3>
              <p className="text-xs text-muted-foreground mt-1">管理所有项目</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 统计信息 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">使用统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalProjects}</p>
              <p className="text-sm text-muted-foreground">项目数量</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.codeGenerations}</p>
              <p className="text-sm text-muted-foreground">代码生成</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.collaborations}</p>
              <p className="text-sm text-muted-foreground">协作会话</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.sandboxRuns}</p>
              <p className="text-sm text-muted-foreground">沙箱运行</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近活动 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>最近活动</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Code2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">生成了React组件代码</p>
                <p className="text-xs text-muted-foreground">5分钟前</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">在沙箱中运行代码</p>
                <p className="text-xs text-muted-foreground">15分钟前</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">参与协作讨论</p>
                <p className="text-xs text-muted-foreground">1小时前</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 移动端设置页面组件
function MobileSettingsPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>应用设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">深色模式</p>
              <p className="text-sm text-muted-foreground">切换应用主题</p>
            </div>
            <Button variant="outline" size="sm">
              切换
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">离线模式</p>
              <p className="text-sm text-muted-foreground">启用离线功能</p>
            </div>
            <Button variant="outline" size="sm">
              启用
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">自动保存</p>
              <p className="text-sm text-muted-foreground">自动保存编辑内容</p>
            </div>
            <Button variant="outline" size="sm">
              开启
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>存储管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">已用存储</span>
              <span className="text-sm font-medium">2.3 GB / 5 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "46%" }} />
            </div>
            <Button variant="outline" className="w-full">
              清理缓存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
