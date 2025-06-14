"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BrandCard } from "@/components/ui/brand-card"
import { BrandBadge } from "@/components/ui/brand-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileCode2, Star, Clock, Download, Share2, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import type { CodeTemplate } from "@/types/template"

interface TemplateCardProps {
  template: CodeTemplate
  onUse: (template: CodeTemplate) => void
  onEdit?: (template: CodeTemplate) => void
  onDelete?: (template: CodeTemplate) => void
  onShare?: (template: CodeTemplate) => void
  className?: string
}

export default function TemplateCard({
  template,
  onUse,
  onEdit,
  onDelete,
  onShare,
  className = "",
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // 格式化更新时间
  const formattedDate = formatDistanceToNow(new Date(template.updatedAt), {
    addSuffix: true,
    locale: zhCN,
  })

  // 处理使用模板
  const handleUse = () => {
    onUse(template)
  }

  // 处理编辑模板
  const handleEdit = () => {
    if (onEdit) {
      onEdit(template)
    }
  }

  // 处理删除模板
  const handleDelete = () => {
    if (onDelete) {
      onDelete(template)
    }
  }

  // 处理分享模板
  const handleShare = () => {
    if (onShare) {
      onShare(template)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BrandCard
        variant={isHovered ? "gradient" : "outlined"}
        className="h-full flex flex-col overflow-hidden transition-all duration-300"
      >
        {/* 缩略图 */}
        <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {template.thumbnail ? (
            <img
              src={template.thumbnail || "/placeholder.svg"}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileCode2 className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* 语言和框架标签 */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {template.language && (
              <BrandBadge variant="solid" size="sm">
                {template.language}
              </BrandBadge>
            )}
            {template.framework && (
              <BrandBadge variant="outline" size="sm">
                {template.framework}
              </BrandBadge>
            )}
          </div>

          {/* 公开/私有标签 */}
          <div className="absolute top-2 right-2">
            <Badge variant={template.isPublic ? "default" : "outline"} className="text-xs">
              {template.isPublic ? "公开" : "私有"}
            </Badge>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-gray-800 line-clamp-1">{template.name}</h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑模板
                  </DropdownMenuItem>
                )}
                {onShare && (
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    分享模板
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除模板
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-gray-600 mt-1 line-clamp-2 flex-1">{template.description}</p>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1 mt-3">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 mr-1 text-yellow-500" />
              <span>{template.rating?.toFixed(1) || "-"}</span>
              <span className="mx-2">•</span>
              <span>{template.usageCount} 次使用</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="p-4 border-t border-gray-100">
          <Button onClick={handleUse} className="w-full" variant={isHovered ? "default" : "outline"}>
            <Download className="h-4 w-4 mr-2" />
            使用模板
          </Button>
        </div>
      </BrandCard>
    </motion.div>
  )
}
