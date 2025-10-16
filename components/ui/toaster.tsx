"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

export function Toaster() {
  const [mounted, setMounted] = useState(false)
  const { toasts } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 只在客户端挂载后渲染 toasts
  if (!mounted) {
    return (
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
