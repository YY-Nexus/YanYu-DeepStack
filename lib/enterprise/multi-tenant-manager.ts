"use client"

// 多租户管理器 - 实现企业级多租户架构
export class MultiTenantManager {
  private static instance: MultiTenantManager
  private tenants = new Map<string, Tenant>()
  private subscriptions = new Map<string, Subscription>()
  private resourceQuotas = new Map<string, ResourceQuota>()
  private billingRecords = new Map<string, BillingRecord[]>()
  private config: MultiTenantConfig

  private constructor() {
    this.config = {
      defaultPlan: "basic",
      trialPeriodDays: 14,
      maxTenantsPerOrg: 10,
      enableResourceIsolation: true,
      enableDataEncryption: true,
      auditLogRetentionDays: 365,
    }

    this.initializeDefaultTenants()
  }

  public static getInstance(): MultiTenantManager {
    if (!MultiTenantManager.instance) {
      MultiTenantManager.instance = new MultiTenantManager()
    }
    return MultiTenantManager.instance
  }

  // 初始化默认租户
  private initializeDefaultTenants(): void {
    // 系统管理员租户
    this.createTenant({
      name: "系统管理员",
      domain: "admin.yanyu.cloud",
      plan: "enterprise",
      organizationId: "org_system",
      settings: {
        theme: "dark",
        language: "zh-CN",
        timezone: "Asia/Shanghai",
        features: {
          aiCodeGeneration: true,
          realTimePreview: true,
          multimodalAI: true,
          enterpriseAuth: true,
          customBranding: true,
          apiAccess: true,
          advancedAnalytics: true,
          prioritySupport: true,
        },
      },
      metadata: {
        industry: "Technology",
        companySize: "Enterprise",
        useCase: "Platform Administration",
      },
    })

    // 演示企业租户
    this.createTenant({
      name: "演示企业",
      domain: "demo.yanyu.cloud",
      plan: "professional",
      organizationId: "org_demo",
      settings: {
        theme: "light",
        language: "zh-CN",
        timezone: "Asia/Shanghai",
        features: {
          aiCodeGeneration: true,
          realTimePreview: true,
          multimodalAI: true,
          enterpriseAuth: false,
          customBranding: true,
          apiAccess: true,
          advancedAnalytics: false,
          prioritySupport: false,
        },
      },
      metadata: {
        industry: "Software Development",
        companySize: "Medium",
        useCase: "Development Platform",
      },
    })

    // 个人开发者租户
    this.createTenant({
      name: "个人开发者",
      domain: "dev.yanyu.cloud",
      plan: "basic",
      organizationId: "org_individual",
      settings: {
        theme: "auto",
        language: "zh-CN",
        timezone: "Asia/Shanghai",
        features: {
          aiCodeGeneration: true,
          realTimePreview: true,
          multimodalAI: false,
          enterpriseAuth: false,
          customBranding: false,
          apiAccess: false,
          advancedAnalytics: false,
          prioritySupport: false,
        },
      },
      metadata: {
        industry: "Individual",
        companySize: "Individual",
        useCase: "Personal Development",
      },
    })
  }

  // 创建租户
  public createTenant(tenantData: CreateTenantData): Tenant {
    const tenant: Tenant = {
      id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...tenantData,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessAt: new Date(),
      userCount: 0,
      projectCount: 0,
      storageUsed: 0,
    }

    this.tenants.set(tenant.id, tenant)

    // 创建默认订阅
    this.createSubscription(tenant.id, tenant.plan)

    // 设置资源配额
    this.setResourceQuota(tenant.id, this.getDefaultQuotaForPlan(tenant.plan))

    return tenant
  }

  // 获取所有租户
  public getTenants(): Tenant[] {
    return Array.from(this.tenants.values())
  }

  // 获取租户详情
  public getTenant(tenantId: string): Tenant | undefined {
    return this.tenants.get(tenantId)
  }

  // 根据域名获取租户
  public getTenantByDomain(domain: string): Tenant | undefined {
    return Array.from(this.tenants.values()).find((tenant) => tenant.domain === domain)
  }

  // 更新租户信息
  public updateTenant(tenantId: string, updates: Partial<Tenant>): Tenant | undefined {
    const tenant = this.tenants.get(tenantId)
    if (tenant) {
      const updatedTenant = {
        ...tenant,
        ...updates,
        updatedAt: new Date(),
      }
      this.tenants.set(tenantId, updatedTenant)
      return updatedTenant
    }
    return undefined
  }

  // 停用租户
  public suspendTenant(tenantId: string, reason: string): boolean {
    const tenant = this.tenants.get(tenantId)
    if (tenant) {
      tenant.status = "suspended"
      tenant.suspensionReason = reason
      tenant.updatedAt = new Date()
      this.tenants.set(tenantId, tenant)
      return true
    }
    return false
  }

