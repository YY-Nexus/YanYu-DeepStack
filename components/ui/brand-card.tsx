"use client"

import type React from "react"

import { motion } from "framer-motion"
import { forwardRef } from "react"

interface BrandCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "glass" | "gradient"
  hover?: boolean
  children: React.ReactNode
}

const BrandCard = forwardRef<HTMLDivElement, BrandCardProps>(
  ({ variant = "default", hover = true, children, className = "", ...props }, ref) => {
    const variants = {
      default: "bg-white shadow-md",
      elevated: "bg-white shadow-xl",
      outlined: "bg-white border-2 border-gray-200 shadow-sm",
      glass: "bg-white/80 backdrop-blur-md border border-white/20 shadow-lg",
      gradient: "bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-100",
    }

    const hoverEffects = hover ? "hover:shadow-xl hover:-translate-y-1" : ""

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          rounded-xl transition-all duration-300
          ${variants[variant]} ${hoverEffects} ${className}
        `}
        {...(props as any)}
      >
        {children}
      </motion.div>
    )
  },
)

BrandCard.displayName = "BrandCard"

export { BrandCard }
