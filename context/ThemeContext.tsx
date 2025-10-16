import React from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { ThemeMode, ThemeColors, getThemeColors } from '../lib/theme-config';

interface UseThemeReturn {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  colors: ThemeColors;
  isDarkMode: boolean;
  resolvedTheme: string | undefined;
}

// 创建一个自定义的useTheme钩子，包装next-themes的useTheme钩子
// 并添加我们自己的逻辑和类型定义
export const useTheme = (): UseThemeReturn => {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();

  // 确保theme是有效的ThemeMode类型
  const currentMode: ThemeMode = (theme === 'system' || theme === 'light' || theme === 'dark') 
    ? theme 
    : 'light';

  // 根据当前主题获取颜色配置
  const isDark = resolvedTheme === 'dark';
  const colors: ThemeColors = getThemeColors(isDark);

  // 封装setTheme函数，确保只接受有效的ThemeMode值
  const setMode = (mode: ThemeMode) => {
    if (mode === 'system' || mode === 'light' || mode === 'dark') {
      setNextTheme(mode);
    }
  };

  // 切换明暗模式
  const toggleMode = () => {
    const newMode = isDark ? 'light' : 'dark';
    setNextTheme(newMode);
  };

  return {
    mode: currentMode,
    setMode,
    toggleMode,
    colors,
    isDarkMode: isDark,
    resolvedTheme
  };
};

// 不再导出自己的ThemeProvider组件，避免与next-themes的ThemeProvider冲突
// 项目中应该使用next-themes提供的ThemeProvider组件

/**
 * 主题切换器组件
 * 提供一个简单的按钮用于切换明暗模式
 */
export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleMode } = useTheme();
  
  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
    >
      {isDarkMode ? (
        // 太阳图标（浅色模式）
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // 月亮图标（深色模式）
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

/**
 * 主题选择器组件
 * 提供完整的主题选择选项（浅色、深色、系统）
 */
export const ThemeSelector: React.FC = () => {
  const { mode, setMode } = useTheme();
  
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="theme-light" className="flex items-center space-x-1 cursor-pointer">
        <input
          type="radio"
          id="theme-light"
          name="theme"
          checked={mode === 'light'}
          onChange={() => setMode('light')}
          className="rounded-full text-primary focus:ring-primary"
        />
        <span className="text-sm">浅色</span>
      </label>
      <label htmlFor="theme-dark" className="flex items-center space-x-1 cursor-pointer">
        <input
          type="radio"
          id="theme-dark"
          name="theme"
          checked={mode === 'dark'}
          onChange={() => setMode('dark')}
          className="rounded-full text-primary focus:ring-primary"
        />
        <span className="text-sm">深色</span>
      </label>
      <label htmlFor="theme-system" className="flex items-center space-x-1 cursor-pointer">
        <input
          type="radio"
          id="theme-system"
          name="theme"
          checked={mode === 'system'}
          onChange={() => setMode('system')}
          className="rounded-full text-primary focus:ring-primary"
        />
        <span className="text-sm">系统</span>
      </label>
    </div>
  );
};