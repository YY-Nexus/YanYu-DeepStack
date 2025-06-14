"use client"

import type React from "react"

import { motion } from "framer-motion"
import { forwardRef } from "react"

interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ variant = "primary", size = "md", loading = false, icon, children, className = "", ...props }, ref) => {
    // 变体样式
    const variants = {
      primary: "bg-cloud-blue-500 hover:bg-cloud-blue-600 text-white shadow-md hover:shadow-lg",
      secondary: "bg-mint-green hover:bg-mint-green/90 text-white shadow-md hover:shadow-lg",
      outline: "border-2 border-cloud-blue-500 text-cloud-blue-500 hover:bg-cloud-blue-500 hover:text-white",
      ghost: "text-cloud-blue-500 hover:bg-cloud-blue-50",
      gradient:
        "bg-gradient-to-r from-coral-pink to-mint-green hover:from-coral-pink/90 hover:to-mint-green/90 text-white shadow-lg hover:shadow-xl",
    }

    // 尺寸样式
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          inline-flex items-center justify-center space-x-2 
          font-medium rounded-lg transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {icon && !loading && <span>{icon}</span>}
        <span>{children}</span>
      </motion.button>
    )
  },
)

BrandButton.displayName = "BrandButton"

export { BrandButton }
