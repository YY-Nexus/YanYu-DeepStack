"use client"

"use client"

import dynamic from 'next/dynamic'

// 动态导入客户端组件
const IntegratedCodePreview = dynamic(() => 
  import("@/components/modules/integrated-code-preview")
)

export default function CodePreviewPage() {
  return <IntegratedCodePreview />
}
