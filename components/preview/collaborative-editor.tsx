"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  MessageSquare,
  Share2,
  Eye,
  Edit3,
  Clock,
  Send,
  UserPlus,
  History,
  GitBranch,
  Download,
  Video,
  Mic,
  MicOff,
  VideoOff,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import MonacoEditor from "@/components/ui/monaco-editor"

// 协作者接口
interface Collaborator {
  id: string
  name: string
  avatar?: string
  status: "online" | "away" | "offline"
  cursor?: {
    line: number
    column: number
  }
  color: string
}

// 评论接口
interface Comment {
  id: string
  author: string
  content: string
  timestamp: Date
  line?: number
  resolved: boolean
}

// 版本历史接口
interface VersionHistory {
  id: string
  version: string
  author: string
  timestamp: Date
  message: string
  changes: number
}

export default function CollaborativeEditor() {
  // 协作状态
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: "user1",
      name: "张三",
      avatar: "/placeholder.svg?height=32&width=32",
      status: "online",
      cursor: { line: 5, column: 12 },
      color: "#3B82F6",
    },
    {
      id: "user2",
      name: "李四",
      avatar: "/placeholder.svg?height=32&width=32",
      status: "online",
      cursor: { line: 15, column: 8 },
      color: "#10B981",
    },
    {
      id: "user3",
      name: "王五",
      status: "away",
      color: "#F59E0B",
    },
  ])

  // 代码和评论状态
  const [code, setCode] = useState(`// 协作编辑示例 - React组件
import React, { useState, useEffect } from 'react';

// TODO: 添加类型定义
interface UserProps {
  name: string;
  email: string;
  avatar?: string;
}

// 用户卡片组件
const UserCard: React.FC<UserProps> = ({ name, email, avatar }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-3">
        {avatar && (
          <img 
            src={avatar || "/placeholder.svg"} 
            alt={name}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{email}</p>
        </div>
      </div>
      
      {isHovered && (
        <div className="mt-3 pt-3 border-t">
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            查看详情
          </button>
        </div>
      )}
    </div>
  );
};

export default UserCard;`)

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "comment1",
      author: "张三",
      content: "这里应该添加错误处理逻辑",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      line: 12,
      resolved: false,
    },
    {
      id: "comment2",
      author: "李四",
      content: "建议使用 memo 优化性能",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      line: 8,
      resolved: false,
    },
  ])

  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([
    {
      id: "v1",
      version: "1.0.3",
      author: "张三",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      message: "添加用户卡片组件",
      changes: 45,
    },
    {
      id: "v2",
      version: "1.0.2",
      author: "李四",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      message: "修复样式问题",
      changes: 12,
    },
    {
      id: "v3",
      version: "1.0.1",
      author: "王五",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      message: "初始版本",
      changes: 78,
    },
  ])

  // 当前状态
  const [newComment, setNewComment] = useState("")
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [shareLink, setShareLink] = useState("")

  const { toast } = useToast()

  // 初始化分享链接
  useEffect(() => {
    setShareLink(`https://yanyu-cloud.com/collaborate/${Math.random().toString(36).substring(2, 15)}`)
  }, [])

  // 添加评论
  const addComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      author: "当前用户",
      content: newComment,
      timestamp: new Date(),
      line: selectedLine || undefined,
      resolved: false,
    }

    setComments((prev) => [comment, ...prev])
    setNewComment("")
    setSelectedLine(null)

    toast({
      title: "评论已添加",
      description: "您的评论已成功添加到代码中",
    })
  }

  // 解决评论
  const resolveComment = (commentId: string) => {
    setComments((prev) => prev.map((comment) => (comment.id === commentId ? { ...comment, resolved: true } : comment)))

    toast({
      title: "评论已解决",
      description: "评论已标记为已解决",
    })
  }

  // 邀请协作者
  const inviteCollaborator = () => {
    const email = prompt("请输入协作者邮箱:")
    if (!email) return

    toast({
      title: "邀请已发送",
      description: `邀请邮件已发送到 ${email}`,
    })
  }

  // 复制分享链接
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast({
      title: "链接已复制",
      description: "分享链接已复制到剪贴板",
    })
  }

  // 下载代码
  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "collaborative-code.tsx"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* 协作工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* 在线协作者 */}
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div className="flex -space-x-2">
              {collaborators
                .filter((c) => c.status === "online")
                .map((collaborator) => (
                  <Avatar key={collaborator.id} className="border-2 border-white">
                    <AvatarImage src={collaborator.avatar || "/placeholder.svg"} />
                    <AvatarFallback style={{ backgroundColor: collaborator.color, color: "white" }}>
                      {collaborator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {collaborators.filter((c) => c.status === "online").length} 人在线
            </span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* 语音视频控制 */}
          <div className="flex items-center space-x-2">
            <Button
              variant={isVoiceEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            >
              {isVoiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              variant={isVideoEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            >
              {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={inviteCollaborator} variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-1" />
            邀请协作者
          </Button>
          <Button onClick={copyShareLink} variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            分享
          </Button>
          <Button onClick={downloadCode} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            下载
          </Button>
        </div>
      </div>

      {/* 主要编辑区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 代码编辑器 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Edit3 className="h-5 w-5" />
                  <span>协作编辑器</span>
                  <Badge variant="outline">实时同步</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>3 人查看</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>自动保存</span>
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border rounded-md h-[600px] relative">
                <MonacoEditor
                  language="typescript"
                  value={code}
                  onChange={setCode}
                  options={{
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    // 显示协作者光标
                    renderLineHighlight: "all",
                  }}
                />

                {/* 协作者光标指示器 */}
                <AnimatePresence>
                  {collaborators
                    .filter((c) => c.status === "online" && c.cursor)
                    .map((collaborator) => (
                      <motion.div
                        key={collaborator.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-2 right-2 flex items-center space-x-2 bg-white border rounded-md px-2 py-1 shadow-sm"
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: collaborator.color }} />
                        <span className="text-xs font-medium">{collaborator.name}</span>
                        <span className="text-xs text-muted-foreground">行 {collaborator.cursor?.line}</span>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 评论区 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <MessageSquare className="h-4 w-4" />
                <span>评论讨论</span>
                <Badge variant="secondary">{comments.filter((c) => !c.resolved).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 添加评论 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="行号"
                    value={selectedLine || ""}
                    onChange={(e) => setSelectedLine(Number(e.target.value) || null)}
                    className="w-20"
                  />
                  <span className="text-xs text-muted-foreground">可选</span>
                </div>
                <Textarea
                  placeholder="添加评论..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={addComment} size="sm" className="w-full">
                  <Send className="h-4 w-4 mr-1" />
                  发送评论
                </Button>
              </div>

              <Separator />

              {/* 评论列表 */}
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 border rounded-md ${comment.resolved ? "bg-gray-50 opacity-60" : "bg-white"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{comment.author}</span>
                          {comment.line && (
                            <Badge variant="outline" className="text-xs">
                              行 {comment.line}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{comment.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                      {!comment.resolved && (
                        <Button
                          onClick={() => resolveComment(comment.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          标记为已解决
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 版本历史 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <History className="h-4 w-4" />
                <span>版本历史</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {versionHistory.map((version) => (
                    <div key={version.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md">
                      <GitBranch className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{version.version}</span>
                          <Badge variant="outline" className="text-xs">
                            {version.changes} 更改
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 truncate">{version.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">{version.author}</span>
                          <span className="text-xs text-muted-foreground">{version.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
