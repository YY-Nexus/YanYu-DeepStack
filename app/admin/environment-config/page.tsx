"use client"

import { Suspense } from "react"
import SimplifiedEnvironmentDashboard from "@/components/admin/simplified-environment-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EnvironmentConfigPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">环境配置管理</h1>
        <p className="text-muted-foreground">管理言語云³深度堆栈的环境变量配置，确保系统正常运行</p>
      </div>

      <Suspense fallback={<ConfigDashboardSkeleton />}>
        <SimplifiedEnvironmentDashboard />
      </Suspense>
    </div>
  )
}

// 加载骨架屏
function ConfigDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 概览卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <div>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 配置列表骨架 */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
