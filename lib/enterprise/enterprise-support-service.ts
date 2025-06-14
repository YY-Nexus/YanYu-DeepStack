"use client"

// 企业级支持服务 - 提供全方位的企业级技术支持
export class EnterpriseSupportService {
  private static instance: EnterpriseSupportService
  private tickets = new Map<string, SupportTicket>()
  private knowledgeBase = new Map<string, KnowledgeArticle>()
  private supportAgents = new Map<string, SupportAgent>()
  private config: SupportConfig

  private constructor() {
    this.config = {
      businessHours: {
        start: "09:00",
        end: "18:00",
        timezone: "Asia/Shanghai",
        workdays: [1, 2, 3, 4, 5], // 周一到周五
      },
      slaTargets: {
        critical: { responseTime: 1, resolutionTime: 4 }, // 小时
        high: { responseTime: 4, resolutionTime: 24 },
        medium: { responseTime: 8, resolutionTime: 72 },
        low: { responseTime: 24, resolutionTime: 168 },
      },
      escalationRules: {
        noResponseHours: 2,
        noResolutionHours: 24,
        maxEscalationLevel: 3,
      },
      enableLiveChat: true,
      enableVideoCall: true,
      enableRemoteAssistance: true,
    }

    this.initializeSupportAgents()
    this.initializeKnowledgeBase()
  }

  public static getInstance(): EnterpriseSupportService {
    if (!EnterpriseSupportService.instance) {
      EnterpriseSupportService.instance = new EnterpriseSupportService()
    }
    return EnterpriseSupportService.instance
  }

  // 初始化支持代理
  private initializeSupportAgents(): void {
    const agents: SupportAgent[] = [
      {
        id: "agent_001",
        name: "张技术",
        email: "zhang.tech@yanyu.cloud",
        role: "senior_engineer",
        specialties: ["AI模型", "系统架构", "性能优化"],
        languages: ["zh-CN", "en-US"],
        status: "available",
        workingHours: {
          start: "09:00",
          end: "18:00",
          timezone: "Asia/Shanghai",
        },
        rating: 4.9,
        totalTickets: 1250,
        resolvedTickets: 1180,
        averageResolutionTime: 6.5, // 小时
        createdAt: new Date("2023-01-01"),
      },
      {
        id: "agent_002",
        name: "李支持",
        email: "li.support@yanyu.cloud",
        role: "support_specialist",
        specialties: ["用户培训", "功能使用", "故障排除"],
        languages: ["zh-CN"],
        status: "available",
        workingHours: {
          start: "09:00",
          end: "18:00",
          timezone: "Asia/Shanghai",
        },
        rating: 4.7,
        totalTickets: 890,
        resolvedTickets: 845,
        averageResolutionTime: 4.2, // 小时
        createdAt: new Date("2023-03-01"),
      },
      {
        id: "agent_003",
        name: "王架构",
        email: "wang.arch@yanyu.cloud",
        role: "solution_architect",
        specialties: ["企业部署", "集成方案", "安全配置"],
        languages: ["zh-CN", "en-US"],
        status: "busy",
        workingHours: {
          start: "09:00",
          end: "18:00",
          timezone: "Asia/Shanghai",
        },
        rating: 4.8,
        totalTickets: 650,
        resolvedTickets: 620,
        averageResolutionTime: 8.1, // 小时
        createdAt: new Date("2023-02-01"),
      },
    ]

    agents.forEach((agent) => this.supportAgents.set(agent.id, agent))
  }

  // 初始化知识库
  private initializeKnowledgeBase(): void {
    const articles: KnowledgeArticle[] = [
      {
        id: "kb_001",
        title: "如何部署言語云³到私有云环境",
        category: "deployment",
        tags: ["私有云", "部署", "Docker", "Kubernetes"],
        content: `
# 私有云部署指南

## 系统要求
- CPU: 16核心以上
- 内存: 32GB以上
- 存储: 500GB以上SSD
- 网络: 千兆以上带宽

## 部署步骤
1. 准备Docker环境
2. 配置Kubernetes集群
3. 部署数据库服务
4. 部署应用服务
5. 配置负载均衡
6. 设置监控告警

## 详细说明
...
        `,
        author: "张技术",
        status: "published",
        views: 1250,
        helpful: 98,
        notHelpful: 12,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20"),
      },
      {
        id: "kb_002",
        title: "多租户配置最佳实践",
        category: "configuration",
        tags: ["多租户", "配置", "安全", "隔离"],
        content: `
# 多租户配置最佳实践

## 数据隔离策略
1. 数据库级隔离
2. 应用级隔离
3. 网络级隔离

## 安全配置
1. 访问控制
2. 数据加密
3. 审计日志

## 性能优化
...
        `,
        author: "王架构",
        status: "published",
        views: 890,
        helpful: 85,
        notHelpful: 8,
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-18"),
      },
      {
        id: "kb_003",
        title: "AI模型集成常见问题解答",
        category: "ai-models",
        tags: ["AI模型", "集成", "故障排除", "Ollama"],
        content: `
# AI模型集成常见问题

## Q: 如何添加自定义AI模型？
A: 通过模型管理界面上传模型文件，配置推理参数...

## Q: 模型推理速度慢怎么办？
A: 检查GPU配置，优化模型参数，使用模型量化...

## Q: 如何监控模型性能？
A: 使用内置监控面板，查看推理延迟、成功率等指标...
        `,
        author: "李支持",
        status: "published",
        views: 1580,
        helpful: 142,
        notHelpful: 15,
        createdAt: new Date("2024-01-08"),
        updatedAt: new Date("2024-01-22"),
      },
    ]

    articles.forEach((article) => this.knowledgeBase.set(article.id, article))
  }

