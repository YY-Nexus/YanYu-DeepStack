"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  MoreHorizontal,
  Clock,
  Users,
  GitBranch,
  Share2,
  Copy,
  Trash2,
  Edit,
  ExternalLink,
  Monitor,
  Smartphone,
  Server,
  Brain,
  Code,
} from "lucide-react"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"
import { BrandButton } from "@/components/ui/brand-button"
import type { Project } from "@/types/project"

interface ProjectCardProps {
  project: Project
  viewMode: "grid" | "list"
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export default function ProjectCard({
  project,
  viewMode,
  isSelected,
  onSelect,
  onOpen,
  onDuplicate,
  onDelete,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // 项目类型图标映射
  const getProjectIcon = (type: Project["type"]) => {
    switch (type) {
      case "web":
        return Monitor
      case "mobile":
        return Smartphone
      case "desktop":
        return Monitor
      case "api":
        return Server
      case "ai-model":
        return Brain
      default:
        return Code
    }
  }

  // 项目类型颜色映射
  const getTypeColor = (type: Project["type"]) => {
    switch (type) {
      case "web":
        return "primary"
      case "mobile":
        return "success"
      case "desktop":
        return "warning"
      case "api":
        return "info"
      case "ai-model":
        return "error"
      default:
        return "primary"
    }
  }

  // 状态颜色映射
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "success"
      case "archived":
        return "warning"
      case "template":
        return "info"
      default:
        return "primary"
    }
  }

  const Icon = getProjectIcon(project.type)

  if (viewMode === "list") {
    return (
      <BrandCard variant="outlined" hover={true} className="p-4">
        <div className="flex items-center space-x-4">
          {/* 选择框 */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4 text-cloud-blue-500 border-gray-300 rounded focus:ring-cloud-blue-500"
            aria-label={`选择项目 ${project.name}`}
            title={`选择项目 ${project.name}`}
          />

          {/* 项目图标 */}
          <div className="w-12 h-12 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-white" />
          </div>

          {/* 项目信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{project.name}</h3>
              <BrandBadge variant={getTypeColor(project.type) as any} size="sm">
                {project.type}
              </BrandBadge>
              <BrandBadge variant={getStatusColor(project.status) as any} size="sm">
                {project.status === "active" ? "活跃" : project.status === "archived" ? "已归档" : "模板"}
              </BrandBadge>
            </div>
            <p className="text-sm text-gray-600 truncate mb-2">{project.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(project.metadata.updatedAt).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{project.team.length} 成员</span>
              </span>
              <span className="flex items-center space-x-1">
                <GitBranch className="h-3 w-3" />
                <span>v{project.metadata.version}</span>
              </span>
            </div>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1 max-w-xs">
            {project.metadata.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
            {project.metadata.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{project.metadata.tags.length - 3}
              </span>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center space-x-2">
            <BrandButton variant="primary" size="sm" onClick={onOpen}>
              打开
            </BrandButton>
            <div className="relative">
              <BrandButton
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </BrandButton>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onDuplicate()
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>复制项目</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <Share2 className="h-4 w-4" />
                      <span>分享项目</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <Edit className="h-4 w-4" />
                      <span>编辑信息</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        onDelete()
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>删除项目</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </BrandCard>
    )
  }

  return (
    <BrandCard variant="outlined" hover={true} className="relative group">
      <div className="p-6">
        {/* 选择框 */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="absolute top-4 left-4 w-4 h-4 text-cloud-blue-500 border-gray-300 rounded focus:ring-cloud-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`选择项目 ${project.name}`}
          title={`选择项目 ${project.name}`}
        />

        {/* 项目图标和状态 */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <BrandBadge variant={getTypeColor(project.type) as any} size="sm">
              {project.type}
            </BrandBadge>
            <div className="relative">
              <BrandButton
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </BrandButton>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onDuplicate()
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>复制项目</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <Share2 className="h-4 w-4" />
                      <span>分享项目</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <Edit className="h-4 w-4" />
                      <span>编辑信息</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        onDelete()
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>删除项目</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* 项目信息 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{project.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1 mb-3">
            {project.metadata.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
            {project.metadata.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{project.metadata.tags.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* 项目统计 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(project.metadata.updatedAt).toLocaleDateString()}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{project.team.length}</span>
          </span>
          <span className="flex items-center space-x-1">
            <GitBranch className="h-3 w-3" />
            <span>v{project.metadata.version}</span>
          </span>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <BrandButton variant="primary" size="sm" onClick={onOpen} className="flex-1">
            打开项目
          </BrandButton>
          <BrandButton variant="outline" size="sm" icon={<ExternalLink className="h-4 w-4" />}>
            预览
          </BrandButton>
        </div>
      </div>
    </BrandCard>
  )
}
