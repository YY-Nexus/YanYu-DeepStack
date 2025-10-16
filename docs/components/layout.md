# Layout（布局）组件

## 概述

Layout组件是YYC³ 组件库中用于构建页面结构的基础组件，提供了多种布局模式和响应式配置，帮助开发者快速搭建一致且美观的页面布局。布局组件包括栅格系统、容器、分割器等基础元素。

## 导入方式

```tsx
import { Container } from '@/components/ui/container'
import { Grid, GridItem } from '@/components/ui/grid'
import { SplitLayout, SplitLayoutPanel, SplitLayoutHandle } from '@/components/ui/split-layout'
import { Separator } from '@/components/ui/separator'
```

## 基本用法

### 容器组件

```tsx
<Container>
  <p>页面内容，会在不同屏幕尺寸下保持合适的最大宽度</p>
</Container>

<Container size="sm">
  <p>小尺寸容器</p>
</Container>

<Container size="lg">
  <p>大尺寸容器</p>
</Container>
```

### 栅格系统

```tsx
<Grid>
  <GridItem colSpan={12}>全宽内容</GridItem>
</Grid>

<Grid>
  <GridItem colSpan={6}>半宽内容</GridItem>
  <GridItem colSpan={6}>半宽内容</GridItem>
</Grid>

<Grid>
  <GridItem colSpan={{ base: 12, md: 6, lg: 4 }}>响应式列</GridItem>
  <GridItem colSpan={{ base: 12, md: 6, lg: 4 }}>响应式列</GridItem>
  <GridItem colSpan={{ base: 12, md: 12, lg: 4 }}>响应式列</GridItem>
</Grid>
```

### 分割布局

```tsx
<SplitLayout>
  <SplitLayoutPanel defaultSize={30}>
    <div className="p-4">左侧面板</div>
  </SplitLayoutPanel>
  <SplitLayoutHandle />
  <SplitLayoutPanel>
    <div className="p-4">右侧面板</div>
  </SplitLayoutPanel>
</SplitLayout>

<SplitLayout direction="vertical">
  <SplitLayoutPanel defaultSize={40}>
    <div className="p-4">顶部面板</div>
  </SplitLayoutPanel>
  <SplitLayoutHandle />
  <SplitLayoutPanel>
    <div className="p-4">底部面板</div>
  </SplitLayoutPanel>
</SplitLayout>
```

### 分割器

```tsx
<p>内容上方</p>
<Separator />
<p>内容下方</p>

<p>水平分割</p>
<Separator orientation="horizontal" />
<p>垂直分割</p>
<Separator orientation="vertical" className="h-12" />
```

## 属性说明

### Container组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | `React.ReactNode` | - | 容器内容 |
| size | `"sm" \| "md" \| "lg" \| "xl" \| "2xl"` | `"md"` | 容器最大宽度尺寸 |
| className | `string` | - | 自定义CSS类名 |
| ...other | `React.HTMLAttributes<HTMLDivElement>` | - | 其他HTML属性 |

### Grid组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | `React.ReactNode` | - | 栅格内容，通常是GridItem组件 |
| className | `string` | - | 自定义CSS类名 |
| ...other | `React.HTMLAttributes<HTMLDivElement>` | - | 其他HTML属性 |

### GridItem组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | `React.ReactNode` | - | 栅格项内容 |
| colSpan | `number \| { base?: number, sm?: number, md?: number, lg?: number, xl?: number, 2xl?: number }` | `12` | 列跨度，可以是数字或响应式配置对象 |
| className | `string` | - | 自定义CSS类名 |
| ...other | `React.HTMLAttributes<HTMLDivElement>` | - | 其他HTML属性 |

### SplitLayout组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | `React.ReactNode` | - | 分割布局内容，由SplitLayoutPanel和SplitLayoutHandle组件组成 |
| direction | `"horizontal" \| "vertical"` | `"horizontal"` | 分割方向 |
| className | `string` | - | 自定义CSS类名 |
| ...other | `React.HTMLAttributes<HTMLDivElement>` | - | 其他HTML属性 |

### SplitLayoutPanel组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | `React.ReactNode` | - | 面板内容 |
| defaultSize | `number` | - | 默认尺寸百分比 |
| minSize | `number` | - | 最小尺寸百分比 |
| maxSize | `number` | - | 最大尺寸百分比 |
| className | `string` | - | 自定义CSS类名 |
| ...other | `React.HTMLAttributes<HTMLDivElement>` | - | 其他HTML属性 |

### SplitLayoutHandle组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| className | `string` | - | 自定义CSS类名 |
| ...other | `React.HTMLAttributes<HTMLDivElement>` | - | 其他HTML属性 |

