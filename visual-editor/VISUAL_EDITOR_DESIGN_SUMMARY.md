# YanYu-LLM 可视化编辑器现状闭环设计总结

## 一、目录概述

visual-editor目录提供完整的拖拽式页面搭建解决方案，具备组件物料库、画布区域、属性面板等核心功能，并集成教育模式与AI智能推荐能力。

## 二、核心组件定义与参数

### 1. VisualEditor.tsx

**主要作用**：主编辑器容器，管理全局状态和组件间数据流转。

**核心参数**：
```typescript
// 组件接收的参数接口
interface VisualEditorProps {
  // 可选的初始画布数据
  initialData?: any;
  // 可选的主题设置
  theme?: Theme;
  // 语言设置
  language?: string;
  // 教育模式配置
  educationMode?: {
    enabled: boolean;
    userType?: 'student' | 'teacher';
  };
}

// 内部状态管理
const [canvasData, setCanvasData] = useState<any[]>([]);
const [selectedAsset, setSelectedAsset] = useState<any>(null);
const [theme, setTheme] = useState<Theme>('light');
const [showCodeExport, setShowCodeExport] = useState(false);
const [exportFormat, setExportFormat] = useState<string>('react');
const [educationMode, setEducationMode] = useState<any>({...});
```

**核心功能**：

- 多语言支持（切换语言按钮）
- 主题切换（light/dark）
- 教育模式支持（学生/教师视图）
- 代码导出功能（支持React、Vue、JSON、DSL格式）
- 实时协作功能入口
- AI智能助手集成
- 学习进度可视化

### 2. AssetPanel.tsx

**主要作用**：组件物料库，提供可拖拽的组件资产和AI智能推荐功能。

**核心参数**：
```typescript
interface AssetPanelProps {
  // 组件资产列表
  assets: any[];
}

// 内部状态
const [showAI, setShowAI] = useState(false);
const [selectedScene, setSelectedScene] = useState("form");
```

**核心功能**：

- 展示可拖拽的组件列表
- AI智能推荐（根据场景推荐最佳组件组合）
- 教育场景化推荐（基础创意、学科应用、团队协作）
- 标准应用场景推荐（表单页面、仪表盘、管理后台）

### 3. CanvasArea.tsx

**主要作用**：画布区域，支持组件拖拽、调整大小、删除等操作。

**核心参数**：
```typescript
interface CanvasAreaProps {
  // 画布上的组件数据
  canvasData: any[];
  // 更新画布数据的回调函数
  setCanvasData: React.Dispatch<React.SetStateAction<any[]>>;
  // 选中组件的回调
  onSelectAsset: (asset: any) => void;
}

// 内部引用
const canvasRef = useRef<HTMLDivElement>(null);
```

**核心功能**：

- 拖拽添加组件（handleDrop）
- 组件拖动（handleComponentDrag）
- 组件缩放（handleComponentResize）
- 组件删除（handleDelete）
- 网格背景显示
- 空状态提示

### 4. PropertyPanel.tsx

**主要作用**：右侧属性面板，用于编辑选中组件的属性。

**核心参数**：
```typescript
interface PropertyPanelProps {
  // 当前选中的组件
  selectedAsset: any;
  // 画布数据
  canvasData: any[];
  // 更新画布数据的回调
  setCanvasData: React.Dispatch<React.SetStateAction<any[]>>;
}
```

**核心功能**：

- 编辑组件名称（handleNameChange）
- 修改组件颜色（handleColorChange）
- 调整组件宽高（handleWidthChange, handleHeightChange）
- 设置组件点击事件（handleClickEventChange）
- 渐变背景和阴影UI设计

### 5. EditorContext.tsx

**主要作用**：编辑器上下文管理，提供全局状态共享机制。

**核心定义**：
```typescript
// 主题类型定义
type Theme = 'light' | 'dark';

// 团队信息接口
interface TeamInfo {
  id: string;
  name: string;
  members: string[];
}

// 上下文接口
interface EditorContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  team: TeamInfo | null;
  setTeam: React.Dispatch<React.SetStateAction<TeamInfo | null>>;
}

// 上下文创建
const EditorContext = React.createContext<EditorContextType | undefined>(undefined);

// Provider组件
const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [team, setTeam] = useState<TeamInfo | null>(null);
  // ...
};

// 自定义Hook
const useEditorContext = () => {
  // ...
};
```

### 6. index.ts

**主要作用**：组件导出入口，简化外部引用。

**导出内容**：
```typescript
export { AssetPanel } from './AssetPanel';
export { CanvasArea } from './CanvasArea';
export { PropertyPanel } from './PropertyPanel';
```