  // 激活租户
  public activateTenant(tenantId: string): boolean {
    const tenant = this.tenants.get(tenantId)
    if (tenant) {
      tenant.status = "active"
      delete tenant.suspensionReason
      tenant.updatedAt = new Date()
      this.tenants.set(tenantId, tenant)
      return true
    }
    return false
  }

  // 删除租户
  public deleteTenant(tenantId: string): boolean {
    const success = this.tenants.delete(tenantId)
    if (success) {
      // 清理相关数据
      this.subscriptions.delete(tenantId)
      this.resourceQuotas.delete(tenantId)
      this.billingRecords.delete(tenantId)
    }
    return success
  }

  // 创建订阅
  public createSubscription(tenantId: string, plan: SubscriptionPlan): Subscription {
    const planConfig = this.getPlanConfig(plan)
    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      plan,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      autoRenew: true,
      pricing: planConfig.pricing,
      features: planConfig.features,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.subscriptions.set(tenantId, subscription)
    return subscription
  }

  // 获取订阅信息
  public getSubscription(tenantId: string): Subscription | undefined {
    return this.subscriptions.get(tenantId)
  }

  // 升级订阅
  public upgradeSubscription(tenantId: string, newPlan: SubscriptionPlan): Subscription | undefined {
    const subscription = this.subscriptions.get(tenantId)
    if (subscription) {
      const planConfig = this.getPlanConfig(newPlan)
      subscription.plan = newPlan
      subscription.pricing = planConfig.pricing
      subscription.features = planConfig.features
      subscription.updatedAt = new Date()

      // 更新租户计划
      const tenant = this.tenants.get(tenantId)
      if (tenant) {
        tenant.plan = newPlan
        tenant.updatedAt = new Date()
        this.tenants.set(tenantId, tenant)
      }

      // 更新资源配额
      this.setResourceQuota(tenantId, this.getDefaultQuotaForPlan(newPlan))

      this.subscriptions.set(tenantId, subscription)
      return subscription
    }
    return undefined
  }

  // 设置资源配额
  public setResourceQuota(tenantId: string, quota: ResourceQuota): void {
    quota.tenantId = tenantId
    quota.updatedAt = new Date()
    this.resourceQuotas.set(tenantId, quota)
  }

  // 获取资源配额
  public getResourceQuota(tenantId: string): ResourceQuota | undefined {
    return this.resourceQuotas.get(tenantId)
  }

  // 检查资源使用情况
  public checkResourceUsage(tenantId: string): ResourceUsageCheck {
    const quota = this.resourceQuotas.get(tenantId)
    const tenant = this.tenants.get(tenantId)

    if (!quota || !tenant) {
      return {
        tenantId,
        withinLimits: false,
        violations: ["租户或配额不存在"],
        usage: {
          users: 0,
          projects: 0,
          storage: 0,
          apiCalls: 0,
          aiRequests: 0,
        },
        limits: {
          users: 0,
          projects: 0,
          storage: 0,
          apiCalls: 0,
          aiRequests: 0,
        },
      }
    }

    const violations: string[] = []
    const usage = {
      users: tenant.userCount,
      projects: tenant.projectCount,
      storage: tenant.storageUsed,
      apiCalls: 0, // 这里应该从实际使用情况获取
      aiRequests: 0, // 这里应该从实际使用情况获取
    }

    // 检查各项限制
    if (usage.users > quota.maxUsers) {
      violations.push(`用户数量超限: ${usage.users}/${quota.maxUsers}`)
    }
    if (usage.projects > quota.maxProjects) {
      violations.push(`项目数量超限: ${usage.projects}/${quota.maxProjects}`)
    }
    if (usage.storage > quota.maxStorage) {
      violations.push(`存储空间超限: ${usage.storage}MB/${quota.maxStorage}MB`)
    }
    if (usage.apiCalls > quota.maxApiCalls) {
      violations.push(`API调用超限: ${usage.apiCalls}/${quota.maxApiCalls}`)
    }
    if (usage.aiRequests > quota.maxAiRequests) {
      violations.push(`AI请求超限: ${usage.aiRequests}/${quota.maxAiRequests}`)
    }

    return {
      tenantId,
      withinLimits: violations.length === 0,
      violations,
      usage,
      limits: {
        users: quota.maxUsers,
        projects: quota.maxProjects,
        storage: quota.maxStorage,
        apiCalls: quota.maxApiCalls,
        aiRequests: quota.maxAiRequests,
      },
    }
  }

  // 记录计费
  public recordBilling(tenantId: string, record: Omit<BillingRecord, "id" | "createdAt">): BillingRecord {
    const billingRecord: BillingRecord = {
      id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...record,
      createdAt: new Date(),
    }

    const records = this.billingRecords.get(tenantId) || []
    records.push(billingRecord)
    this.billingRecords.set(tenantId, records)

    return billingRecord
  }

