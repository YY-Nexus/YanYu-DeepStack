import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Award, Brain, Sparkles } from 'lucide-react';

interface PersonalitySettings {
  uiDensity: 'compact' | 'comfortable' | 'spacious';
  colorScheme: 'light' | 'dark' | 'auto' | 'custom';
  animationLevel: 'none' | 'reduced' | 'full';
}

interface UserPersonality {
  type: string;
  traits: string[];
  preferences: {
    learningStyle: string;
    interactionMode: string;
    feedbackType: string;
    visualTheme: string;
  };
  skills: Array<{
    name: string;
    level: number;
  }>;
  achievements: string[];
  growthPath: string[];
}

export const PersonalityEngine: React.FC = () => {
  const [userPersonality, setUserPersonality] = useState<UserPersonality>({
    type: '探索型学习者',
    traits: ['好奇心强', '实践导向', '视觉学习', '快速适应'],
    preferences: {
      learningStyle: '项目驱动',
      interactionMode: '互动式',
      feedbackType: '即时反馈',
      visualTheme: '现代简约'
    },
    skills: [
      { name: '编程思维', level: 75 },
      { name: '问题解决', level: 80 },
      { name: '创意表达', level: 65 },
      { name: '团队协作', level: 70 }
    ],
    achievements: ['快速学习者', '问题解决者', '创意先锋'],
    growthPath: ['基础掌握', '技能提升', '项目实践', '创新应用']
  });

  const [settings, setSettings] = useState<PersonalitySettings>({
    uiDensity: 'comfortable',
    colorScheme: 'auto',
    animationLevel: 'full'
  });

  const [personalityScore, setPersonalityScore] = useState(85);
  const [adaptationLevel, setAdaptationLevel] = useState(78);

  const getPersonalityIcon = (type: string) => {
    const icons: Record<string, string> = {
      '探索型学习者': '🔍',
      '系统思考者': '🧠',
      '实践行动者': '⚡',
      '创意表达者': '🎨'
    };
    return icons[type] || '👤';
  };

  const getSkillColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-blue-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const updateSettings = <K extends keyof PersonalitySettings>(
    key: K,
    value: PersonalitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // 模拟个性化适配计算
    const timer = setInterval(() => {
      setAdaptationLevel(prev => Math.min(prev + 1, 100));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* 用户画像概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="text-blue-500" />
            个性化用户画像
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/placeholder-user.webp" />
              <AvatarFallback>YY</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span>{getPersonalityIcon(userPersonality.type)}</span>
                <h3 className="text-lg font-semibold">{userPersonality.type}</h3>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {userPersonality.traits.map((trait, index) => (
                  <Badge key={index} variant="secondary">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{personalityScore.toFixed(0)}</div>
              <div className="text-sm text-gray-500">匹配度</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-1">
              <div className="font-medium text-sm">{userPersonality.preferences.learningStyle}</div>
              <div className="text-xs text-gray-500">学习风格</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="font-medium text-sm">{userPersonality.preferences.interactionMode}</div>
              <div className="text-xs text-gray-500">交互模式</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="font-medium text-sm">{userPersonality.preferences.feedbackType}</div>
              <div className="text-xs text-gray-500">反馈类型</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="font-medium text-sm">{userPersonality.preferences.visualTheme}</div>
              <div className="text-xs text-gray-500">视觉主题</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 技能成长图谱 */}
      <Card>
        <CardHeader>
          <CardTitle>技能成长图谱</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userPersonality.skills.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{skill.name}</span>
                  <Badge className={`${getSkillColor(skill.level)} text-white`}>
                    Lv.{Math.floor(skill.level / 20) + 1}
                  </Badge>
                </div>
                <Progress value={skill.level} className="h-2" />
                <div className="text-right text-xs text-gray-500">{skill.level}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 个性化设置 */}
      <Card>
        <CardHeader>
          <CardTitle>个性化设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">界面密度</h4>
              <div className="flex gap-2">
                {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                  <Button
                    key={density}
                    variant={settings.uiDensity === density ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings('uiDensity', density)}
                  >
                    {density === 'compact' ? '紧凑' : density === 'comfortable' ? '舒适' : '宽松'}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">智能适配程度</span>
                <Badge variant="outline">{adaptationLevel.toFixed(0)}%</Badge>
              </div>
              <Progress value={adaptationLevel} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