### 7. core/engine.ts

**主要作用**：底层引擎实现，提供项目管理和节点操作核心功能。

**核心定义**：
```typescript
// 可视化节点接口
interface VisualNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, any>;
  ports?: NodePort[];
  // 情感相关属性
  sentiment?: number;
  emotion?: string;
}

// 节点端口接口
interface NodePort {
  id: string;
  name: string;
  type: 'input' | 'output';
}

// 可视化连接接口
interface VisualEdge {
  id: string;
  source: { nodeId: string; portId: string };
  target: { nodeId: string; portId: string };
}

// 可视化项目接口
interface VisualProject {
  id: string;
  name: string;
  nodes: VisualNode[];
  edges: VisualEdge[];
  metadata?: Record<string, any>;
  // 情感和AI相关
  emotionalState?: Record<string, any>;
  aiRecommendations?: string[];
}

// 核心引擎类
class VisualProgrammingEngine {
  // 项目管理
  createProject(name: string): VisualProject { /*...*/ }
  loadProject(projectId: string): Promise<VisualProject> { /*...*/ }
  saveProject(project: VisualProject): Promise<void> { /*...*/ }
  
  // 节点管理
  registerNodeType(type: string, definition: any): void { /*...*/ }
  // ...
}
```

## 三、系统架构与数据流转

### 1. 组件层次结构

```
VisualEditor (主容器)
├── EditorContext.Provider (全局状态管理)
│   ├── AssetPanel (组件库)
│   │   └── DraggableAsset (可拖拽组件)
│   ├── CanvasArea (画布区域)
│   │   └── DraggableOnCanvas (画布上的可拖拽组件)
│   └── PropertyPanel (属性面板)
├── 教育功能组件
├── 代码导出模态框
├── 团队协作模态框
└── 其他功能组件
```

### 2. 数据流转机制

1. **组件添加流程**：
   - AssetPanel中的组件通过拖拽传递到CanvasArea
   - CanvasArea调用handleDrop处理拖拽数据
   - 更新canvasData状态

2. **组件属性编辑流程**：
   - CanvasArea中选中组件，触发onSelectAsset回调
   - VisualEditor更新selectedAsset状态
   - PropertyPanel接收selectedAsset并显示属性编辑界面
   - PropertyPanel中的编辑操作通过setCanvasData更新全局状态

3. **AI推荐流程**：
   - AssetPanel中点击"AI推荐"按钮
   - 根据当前模式（教育/标准）显示不同的场景选项
   - 用户选择场景后，显示推荐组件列表

## 四、核心功能模块

### 1. 拖拽系统

- 基于react-dnd库实现组件拖拽
- 支持组件从资产面板到画布的拖拽添加
- 支持画布内组件的位置调整和大小改变

### 2. 组件属性编辑

- 实时编辑组件的名称、颜色、尺寸等基本属性
- 支持设置组件的交互行为（如点击事件）
- 渐变背景和阴影效果设置

### 3. 代码导出功能

- 支持将设计稿导出为React、Vue、JSON、DSL等多种格式
- 提供复制和下载两种导出方式
- 导出代码格式化处理

### 4. 教育模式

- 区分学生和教师视图
- 提供适合不同教育阶段的组件和项目模板
- 学习进度可视化功能
- 学科知识应用场景推荐

### 5. AI智能推荐

- 基于场景的组件组合推荐
- 针对教育场景的定制化推荐
- 情感和AI功能支持

## 五、技术栈与依赖

- React
- react-dnd (拖拽功能)
- TypeScript (类型定义)
- 可能使用了Tailwind CSS (样式类名推断)

## 六、配置与扩展点

### 1. 组件扩展

- 通过assets参数传入自定义组件
- 支持组件difficulty属性标记教育难度

### 2. 场景扩展

- 可在AssetPanel中扩展更多应用场景
- 支持教育场景和标准场景的切换

### 3. 主题配置

- 支持light和dark两种主题模式
- 通过EditorContext全局管理主题状态

## 七、现状评估

### 优势

- 完整的拖拽式页面搭建功能
- 集成AI推荐和教育模式
- 良好的组件化架构设计
- 支持多种代码导出格式
- 全局状态管理清晰

### 待优化点

- 组件类型定义可以更加严格（当前很多地方使用any类型）
- 可以增加更多的组件属性和交互能力
- 可以增强实时协作功能的实现
- 可以进一步优化教育模式下的用户体验

---

此文档总结了visual-editor目录的核心组件、参数定义、系统架构和功能模块，为后续的稳定迭代和功能扩展提供了基础参考。