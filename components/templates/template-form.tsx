"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Info } from "lucide-react"
import type { CodeTemplate, TemplateCategory, CreateTemplateRequest, UpdateTemplateRequest } from "@/types/template"

// 表单验证模式
const templateFormSchema = z.object({
  name: z.string().min(2, "名称至少需要2个字符").max(50, "名称不能超过50个字符"),
  description: z.string().min(10, "描述至少需要10个字符").max(200, "描述不能超过200个字符"),
  prompt: z.string().min(20, "提示词至少需要20个字符"),
  language: z.string().optional(),
  framework: z.string().optional(),
  category: z.enum(["component", "function", "api", "database", "algorithm", "utility", "testing", "documentation", "other"]),
  tags: z.array(z.string()),
  options: z.object({
    temperature: z.number().min(0).max(1),
    maxTokens: z.number().min(100).max(4096),
    includeComments: z.boolean(),
    optimizeFor: z.enum(["readability", "performance", "security", "balanced"]).optional(),
  }),
  isPublic: z.boolean(),
})

type TemplateFormValues = z.infer<typeof templateFormSchema>

interface TemplateFormProps {
  template?: CodeTemplate
  onSubmit: (data: CreateTemplateRequest | UpdateTemplateRequest) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function TemplateForm({ template, onSubmit, onCancel, isSubmitting = false }: TemplateFormProps) {
  const [newTag, setNewTag] = useState("")

  // 初始化表单
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: template
      ? {
          name: template.name,
          description: template.description,
          prompt: template.prompt,
          language: template.language || "",
          framework: template.framework || "",
          category: template.category,
          tags: template.tags,
          options: {
            temperature: template.options.temperature || 0.7,
            maxTokens: template.options.maxTokens || 2048,
            includeComments: template.options.includeComments || false,
            optimizeFor: template.options.optimizeFor || "balanced",
          },
          isPublic: template.isPublic,
        }
      : {
          name: "",
          description: "",
          prompt: "",
          language: "",
          framework: "",
          category: "other",
          tags: [],
          options: {
            temperature: 0.7,
            maxTokens: 2048,
            includeComments: true,
            optimizeFor: "balanced",
          },
          isPublic: true,
        },
  })

  // 处理表单提交
  const handleSubmit = (values: TemplateFormValues) => {
    if (template) {
      // 更新现有模板
      onSubmit({
        id: template.id,
        ...values,
      })
    } else {
      // 创建新模板
      onSubmit(values)
    }
  }

  // 添加标签
  const addTag = () => {
    if (!newTag.trim()) return

    const currentTags = form.getValues("tags")
    if (currentTags.includes(newTag.trim())) return

    form.setValue("tags", [...currentTags, newTag.trim()])
    setNewTag("")
  }

  // 删除标签
  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags")
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
    )
  }

  // 处理标签输入键盘事件
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 基本信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">基本信息</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>模板名称</FormLabel>
                <FormControl>
                  <Input placeholder="输入模板名称" {...field} />
                </FormControl>
                <FormDescription>简洁明了的名称，便于识别模板用途</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>模板描述</FormLabel>
                <FormControl>
                  <Textarea placeholder="描述这个模板的用途和特点" className="resize-none" {...field} />
                </FormControl>
                <FormDescription>详细说明模板的功能和适用场景</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>提示词模板</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="输入提示词模板，使用 {{变量名}} 表示可替换的变量"
                    className="min-h-[150px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  使用 {"{{变量名}}"} 表示可替换的变量，如 {"{{componentName}}"} 或 {"{{functionality}}"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 分类信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">分类信息</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>类别</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择模板类别" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="component">组件</SelectItem>
                      <SelectItem value="function">函数</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="database">数据库</SelectItem>
                      <SelectItem value="algorithm">算法</SelectItem>
                      <SelectItem value="utility">工具</SelectItem>
                      <SelectItem value="testing">测试</SelectItem>
                      <SelectItem value="documentation">文档</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>编程语言</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择编程语言（可选）" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unspecified">不指定</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                      <SelectItem value="php">PHP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>可选，指定模板适用的编程语言</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="framework"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>框架</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择框架（可选）" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unspecified">不指定</SelectItem>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vue">Vue</SelectItem>
                      <SelectItem value="angular">Angular</SelectItem>
                      <SelectItem value="next.js">Next.js</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="django">Django</SelectItem>
                      <SelectItem value="flask">Flask</SelectItem>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="dotnet">.NET</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>可选，指定模板适用的框架</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label>标签</Label>
              <div className="flex mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="添加标签"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag} className="ml-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">添加关键词标签，便于搜索和分类</p>

              <div className="flex flex-wrap gap-2 mt-3">
                {form.watch("tags").map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
                {form.watch("tags").length === 0 && <span className="text-sm text-muted-foreground">暂无标签</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 生成选项 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">生成选项</h3>

          <FormField
            control={form.control}
            name="options.temperature"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>温度</FormLabel>
                  <span className="text-sm">{field.value.toFixed(2)}</span>
                </div>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>确定性</span>
                  <span>创造性</span>
                </div>
                <FormDescription className="flex items-center mt-1">
                  <Info className="h-3.5 w-3.5 mr-1" />
                  控制生成代码的随机性，较低的值使输出更确定，较高的值使输出更多样化
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="options.maxTokens"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>最大长度</FormLabel>
                  <span className="text-sm">{field.value} tokens</span>
                </div>
                <FormControl>
                  <Slider
                    min={512}
                    max={4096}
                    step={512}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>较短</span>
                  <span>较长</span>
                </div>
                <FormDescription className="flex items-center mt-1">
                  <Info className="h-3.5 w-3.5 mr-1" />
                  限制生成代码的最大长度，较大的值允许更长的代码，但可能增加生成时间
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="options.includeComments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">包含详细注释</FormLabel>
                    <FormDescription>在生成的代码中添加详细的中文注释</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="options.optimizeFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>优化目标</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择优化目标" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="balanced">平衡</SelectItem>
                      <SelectItem value="readability">可读性</SelectItem>
                      <SelectItem value="performance">性能</SelectItem>
                      <SelectItem value="security">安全性</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>指定代码生成时优先考虑的因素</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* 可见性设置 */}
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">公开模板</FormLabel>
                <FormDescription>允许其他用户查看和使用此模板</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 表单操作按钮 */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : template ? "更新模板" : "创建模板"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
