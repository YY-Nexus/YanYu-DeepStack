"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FolderOpen,
  Plus,
  Search,
  MoreVertical,
  Star,
  Clock,
  Users,
  Code2,
  Globe,
  Smartphone,
  Server,
  Database,
  Play,
  Settings,
  Share2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MobileProjectManagerProps {
  onBack: () => void
}

// 项目接口
interface Project {
  id: string
  name: string
  description: string
  type: "web" | "mobile" | "api" | "desktop"
  status: "active" | "completed" | "paused" | "archived"
  language: string
  framework?: string
  lastModified: Date
  collaborators: number
  isStarred: boolean
  progress: number
  thumbnail?: string
}

export default function MobileProjectManager({ onBack }: MobileProjectManagerProps) {
  // 项目数据
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "电商移动应用",
      description: "基于React Native的电商购物应用",
      type: "mobile",
      status: "active",
      language: "TypeScript",
      framework: "React Native",
      lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000),
      collaborators: 3,
      isStarred: true,
      progress: 75,
      thumbnail: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "2",
      name: "企业管理系统",
      description: "基于Next.js的企业级管理平台",
      type: "web",
      status: "active",
      language: "TypeScript",
      framework: "Next.js",
      lastModified: new Date(Date.now() - 4 * 60 * 60 * 1000),
      collaborators: 5,
      isStarred: false,
      progress: 60,
      thumbnail: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "3",
      name: "用户认证API",
      description: "基于Node.js的用户认证微服务",
      type: "api",
      status: "completed",
      language: "JavaScript",
      framework: "Express",
      lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000),
      collaborators: 2,
      isStarred: true,
      progress: 100,
      thumbnail: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "4",
      name: "数据分析工具",
      description: "Python数据分析和可视化工具",
      type: "desktop",
      status: "paused",
      language: "Python",
      framework: "Django",
      lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      collaborators: 1,
      isStarred: false,
      progress: 30,
      thumbnail: "/placeholder.svg?height=100&width=100",
    },
  ])

  // 状态管理
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("lastModified")
  const [activeTab, setActiveTab] = useState("all")

  const { toast } = useToast()

  // 过滤和排序项目
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === "all" || project.type === filterType
      const matchesStatus = filterStatus === "all" || project.status === filterStatus
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "starred" && project.isStarred) ||
        (activeTab === "recent" && Date.now() - project.lastModified.getTime() < 24 * 60 * 60 * 1000)

      return matchesSearch && matchesType && matchesStatus && matchesTab
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "lastModified":
          return b.lastModified.getTime() - a.lastModified.getTime()
        case "progress":
          return b.progress - a.progress
        default:
          return 0
      }
    })

  // 创建新项目
  const createNewProject = () => {
    toast({
      title: "创建项目",
      description: "跳转到项目创建页面",
    })
  }

  // 切换收藏状态
  const toggleStar = (projectId: string) => {
    toast({
      title: "收藏状态已更新",
      description: "项目收藏状态已切换",
    })
  }

  // 获取项目类型图标
  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case "web":
        return Globe
      case "mobile":
        return Smartphone
      case "api":
        return Server
      case "desktop":
        return Database
      default:
        return Code2
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-blue-500"
      case "paused":
        return "bg-yellow-500"
      case "archived":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "进行中"
      case "completed":
        return "已完成"
      case "paused":
        return "已暂停"
      case "archived":
        return "已归档"
      default:
        return "未知"
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 搜索和筛选 */}
      <div className="bg-white border-b px-4 py-3 space-y-3">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 筛选器 */}
        <div className="grid grid-cols-3 gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有类型</SelectItem>
              <SelectItem value="web">Web应用</SelectItem>
              <SelectItem value="mobile">移动应用</SelectItem>
              <SelectItem value="api">API服务</SelectItem>
              <SelectItem value="desktop">桌面应用</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="active">进行中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="paused">已暂停</SelectItem>
              <SelectItem value="archived">已归档</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastModified">最近修改</SelectItem>
              <SelectItem value="name">名称</SelectItem>
              <SelectItem value="progress">进度</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 py-2 bg-white border-b">
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="all" className="text-xs">
              全部
            </TabsTrigger>
            <TabsTrigger value="starred" className="text-xs">
              收藏
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs">
              最近
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value={activeTab} className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {/* 创建新项目按钮 */}
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Card
                    className="border-dashed border-2 cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={createNewProject}
                  >
                    <CardContent className="p-6 text-center">
                      <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">创建新项目</p>
                      <p className="text-xs text-muted-foreground">开始一个新的开发项目</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 项目列表 */}
                {filteredProjects.map((project) => {
                  const TypeIcon = getProjectTypeIcon(project.type)

                  return (
                    <motion.div
                      key={project.id}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            {/* 项目缩略图 */}
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <TypeIcon className="h-8 w-8 text-white" />
                            </div>

                            {/* 项目信息 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleStar(project.id)
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Star
                                      className={`h-4 w-4 ${
                                        project.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                                      }`}
                                    />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{project.description}</p>

                              {/* 标签和状态 */}
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {project.language}
                                </Badge>
                                {project.framework && (
                                  <Badge variant="outline" className="text-xs">
                                    {project.framework}
                                  </Badge>
                                )}
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                                  <span className="text-xs text-muted-foreground">{getStatusText(project.status)}</span>
                                </div>
                              </div>

                              {/* 进度条 */}
                              <div className="mb-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-muted-foreground">进度</span>
                                  <span className="text-xs font-medium">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* 底部信息 */}
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center space-x-1">
                                    <Users className="h-3 w-3" />
                                    <span>{project.collaborators}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{project.lastModified.toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Play className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Share2 className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Settings className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}

                {/* 空状态 */}
                {filteredProjects.length === 0 && (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">没有找到匹配的项目</p>
                    <p className="text-sm text-gray-400">尝试调整搜索条件或创建新项目</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
