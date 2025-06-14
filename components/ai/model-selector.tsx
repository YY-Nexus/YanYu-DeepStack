"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Loader2, AlertCircle, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useModelCodeIntegration } from "@/lib/ai/model-code-integration"
import { cn } from "@/lib/utils"

interface ModelSelectorProps {
  className?: string
  onModelSelect?: (modelId: string) => void
}

export default function ModelSelector({ className, onModelSelect }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const { availableModels, selectedModelId, isLoadingModels, modelError, selectModel, loadAvailableModels } =
    useModelCodeIntegration()

  // 当选择模型变化时触发外部回调
  useEffect(() => {
    if (selectedModelId && onModelSelect) {
      onModelSelect(selectedModelId)
    }
  }, [selectedModelId, onModelSelect])

  // 获取当前选择的模型
  const selectedModel = availableModels.find((model) => model.id === selectedModelId)

  // 处理模型选择
  const handleSelectModel = (modelId: string) => {
    selectModel(modelId)
    setOpen(false)
  }

  // 获取模型类型标签
  const getModelTypeBadge = (type: string) => {
    switch (type) {
      case "code":
        return <Badge variant="secondary">代码</Badge>
      case "chat":
        return <Badge variant="outline">通用</Badge>
      case "multimodal":
        return <Badge variant="outline">多模态</Badge>
      default:
        return null
    }
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-w-[200px] justify-between"
            disabled={isLoadingModels}
          >
            {isLoadingModels ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>加载模型中...</span>
              </div>
            ) : selectedModel ? (
              <div className="flex items-center">
                <span>{selectedModel.name}</span>
                {getModelTypeBadge(selectedModel.type)}
              </div>
            ) : (
              <span className="text-muted-foreground">选择AI模型</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          {modelError ? (
            <div className="p-4 text-center">
              <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-500">{modelError}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => loadAvailableModels()}>
                重试
              </Button>
            </div>
          ) : (
            <Command>
              <CommandInput placeholder="搜索模型..." />
              <CommandList>
                <CommandEmpty>未找到模型</CommandEmpty>
                <CommandGroup heading="可用模型">
                  {availableModels.map((model) => (
                    <CommandItem key={model.id} value={model.id} onSelect={() => handleSelectModel(model.id)}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Check
                            className={cn("mr-2 h-4 w-4", selectedModelId === model.id ? "opacity-100" : "opacity-0")}
                          />
                          <span>{model.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getModelTypeBadge(model.type)}
                          <Badge variant="outline" className="text-xs">
                            {model.parameters}
                          </Badge>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup>
                  <div className="p-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setOpen(false)
                        window.location.href = "/admin/model-management"
                      }}
                    >
                      <Server className="h-3 w-3 mr-1" />
                      管理模型
                    </Button>
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
