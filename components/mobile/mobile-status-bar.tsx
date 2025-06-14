"use client"
import { Wifi, WifiOff, Battery, Signal } from "lucide-react"

interface MobileStatusBarProps {
  isOnline: boolean
  batteryLevel: number
}

export default function MobileStatusBar({ isOnline, batteryLevel }: MobileStatusBarProps) {
  // 获取当前时间
  const currentTime = new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // 获取电池状态颜色
  const getBatteryColor = () => {
    if (batteryLevel > 50) return "text-green-600"
    if (batteryLevel > 20) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="bg-black text-white px-4 py-1 flex items-center justify-between text-sm">
      {/* 左侧：时间 */}
      <div className="flex items-center space-x-2">
        <span className="font-medium">{currentTime}</span>
      </div>

      {/* 右侧：状态图标 */}
      <div className="flex items-center space-x-2">
        {/* 网络状态 */}
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 text-red-400" />}

        {/* 信号强度 */}
        <Signal className="h-4 w-4" />

        {/* 电池电量 */}
        <div className="flex items-center space-x-1">
          <Battery className={`h-4 w-4 ${getBatteryColor()}`} />
          <span className={`text-xs ${getBatteryColor()}`}>{Math.round(batteryLevel)}%</span>
        </div>
      </div>
    </div>
  )
}
