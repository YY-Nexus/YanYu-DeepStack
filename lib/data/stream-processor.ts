"use client"

// 实时数据流处理器 - 模拟Kafka + Flink功能
export class StreamProcessor {
  private static instance: StreamProcessor
  private topics = new Map<string, Topic>()
  private consumers = new Map<string, Consumer>()
  private producers = new Map<string, Producer>()
  private processors = new Map<string, DataProcessor>()
  private isRunning = false

  private constructor() {
    this.initializeDefaultTopics()
  }

  public static getInstance(): StreamProcessor {
    if (!StreamProcessor.instance) {
      StreamProcessor.instance = new StreamProcessor()
    }
    return StreamProcessor.instance
  }

  // 初始化默认主题
  private initializeDefaultTopics(): void {
    // AI模型使用日志
    this.createTopic("ai-model-usage", {
      partitions: 3,
      replicationFactor: 1,
      retentionMs: 7 * 24 * 60 * 60 * 1000, // 7天
    })

    // 用户行为事件
    this.createTopic("user-events", {
      partitions: 5,
      replicationFactor: 1,
      retentionMs: 30 * 24 * 60 * 60 * 1000, // 30天
    })

    // 系统性能指标
    this.createTopic("system-metrics", {
      partitions: 2,
      replicationFactor: 1,
      retentionMs: 24 * 60 * 60 * 1000, // 1天
    })

    // 代码生成事件
    this.createTopic("code-generation", {
      partitions: 4,
      replicationFactor: 1,
      retentionMs: 14 * 24 * 60 * 60 * 1000, // 14天
    })

    // 错误和异常
    this.createTopic("errors", {
      partitions: 2,
      replicationFactor: 1,
      retentionMs: 90 * 24 * 60 * 60 * 1000, // 90天
    })
  }

  // 创建主题
  public createTopic(name: string, config: TopicConfig): void {
    if (this.topics.has(name)) {
      throw new Error(`主题 ${name} 已存在`)
    }

    const topic: Topic = {
      name,
      config,
      partitions: Array.from({ length: config.partitions }, (_, i) => ({
        id: i,
        messages: [],
        offset: 0,
      })),
      createdAt: Date.now(),
      messageCount: 0,
      bytesCount: 0,
    }

    this.topics.set(name, topic)
    console.log(`创建主题: ${name}`)
  }

  // 创建生产者
  public createProducer(id: string, config: ProducerConfig = {}): Producer {
    const producer: Producer = {
      id,
      config: {
        batchSize: config.batchSize || 100,
        lingerMs: config.lingerMs || 10,
        retries: config.retries || 3,
        ...config,
      },
      isConnected: true,
      messagesSent: 0,
      bytesSent: 0,
    }

    this.producers.set(id, producer)
    return producer
  }

  // 创建消费者
  public createConsumer(id: string, groupId: string, config: ConsumerConfig = {}): Consumer {
    const consumer: Consumer = {
      id,
      groupId,
      config: {
        autoOffsetReset: config.autoOffsetReset || "latest",
        enableAutoCommit: config.enableAutoCommit !== false,
        autoCommitIntervalMs: config.autoCommitIntervalMs || 5000,
        ...config,
      },
      subscriptions: new Set(),
      isConnected: true,
      messagesConsumed: 0,
      bytesConsumed: 0,
      lastCommittedOffsets: new Map(),
    }

    this.consumers.set(id, consumer)
    return consumer
  }

  // 发送消息
  public async sendMessage(
    producerId: string,
    topicName: string,
    message: StreamMessage,
    partition?: number,
  ): Promise<MessageMetadata> {
    const producer = this.producers.get(producerId)
    if (!producer || !producer.isConnected) {
      throw new Error(`生产者 ${producerId} 不存在或未连接`)
    }

    const topic = this.topics.get(topicName)
    if (!topic) {
      throw new Error(`主题 ${topicName} 不存在`)
    }

    // 选择分区
    const targetPartition = partition !== undefined ? partition : this.selectPartition(message, topic)

    if (targetPartition >= topic.partitions.length) {
      throw new Error(`分区 ${targetPartition} 不存在`)
    }

    // 创建消息记录
    const record: MessageRecord = {
      ...message,
      partition: targetPartition,
      offset: topic.partitions[targetPartition].offset++,
      timestamp: Date.now(),
      size: JSON.stringify(message).length,
    }

    // 添加到分区
    topic.partitions[targetPartition].messages.push(record)

    // 更新统计
    topic.messageCount++
    topic.bytesCount += record.size
    producer.messagesSent++
    producer.bytesSent += record.size

    // 清理过期消息
    this.cleanupExpiredMessages(topic)

    // 触发消费者处理
    this.notifyConsumers(topicName, record)

    return {
      topic: topicName,
      partition: targetPartition,
      offset: record.offset,
      timestamp: record.timestamp,
    }
  }

