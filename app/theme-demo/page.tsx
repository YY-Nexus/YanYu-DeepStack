'use client'
import React, { useState } from 'react';
import { ThemeToggle, ThemeSelector, useTheme } from '../../context/ThemeContext';

// 简化版组件定义，避免导入不存在的组件
const Button = ({ children, variant = 'default', size = 'medium', className = '', disabled = false }: any) => {
  return (
    <button 
      className={`px-4 py-2 rounded-md font-medium transition-colors ${className}`}
      disabled={disabled}
      style={{
        backgroundColor: variant === 'primary' ? '#3B82F6' : variant === 'secondary' ? '#F3F4F6' : variant === 'outline' ? 'transparent' : variant === 'ghost' ? 'transparent' : '#3B82F6',
        color: variant === 'primary' ? '#FFFFFF' : variant === 'secondary' ? '#1F2937' : variant === 'outline' ? '#3B82F6' : variant === 'ghost' ? '#1F2937' : '#FFFFFF',
        border: variant === 'outline' ? '1px solid #3B82F6' : 'none',
        opacity: disabled ? 0.5 : 1,
        padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '8px 16px'
      }}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', header, footer }: { children: React.ReactNode; className?: string; header?: string; footer?: React.ReactNode }) => {
  return (
    <div className={`rounded-xl border shadow-sm ${className}`} style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
      {header && <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-semibold">{header}</h3></div>}
      <div className="p-6">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">{footer}</div>}
    </div>
  );
};

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>;
};

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
};

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
};

const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>{children}</div>;
};

const Container = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

const Input = ({ value, onChange, placeholder, id, className = '' }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; id?: string; className?: string }) => {
  return (
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-3 py-2 border rounded-md w-full ${className}`}
      style={{ borderColor: '#E5E7EB' }}
    />
  );
};

const Textarea = ({ value, onChange, placeholder, id, className = '' }: { value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; id?: string; className?: string }) => {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-3 py-2 border rounded-md w-full ${className}`}
      style={{ borderColor: '#E5E7EB' }}
    />
  );
};

const Select = ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) => {
  return (
    <div>
      {children}
    </div>
  );
};

const SelectTrigger = ({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) => {
  return (
    <div id={id} className={`px-3 py-2 border rounded-md ${className}`} style={{ borderColor: '#E5E7EB' }}>
      {children}
    </div>
  );
};

const SelectValue = ({ placeholder }: { placeholder: string }) => {
  return <span>{placeholder}</span>;
};

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute mt-1 border rounded-md bg-white shadow-lg">
      {children}
    </div>
  );
};

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => {
  return (
    <div className="px-3 py-2 cursor-pointer hover:bg-gray-100">
      {children}
    </div>
  );
};

const Switch = ({ checked, onCheckedChange, id }: { checked: boolean; onCheckedChange: (checked: boolean) => void; id: string }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only"
      />
      <div className={`w-10 h-6 rounded-full ${checked ? 'bg-blue-500' : 'bg-gray-300'} transition-colors`}>
        <div className={`w-4 h-4 rounded-full bg-white absolute transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'} mt-1`}></div>
      </div>
    </label>
  );
};

const Slider = ({ value, onValueChange, max = 100, step = 1, id }: { value: number[]; onValueChange: (value: number[]) => void; max?: number; step?: number; id: string }) => {
  return (
    <input
      type="range"
      id={id}
      min="0"
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    />
  );
};

const Tabs = ({ defaultValue, children, className = '' }: { defaultValue: string; children: React.ReactNode; className?: string }) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, (child: any) => {
        if (child.type === TabsList) {
          // 直接返回TabsList，保持原有的结构
          return child;
        }
        if (child.type === TabsContent && child.props.value === value) {
          return child;
        }
        return null;
      })}
    </div>
  );
};

const TabsList = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, className = '' }: { value: string; children: React.ReactNode; className?: string }) => {
  return (
    <button
      className={`px-4 py-2 font-medium border-b-2 border-blue-500 text-blue-500`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children }: { value: string; children: React.ReactNode }) => {
  return <div>{children}</div>;
};

const Avatar = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <div className={`relative rounded-full overflow-hidden ${className}`}>{children}</div>;
};

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => {
  return <img src={src} alt={alt} className="w-full h-full object-cover" />;
};

const AvatarFallback = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center bg-gray-200 text-gray-600">
      {children}
    </div>
  );
};

