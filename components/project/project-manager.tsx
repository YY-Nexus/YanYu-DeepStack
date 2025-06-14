"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FolderPlus,
  Search,
  Filter,
  Grid3X3,
  List,
  Folder,
  Code,
  Smartphone,
  Monitor,
  Server,
  Brain,
} from "lucide-react"
import { BrandButton } from "@/components/ui/brand-button"
import { BrandBadge } from "@/components/ui/brand-badge"
import { useProjectStore } from "@/lib/project-store"
import type { Project } from "@/types/project"
import CreateProjectModal from "./create-project-modal"
import ProjectCard from "./project-card"
import ProjectFilters from "./project-filters"

export default function ProjectManager() {
  const {
    projects,
    currentProject,
    setCurrentProject,
    searchProjects,
    filterProjects,
    deleteProject,
    duplicateProject,
  } = useProjectStore()

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    language: "",
    sortBy: "updatedAt",
    sortOrder: "desc" as "asc" | "desc",
  })
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])

  // 过滤和搜索项目
  const filteredProjects = (() => {
    let result = projects

    // 应用搜索
    if (searchQuery) {
      result = searchProjects(searchQuery)
    }

    // 应用过滤器
    result = filterProjects(filters)

    // 应用排序
    result.sort((a, b) => {
      const aValue = a.metadata[filters.sortBy as keyof typeof a.metadata] as string
      const bValue = b.metadata[filters.sortBy as keyof typeof b.metadata] as string

      if (filters.sortOrder === "asc") {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

    return result
  })()

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

  // 批量操作
  const handleBatchDelete = async () => {
    for (const projectId of selectedProjects) {
      await deleteProject(projectId)
    }
    setSelectedProjects([])
  }

  const handleBatchDuplicate = async () => {
    for (const projectId of selectedProjects) {
      const project = projects.find((p) => p.id === projectId)
      if (project) {
        await duplicateProject(projectId, `${project.name} (副本)`)
      }
    }
    setSelectedProjects([])
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部工具栏 */}
      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-cloud-blue-50 to-mint-green/10">
        <div className="flex items-center justify-between mb-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <Folder className="h-6 w-6 text-cloud-blue-500" />
              <span>项目管理</span>
            </h1>
            <p className="text-gray-600 mt-1">管理您的所有项目，支持版本控制和团队协作</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <BrandButton
              variant="gradient"
              icon={<FolderPlus className="h-4 w-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              新建项目
            </BrandButton>
          </motion.div>
        </div>

        {/* 搜索和过滤工具栏 */}
        <div className="flex items-center space-x-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索项目名称、描述或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50 focus:border-cloud-blue-500"
            />
          </div>

          {/* 过滤器按钮 */}
          <BrandButton
            variant={showFilters ? "primary" : "outline"}
            icon={<Filter className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            过滤器
          </BrandButton>

          {/* 视图切换 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-white shadow-sm text-cloud-blue-500" : "text-gray-500"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list" ? "bg-white shadow-sm text-cloud-blue-500" : "text-gray-500"
              }`}
            >
              <List className="h-4 w-4" />
            </motion.button>
          </div>

          {/* 批量操作 */}
          {selectedProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2"
            >
              <BrandBadge variant="info">{selectedProjects.length} 个已选择</BrandBadge>
              <BrandButton variant="outline" size="sm" onClick={handleBatchDuplicate}>
                复制
              </BrandButton>
              <BrandButton variant="outline" size="sm" onClick={handleBatchDelete}>
                删除
              </BrandButton>
            </motion.div>
          )}
        </div>

        {/* 过滤器面板 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <ProjectFilters filters={filters} onFiltersChange={setFilters} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 项目列表 */}
      <div className="flex-1 p-6 overflow-auto">
        {filteredProjects.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-cloud-blue-100 to-mint-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="h-12 w-12 text-cloud-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchQuery || Object.values(filters).some(Boolean) ? "未找到匹配的项目" : "还没有项目"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || Object.values(filters).some(Boolean)
                ? "尝试调整搜索条件或过滤器"
                : "创建您的第一个项目开始使用言語云³"}
            </p>
            <BrandButton
              variant="primary"
              icon={<FolderPlus className="h-4 w-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              创建新项目
            </BrandButton>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
            }
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProjectCard
                  project={project}
                  viewMode={viewMode}
                  isSelected={selectedProjects.includes(project.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedProjects([...selectedProjects, project.id])
                    } else {
                      setSelectedProjects(selectedProjects.filter((id) => id !== project.id))
                    }
                  }}
                  onOpen={() => setCurrentProject(project)}
                  onDuplicate={() => duplicateProject(project.id, `${project.name} (副本)`)}
                  onDelete={() => deleteProject(project.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* 创建项目模态框 */}
      <CreateProjectModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  )
}
