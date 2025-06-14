"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import * as THREE from "three"

interface Logo3DProps {
  size?: number
  autoRotate?: boolean
  interactive?: boolean
  className?: string
}

export function Logo3D({ size = 200, autoRotate = true, interactive = true, className = "" }: Logo3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const logoGroupRef = useRef<THREE.Group>()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!mountRef.current) return

    // 创建场景
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 5
    cameraRef.current = camera

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(size, size)
    renderer.setClearColor(0x000000, 0) // 透明背景
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // 创建Logo组
    const logoGroup = new THREE.Group()
    logoGroupRef.current = logoGroup
    scene.add(logoGroup)

    // 创建立方体几何体 - 模拟CloudCube Logo
    const createCube = (x: number, y: number, z: number, color: number, scale = 1) => {
      const geometry = new THREE.BoxGeometry(scale, scale, scale)
      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.9,
        shininess: 100,
      })
      const cube = new THREE.Mesh(geometry, material)
      cube.position.set(x, y, z)
      return cube
    }

    // 创建Logo的立方体结构
    const cubes = [
      // 主要蓝色立方体
      createCube(0, 0, 0, 0x1890ff, 1.2),
      createCube(-1.5, 0.5, 0.5, 0x40a9ff, 1),
      createCube(1.5, -0.5, -0.5, 0x69c0ff, 0.8),
      // 辅助白色立方体
      createCube(0.5, 1, -1, 0xffffff, 0.6),
      createCube(-0.5, -1, 1, 0xf0f0f0, 0.7),
    ]

    cubes.forEach((cube) => logoGroup.add(cube))

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    // 添加点光源
    const pointLight = new THREE.PointLight(0xffffff, 0.8)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    // 添加另一个点光源
    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.4)
    pointLight2.position.set(-10, -10, 5)
    scene.add(pointLight2)

    // 动画循环
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      if (logoGroup) {
        if (autoRotate && !isHovered) {
          logoGroup.rotation.y += 0.01
          logoGroup.rotation.x += 0.005
        }

        if (isHovered) {
          logoGroup.rotation.y += 0.02
          logoGroup.rotation.x += 0.01
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    // 鼠标交互
    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive || !logoGroup) return

      const rect = renderer.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      logoGroup.rotation.y = x * 0.5
      logoGroup.rotation.x = y * 0.5
    }

    if (interactive) {
      renderer.domElement.addEventListener("mousemove", handleMouseMove)
    }

    // 清理函数
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (interactive) {
        renderer.domElement.removeEventListener("mousemove", handleMouseMove)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [size, autoRotate, interactive, isHovered])

  return (
    <motion.div
      className={`inline-block ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div ref={mountRef} className="cursor-pointer" />
    </motion.div>
  )
}
