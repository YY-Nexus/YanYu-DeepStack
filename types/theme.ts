/**
 * 主题配置相关类型定义
 */

/**
 * 色彩系统类型
 */
export interface Colors {
  // 主色系列
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryMuted: string;
  primaryContrast: string;
  
  // 辅助色系列
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  secondaryMuted: string;
  secondaryContrast: string;
  
  // 功能色系列
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // 中性色系列
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  ring: string;
  
  // 文本色系列
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  
  // 状态色系列
  hover: string;
  active: string;
  disabled: string;
}

/**
 * 主题模式色彩配置
 */
export interface ThemeColors {
  light: Colors;
  dark: Colors;
}

/**
 * 字体系统类型
 */
export interface Typography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeight: {
    thin: number;
    extralight: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeight: {
    title: string;
    body: string;
    button: string;
    caption: string;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

/**
 * 间距系统类型
 */
export interface Spacing {
  '0': string;
  '0.5': string;
  '1': string;
  '1.5': string;
  '2': string;
  '2.5': string;
  '3': string;
  '4': string;
  '5': string;
  '6': string;
  '8': string;
  '10': string;
  '12': string;
  '16': string;
  '20': string;
  '24': string;
  '32': string;
  '40': string;
  '48': string;
  '64': string;
}

/**
 * 圆角系统类型
 */
export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

/**
 * 阴影系统类型
 */
export interface Shadow {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  outer: string;
}

/**
 * 动画系统类型
 */
export interface Animation {
  duration: {
    fast: string;
    normal: string;
    slow: string;
    slower: string;
  };
  easing: {
    linear: string;
    in: string;
    out: string;
    inOut: string;
    bounce: string;
    elastic: string;
  };
}

/**
 * 断点系统类型
 */
export interface Breakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/**
 * 容器尺寸类型
 */
export interface Container {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/**
 * 边框配置类型
 */
export interface Border {
  width: {
    thin: string;
    normal: string;
    thick: string;
  };
  style: {
    solid: string;
    dashed: string;
    dotted: string;
  };
}

/**
 * 图标配置类型
 */
export interface Icon {
  size: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
}

/**
 * 按钮组件配置类型
 */
export interface ButtonConfig {
  height: {
    sm: string;
    md: string;
    lg: string;
  };
  padding: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * 输入框组件配置类型
 */
export interface InputConfig {
  height: {
    sm: string;
    md: string;
    lg: string;
  };
  padding: string;
}

/**
 * 卡片组件配置类型
 */
export interface CardConfig {
  padding: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * 导航组件配置类型
 */
export interface NavigationConfig {
  height: string;
  sidebarWidth: string;
  sidebarCollapsedWidth: string;
}

/**
 * 模态框组件配置类型
 */
export interface ModalConfig {
  padding: string;
  borderRadius: string;
  maxWidth: string;
  maxHeight: string;
}

/**
 * 组件配置类型
 */
export interface ComponentsConfig {
  button: ButtonConfig;
  input: InputConfig;
  card: CardConfig;
  navigation: NavigationConfig;
  modal: ModalConfig;
}

/**
 * 可访问性配置类型
 */
export interface A11yConfig {
  contrast: {
    normal: string;
    large: string;
  };
  focus: {
    outlineWidth: string;
    outlineStyle: string;
    outlineOffset: string;
  };
}

/**
 * 布局配置类型
 */
export interface LayoutConfig {
  headerHeight: string;
  footerHeight: string;
  mainPadding: string;
}

/**
 * 完整主题配置类型
 */
export interface ThemeConfig {
  name: string;
  version: string;
  colors: ThemeColors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadow: Shadow;
  animation: Animation;
  breakpoints: Breakpoints;
  container: Container;
  border: Border;
  icon: Icon;
  components: ComponentsConfig;
  a11y: A11yConfig;
  layout: LayoutConfig;
}

/**
 * 主题模式类型
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 主题上下文类型
 */
export interface ThemeContextType {
  mode: ThemeMode;
  isDarkMode: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  colors: Colors;
}