  // 创建支持工单
  public createTicket(ticketData: CreateTicketData): SupportTicket {
    const ticket: SupportTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...ticketData,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sender: ticketData.customerId,
          senderType: "customer",
          content: ticketData.description,
          timestamp: new Date(),
          attachments: ticketData.attachments || [],
        },
      ],
      slaTarget: this.calculateSLATarget(ticketData.priority),
    }

    // 自动分配支持代理
    const assignedAgent = this.assignAgent(ticket)
    if (assignedAgent) {
      ticket.assignedAgentId = assignedAgent.id
    }

    this.tickets.set(ticket.id, ticket)

    // 发送通知
    this.sendTicketNotification(ticket, "created")

    return ticket
  }

  // 获取工单列表
  public getTickets(filters?: TicketFilters): SupportTicket[] {
    let tickets = Array.from(this.tickets.values())

    if (filters) {
      if (filters.customerId) {
        tickets = tickets.filter((t) => t.customerId === filters.customerId)
      }
      if (filters.status) {
        tickets = tickets.filter((t) => t.status === filters.status)
      }
      if (filters.priority) {
        tickets = tickets.filter((t) => t.priority === filters.priority)
      }
      if (filters.assignedAgentId) {
        tickets = tickets.filter((t) => t.assignedAgentId === filters.assignedAgentId)
      }
      if (filters.category) {
        tickets = tickets.filter((t) => t.category === filters.category)
      }
    }

    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // 获取工单详情
  public getTicket(ticketId: string): SupportTicket | undefined {
    return this.tickets.get(ticketId)
  }

  // 更新工单状态
  public updateTicketStatus(ticketId: string, status: TicketStatus, agentId?: string): boolean {
    const ticket = this.tickets.get(ticketId)
    if (!ticket) return false

    const oldStatus = ticket.status
    ticket.status = status
    ticket.updatedAt = new Date()

    if (status === "resolved") {
      ticket.resolvedAt = new Date()
    } else if (status === "closed") {
      ticket.closedAt = new Date()
    }

    this.tickets.set(ticketId, ticket)

    // 发送状态更新通知
    if (oldStatus !== status) {
      this.sendTicketNotification(ticket, "status_updated")
    }

    return true
  }

  // 添加工单消息
  public addTicketMessage(ticketId: string, messageData: AddMessageData): TicketMessage | undefined {
    const ticket = this.tickets.get(ticketId)
    if (!ticket) return undefined

    const message: TicketMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...messageData,
      timestamp: new Date(),
    }

    ticket.messages.push(message)
    ticket.updatedAt = new Date()

    // 如果是客户回复，重置状态为open
    if (messageData.senderType === "customer" && ticket.status === "waiting_customer") {
      ticket.status = "open"
    }

    this.tickets.set(ticketId, ticket)

    // 发送新消息通知
    this.sendTicketNotification(ticket, "new_message")

    return message
  }

  // 分配工单代理
  public assignTicket(ticketId: string, agentId: string): boolean {
    const ticket = this.tickets.get(ticketId)
    const agent = this.supportAgents.get(agentId)

    if (!ticket || !agent) return false

    ticket.assignedAgentId = agentId
    ticket.updatedAt = new Date()

    this.tickets.set(ticketId, ticket)

    // 发送分配通知
    this.sendTicketNotification(ticket, "assigned")

    return true
  }

  // 自动分配代理
  private assignAgent(ticket: SupportTicket): SupportAgent | undefined {
    const availableAgents = Array.from(this.supportAgents.values()).filter((agent) => agent.status === "available")

    if (availableAgents.length === 0) return undefined

    // 根据专业领域和工作负载分配
    let bestAgent = availableAgents[0]
    let bestScore = 0

    for (const agent of availableAgents) {
      let score = 0

      // 专业匹配度
      if (
        agent.specialties.some(
          (specialty) =>
            ticket.category.includes(specialty.toLowerCase()) ||
            ticket.subject.toLowerCase().includes(specialty.toLowerCase()),
        )
      ) {
        score += 10
      }

      // 语言匹配度
      if (agent.languages.includes("zh-CN")) {
        score += 5
      }

      // 工作负载（票数越少分数越高）
      const currentTickets = this.getTickets({ assignedAgentId: agent.id, status: "open" }).length
      score += Math.max(0, 10 - currentTickets)

      // 评分
      score += agent.rating

      if (score > bestScore) {
        bestScore = score
        bestAgent = agent
      }
    }

    return bestAgent
  }

  // 计算SLA目标
  private calculateSLATarget(priority: TicketPriority): SLATarget {
    const sla = this.config.slaTargets[priority]
    const now = new Date()

    return {
      responseBy: new Date(now.getTime() + sla.responseTime * 60 * 60 * 1000),
      resolveBy: new Date(now.getTime() + sla.resolutionTime * 60 * 60 * 1000),
    }
  }

  // 发送工单通知
  private sendTicketNotification(ticket: SupportTicket, event: string): void {
    console.log(`工单通知 [${event}]: ${ticket.id} - ${ticket.subject}`)

    // 这里应该实现实际的通知逻辑
    // 例如发送邮件、短信、推送通知等
  }

  // 搜索知识库
  public searchKnowledgeBase(query: string, category?: string): KnowledgeArticle[] {
    let articles = Array.from(this.knowledgeBase.values()).filter((article) => article.status === "published")

    if (category) {
      articles = articles.filter((article) => article.category === category)
    }

    if (query) {
      const searchTerms = query.toLowerCase().split(" ")
      articles = articles.filter((article) => {
        const searchText = `${article.title} ${article.content} ${article.tags.join(" ")}`.toLowerCase()
        return searchTerms.some((term) => searchText.includes(term))
      })
    }

    return articles.sort((a, b) => b.views - a.views)
  }

  // 获取知识库文章
  public getKnowledgeArticle(articleId: string): KnowledgeArticle | undefined {
    const article = this.knowledgeBase.get(articleId)
    if (article) {
      // 增加浏览次数
      article.views++
      this.knowledgeBase.set(articleId, article)
    }
    return article
  }

  // 评价知识库文章
  public rateKnowledgeArticle(articleId: string, helpful: boolean): boolean {
    const article = this.knowledgeBase.get(articleId)
    if (!article) return false

    if (helpful) {
      article.helpful++
    } else {
      article.notHelpful++
    }

    this.knowledgeBase.set(articleId, article)
    return true
  }

  // 获取支持统计
  public getSupportStats(): SupportStats {
    const tickets = this.getTickets()
    const agents = Array.from(this.supportAgents.values())

    const openTickets = tickets.filter((t) => t.status === "open")
    const resolvedTickets = tickets.filter((t) => t.status === "resolved")
    const closedTickets = tickets.filter((t) => t.status === "closed")

    // 计算平均解决时间
    const resolvedWithTime = resolvedTickets.filter((t) => t.resolvedAt)
    const avgResolutionTime =
      resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, t) => {
            const resolutionTime = (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60)
            return sum + resolutionTime
          }, 0) / resolvedWithTime.length
        : 0

    // 计算客户满意度
    const ratedTickets = tickets.filter((t) => t.customerRating !== undefined)
    const avgCustomerRating =
      ratedTickets.length > 0
        ? ratedTickets.reduce((sum, t) => sum + (t.customerRating || 0), 0) / ratedTickets.length
        : 0

    return {
      totalTickets: tickets.length,
      openTickets: openTickets.length,
      resolvedTickets: resolvedTickets.length,
      closedTickets: closedTickets.length,
      avgResolutionTime,
      avgCustomerRating,
      agentStats: agents.map((agent) => ({
        agentId: agent.id,
        name: agent.name,
        status: agent.status,
        totalTickets: agent.totalTickets,
        resolvedTickets: agent.resolvedTickets,
        rating: agent.rating,
        currentWorkload: this.getTickets({ assignedAgentId: agent.id, status: "open" }).length,
      })),
      knowledgeBaseStats: {
        totalArticles: this.knowledgeBase.size,
        totalViews: Array.from(this.knowledgeBase.values()).reduce((sum, a) => sum + a.views, 0),
        avgHelpfulRating: this.calculateAvgHelpfulRating(),
      },
    }
  }

  // 计算知识库平均有用率
  private calculateAvgHelpfulRating(): number {
    const articles = Array.from(this.knowledgeBase.values())
    const totalRatings = articles.reduce((sum, a) => sum + a.helpful + a.notHelpful, 0)
    const helpfulRatings = articles.reduce((sum, a) => sum + a.helpful, 0)

    return totalRatings > 0 ? (helpfulRatings / totalRatings) * 100 : 0
  }

  // 启动实时聊天
  public startLiveChat(customerId: string, subject: string): LiveChatSession {
    const session: LiveChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      subject,
      status: "waiting",
      createdAt: new Date(),
      messages: [],
    }

    // 分配可用代理
    const availableAgent = Array.from(this.supportAgents.values()).find((agent) => agent.status === "available")

    if (availableAgent) {
      session.agentId = availableAgent.id
      session.status = "active"
      session.startedAt = new Date()
    }

    return session
  }

  // 请求远程协助
  public requestRemoteAssistance(ticketId: string): RemoteAssistanceSession {
    const ticket = this.tickets.get(ticketId)
    if (!ticket) {
      throw new Error("工单不存在")
    }

    const session: RemoteAssistanceSession = {
      id: `remote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketId,
      customerId: ticket.customerId,
      agentId: ticket.assignedAgentId,
      status: "pending",
      createdAt: new Date(),
      accessCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
    }

    return session
  }
}

// 类型定义
export type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved" | "closed"
export type TicketPriority = "low" | "medium" | "high" | "critical"
export type SenderType = "customer" | "agent" | "system"
export type AgentRole = "support_specialist" | "senior_engineer" | "solution_architect" | "manager"
export type AgentStatus = "available" | "busy" | "away" | "offline"

export interface SupportTicket {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  tenantId: string
  subject: string
  description: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  assignedAgentId?: string
  messages: TicketMessage[]
  attachments?: string[]
  tags?: string[]
  slaTarget: SLATarget
  customerRating?: number
  customerFeedback?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  closedAt?: Date
}

export interface CreateTicketData {
  customerId: string
  customerName: string
  customerEmail: string
  tenantId: string
  subject: string
  description: string
  category: string
  priority: TicketPriority
  attachments?: string[]
  tags?: string[]
}

export interface TicketMessage {
  id: string
  sender: string
  senderType: SenderType
  content: string
  timestamp: Date
  attachments?: string[]
  isInternal?: boolean
}

export interface AddMessageData {
  sender: string
  senderType: SenderType
  content: string
  attachments?: string[]
  isInternal?: boolean
}

export interface SupportAgent {
  id: string
  name: string
  email: string
  role: AgentRole
  specialties: string[]
  languages: string[]
  status: AgentStatus
  workingHours: {
    start: string
    end: string
    timezone: string
  }
  rating: number
  totalTickets: number
  resolvedTickets: number
  averageResolutionTime: number
  createdAt: Date
}

export interface KnowledgeArticle {
  id: string
  title: string
  category: string
  tags: string[]
  content: string
  author: string
  status: "draft" | "published" | "archived"
  views: number
  helpful: number
  notHelpful: number
  createdAt: Date
  updatedAt: Date
}

export interface SLATarget {
  responseBy: Date
  resolveBy: Date
}

export interface TicketFilters {
  customerId?: string
  status?: TicketStatus
  priority?: TicketPriority
  assignedAgentId?: string
  category?: string
}

export interface SupportStats {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  closedTickets: number
  avgResolutionTime: number
  avgCustomerRating: number
  agentStats: Array<{
    agentId: string
    name: string
    status: AgentStatus
    totalTickets: number
    resolvedTickets: number
    rating: number
    currentWorkload: number
  }>
  knowledgeBaseStats: {
    totalArticles: number
    totalViews: number
    avgHelpfulRating: number
  }
}

export interface LiveChatSession {
  id: string
  customerId: string
  agentId?: string
  subject: string
  status: "waiting" | "active" | "ended"
  createdAt: Date
  startedAt?: Date
  endedAt?: Date
  messages: TicketMessage[]
}

export interface RemoteAssistanceSession {
  id: string
  ticketId: string
  customerId: string
  agentId?: string
  status: "pending" | "active" | "completed" | "cancelled"
  accessCode: string
  createdAt: Date
  startedAt?: Date
  endedAt?: Date
}

export interface SupportConfig {
  businessHours: {
    start: string
    end: string
    timezone: string
    workdays: number[]
  }
  slaTargets: Record<
    TicketPriority,
    {
      responseTime: number
      resolutionTime: number
    }
  >
  escalationRules: {
    noResponseHours: number
    noResolutionHours: number
    maxEscalationLevel: number
  }
  enableLiveChat: boolean
  enableVideoCall: boolean
  enableRemoteAssistance: boolean
}

// 导出企业支持服务实例
export const enterpriseSupportService = EnterpriseSupportService.getInstance()
