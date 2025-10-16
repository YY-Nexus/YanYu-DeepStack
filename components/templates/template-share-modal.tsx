"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { CodeTemplate } from "@/types/template"

interface TemplateShareModalProps {
  isOpen: boolean
  onClose: () => void
  template: CodeTemplate
}

export default function TemplateShareModal({ isOpen, onClose, template }: TemplateShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [emailAddress, setEmailAddress] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const { toast } = useToast()

  // 生成分享链接
  const shareUrl = `${window.location.origin}/templates/${template.id}`

  // 生成嵌入代码
  const embedCode = `// 言語云³ 深度堆栈全栈智创引擎 - 代码模板
// 模板ID: ${template.id}
// 模板名称: ${template.name}
// 使用方法: 将此代码复制到您的项目中，然后调用 useTemplate 函数

import { useModelCodeIntegration } from "@/lib/ai/model-code-integration"

export async function useTemplate(variables = {}) {
  const { generateCode } = useModelCodeIntegration()
  
  // 替换模板中的变量
  let prompt = \`${template.prompt}\`
  
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp("{{" + key + "}}", "g"), value)
  }
  
  // 生成代码
  const result = await generateCode(prompt, ${JSON.stringify(template.options, null, 2)})
  
  return result
}
`

  // 复制链接
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)

    toast({
      title: "链接已复制",
      description: "分享链接已复制到剪贴板",
    })
  }

  // 复制嵌入代码
  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode)

    toast({
      title: "代码已复制",
      description: "嵌入代码已复制到剪贴板",
    })
  }

  // 通过邮件分享
  const shareByEmail = () => {
    if (!emailAddress) {
      toast({
        title: "请输入邮箱地址",
        description: "请输入有效的邮箱地址",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    // 模拟发送邮件
    setTimeout(() => {
      setIsSending(false)
      setEmailAddress("")
      setMessage("")

      toast({
        title: "分享成功",
        description: `模板已成功分享给 ${emailAddress}`,
      })
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            分享模板
          </DialogTitle>
          <DialogDescription>分享 "{template.name}" 模板给其他人</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="link">链接</TabsTrigger>
            <TabsTrigger value="embed">嵌入</TabsTrigger>
            <TabsTrigger value="email">邮件</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>分享链接</Label>
              <div className="flex items-center space-x-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button size="icon" variant="outline" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`查看这个代码模板: ${template.name}`)}`,
                    "_blank",
                  )
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                    "_blank",
                  )
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  window.open(
                    `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`查看这个代码模板: ${template.name}`)}`,
                    "_blank",
                  )
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.9-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.178.12.13.145.309.16.396-.002.073-.003.175-.004.308z" />
                </svg>
                Telegram
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <div className="space-y-2">
              <Label>嵌入代码</Label>
              <Textarea value={embedCode} readOnly className="font-mono text-xs h-[200px]" />
              <Button onClick={copyEmbedCode} variant="outline" className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                复制代码
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label>收件人邮箱</Label>
              <Input
                type="email"
                placeholder="example@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>消息（可选）</Label>
              <Textarea
                placeholder="添加个人消息..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none h-[100px]"
              />
            </div>

            <Button onClick={shareByEmail} disabled={!emailAddress || isSending} className="w-full">
              {isSending ? "发送中..." : "发送邮件"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
