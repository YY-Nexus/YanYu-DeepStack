import React, { useState } from "react"
import { Button } from "../../components/ui/button"
import { KnowledgeExplorer } from "./KnowledgeExplorer"
import { SubjectFolderManager, LearningPathPlanner } from "./SubjectManager"
import { InteractiveTutorial, AchievementGallery } from "./TutorialSystem"
import { GamificationSystem, SmartRecommendation, MultiLanguageSupport } from "./AdvancedFeatures"

// 教育功能完整弹窗
export const EducationFeatureModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  educationConfig: any
}> = ({ isOpen, onClose, educationConfig }) => {
  const [activeTab, setActiveTab] = useState('knowledge')

  if (!isOpen) return null

  const tabs = [
    { id: 'knowledge', label: '📚 知识探索', component: KnowledgeExplorer },
    { id: 'subjects', label: '📁 学科管理', component: SubjectFolderManager },
    { id: 'path', label: '🛣️ 学习路径', component: LearningPathPlanner },
    { id: 'tutorial', label: '🎓 互动教程', component: InteractiveTutorial },
    { id: 'gallery', label: '🎨 作品展示', component: AchievementGallery },
    { id: 'game', label: '🎮 游戏化', component: GamificationSystem },
    { id: 'recommend', label: '🎯 智能推荐', component: SmartRecommendation },
    { id: 'language', label: '🌍 多语言', component: MultiLanguageSupport }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            🎓 智能教育功能中心
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧导航 */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-4">功能模块</h3>
              <div className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 教育配置信息 */}
            {educationConfig && (
              <div className="p-4 border-t border-gray-200 bg-blue-50">
                <h4 className="font-medium text-blue-800 mb-2">当前配置</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>教育类型: {educationConfig.mode}</div>
                  <div>教育级别: {educationConfig.level}</div>
                  <div>身份: {educationConfig.identity === 'student' ? '学生' : '教师'}</div>
                </div>
              </div>
            )}
          </div>

          {/* 主内容区 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {ActiveComponent && (
                <ActiveComponent 
                  educationLevel={educationConfig?.level}
                  level={educationConfig?.level}
                  mode={educationConfig?.mode}
                  userId="current-user"
                  isStudent={educationConfig?.identity === 'student'}
                  isTeacher={educationConfig?.identity === 'teacher'}
                  subject="编程"
                  userLevel={educationConfig?.level}
                  learningStyle="视觉型"
                />
              )}
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            💡 提示: 这些功能将帮助你更好地进行教育型可视化编程学习
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              保存设置
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 教育功能快速入口
export const EducationQuickEntry: React.FC<{
  educationConfig: any
  onOpenModal: () => void
}> = ({ educationConfig, onOpenModal }) => {
  if (!educationConfig) return null

  const quickActions = [
    { icon: '📝', label: '创建笔记', color: 'bg-blue-500' },
    { icon: '🧠', label: '思维导图', color: 'bg-purple-500' },
    { icon: '📊', label: '制作PPT', color: 'bg-green-500' },
    { icon: '🎯', label: '学习任务', color: 'bg-orange-500' }
  ]

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">🎓 教育功能快速入口</h3>
        <Button 
          size="sm" 
          onClick={onOpenModal}
          className="bg-blue-600 hover:bg-blue-700"
        >
          查看全部功能
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            className={`${action.color} text-white p-3 rounded-lg hover:opacity-90 transition-opacity flex flex-col items-center gap-1`}
            onClick={onOpenModal}
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}