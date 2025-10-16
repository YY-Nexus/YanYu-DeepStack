# Card（卡片）组件

## 概述

Card组件是YYC³ 组件库中用于展示内容的容器组件，通常用于组织相关信息、展示数据或包裹其他组件。卡片组件提供了灵活的布局选项和多种变体，以适应不同的内容展示需求。

## 导入方式

```tsx
import { BrandCard } from '@/components/ui/brand-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
```

## 基本用法

### 基础卡片

```tsx
<Card>
  <CardContent>
    <p>基础卡片内容</p>
  </CardContent>
</Card>
```

### 带头部和内容的卡片

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
```

### 带尾部的卡片

```tsx
<Card>
  <CardContent>
    <p>卡片内容区域</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="sm">取消</Button>
    <Button size="sm">确定</Button>
  </CardFooter>
</Card>
```

### 完整卡片结构

```tsx
<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>卡片描述信息</CardDescription>
  </CardHeader>
  <CardContent>
    <p>卡片内容区域</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="sm">取消</Button>
    <Button size="sm">确定</Button>
  </CardFooter>
</Card>
```

### BrandCard变体

```tsx
<BrandCard>
  <div className="p-6">
    <h3 className="font-semibold text-lg mb-2">BrandCard标题</h3>
    <p className="text-gray-600">BrandCard提供了更多样式选项和动画效果</p>
  </div>
</BrandCard>

<BrandCard variant="glass">
  <div className="p-6">
    <h3 className="font-semibold text-lg mb-2">玻璃拟态卡片</h3>
    <p className="text-gray-600">具有毛玻璃效果的卡片样式</p>
  </div>
</BrandCard>
```

## 属性说明

### Card组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | `React.ReactNode` | - | 卡片内容 |
| className | `string` | - | 自定义CSS类名 |
| ...other | `React.HTMLAttributes<HTMLDivElement>` | - | 其他HTML属性 |

### CardHeader组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | `React.ReactNode` | - | 头部内容 |
| className | `string` | - | 自定义CSS类名 |

### CardTitle组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | `React.ReactNode` | - | 标题内容 |
| className | `string` | - | 自定义CSS类名 |

### CardDescription组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | `React.ReactNode` | - | 描述内容 |
| className | `string` | - | 自定义CSS类名 |

### CardContent组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | `React.ReactNode` | - | 内容区域 |
| className | `string` | - | 自定义CSS类名 |

### CardFooter组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | `React.ReactNode` | - | 尾部内容 |
| className | `string` | - | 自定义CSS类名 |

### BrandCard组件

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| variant | `"default" \| "glass" \| "borderless"` | `"default"` | 卡片变体样式 |
| children | `React.ReactNode` | - | 卡片内容 |
| className | `string` | - | 自定义CSS类名 |
| ...other | `React.HTMLAttributes<HTMLDivElement>` | - | 其他HTML属性 |

## 样式定制

Card组件支持通过className属性覆盖默认样式，也可以通过自定义Tailwind主题来全局定制卡片样式。

### 自定义样式示例

```tsx
<Card className="rounded-xl shadow-lg overflow-hidden">
  {/* 卡片内容 */}
</Card>

<Card className="border-2 border-dashed border-gray-300">
  {/* 卡片内容 */}
</Card>

<BrandCard className="h-full flex flex-col">
  {/* 卡片内容 */}
</BrandCard>
```

## 最佳实践

1. **内容组织**：使用卡片来组织相关信息，保持界面的整洁和有序。

2. **信息层次**：使用CardHeader、CardContent和CardFooter来创建清晰的信息层次结构。

3. **响应式设计**：在不同屏幕尺寸下，卡片可以从单列布局变为多列布局。

4. **交互反馈**：为卡片添加悬停效果可以提升用户体验，使用`BrandCard`组件可以获得内置的动画效果。

5. **玻璃拟态**：在背景有图片或渐变的情况下，可以使用`variant="glass"`的`BrandCard`创建现代感的玻璃拟态效果。

## 常见问题

### Q: 如何在卡片中添加图片？

A: 可以在Card组件内部添加img标签或Image组件，通常放在CardHeader或CardContent中。

```tsx
<Card>
  <img src="/image.jpg" alt="示例图片" className="w-full h-48 object-cover" />
  <CardContent>
    {/* 其他内容 */}
  </CardContent>
</Card>
```

### Q: 如何实现卡片的点击事件？

A: 可以给Card组件添加onClick属性，或者在Card外部包裹一个可点击的元素。

```tsx
<Card onClick={() => handleCardClick()} className="cursor-pointer hover:shadow-md transition-shadow">
  {/* 卡片内容 */}
</Card>
```

### Q: 如何实现带有渐变背景的卡片？

A: 可以通过className属性为卡片添加渐变背景样式。

```tsx
<Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
  {/* 卡片内容 */}
</Card>
```

## 无障碍支持

- 确保卡片内容具有良好的可读性
- 为可点击的卡片添加适当的键盘导航支持
- 颜色对比度符合WCAG标准