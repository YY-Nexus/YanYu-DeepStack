/**
 * YYC³ 可视化编程核心引擎
 * 提供拖拽式编程的底层支持和代码生成能力
 */

export interface VisualNode {
  id: string
  type: string
  label: string
  category: 'ui' | 'logic' | 'data' | 'emotion' | 'ai'
  position: { x: number; y: number }
  size: { width: number; height: number }
  properties: Record<string, any>
  inputs: NodePort[]
  outputs: NodePort[]
  metadata: {
    description: string
    documentation: string
    examples: string[]
  }
}

export interface NodePort {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'emotion' | 'ai-response'
  required: boolean
  defaultValue?: any
}

export interface VisualEdge {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
  type: 'data' | 'event' | 'emotion' | 'ai-flow'
}

export interface VisualProject {
  id: string
  name: string
  description: string
  nodes: VisualNode[]
  edges: VisualEdge[]
  metadata: {
    version: string
    created: Date
    modified: Date
    author: string
    framework: 'react' | 'vue' | 'angular' | 'vanilla'
    emotionEnabled: boolean
    aiEnabled: boolean
  }
}

/**
 * 可视化编程引擎主类
 */
export class VisualProgrammingEngine {
  private project: VisualProject
  private nodeRegistry: Map<string, NodeDefinition> = new Map()
  private eventEmitter = new EventTarget()

  constructor(project?: VisualProject) {
    this.project = project || this.createEmptyProject()
    this.initializeBuiltinNodes()
  }

  // 项目管理
  createEmptyProject(): VisualProject {
    return {
      id: this.generateId(),
      name: 'Untitled Project',
      description: '',
      nodes: [],
      edges: [],
      metadata: {
        version: '1.0.0',
        created: new Date(),
        modified: new Date(),
        author: 'YYC³ User',
        framework: 'react',
        emotionEnabled: true,
        aiEnabled: true
      }
    }
  }

  loadProject(project: VisualProject): void {
    this.project = project
    this.emit('project-loaded', { project })
  }

  saveProject(): VisualProject {
    this.project.metadata.modified = new Date()
    this.emit('project-saved', { project: this.project })
    return this.project
  }

  // 节点管理
  addNode(nodeType: string, position: { x: number; y: number }): VisualNode {
    const definition = this.nodeRegistry.get(nodeType)
    if (!definition) {
      throw new Error(`Unknown node type: ${nodeType}`)
    }

    const node: VisualNode = {
      id: this.generateId(),
      type: nodeType,
      label: definition.label,
      category: definition.category,
      position,
      size: { width: 200, height: 100 },
      properties: { ...definition.defaultProperties },
      inputs: [...definition.inputs],
      outputs: [...definition.outputs],
      metadata: {
        description: definition.description,
        documentation: definition.documentation,
        examples: definition.examples
      }
    }

    this.project.nodes.push(node)
    this.emit('node-added', { node })
    return node
  }

  removeNode(nodeId: string): void {
    // 移除节点
    this.project.nodes = this.project.nodes.filter(n => n.id !== nodeId)
    
    // 移除相关连接
    this.project.edges = this.project.edges.filter(
      e => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId
    )
    
    this.emit('node-removed', { nodeId })
  }

  updateNodeProperties(nodeId: string, properties: Record<string, any>): void {
    const node = this.project.nodes.find(n => n.id === nodeId)
    if (node) {
      node.properties = { ...node.properties, ...properties }
      this.emit('node-updated', { node })
    }
  }

  // 连接管理
  addEdge(sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string): VisualEdge | null {
    // 验证连接的有效性
    if (!this.canConnect(sourceNodeId, sourcePortId, targetNodeId, targetPortId)) {
      return null
    }

    const edge: VisualEdge = {
      id: this.generateId(),
      sourceNodeId,
      sourcePortId,
      targetNodeId,
      targetPortId,
      type: this.inferEdgeType(sourceNodeId, sourcePortId, targetNodeId, targetPortId)
    }

    this.project.edges.push(edge)
    this.emit('edge-added', { edge })
    return edge
  }

  removeEdge(edgeId: string): void {
    this.project.edges = this.project.edges.filter(e => e.id !== edgeId)
    this.emit('edge-removed', { edgeId })
  }