  // 订阅主题
  public subscribe(consumerId: string, topics: string[]): void {
    const consumer = this.consumers.get(consumerId)
    if (!consumer) {
      throw new Error(`消费者 ${consumerId} 不存在`)
    }

    topics.forEach((topic) => {
      if (!this.topics.has(topic)) {
        throw new Error(`主题 ${topic} 不存在`)
      }
      consumer.subscriptions.add(topic)
    })
  }

  // 轮询消息
  public async poll(consumerId: string, timeoutMs = 1000): Promise<MessageRecord[]> {
    const consumer = this.consumers.get(consumerId)
    if (!consumer || !consumer.isConnected) {
      throw new Error(`消费者 ${consumerId} 不存在或未连接`)
    }

    const messages: MessageRecord[] = []

    for (const topicName of consumer.subscriptions) {
      const topic = this.topics.get(topicName)
      if (!topic) continue

      for (const partition of topic.partitions) {
        const lastCommittedOffset = consumer.lastCommittedOffsets.get(`${topicName}-${partition.id}`) || 0
        const newMessages = partition.messages.filter((msg) => msg.offset >= lastCommittedOffset)

        messages.push(...newMessages)

        // 更新统计
        consumer.messagesConsumed += newMessages.length
        consumer.bytesConsumed += newMessages.reduce((sum, msg) => sum + msg.size, 0)
      }
    }

    return messages
  }

  // 提交偏移量
  public commitOffsets(consumerId: string, offsets: Map<string, number>): void {
    const consumer = this.consumers.get(consumerId)
    if (!consumer) {
      throw new Error(`消费者 ${consumerId} 不存在`)
    }

    offsets.forEach((offset, topicPartition) => {
      consumer.lastCommittedOffsets.set(topicPartition, offset)
    })
  }

  // 创建数据处理器
  public createProcessor(id: string, config: ProcessorConfig): DataProcessor {
    const processor: DataProcessor = {
      id,
      config,
      isRunning: false,
      processedCount: 0,
      errorCount: 0,
      lastProcessedTime: null,
    }

    this.processors.set(id, processor)
    return processor
  }

  // 启动处理器
  public async startProcessor(processorId: string): Promise<void> {
    const processor = this.processors.get(processorId)
    if (!processor) {
      throw new Error(`处理器 ${processorId} 不存在`)
    }

    if (processor.isRunning) {
      return
    }

    processor.isRunning = true

    // 创建消费者
    const consumer = this.createConsumer(`${processorId}-consumer`, `${processorId}-group`)
    this.subscribe(consumer.id, processor.config.inputTopics)

    // 创建生产者（如果有输出主题）
    let producer: Producer | undefined
    if (processor.config.outputTopic) {
      producer = this.createProducer(`${processorId}-producer`)
    }

    // 处理循环
    const processLoop = async () => {
      while (processor.isRunning) {
        try {
          const messages = await this.poll(consumer.id, 1000)

          for (const message of messages) {
            try {
              // 应用处理函数
              const result = await processor.config.processFunction(message)

              if (result && producer && processor.config.outputTopic) {
                await this.sendMessage(producer.id, processor.config.outputTopic, result)
              }

              processor.processedCount++
              processor.lastProcessedTime = Date.now()
            } catch (error) {
              processor.errorCount++
              console.error(`处理器 ${processorId} 处理消息失败:`, error)

              // 发送错误到错误主题
              if (producer) {
                await this.sendMessage(producer.id, "errors", {
                  key: `processor-error-${processorId}`,
                  value: {
                    processorId,
                    originalMessage: message,
                    error: error instanceof Error ? error.message : "未知错误",
                    timestamp: Date.now(),
                  },
                })
              }
            }
          }

          // 提交偏移量
          if (messages.length > 0) {
            const offsets = new Map<string, number>()
            messages.forEach((msg) => {
              const key = `${msg.topic || "unknown"}-${msg.partition}`
              const currentOffset = offsets.get(key) || 0
              offsets.set(key, Math.max(currentOffset, msg.offset + 1))
            })
            this.commitOffsets(consumer.id, offsets)
          }

          // 短暂休眠
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`处理器 ${processorId} 运行错误:`, error)
          await new Promise((resolve) => setTimeout(resolve, 5000)) // 错误时等待5秒
        }
      }
    }

