import React, { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Progress } from "../../components/ui/progress"

// 互动教程系统
export const InteractiveTutorial: React.FC<{
  subject: string
  level: string
}> = ({ subject, level }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [tutorials, setTutorials] = useState<any[]>([])

  const tutorialTemplates = {
    "可视化编程": [
      {
        id: 1,
        title: "🎯 欢迎使用可视化编程平台",
        content: "让我们开始学习如何通过拖拽组件来创建程序！",
        action: "点击下一步继续",
        highlight: ".welcome-area",
        type: "intro"
      },
      {
        id: 2,
        title: "📦 认识组件面板",
        content: "左侧是组件面板，包含了各种UI组件，如按钮、输入框、图片等。",
        action: "尝试将一个按钮拖拽到画布上",
        highlight: ".asset-panel",
        type: "interaction"
      },
      {
        id: 3,
        title: "🎨 使用画布区域",
        content: "中间是画布区域，你可以在这里放置和排列组件。",
        action: "观察画布上的网格，它帮助你对齐组件",
        highlight: ".canvas-area",
        type: "observation"
      },
      {
        id: 4,
        title: "⚙️ 属性面板编辑",
        content: "右侧是属性面板，选中组件后可以修改其属性。",
        action: "选中刚才添加的按钮，尝试修改它的文字和颜色",
        highlight: ".property-panel",
        type: "practice"
      },
      {
        id: 5,
        title: "🎉 完成第一个程序",
        content: "恭喜！你已经学会了基本操作。现在可以导出你的作品了。",
        action: "点击导出按钮，选择你喜欢的格式",
        highlight: ".export-buttons",
        type: "completion"
      }
    ],
    "数学建模": [
      {
        id: 1,
        title: "📊 数学建模入门",
        content: "数学建模是用数学语言描述现实问题的过程。",
        action: "选择一个数学函数组件开始",
        highlight: ".math-components",
        type: "intro"
      },
      {
        id: 2,
        title: "📈 创建函数图像",
        content: "拖拽函数组件到画布，设置参数来观察图像变化。",
        action: "尝试创建 y = ax² + bx + c 的抛物线",
        highlight: ".function-component",
        type: "practice"
      }
    ]
  }

  useEffect(() => {
    const defaultTutorial = tutorialTemplates["可视化编程"] || []
    setTutorials(defaultTutorial)
    setCurrentStep(0)
    setCompletedSteps([])
  }, [subject, level])

  const nextStep = () => {
    if (currentStep < tutorials.length - 1) {
      setCompletedSteps([...completedSteps, currentStep])
      setCurrentStep(currentStep + 1)
    } else {
      // 教程完成
      setCompletedSteps([...completedSteps, currentStep])
      setIsPlaying(false)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const startTutorial = () => {
    setIsPlaying(true)
    setCurrentStep(0)
    setCompletedSteps([])
  }

  const currentTutorial = tutorials[currentStep]
  const progress = tutorials.length > 0 ? ((completedSteps.length) / tutorials.length) * 100 : 0

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-green-700">🎓 互动教程系统</h3>
        {!isPlaying && (
          <Button onClick={startTutorial} className="bg-green-600 hover:bg-green-700">
            ▶️ 开始教程
          </Button>
        )}
      </div>

      {!isPlaying ? (
        // 教程选择界面
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(tutorialTemplates).map(([name, tutorial]) => (
              <Card key={name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <span>{name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">包含 {tutorial.length} 个步骤的完整教程</p>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      setTutorials(tutorial)
                      startTutorial()
                    }}
                  >
                    开始学习
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 学习统计 */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-3">📈 学习统计</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-green-700">已完成教程</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">15</div>
                <div className="text-sm text-blue-700">总学习时间(分钟)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-sm text-purple-700">掌握技能</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 教程进行界面
        <div>
          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">教程进度</span>
              <span className="text-sm text-gray-500">
                {completedSteps.length + 1} / {tutorials.length}
              </span>
            </div>
            <Progress value={progress + (100 / tutorials.length)} className="h-2" />
          </div>

          {/* 当前步骤 */}
          {currentTutorial && (
            <Card className="mb-6 border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700">
                  {currentTutorial.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{currentTutorial.content}</p>
                
                {currentTutorial.type === "interaction" && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                    <p className="text-blue-800">
                      🖱️ <strong>动手操作：</strong>{currentTutorial.action}
                    </p>
                  </div>
                )}

                {currentTutorial.type === "practice" && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                    <p className="text-yellow-800">
                      ✍️ <strong>实践练习：</strong>{currentTutorial.action}
                    </p>
                  </div>
                )}

                {currentTutorial.type === "observation" && (
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-3 mb-4">
                    <p className="text-purple-800">
                      👀 <strong>仔细观察：</strong>{currentTutorial.action}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    ← 上一步
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsPlaying(false)}>
                      暂停教程
                    </Button>
                    <Button onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                      {currentStep === tutorials.length - 1 ? '完成教程' : '下一步 →'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 帮助提示 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-2">💡 学习提示</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 按照步骤顺序进行，确保每步都理解了再继续</li>
              <li>• 遇到问题可以重复观看当前步骤</li>
              <li>• 完成练习后再进入下一步骤</li>
              <li>• 可以随时暂停教程进行自由探索</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// 成果展示系统
export const AchievementGallery: React.FC<{
  userId?: string
  isTeacher?: boolean
}> = ({ userId, isTeacher }) => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "我的第一个计算器",
      author: "小明",
      subject: "数学",
      level: "初中",
      thumbnail: "/placeholder.webp",
      likes: 15,
      views: 123,
      createdAt: "2024-01-15",
      tags: ["数学", "计算器", "初学者"],
      description: "使用可视化编程制作的简单计算器，支持基本四则运算。"
    },
    {
      id: 2,
      title: "英语单词记忆游戏",
      author: "小红",
      subject: "英语",
      level: "小学",
      thumbnail: "/placeholder.webp",
      likes: 28,
      views: 256,
      createdAt: "2024-01-12",
      tags: ["英语", "游戏", "单词"],
      description: "通过拖拽组件创建的有趣单词记忆游戏。"
    },
    {
      id: 3,
      title: "化学元素周期表",
      author: "小李",
      subject: "化学",
      level: "高中",
      thumbnail: "/placeholder.webp",
      likes: 42,
      views: 387,
      createdAt: "2024-01-10",
      tags: ["化学", "周期表", "交互"],
      description: "交互式元素周期表，点击元素可查看详细信息。"
    }
  ])

  const [filterSubject, setFilterSubject] = useState("全部")
  const [sortBy, setSortBy] = useState("最新")

  const subjects = ["全部", "数学", "语文", "英语", "科学", "编程"]
  const sortOptions = ["最新", "最热", "最多赞"]

  const filteredProjects = projects
    .filter(project => filterSubject === "全部" || project.subject === filterSubject)
    .sort((a, b) => {
      switch (sortBy) {
        case "最热":
          return b.views - a.views
        case "最多赞":
          return b.likes - a.likes
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-orange-700">🎨 学习成果展示</h3>
        <Button className="bg-orange-600 hover:bg-orange-700">
          📤 分享我的作品
        </Button>
      </div>

      {/* 筛选和排序 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">学科筛选:</span>
          <div className="flex gap-1">
            {subjects.map(subject => (
              <button
                key={subject}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterSubject === subject
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterSubject(subject)}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">排序:</span>
          <select 
            className="px-3 py-1 border rounded-md text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 作品展示网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredProjects.map(project => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl">🖼️</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800 line-clamp-1">{project.title}</h4>
                <span className="text-xs text-gray-500">{project.createdAt}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                <span>👤 {project.author}</span>
                <span>{project.subject} • {project.level}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-3 text-sm text-gray-500">
                  <span>👁️ {project.views}</span>
                  <span>❤️ {project.likes}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">预览</Button>
                  <Button size="sm" variant="outline">🔗</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 统计信息 */}
      {isTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-orange-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">126</div>
            <div className="text-sm text-orange-700">学生作品</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">85%</div>
            <div className="text-sm text-blue-700">完成率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">4.8</div>
            <div className="text-sm text-green-700">平均评分</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">32</div>
            <div className="text-sm text-purple-700">优秀作品</div>
          </div>
        </div>
      )}
    </div>
  )
}