const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'outline' | 'destructive'; className?: string }) => {
  let bgColor = '#3B82F6';
  let textColor = '#FFFFFF';
  
  if (variant === 'secondary') { bgColor = '#F3F4F6'; textColor = '#1F2937'; }
  if (variant === 'outline') { bgColor = 'transparent'; textColor = '#3B82F6'; }
  if (variant === 'destructive') { bgColor = '#EF4444'; textColor = '#FFFFFF'; }
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {children}
    </span>
  );
};

const Progress = ({ value, className = '' }: { value: number; className?: string }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="h-2 rounded-full transition-all"
        style={{ width: `${value}%`, backgroundColor: '#3B82F6' }}
      ></div>
    </div>
  );
};

const ScrollArea = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`overflow-y-auto ${className}`}>
      {children}
    </div>
  );
};

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  let trigger = null;
  let content = null;
  
  React.Children.forEach(children, (child: any) => {
    if (child.type === TooltipTrigger) {
      trigger = React.cloneElement(child, { 
        onMouseEnter: () => setIsOpen(true),
        onMouseLeave: () => setIsOpen(false)
      });
    }
    if (child.type === TooltipContent) {
      content = child;
    }
  });
  
  return (
    <div className="relative inline-block">
      {trigger}
      {isOpen && content}
    </div>
  );
};

const TooltipTrigger = ({ asChild, children, onMouseEnter, onMouseLeave }: { asChild?: boolean; children: React.ReactNode; onMouseEnter?: () => void; onMouseLeave?: () => void }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave
    });
  }
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </div>
  );
};

const TooltipContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
      {children}
    </div>
  );
};

// 已从context/ThemeContext导入ThemeMode类型

/**
 * 主题演示页面
 * 展示YYC³ 组件库在不同主题模式下的外观和行为
 */