    processLoop()
    console.log(`启动处理器: ${processorId}`)
  }

  // 停止处理器
  public stopProcessor(processorId: string): void {
    const processor = this.processors.get(processorId)
    if (processor) {
      processor.isRunning = false
      console.log(`停止处理器: ${processorId}`)
    }
  }

  // 获取主题统计
  public getTopicStats(topicName: string): TopicStats | null {
    const topic = this.topics.get(topicName)
    if (!topic) return null

    return {
      name: topicName,
      messageCount: topic.messageCount,
      bytesCount: topic.bytesCount,
      partitionCount: topic.partitions.length,
      partitionStats: topic.partitions.map((partition) => ({
        id: partition.id,
        messageCount: partition.messages.length,
        currentOffset: partition.offset,
        size: partition.messages.reduce((sum, msg) => sum + msg.size, 0),
      })),
      createdAt: topic.createdAt,
    }
  }

  // 获取消费者统计
  public getConsumerStats(consumerId: string): ConsumerStats | null {
    const consumer = this.consumers.get(consumerId)
    if (!consumer) return null

    return {
      id: consumerId,
      groupId: consumer.groupId,
      subscriptions: Array.from(consumer.subscriptions),
      messagesConsumed: consumer.messagesConsumed,
      bytesConsumed: consumer.bytesConsumed,
      isConnected: consumer.isConnected,
      lastCommittedOffsets: Object.fromEntries(consumer.lastCommittedOffsets),
    }
  }

  // 获取处理器统计
  public getProcessorStats(processorId: string): ProcessorStats | null {
    const processor = this.processors.get(processorId)
    if (!processor) return null

    return {
      id: processorId,
      isRunning: processor.isRunning,
      processedCount: processor.processedCount,
      errorCount: processor.errorCount,
      lastProcessedTime: processor.lastProcessedTime,
      successRate: processor.processedCount / (processor.processedCount + processor.errorCount) || 0,
    }
  }

  // 私有方法
  private selectPartition(message: StreamMessage, topic: Topic): number {
    if (message.key) {
      // 基于key的哈希分区
      let hash = 0
      for (let i = 0; i < message.key.length; i++) {
        const char = message.key.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // 转换为32位整数
      }
      return Math.abs(hash) % topic.partitions.length
    }
    // 轮询分区
    return Math.floor(Math.random() * topic.partitions.length)
  }

  private cleanupExpiredMessages(topic: Topic): void {
    const now = Date.now()
    const retentionMs = topic.config.retentionMs

    topic.partitions.forEach((partition) => {
      const expiredIndex = partition.messages.findIndex((msg) => now - msg.timestamp > retentionMs)
      if (expiredIndex > 0) {
        const removedMessages = partition.messages.splice(0, expiredIndex)
        topic.messageCount -= removedMessages.length
        topic.bytesCount -= removedMessages.reduce((sum, msg) => sum + msg.size, 0)
      }
    })
  }

  private notifyConsumers(topicName: string, message: MessageRecord): void {
    // 这里可以实现实时通知机制
    // 例如使用WebSocket或Server-Sent Events
    console.log(`新消息到达主题 ${topicName}:`, message.key)
  }

  // 启动流处理系统
  public start(): void {
    if (this.isRunning) return

    this.isRunning = true
    console.log("流处理系统已启动")

    // 启动默认处理器
    this.startDefaultProcessors()
  }

  // 停止流处理系统
  public stop(): void {
    if (!this.isRunning) return

    this.isRunning = false

    // 停止所有处理器
    this.processors.forEach((_, processorId) => {
      this.stopProcessor(processorId)
    })

    console.log("流处理系统已停止")
  }

  // 启动默认处理器
  private startDefaultProcessors(): void {
    // AI模型使用分析处理器
    this.createProcessor("ai-usage-analyzer", {
      inputTopics: ["ai-model-usage"],
      outputTopic: "ai-usage-analytics",
      processFunction: async (message) => {
        const usage = message.value as any
        return {
          key: `analytics-${usage.modelId}`,
          value: {
            modelId: usage.modelId,
            hourlyUsage: 1,
            totalTokens: usage.tokens?.total || 0,
            averageLatency: usage.latency || 0,
            timestamp: Date.now(),
          },
        }
      },
    })

    // 用户行为分析处理器
    this.createProcessor("user-behavior-analyzer", {
      inputTopics: ["user-events"],
      outputTopic: "user-analytics",
      processFunction: async (message) => {
        const event = message.value as any
        return {
          key: `user-${event.userId}`,
          value: {
            userId: event.userId,
            action: event.action,
            module: event.module,
            sessionId: event.sessionId,
            timestamp: Date.now(),
          },
        }
      },
    })

    // 系统性能监控处理器
    this.createProcessor("performance-monitor", {
      inputTopics: ["system-metrics"],
      outputTopic: "performance-alerts",
      processFunction: async (message) => {
        const metrics = message.value as any

        // 检查是否需要告警
        if (metrics.cpuUsage > 80 || metrics.memoryUsage > 85 || metrics.responseTime > 5000) {
          return {
            key: `alert-${metrics.service}`,
            value: {
              type: "performance-alert",
              service: metrics.service,
              metrics,
              severity: metrics.cpuUsage > 90 || metrics.memoryUsage > 95 ? "critical" : "warning",
              timestamp: Date.now(),
            },
          }
        }
        return null
      },
    })

    // 启动处理器
    setTimeout(() => {
      this.startProcessor("ai-usage-analyzer")
      this.startProcessor("user-behavior-analyzer")
      this.startProcessor("performance-monitor")
    }, 1000)
  }
}

