"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Code2, FileText, Users, FolderOpen, Sparkles, Layers, Terminal, Share2, Settings, Zap } from "lucide-react"
import IntegratedCodeGenerator from "@/components/preview/integrated-code-generator"
import EnhancedCodeSandbox from "@/components/preview/enhanced-code-sandbox"
import CollaborativeEditor from "@/components/preview/collaborative-editor"
import ProjectIntegrationPanel from "@/components/preview/project-integration-panel"
import TemplateSystemIntegration from "@/components/preview/template-system-integration"
import { useToast } from "@/lib/utils/client-toast"

export default function IntegratedDevelopmentPage() {
  const [activeTab, setActiveTab] = useState("generator")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    templatesUsed: 0,
    codeGenerated: 0,
    collaborators: 0,
    projectsCreated: 0,
  })

  const { toast } = useToast()

  // 初始化
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 模拟初始化过程
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 设置统计数据
        setStats({
          templatesUsed: 15,
          codeGenerated: 42,
          collaborators: 8,
          projectsCreated: 6,
        })

        setIsLoading(false)

        toast({
          title: "集成开发环境已就绪",
          description: "所有功能模块已成功加载，您可以开始使用了",
        })
      } catch (error) {
        console.error("初始化失败:", error)
        toast({
          title: "初始化失败",
          description: "请刷新页面重试",
          variant: "destructive",
        })
      }
    }

    initializeApp()
  }, [toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold">正在初始化集成开发环境...</h2>
          <p className="text-muted-foreground">请稍候，正在加载所有功能模块</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 头部导航 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-lg flex items-center justify-center">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">言語云³ 集成开发环境</h1>
                <p className="text-sm text-muted-foreground">AI驱动的智能代码生成与协作平台</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* 统计信息 */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-cloud-blue-500" />
                  <span className="text-sm font-medium">{stats.templatesUsed}</span>
                  <span className="text-xs text-muted-foreground">模板</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Code2 className="h-4 w-4 text-mint-green" />
                  <span className="text-sm font-medium">{stats.codeGenerated}</span>
                  <span className="text-xs text-muted-foreground">代码</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-coral-pink" />
                  <span className="text-sm font-medium">{stats.collaborators}</span>
                  <span className="text-xs text-muted-foreground">协作</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4 text-lemon-yellow" />
                  <span className="text-sm font-medium">{stats.projectsCreated}</span>
                  <span className="text-xs text-muted-foreground">项目</span>
                </div>
              </div>

              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                设置
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* 标签导航 */}
            <div className="bg-white rounded-lg border border-gray-200 p-1">
              <TabsList className="grid w-full grid-cols-5 bg-transparent">
                <TabsTrigger
                  value="generator"
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cloud-blue-500 data-[state=active]:to-mint-green data-[state=active]:text-white"
                >
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">AI生成</span>
                </TabsTrigger>
                <TabsTrigger
                  value="sandbox"
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cloud-blue-500 data-[state=active]:to-mint-green data-[state=active]:text-white"
                >
                  <Terminal className="h-4 w-4" />
                  <span className="hidden sm:inline">代码沙箱</span>
                </TabsTrigger>
                <TabsTrigger
                  value="collaboration"
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cloud-blue-500 data-[state=active]:to-mint-green data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">协作编辑</span>
                </TabsTrigger>
                <TabsTrigger
                  value="templates"
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cloud-blue-500 data-[state=active]:to-mint-green data-[state=active]:text-white"
                >
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">模板系统</span>
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cloud-blue-500 data-[state=active]:to-mint-green data-[state=active]:text-white"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">项目管理</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 标签内容 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="generator" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-cloud-blue-500" />
                        <span>AI代码生成器</span>
                        <Badge variant="secondary">集成模板系统</Badge>
                      </CardTitle>
                      <CardDescription>使用AI和预设模板快速生成高质量代码，支持多种编程语言和框架</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <IntegratedCodeGenerator />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sandbox" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Terminal className="h-5 w-5 text-mint-green" />
                        <span>增强代码沙箱</span>
                        <Badge variant="secondary">多语言支持</Badge>
                      </CardTitle>
                      <CardDescription>安全执行和测试代码，支持文件系统模拟和依赖管理</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EnhancedCodeSandbox />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="collaboration" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-coral-pink" />
                        <span>协作编辑器</span>
                        <Badge variant="secondary">实时协作</Badge>
                      </CardTitle>
                      <CardDescription>多人实时协作编辑代码，支持评论、讨论和版本控制</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CollaborativeEditor />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="templates" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Layers className="h-5 w-5 text-lemon-yellow" />
                        <span>模板系统</span>
                        <Badge variant="secondary">智能推荐</Badge>
                      </CardTitle>
                      <CardDescription>管理和使用代码模板，支持自定义变量和智能推荐</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TemplateSystemIntegration />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projects" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FolderOpen className="h-5 w-5 text-cloud-blue-500" />
                        <span>项目管理</span>
                        <Badge variant="secondary">全生命周期</Badge>
                      </CardTitle>
                      <CardDescription>集成项目管理，从代码生成到部署的完整开发流程</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProjectIntegrationPanel />
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </main>

      {/* 底部状态栏 */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border-t border-gray-200 mt-8"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>言語云³ 集成开发环境 v1.0.0</span>
              <Separator orientation="vertical" className="h-4" />
              <span>AI模型: Ollama</span>
              <Separator orientation="vertical" className="h-4" />
              <span>状态: 已连接</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                分享
              </Button>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
