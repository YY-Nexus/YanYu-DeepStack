import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"
import NetInfo from "@react-native-community/netinfo"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"
import { store } from "../store"
import { addOfflineRequest } from "../store/slices/offlineSlice"

declare const __DEV__: boolean

// API基础URL
const API_BASE_URL = __DEV__ ? "http://localhost:3000/api" : "https://api.yanyu.cloud/api"

// 请求超时时间
const REQUEST_TIMEOUT = 30000 // 30秒

// 创建API服务类
class ApiService {
  private api: AxiosInstance
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  constructor() {
    // 创建axios实例
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Platform": Platform.OS,
        "X-App-Version": require("../package.json").version,
      },
    })

    // 请求拦截器
    this.api.interceptors.request.use(
      async (config) => {
        // 检查网络连接
        const netInfo = await NetInfo.fetch()
        if (!netInfo.isConnected) {
          // 如果是GET请求，尝试从缓存获取
          if (config.method?.toLowerCase() === "get") {
            const cachedData = await this.getFromCache(config.url || "")
            if (cachedData) {
              return Promise.resolve({
                ...config,
                adapter: () =>
                  Promise.resolve({
                    data: cachedData,
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config,
                  }),
              })
            }
          }

          // 如果是修改操作，保存到离线队列
          if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase() || "")) {
            store.dispatch(
              addOfflineRequest({
                url: config.url || "",
                method: config.method || "get",
                data: config.data,
                headers: config.headers as Record<string, string>,
                timestamp: Date.now(),
              }),
            )
          }

          throw new Error("网络连接不可用，请求已保存到离线队列")
        }

        // 添加认证token
        const token = await AsyncStorage.getItem("auth_token")
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          }
        }

        return config
      },
      (error) => Promise.reject(error),
    )

    // 响应拦截器
    this.api.interceptors.response.use(
      async (response) => {
        // 缓存GET请求的响应
        if (response.config.method?.toLowerCase() === "get") {
          await this.saveToCache(response.config.url || "", response.data)
        }
        return response
      },
      async (error) => {
        // 处理token过期
        if (error.response?.status === 401) {
          return this.handleTokenExpiration(error)
        }
        return Promise.reject(error)
      },
    )
  }

  // 处理token过期
  private async handleTokenExpiration(error: any) {
    const originalRequest = error.config

    // 防止重复刷新
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // 如果已经在刷新中，等待刷新完成
      if (this.isRefreshing) {
        return new Promise((resolve) => {
          this.refreshSubscribers.push((token: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`
            resolve(this.api(originalRequest))
          })
        })
      }

      this.isRefreshing = true

      try {
        // 尝试刷新token
        const refreshToken = await AsyncStorage.getItem("refresh_token")
        if (!refreshToken) {
          throw new Error("No refresh token available")
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { token, refreshToken: newRefreshToken } = response.data

        // 保存新token
        await AsyncStorage.setItem("auth_token", token)
        await AsyncStorage.setItem("refresh_token", newRefreshToken)

        // 更新所有等待的请求
        this.refreshSubscribers.forEach((callback) => callback(token))
        this.refreshSubscribers = []

        // 更新当前请求的token
        originalRequest.headers["Authorization"] = `Bearer ${token}`

        return this.api(originalRequest)
      } catch (refreshError) {
        // 刷新失败，清除token并重定向到登录
        await AsyncStorage.removeItem("auth_token")
        await AsyncStorage.removeItem("refresh_token")
        // 这里可以触发导航到登录页面的action
        return Promise.reject(refreshError)
      } finally {
        this.isRefreshing = false
      }
    }

    return Promise.reject(error)
  }

  // 缓存相关方法
  private async saveToCache(url: string, data: any): Promise<void> {
    try {
      const cacheKey = `api_cache_${url}`
      const cacheData = {
        data,
        timestamp: Date.now(),
      }
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.error("缓存保存失败:", error)
    }
  }

  private async getFromCache(url: string): Promise<any | null> {
    try {
      const cacheKey = `api_cache_${url}`
      const cachedItem = await AsyncStorage.getItem(cacheKey)

      if (!cachedItem) return null

      const { data, timestamp } = JSON.parse(cachedItem)

      // 检查缓存是否过期（默认24小时）
      const CACHE_TTL = 24 * 60 * 60 * 1000 // 24小时
      if (Date.now() - timestamp > CACHE_TTL) {
        await AsyncStorage.removeItem(cacheKey)
        return null
      }

      return data
    } catch (error) {
      console.error("缓存读取失败:", error)
      return null
    }
  }

  // 公共API方法
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config)
    return response.data
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config)
    return response.data
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config)
    return response.data
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config)
    return response.data
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config)
    return response.data
  }

  // 处理离线请求队列
  public async processOfflineQueue(requests: OfflineRequest[]): Promise<ProcessResult[]> {
    const results: ProcessResult[] = []

    for (const request of requests) {
      try {
        let response
        switch (request.method.toLowerCase()) {
          case "post":
            response = await this.post(request.url, request.data, { headers: request.headers })
            break
          case "put":
            response = await this.put(request.url, request.data, { headers: request.headers })
            break
          case "patch":
            response = await this.patch(request.url, request.data, { headers: request.headers })
            break
          case "delete":
            response = await this.delete(request.url, { headers: request.headers })
            break
          default:
            throw new Error(`不支持的请求方法: ${request.method}`)
        }

        results.push({
          success: true,
          requestId: request.url + request.timestamp,
          data: response,
        })
      } catch (error) {
        results.push({
          success: false,
          requestId: request.url + request.timestamp,
          error: error instanceof Error ? error.message : "未知错误",
        })
      }
    }

    return results
  }
}

// 类型定义
export interface OfflineRequest {
  url: string
  method: string
  data?: any
  headers: Record<string, string>
  timestamp: number
}

export interface ProcessResult {
  success: boolean
  requestId: string
  data?: any
  error?: string
}

// 导出API服务实例
export const apiService = new ApiService()
