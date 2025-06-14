"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutTemplateIcon as Template, Code, Settings, Plus, Search, Download, Star, Eye } from "lucide-react"
import { useTemplateStore } from "@/lib/templates/template-store"
import type { CodeTemplate } from "@/types/template"

interface TemplateSystemIntegrationProps {
  onTemplateSelect?: (template: CodeTemplate) => void
  onTemplateApply?: (template: CodeTemplate, variables: Record<string, string>) => void
  selectedLanguage?: string
  selectedFramework?: string
}

export default function TemplateSystemIntegration({
  onTemplateSelect,
  onTemplateApply,
  selectedLanguage,
  selectedFramework,
}: TemplateSystemIntegrationProps) {
  const {
    templates,
    filteredTemplates,
    searchQuery,
    selectedCategory,
    selectedLanguage: storeLanguage,
    isLoading,
    fetchTemplates,
    searchTemplates,
    filterByCategory,
    filterByLanguage,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useTemplateStore()

  const [activeTab, setActiveTab] = useState("browse")
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [newTemplate, setNewTemplate] = useState<Partial<CodeTemplate>>({
    name: "",
    description: "",
    prompt: "",
    language: selectedLanguage || "JavaScript",
    framework: selectedFramework || "",
    category: "component",
    tags: [],
    options: {
      temperature: 0.7,
      maxTokens: 1024,
      includeComments: true,
      optimizeFor: "readability",
    },
  })

  // 初始化模板数据
  useEffect(() => {
    if (templates.length === 0) {
      fetchTemplates()
    }
  }, [templates.length, fetchTemplates])

  // 同步外部语言选择
  useEffect(() => {
    if (selectedLanguage && selectedLanguage !== storeLanguage) {
      filterByLanguage(selectedLanguage)
    }
  }, [selectedLanguage, storeLanguage, filterByLanguage])

  // 提取模板变量
  const extractTemplateVariables = (prompt: string): string[] => {
    const matches = prompt.match(/\{\{(\w+)\}\}/g)
    return matches ? matches.map((match) => match.slice(2, -2)) : []
  }

  // 应用模板
  const handleApplyTemplate = (template: CodeTemplate) => {
    const variables = extractTemplateVariables(template.prompt)

    if (variables.length > 0) {
      setSelectedTemplate(template)
      setTemplateVariables(
        variables.reduce(
          (acc, variable) => {
            acc[variable] = ""
            return acc
          },
          {} as Record<string, string>,
        ),
      )
    } else {
      onTemplateApply?.(template, {})
    }
  }

  // 确认应用模板
  const confirmApplyTemplate = () => {
    if (selectedTemplate) {
      onTemplateApply?.(selectedTemplate, templateVariables)
      setSelectedTemplate(null)
      setTemplateVariables({})
    }
  }

  // 创建新模板
  const handleCreateTemplate = async () => {
    if (newTemplate.name && newTemplate.prompt) {
      try {
        await createTemplate(newTemplate as CodeTemplate)
        setIsCreating(false)
        setNewTemplate({
          name: "",
          description: "",
          prompt: "",
          language: selectedLanguage || "JavaScript",
          framework: selectedFramework || "",
          category: "component",
          tags: [],
          options: {
            temperature: 0.7,
            maxTokens: 1024,
            includeComments: true,
            optimizeFor: "readability",
          },
        })
      } catch (error) {
        console.error("创建模板失败:", error)
      }
    }
  }

  // 获取分类统计
  const getCategoryStats = () => {
    const stats: Record<string, number> = {}
    templates.forEach((template) => {
      stats[template.category] = (stats[template.category] || 0) + 1
    })
    return stats
  }

  const categoryStats = getCategoryStats()

  return (
    <div className="space-y-6">
      {/* 模板系统概览 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Template className="h-5 w-5" />
                模板系统集成
              </CardTitle>
              <CardDescription>管理和使用代码生成模板，提高开发效率</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导入模板
              </Button>
              <Button size="sm" onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建模板
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
              <div className="text-sm text-muted-foreground">总模板数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Object.keys(categoryStats).length}</div>
              <div className="text-sm text-muted-foreground">分类数量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{templates.filter((t) => t.isPublic).length}</div>
              <div className="text-sm text-muted-foreground">公开模板</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {templates.reduce((sum, t) => sum + t.usageCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">总使用次数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 模板管理界面 */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="p-6 pb-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="browse">浏览模板</TabsTrigger>
                <TabsTrigger value="manage">管理模板</TabsTrigger>
                <TabsTrigger value="analytics">使用分析</TabsTrigger>
              </TabsList>
            </div>

            {/* 浏览模板 */}
            <TabsContent value="browse" className="p-6 pt-4">
              <div className="space-y-4">
                {/* 搜索和筛选 */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="搜索模板..."
                        value={searchQuery}
                        onChange={(e) => searchTemplates(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={filterByCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有分类</SelectItem>
                      <SelectItem value="component">组件</SelectItem>
                      <SelectItem value="function">函数</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="testing">测试</SelectItem>
                      <SelectItem value="database">数据库</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={storeLanguage} onValueChange={filterByLanguage}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="选择语言" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有语言</SelectItem>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Java">Java</SelectItem>
                      <SelectItem value="Go">Go</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 模板列表 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {filteredTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ scale: 1.02 }}
                        className="group"
                      >
                        <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base line-clamp-1">{template.name}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-1">{template.description}</CardDescription>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="h-3 w-3" />
                                {template.rating.toFixed(1)}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {template.language}
                                </Badge>
                                {template.framework && (
                                  <Badge variant="outline" className="text-xs">
                                    {template.framework}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {template.category}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {template.usageCount} 次使用
                                </div>
                                <div>{new Date(template.updatedAt).toLocaleDateString()}</div>
                              </div>

                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => onTemplateSelect?.(template)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  预览
                                </Button>
                                <Button size="sm" className="flex-1" onClick={() => handleApplyTemplate(template)}>
                                  <Code className="h-3 w-3 mr-1" />
                                  使用
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {filteredTemplates.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Template className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">没有找到匹配的模板</h3>
                    <p className="text-muted-foreground mb-4">尝试调整搜索条件或创建新的模板</p>
                    <Button onClick={() => setIsCreating(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      创建模板
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 管理模板 */}
            <TabsContent value="manage" className="p-6 pt-4">
              <div className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">模板管理</h3>
                <p className="text-muted-foreground">管理您的自定义模板和设置</p>
              </div>
            </TabsContent>

            {/* 使用分析 */}
            <TabsContent value="analytics" className="p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">热门分类</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(categoryStats)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([category, count]) => (
                          <div key={category} className="flex justify-between items-center">
                            <span className="capitalize">{category}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">使用趋势</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">总使用次数</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 模板变量填写对话框 */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">配置模板变量</h3>
                <div className="space-y-4">
                  {Object.keys(templateVariables).map((variable) => (
                    <div key={variable}>
                      <Label htmlFor={variable} className="capitalize">
                        {variable}
                      </Label>
                      <Input
                        id={variable}
                        value={templateVariables[variable]}
                        onChange={(e) =>
                          setTemplateVariables((prev) => ({
                            ...prev,
                            [variable]: e.target.value,
                          }))
                        }
                        placeholder={`请输入 ${variable}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedTemplate(null)}>
                    取消
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={confirmApplyTemplate}
                    disabled={Object.values(templateVariables).some((v) => !v.trim())}
                  >
                    应用模板
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 创建模板对话框 */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">创建新模板</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">模板名称</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="输入模板名称"
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-description">模板描述</Label>
                    <Input
                      id="template-description"
                      value={newTemplate.description}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="输入模板描述"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-language">编程语言</Label>
                      <Select
                        value={newTemplate.language}
                        onValueChange={(value) =>
                          setNewTemplate((prev) => ({
                            ...prev,
                            language: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JavaScript">JavaScript</SelectItem>
                          <SelectItem value="TypeScript">TypeScript</SelectItem>
                          <SelectItem value="Python">Python</SelectItem>
                          <SelectItem value="Java">Java</SelectItem>
                          <SelectItem value="Go">Go</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="template-category">分类</Label>
                      <Select
                        value={newTemplate.category}
                        onValueChange={(value) =>
                          setNewTemplate((prev) => ({
                            ...prev,
                            category: value as any,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="component">组件</SelectItem>
                          <SelectItem value="function">函数</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="testing">测试</SelectItem>
                          <SelectItem value="database">数据库</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="template-prompt">模板提示词</Label>
                    <Textarea
                      id="template-prompt"
                      value={newTemplate.prompt}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          prompt: e.target.value,
                        }))
                      }
                      placeholder="输入模板提示词，使用 {{变量名}} 定义变量"
                      rows={6}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>
                    取消
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCreateTemplate}
                    disabled={!newTemplate.name || !newTemplate.prompt}
                  >
                    创建模板
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
