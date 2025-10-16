"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

interface Model3DPreviewProps {
  modelUrl?: string
  className?: string
}

export default function Model3DPreview({ modelUrl, className = "" }: Model3DPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (!mountRef.current) return

    // 创建场景
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8f9fa)
    sceneRef.current = scene

    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.set(5, 5, 5)
    cameraRef.current = camera

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance", // 优化性能
      alpha: true, // 支持透明背景
    })
    renderer.setSize(400, 400)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    // 设置颜色空间 (Three.js r150+)
    try {
      // @ts-ignore - 使用新版本的 outputColorSpace
      renderer.outputColorSpace = THREE.SRGBColorSpace
    } catch {
      // 回退到旧版本的方式
      try {
        // @ts-ignore - 兼容旧版本
        renderer.outputEncoding = 3001 // THREE.sRGBEncoding 的值
      } catch {
        // 如果都不支持就跳过
        console.warn("Three.js color space configuration not supported")
      }
    }
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // 创建控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = 50 // 限制缩放范围
    controls.minDistance = 2
    controlsRef.current = controls

    // 添加光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    // 优化阴影质量
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    scene.add(directionalLight)

    // 添加地面
    const groundGeometry = new THREE.PlaneGeometry(20, 20)
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // 添加默认立方体
    if (!modelUrl) {
      const geometry = new THREE.BoxGeometry(2, 2, 2)
      const material = new THREE.MeshPhongMaterial({
        color: 0x1890ff,
        transparent: true,
        opacity: 0.8,
      })
      const cube = new THREE.Mesh(geometry, material)
      cube.position.y = 1
      cube.castShadow = true
      scene.add(cube)
    }

    // 动画循环
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // 响应式调整
    const handleResize = () => {
      if (mountRef.current) {
        const { clientWidth, clientHeight } = mountRef.current
        camera.aspect = clientWidth / clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(clientWidth, clientHeight)
      }
    }

    // 初始调整大小
    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      window.removeEventListener("resize", handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      // 释放资源
      renderer.dispose()
      controls.dispose()
    }
  }, [])

  // 加载3D模型
  useEffect(() => {
    if (!modelUrl || !sceneRef.current) return

    setLoading(true)
    setError("")

    // 清除之前的模型
    const objectsToRemove = sceneRef.current.children.filter((child) => child.userData.isModel)
    objectsToRemove.forEach((obj) => sceneRef.current?.remove(obj))

    const fileExtension = modelUrl.split(".").pop()?.toLowerCase()

    // 添加加载管理器以处理错误
    const loadingManager = new THREE.LoadingManager()
    loadingManager.onError = (url) => {
      console.error(`加载错误: ${url}`)
      setError(`无法加载模型: ${url}`)
      setLoading(false)
    }

    if (fileExtension === "glb" || fileExtension === "gltf") {
      const loader = new GLTFLoader(loadingManager)
      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene
          model.userData.isModel = true

          // 自动调整模型大小和位置
          const box = new THREE.Box3().setFromObject(model)
          const size = box.getSize(new THREE.Vector3())
          const center = box.getCenter(new THREE.Vector3())

          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 5 / maxDim
          model.scale.multiplyScalar(scale)

          model.position.x = -center.x * scale
          model.position.y = -center.y * scale + (size.y * scale) / 2
          model.position.z = -center.z * scale

          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
              // 修复材质问题
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat) => {
                    mat.side = THREE.DoubleSide
                  })
                } else {
                  child.material.side = THREE.DoubleSide
                }
              }
            }
          })
          sceneRef.current?.add(model)
          setLoading(false)
        },
        (progress) => {
          console.log("加载进度:", Math.round((progress.loaded / progress.total) * 100) + "%")
        },
        (error) => {
          console.error("模型加载错误:", error)
          if (error instanceof Error) {
            setError("模型加载失败: " + error.message)
          } else {
            setError("模型加载失败")
          }
          setLoading(false)
        },
      )
    } else if (fileExtension === "obj") {
      const loader = new OBJLoader(loadingManager)
      loader.load(
        modelUrl,
        (object) => {
          object.userData.isModel = true

          // 自动调整模型大小和位置
          const box = new THREE.Box3().setFromObject(object)
          const size = box.getSize(new THREE.Vector3())
          const center = box.getCenter(new THREE.Vector3())

          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 5 / maxDim
          object.scale.multiplyScalar(scale)

          object.position.x = -center.x * scale
          object.position.y = -center.y * scale + (size.y * scale) / 2
          object.position.z = -center.z * scale

          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = new THREE.MeshPhongMaterial({
                color: 0x1890ff,
                side: THREE.DoubleSide,
              })
              child.castShadow = true
              child.receiveShadow = true
            }
          })
          sceneRef.current?.add(object)
          setLoading(false)
        },
        (progress) => {
          console.log("加载进度:", Math.round((progress.loaded / progress.total) * 100) + "%")
        },
        (error) => {
          console.error("模型加载错误:", error)
          if (error instanceof Error) {
            setError("模型加载失败: " + error.message)
          } else {
            setError("模型加载失败")
          }
          setLoading(false)
        },
      )
    } else {
      setError("不支持的文件格式: " + (fileExtension || "未知"))
      setLoading(false)
    }
  }, [modelUrl])

  return (
    <div className={`h-full relative ${className}`}>
      <div ref={mountRef} className="w-full h-full" />

      {/* 加载状态 */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cloud-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">加载3D模型中...</p>
          </div>
        </motion.div>
      )}

      {/* 错误状态 */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        >
          <div className="text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </motion.div>
      )}

      {/* 控制提示 */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg"
        >
          <p>鼠标拖拽旋转 • 滚轮缩放</p>
        </motion.div>
      )}
    </div>
  )
}
