import React, { useState } from "react"

// 学生专用功能组件
export const StudentFeatures: React.FC<{
  educationLevel: string
  mode: '義教' | '高教'
}> = ({ educationLevel, mode }) => {
  const [currentTask, setCurrentTask] = useState(0)
  const [studentProgress, setStudentProgress] = useState({
    completedTasks: 0,
    totalTasks: 5,
    level: 1,
    points: 0,
    badges: [] as string[]
  })

  // 根据教育阶段定制任务
  const getTasks = () => {
    if (mode === '義教') {
      if (educationLevel === '小学') {
        return [
          { title: "创建我的第一个按钮", description: "拖拽一个彩色按钮到画布", points: 10 },
          { title: "为按钮添加颜色", description: "选择你喜欢的颜色", points: 15 },
          { title: "添加文字标签", description: "写上你的名字", points: 20 },
          { title: "制作简单卡片", description: "组合按钮和文字", points: 25 },
          { title: "分享你的作品", description: "展示给同学看", points: 30 }
        ]
      } else {
        return [
          { title: "设计登录界面", description: "创建用户名和密码输入", points: 20 },
          { title: "添加表单验证", description: "设置必填项检查", points: 30 },
          { title: "数据展示图表", description: "用图表显示班级成绩", points: 40 },
          { title: "响应式布局", description: "适配手机和平板", points: 50 },
          { title: "团队协作项目", description: "与同学共同完成", points: 60 }
        ]
      }
    } else {
      if (educationLevel === '高中') {
        return [
          { title: "算法可视化", description: "用组件展示排序算法", points: 50 },
          { title: "数据结构设计", description: "实现栈和队列操作", points: 60 },
          { title: "API接口集成", description: "调用第三方数据", points: 70 },
          { title: "系统架构设计", description: "设计完整应用架构", points: 80 },
          { title: "性能优化实践", description: "优化应用性能", points: 90 }
        ]
      } else {
        return [
          { title: "微服务架构", description: "设计分布式系统", points: 80 },
          { title: "AI组件开发", description: "集成机器学习功能", points: 100 },
          { title: "数据库设计", description: "设计高效数据模型", points: 120 },
          { title: "全栈应用开发", description: "端到端完整项目", points: 150 },
          { title: "产业级部署", description: "云端部署和运维", points: 200 }
        ]
      }
    }
  }

  const tasks = getTasks()

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-purple-700">👨‍🎓 学生学习面板</h3>
        <div className="flex gap-4 text-sm">
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
            ⭐ {studentProgress.points} 积分
          </span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
            🏆 等级 {studentProgress.level}
          </span>
        </div>
      </div>

      {/* 学习进度 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>学习进度</span>
          <span>{studentProgress.completedTasks}/{studentProgress.totalTasks}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(studentProgress.completedTasks / studentProgress.totalTasks) * 100}%` }}
          />
        </div>
      </div>

      {/* 当前任务 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="font-semibold mb-2">🎯 当前任务</h4>
        {tasks[currentTask] && (
          <div>
            <h5 className="font-medium text-blue-700">{tasks[currentTask].title}</h5>
            <p className="text-gray-600 text-sm mb-2">{tasks[currentTask].description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-600">奖励: +{tasks[currentTask].points} 积分</span>
              <button 
                className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                onClick={() => {
                  setStudentProgress(prev => ({
                    ...prev,
                    completedTasks: prev.completedTasks + 1,
                    points: prev.points + tasks[currentTask].points
                  }))
                  setCurrentTask(prev => Math.min(prev + 1, tasks.length - 1))
                }}
              >
                完成任务
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 成就展示 */}
      <div className="mt-4">
        <h4 className="font-semibold mb-2">🏅 我的成就</h4>
        <div className="flex flex-wrap gap-2">
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">🚀 初学者</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">🎨 创意设计师</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">🤝 团队合作者</span>
        </div>
      </div>
    </div>
  )
}

// 教师专用功能组件
export const TeacherFeatures: React.FC<{
  educationLevel: string
  mode: '義教' | '高教'
}> = ({ educationLevel, mode }) => {
  const [classData, setClassData] = useState({
    totalStudents: 32,
    activeStudents: 28,
    averageProgress: 65,
    completedProjects: 156
  })

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-orange-700">👩‍🏫 教师管理面板</h3>
        <button className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
          📊 生成报告
        </button>
      </div>

      {/* 班级概览 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{classData.totalStudents}</div>
          <div className="text-sm text-gray-600">班级总人数</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">{classData.activeStudents}</div>
          <div className="text-sm text-gray-600">活跃学生</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{classData.averageProgress}%</div>
          <div className="text-sm text-gray-600">平均进度</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{classData.completedProjects}</div>
          <div className="text-sm text-gray-600">完成项目数</div>
        </div>
      </div>

      {/* 教学工具 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <button className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-center">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium">布置作业</div>
          </div>
        </button>
        <button className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium">分组管理</div>
          </div>
        </button>
        <button className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">学情分析</div>
          </div>
        </button>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="font-semibold mb-3">🚀 快速操作</h4>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
            创建新课程
          </button>
          <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
            导出学生作品
          </button>
          <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200">
            设置评分标准
          </button>
          <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200">
            发送通知
          </button>
        </div>
      </div>
    </div>
  )
}