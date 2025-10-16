"use client"

import type React from "react"

import { motion } from "framer-motion"

interface BrandBadgeProps {
  variant?: "primary" | "success" | "warning" | "error" | "info" | "default" | "outline" | "secondary" | "solid"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
  className?: string
}

export function BrandBadge({ variant = "primary", size = "md", children, className = "" }: BrandBadgeProps) {
  const variants = {
    primary: "bg-cloud-blue-100 text-cloud-blue-700 border-cloud-blue-200",
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    error: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    default: "bg-gray-100 text-gray-700 border-gray-200",
    outline: "bg-transparent border-gray-300 text-gray-700",
    secondary: "bg-gray-200 text-gray-800 border-gray-300",
    solid: "bg-gray-800 text-white border-gray-800",
  }

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  }

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </motion.span>
  )
}
