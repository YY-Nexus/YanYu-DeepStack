# Button（按钮）组件

## 概述

Button组件是YYC³ 组件库中最常用的交互组件之一，用于触发操作、提交表单、导航等场景。本组件提供了多种变体、尺寸和状态，以适应不同的设计需求。

## 导入方式

```tsx
import { BrandButton } from '@/components/ui/brand-button'
```

## 基本用法

### 默认按钮

```tsx
<BrandButton>默认按钮</BrandButton>
```

### 不同变体

```tsx
<BrandButton variant="primary">主要按钮</BrandButton>
<BrandButton variant="secondary">次要按钮</BrandButton>
<BrandButton variant="outline">描边按钮</BrandButton>
<BrandButton variant="ghost">幽灵按钮</BrandButton>
<BrandButton variant="gradient">渐变按钮</BrandButton>
```

### 不同尺寸

```tsx
<BrandButton size="sm">小尺寸</BrandButton>
<BrandButton size="md">中等尺寸</BrandButton>
<BrandButton size="lg">大尺寸</BrandButton>
```

### 带图标按钮

```tsx
<BrandButton icon={<Plus className="h-4 w-4" />}>添加</BrandButton>
<BrandButton variant="secondary" icon={<Trash className="h-4 w-4" />}>删除</BrandButton>
```

### 禁用状态

```tsx
<BrandButton disabled>禁用按钮</BrandButton>
<BrandButton variant="outline" disabled>禁用描边按钮</BrandButton>
```

### 加载状态

```tsx
<BrandButton loading>加载中</BrandButton>
<BrandButton variant="secondary" loading>提交中</BrandButton>
```

## 属性说明

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| variant | `"primary" \| "secondary" \| "outline" \| "ghost" \| "gradient"` | `"primary"` | 按钮变体样式 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 按钮尺寸 |
| loading | `boolean` | `false` | 是否显示加载状态 |
| icon | `React.ReactNode` | - | 按钮图标 |
| children | `React.ReactNode` | - | 按钮文本内容 |
| className | `string` | - | 自定义CSS类名 |
| disabled | `boolean` | `false` | 是否禁用按钮 |
| onClick | `(event: React.MouseEvent<HTMLButtonElement>) => void` | - | 点击事件处理函数 |
| ...other | `React.ButtonHTMLAttributes<HTMLButtonElement>` | - | 其他HTML按钮属性 |

## 样式定制

Button组件支持通过className属性覆盖默认样式，也可以通过自定义Tailwind主题来全局定制按钮样式。

### 自定义样式示例

```tsx
<BrandButton className="rounded-full px-8 py-3">圆角按钮</BrandButton>
<BrandButton className="shadow-xl hover:shadow-2xl">阴影按钮</BrandButton>
```

## 最佳实践

1. **主要操作**：使用`primary`变体按钮标识页面中的主要操作，每个页面应尽量只使用一个主要按钮。

2. **次要操作**：使用`secondary`或`outline`变体按钮表示次要操作。

3. **危险操作**：对于删除、清空等危险操作，建议使用红色相关的样式或添加二次确认机制。

4. **图标使用**：在按钮中添加图标可以增强视觉效果和可识别性，但需要确保图标与按钮文本内容一致。

5. **按钮尺寸**：根据使用场景选择合适的按钮尺寸，表单中通常使用`md`尺寸，工具栏中可以使用`sm`尺寸。

## 常见问题

### Q: 如何实现带图标的按钮？

A: 使用`icon`属性添加图标组件，Button组件会自动处理图标和文本的间距。

### Q: 按钮的加载状态如何实现？

A: 设置`loading`属性为`true`，按钮会显示加载动画并自动禁用。

### Q: 如何自定义按钮的颜色和样式？

A: 可以通过`className`属性覆盖默认样式，也可以修改Tailwind主题配置。

## 无障碍支持

- 支持键盘导航（Tab键聚焦，Enter/Space键触发）
- 提供适当的ARIA属性
- 颜色对比度符合WCAG标准