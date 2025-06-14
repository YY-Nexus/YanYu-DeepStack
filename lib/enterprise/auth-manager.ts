"use client"

// 企业级认证管理器 - 支持SSO、RBAC、审计日志
export class EnterpriseAuthManager {
  private static instance: EnterpriseAuthManager
  private currentUser: EnterpriseUser | null = null
  private permissions = new Map<string, Permission>()
  private roles = new Map<string, Role>()
  private auditLogs: AuditLog[] = []
  private ssoProviders = new Map<string, SSOProvider>()
  private config: AuthConfig

  private constructor() {
    this.config = {
      enableSSO: true,
      enableMFA: true,
      sessionTimeout: 8 * 60 * 60 * 1000, // 8小时
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90天
      },
      auditRetentionDays: 365,
      enableAuditLog: true,
    }

    this.initializeDefaultRoles()
    this.initializeSSOProviders()
  }

  public static getInstance(): EnterpriseAuthManager {
    if (!EnterpriseAuthManager.instance) {
      EnterpriseAuthManager.instance = new EnterpriseAuthManager()
    }
    return EnterpriseAuthManager.instance
  }

  // 初始化默认角色
  private initializeDefaultRoles(): void {
    // 超级管理员
    this.createRole({
      id: "super_admin",
      name: "超级管理员",
      description: "拥有所有权限的超级管理员",
      permissions: ["*"], // 通配符表示所有权限
      isSystemRole: true,
    })

    // 管理员
    this.createRole({
      id: "admin",
      name: "管理员",
      description: "系统管理员",
      permissions: ["user.manage", "role.manage", "project.manage", "system.config", "audit.view"],
      isSystemRole: true,
    })

    // 项目经理
    this.createRole({
      id: "project_manager",
      name: "项目经理",
      description: "项目管理权限",
      permissions: ["project.create", "project.edit", "project.delete", "project.deploy", "team.manage"],
      isSystemRole: true,
    })

    // 开发者
    this.createRole({
      id: "developer",
      name: "开发者",
      description: "开发人员权限",
      permissions: ["project.view", "project.edit", "code.edit", "ai.use", "preview.use"],
      isSystemRole: true,
    })

    // 查看者
    this.createRole({
      id: "viewer",
      name: "查看者",
      description: "只读权限",
      permissions: ["project.view", "code.view"],
      isSystemRole: true,
    })
  }

  // 初始化SSO提供商
  private initializeSSOProviders(): void {
    // Google SSO
    this.ssoProviders.set("google", {
      id: "google",
      name: "Google",
      type: "oauth2",
      config: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirectUri: `${window.location.origin}/auth/callback/google`,
        scope: "openid profile email",
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
      },
      enabled: true,
    })

    // Microsoft Azure AD
    this.ssoProviders.set("azure", {
      id: "azure",
      name: "Microsoft Azure AD",
      type: "oauth2",
      config: {
        clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "",
        clientSecret: process.env.AZURE_CLIENT_SECRET || "",
        redirectUri: `${window.location.origin}/auth/callback/azure`,
        scope: "openid profile email",
        authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        userInfoUrl: "https://graph.microsoft.com/v1.0/me",
      },
      enabled: true,
    })

    // GitHub SSO
    this.ssoProviders.set("github", {
      id: "github",
      name: "GitHub",
      type: "oauth2",
      config: {
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        redirectUri: `${window.location.origin}/auth/callback/github`,
        scope: "user:email",
        authUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
        userInfoUrl: "https://api.github.com/user",
      },
      enabled: true,
    })

    // SAML SSO
    this.ssoProviders.set("saml", {
      id: "saml",
      name: "SAML SSO",
      type: "saml",
      config: {
        entryPoint: process.env.SAML_ENTRY_POINT || "",
        issuer: process.env.SAML_ISSUER || "",
        cert: process.env.SAML_CERT || "",
        callbackUrl: `${window.location.origin}/auth/callback/saml`,
      },
      enabled: false,
    })
  }

  // 用户认证
  public async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      this.logAudit({
        action: "auth.login_attempt",
        userId: credentials.email,
        details: { method: "password" },
      })

      // 验证用户凭据
      const user = await this.validateCredentials(credentials)
      if (!user) {
        this.logAudit({
          action: "auth.login_failed",
          userId: credentials.email,
          details: { reason: "invalid_credentials" },
        })
        throw new Error("用户名或密码错误")
      }

      // 检查用户状态
      if (!user.isActive) {
        this.logAudit({
          action: "auth.login_failed",
          userId: user.id,
          details: { reason: "account_disabled" },
        })
        throw new Error("账户已被禁用")
      }

      // 检查MFA
      if (this.config.enableMFA && user.mfaEnabled) {
        return {
          success: false,
          requiresMFA: true,
          userId: user.id,
          message: "需要多因素认证",
        }
      }

      // 创建会话
      const session = await this.createSession(user)

      this.currentUser = user
      this.logAudit({
        action: "auth.login_success",
        userId: user.id,
        details: { sessionId: session.id },
      })

      return {
        success: true,
        user,
        session,
        message: "登录成功",
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "登录失败",
      }
    }
  }

  // SSO认证
  public async authenticateSSO(provider: string, code: string): Promise<AuthResult> {
    try {
      const ssoProvider = this.ssoProviders.get(provider)
      if (!ssoProvider || !ssoProvider.enabled) {
        throw new Error(`SSO提供商 ${provider} 不可用`)
      }

      this.logAudit({
        action: "auth.sso_attempt",
        details: { provider },
      })

      // 获取访问令牌
      const tokenResponse = await this.exchangeCodeForToken(ssoProvider, code)

      // 获取用户信息
      const userInfo = await this.fetchUserInfo(ssoProvider, tokenResponse.access_token)

      // 查找或创建用户
      let user = await this.findUserByEmail(userInfo.email)
      if (!user) {
        user = await this.createUserFromSSO(userInfo, provider)
      }

      // 更新SSO信息
      await this.updateUserSSOInfo(user.id, provider, userInfo)

      // 创建会话
      const session = await this.createSession(user)

      this.currentUser = user
      this.logAudit({
        action: "auth.sso_success",
        userId: user.id,
        details: { provider, sessionId: session.id },
      })

      return {
        success: true,
        user,
        session,
        message: "SSO登录成功",
      }
    } catch (error) {
      this.logAudit({
        action: "auth.sso_failed",
        details: { provider, error: error instanceof Error ? error.message : "Unknown error" },
      })

      return {
        success: false,
        message: error instanceof Error ? error.message : "SSO登录失败",
      }
    }
  }

  // MFA验证
  public async verifyMFA(userId: string, code: string): Promise<AuthResult> {
    try {
      const user = await this.findUserById(userId)
      if (!user) {
        throw new Error("用户不存在")
      }

      // 验证MFA代码
      const isValid = await this.validateMFACode(user, code)
      if (!isValid) {
        this.logAudit({
          action: "auth.mfa_failed",
          userId: user.id,
          details: { reason: "invalid_code" },
        })
        throw new Error("MFA验证码错误")
      }

      // 创建会话
      const session = await this.createSession(user)

      this.currentUser = user
      this.logAudit({
        action: "auth.mfa_success",
        userId: user.id,
        details: { sessionId: session.id },
      })

      return {
        success: true,
        user,
        session,
        message: "MFA验证成功",
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "MFA验证失败",
      }
    }
  }

  // 权限检查
  public hasPermission(permission: string, userId?: string): boolean {
    const user = userId ? this.findUserById(userId) : this.currentUser
    if (!user) return false

    // 超级管理员拥有所有权限
    if (user.roles.includes("super_admin")) return true

    // 检查用户角色权限
    for (const roleId of user.roles) {
      const role = this.roles.get(roleId)
      if (role) {
        // 通配符权限
        if (role.permissions.includes("*")) return true

        // 精确匹配
        if (role.permissions.includes(permission)) return true

        // 模式匹配（如 project.* 匹配 project.create）
        for (const rolePermission of role.permissions) {
          if (rolePermission.endsWith("*")) {
            const prefix = rolePermission.slice(0, -1)
            if (permission.startsWith(prefix)) return true
          }
        }
      }
    }

    return false
  }

  // 角色管理
  public createRole(roleData: Omit<Role, "createdAt" | "updatedAt">): Role {
    const role: Role = {
      ...roleData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    this.roles.set(role.id, role)

    this.logAudit({
      action: "role.created",
      userId: this.currentUser?.id,
      details: { roleId: role.id, roleName: role.name },
    })

    return role
  }

  public updateRole(roleId: string, updates: Partial<Role>): Role {
    const role = this.roles.get(roleId)
    if (!role) {
      throw new Error(`角色 ${roleId} 不存在`)
    }

    if (role.isSystemRole && !this.hasPermission("system.manage")) {
      throw new Error("无权修改系统角色")
    }

    const updatedRole = {
      ...role,
      ...updates,
      updatedAt: Date.now(),
    }

    this.roles.set(roleId, updatedRole)

    this.logAudit({
      action: "role.updated",
      userId: this.currentUser?.id,
      details: { roleId, updates },
    })

    return updatedRole
  }

  public deleteRole(roleId: string): void {
    const role = this.roles.get(roleId)
    if (!role) {
      throw new Error(`角色 ${roleId} 不存在`)
    }

    if (role.isSystemRole) {
      throw new Error("无法删除系统角色")
    }

    this.roles.delete(roleId)

    this.logAudit({
      action: "role.deleted",
      userId: this.currentUser?.id,
      details: { roleId, roleName: role.name },
    })
  }

  // 用户管理
  public async createUser(userData: CreateUserData): Promise<EnterpriseUser> {
    // 验证密码策略
    if (userData.password && !this.validatePassword(userData.password)) {
      throw new Error("密码不符合安全策略")
    }

    // 检查邮箱是否已存在
    const existingUser = await this.findUserByEmail(userData.email)
    if (existingUser) {
      throw new Error("邮箱已被使用")
    }

    const user: EnterpriseUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      roles: userData.roles || ["viewer"],
      isActive: true,
      mfaEnabled: false,
      lastLoginAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      passwordHash: userData.password ? await this.hashPassword(userData.password) : null,
      ssoProviders: [],
      preferences: {
        language: "zh-CN",
        theme: "light",
        notifications: true,
      },
    }

    // 保存用户（这里应该保存到数据库）
    this.logAudit({
      action: "user.created",
      userId: this.currentUser?.id,
      details: { newUserId: user.id, email: user.email },
    })

    return user
  }

  public async updateUser(userId: string, updates: Partial<EnterpriseUser>): Promise<EnterpriseUser> {
    const user = await this.findUserById(userId)
    if (!user) {
      throw new Error("用户不存在")
    }

    // 检查权限
    if (userId !== this.currentUser?.id && !this.hasPermission("user.manage")) {
      throw new Error("无权修改其他用户信息")
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: Date.now(),
    }

    this.logAudit({
      action: "user.updated",
      userId: this.currentUser?.id,
      details: { targetUserId: userId, updates },
    })

    return updatedUser
  }

  // 审计日志
  public logAudit(log: Omit<AuditLog, "id" | "timestamp" | "ipAddress" | "userAgent">): void {
    if (!this.config.enableAuditLog) return

    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action: log.action,
      userId: log.userId,
      details: log.details,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
    }

    this.auditLogs.push(auditLog)

    // 清理过期日志
    this.cleanupAuditLogs()

    // 发送到审计服务（可选）
    this.sendToAuditService(auditLog)
  }

  public getAuditLogs(filters?: AuditLogFilter): AuditLog[] {
    if (!this.hasPermission("audit.view")) {
      throw new Error("无权查看审计日志")
    }

    let logs = [...this.auditLogs]

    if (filters) {
      if (filters.userId) {
        logs = logs.filter((log) => log.userId === filters.userId)
      }
      if (filters.action) {
        logs = logs.filter((log) => log.action.includes(filters.action))
      }
      if (filters.startTime) {
        logs = logs.filter((log) => log.timestamp >= filters.startTime!)
      }
      if (filters.endTime) {
        logs = logs.filter((log) => log.timestamp <= filters.endTime!)
      }
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp)
  }

  // 会话管理
  public async createSession(user: EnterpriseUser): Promise<UserSession> {
    const session: UserSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.config.sessionTimeout,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      isActive: true,
    }

    // 保存会话（这里应该保存到数据库或Redis）
    localStorage.setItem("yanyu_session", JSON.stringify(session))

    return session
  }

  public async validateSession(sessionId: string): Promise<boolean> {
    // 从存储中获取会话
    const sessionData = localStorage.getItem("yanyu_session")
    if (!sessionData) return false

    try {
      const session: UserSession = JSON.parse(sessionData)

      if (session.id !== sessionId) return false
      if (!session.isActive) return false
      if (Date.now() > session.expiresAt) {
        this.destroySession(sessionId)
        return false
      }

      return true
    } catch {
      return false
    }
  }

  public async destroySession(sessionId: string): Promise<void> {
    localStorage.removeItem("yanyu_session")

    this.logAudit({
      action: "auth.logout",
      userId: this.currentUser?.id,
      details: { sessionId },
    })

    this.currentUser = null
  }

  // 私有方法
  private async validateCredentials(credentials: LoginCredentials): Promise<EnterpriseUser | null> {
    // 这里应该从数据库验证用户凭据
    // 简化实现，返回模拟用户
    if (credentials.email === "admin@yanyu.cloud" && credentials.password === "admin123") {
      return {
        id: "admin_user",
        email: "admin@yanyu.cloud",
        name: "系统管理员",
        roles: ["super_admin"],
        isActive: true,
        mfaEnabled: false,
        lastLoginAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordHash: await this.hashPassword("admin123"),
        ssoProviders: [],
        preferences: {
          language: "zh-CN",
          theme: "light",
          notifications: true,
        },
      }
    }
    return null
  }

  private async findUserById(userId: string): Promise<EnterpriseUser | null> {
    // 这里应该从数据库查找用户
    return null
  }

  private async findUserByEmail(email: string): Promise<EnterpriseUser | null> {
    // 这里应该从数据库查找用户
    return null
  }

  private async createUserFromSSO(userInfo: any, provider: string): Promise<EnterpriseUser> {
    return this.createUser({
      email: userInfo.email,
      name: userInfo.name || userInfo.login,
      avatar: userInfo.avatar_url || userInfo.picture,
      roles: ["developer"], // 默认角色
    })
  }

  private async updateUserSSOInfo(userId: string, provider: string, userInfo: any): Promise<void> {
    // 更新用户的SSO信息
  }

  private async exchangeCodeForToken(provider: SSOProvider, code: string): Promise<any> {
    const response = await fetch(provider.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: provider.config.clientId,
        client_secret: provider.config.clientSecret,
        code,
        redirect_uri: provider.config.redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!response.ok) {
      throw new Error("获取访问令牌失败")
    }

    return response.json()
  }

  private async fetchUserInfo(provider: SSOProvider, accessToken: string): Promise<any> {
    const response = await fetch(provider.config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("获取用户信息失败")
    }

    return response.json()
  }

  private async validateMFACode(user: EnterpriseUser, code: string): Promise<boolean> {
    // 这里应该验证TOTP或SMS代码
    // 简化实现
    return code === "123456"
  }

  private validatePassword(password: string): boolean {
    const policy = this.config.passwordPolicy

    if (password.length < policy.minLength) return false
    if (policy.requireUppercase && !/[A-Z]/.test(password)) return false
    if (policy.requireLowercase && !/[a-z]/.test(password)) return false
    if (policy.requireNumbers && !/\d/.test(password)) return false
    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false

    return true
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  private getClientIP(): string {
    // 简化实现，实际项目中需要从请求头获取
    return "127.0.0.1"
  }

  private cleanupAuditLogs(): void {
    const cutoffTime = Date.now() - this.config.auditRetentionDays * 24 * 60 * 60 * 1000
    this.auditLogs = this.auditLogs.filter((log) => log.timestamp > cutoffTime)
  }

  private sendToAuditService(log: AuditLog): void {
    // 发送到外部审计服务
    console.log("Audit Log:", log)
  }

  // 公共方法
  public getCurrentUser(): EnterpriseUser | null {
    return this.currentUser
  }

  public getAllRoles(): Role[] {
    return Array.from(this.roles.values())
  }

  public getSSOProviders(): SSOProvider[] {
    return Array.from(this.ssoProviders.values()).filter((provider) => provider.enabled)
  }

  public getConfig(): AuthConfig {
    return { ...this.config }
  }

  public updateConfig(updates: Partial<AuthConfig>): void {
    if (!this.hasPermission("system.config")) {
      throw new Error("无权修改系统配置")
    }

    this.config = { ...this.config, ...updates }

    this.logAudit({
      action: "config.updated",
      userId: this.currentUser?.id,
      details: { updates },
    })
  }
}

