"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Code2, Play, Users, FolderOpen } from "lucide-react"

type MobilePage = "home" | "ai-generator" | "sandbox" | "collaboration" | "projects" | "settings"

interface MobileBottomNavigationProps {
  currentPage: MobilePage
  onNavigate: (page: MobilePage) => void
}

export default function MobileBottomNavigation({ currentPage, onNavigate }: MobileBottomNavigationProps) {
  const navigationItems = [
    {
      id: "home" as MobilePage,
      label: "首页",
      icon: Home,
      badge: null,
    },
    {
      id: "ai-generator" as MobilePage,
      label: "AI生成",
      icon: Code2,
      badge: null,
    },
    {
      id: "sandbox" as MobilePage,
      label: "沙箱",
      icon: Play,
      badge: null,
    },
    {
      id: "collaboration" as MobilePage,
      label: "协作",
      icon: Users,
      badge: 3, // 显示有3个活跃协作
    },
    {
      id: "projects" as MobilePage,
      label: "项目",
      icon: FolderOpen,
      badge: null,
    },
  ]

  return (
    <div className="bg-white border-t px-2 py-2">
      <div className="flex items-center justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 relative ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-600"}`} />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs ${isActive ? "text-blue-600 font-medium" : "text-gray-600"}`}>
                {item.label}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
