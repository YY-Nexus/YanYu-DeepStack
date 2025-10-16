# 深色模式 (Dark Mode)

## 概述

深色模式是YYC³ 组件库提供的一种界面显示模式，通过使用较暗的背景和适当的对比度文字，减少屏幕亮度对用户眼睛的刺激，尤其在低光环境下使用更加舒适。本指南将介绍如何在YYC³ 项目中启用、配置和使用深色模式。

## 基础配置

### 主题颜色配置

YYC³ 的主题颜色系统在`lib/brand-system.ts`文件中定义，包含了浅色模式和深色模式的完整配色方案。

```tsx
// lib/brand-system.ts中的颜色配置示例
const colors = {
  // 浅色模式颜色
  light: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    foreground: '#1e293b',
    // ...其他颜色
  },
  // 深色模式颜色
  dark: {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    background: '#0f172a',
    foreground: '#f1f5f9',
    // ...其他颜色
  },
};
```

### 启用深色模式

YYC³ 项目中已经内置了深色模式支持，你可以通过以下几种方式启用深色模式：

#### 1. 使用深色模式切换按钮

```tsx
import { useState, useEffect } from 'react';

function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 初始化时检查系统偏好
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 可选：保存用户偏好到本地存储
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <button onClick={toggleDarkMode}>
      {isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
    </button>
  );
}
```

#### 2. 移动端深色模式设置

在移动端界面中，可以通过设置页面的开关来控制深色模式：

```tsx
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

function MobileSettings() {
  const [darkMode, setDarkMode] = useState(false);

  const handleDarkModeChange = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="dark-mode">深色模式</Label>
        <Switch
          id="dark-mode"
          checked={darkMode}
          onCheckedChange={handleDarkModeChange}
        />
      </div>
      {/* 其他设置项 */}
    </div>
  );
}
```

## 组件适配

YYC³ 的组件库已经内置了深色模式的适配支持，大多数组件会根据当前的主题模式自动调整样式。以下是一些组件在深色模式下的使用示例：

### 按钮组件

```tsx
<BrandButton>主要按钮</BrandButton>
<BrandButton variant="secondary">次要按钮</BrandButton>
<BrandButton variant="outline">描边按钮</BrandButton>
```

### 卡片组件

```tsx
<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>卡片描述信息</CardDescription>
  </CardHeader>
  <CardContent>
    <p>卡片内容区域</p>
  </CardContent>
</Card>

<BrandCard variant="glass">
  <div className="p-6">
    <h3 className="font-semibold text-lg mb-2">玻璃拟态卡片</h3>
    <p>在深色模式下的玻璃拟态效果</p>
  </div>
</BrandCard>
```

### 输入组件

```tsx
<Input placeholder="请输入内容" />
<Textarea placeholder="请输入多行内容" />
<Select>
  <SelectTrigger>
    <SelectValue placeholder="请选择" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option-1">选项 1</SelectItem>
    <SelectItem value="option-2">选项 2</SelectItem>
  </SelectContent>
</Select>
```

## 自定义深色模式样式

### 使用Tailwind的深色模式前缀

在自定义组件或页面样式时，可以使用Tailwind的`dark:`前缀来定义深色模式下的特定样式：

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  自适应深色模式的内容
</div>

<button className="hover:bg-gray-100 dark:hover:bg-gray-800">
  自适应深色模式的悬停效果
</button>
```

### 自定义组件深色样式

在创建自定义组件时，可以通过检查`document.documentElement.classList.contains('dark')`来判断当前是否为深色模式，并应用不同的样式：

```tsx
function CustomComponent() {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <div 
      className={`p-4 rounded-lg transition-colors duration-300 
        ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-800'}`}
    >
      自定义组件
    </div>
  );
}
```

## 最佳实践

1. **系统偏好优先**：在应用初始化时，应优先检查用户的系统偏好设置，并据此设置初始主题。

2. **用户选择记忆**：将用户的主题选择保存到本地存储，以便在用户下次访问时保持一致的体验。

3. **平滑过渡**：为主题切换添加平滑的过渡动画，提升用户体验。可以通过在`tailwind.config.js`中配置过渡效果来实现。

4. **对比度检查**：确保在深色模式下，文本和背景的对比度符合WCAG可访问性标准。

5. **图片适配**：为一些图片提供深色模式下的替代版本，特别是那些在深色背景上显示效果不佳的图片。

6. **性能优化**：避免频繁切换主题模式导致的性能问题，确保组件能够高效地响应主题变化。

## 常见问题

### Q: 如何在SSR环境中正确处理深色模式？

A: 在Next.js等SSR框架中，由于服务器端无法访问`localStorage`或`window`对象，需要特殊处理：

1. 首先在服务器端渲染时，使用默认主题（通常是浅色主题）
2. 在客户端 hydration 完成后，检查用户的主题偏好并应用

```tsx
// _app.tsx 或根组件
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // 检查本地存储中的主题偏好
    const savedTheme = localStorage.getItem('theme');
    
    // 如果有保存的主题，应用它
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // 否则，遵循系统偏好
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return <Component {...pageProps} />;
}
```

### Q: 如何为特定组件定制深色模式样式？

A: 可以使用Tailwind的`dark:`前缀为特定组件添加深色模式样式，或者在组件内部通过JavaScript逻辑判断当前主题并应用不同的className。

### Q: 深色模式下的颜色对比度如何保证？

A: 可以使用在线工具（如WebAIM的对比度检查器）来验证深色模式下文本和背景的对比度是否符合WCAG标准。一般来说，普通文本的对比度应至少为4.5:1，大文本的对比度应至少为3:1。

## 无障碍支持

- 确保深色模式下的文本和背景具有足够的对比度
- 为主题切换功能提供键盘可访问的界面元素
- 避免使用可能导致光敏性癫痫发作的闪烁效果
- 确保所有交互元素在深色模式下都清晰可辨