  // 获取计费记录
  public getBillingRecords(tenantId: string, startDate?: Date, endDate?: Date): BillingRecord[] {
    const records = this.billingRecords.get(tenantId) || []

    if (!startDate && !endDate) {
      return records
    }

    return records.filter((record) => {
      const recordDate = record.createdAt
      if (startDate && recordDate < startDate) return false
      if (endDate && recordDate > endDate) return false
      return true
    })
  }

  // 生成月度账单
  public generateMonthlyBill(tenantId: string, year: number, month: number): MonthlyBill {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const records = this.getBillingRecords(tenantId, startDate, endDate)
    const tenant = this.tenants.get(tenantId)
    const subscription = this.subscriptions.get(tenantId)

    if (!tenant || !subscription) {
      throw new Error("租户或订阅信息不存在")
    }

    const totalAmount = records.reduce((sum, record) => sum + record.amount, 0)
    const subscriptionFee = subscription.pricing.monthly

    return {
      tenantId,
      tenantName: tenant.name,
      period: { year, month },
      subscriptionFee,
      usageCharges: totalAmount,
      totalAmount: subscriptionFee + totalAmount,
      currency: "CNY",
      records,
      generatedAt: new Date(),
    }
  }

  // 获取计划配置
  private getPlanConfig(plan: SubscriptionPlan): PlanConfig {
    const configs: Record<SubscriptionPlan, PlanConfig> = {
      basic: {
        pricing: { monthly: 99, yearly: 999 },
        features: {
          maxUsers: 5,
          maxProjects: 10,
          maxStorage: 1024, // 1GB
          maxApiCalls: 1000,
          maxAiRequests: 100,
          aiCodeGeneration: true,
          realTimePreview: true,
          multimodalAI: false,
          enterpriseAuth: false,
          customBranding: false,
          apiAccess: false,
          advancedAnalytics: false,
          prioritySupport: false,
        },
      },
      professional: {
        pricing: { monthly: 299, yearly: 2999 },
        features: {
          maxUsers: 20,
          maxProjects: 50,
          maxStorage: 10240, // 10GB
          maxApiCalls: 10000,
          maxAiRequests: 1000,
          aiCodeGeneration: true,
          realTimePreview: true,
          multimodalAI: true,
          enterpriseAuth: false,
          customBranding: true,
          apiAccess: true,
          advancedAnalytics: false,
          prioritySupport: false,
        },
      },
      enterprise: {
        pricing: { monthly: 999, yearly: 9999 },
        features: {
          maxUsers: -1, // 无限制
          maxProjects: -1, // 无限制
          maxStorage: -1, // 无限制
          maxApiCalls: -1, // 无限制
          maxAiRequests: -1, // 无限制
          aiCodeGeneration: true,
          realTimePreview: true,
          multimodalAI: true,
          enterpriseAuth: true,
          customBranding: true,
          apiAccess: true,
          advancedAnalytics: true,
          prioritySupport: true,
        },
      },
    }

    return configs[plan]
  }

