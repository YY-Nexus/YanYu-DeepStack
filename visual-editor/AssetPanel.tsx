import React, { useState } from "react"
import { DraggableAsset } from "./DraggableAsset"

export interface AssetPanelProps {
  assets: any[]
}

export const AssetPanel: React.FC<AssetPanelProps> = ({ assets }) => {
  const [showAI, setShowAI] = useState(false)
  const [selectedScene, setSelectedScene] = useState("form")
  
  // 教育场景化AI推荐（根据教育阶段优化）
  const getEducationScenes = () => {
    // 检查是否为教育模式的物料（通过difficulty字段判断）
    const hasEducationAssets = assets.some(asset => 'difficulty' in asset)
    
    if (hasEducationAssets) {
      return {
        基础创意: {
          name: "基础创意项目",
          components: [
            { name: "我的名片", type: "card" },
            { name: "班级相册", type: "gallery" },
            { name: "简单游戏", type: "game" }
          ]
        },
        学科应用: {
          name: "学科知识应用",
          components: [
            { name: "数学计算器", type: "calculator" },
            { name: "英语词典", type: "dictionary" },
            { name: "科学实验", type: "experiment" }
          ]
        },
        团队协作: {
          name: "团队协作项目",
          components: [
            { name: "班级公告板", type: "board" },
            { name: "投票系统", type: "vote" },
            { name: "活动策划", type: "planner" }
          ]
        }
      }
    } else {
      // 原有的场景化推荐
      return aiScenes
    }
  }
  
  // 场景化AI推荐
  const aiScenes = {
    form: {
      name: "表单页面",
      components: [
        { name: "用户名输入", type: "input" },
        { name: "密码输入", type: "password" },
        { name: "提交按钮", type: "button" },
        { name: "重置按钮", type: "button" }
      ]
    },
    dashboard: {
      name: "仪表盘",
      components: [
        { name: "统计卡片", type: "card" },
        { name: "数据图表", type: "chart" },
        { name: "表格列表", type: "table" },
        { name: "筛选器", type: "filter" }
      ]
    },
    admin: {
      name: "管理后台",
      components: [
        { name: "侧边导航", type: "nav" },
        { name: "顶部菜单", type: "header" },
        { name: "数据表格", type: "table" },
        { name: "操作按钮组", type: "buttonGroup" }
      ]
    }
  }
  
  const currentScenes = getEducationScenes()
  const currentRecommend = currentScenes[selectedScene]?.components || []
  return (
    <aside className="w-64 min-w-[180px] bg-gradient-to-b from-blue-50 to-blue-100 border-r p-4 flex flex-col gap-4 rounded-r-2xl shadow-lg">
      <div className="font-bold mb-2 text-blue-700 flex items-center justify-between">
        组件库
        <span className="flex-1 border-b border-blue-200 ml-2" />
        <button className="ml-2 px-2 py-1 bg-purple-600 text-white rounded shadow hover:bg-purple-700 text-xs" onClick={() => setShowAI(true)}>AI推荐</button>
      </div>
      <div className="flex flex-col gap-3">
        {assets.map((asset, idx) => (
          <div className="transition-all duration-150">
            <DraggableAsset key={idx} asset={asset} />
          </div>
        ))}
      </div>
      {showAI && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={() => setShowAI(false)}>×</button>
            <h3 className="font-bold text-lg mb-4 text-purple-700">AI智能推荐</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">选择场景：</label>
              <select 
                value={selectedScene} 
                onChange={(e) => setSelectedScene(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(currentScenes).map(([key, scene]) => (
                  <option key={key} value={key}>{scene.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-gray-800">推荐组件：</h4>
              <div className="grid grid-cols-2 gap-2">
                {currentRecommend.map((item, idx) => (
                  <div key={idx} className="bg-purple-50 border border-purple-200 rounded px-2 py-1 text-sm text-purple-700 font-medium">
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">💡 AI根据场景智能推荐最佳组件组合</div>
          </div>
        </div>
      )}
    </aside>
  )
}
