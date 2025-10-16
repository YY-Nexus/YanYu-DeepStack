# 智能编程可视化开发基础组件

本目录为智能编程可视化开发应用的基础架构，支持拖拽式页面搭建、组件物料库、属性面板等核心功能，方便团队复用和二次开发。

## 目录结构

- `VisualEditor.tsx`：主编辑器容器，负责页面分区和数据流转
- `AssetPanel.tsx`：左侧物料区，展示可拖拽组件资产
- `CanvasArea.tsx`：中央画布区，支持拖拽添加和布局
- `PropertyPanel.tsx`：右侧属性区，支持组件属性编辑
- `index.ts`：统一导出入口，便于集成

## 快速集成

```tsx
import { VisualEditor } from "@/visual-editor"

const assets = [
  { name: "按钮" },
  { name: "输入框" },
  { name: "卡片" },
]

<VisualEditor initialAssets={assets} />
```

## 二开建议

- 所有组件均为函数式，支持 props 注入和扩展
- 画布区、属性区可按需扩展更多功能（如布局、事件、样式等）
- 支持团队自定义物料库和属性面板
- 可集成 AI 物料推荐、代码导出、项目管理等高级功能
