/**
 * @file 组件库更新管理器
 * @description 处理组件库更新检查、通知和应用
 * @module components/ui/update-manager
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

import { ComponentVersion, ComponentVersionManager } from './versioning';

/**
 * 更新通知配置接口
 */
export interface UpdateNotificationConfig {
  /** 是否启用通知 */
  enabled: boolean;
  /** 通知显示位置 */
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** 通知持续时间（毫秒） */
  duration: number;
  /** 是否自动隐藏 */
  autoHide: boolean;
}

/**
 * 更新事件类型
 */
export type UpdateEventType = 'update_available' | 'update_downloaded' | 'update_applied' | 'update_failed';

/**
 * 更新事件监听器
 */
export type UpdateEventListener = (event: UpdateEventType, data?: any) => void;

/**
 * 组件库更新管理器
 */
export class ComponentUpdateManager {
  private static instance: ComponentUpdateManager;
  private versionManager: ComponentVersionManager;
  private notificationConfig: UpdateNotificationConfig;
  private eventListeners: Map<UpdateEventType, UpdateEventListener[]>;
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.versionManager = ComponentVersionManager.getInstance();
    this.notificationConfig = {
      enabled: true,
      position: 'top-right',
      duration: 5000,
      autoHide: true
    };
    this.eventListeners = new Map();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ComponentUpdateManager {
    if (!ComponentUpdateManager.instance) {
      ComponentUpdateManager.instance = new ComponentUpdateManager();
    }
    return ComponentUpdateManager.instance;
  }

  /**
   * 设置通知配置
   * @param config 通知配置
   */
  public setNotificationConfig(config: Partial<UpdateNotificationConfig>): void {
    this.notificationConfig = { ...this.notificationConfig, ...config };
  }

  /**
   * 获取通知配置
   */
  public getNotificationConfig(): UpdateNotificationConfig {
    return this.notificationConfig;
  }

  /**
   * 添加事件监听器
   * @param eventType 事件类型
   * @param listener 监听器函数
   */
  public addEventListener(eventType: UpdateEventType, listener: UpdateEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * 移除事件监听器
   * @param eventType 事件类型
   * @param listener 监听器函数
   */
  public removeEventListener(eventType: UpdateEventType, listener: UpdateEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   * @param eventType 事件类型
   * @param data 事件数据
   */
  private triggerEvent(eventType: UpdateEventType, data?: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(eventType, data);
        } catch (error) {
          console.error('Error in update event listener:', error);
        }
      });
    }
  }

  /**
   * 检查更新
   */
  public async checkForUpdates(): Promise<void> {
    try {
      await this.versionManager.checkAllUpdates();
      const componentsWithUpdates = this.versionManager.getComponentsWithUpdates();
      
      if (componentsWithUpdates.length > 0) {
        this.triggerEvent('update_available', { components: componentsWithUpdates });
        
        if (this.notificationConfig.enabled) {
          this.showUpdateNotification(componentsWithUpdates);
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      this.triggerEvent('update_failed', { error });
    }
  }

  /**
   * 显示更新通知
   * @param components 有更新的组件列表
   */
  private showUpdateNotification(components: ComponentVersion[]): void {
    // 简单的通知实现，实际项目中可以使用更复杂的UI组件
    console.log(`\n🔔 组件库更新通知 🔔`);
    console.log(`发现 ${components.length} 个组件有更新:`);
    components.forEach(component => {
      console.log(`  - ${component.name}: ${component.version} → ${component.latestVersion}`);
    });
    console.log(`请运行更新命令或访问组件库管理界面查看详情\n`);
  }

  /**
   * 应用组件更新
   * @param componentName 组件名称
   */
  public async applyUpdate(componentName: string): Promise<boolean> {
    try {
      const component = this.versionManager.getComponentVersion(componentName);
      if (!component || !component.hasUpdate || !component.latestVersion) {
        return false;
      }

      // 模拟更新应用，实际项目中应该执行实际的更新操作
      console.log(`应用更新: ${componentName} ${component.version} → ${component.latestVersion}`);
      
      // 更新组件版本信息
      component.version = component.latestVersion;
      component.hasUpdate = false;
      component.lastUpdated = new Date().toISOString();
      
      this.triggerEvent('update_applied', { component });
      return true;
    } catch (error) {
      console.error(`Failed to apply update for ${componentName}:`, error);
      this.triggerEvent('update_failed', { componentName, error });
      return false;
    }
  }

  /**
   * 应用所有更新
   */
  public async applyAllUpdates(): Promise<{ applied: number; failed: number }> {
    const componentsWithUpdates = this.versionManager.getComponentsWithUpdates();
    let applied = 0;
    let failed = 0;

    for (const component of componentsWithUpdates) {
      const success = await this.applyUpdate(component.name);
      if (success) {
        applied++;
      } else {
        failed++;
      }
    }

    return { applied, failed };
  }

  /**
   * 启动自动更新检查
   * @param intervalMinutes 检查间隔（分钟）
   */
  public startAutoUpdateCheck(intervalMinutes: number = 60): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMinutes * 60 * 1000) as NodeJS.Timeout;

    // 立即执行一次检查
    this.checkForUpdates();
  }

  /**
   * 停止自动更新检查
   */
  public stopAutoUpdateCheck(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * 获取更新状态摘要
   */
  public getUpdateStatusSummary(): {
    totalComponents: number;
    componentsWithUpdates: number;
    updateList: ComponentVersion[];
  } {
    const allComponents = this.versionManager.getAllComponentVersions();
    const componentsWithUpdates = this.versionManager.getComponentsWithUpdates();

    return {
      totalComponents: allComponents.length,
      componentsWithUpdates: componentsWithUpdates.length,
      updateList: componentsWithUpdates
    };
  }
}