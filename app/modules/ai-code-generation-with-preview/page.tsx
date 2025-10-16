import AICodeGenerationWithPreview from "@/components/modules/ai-code-generation-with-preview"
"use client"

import dynamic from 'next/dynamic'

// 动态导入客户端组件
const CodeGenerationComponent = dynamic(() => 
  import("@/components/modules/ai-code-generation-with-preview")
)

export default function AICodeGenerationWithPreviewPage() {
  return <CodeGenerationComponent />
}
