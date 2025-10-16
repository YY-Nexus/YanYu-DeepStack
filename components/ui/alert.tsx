/**
 * @file 警告提示组件
 * @description 用于显示警告、错误、成功、信息等提示信息
 * @module components/ui/alert
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { useEffect } from "react"
import { ComponentVersionManager } from "./versioning"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => {
  // 注册组件版本信息
  useEffect(() => {
    const versionManager = ComponentVersionManager.getInstance();
    versionManager.registerComponent({
      name: 'Alert',
      version: '1.0.0',
      lastUpdated: '2024-10-15',
      description: '警告提示组件，用于显示各种类型的提示信息'
    });
  }, []);

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  // 注册组件版本信息
  useEffect(() => {
    const versionManager = ComponentVersionManager.getInstance();
    versionManager.registerComponent({
      name: 'AlertTitle',
      version: '1.0.0',
      lastUpdated: '2024-10-15',
      description: '警告提示标题组件'
    });
  }, []);

  return (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
})
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  // 注册组件版本信息
  useEffect(() => {
    const versionManager = ComponentVersionManager.getInstance();
    versionManager.registerComponent({
      name: 'AlertDescription',
      version: '1.0.0',
      lastUpdated: '2024-10-15',
      description: '警告提示描述组件'
    });
  }, []);

  return (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
})
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