  // 获取计划的默认配额
  private getDefaultQuotaForPlan(plan: SubscriptionPlan): ResourceQuota {
    const planConfig = this.getPlanConfig(plan)

    return {
      tenantId: "", // 将在设置时填充
      maxUsers: planConfig.features.maxUsers === -1 ? 999999 : planConfig.features.maxUsers,
      maxProjects: planConfig.features.maxProjects === -1 ? 999999 : planConfig.features.maxProjects,
      maxStorage: planConfig.features.maxStorage === -1 ? 999999999 : planConfig.features.maxStorage,
      maxApiCalls: planConfig.features.maxApiCalls === -1 ? 999999999 : planConfig.features.maxApiCalls,
      maxAiRequests: planConfig.features.maxAiRequests === -1 ? 999999999 : planConfig.features.maxAiRequests,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  // 获取租户统计信息
  public getTenantStats(): TenantStats {
    const tenants = this.getTenants()
    const activeTenants = tenants.filter((t) => t.status === "active")
    const suspendedTenants = tenants.filter((t) => t.status === "suspended")

    return {
      total: tenants.length,
      active: activeTenants.length,
      suspended: suspendedTenants.length,
      byPlan: {
        basic: tenants.filter((t) => t.plan === "basic").length,
        professional: tenants.filter((t) => t.plan === "professional").length,
        enterprise: tenants.filter((t) => t.plan === "enterprise").length,
      },
      totalUsers: tenants.reduce((sum, t) => sum + t.userCount, 0),
      totalProjects: tenants.reduce((sum, t) => sum + t.projectCount, 0),
      totalStorage: tenants.reduce((sum, t) => sum + t.storageUsed, 0),
    }
  }

  // 数据隔离检查
  public validateDataIsolation(tenantId: string, resourceId: string): boolean {
    // 检查资源是否属于指定租户
    // 这里应该实现实际的数据隔离逻辑
    return resourceId.includes(tenantId) || resourceId.startsWith(`${tenantId}_`)
  }

  // 租户数据加密
  public encryptTenantData(tenantId: string, data: any): string {
    if (!this.config.enableDataEncryption) {
      return JSON.stringify(data)
    }

    // 简化的加密实现（实际应该使用更强的加密算法）
    const key = `tenant_key_${tenantId}`
    const encrypted = btoa(JSON.stringify(data) + key)
    return encrypted
  }

  // 租户数据解密
  public decryptTenantData(tenantId: string, encryptedData: string): any {
    if (!this.config.enableDataEncryption) {
      return JSON.parse(encryptedData)
    }

    try {
      const key = `tenant_key_${tenantId}`
      const decrypted = atob(encryptedData)
      const data = decrypted.replace(key, "")
      return JSON.parse(data)
    } catch (error) {
      throw new Error("数据解密失败")
    }
  }
}

// 类型定义
export type SubscriptionPlan = "basic" | "professional" | "enterprise"
export type TenantStatus = "active" | "suspended" | "deleted"

export interface Tenant {
  id: string
  name: string
  domain: string
  plan: SubscriptionPlan
  status: TenantStatus
  organizationId: string
  settings: {
    theme: string
    language: string
    timezone: string
    features: {
      aiCodeGeneration: boolean
      realTimePreview: boolean
      multimodalAI: boolean
      enterpriseAuth: boolean
      customBranding: boolean
      apiAccess: boolean
      advancedAnalytics: boolean
      prioritySupport: boolean
    }
  }
  metadata: {
    industry: string
    companySize: string
    useCase: string
  }
  createdAt: Date
  updatedAt: Date
  lastAccessAt: Date
  userCount: number
  projectCount: number
  storageUsed: number
  suspensionReason?: string
}

export interface CreateTenantData {
  name: string
  domain: string
  plan: SubscriptionPlan
  organizationId: string
  settings: Tenant["settings"]
  metadata: Tenant["metadata"]
}

export interface Subscription {
  id: string
  tenantId: string
  plan: SubscriptionPlan
  status: "active" | "cancelled" | "expired"
  startDate: Date
  endDate: Date
  autoRenew: boolean
  pricing: {
    monthly: number
    yearly: number
  }
  features: {
    maxUsers: number
    maxProjects: number
    maxStorage: number
    maxApiCalls: number
    maxAiRequests: number
    aiCodeGeneration: boolean
    realTimePreview: boolean
    multimodalAI: boolean
    enterpriseAuth: boolean
    customBranding: boolean
    apiAccess: boolean
    advancedAnalytics: boolean
    prioritySupport: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface ResourceQuota {
  tenantId: string
  maxUsers: number
  maxProjects: number
  maxStorage: number // MB
  maxApiCalls: number
  maxAiRequests: number
  createdAt: Date
  updatedAt: Date
}

export interface ResourceUsageCheck {
  tenantId: string
  withinLimits: boolean
  violations: string[]
  usage: {
    users: number
    projects: number
    storage: number
    apiCalls: number
    aiRequests: number
  }
  limits: {
    users: number
    projects: number
    storage: number
    apiCalls: number
    aiRequests: number
  }
}

export interface BillingRecord {
  id: string
  tenantId: string
  type: "subscription" | "usage" | "overage"
  description: string
  amount: number
  currency: string
  createdAt: Date
}

export interface MonthlyBill {
  tenantId: string
  tenantName: string
  period: { year: number; month: number }
  subscriptionFee: number
  usageCharges: number
  totalAmount: number
  currency: string
  records: BillingRecord[]
  generatedAt: Date
}

export interface PlanConfig {
  pricing: {
    monthly: number
    yearly: number
  }
  features: {
    maxUsers: number
    maxProjects: number
    maxStorage: number
    maxApiCalls: number
    maxAiRequests: number
    aiCodeGeneration: boolean
    realTimePreview: boolean
    multimodalAI: boolean
    enterpriseAuth: boolean
    customBranding: boolean
    apiAccess: boolean
    advancedAnalytics: boolean
    prioritySupport: boolean
  }
}

export interface TenantStats {
  total: number
  active: number
  suspended: number
  byPlan: Record<SubscriptionPlan, number>
  totalUsers: number
  totalProjects: number
  totalStorage: number
}

export interface MultiTenantConfig {
  defaultPlan: SubscriptionPlan
  trialPeriodDays: number
  maxTenantsPerOrg: number
  enableResourceIsolation: boolean
  enableDataEncryption: boolean
  auditLogRetentionDays: number
}

// 导出多租户管理器实例
export const multiTenantManager = MultiTenantManager.getInstance()
