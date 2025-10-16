"use client"

import { EnhancedCodeReviewPanel } from '@/components/analysis/enhanced-code-review-panel'

export default function CodeReviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">智能代码评审</h1>
          <p className="text-muted-foreground mt-2">
            AI 驱动的代码质量分析与评审系统，提供专业的代码改进建议
          </p>
        </div>
        
        <EnhancedCodeReviewPanel />
      </div>
    </div>
  )
}
