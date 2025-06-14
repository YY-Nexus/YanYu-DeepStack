"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

interface MarkdownPreviewProps {
  content: string
  className?: string
}

export default function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  // 简单的Markdown解析器（实际项目中建议使用react-markdown）
  const parsedContent = useMemo(() => {
    // 安全处理：转义HTML标签
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
    }

    // 预处理内容
    let html = escapeHtml(content)

    // 处理代码块 (\`\`\`)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
      return `<pre class="bg-gray-900 text-green-400 p-4 rounded-lg my-4 overflow-x-auto"><code class="font-mono text-sm">${code.trim()}</code></pre>`
    })

    // 处理标题
    html = html
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-800 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')

    // 处理粗体和斜体
    html = html
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-gray-700">$1</em>')

    // 处理行内代码
    html = html.replace(
      /`([^`]+)`/gim,
      '<code class="bg-gray-100 text-coral-pink px-1.5 py-0.5 rounded font-mono text-sm">$1</code>',
    )

    // 处理链接
    html = html.replace(
      /\[([^\]]+)\]$$([^)]+)$$/gim,
      '<a href="$2" class="text-cloud-blue-500 hover:text-cloud-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>',
    )

    // 处理引用
    html = html.replace(
      /^> (.*$)/gim,
      '<blockquote class="border-l-4 border-cloud-blue-500 pl-4 py-2 my-4 bg-cloud-blue-50 text-gray-700 italic">$1</blockquote>',
    )

    // 处理无序列表
    html = html
      .replace(/^\s*[-*+]\s+(.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/(<li.*?<\/li>)\s*(<li.*?<\/li>)/gs, '<ul class="list-disc my-4 pl-5">$1$2</ul>')

    // 处理有序列表
    html = html
      .replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="ml-4 mb-1">$2</li>')
      .replace(/(<li.*?<\/li>)\s*(<li.*?<\/li>)/gs, '<ol class="list-decimal my-4 pl-5">$1$2</ol>')

    // 处理水平线
    html = html.replace(/^---+$/gim, '<hr class="my-6 border-t border-gray-300" />')

    // 处理图片
    html = html.replace(
      /!\[([^\]]+)\]$$([^)]+)$$/gim,
      '<img src="$2" alt="$1" class="max-w-full my-4 rounded-lg shadow-sm" />',
    )

    // 处理表格 (简化版)
    html = html.replace(
      /\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/gim,
      '<table class="min-w-full my-4 border-collapse"><thead><tr>$1</tr></thead><tbody>$2</tbody></table>',
    )
    html = html.replace(/\|([^|]+)\|/gim, '<td class="border px-4 py-2">$1</td>')
    html = html.replace(/<tr>(.+?)<\/tr>/gim, "<tr>$1</tr>")

    // 处理换行
    html = html.replace(/\n/gim, "<br>")

    return html
  }, [content])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`h-full overflow-auto p-6 bg-white ${className}`}
    >
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: parsedContent }} />
    </motion.div>
  )
}
