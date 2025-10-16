/**
 * 权限服务
 * 提供基于角色的访问控制（RBAC）功能
 */

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserRole {
  userId: string;
  roleId: string;
  createdAt: number;
}

export class PermissionService {
  private static instance: PermissionService;
  private permissions: Map<string, Permission> = new Map();
  private roles: Map<string, Role> = new Map();
  private userRoles: UserRole[] = [];
  private permissionCache: Map<string, boolean> = new Map();
  private cacheTimeout = 60000; // 缓存1分钟

  private constructor() {
    // 初始化默认权限和角色
    this.initializeDefaultPermissions();
    this.initializeDefaultRoles();
  }

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  // 初始化默认权限
  private initializeDefaultPermissions(): void {
    const defaultPermissions: Permission[] = [
      { id: 'read:user', name: '读取用户信息', description: '允许读取用户基本信息', resource: 'user', action: 'read' },
      { id: 'write:user', name: '修改用户信息', description: '允许修改用户基本信息', resource: 'user', action: 'write' },
      { id: 'read:project', name: '读取项目', description: '允许读取项目信息', resource: 'project', action: 'read' },
      { id: 'write:project', name: '创建/修改项目', description: '允许创建和修改项目', resource: 'project', action: 'write' },
      { id: 'delete:project', name: '删除项目', description: '允许删除项目', resource: 'project', action: 'delete' },
      { id: 'admin:system', name: '系统管理', description: '允许管理系统配置', resource: 'system', action: 'admin' },
    ];

    defaultPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });
  }

  // 初始化默认角色
  private initializeDefaultRoles(): void {
    const defaultRoles: Role[] = [
      {
        id: 'admin',
        name: '管理员',
        description: '系统管理员角色',
        permissions: ['read:user', 'write:user', 'read:project', 'write:project', 'delete:project'],
        isSystemRole: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'user',
        name: '普通用户',
        description: '标准用户角色',
        permissions: ['read:user', 'read:project'],
        isSystemRole: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'guest',
        name: '访客',
        description: '只读访问角色',
        permissions: ['read:project'],
        isSystemRole: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    defaultRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  /**
   * 检查用户是否有特定权限
   * @param userId 用户ID
   * @param action 操作类型
   * @param resource 资源类型
   * @param resourceId 可选的资源ID（用于资源实例级别的权限控制）
   * @returns 用户是否有权限
   */
  public async checkPermission(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string
  ): Promise<boolean> {
    // 构建缓存键
    const cacheKey = `${userId}:${action}:${resource}${resourceId ? `:${resourceId}` : ''}`;
    
    // 检查缓存
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    try {
      // 1. 获取用户角色
      const userRoleIds = this.getUserRoleIds(userId);
      
      if (userRoleIds.length === 0) {
        this.addToCache(cacheKey, false);
        return false;
      }

      // 2. 检查每个角色的权限
      for (const roleId of userRoleIds) {
        const role = this.roles.get(roleId);
        if (!role) continue;

        // 3. 检查角色是否有通配符权限
        if (role.permissions.includes('*')) {
          this.addToCache(cacheKey, true);
          return true;
        }

        // 4. 检查精确权限匹配
        const permissionId = `${action}:${resource}`;
        if (role.permissions.includes(permissionId)) {
          // 对于资源实例级别的权限，可以在这里添加额外检查
          if (resourceId) {
            // 这里可以实现资源实例级别的权限检查逻辑
            // 例如检查用户是否是资源的所有者或有权限访问该特定资源
          }
          
          this.addToCache(cacheKey, true);
          return true;
        }

        // 5. 检查模式匹配（如 project.* 匹配 project.read, project.write 等）
        const patternMatch = role.permissions.some(perm => {
          if (perm.endsWith('*')) {
            const prefix = perm.slice(0, -1);
            return permissionId.startsWith(prefix);
          }
          return false;
        });

        if (patternMatch) {
          this.addToCache(cacheKey, true);
          return true;
        }
      }

      // 所有角色都没有匹配的权限
      this.addToCache(cacheKey, false);
      return false;
    } catch (error) {
      console.error('Permission check failed:', error);
      // 出错时默认拒绝访问
      return false;
    }
  }

  /**
   * 获取用户的所有角色ID
   * @param userId 用户ID
   * @returns 角色ID数组
   */
  private getUserRoleIds(userId: string): string[] {
    return this.userRoles
      .filter(userRole => userRole.userId === userId)
      .map(userRole => userRole.roleId);
  }

  /**
   * 将结果添加到缓存
   * @param key 缓存键
   * @param value 缓存值
   */
  private addToCache(key: string, value: boolean): void {
    this.permissionCache.set(key, value);
    
    // 设置缓存过期
    setTimeout(() => {
      this.permissionCache.delete(key);
    }, this.cacheTimeout);
  }

  /**
   * 从缓存获取结果
   * @param key 缓存键
   * @returns 缓存值或undefined
   */
  private getFromCache(key: string): boolean | undefined {
    return this.permissionCache.get(key);
  }

  /**
   * 清除权限缓存
   */
  public clearCache(): void {
    this.permissionCache.clear();
  }

  /**
   * 添加角色
   * @param role 角色信息
   * @returns 添加的角色
   */
  public addRole(role: Omit<Role, 'createdAt' | 'updatedAt'>): Role {
    const newRole: Role = {
      ...role,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.roles.set(newRole.id, newRole);
    this.clearCache(); // 添加新角色后清除缓存
    
    return newRole;
  }

  /**
   * 删除角色
   * @param roleId 角色ID
   * @returns 是否删除成功
   */
  public deleteRole(roleId: string): boolean {
    const role = this.roles.get(roleId);
    if (!role || role.isSystemRole) {
      return false;
    }
    
    // 删除角色
    const result = this.roles.delete(roleId);
    
    // 删除相关的用户角色关联
    this.userRoles = this.userRoles.filter(ur => ur.roleId !== roleId);
    
    this.clearCache(); // 删除角色后清除缓存
    
    return result;
  }

  /**
   * 为用户分配角色
   * @param userId 用户ID
   * @param roleId 角色ID
   * @returns 分配的用户角色
   */
  public assignRole(userId: string, roleId: string): UserRole {
    // 检查角色是否存在
    if (!this.roles.has(roleId)) {
      throw new Error(`Role ${roleId} does not exist`);
    }
    
    // 检查用户角色关系是否已存在
    const existing = this.userRoles.find(ur => ur.userId === userId && ur.roleId === roleId);
    if (existing) {
      return existing;
    }
    
    const userRole: UserRole = {
      userId,
      roleId,
      createdAt: Date.now()
    };
    
    this.userRoles.push(userRole);
    this.clearCache(); // 修改用户角色后清除缓存
    
    return userRole;
  }

  /**
   * 移除用户的角色
   * @param userId 用户ID
   * @param roleId 角色ID
   * @returns 是否移除成功
   */
  public removeRoleFromUser(userId: string, roleId: string): boolean {
    const initialLength = this.userRoles.length;
    this.userRoles = this.userRoles.filter(ur => !(ur.userId === userId && ur.roleId === roleId));
    
    if (this.userRoles.length !== initialLength) {
      this.clearCache(); // 修改用户角色后清除缓存
      return true;
    }
    
    return false;
  }

  /**
   * 获取所有权限
   * @returns 权限列表
   */
  public getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  /**
   * 获取所有角色
   * @returns 角色列表
   */
  public getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * 获取用户的所有角色
   * @param userId 用户ID
   * @returns 用户角色列表
   */
  public getUserRoles(userId: string): Role[] {
    const roleIds = this.getUserRoleIds(userId);
    return roleIds
      .map(roleId => this.roles.get(roleId))
      .filter((role): role is Role => !!role);
  }
}

// 导出权限服务实例
export const permissionService = PermissionService.getInstance();