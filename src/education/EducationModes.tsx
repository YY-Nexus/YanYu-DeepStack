import React, { useState } from "react"

// 教育模式类型定义
export interface EducationConfig {
  mode: '義教' | '高教'
  userType: '学生' | '教师'
  level?: string
  features: string[]
}

// 义教配置（小学1-6年级，初中7-9年级）
const yiJiaoConfig = {
  小学: {
    components: [
      { name: "彩色按钮", type: "button", difficulty: "简单" },
      { name: "图片展示", type: "image", difficulty: "简单" },
      { name: "文字标签", type: "text", difficulty: "简单" },
      { name: "简单表单", type: "form", difficulty: "中等" }
    ],
    features: ["拖拽建构", "色彩学习", "基础逻辑", "创意表达"]
  },
  初中: {
    components: [
      { name: "交互按钮", type: "button", difficulty: "中等" },
      { name: "数据输入", type: "input", difficulty: "中等" },
      { name: "信息卡片", type: "card", difficulty: "中等" },
      { name: "简单图表", type: "chart", difficulty: "难" }
    ],
    features: ["逻辑思维", "数据处理", "界面设计", "项目协作"]
  }
}

// 高教配置（高中、大学）
const gaoJiaoConfig = {
  高中: {
    components: [
      { name: "高级表单", type: "form", difficulty: "中等" },
      { name: "数据可视化", type: "chart", difficulty: "难" },
      { name: "响应式布局", type: "layout", difficulty: "难" },
      { name: "API接口", type: "api", difficulty: "高级" }
    ],
    features: ["算法思维", "系统设计", "代码架构", "技术创新"]
  },
  大学: {
    components: [
      { name: "微服务组件", type: "microservice", difficulty: "高级" },
      { name: "AI智能组件", type: "ai", difficulty: "高级" },
      { name: "数据库设计", type: "database", difficulty: "高级" },
      { name: "全栈应用", type: "fullstack", difficulty: "专家" }
    ],
    features: ["工程思维", "架构设计", "创新研发", "产业应用"]
  }
}

export const EducationModes: React.FC<{
  onModeSelect: (config: EducationConfig) => void
}> = ({ onModeSelect }) => {
  const [selectedMode, setSelectedMode] = useState<'義教' | '高教' | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [userType, setUserType] = useState<'学生' | '教师'>('学生')

  const handleModeSelect = () => {
    if (!selectedMode || !selectedLevel) return
    
    const features = selectedMode === '義教' 
      ? yiJiaoConfig[selectedLevel as keyof typeof yiJiaoConfig]?.features || []
      : gaoJiaoConfig[selectedLevel as keyof typeof gaoJiaoConfig]?.features || []
    
    onModeSelect({
      mode: selectedMode,
      userType,
      level: selectedLevel,
      features
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          🎓 中国教育智能编程平台
        </h2>
        
        {/* 教育阶段选择 */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700">选择教育阶段：</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMode === '義教' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => {setSelectedMode('義教'); setSelectedLevel('')}}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">📚</div>
                <div className="font-bold text-blue-700">義教</div>
                <div className="text-sm text-gray-600">9年义务教育</div>
                <div className="text-xs text-gray-500 mt-1">小学1-6年级 + 初中7-9年级</div>
              </div>
            </button>
            
            <button
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMode === '高教' 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
              onClick={() => {setSelectedMode('高教'); setSelectedLevel('')}}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-bold text-green-700">高教</div>
                <div className="text-sm text-gray-600">高中大学教育</div>
                <div className="text-xs text-gray-500 mt-1">高中 + 大学专业教育</div>
              </div>
            </button>
          </div>
        </div>

        {/* 具体阶段选择 */}
        {selectedMode && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-700">选择具体阶段：</h3>
            <div className="grid grid-cols-2 gap-3">
              {selectedMode === '義教' ? (
                <>
                  <button
                    className={`p-3 rounded-lg border ${
                      selectedLevel === '小学' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedLevel('小学')}
                  >
                    <div className="font-medium">小学 (1-6年级)</div>
                    <div className="text-xs text-gray-500">基础创意编程</div>
                  </button>
                  <button
                    className={`p-3 rounded-lg border ${
                      selectedLevel === '初中' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedLevel('初中')}
                  >
                    <div className="font-medium">初中 (7-9年级)</div>
                    <div className="text-xs text-gray-500">逻辑思维编程</div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`p-3 rounded-lg border ${
                      selectedLevel === '高中' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setSelectedLevel('高中')}
                  >
                    <div className="font-medium">高中</div>
                    <div className="text-xs text-gray-500">算法与系统设计</div>
                  </button>
                  <button
                    className={`p-3 rounded-lg border ${
                      selectedLevel === '大学' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setSelectedLevel('大学')}
                  >
                    <div className="font-medium">大学</div>
                    <div className="text-xs text-gray-500">工程与创新实践</div>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 用户类型选择 */}
        {selectedLevel && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-700">选择身份：</h3>
            <div className="flex gap-4">
              <button
                className={`px-6 py-3 rounded-lg border-2 transition-all ${
                  userType === '学生' 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => setUserType('学生')}
              >
                👨‍🎓 学生模式
              </button>
              <button
                className={`px-6 py-3 rounded-lg border-2 transition-all ${
                  userType === '教师' 
                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                    : 'border-gray-200 hover:border-orange-300'
                }`}
                onClick={() => setUserType('教师')}
              >
                👩‍🏫 教师模式
              </button>
            </div>
          </div>
        )}

        {/* 预览特性 */}
        {selectedMode && selectedLevel && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-700">🚀 智能赋能特性：</h4>
            <div className="flex flex-wrap gap-2">
              {(selectedMode === '義教' 
                ? yiJiaoConfig[selectedLevel as keyof typeof yiJiaoConfig]?.features 
                : gaoJiaoConfig[selectedLevel as keyof typeof gaoJiaoConfig]?.features
              )?.map((feature, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 确认按钮 */}
        <div className="flex justify-center">
          <button
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              selectedMode && selectedLevel
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleModeSelect}
            disabled={!selectedMode || !selectedLevel}
          >
            🎯 开启智能编程学习
          </button>
        </div>
      </div>
    </div>
  )
}

// 导出配置供其他组件使用
export { yiJiaoConfig, gaoJiaoConfig }

export default EducationModes