  // 连接验证
  private canConnect(sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string): boolean {
    const sourceNode = this.project.nodes.find(n => n.id === sourceNodeId)
    const targetNode = this.project.nodes.find(n => n.id === targetNodeId)
    
    if (!sourceNode || !targetNode) return false

    const sourcePort = sourceNode.outputs.find(p => p.id === sourcePortId)
    const targetPort = targetNode.inputs.find(p => p.id === targetPortId)
    
    if (!sourcePort || !targetPort) return false

    // 检查类型兼容性
    return this.isTypeCompatible(sourcePort.type, targetPort.type)
  }

  private isTypeCompatible(sourceType: string, targetType: string): boolean {
    if (sourceType === targetType) return true
    
    // 特殊兼容性规则
    const compatibilityMap: Record<string, string[]> = {
      'string': ['object'],
      'number': ['string', 'object'],
      'boolean': ['string', 'object'],
      'emotion': ['object', 'ai-response'],
      'ai-response': ['object', 'string']
    }

    return compatibilityMap[sourceType]?.includes(targetType) || false
  }

  private inferEdgeType(sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string): VisualEdge['type'] {
    const sourceNode = this.project.nodes.find(n => n.id === sourceNodeId)
    const targetNode = this.project.nodes.find(n => n.id === targetNodeId)
    
    if (sourceNode?.category === 'emotion' || targetNode?.category === 'emotion') {
      return 'emotion'
    }
    
    if (sourceNode?.category === 'ai' || targetNode?.category === 'ai') {
      return 'ai-flow'
    }
    
    const sourcePort = sourceNode?.outputs.find(p => p.id === sourcePortId)
    if (sourcePort?.type === 'function') {
      return 'event'
    }
    
    return 'data'
  }

  // 代码生成
  generateCode(framework: 'react' | 'vue' | 'vanilla' = 'react'): string {
    switch (framework) {
      case 'react':
        return this.generateReactCode()
      case 'vue':
        return this.generateVueCode()
      case 'vanilla':
        return this.generateVanillaCode()
      default:
        throw new Error(`Unsupported framework: ${framework}`)
    }
  }

  private generateReactCode(): string {
    const imports = this.generateReactImports()
    const component = this.generateReactComponent()
    const exports = this.generateReactExports()

    return `${imports}\n\n${component}\n\n${exports}`
  }

  private generateReactImports(): string {
    const imports = new Set<string>()
    
    // React基础导入
    imports.add("import React, { useState, useEffect, useCallback } from 'react'")
    
    // 检查是否需要情感相关导入
    if (this.project.metadata.emotionEnabled) {
      imports.add("import { useYYC3EmotionDetection } from '@/hooks/use-emotion-detection'")
    }
    
    // 检查是否需要AI相关导入
    if (this.project.metadata.aiEnabled) {
      imports.add("import { useYYC3AI } from '@/hooks/use-ai'")
    }
    
    // 根据使用的节点类型添加导入
    for (const node of this.project.nodes) {
      const definition = this.nodeRegistry.get(node.type)
      if (definition?.reactImports) {
        definition.reactImports.forEach(imp => imports.add(imp))
      }
    }
    
    return Array.from(imports).join('\n')
  }

  private generateReactComponent(): string {
    const componentName = this.toPascalCase(this.project.name.replace(/\s+/g, ''))
    const hooks = this.generateReactHooks()
    const handlers = this.generateReactHandlers()
    const jsx = this.generateReactJSX()

    return `function ${componentName}() {
${hooks}

${handlers}

  return (
${jsx}
  )
}`
  }

  private generateReactHooks(): string {
    const hooks: string[] = []
    
    // 状态管理hooks
    const stateVariables = this.extractStateVariables()
    stateVariables.forEach(variable => {
      hooks.push(`  const [${variable.name}, set${this.toPascalCase(variable.name)}] = useState(${JSON.stringify(variable.defaultValue)})`)
    })
    
    // 情感检测hook
    if (this.project.metadata.emotionEnabled) {
      hooks.push(`  const { detectEmotion, currentEmotion } = useYYC3EmotionDetection()`)
    }
    
    // AI助手hook
    if (this.project.metadata.aiEnabled) {
      hooks.push(`  const { generateResponse, isLoading } = useYYC3AI()`)
    }

    return hooks.join('\n')
  }