const ThemeDemoPage: React.FC = () => {
  const { isDarkMode, colors } = useTheme();
  const [inputValue, setInputValue] = useState('测试输入');
  const [textareaValue, setTextareaValue] = useState('测试多行文本输入\n第二行内容');
  const [selectValue, setSelectValue] = useState('option-1');
  const [switchValue, setSwitchValue] = useState(true);
  const [sliderValue, setSliderValue] = useState([50]);
  const [progressValue, setProgressValue] = useState(70);

  // 模拟进度更新
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgressValue(prev => (prev >= 100 ? 0 : prev + 10));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">YYC³ 主题演示</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <ThemeSelector />
            <Badge variant="outline">
              当前主题：{isDarkMode ? '深色' : '浅色'}
            </Badge>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 p-4 md:p-6">
        <Container>
          {/* 介绍卡片 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>主题系统介绍</CardTitle>
              <CardDescription>
                展示YYC³ 设计系统的主题切换功能和组件在不同主题下的表现
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                YYC³ 设计系统提供了完整的浅色模式和深色模式支持，通过顶部的切换按钮可以在不同主题之间切换。
                系统会自动记住您的偏好设置，并在下次访问时应用相同的主题。
              </p>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h3 className="font-medium mb-2">当前主题信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">背景色</p>
                    <div 
                      className="w-full h-10 rounded mt-1 border border-border" 
                      style={{ backgroundColor: colors.background }}
                    />
                    <p className="text-xs mt-1 font-mono">{colors.background}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">前景色</p>
                    <div 
                      className="w-full h-10 rounded mt-1 border border-border flex items-center justify-center" 
                      style={{ backgroundColor: colors.foreground, color: colors.background }}
                    >
                      示例文本
                    </div>
                    <p className="text-xs mt-1 font-mono">{colors.foreground}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">主色</p>
                    <div 
                      className="w-full h-10 rounded mt-1 border border-border flex items-center justify-center text-primary-contrast"
                      style={{ backgroundColor: colors.primary }}
                    >
                      主色示例
                    </div>
                    <p className="text-xs mt-1 font-mono">{colors.primary}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">辅助色</p>
                    <div 
                      className="w-full h-10 rounded mt-1 border border-border flex items-center justify-center text-secondary-contrast"
                      style={{ backgroundColor: colors.secondary }}
                    >
                      辅助色示例
                    </div>
                    <p className="text-xs mt-1 font-mono">{colors.secondary}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 组件展示标签页 */}
          <Tabs defaultValue="basic" className="mb-8">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">基础组件</TabsTrigger>
              <TabsTrigger value="form">表单组件</TabsTrigger>
              <TabsTrigger value="advanced">高级组件</TabsTrigger>
            </TabsList>

            {/* 基础组件标签页内容 */}
            <TabsContent value="basic">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 按钮组件 */}
                <Card>
                  <CardHeader>
                    <CardTitle>按钮组件</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button>主要按钮</Button>
                      <Button variant="secondary">次要按钮</Button>
                      <Button variant="outline">描边按钮</Button>
                      <Button variant="ghost">幽灵按钮</Button>
                      <Button disabled>禁用按钮</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm">小号按钮</Button>
                      <Button size="md">中号按钮</Button>
                      <Button size="lg">大号按钮</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 卡片组件 */}
                <Card>
                  <CardHeader>
                    <CardTitle>卡片组件</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Card className="mb-4 border border-border">
                      <CardContent className="p-4">
                        <p>基础卡片内容</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-primary/20 bg-primary/5">
                      <CardContent className="p-4">
                        <p>带样式的卡片</p>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                {/* 徽章组件 */}
                <Card>
                  <CardHeader>
                    <CardTitle>徽章组件</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge>默认徽章</Badge>
                      <Badge variant="secondary">次要徽章</Badge>
                      <Badge variant="outline">描边徽章</Badge>
                      <Badge variant="destructive">危险徽章</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-primary">主色徽章</Badge>
                      <Badge className="bg-secondary">辅助色徽章</Badge>
                      <Badge className="bg-success">成功徽章</Badge>
                      <Badge className="bg-warning">警告徽章</Badge>
                      <Badge className="bg-error">错误徽章</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* 头像组件 */}
                <Card>
                  <CardHeader>
                    <CardTitle>头像组件</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      <Avatar>
                        <AvatarImage src="https://picsum.photos/id/823/128/128" alt="用户头像" />
                        <AvatarFallback>用户</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="https://picsum.photos/id/237/128/128" alt="用户头像" />
                        <AvatarFallback>管理员</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-24 w-24">
                        <AvatarFallback>访客</AvatarFallback>
                      </Avatar>
                    </div>
                  </CardContent>
                </Card>

                {/* 进度条组件 */}
                <Card>
                  <CardHeader>
                    <CardTitle>进度条组件</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>默认进度条</span>
                        <span>{progressValue}%</span>
                      </div>
                      <Progress value={progressValue} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>自定义颜色进度条</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="bg-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>成功状态进度条</span>
                        <span>80%</span>
                      </div>
                      <Progress value={80} className="h-3 bg-success/20" />
                    </div>
                  </CardContent>
                </Card>

                {/* 工具提示组件 */}
                <Card>
                  <CardHeader>
                    <CardTitle>工具提示组件</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TooltipProvider>
                      <div className="flex space-x-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline">悬停查看提示</Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>这是一个工具提示示例</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary">另一个提示</Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>支持多行文本内容<br />第二行内容</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 表单组件标签页内容 */}
            <TabsContent value="form">
              <Card>
                <CardHeader>
                  <CardTitle>表单组件演示</CardTitle>
                  <CardDescription>展示各种表单组件在不同主题下的表现</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 输入框 */}
                  <div className="space-y-2">
                    <label htmlFor="input-demo" className="text-sm font-medium">
                      输入框
                    </label>
                    <Input
                      id="input-demo"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="请输入内容"
                    />
                  </div>

                  {/* 多行文本输入框 */}
                  <div className="space-y-2">
                    <label htmlFor="textarea-demo" className="text-sm font-medium">
                      多行文本输入框
                    </label>
                    <Textarea
                      id="textarea-demo"
                      value={textareaValue}
                      onChange={(e) => setTextareaValue(e.target.value)}
                      placeholder="请输入多行内容"
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* 选择器 */}
                  <div className="space-y-2">
                    <label htmlFor="select-demo" className="text-sm font-medium">
                      选择器
                    </label>
                    <Select value={selectValue} onValueChange={setSelectValue}>
                      <SelectTrigger id="select-demo">
                        <SelectValue placeholder="请选择一个选项" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option-1">选项一</SelectItem>
                        <SelectItem value="option-2">选项二</SelectItem>
                        <SelectItem value="option-3">选项三</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 开关 */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="switch-demo" className="text-sm font-medium">
                      开关组件
                    </label>
                    <Switch
                      id="switch-demo"
                      checked={switchValue}
                      onCheckedChange={setSwitchValue}
                    />
                  </div>

                  {/* 滑块 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="slider-demo" className="text-sm font-medium">
                        滑块组件
                      </label>
                      <span className="text-sm">{sliderValue[0]}%</span>
                    </div>
                    <Slider
                      id="slider-demo"
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={100}
                      step={1}
                    />
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline">取消</Button>
                    <Button>提交</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 高级组件标签页内容 */}
            <TabsContent value="advanced">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 滚动区域 */}
                <Card>
                  <CardHeader>
                    <CardTitle>滚动区域组件</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] rounded-md border">
                      <div className="p-4 space-y-4">
                        <div className="h-12 rounded-md bg-primary/10 flex items-center justify-center">
                          项目 1
                        </div>
                        <div className="h-12 rounded-md bg-secondary/10 flex items-center justify-center">
                          项目 2
                        </div>
                        <div className="h-12 rounded-md bg-success/10 flex items-center justify-center">
                          项目 3
                        </div>
                        <div className="h-12 rounded-md bg-warning/10 flex items-center justify-center">
                          项目 4
                        </div>
                        <div className="h-12 rounded-md bg-error/10 flex items-center justify-center">
                          项目 5
                        </div>
                        <div className="h-12 rounded-md bg-primary/10 flex items-center justify-center">
                          项目 6
                        </div>
                        <div className="h-12 rounded-md bg-secondary/10 flex items-center justify-center">
                          项目 7
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* 复杂卡片 */}
                <Card>
                  <CardHeader>
                    <CardTitle>复杂布局卡片</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b">
                        <h3 className="font-medium">复杂信息展示</h3>
                        <Badge>新</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">状态</p>
                          <p className="font-medium">活跃</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">进度</p>
                          <p className="font-medium">75%</p>
                        </div>
                      </div>
                      <Progress value={75} className="h-2" />
                      <div className="pt-2">
                        <Button variant="secondary" size="sm" className="w-full">
                          查看详情
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button size="sm">编辑</Button>
                    <Button size="sm" variant="outline">删除</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* 响应式布局演示 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>响应式布局演示</CardTitle>
              <CardDescription>调整浏览器窗口大小查看布局变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center justify-center h-24">
                      <span>响应式卡片 {i + 1}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 色彩演示 */}
          <Card>
            <CardHeader>
              <CardTitle>色彩系统演示</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">主色系列</p>
                  <div className="space-y-2">
                    <div className="h-12 rounded flex items-center justify-center text-primary-contrast" style={{ backgroundColor: colors.primary }}>
                      Primary
                    </div>
                    <div className="h-12 rounded flex items-center justify-center text-primary-contrast" style={{ backgroundColor: colors.primaryLight }}>
                      Primary Light
                    </div>
                    <div className="h-12 rounded flex items-center justify-center text-primary-contrast" style={{ backgroundColor: colors.primaryDark }}>
                      Primary Dark
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">辅助色系列</p>
                  <div className="space-y-2">
                    <div className="h-12 rounded flex items-center justify-center text-secondary-contrast" style={{ backgroundColor: colors.secondary }}>
                      Secondary
                    </div>
                    <div className="h-12 rounded flex items-center justify-center text-secondary-contrast" style={{ backgroundColor: colors.secondaryLight }}>
                      Secondary Light
                    </div>
                    <div className="h-12 rounded flex items-center justify-center text-secondary-contrast" style={{ backgroundColor: colors.secondaryDark }}>
                      Secondary Dark
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">功能色系列</p>
                  <div className="space-y-2">
                    <div className="h-12 rounded flex items-center justify-center text-white" style={{ backgroundColor: colors.success }}>
                      Success
                    </div>
                    <div className="h-12 rounded flex items-center justify-center text-white" style={{ backgroundColor: colors.warning }}>
                      Warning
                    </div>
                    <div className="h-12 rounded flex items-center justify-center text-white" style={{ backgroundColor: colors.error }}>
                      Error
                    </div>
                    <div className="h-12 rounded flex items-center justify-center text-white" style={{ backgroundColor: colors.info }}>
                      Info
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">中性色系列</p>
                  <div className="space-y-2">
                    <div className="h-8 rounded flex items-center justify-center border" style={{ backgroundColor: colors.background }}>
                      Background
                    </div>
                    <div className="h-8 rounded flex items-center justify-center" style={{ backgroundColor: colors.foreground, color: colors.background }}>
                      Foreground
                    </div>
                    <div className="h-8 rounded flex items-center justify-center border" style={{ backgroundColor: colors.card }}>
                      Card
                    </div>
                    <div className="h-8 rounded flex items-center justify-center border" style={{ backgroundColor: colors.border }}>
                      Border
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>

      {/* 页脚 */}
      <footer className="bg-background border-t border-border py-4 px-4">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-2 md:mb-0">
              YYC³ 深度堆栈全栈智创引擎 © {new Date().getFullYear()}
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">文档</Button>
              <Button variant="ghost" size="sm">关于</Button>
              <Button variant="ghost" size="sm">联系我们</Button>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default ThemeDemoPage;