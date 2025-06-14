"use client"

import { motion } from "framer-motion"
import { Logo3D } from "./logo-3d"
import { logoVariants } from "@/lib/brand-system"

interface BrandLogoProps {
  variant?: "image" | "3d" | "text"
  size?: keyof typeof logoVariants.sizes
  context?: keyof typeof logoVariants.contexts
  showText?: boolean
  interactive?: boolean
  className?: string
}

export function BrandLogo({
  variant = "image",
  size = "md",
  context,
  showText,
  interactive = false,
  className = "",
}: BrandLogoProps) {
  // 如果指定了context，使用context的配置
  const config = context ? logoVariants.contexts[context] : { size, showText }
  const logoSize = logoVariants.sizes[config.size as keyof typeof logoVariants.sizes]
  const shouldShowText = showText !== undefined ? showText : config.showText

  const renderLogo = () => {
    switch (variant) {
      case "3d":
        return <Logo3D size={Math.max(logoSize.width, logoSize.height)} interactive={interactive} />
      case "text":
        return (
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-cloud-blue-500 to-mint-green bg-clip-text text-transparent">
              言語云³
            </div>
            {shouldShowText && <div className="text-xs text-gray-600 mt-1">深度堆栈智创引擎</div>}
          </div>
        )
      default:
        return (
          <div className="flex flex-col items-center">
            <motion.img
              src="/images/yanyu-logo.png"
              alt="言語云³"
              width={logoSize.width}
              height={logoSize.height}
              className="object-contain"
              whileHover={interactive ? { scale: 1.05, rotate: 5 } : {}}
              transition={{ duration: 0.3 }}
            />
            {shouldShowText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-gray-600 mt-1 text-center"
              >
                深度堆栈智创引擎
              </motion.div>
            )}
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`inline-block ${className}`}
    >
      {renderLogo()}
    </motion.div>
  )
}
