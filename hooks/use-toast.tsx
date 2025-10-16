"use client"

import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// 常量配置
const TOAST_LIMIT = 3 // 最多同时显示3个Toast
const TOAST_DISPLAY_DURATION = 5000 // 默认显示5秒
const TOAST_ANIMATION_DURATION = 300 // 动画持续时间

// Toast类型定义 - 添加了timerId属性
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open: boolean
  isDismissing?: boolean
  createdAt: number
  timerId?: ReturnType<typeof setTimeout> // 添加timerId属性
}

// 动作类型
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

// 生成唯一ID
let toastIdCounter = 0
function genId() {
  toastIdCounter = (toastIdCounter + 1) % Number.MAX_SAFE_INTEGER
  return `toast-${Date.now()}-${toastIdCounter}`
}

// 动作类型定义
type ActionType = typeof actionTypes

type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: string }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: string }

// 状态类型
interface State {
  toasts: ToasterToast[]
}

// Toast上下文
export const ToastContext = React.createContext<{
  state: State
  dispatch: React.Dispatch<Action>
} | null>(null)

// Toast提供者组件
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] })
  
  // 自动管理Toast生命周期
  React.useEffect(() => {
    const activeToasts = state.toasts.filter(t => t.open && !t.isDismissing)
    
    // 为每个Toast设置自动关闭计时器
    activeToasts.forEach(toast => {
      const duration = toast.duration ?? TOAST_DISPLAY_DURATION
      
      // 创建新的Toast时设置计时器
      if (!toast.timerId) {
        const timerId = setTimeout(() => {
          dispatch({ type: "DISMISS_TOAST", toastId: toast.id })
        }, duration)
        
        // 更新Toast添加timerId
        dispatch({
          type: "UPDATE_TOAST",
          toast: { id: toast.id, timerId }
        })
      }
    })
    
    // 清理已关闭的Toast计时器
    return () => {
      state.toasts.forEach(toast => {
        if (toast.timerId) {
          clearTimeout(toast.timerId)
        }
      })
    }
  }, [state.toasts])
  
  // 清理已关闭的Toast
  React.useEffect(() => {
    const dismissedToasts = state.toasts.filter(t => !t.open && t.isDismissing)
    
    dismissedToasts.forEach(toast => {
      // 等待动画完成后移除Toast
      setTimeout(() => {
        dispatch({ type: "REMOVE_TOAST", toastId: toast.id })
      }, TOAST_ANIMATION_DURATION)
    })
  }, [state.toasts])

  return (
    <ToastContext.Provider value={{ state, dispatch }}>
      {children}
    </ToastContext.Provider>
  )
}

// 状态管理reducer
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // 确保ID唯一
      const isDuplicate = state.toasts.some(t => t.id === action.toast.id)
      const toast = isDuplicate ? { ...action.toast, id: genId() } : action.toast
      
      return {
        ...state,
        toasts: [toast, ...state.toasts]
          .filter((t, index, self) => self.findIndex(tt => tt.id === t.id) === index)
          .slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      if (!action.toast.id) return state
      return {
        ...state,
        toasts: state.toasts.map(t => 
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST":
      const { toastId } = action
      
      // 清除计时器
      if (toastId) {
        const toast = state.toasts.find(t => t.id === toastId)
        if (toast?.timerId) {
          clearTimeout(toast.timerId)
        }
      } else {
        state.toasts.forEach(t => {
          if (t.timerId) {
            clearTimeout(t.timerId)
          }
        })
      }
      
      return {
        ...state,
        toasts: state.toasts.map(t => 
          (toastId === undefined || t.id === toastId)
            ? { ...t, open: false, isDismissing: true } 
            : t
        ),
      }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return { ...state, toasts: [] }
      }
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.toastId),
      }

    default:
      return state
  }
}

// Toast控制器类型
type ToastOptions = Omit<ToasterToast, "id" | "open" | "onOpenChange" | "createdAt" | "timerId" | "isDismissing">

// Toast控制器Hook
export function useToastController() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToastController must be used within a ToastProvider")
  }
  
  const { dispatch } = context
  
  const toast = React.useCallback((options: ToastOptions) => {
    const id = genId()
    
    const update = (props: Partial<ToasterToast>) => 
      dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
      
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })
    
    // 添加默认值
    const defaultOptions = {
      open: true,
      createdAt: Date.now(),
      onOpenChange: (open: boolean) => {
        if (!open) dismiss()
      },
    }
    
    dispatch({
      type: "ADD_TOAST",
      toast: { ...defaultOptions, ...options, id },
    })
    
    return { id, dismiss, update }
  }, [dispatch])
  
  const dismiss = React.useCallback(
    (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    [dispatch]
  )
  
  return { toast, dismiss }
}

// 主Hook
export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  const { state } = context
  const controller = useToastController()
  
  return {
    ...state,
    ...controller,
  }
}

// 便捷的toast函数，可以在任何地方调用
export const toast = {
  success: (message: string, options?: Partial<ToastOptions>) => ({
    title: "成功",
    description: message,
    variant: "default" as const,
    ...options,
  }),
  
  error: (message: string, options?: Partial<ToastOptions>) => ({
    title: "错误",
    description: message,
    variant: "destructive" as const,
    ...options,
  }),
  
  info: (message: string, options?: Partial<ToastOptions>) => ({
    title: "信息",
    description: message,
    variant: "default" as const,
    ...options,
  }),
  
  warning: (message: string, options?: Partial<ToastOptions>) => ({
    title: "警告",
    description: message,
    variant: "default" as const,
    ...options,
  }),
}