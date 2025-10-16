import React, { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"

// Gamification 游戏化学习系统
export const GamificationSystem: React.FC<{
  userId: string
  isStudent: boolean
}> = ({ userId, isStudent }) => {
  const [userStats, setUserStats] = useState({
    level: 5,
    xp: 2350,
    xpToNext: 650,
    streak: 7,
    totalProjects: 15,
    badges: [
      { id: 1, name: "初学者", icon: "🎯", earned: true, description: "完成第一个项目" },
      { id: 2, name: "坚持者", icon: "🔥", earned: true, description: "连续学习7天" },
      { id: 3, name: "创新者", icon: "💡", earned: true, description: "创建原创作品" },
      { id: 4, name: "合作者", icon: "🤝", earned: false, description: "参与团队项目" },
      { id: 5, name: "导师", icon: "👨‍🏫", earned: false, description: "帮助其他学生" },
      { id: 6, name: "专家", icon: "⭐", earned: false, description: "掌握高级技能" }
    ]
  })

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: "小明", level: 8, xp: 4200, avatar: "👦" },
    { rank: 2, name: "小红", level: 7, xp: 3800, avatar: "👧" },
    { rank: 3, name: "小李", level: 6, xp: 3200, avatar: "👨" },
    { rank: 4, name: "小张", level: 5, xp: 2900, avatar: "👩" },
    { rank: 5, name: "我", level: userStats.level, xp: userStats.xp, avatar: "😊", isMe: true }
  ])

  const [dailyQuests, setDailyQuests] = useState([
    { id: 1, title: "完成一个数学项目", progress: 0, target: 1, reward: 100, completed: false },
    { id: 2, title: "学习30分钟", progress: 25, target: 30, reward: 50, completed: false },
    { id: 3, title: "分享一个作品", progress: 0, target: 1, reward: 75, completed: false }
  ])

  const [weeklyChallenge, setWeeklyChallenge] = useState({
    title: "创意编程挑战赛",
    description: "使用可视化编程创建一个互动小游戏",
    progress: 60,
    deadline: "3天后",
    participants: 156,
    reward: "🏆 创意大师徽章 + 500 XP"
  })

  const earnedBadges = userStats.badges.filter(badge => badge.earned)
  const availableBadges = userStats.badges.filter(badge => !badge.earned)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-purple-700 flex items-center gap-2">
          🎮 游戏化学习中心
        </h3>
        <Button variant="outline" size="sm">
          📊 详细统计
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 用户状态面板 */}
        <div className="lg:col-span-1">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-center">👤 我的等级</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                Lv.{userStats.level}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {userStats.xp} / {userStats.xp + userStats.xpToNext} XP
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-bold text-orange-600">{userStats.streak}</div>
                  <div className="text-gray-600">连续天数</div>
                </div>
                <div>
                  <div className="font-bold text-blue-600">{userStats.totalProjects}</div>
                  <div className="text-gray-600">完成项目</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 徽章展示 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🏆 我的徽章</span>
                <Badge>{earnedBadges.length}/{userStats.badges.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {earnedBadges.map(badge => (
                  <div key={badge.id} className="text-center p-2 bg-yellow-50 rounded-lg">
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="text-xs font-medium">{badge.name}</div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                还有 {availableBadges.length} 个徽章等你解锁！
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 任务和挑战 */}
        <div className="lg:col-span-2">
          {/* 每日任务 */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>📝 每日任务</span>
                <span className="text-sm text-gray-500">重置于 6小时后</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyQuests.map(quest => (
                  <div key={quest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{quest.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-green-500 h-1 rounded-full"
                            style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {quest.progress}/{quest.target}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-600">+{quest.reward} XP</div>
                      {quest.completed ? (
                        <Badge className="bg-green-100 text-green-800">已完成</Badge>
                      ) : (
                        <Button size="sm" variant="outline">开始</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 周挑战 */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🎯 本周挑战</span>
                <span className="text-sm text-red-500">{weeklyChallenge.deadline}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-bold text-lg mb-2">{weeklyChallenge.title}</h4>
              <p className="text-gray-600 mb-3">{weeklyChallenge.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${weeklyChallenge.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{weeklyChallenge.progress}%</span>
                </div>
                <div className="text-sm text-gray-500">
                  {weeklyChallenge.participants} 人参与
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-purple-600">
                  奖励: {weeklyChallenge.reward}
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  继续挑战
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 排行榜 */}
          <Card>
            <CardHeader>
              <CardTitle>🏆 本周排行榜</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map(user => (
                  <div 
                    key={user.rank} 
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      user.isMe ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        user.rank <= 3 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {user.rank}
                      </div>
                      <span className="text-xl">{user.avatar}</span>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">Lv.{user.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{user.xp} XP</div>
                      {user.isMe && <Badge variant="outline">我</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// 智能推荐系统
export const SmartRecommendation: React.FC<{
  userLevel: string
  subject: string
  learningStyle: string
}> = ({ userLevel, subject, learningStyle }) => {
  const [recommendations, setRecommendations] = useState([
    {
      type: "project",
      title: "数学函数可视化器",
      difficulty: "中等",
      time: "30分钟",
      match: 92,
      reason: "基于你的数学兴趣和当前水平推荐",
      tags: ["数学", "可视化", "函数"],
      thumbnail: "📊"
    },
    {
      type: "tutorial",
      title: "条件语句入门教程",
      difficulty: "简单",
      time: "15分钟",
      match: 88,
      reason: "这是你下一步需要掌握的编程概念",
      tags: ["编程", "逻辑", "基础"],
      thumbnail: "🎓"
    },
    {
      type: "component",
      title: "计算器按钮组件",
      difficulty: "简单",
      time: "10分钟",
      match: 85,
      reason: "适合你的项目需求",
      tags: ["组件", "UI", "交互"],
      thumbnail: "🧩"
    }
  ])

  const [preferences, setPreferences] = useState({
    difficulty: "适中",
    duration: "30分钟",
    topics: ["数学", "编程基础", "可视化"]
  })

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-blue-700">🎯 智能推荐系统</h3>
        <Button variant="outline" size="sm">
          ⚙️ 设置偏好
        </Button>
      </div>

      {/* 推荐列表 */}
      <div className="space-y-4 mb-6">
        {recommendations.map((rec, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{rec.thumbnail}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                    <Badge className="bg-green-100 text-green-800">
                      {rec.match}% 匹配
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>📊 {rec.difficulty}</span>
                    <span>⏱️ {rec.time}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rec.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    开始学习
                  </Button>
                  <Button size="sm" variant="outline">
                    稍后再看
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 学习偏好设置 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">📈 个性化设置</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">难度偏好</label>
            <select className="w-full p-2 border rounded text-sm">
              <option>简单</option>
              <option>适中</option>
              <option>困难</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">学习时长</label>
            <select className="w-full p-2 border rounded text-sm">
              <option>15分钟</option>
              <option>30分钟</option>
              <option>60分钟以上</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">学习风格</label>
            <select className="w-full p-2 border rounded text-sm">
              <option>视觉型</option>
              <option>操作型</option>
              <option>理论型</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

// 多语言支持系统
export const MultiLanguageSupport: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState("zh-CN")
  const [availableLanguages] = useState([
    { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
    { code: "zh-TW", name: "繁體中文", flag: "🇹🇼" },
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
    { code: "ko-KR", name: "한국어", flag: "🇰🇷" },
    { code: "es-ES", name: "Español", flag: "🇪🇸" },
    { code: "fr-FR", name: "Français", flag: "🇫🇷" }
  ])

  const translations = {
    "zh-CN": {
      welcome: "欢迎使用智能编程平台",
      components: "组件",
      canvas: "画布",
      properties: "属性",
      export: "导出"
    },
    "en-US": {
      welcome: "Welcome to Smart Programming Platform",
      components: "Components",
      canvas: "Canvas",
      properties: "Properties", 
      export: "Export"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-indigo-700">🌍 多语言支持</h3>
        <select 
          className="px-3 py-2 border rounded-md"
          value={currentLanguage}
          onChange={(e) => setCurrentLanguage(e.target.value)}
        >
          {availableLanguages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {availableLanguages.map(lang => (
          <button
            key={lang.code}
            className={`p-3 rounded-lg border transition-all ${
              currentLanguage === lang.code 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setCurrentLanguage(lang.code)}
          >
            <div className="text-2xl mb-1">{lang.flag}</div>
            <div className="font-medium text-sm">{lang.name}</div>
          </button>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-lg p-4">
        <h4 className="font-medium text-indigo-800 mb-3">🎯 本地化功能</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium mb-2">界面翻译</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 菜单和按钮文本</li>
              <li>• 帮助文档和教程</li>
              <li>• 错误提示信息</li>
              <li>• 组件描述说明</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">教育内容</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 多语言编程教程</li>
              <li>• 本地化学科内容</li>
              <li>• 文化适应性调整</li>
              <li>• 地区教育标准对接</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}