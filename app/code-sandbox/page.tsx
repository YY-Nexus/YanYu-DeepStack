import type { Metadata } from "next"
import CodeSandboxExplorer from "@/components/code/code-sandbox-explorer"

export const metadata: Metadata = {
  title: "代码沙箱 | 言語云³ 深度堆栈全栈智创引擎",
  description: "安全执行和测试代码，支持多种编程语言",
}

export default function CodeSandboxPage() {
  return (
    <div className="container py-6">
      <CodeSandboxExplorer />
    </div>
  )
}
