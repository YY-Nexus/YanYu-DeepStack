"use client"

import { useState, useEffect } from "react"
import { useTemplateStore } from "@/lib/templates/template-store"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pagination } from "@/components/ui/pagination"
import { PlusCircle, RefreshCw, Loader2 } from "lucide-react"
import TemplateCard from "@/components/templates/template-card"
import TemplateFilters from "@/components/templates/template-filters"
import TemplateFormModal from "@/components/templates/template-form-modal"
import TemplateShareModal from "@/components/templates/template-share-modal"
import { useToast } from "@/hooks/use-toast"
import type { CodeTemplate } from "@/types/template"

export default function TemplateExplorer() {
  // 获取模板存储
  const {
    templates,
    isLoading,
    error,
    filter,
    currentPage,
    fetchTemplates,
    setFilter,
    resetFilter,
    setPage,
    getFilteredTemplates,
    getTotalPages,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsageCount,
  } = useTemplateStore()

  // 状态
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "my" | "public">("all")

  const { toast } = useToast()

  // 初始化
  useEffect(() => {
    if (templates.length === 0 && !isLoading) {
      fetchTemplates()
    }
  }, [templates.length, isLoading, fetchTemplates])

  // 处理标签变化
  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "my" | "public")

    if (value === "all") {
      resetFilter()
    } else if (value === "my") {
      setFilter({ isPublic: false })
    } else if (value === "public") {
      setFilter({ isPublic: true })
    }
  }

  // 处理创建模板
  const handleCreateTemplate = async (template: any) => {
    setIsSubmitting(true)

    try {
      await createTemplate(template)
      setIsCreateModalOpen(false)
      toast({
        title: "模板创建成功",
        description: "您的模板已成功创建并可以使用",
      })
    } catch (error) {
      toast({
        title: "创建失败",
        description: error instanceof Error ? error.message : "创建模板时出现错误",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理更新模板
  const handleUpdateTemplate = async (template: any) => {
    setIsSubmitting(true)

    try {
      await updateTemplate(template)
      setIsEditModalOpen(false)
      setSelectedTemplate(null)
      toast({
        title: "模板更新成功",
        description: "您的模板已成功更新",
      })
    } catch (error) {
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "更新模板时出现错误",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理删除模板
  const handleDeleteTemplate = async (template: CodeTemplate) => {
    if (!window.confirm(`确定要删除模板 "${template.name}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      await deleteTemplate(template.id)
      toast({
        title: "模板已删除",
        description: "模板已成功删除",
      })
    } catch (error) {
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "删除模板时出现错误",
        variant: "destructive",
      })
    }
  }

  // 处理使用模板
  const handleUseTemplate = (template: CodeTemplate) => {
    incrementUsageCount(template.id)

    // 这里可以添加使用模板的逻辑，例如跳转到代码生成页面并应用模板
    toast({
      title: "模板已应用",
      description: `已应用模板 "${template.name}"`,
    })
  }

  // 处理编辑模板
  const handleEditTemplate = (template: CodeTemplate) => {
    setSelectedTemplate(template)
    setIsEditModalOpen(true)
  }

  // 处理分享模板
  const handleShareTemplate = (template: CodeTemplate) => {
    setSelectedTemplate(template)
    setIsShareModalOpen(true)
  }

  // 获取过滤后的模板
  const filteredTemplates = getFilteredTemplates()
  const totalPages = getTotalPages()

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">代码模板库</h2>
          <p className="text-muted-foreground">浏览、创建和管理代码生成模板</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchTemplates()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            刷新
          </Button>

          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <PlusCircle className="h-4 w-4 mr-1" />
            创建模板
          </Button>
        </div>
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">全部模板</TabsTrigger>
          <TabsTrigger value="my">我的模板</TabsTrigger>
          <TabsTrigger value="public">公开模板</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <TemplateFilters filter={filter} onFilterChange={setFilter} onResetFilters={resetFilter} />

          {renderTemplateGrid()}
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          <TemplateFilters
            filter={filter}
            onFilterChange={setFilter}
            onResetFilters={() => setFilter({ isPublic: false })}
          />

          {renderTemplateGrid()}
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <TemplateFilters
            filter={filter}
            onFilterChange={setFilter}
            onResetFilters={() => setFilter({ isPublic: true })}
          />

          {renderTemplateGrid()}
        </TabsContent>
      </Tabs>

      {/* 创建模板对话框 */}
      <TemplateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTemplate}
        isSubmitting={isSubmitting}
      />

      {/* 编辑模板对话框 */}
      {selectedTemplate && (
        <TemplateFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedTemplate(null)
          }}
          onSubmit={handleUpdateTemplate}
          template={selectedTemplate}
          isSubmitting={isSubmitting}
        />
      )}

      {/* 分享模板对话框 */}
      {selectedTemplate && (
        <TemplateShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false)
            setSelectedTemplate(null)
          }}
          template={selectedTemplate}
        />
      )}
    </div>
  )

  // 渲染模板网格
  function renderTemplateGrid() {
    if (isLoading && templates.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">加载模板时出错</p>
            <Button variant="outline" onClick={() => fetchTemplates()}>
              重试
            </Button>
          </div>
        </div>
      )
    }

    if (filteredTemplates.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              {filter.search ? `没有找到与 "${filter.search}" 相关的模板` : "没有找到符合条件的模板"}
            </p>
            <Button variant="outline" onClick={resetFilter}>
              清除筛选条件
            </Button>
          </div>
        </div>
      )
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onShare={handleShareTemplate}
            />
          ))}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} className="mt-6" />
        )}
      </>
    )
  }
}
