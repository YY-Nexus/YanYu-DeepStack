import EnhancedModelDashboard from "@/components/ai/enhanced-model-dashboard"

export const metadata = {
  title: "AI模型管理中心 - 言語云³深度堆栈",
  description: "增强版AI模型管理中心，支持并发下载、实时监控和智能推荐",
}

export default function EnhancedModelManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <EnhancedModelDashboard />
    </div>
  )
}
