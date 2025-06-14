import type { Metadata } from "next"
import TemplateExplorer from "@/components/templates/template-explorer"

export const metadata: Metadata = {
  title: "代码模板库 | 言語云³ 深度堆栈全栈智创引擎",
  description: "浏览、创建和管理代码生成模板，提高开发效率",
}

export default function TemplatesPage() {
  return (
    <div className="container py-6">
      <TemplateExplorer />
    </div>
  )
}
