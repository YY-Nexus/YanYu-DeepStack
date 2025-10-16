"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, SlidersHorizontal, X, Check, Filter } from "lucide-react"
import type { ModelType } from "@/lib/ai/enhanced-ollama-service"

export interface ModelFilters {
  search: string
  types: ModelType[]
  status: string[]
  parameters: string[]
  quantization: string[]
}

interface ModelSearchFiltersProps {
  filters: ModelFilters
  onFiltersChange: (filters: ModelFilters) => void
  modelStats: {
    parameters: { name: string; count: number }[]
    quantization: { name: string; count: number }[]
  }
}

function ModelSearchFilters({ filters, onFiltersChange, modelStats }: ModelSearchFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const [showFilters, setShowFilters] = useState(true)

  // 处理搜索输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  // 提交搜索
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: searchInput })
  }

  // 清除搜索
  const handleClearSearch = () => {
    setSearchInput("")
    onFiltersChange({ ...filters, search: "" })
  }

  // 切换类型过滤器
  const toggleTypeFilter = (type: ModelType) => {
    const newTypes = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type]

    onFiltersChange({ ...filters, types: newTypes })
  }

  // 切换状态过滤器
  const toggleStatusFilter = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status]

    onFiltersChange({ ...filters, status: newStatus })
  }

  // 切换参数过滤器
  const toggleParameterFilter = (param: string) => {
    const newParams = filters.parameters.includes(param)
      ? filters.parameters.filter((p) => p !== param)
      : [...filters.parameters, param]

    onFiltersChange({ ...filters, parameters: newParams })
  }

  // 切换量化过滤器
  const toggleQuantizationFilter = (quant: string) => {
    const newQuant = filters.quantization.includes(quant)
      ? filters.quantization.filter((q) => q !== quant)
      : [...filters.quantization, quant]

    onFiltersChange({ ...filters, quantization: newQuant })
  }

  // 清除所有过滤器
  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      types: [],
      status: [],
      parameters: [],
      quantization: [],
    })
    setSearchInput("")
  }

  // 获取活跃过滤器数量
  const getActiveFilterCount = () => {
    return (
      (filters.search ? 1 : 0) +
      filters.types.length +
      filters.status.length +
      filters.parameters.length +
      filters.quantization.length
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="搜索模型名称或ID..."
          className="pl-9 pr-10"
          value={searchInput}
          onChange={handleSearchChange}
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
            aria-label="清除搜索"
            title="清除搜索"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* 过滤器栏 */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 模型类型过滤器 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              模型类型
              {filters.types.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 min-w-[1.25rem]">
                  {filters.types.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>选择模型类型</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => toggleTypeFilter("chat")} className="flex items-center justify-between">
                对话模型
                {filters.types.includes("chat") && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleTypeFilter("code")} className="flex items-center justify-between">
                代码模型
                {filters.types.includes("code") && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toggleTypeFilter("multimodal")}
                className="flex items-center justify-between"
              >
                多模态模型
                {filters.types.includes("multimodal") && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 模型状态过滤器 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              模型状态
              {filters.status.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 min-w-[1.25rem]">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>选择模型状态</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => toggleStatusFilter("ready")}
                className="flex items-center justify-between"
              >
                已就绪
                {filters.status.includes("ready") && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toggleStatusFilter("downloading")}
                className="flex items-center justify-between"
              >
                下载中
                {filters.status.includes("downloading") && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toggleStatusFilter("queued")}
                className="flex items-center justify-between"
              >
                队列中
                {filters.status.includes("queued") && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toggleStatusFilter("not_downloaded")}
                className="flex items-center justify-between"
              >
                未下载
                {filters.status.includes("not_downloaded") && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 高级过滤器 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              高级过滤
              {(filters.parameters.length > 0 || filters.quantization.length > 0) && (
                <Badge variant="secondary" className="ml-1 px-1 min-w-[1.25rem]">
                  {filters.parameters.length + filters.quantization.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">参数规模</h4>
                <div className="grid grid-cols-2 gap-2">
                  {modelStats.parameters.map((param) => (
                    <div key={param.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`param-${param.name}`}
                        checked={filters.parameters.includes(param.name)}
                        onCheckedChange={() => toggleParameterFilter(param.name)}
                      />
                      <label
                        htmlFor={`param-${param.name}`}
                        className="text-sm flex items-center justify-between w-full"
                      >
                        <span>{param.name}</span>
                        <span className="text-gray-500 text-xs">{param.count}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">量化方式</h4>
                <div className="grid grid-cols-2 gap-2">
                  {modelStats.quantization.map((quant) => (
                    <div key={quant.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`quant-${quant.name}`}
                        checked={filters.quantization.includes(quant.name)}
                        onCheckedChange={() => toggleQuantizationFilter(quant.name)}
                      />
                      <label
                        htmlFor={`quant-${quant.name}`}
                        className="text-sm flex items-center justify-between w-full"
                      >
                        <span>{quant.name}</span>
                        <span className="text-gray-500 text-xs">{quant.count}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 活跃过滤器标签 */}
        <div className="flex flex-wrap gap-1 ml-auto">
          {filters.types.map((type) => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              {type === "chat" ? "对话" : type === "code" ? "代码" : "多模态"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTypeFilter(type)} />
            </Badge>
          ))}

          {filters.status.map((status) => {
            const statusMap: Record<string, string> = {
              ready: "已就绪",
              downloading: "下载中",
              queued: "队列中",
              not_downloaded: "未下载",
            }

            return (
              <Badge key={status} variant="secondary" className="flex items-center gap-1">
                {statusMap[status] || status}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleStatusFilter(status)} />
              </Badge>
            )
          })}

          {filters.parameters.map((param) => (
            <Badge key={param} variant="secondary" className="flex items-center gap-1">
              {param}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleParameterFilter(param)} />
            </Badge>
          ))}

          {filters.quantization.map((quant) => (
            <Badge key={quant} variant="secondary" className="flex items-center gap-1">
              {quant}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleQuantizationFilter(quant)} />
            </Badge>
          ))}

          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 px-2 text-xs">
              清除全部
            </Button>
          )}
        </div>

        {/* 过滤器切换按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          title={showFilters ? "隐藏过滤器" : "显示过滤器"}
          aria-label={showFilters ? "隐藏过滤器" : "显示过滤器"}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* 过滤器内容 */}
      {showFilters && (
        <div className="grid grid-cols-1 gap-4">
          {/* 模型类型过滤器 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                模型类型
                {filters.types.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 min-w-[1.25rem]">
                    {filters.types.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>选择模型类型</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => toggleTypeFilter("chat")} className="flex items-center justify-between">
                  对话模型
                  {filters.types.includes("chat") && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleTypeFilter("code")} className="flex items-center justify-between">
                  代码模型
                  {filters.types.includes("code") && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toggleTypeFilter("multimodal")}
                  className="flex items-center justify-between"
                >
                  多模态模型
                  {filters.types.includes("multimodal") && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 模型状态过滤器 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                模型状态
                {filters.status.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 min-w-[1.25rem]">
                    {filters.status.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>选择模型状态</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => toggleStatusFilter("ready")}
                  className="flex items-center justify-between"
                >
                  已就绪
                  {filters.status.includes("ready") && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toggleStatusFilter("downloading")}
                  className="flex items-center justify-between"
                >
                  下载中
                  {filters.status.includes("downloading") && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toggleStatusFilter("queued")}
                  className="flex items-center justify-between"
                >
                  队列中
                  {filters.status.includes("queued") && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toggleStatusFilter("not_downloaded")}
                  className="flex items-center justify-between"
                >
                  未下载
                  {filters.status.includes("not_downloaded") && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 高级过滤器 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                高级过滤
                {(filters.parameters.length > 0 || filters.quantization.length > 0) && (
                  <Badge variant="secondary" className="ml-1 px-1 min-w-[1.25rem]">
                    {filters.parameters.length + filters.quantization.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">参数规模</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {modelStats.parameters.map((param) => (
                      <div key={param.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`param-${param.name}`}
                          checked={filters.parameters.includes(param.name)}
                          onCheckedChange={() => toggleParameterFilter(param.name)}
                        />
                        <label
                          htmlFor={`param-${param.name}`}
                          className="text-sm flex items-center justify-between w-full"
                        >
                          <span>{param.name}</span>
                          <span className="text-gray-500 text-xs">{param.count}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">量化方式</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {modelStats.quantization.map((quant) => (
                      <div key={quant.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`quant-${quant.name}`}
                          checked={filters.quantization.includes(quant.name)}
                          onCheckedChange={() => toggleQuantizationFilter(quant.name)}
                        />
                        <label
                          htmlFor={`quant-${quant.name}`}
                          className="text-sm flex items-center justify-between w-full"
                        >
                          <span>{quant.name}</span>
                          <span className="text-gray-500 text-xs">{quant.count}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}

export { ModelSearchFilters }
export default ModelSearchFilters
