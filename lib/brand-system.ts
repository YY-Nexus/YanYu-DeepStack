// 言語云³ 品牌设计系统
export const brandSystem = {
  // 主品牌色彩
  colors: {
    primary: {
      // CloudCube蓝色系
      "cloud-blue-50": "#E6F7FF",
      "cloud-blue-100": "#BAE7FF",
      "cloud-blue-200": "#91D5FF",
      "cloud-blue-300": "#69C0FF",
      "cloud-blue-400": "#40A9FF",
      "cloud-blue-500": "#1890FF", // 主蓝色
      "cloud-blue-600": "#096DD9",
      "cloud-blue-700": "#0050B3",
      "cloud-blue-800": "#003A8C",
      "cloud-blue-900": "#002766",
    },
    secondary: {
      // 辅助色系
      "coral-pink": "#FF6B6B",
      "mint-green": "#4ECDC4",
      "sky-blue": "#45B7D1",
      "lemon-yellow": "#FFE66D",
      "light-blue": "#A2D2FF",
      "dark-gray": "#333333",
    },
    neutral: {
      // 中性色系
      white: "#FFFFFF",
      "gray-50": "#FAFAFA",
      "gray-100": "#F5F5F5",
      "gray-200": "#EEEEEE",
      "gray-300": "#E0E0E0",
      "gray-400": "#BDBDBD",
      "gray-500": "#9E9E9E",
      "gray-600": "#757575",
      "gray-700": "#616161",
      "gray-800": "#424242",
      "gray-900": "#212121",
    },
    status: {
      // 状态色系
      success: "#52C41A",
      warning: "#FAAD14",
      error: "#FF4D4F",
      info: "#1890FF",
    },
  },

  // 字体系统
  typography: {
    fontFamily: {
      primary: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "Consolas", "monospace"],
      chinese: ["PingFang SC", "Microsoft YaHei", "sans-serif"],
    },
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
    },
    fontWeight: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
  },

  // 间距系统
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },

  // 圆角系统
  borderRadius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    "2xl": "1.5rem", // 24px
    full: "9999px",
  },

  // 阴影系统
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    glow: "0 0 20px rgba(24, 144, 255, 0.3)", // 蓝色发光效果
  },

  // 动画系统
  animations: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
    easing: {
      "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
      "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },
}

// 品牌Logo变体配置
export const logoVariants = {
  // 不同尺寸
  sizes: {
    xs: { width: 24, height: 24 },
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
    "2xl": { width: 128, height: 128 },
  },

  // 不同用途
  contexts: {
    sidebar: { size: "lg", showText: true },
    topbar: { size: "sm", showText: false },
    loading: { size: "2xl", showText: true },
    favicon: { size: "xs", showText: false },
    footer: { size: "md", showText: true },
  },
}
