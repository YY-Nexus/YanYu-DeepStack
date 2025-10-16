// 无障碍访问增强方案

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/src/store/app-store'

// 1. 键盘导航增强
export function useKeyboardNavigation() {
  const focusedElement = useRef<HTMLElement | null>(null)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab键导航优化
      if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        const focusableArray = Array.from(focusableElements) as HTMLElement[]
        const currentIndex = focusableArray.indexOf(document.activeElement as HTMLElement)
        
        if (e.shiftKey) {
          // Shift+Tab 向前导航
          const prevIndex = (currentIndex - 1 + focusableArray.length) % focusableArray.length
          focusableArray[prevIndex]?.focus()
        } else {
          // Tab 向后导航
          const nextIndex = (currentIndex + 1) % focusableArray.length
          focusableArray[nextIndex]?.focus()
        }
        
        e.preventDefault()
      }
      
      // 空格键和回车键激活
      if ((e.key === ' ' || e.key === 'Enter') && document.activeElement) {
        const element = document.activeElement as HTMLElement
        if (element.tagName === 'BUTTON' || element.hasAttribute('role')) {
          element.click()
          e.preventDefault()
        }
      }
      
      // ESC键关闭模态框
      if (e.key === 'Escape') {
        const modal = document.querySelector('[role="dialog"]')
        if (modal) {
          const closeButton = modal.querySelector('[data-close]') as HTMLElement
          closeButton?.click()
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}

// 2. 屏幕阅读器支持
export function useScreenReader() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
  
  return { announce }
}

// 3. 高对比度主题
export const highContrastTheme = {
  colors: {
    background: '#000000',
    foreground: '#FFFFFF',
    primary: '#FFFF00',
    secondary: '#00FFFF',
    accent: '#FF00FF',
    destructive: '#FF0000',
    border: '#FFFFFF',
    input: '#FFFFFF',
    ring: '#FFFF00',
  }
}

// 4. 字体大小控制
export function useFontSizeControl() {
  const { accessibility, updateAccessibility } = useAppStore()
  
  const increaseFontSize = () => {
    const newSize = Math.min((accessibility.fontSize || 16) + 2, 24)
    updateAccessibility({ ...accessibility, fontSize: newSize })
    document.documentElement.style.fontSize = `${newSize}px`
  }
  
  const decreaseFontSize = () => {
    const newSize = Math.max((accessibility.fontSize || 16) - 2, 12)
    updateAccessibility({ ...accessibility, fontSize: newSize })
    document.documentElement.style.fontSize = `${newSize}px`
  }
  
  const resetFontSize = () => {
    updateAccessibility({ ...accessibility, fontSize: 16 })
    document.documentElement.style.fontSize = '16px'
  }
  
  return { increaseFontSize, decreaseFontSize, resetFontSize }
}

// 5. 动效控制
export function useMotionPreferences() {
  const { accessibility, updateAccessibility } = useAppStore()
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = () => {
      updateAccessibility({
        ...accessibility,
        reducedMotion: mediaQuery.matches
      })
      
      if (mediaQuery.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01s')
        document.documentElement.style.setProperty('--transition-duration', '0.01s')
      } else {
        document.documentElement.style.removeProperty('--animation-duration')
        document.documentElement.style.removeProperty('--transition-duration')
      }
    }
    
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [accessibility, updateAccessibility])
}

// 6. ARIA标签增强组件
interface AccessibleComponentProps {
  children: React.ReactNode
  label?: string
  description?: string
  role?: string
  expanded?: boolean
  level?: number
}

export function AccessibleComponent({
  children,
  label,
  description,
  role,
  expanded,
  level,
  ...props
}: AccessibleComponentProps & React.HTMLAttributes<HTMLDivElement>) {
  const labelId = `label-${Math.random().toString(36).substr(2, 9)}`
  const descriptionId = `desc-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div
      role={role}
      aria-label={label}
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      aria-expanded={expanded}
      aria-level={level}
      {...props}
    >
      {label && (
        <div id={labelId} className="sr-only">
          {label}
        </div>
      )}
      {description && (
        <div id={descriptionId} className="sr-only">
          {description}
        </div>
      )}
      {children}
    </div>
  )
}

// 7. 无障碍工具栏
export function AccessibilityToolbar() {
  const { increaseFontSize, decreaseFontSize, resetFontSize } = useFontSizeControl()
  const { announce } = useScreenReader()
  const { accessibility, updateAccessibility } = useAppStore()
  
  return (
    <div 
      className="fixed top-0 right-0 z-50 bg-background border-l border-b p-2 space-x-2"
      role="toolbar"
      aria-label="无障碍工具"
    >
      <button
        onClick={() => {
          increaseFontSize()
          announce('字体已放大')
        }}
        aria-label="增大字体"
        onKeyPress={(e) => e.key === 'Enter' && increaseFontSize()}
        className="p-2 hover:bg-accent rounded"
      >
        A+
      </button>
      
      <button
        onClick={() => {
          decreaseFontSize()
          announce('字体已缩小')
        }}
        aria-label="减小字体"
        onKeyPress={(e) => e.key === 'Enter' && decreaseFontSize()}
        className="p-2 hover:bg-accent rounded"
      >
        A-
      </button>
      
      <button
        onClick={() => {
          resetFontSize()
          announce('字体已重置')
        }}
        aria-label="重置字体大小"
        onKeyPress={(e) => e.key === 'Enter' && resetFontSize()}
        className="p-2 hover:bg-accent rounded"
      >
        A
      </button>
      
      <button
        onClick={() => {
          const newContrast = !accessibility.highContrast
          updateAccessibility({ ...accessibility, highContrast: newContrast })
          announce(newContrast ? '已启用高对比度' : '已关闭高对比度')
        }}
        aria-label={accessibility.highContrast ? '关闭高对比度' : '启用高对比度'}
        aria-pressed={accessibility.highContrast}
        onKeyPress={(e) => e.key === 'Enter' && updateAccessibility({ ...accessibility, highContrast: !accessibility.highContrast })}
        className="p-2 hover:bg-accent rounded"
      >
        ⚫⚪
      </button>
    </div>
  )
}