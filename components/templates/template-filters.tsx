"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import type { TemplateFilter, TemplateCategory } from "@/types/template"

interface TemplateFiltersProps {
  filter: TemplateFilter
  onFilterChange: (filter: Partial<TemplateFilter>) => void
  onResetFilters: () => void
  className?: string
}

export default function TemplateFilters({
  filter,
  onFilterChange,
  onResetFilters,
  className = "",
}: TemplateFiltersProps) {
  const [searchValue, setSearchValue] = useState(filter.search || "")

  // 处理搜索
  const handleSearch = () => {
    onFilterChange({ search: searchValue })
  }

  // 处理搜索输入
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    if (e.target.value === "") {
      onFilterChange({ search: undefined })
    }
  }

  // 处理搜索键盘事件
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // 处理排序变化
  const handleSortChange = (value: string) => {
    onFilterChange({ sortBy: value as "popular" | "recent" | "rating" })
  }

  // 处理类别变化
  const handleCategoryChange = (value: string) => {
    onFilterChange({ category: value as TemplateCategory })
  }

  // 处理语言变化
  const handleLanguageChange = (value: string) => {
    onFilterChange({ language: value === "all" ? undefined : value })
  }

  // 处理框架变化
  const handleFrameworkChange = (value: string) => {
    onFilterChange({ framework: value === "all" ? undefined : value })
  }

  // 处理公开/私有变化
  const handleVisibilityChange = (value: string) => {
    if (value === "all") {
      onFilterChange({ isPublic: undefined })
    } else {
      onFilterChange({ isPublic: value === "public" })
    }
  }

  // 获取活跃过滤器数量
  const getActiveFilterCount = () => {
    let count = 0
    if (filter.search) count++
    if (filter.category) count++
    if (filter.language) count++
    if (filter.framework) count++
    if (filter.tags && filter.tags.length > 0) count++
    if (filter.isPublic !== undefined) count++
    return count
  }

  // 移除单个过滤器
  const removeFilter = (key: keyof TemplateFilter) => {
    onFilterChange({ [key]: undefined })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 搜索栏 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="搜索模板..."
            value={searchValue}
            onChange={handleSearchInput}
            onKeyDown={handleSearchKeyDown}
            className="pl-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              筛选
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">筛选模板</h4>
                <p className="text-sm text-muted-foreground">根据不同条件筛选模板</p>
              </div>

              {/* 类别筛选 */}
              <div className="space-y-2">
                <Label htmlFor="category">类别</Label>
                <Select value={filter.category || "all"} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="选择类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类别</SelectItem>
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
              </div>

              {/* 语言筛选 */}
              <div className="space-y-2">
                <Label htmlFor="language">编程语言</Label>
                <Select value={filter.language || "all"} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部语言</SelectItem>
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
              </div>

              {/* 框架筛选 */}
              <div className="space-y-2">
                <Label htmlFor="framework">框架</Label>
                <Select value={filter.framework || "all"} onValueChange={handleFrameworkChange}>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="选择框架" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部框架</SelectItem>
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
              </div>

              {/* 可见性筛选 */}
              <div className="space-y-2">
                <Label htmlFor="visibility">可见性</Label>
                <Select
                  value={filter.isPublic === undefined ? "all" : filter.isPublic ? "public" : "private"}
                  onValueChange={handleVisibilityChange}
                >
                  <SelectTrigger id="visibility">
                    <SelectValue placeholder="选择可见性" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="public">公开</SelectItem>
                    <SelectItem value="private">私有</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 排序方式 */}
              <div className="space-y-2">
                <Label htmlFor="sortBy">排序方式</Label>
                <Select value={filter.sortBy || "popular"} onValueChange={handleSortChange}>
                  <SelectTrigger id="sortBy">
                    <SelectValue placeholder="选择排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">最受欢迎</SelectItem>
                    <SelectItem value="recent">最近更新</SelectItem>
                    <SelectItem value="rating">最高评分</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 重置按钮 */}
              <Button variant="outline" onClick={onResetFilters} className="w-full">
                重置筛选条件
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={filter.sortBy || "popular"} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">最受欢迎</SelectItem>
            <SelectItem value="recent">最近更新</SelectItem>
            <SelectItem value="rating">最高评分</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 活跃过滤器标签 */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filter.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              搜索: {filter.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("search")} />
            </Badge>
          )}

          {filter.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              类别: {filter.category}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("category")} />
            </Badge>
          )}

          {filter.language && (
            <Badge variant="secondary" className="flex items-center gap-1">
              语言: {filter.language}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("language")} />
            </Badge>
          )}

          {filter.framework && (
            <Badge variant="secondary" className="flex items-center gap-1">
              框架: {filter.framework}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("framework")} />
            </Badge>
          )}

          {filter.isPublic !== undefined && (
            <Badge variant="secondary" className="flex items-center gap-1">
              可见性: {filter.isPublic ? "公开" : "私有"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("isPublic")} />
            </Badge>
          )}

          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={onResetFilters} className="h-6 text-xs">
              清除全部
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
