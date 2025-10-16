// YYC³ 情感声效交互平台集成页面
// 将情感声效模块集成到主应用的演示页面

import React from 'react'
import dynamic from 'next/dynamic'

// 动态导入，确保组件只在客户端渲染
const YYC3EmotionSoundProvider = dynamic(() => import('../modules/emotion-sound-platform/index.tsx').then(mod => mod.YYC3EmotionSoundProvider), { ssr: false })
// 注意：YYC3EmotionSoundManager是一个类，不是React组件，不应通过dynamic导入
// 在组件内部使用useEffect和useRef来实例化它

export default function EmotionSoundPlatformPage() {
  return (
    <YYC3EmotionSoundProvider enabled={true} volume={0.3}>
      <div className="emotion-sound-platform">
        <h1>YYC³ 情感声效平台</h1>
        <p>这是一个用于演示情感声效系统的页面。</p>
      </div>
    </YYC3EmotionSoundProvider>
  )
}