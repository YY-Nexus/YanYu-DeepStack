// YYC³ 主题配置
// 由于找不到 @/types/theme 模块，这里直接定义所需类型

export type ThemeMode = 'light' | 'dark' | 'system';

// 基础颜色接口
export interface BaseThemeColors {
  // 主色调
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryMuted?: string;
  primaryContrast: string;
  
  // 辅助色
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  secondaryMuted?: string;
  secondaryContrast: string;
  
  // 功能色
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // 中性色
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  ring: string;
  muted?: string;
  mutedForeground?: string;
  
  // 文本颜色
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  
  // 状态色
  hover: string;
  active: string;
  disabled?: string;
  focus?: string;
  
  // 图表色板
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  chart6?: string;
}

// 主题颜色接口 - 表示单个主题的颜色集合
export interface ThemeColors extends BaseThemeColors {
  // 扩展BaseThemeColors接口
}

// 主题色彩配置 - 包含浅色和深色两种主题模式的完整色彩配置
export interface ThemeColorsPalette {
  light: ThemeColors;
  dark: ThemeColors;
}

export interface Typography {
  fontFamily: {
    sans: string;
    mono: string;
    display: string;
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
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
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

export interface Spacing {
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
}

export interface ThemeConfig {
  name: string;
  version: string;
  colors: ThemeColorsPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    none: string;
  };
  animation: {
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
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  container: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  border: {
    width: {
      thin: string;
      normal: string;
      thick: string;
    };
    style: {
      solid: string;
      dashed: string;
      dotted: string;
      none?: string;
    };
  };
  icon: {
    size: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
  };
  components: {
    button: {
      height: Record<string, string>;
      padding: Record<string, string>;
      rounded?: Record<string, string>;
    };
    input: {
      height: Record<string, string>;
      padding: string | Record<string, string>;
      rounded?: Record<string, string>;
    };
    card: {
      padding: Record<string, string>;
    };
    navigation: {
      height: string;
      sidebarWidth: string;
      sidebarCollapsedWidth: string;
      headerHeight?: string;
      gap?: string;
      spacing?: string;
    };
    modal: {
      padding: string;
      borderRadius: string;
      maxWidth: string;
      maxHeight: string;
    };
  };
  a11y: {
    contrast: {
      normal: string;
      large: string;
      enhanced?: string;
    };
    keyboardNavigation?: {
      enabled: boolean;
      tabIndex: number;
    };
    screenReader?: {
      enabled: boolean;
      labels: boolean;
      hints: boolean;
    };
    focus: {
      outlineWidth: string;
      outlineStyle: string;
      outlineOffset: string;
      outlineColor?: string;
    };
  };

  layout: {
    headerHeight: string;
    footerHeight: string;
    mainPadding: string;
  };
}

// 从 brand-system.ts 手动提取所需的设计系统值
const colors = {
  light: {
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    primaryMuted: '#DBEAFE',
    primaryContrast: '#FFFFFF',
    secondary: '#10B981',
    secondaryLight: '#34D399',
    secondaryDark: '#059669',
    secondaryMuted: '#D1FAE5',
    secondaryContrast: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#F9FAFB',
    foreground: '#1F2937',
    card: '#FFFFFF',
    cardForeground: '#1F2937',
    border: '#E5E7EB',
    input: '#E5E7EB',
    ring: '#3B82F6',
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textTertiary: '#6B7280',
    textDisabled: '#9CA3AF',
    hover: '#F3F4F6',
    active: '#E5E7EB',
    disabled: '#F9FAFB'
  },
  dark: {
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    primaryMuted: '#1E3A8A',
    primaryContrast: '#FFFFFF',
    secondary: '#10B981',
    secondaryLight: '#34D399',
    secondaryDark: '#059669',
    secondaryMuted: '#065F46',
    secondaryContrast: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#111827',
    foreground: '#F9FAFB',
    card: '#1F2937',
    cardForeground: '#F9FAFB',
    border: '#374151',
    input: '#374151',
    ring: '#3B82F6',
    textPrimary: '#F9FAFB',
    textSecondary: '#E5E7EB',
    textTertiary: '#D1D5DB',
    textDisabled: '#6B7280',
    hover: '#374151',
    active: '#4B5563',
    disabled: '#1F2937'
  }
};

const fontFamily = {
  sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'Monaco, Menlo, Ubuntu Mono, Consolas, source-code-pro, monospace',
  display: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
};

const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem'
};

const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem',
  '6xl': '12rem'
};

const borderRadius = {
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px'
};

const shadow = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  none: 'none'
};

/**
 * YYC³ 主题配置
 * 包含浅色模式和深色模式的完整主题定义
 */