// 类型定义
export interface EnterpriseUser {
  id: string
  email: string
  name: string
  avatar?: string
  roles: string[]
  isActive: boolean
  mfaEnabled: boolean
  lastLoginAt: number | null
  createdAt: number
  updatedAt: number
  passwordHash: string | null
  ssoProviders: string[]
  preferences: {
    language: string
    theme: string
    notifications: boolean
  }
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystemRole?: boolean
  createdAt: number
  updatedAt: number
}

export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResult {
  success: boolean
  user?: EnterpriseUser
  session?: UserSession
  message: string
  requiresMFA?: boolean
  userId?: string
}

export interface UserSession {
  id: string
  userId: string
  createdAt: number
  expiresAt: number
  ipAddress: string
  userAgent: string
  isActive: boolean
}

export interface AuditLog {
  id: string
  timestamp: number
  action: string
  userId?: string
  details?: any
  ipAddress: string
  userAgent: string
}

export interface AuditLogFilter {
  userId?: string
  action?: string
  startTime?: number
  endTime?: number
}

export interface SSOProvider {
  id: string
  name: string
  type: "oauth2" | "saml" | "oidc"
  config: any
  enabled: boolean
}

export interface AuthConfig {
  enableSSO: boolean
  enableMFA: boolean
  sessionTimeout: number
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    maxAge: number
  }
  auditRetentionDays: number
  enableAuditLog: boolean
}

export interface CreateUserData {
  email: string
  name: string
  password?: string
  avatar?: string
  roles?: string[]
}

// 导出企业认证管理器实例
export const enterpriseAuthManager = EnterpriseAuthManager.getInstance()
