"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Send, UserPlus, Video, Mic, MicOff, VideoOff, Edit3, Clock, GitBranch, Eye, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MobileCollaborativeEditorProps {
  onBack: () => void
}

// 协作者接口
interface Collaborator {
  id: string
  name: string
  avatar?: string
  status: "online" | "away" | "offline"
  color: string
  isTyping?: boolean
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

export default function MobileCollaborativeEditor({ onBack }: MobileCollaborativeEditorProps) {
  // 协作状态
  const [collaborators] = useState<Collaborator[]>([
    {
      id: "user1",
      name: "张三",
      avatar: "/placeholder.svg?height=32&width=32",
      status: "online",
      color: "#3B82F6",
      isTyping: false,
    },
    {
      id: "user2",
      name: "李四",
      avatar: "/placeholder.svg?height=32&width=32",
      status: "online",
      color: "#10B981",
      isTyping: true,
    },
    {
      id: "user3",
      name: "王五",
      status: "away",
      color: "#F59E0B",
    },
  ])

  // 代码和评论状态
  const [code, setCode] = useState(`// 移动端协作编辑示例
import React, { useState } from 'react';

const MobileApp = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="mobile-app">
      <h1>移动应用</h1>
      <p>计数器: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
};

export default MobileApp;`)

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "comment1",
      author: "张三",
      content: "这里应该添加错误处理",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      line: 8,
      resolved: false,
    },
    {
      id: "comment2",
      author: "李四",
      content: "建议使用useCallback优化",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      line: 12,
      resolved: false,
    },
  ])

  const [versionHistory] = useState<VersionHistory[]>([
    {
      id: "v1",
      version: "1.0.3",
      author: "张三",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      message: "添加移动端组件",
      changes: 25,
    },
    {
      id: "v2",
      version: "1.0.2",
      author: "李四",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      message: "修复样式问题",
      changes: 8,
    },
  ])

  // 当前状态
  const [newComment, setNewComment] = useState("")
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")

  const { toast } = useToast()

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
      description: "您的评论已成功添加",
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

  // 分享项目
  const shareProject = () => {
    const shareLink = `https://yanyu-cloud.com/collaborate/${Math.random().toString(36).substring(2, 15)}`
    navigator.clipboard.writeText(shareLink)

    toast({
      title: "链接已复制",
      description: "分享链接已复制到剪贴板",
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* 协作工具栏 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          {/* 在线协作者 */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {collaborators
                .filter((c) => c.status === "online")
                .slice(0, 3)
                .map((collaborator) => (
                  <Avatar key={collaborator.id} className="border-2 border-white w-8 h-8">
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

          {/* 操作按钮 */}
          <div className="flex items-center space-x-2">
            <Button
              variant={isVoiceEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className="h-8 w-8 p-0"
            >
              {isVoiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              variant={isVideoEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className="h-8 w-8 p-0"
            >
              {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button onClick={shareProject} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              分享
            </Button>
          </div>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />3 人查看
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            自动保存
          </Badge>
          {collaborators.some((c) => c.isTyping) && (
            <Badge variant="secondary" className="text-xs">
              有人正在输入...
            </Badge>
          )}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 py-2 bg-white border-b">
            <TabsList className="grid w-full grid-cols-4 h-9">
              <TabsTrigger value="editor" className="text-xs">
                编辑器
              </TabsTrigger>
              <TabsTrigger value="comments" className="text-xs">
                评论
                <Badge variant="secondary" className="ml-1 text-xs">
                  {comments.filter((c) => !c.resolved).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="collaborators" className="text-xs">
                协作者
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                历史
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="editor" className="h-full m-0">
              <div className="h-full flex flex-col">
                {/* 编辑器头部 */}
                <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Edit3 className="h-4 w-4" />
                    <span className="text-sm font-medium">collaborative-code.tsx</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {/* 代码编辑器 */}
                <div className="flex-1 p-4">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full resize-none font-mono text-sm"
                    placeholder="在这里编写代码..."
                  />
                </div>

                {/* 协作者光标指示器 */}
                <AnimatePresence>
                  {collaborators
                    .filter((c) => c.status === "online" && c.isTyping)
                    .map((collaborator) => (
                      <motion.div
                        key={collaborator.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-20 right-4 bg-white border rounded-lg px-3 py-2 shadow-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: collaborator.color }} />
                          <span className="text-xs font-medium">{collaborator.name}</span>
                          <span className="text-xs text-muted-foreground">正在输入...</span>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="h-full m-0">
              <div className="h-full flex flex-col">
                {/* 添加评论 */}
                <div className="p-4 bg-white border-b space-y-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="行号"
                      value={selectedLine || ""}
                      onChange={(e) => setSelectedLine(Number(e.target.value) || null)}
                      className="w-20 h-9"
                    />
                    <span className="text-xs text-muted-foreground">可选</span>
                  </div>
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="添加评论..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="flex-1 resize-none"
                    />
                    <Button onClick={addComment} size="sm" className="self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 评论列表 */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 border rounded-lg ${comment.resolved ? "bg-gray-50 opacity-60" : "bg-white"}`}
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
                          <span className="text-xs text-muted-foreground">
                            {comment.timestamp.toLocaleTimeString()}
                          </span>
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
              </div>
            </TabsContent>

            <TabsContent value="collaborators" className="h-full m-0">
              <div className="h-full flex flex-col">
                {/* 邀请按钮 */}
                <div className="p-4 border-b">
                  <Button onClick={inviteCollaborator} className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    邀请协作者
                  </Button>
                </div>

                {/* 协作者列表 */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={collaborator.avatar || "/placeholder.svg"} />
                          <AvatarFallback style={{ backgroundColor: collaborator.color, color: "white" }}>
                            {collaborator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{collaborator.name}</p>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                collaborator.status === "online"
                                  ? "default"
                                  : collaborator.status === "away"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {collaborator.status === "online"
                                ? "在线"
                                : collaborator.status === "away"
                                  ? "离开"
                                  : "离线"}
                            </Badge>
                            {collaborator.isTyping && (
                              <Badge variant="secondary" className="text-xs">
                                正在输入
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="history" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {versionHistory.map((version) => (
                    <div key={version.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <GitBranch className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">{version.version}</span>
                          <Badge variant="outline" className="text-xs">
                            {version.changes} 更改
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{version.message}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{version.author}</span>
                          <span>•</span>
                          <span>{version.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
