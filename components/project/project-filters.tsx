"use client"

import { BrandButton } from "@/components/ui/brand-button"

interface ProjectFiltersProps {
  filters: {
    type: string
    status: string
    language: string
    sortBy: string
    sortOrder: "asc" | "desc"
  }
  onFiltersChange: (filters: any) => void
}

export default function ProjectFilters({ filters, onFiltersChange }: ProjectFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      type: "",
      status: "",
      language: "",
      sortBy: "updatedAt",
      sortOrder: "desc",
    })
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 项目类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">项目类型</label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
          >
            <option value="">全部类型</option>
            <option value="web">Web应用</option>
            <option value="mobile">移动应用</option>
            <option value="desktop">桌面应用</option>
            <option value="api">API服务</option>
            <option value="ai-model">AI模型</option>
          </select>
        </div>

        {/* 项目状态 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">项目状态</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
          >
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="archived">已归档</option>
            <option value="template">模板</option>
          </select>
        </div>

        {/* 编程语言 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">编程语言</label>
          <select
            value={filters.language}
            onChange={(e) => updateFilter("language", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
          >
            <option value="">全部语言</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>

        {/* 排序方式 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
          <div className="flex space-x-2">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter("sortBy", e.target.value)}
              className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
            >
              <option value="updatedAt">更新时间</option>
              <option value="createdAt">创建时间</option>
              <option value="name">项目名称</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilter("sortOrder", e.target.value)}
              className="w-20 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </div>
      </div>

      {/* 清除过滤器 */}
      <div className="mt-4 flex justify-end">
        <BrandButton variant="outline" size="sm" onClick={clearFilters}>
          清除过滤器
        </BrandButton>
      </div>
    </div>
  )
}