// 类型定义
export interface TopicConfig {
  partitions: number
  replicationFactor: number
  retentionMs: number
}

export interface Topic {
  name: string
  config: TopicConfig
  partitions: Partition[]
  createdAt: number
  messageCount: number
  bytesCount: number
}

export interface Partition {
  id: number
  messages: MessageRecord[]
  offset: number
}

export interface StreamMessage {
  key?: string
  value: any
  headers?: Record<string, string>
}

export interface MessageRecord extends StreamMessage {
  topic?: string
  partition: number
  offset: number
  timestamp: number
  size: number
}

export interface MessageMetadata {
  topic: string
  partition: number
  offset: number
  timestamp: number
}

export interface ProducerConfig {
  batchSize?: number
  lingerMs?: number
  retries?: number
}

export interface Producer {
  id: string
  config: ProducerConfig
  isConnected: boolean
  messagesSent: number
  bytesSent: number
}

export interface ConsumerConfig {
  autoOffsetReset?: "earliest" | "latest"
  enableAutoCommit?: boolean
  autoCommitIntervalMs?: number
}

export interface Consumer {
  id: string
  groupId: string
  config: ConsumerConfig
  subscriptions: Set<string>
  isConnected: boolean
  messagesConsumed: number
  bytesConsumed: number
  lastCommittedOffsets: Map<string, number>
}

export interface ProcessorConfig {
  inputTopics: string[]
  outputTopic?: string
  processFunction: (message: MessageRecord) => Promise<StreamMessage | null>
}

export interface DataProcessor {
  id: string
  config: ProcessorConfig
  isRunning: boolean
  processedCount: number
  errorCount: number
  lastProcessedTime: number | null
}

export interface TopicStats {
  name: string
  messageCount: number
  bytesCount: number
  partitionCount: number
  partitionStats: Array<{
    id: number
    messageCount: number
    currentOffset: number
    size: number
  }>
  createdAt: number
}

export interface ConsumerStats {
  id: string
  groupId: string
  subscriptions: string[]
  messagesConsumed: number
  bytesConsumed: number
  isConnected: boolean
  lastCommittedOffsets: Record<string, number>
}

export interface ProcessorStats {
  id: string
  isRunning: boolean
  processedCount: number
  errorCount: number
  lastProcessedTime: number | null
  successRate: number
}

// 导出流处理器实例
export const streamProcessor = StreamProcessor.getInstance()
