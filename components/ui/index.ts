/**
 * @file YYC³ UI 组件库入口
 * @description 统一导出所有自定义组件并初始化版本控制
 * @module components/ui
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

import { ComponentVersionManager } from './versioning';
import { ComponentUpdateManager } from './update-manager';

// 导入所有自定义组件
// 注意：实际项目中需要根据components/ui目录下的文件进行调整
// 这里只导入部分组件作为示例
import { Alert } from './alert';
import { Avatar } from './avatar';
import { BrandButton } from './brand-button';
import { Button } from './button';
import { Card } from './card';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Progress } from './progress';
import { Tooltip } from './tooltip';

// 组件列表及其版本信息
const componentVersions = [
  { name: 'Alert', version: '1.0.0', lastUpdated: '2024-10-15', description: '用于显示警告、错误、成功等提示信息' },
  { name: 'Avatar', version: '1.0.0', lastUpdated: '2024-10-15', description: '用户头像组件' },
  { name: 'BrandButton', version: '1.0.0', lastUpdated: '2024-10-15', description: '品牌风格按钮' },
  { name: 'Button', version: '1.0.0', lastUpdated: '2024-10-15', description: '通用按钮组件' },
  { name: 'Card', version: '1.0.0', lastUpdated: '2024-10-15', description: '卡片容器组件' },
  { name: 'Checkbox', version: '1.0.0', lastUpdated: '2024-10-15', description: '复选框组件' },
  { name: 'Input', version: '1.0.0', lastUpdated: '2024-10-15', description: '输入框组件' },
  { name: 'Progress', version: '1.0.0', lastUpdated: '2024-10-15', description: '进度条组件' },
  { name: 'Tooltip', version: '1.0.0', lastUpdated: '2024-10-15', description: '悬停提示组件' },
];

/**
 * 初始化组件库版本控制
 */
function initializeComponentLibrary(): void {
  const versionManager = ComponentVersionManager.getInstance();
  
  // 注册所有组件版本信息
  componentVersions.forEach(component => {
    versionManager.registerComponent(component);
  });

  // 初始化更新管理器
  const updateManager = ComponentUpdateManager.getInstance();
  
  // 配置自动检查更新（开发环境下每30分钟检查一次）
  if (process.env.NODE_ENV !== 'production') {
    updateManager.startAutoUpdateCheck(30);
  }

  console.log(`✅ YYC³ UI 组件库 v1.0.0 已初始化`);
  console.log(`📦 已注册 ${componentVersions.length} 个组件`);
}

// 初始化组件库
initializeComponentLibrary();

// 导出所有组件
export {
  Alert,
  Avatar,
  BrandButton,
  Button,
  Card,
  Checkbox,
  Input,
  Progress,
  Tooltip,
  // 导出版本控制和更新管理工具
  ComponentVersionManager,
  ComponentUpdateManager
};

// 导出类型
export type {
  ComponentVersion,
  ComponentLibraryInfo
} from './versioning';

export type {
  UpdateNotificationConfig,
  UpdateEventType,
  UpdateEventListener
} from './update-manager';