### Separator组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | 分割方向 |
| className | `string` | - | 自定义CSS类名 |
| ...other | `React.HTMLAttributes<HTMLDivElement>` | - | 其他HTML属性 |

## 布局模式

### 固定顶部导航 + 侧边栏 + 主内容

```tsx
<div className="flex flex-col min-h-screen">
  {/* 顶部导航 */}
  <header className="h-16 bg-white border-b">
    {/* 导航内容 */}
  </header>
  
  <div className="flex flex-1">
    {/* 侧边栏 */}
    <aside className="w-64 bg-white border-r">
      {/* 侧边栏内容 */}
    </aside>
    
    {/* 主内容区域 */}
    <main className="flex-1 p-6 overflow-auto">
      <Container>
        {/* 页面内容 */}
      </Container>
    </main>
  </div>
</div>
```

### 分屏布局

```tsx
<div className="flex flex-col min-h-screen">
  {/* 顶部导航 */}
  <header className="h-16 bg-white border-b">
    {/* 导航内容 */}
  </header>
  
  {/* 分屏内容区域 */}
  <main className="flex-1 overflow-hidden">
    <SplitLayout>
      <SplitLayoutPanel defaultSize={30}>
        {/* 左侧内容 */}
      </SplitLayoutPanel>
      <SplitLayoutHandle />
      <SplitLayoutPanel>
        {/* 右侧内容 */}
        <SplitLayout direction="vertical">
          <SplitLayoutPanel defaultSize={50}>
            {/* 右上内容 */}
          </SplitLayoutPanel>
          <SplitLayoutHandle />
          <SplitLayoutPanel>
            {/* 右下内容 */}
          </SplitLayoutPanel>
        </SplitLayout>
      </SplitLayoutPanel>
    </SplitLayout>
  </main>
</div>
```

### 响应式多列布局

```tsx
<Container>
  <Grid>
    <GridItem colSpan={{ base: 12, md: 6, lg: 3 }} className="p-4">
      <Card>
        {/* 卡片内容 */}
      </Card>
    </GridItem>
    <GridItem colSpan={{ base: 12, md: 6, lg: 3 }} className="p-4">
      <Card>
        {/* 卡片内容 */}
      </Card>
    </GridItem>
    <GridItem colSpan={{ base: 12, md: 6, lg: 3 }} className="p-4">
      <Card>
        {/* 卡片内容 */}
      </Card>
    </GridItem>
    <GridItem colSpan={{ base: 12, md: 6, lg: 3 }} className="p-4">
      <Card>
        {/* 卡片内容 */}
      </Card>
    </GridItem>
  </Grid>
</Container>
```

## 最佳实践

1. **页面结构**：使用Container组件包裹主要内容，确保在不同屏幕尺寸下有良好的视觉效果。

2. **响应式设计**：利用Grid和GridItem组件的响应式属性，为不同屏幕尺寸设计合适的布局。

3. **用户自定义布局**：对于复杂的界面，使用SplitLayout组件允许用户自定义面板大小，提升用户体验。

4. **一致性**：在整个应用中保持一致的布局模式和间距规范。

5. **性能优化**：避免过多嵌套的布局组件，保持DOM结构简洁。

## 常见问题

### Q: 如何实现响应式的侧边栏？

A: 可以使用媒体查询和状态管理结合，在小屏幕上隐藏侧边栏，通过按钮控制显示和隐藏。

```tsx
<div className="flex flex-col min-h-screen">
  {/* 顶部导航 */}
  <header className="h-16 bg-white border-b flex items-center justify-between px-4">
    <button onClick={toggleSidebar} className="md:hidden">
      <MenuIcon />
    </button>
    <h1>应用标题</h1>
  </header>
  
  <div className="flex flex-1">
    {/* 侧边栏 */}
    <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-white border-r`}>
      {/* 侧边栏内容 */}
    </aside>
    
    {/* 主内容区域 */}
    <main className="flex-1 p-6 overflow-auto">
      <Container>
        {/* 页面内容 */}
      </Container>
    </main>
  </div>
</div>
```

### Q: 如何控制容器的最大宽度？

A: 使用Container组件的size属性，可以选择预设的宽度尺寸。

### Q: 如何实现复杂的嵌套布局？

A: 可以组合使用Grid和SplitLayout组件，创建复杂的嵌套布局结构。

## 无障碍支持

- 确保布局结构符合语义化HTML标准
- 支持键盘导航
- 考虑屏幕阅读器的兼容性
- 响应式设计确保在不同设备上都有良好的可访问性