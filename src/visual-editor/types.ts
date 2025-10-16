// 可视化编辑器的类型定义

// 组件基础属性接口
export interface BaseComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name?: string;
  visible?: boolean;
  locked?: boolean;
  zIndex?: number;
  color?: string;
  onClick?: string;
}

// 文本组件属性接口
export interface TextComponent extends BaseComponent {
  type: 'text' | 'heading';
  content: string;
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
  fontWeight?: 'normal' | 'bold' | 'light' | number;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
}

// 按钮组件属性接口
export interface ButtonComponent extends BaseComponent {
  type: 'button';
  content: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  onClick?: string;
}

// 图片组件属性接口
export interface ImageComponent extends BaseComponent {
  type: 'image';
  src: string;
  alt?: string;
  borderRadius?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

// 容器组件属性接口
export interface ContainerComponent extends BaseComponent {
  type: 'container';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  children?: string[]; // 子组件ID列表
}

// 输入框组件属性接口
export interface InputComponent extends BaseComponent {
  type: 'input' | 'password';
  value?: string;
  placeholder?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  onInput?: string;
}

// 复选框组件属性接口
export interface CheckboxComponent extends BaseComponent {
  type: 'checkbox';
  checked?: boolean;
  label?: string;
  color?: string;
  onChange?: string;
}

// 单选框组件属性接口
export interface RadioComponent extends BaseComponent {
  type: 'radio';
  checked?: boolean;
  label?: string;
  color?: string;
  groupName?: string;
  onChange?: string;
}

// 分隔线组件属性接口
export interface DividerComponent extends BaseComponent {
  type: 'divider';
  backgroundColor?: string;
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
}

// 表格组件属性接口
export interface TableComponent extends BaseComponent {
  type: 'table';
  rows: number;
  cols: number;
  headers: string[];
  data: string[][];
  borderColor?: string;
  backgroundColor?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
}

// 图表组件属性接口
export interface ChartComponent extends BaseComponent {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'radar';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  options?: any;
}

// 导航组件属性接口
export interface NavComponent extends BaseComponent {
  type: 'nav' | 'header';
  items: Array<{
    label: string;
    href?: string;
    onClick?: string;
    subItems?: Array<{
      label: string;
      href?: string;
      onClick?: string;
    }>;
  }>;
  backgroundColor?: string;
  textColor?: string;
  activeColor?: string;
}

// 卡片组件属性接口
export interface CardComponent extends BaseComponent {
  type: 'card';
  title?: string;
  content?: string;
  footer?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  shadow?: boolean;
}

// 所有组件类型的联合类型
export type EditorComponent = 
  | TextComponent
  | ButtonComponent
  | ImageComponent
  | ContainerComponent
  | InputComponent
  | CheckboxComponent
  | RadioComponent
  | DividerComponent
  | TableComponent
  | ChartComponent
  | NavComponent
  | CardComponent;

// 组件拖拽状态接口
export interface DragState {
  isDragging: boolean;
  componentId?: string;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
}

// 缩放状态接口
export interface ResizeState {
  isResizing: boolean;
  componentId?: string;
  startX: number;
  startY: number;
  initialWidth: number;
  initialHeight: number;
  initialX: number;
  initialY: number;
  handle?: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
}

// 编辑器状态接口
export interface EditorState {
  components: Record<string, EditorComponent>;
  selectedComponentId: string | null;
  canvasSize: { width: number; height: number };
  zoom: number;
  dragState: DragState;
  resizeState: ResizeState;
  history: EditorHistory[];
  historyIndex: number;
}

// 编辑器历史记录项接口
export interface EditorHistory {
  action: 'add' | 'update' | 'delete';
  componentId?: string;
  component?: EditorComponent;
  previousState?: EditorComponent;
  timestamp: number;
}

// 组件工具属性接口
export interface ComponentTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
}

// 场景配置接口
export interface SceneConfig {
  id: string;
  name: string;
  description: string;
  initialComponents: EditorComponent[];
  canvasSize?: { width: number; height: number };
}

// 拖拽组件类型接口
export interface DraggableComponentType {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  defaultWidth: number;
  defaultHeight: number;
  defaultProps?: Record<string, any>;
}

// 工具栏配置接口
export interface ToolbarConfig {
  tools: Array<{
    id: string;
    name: string;
    icon: React.ReactNode;
    action: () => void;
    shortcut?: string;
    disabled?: boolean;
  }>;
  groups: Array<{
    id: string;
    name: string;
    tools: string[];
  }>;
}

// 编辑器主题接口
export interface EditorTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  highlightColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
}

// 快捷键映射接口
export interface KeyboardShortcuts {
  [key: string]: () => void;
}

// 导出类型工具函数

export const isTextComponent = (component: EditorComponent): component is TextComponent => {
  return component.type === 'text' || component.type === 'heading';
};

export const isButtonComponent = (component: EditorComponent): component is ButtonComponent => {
  return component.type === 'button';
};

export const isImageComponent = (component: EditorComponent): component is ImageComponent => {
  return component.type === 'image';
};

export const isContainerComponent = (component: EditorComponent): component is ContainerComponent => {
  return component.type === 'container';
};

export const isInputComponent = (component: EditorComponent): component is InputComponent => {
  return component.type === 'input' || component.type === 'password';
};

export const isCheckboxComponent = (component: EditorComponent): component is CheckboxComponent => {
  return component.type === 'checkbox';
};

export const isRadioComponent = (component: EditorComponent): component is RadioComponent => {
  return component.type === 'radio';
};

export const isDividerComponent = (component: EditorComponent): component is DividerComponent => {
  return component.type === 'divider';
};

export const isTableComponent = (component: EditorComponent): component is TableComponent => {
  return component.type === 'table';
};

export const isChartComponent = (component: EditorComponent): component is ChartComponent => {
  return component.type === 'chart';
};

export const isNavComponent = (component: EditorComponent): component is NavComponent => {
  return component.type === 'nav' || component.type === 'header';
};

export const isCardComponent = (component: EditorComponent): component is CardComponent => {
  return component.type === 'card';
};