  private generateReactHandlers(): string {
    const handlers: string[] = []
    
    // 为每个事件节点生成处理函数
    const eventNodes = this.project.nodes.filter(node => node.category === 'logic')
    eventNodes.forEach(node => {
      const handlerName = `handle${this.toPascalCase(node.label)}`
      const handlerBody = this.generateHandlerBody(node)
      
      handlers.push(`  const ${handlerName} = useCallback(${handlerBody}, [])`)
    })

    return handlers.join('\n\n')
  }

  private generateReactJSX(): string {
    // 根据节点生成JSX结构
    const uiNodes = this.project.nodes
      .filter(node => node.category === 'ui')
      .sort((a, b) => a.position.y - b.position.y) // 按Y轴位置排序

    const jsx = uiNodes.map(node => {
      const definition = this.nodeRegistry.get(node.type)
      if (definition?.generateJSX) {
        return definition.generateJSX(node, this.project)
      }
      return `    <div /* ${node.label} */></div>`
    }).join('\n')

    return `    <div className="visual-app">\n${jsx}\n    </div>`
  }

  private generateReactExports(): string {
    const componentName = this.toPascalCase(this.project.name.replace(/\s+/g, ''))
    return `export default ${componentName}`
  }

  private generateVueCode(): string {
    // Vue代码生成实现
    return `<!-- Generated Vue component -->\n<template>\n  <div>Vue component placeholder</div>\n</template>`
  }

  private generateVanillaCode(): string {
    // 原生JavaScript代码生成实现
    return `// Generated vanilla JavaScript code
console.log('Vanilla code placeholder');`
  }

  // 工具方法
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private toPascalCase(str: string): string {
    return str.replace(/(?:^|[-_])(\w)/g, (_, char) => char.toUpperCase())
  }

  private extractStateVariables(): Array<{name: string, defaultValue: any}> {
    const variables: Array<{name: string, defaultValue: any}> = []
    
    // 从节点属性中提取状态变量
    this.project.nodes.forEach(node => {
      Object.entries(node.properties).forEach(([key, value]) => {
        if (key.startsWith('state_')) {
          variables.push({
            name: key.replace('state_', ''),
            defaultValue: value
          })
        }
      })
    })
    
    return variables
  }

  private generateHandlerBody(node: VisualNode): string {
    // 根据节点类型和连接生成处理函数体
    const connectedEdges = this.project.edges.filter(e => e.sourceNodeId === node.id)
    
    let body = '(event) => {\n'
    
    // 生成处理逻辑
    connectedEdges.forEach(edge => {
      const targetNode = this.project.nodes.find(n => n.id === edge.targetNodeId)
      if (targetNode) {
        body += `    // Handle ${targetNode.label}\n`
      }
    })
    
    body += '  }'
    
    return body
  }

  // 事件系统
  private emit(eventType: string, data: any): void {
    this.eventEmitter.dispatchEvent(new CustomEvent(eventType, { detail: data }))
  }

  on(eventType: string, callback: (event: CustomEvent) => void): void {
    this.eventEmitter.addEventListener(eventType, callback as EventListener)
  }

  off(eventType: string, callback: (event: CustomEvent) => void): void {
    this.eventEmitter.removeEventListener(eventType, callback as EventListener)
  }

