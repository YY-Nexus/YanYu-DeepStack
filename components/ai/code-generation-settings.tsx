"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings2, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { CodeGenerationOptions } from "@/lib/ai/model-code-integration"

interface CodeGenerationSettingsProps {
  options: CodeGenerationOptions
  onChange: (options: CodeGenerationOptions) => void
  className?: string
}

export default function CodeGenerationSettings({ options, onChange, className }: CodeGenerationSettingsProps) {
  const [open, setOpen] = useState(false)

  // 支持的编程语言
  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
  ]

  // 框架映射
  const frameworksByLanguage: Record<string, { value: string; label: string }[]> = {
    javascript: [
      { value: "react", label: "React" },
      { value: "vue", label: "Vue" },
      { value: "angular", label: "Angular" },
      { value: "express", label: "Express" },
      { value: "next.js", label: "Next.js" },
    ],
    typescript: [
      { value: "react", label: "React" },
      { value: "vue", label: "Vue" },
      { value: "angular", label: "Angular" },
      { value: "express", label: "Express" },
      { value: "next.js", label: "Next.js" },
    ],
    python: [
      { value: "django", label: "Django" },
      { value: "flask", label: "Flask" },
      { value: "fastapi", label: "FastAPI" },
      { value: "pytorch", label: "PyTorch" },
      { value: "tensorflow", label: "TensorFlow" },
    ],
    java: [
      { value: "spring", label: "Spring" },
      { value: "hibernate", label: "Hibernate" },
      { value: "android", label: "Android" },
    ],
    csharp: [
      { value: "dotnet", label: ".NET Core" },
      { value: "aspnet", label: "ASP.NET" },
      { value: "xamarin", label: "Xamarin" },
      { value: "unity", label: "Unity" },
    ],
    // 其他语言的框架...
  }

  // 获取当前语言的可用框架
  const availableFrameworks = options.language ? frameworksByLanguage[options.language] || [] : []

  // 更新单个选项
  const updateOption = <K extends keyof CodeGenerationOptions>(key: K, value: CodeGenerationOptions[K]) => {
    onChange({ ...options, [key]: value })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Settings2 className="h-4 w-4 mr-2" />
          生成设置
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">代码生成设置</h4>
            <p className="text-sm text-muted-foreground">自定义AI代码生成的参数和偏好</p>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Label htmlFor="temperature" className="mr-2">
                  温度
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        控制生成代码的随机性。较低的值使输出更确定，较高的值使输出更多样化。
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm">{options.temperature?.toFixed(2) || "0.70"}</span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.05}
              value={[options.temperature || 0.7]}
              onValueChange={(value) => updateOption("temperature", value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>确定性</span>
              <span>创造性</span>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Label htmlFor="maxTokens" className="mr-2">
                  最大长度
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        限制生成代码的最大长度。较大的值允许更长的代码，但可能增加生成时间。
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm">{options.maxTokens || 2048} tokens</span>
            </div>
            <Slider
              id="maxTokens"
              min={512}
              max={4096}
              step={512}
              value={[options.maxTokens || 2048]}
              onValueChange={(value) => updateOption("maxTokens", value[0])}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="language">编程语言</Label>
            <Select
              value={options.language || ""}
              onValueChange={(value) => {
                updateOption("language", value)
                // 清除框架选择，因为语言变了
                updateOption("framework", undefined)
              }}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="选择语言" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">自动检测</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {options.language && availableFrameworks.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="framework">框架</Label>
              <Select value={options.framework || ""} onValueChange={(value) => updateOption("framework", value)}>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="选择框架" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无框架</SelectItem>
                  {availableFrameworks.map((framework) => (
                    <SelectItem key={framework.value} value={framework.value}>
                      {framework.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="optimizeFor">优化目标</Label>
            <Select
              value={options.optimizeFor || ""}
              onValueChange={(value: any) => updateOption("optimizeFor", value)}
            >
              <SelectTrigger id="optimizeFor">
                <SelectValue placeholder="选择优化目标" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">平衡</SelectItem>
                <SelectItem value="readability">可读性</SelectItem>
                <SelectItem value="performance">性能</SelectItem>
                <SelectItem value="security">安全性</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="includeComments"
              checked={options.includeComments || false}
              onCheckedChange={(checked) => updateOption("includeComments", checked)}
            />
            <Label htmlFor="includeComments">包含详细注释</Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
