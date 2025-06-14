// 言語云³ Service Worker
const CACHE_NAME = "yanyu-cloud-cache-v1"
const OFFLINE_PAGE = "/offline"

// 需要缓存的资源列表
const ASSETS_TO_CACHE = [
  "/",
  "/offline",
  "/dashboard",
  "/images/logo.png",
  "/fonts/geist-regular.woff2",
  "/fonts/geist-bold.woff2",
]

// 安装事件 - 预缓存核心资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("预缓存资源")
        return cache.addAll(ASSETS_TO_CACHE)
      })
      .then(() => {
        // 立即激活新的Service Worker
        return self.skipWaiting()
      }),
  )
})

// 激活事件 - 清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("删除旧缓存:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        // 立即接管页面
        return self.clients.claim()
      }),
  )
})

// 请求拦截 - 实现离线访问
self.addEventListener("fetch", (event) => {
  // 只处理GET请求
  if (event.request.method !== "GET") return

  // 排除不需要缓存的请求
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/api/")) {
    // API请求使用网络优先策略
    event.respondWith(networkFirstStrategy(event.request))
  } else {
    // 静态资源使用缓存优先策略
    event.respondWith(cacheFirstStrategy(event.request))
  }
})

// 缓存优先策略
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    // 只缓存成功的响应
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // 如果是HTML请求，返回离线页面
    if (request.headers.get("Accept").includes("text/html")) {
      return caches.match(OFFLINE_PAGE)
    }
    throw error
  }
}

// 网络优先策略
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    // 只缓存成功的响应
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    // 如果是HTML请求，返回离线页面
    if (request.headers.get("Accept").includes("text/html")) {
      return caches.match(OFFLINE_PAGE)
    }
    throw error
  }
}

// 后台同步
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData())
  }
})

// 推送通知
self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/images/logo.png",
    badge: "/images/badge.png",
    data: data.data,
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// 通知点击
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(clients.openWindow(event.notification.data.url || "/"))
})

// 消息处理
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// 同步数据
async function syncData() {
  // 从IndexedDB获取待同步数据
  // 这里是示例实现
  console.log("执行后台同步")
  return Promise.resolve()
}