  // 注册内置节点
  private initializeBuiltinNodes(): void {
    // UI组件节点
    this.registerNode('button', {
      label: '按钮',
      category: 'ui',
      description: '可点击的按钮组件',
      documentation: '创建一个可交互的按钮',
      examples: ['登录按钮', '提交按钮', '取消按钮'],
      inputs: [
        { id: 'text', name: '按钮文本', type: 'string', required: true, defaultValue: '点击我' }
      ],
      outputs: [
        { id: 'click', name: '点击事件', type: 'function', required: false }
      ],
      defaultProperties: {
        text: '点击我',
        variant: 'primary',
        size: 'medium'
      },
      reactImports: ["import { Button } from '@/components/ui/button'"],
      generateJSX: (node, project) => {
        const clickHandler = this.findConnectedHandler(node.id, 'click', project)
        return `      <Button 
        onClick={${clickHandler || '() => {}'}}
        variant="${node.properties.variant}"
        size="${node.properties.size}"
      >
        ${node.properties.text}
      </Button>`
      }
    })

    // 输入框节点
    this.registerNode('input', {
      label: '输入框',
      category: 'ui',
      description: '文本输入组件',
      documentation: '创建一个文本输入框',
      examples: ['用户名输入', '密码输入', '搜索框'],
      inputs: [
        { id: 'placeholder', name: '占位符', type: 'string', required: false, defaultValue: '请输入...' },
        { id: 'value', name: '值', type: 'string', required: false, defaultValue: '' }
      ],
      outputs: [
        { id: 'change', name: '值改变', type: 'function', required: false },
        { id: 'value', name: '当前值', type: 'string', required: false }
      ],
      defaultProperties: {
        placeholder: '请输入...',
        type: 'text'
      },
      reactImports: ["import { Input } from '@/components/ui/input'"],
      generateJSX: (node, project) => {
        return `      <Input 
        placeholder="${node.properties.placeholder}"
        type="${node.properties.type}"
      />`
      }
    })

    // 情感检测节点
    this.registerNode('emotion-detector', {
      label: '情感检测',
      category: 'emotion',
      description: '检测用户情感状态',
      documentation: '分析文本或语音中的情感信息',
      examples: ['文本情感分析', '语音情感识别'],
      inputs: [
        { id: 'text', name: '输入文本', type: 'string', required: false },
        { id: 'audio', name: '音频输入', type: 'object', required: false }
      ],
      outputs: [
        { id: 'emotion', name: '情感结果', type: 'emotion', required: false },
        { id: 'confidence', name: '置信度', type: 'number', required: false }
      ],
      defaultProperties: {
        mode: 'text',
        sensitivity: 0.7
      },
      reactImports: ["import { EmotionDetector } from '@/components/emotion/detector'"],
      generateJSX: (node, project) => {
        return `      <EmotionDetector 
        mode="${node.properties.mode}"
        sensitivity={${node.properties.sensitivity}}
      />`
      }
    })

    // AI助手节点
    this.registerNode('ai-assistant', {
      label: 'AI助手',
      category: 'ai',
      description: 'AI智能助手组件',
      documentation: '提供AI对话和智能响应功能',
      examples: ['智能客服', '学习助手', '代码助手'],
      inputs: [
        { id: 'prompt', name: '提示词', type: 'string', required: true },
        { id: 'context', name: '上下文', type: 'object', required: false }
      ],
      outputs: [
        { id: 'response', name: 'AI响应', type: 'ai-response', required: false },
        { id: 'loading', name: '加载状态', type: 'boolean', required: false }
      ],
      defaultProperties: {
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.7
      },
      reactImports: ["import { AIAssistant } from '@/components/ai/assistant'"],
      generateJSX: (node, project) => {
        return `      <AIAssistant 
        model="${node.properties.model}"
        maxTokens={${node.properties.maxTokens}}
        temperature={${node.properties.temperature}}
      />`
      }
    })
  }

  registerNode(type: string, definition: NodeDefinition): void {
    this.nodeRegistry.set(type, definition)
  }

  getRegisteredNodes(): Map<string, NodeDefinition> {
    return new Map(this.nodeRegistry)
  }

  private findConnectedHandler(nodeId: string, portId: string, project: VisualProject): string | null {
    const edge = project.edges.find(e => e.sourceNodeId === nodeId && e.sourcePortId === portId)
    if (edge) {
      const targetNode = project.nodes.find(n => n.id === edge.targetNodeId)
      if (targetNode) {
        return `handle${this.toPascalCase(targetNode.label)}`
      }
    }
    return null
  }
}

// 节点定义接口
export interface NodeDefinition {
  label: string
  category: VisualNode['category']
  description: string
  documentation: string
  examples: string[]
  inputs: NodePort[]
  outputs: NodePort[]
  defaultProperties: Record<string, any>
  reactImports?: string[]
  generateJSX?: (node: VisualNode, project: VisualProject) => string
}

// 导出引擎实例
export const visualEngine = new VisualProgrammingEngine()