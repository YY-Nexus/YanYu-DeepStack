"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../store"
import { apiService } from "../api/apiService"
import { removeOfflineRequest } from "../store/slices/offlineSlice"
import { showNotification } from "../store/slices/notificationsSlice"
import OfflineBanner from "../components/OfflineBanner"

interface OfflineManagerProps {
  children: React.ReactNode
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({ children }) => {
  const dispatch = useDispatch()
  const [isOnline, setIsOnline] = useState(true)
  const offlineRequests = useSelector((state: RootState) => state.offline.requests)

  // 监听网络状态变化
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected
      setIsOnline(online)

      // 当网络恢复时，处理离线请求队列
      if (online && offlineRequests.length > 0) {
        processOfflineQueue()
      }
    })

    return () => unsubscribe()
  }, [offlineRequests])

  // 处理离线请求队列
  const processOfflineQueue = async () => {
    if (offlineRequests.length === 0) return

    try {
      // 显示处理中通知
      dispatch(
        showNotification({
          type: "info",
          message: `正在处理 ${offlineRequests.length} 个离线请求...`,
          duration: 3000,
        }),
      )

      // 处理请求
      const results = await apiService.processOfflineQueue(offlineRequests)

      // 统计结果
      const successful = results.filter((r) => r.success).length
      const failed = results.length - successful

      // 从队列中移除成功的请求
      results.forEach((result) => {
        if (result.success) {
          const request = offlineRequests.find((req) => req.url + req.timestamp === result.requestId)
          if (request) {
            dispatch(removeOfflineRequest(request))
          }
        }
      })

      // 显示结果通知
      if (successful > 0) {
        dispatch(
          showNotification({
            type: "success",
            message: `成功同步 ${successful} 个离线请求`,
            duration: 3000,
          }),
        )
      }

      if (failed > 0) {
        dispatch(
          showNotification({
            type: "error",
            message: `${failed} 个请求同步失败，将在下次连接时重试`,
            duration: 5000,
          }),
        )
      }
    } catch (error) {
      console.error("处理离线队列失败:", error)
      dispatch(
        showNotification({
          type: "error",
          message: "同步离线数据失败，请稍后重试",
          duration: 5000,
        }),
      )
    }
  }

  return (
    <View style={styles.container}>
      {!isOnline && <OfflineBanner requestCount={offlineRequests.length} />}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default OfflineManager
