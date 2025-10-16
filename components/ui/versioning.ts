/**
 * @file 组件库版本控制管理
 * @description 管理组件库版本、更新检测和兼容性检查
 * @module components/ui/versioning
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

/**
 * 组件版本信息接口
 */
export interface ComponentVersion {
  /** 组件名称 */
  name: string;
  /** 当前版本 */
  version: string;
  /** 上次更新时间 */
  lastUpdated: string;
  /** 变更描述 */
  description?: string;
  /** 是否有更新 */
  hasUpdate?: boolean;
  /** 最新版本 */
  latestVersion?: string;
}

/**
 * 组件库版本信息
 */
export interface ComponentLibraryInfo {
  /** 库名称 */
  name: "YYC³ UI Components";
  /** 当前版本 */
  version: string;
  /** 发布日期 */
  releaseDate: string;
  /** 组件列表 */
  components: ComponentVersion[];
  /** 依赖版本 */
  dependencies: Record<string, string>;
}

/**
 * 组件库版本管理器
 */
export class ComponentVersionManager {
  private static instance: ComponentVersionManager;
  private componentVersions: Map<string, ComponentVersion>;
  private libraryInfo: ComponentLibraryInfo;

  private constructor() {
    this.componentVersions = new Map();
    this.libraryInfo = {
      name: "YYC³ UI Components",
      version: "1.0.0",
      releaseDate: "2024-10-15",
      components: [],
      dependencies: {
        "react": "^18.0.0",
        "tailwindcss": "^3.3.0",
        "@radix-ui/react-icons": "latest"
      }
    };
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ComponentVersionManager {
    if (!ComponentVersionManager.instance) {
      ComponentVersionManager.instance = new ComponentVersionManager();
    }
    return ComponentVersionManager.instance;
  }

  /**
   * 注册组件版本信息
   * @param componentVersion 组件版本信息
   */
  public registerComponent(componentVersion: ComponentVersion): void {
    this.componentVersions.set(componentVersion.name, componentVersion);
    this.libraryInfo.components = Array.from(this.componentVersions.values());
  }

  /**
   * 获取组件版本信息
   * @param componentName 组件名称
   * @returns 组件版本信息
   */
  public getComponentVersion(componentName: string): ComponentVersion | undefined {
    return this.componentVersions.get(componentName);
  }

  /**
   * 获取所有组件版本信息
   * @returns 组件版本信息列表
   */
  public getAllComponentVersions(): ComponentVersion[] {
    return Array.from(this.componentVersions.values());
  }

  /**
   * 获取组件库信息
   * @returns 组件库信息
   */
  public getLibraryInfo(): ComponentLibraryInfo {
    return this.libraryInfo;
  }

  /**
   * 检查组件更新
   * @param componentName 组件名称
   * @returns 更新信息
   */
  public async checkForUpdates(componentName: string): Promise<{ hasUpdate: boolean; latestVersion?: string }> {
    // 模拟更新检查，实际项目中应该从服务器获取最新版本信息
    // 这里简单返回false，表示没有更新
    return { hasUpdate: false };
  }

  /**
   * 检查所有组件更新
   */
  public async checkAllUpdates(): Promise<void> {
    for (const component of this.componentVersions.values()) {
      const updateInfo = await this.checkForUpdates(component.name);
      if (updateInfo.hasUpdate) {
        component.hasUpdate = true;
        component.latestVersion = updateInfo.latestVersion;
      }
    }
  }

  /**
   * 获取有更新的组件列表
   * @returns 有更新的组件列表
   */
  public getComponentsWithUpdates(): ComponentVersion[] {
    return Array.from(this.componentVersions.values()).filter(
      component => component.hasUpdate
    );
  }

  /**
   * 验证组件版本兼容性
   * @param componentName 组件名称
   * @param requiredVersion 要求的版本
   * @returns 是否兼容
   */
  public isVersionCompatible(componentName: string, requiredVersion: string): boolean {
    const component = this.componentVersions.get(componentName);
    if (!component) return false;
    
    // 简单的版本比较逻辑，实际项目中可能需要更复杂的版本规则
    const currentParts = component.version.split('.').map(Number);
    const requiredParts = requiredVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
      const current = currentParts[i] || 0;
      const required = requiredParts[i] || 0;
      if (current > required) return true;
      if (current < required) return false;
    }
    
    return true;
  }
}