export const themeConfig: ThemeConfig = {
  // 主题名称
  name: 'YYC³ Default Theme',
  // 主题版本
  version: '1.0.0',
  // 色彩系统
  colors: {
    // 浅色模式色彩
    light: {
      // 主色系列
      primary: colors.light.primary,
      primaryLight: colors.light.primaryLight,
      primaryDark: colors.light.primaryDark,
      primaryMuted: colors.light.primaryMuted,
      primaryContrast: colors.light.primaryContrast,
      
      // 辅助色系列
      secondary: colors.light.secondary,
      secondaryLight: colors.light.secondaryLight,
      secondaryDark: colors.light.secondaryDark,
      secondaryMuted: colors.light.secondaryMuted,
      secondaryContrast: colors.light.secondaryContrast,
      
      // 功能色系列
      success: colors.light.success,
      warning: colors.light.warning,
      error: colors.light.error,
      info: colors.light.info,
      
      // 中性色系列
      background: colors.light.background,
      foreground: colors.light.foreground,
      card: colors.light.card,
      cardForeground: colors.light.cardForeground,
      border: colors.light.border,
      input: colors.light.input,
      ring: colors.light.ring,
      
      // 文本色系列
      textPrimary: colors.light.textPrimary,
      textSecondary: colors.light.textSecondary,
      textTertiary: colors.light.textTertiary,
      textDisabled: colors.light.textDisabled,
      
      // 状态色系列
      hover: colors.light.hover,
      active: colors.light.active,
      disabled: colors.light.disabled,
    },
    
    // 深色模式色彩
    dark: {
      // 主色系列
      primary: colors.dark.primary,
      primaryLight: colors.dark.primaryLight,
      primaryDark: colors.dark.primaryDark,
      primaryMuted: colors.dark.primaryMuted,
      primaryContrast: colors.dark.primaryContrast,
      
      // 辅助色系列
      secondary: colors.dark.secondary,
      secondaryLight: colors.dark.secondaryLight,
      secondaryDark: colors.dark.secondaryDark,
      secondaryMuted: colors.dark.secondaryMuted,
      secondaryContrast: colors.dark.secondaryContrast,
      
      // 功能色系列
      success: colors.dark.success,
      warning: colors.dark.warning,
      error: colors.dark.error,
      info: colors.dark.info,
      
      // 中性色系列
      background: colors.dark.background,
      foreground: colors.dark.foreground,
      card: colors.dark.card,
      cardForeground: colors.dark.cardForeground,
      border: colors.dark.border,
      input: colors.dark.input,
      ring: colors.dark.ring,
      
      // 文本色系列
      textPrimary: colors.dark.textPrimary,
      textSecondary: colors.dark.textSecondary,
      textTertiary: colors.dark.textTertiary,
      textDisabled: colors.dark.textDisabled,
      
      // 状态色系列
      hover: colors.dark.hover,
      active: colors.dark.active,
      disabled: colors.dark.disabled,
    },
  },
  
  // 字体系统
  typography: {
    fontFamily: fontFamily,
    fontSize: fontSize,
    fontWeight: fontWeight,
    lineHeight: {
      title: '1.2',
      body: '1.6',
      button: '1.5',
      caption: '1.4',
    },
    letterSpacing: {
      tight: '-0.05em',
      normal: '0em',
      wide: '0.05em',
    },
  },
  
  // 间距系统
  spacing: spacing,
  
  // 圆角系统
  borderRadius: borderRadius,
  
  // 阴影系统
  shadow: shadow,
  
  // 动画系统
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'ease-in',
      out: 'ease-out',
      inOut: 'ease-in-out',
      // 自定义缓动函数
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // 断点系统
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 容器尺寸
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 边框配置
  border: {
    width: {
      thin: '1px',
      normal: '2px',
      thick: '4px',
    },
    style: {
      solid: 'solid',
      dashed: 'dashed',
      dotted: 'dotted',
    },
  },
  
  // 图标配置
  icon: {
    size: {
      xs: '12px',
      sm: '16px',
      md: '20px',
      lg: '24px',
      xl: '32px',
      xxl: '48px',
    },
  },
  
  // 组件特定配置
  components: {
    button: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      padding: {
        sm: '0 16px',
        md: '0 20px',
        lg: '0 24px',
      },
    },
    input: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      padding: '0 12px',
    },
    card: {
      padding: {
        sm: '16px',
        md: '20px',
        lg: '24px',
      },
    },
    navigation: {
      height: '64px',
      sidebarWidth: '240px',
      sidebarCollapsedWidth: '80px',
    },
    modal: {
      padding: '24px',
      borderRadius: '12px',
      maxWidth: '90vw',
      maxHeight: '90vh',
    },
  },
  
  // 可访问性配置
  a11y: {
    contrast: {
      normal: '4.5',
      large: '3',
    },
    focus: {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineOffset: '2px',
    },
  },
  
  // 布局配置
  layout: {
    headerHeight: '64px',
    footerHeight: '48px',
    mainPadding: '24px',
  },
};

/**
 * 根据主题模式获取对应的颜色配置
 * @param isDarkMode 是否为深色模式
 * @returns 对应模式下的颜色配置
 */
export const getThemeColors = (isDarkMode: boolean): ThemeColors => {
  return themeConfig.colors[isDarkMode ? 'dark' : 'light'];
};

/**
 * 获取当前主题模式
 * @returns 当前主题模式 ('light' | 'dark')
 */
export const getCurrentTheme = (): 'light' | 'dark' => {
  // 检查文档的classList中是否包含dark
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  // 默认返回light模式
  return 'light';
};

/**
 * 切换主题模式
 * @param mode 要切换到的主题模式 ('light' | 'dark' | 'system')
 */
export const setTheme = (mode: 'light' | 'dark' | 'system') => {
  if (typeof document === 'undefined') return;
  
  const htmlElement = document.documentElement;
  
  if (mode === 'system') {
    // 检查系统偏好
    const isDarkSystem = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkSystem) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    // 保存设置
    localStorage.setItem('theme', 'system');
  } else {
    // 直接设置主题
    if (mode === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    // 保存设置
    localStorage.setItem('theme', mode);
  }
};

/**
 * 初始化主题
 * 从本地存储或系统偏好中加载主题设置
 */
export const initializeTheme = () => {
  if (typeof window === 'undefined') return;
  
  // 检查本地存储中的主题设置
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || savedTheme === 'light') {
    // 使用保存的主题
    setTheme(savedTheme);
  } else {
    // 默认使用系统偏好
    setTheme('system');
  }
  
  // 添加系统偏好变化的监听器
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    // 只有在设置为system时才响应系统变化
    if (localStorage.getItem('theme') === 'system') {
      setTheme('system');
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  // 在组件卸载时清理监听器
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
};