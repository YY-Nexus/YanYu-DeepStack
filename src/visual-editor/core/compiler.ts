/**
 * YYC³ 可视化编程代码编译器
 * 负责将可视化节点编译成可执行的代码
 */

import * as Babel from '@babel/standalone'
import { VisualProject, VisualNode, VisualEdge } from './engine'

export interface CompileOptions {
  framework: 'react' | 'vue' | 'vanilla'
  typescript: boolean
  minify: boolean
  sourceMaps: boolean
  optimization: 'none' | 'basic' | 'advanced'
}

export interface CompileResult {
  code: string
  sourceMap?: string
  dependencies: string[]
  warnings: CompileWarning[]
  errors: CompileError[]
  metadata: CompileMetadata
}

export interface CompileWarning {
  type: string
  message: string
  nodeId?: string
  severity: 'low' | 'medium' | 'high'
}

export interface CompileError {
  type: string
  message: string
  nodeId?: string
  line?: number
  column?: number
}

export interface CompileMetadata {
  compileTime: number
  nodeCount: number
  edgeCount: number
  complexity: number
  performance: PerformanceMetrics
}

export interface PerformanceMetrics {
  estimatedBundleSize: number
  renderComplexity: number
  memoryUsage: number
  executionTime: number
}

/**
 * 代码编译器类
 */
export class CodeCompiler {
  private project: VisualProject
  private options: CompileOptions

  constructor(project: VisualProject, options: Partial<CompileOptions> = {}) {
    this.project = project
    this.options = {
      framework: 'react',
      typescript: false,
      minify: false,
      sourceMaps: false,
      optimization: 'basic',
      ...options
    }
  }

  /**
   * 编译项目为可执行代码
   */
  async compile(): Promise<CompileResult> {
    const startTime = Date.now()
    const warnings: CompileWarning[] = []
    const errors: CompileError[] = []

    try {
      // 1. 项目验证
      await this.validateProject(warnings, errors)
      
      if (errors.length > 0) {
        return this.createErrorResult(errors, warnings, startTime)
      }

      // 2. 依赖分析
      const dependencies = this.analyzeDependencies()

      // 3. 代码生成
      const rawCode = this.generateCode()

      // 4. 代码转换和优化
      const transformedCode = await this.transformCode(rawCode, warnings, errors)

      // 5. 性能分析
      const performance = this.analyzePerformance()

      // 6. 创建编译结果
      const compileTime = Date.now() - startTime
      return {
        code: transformedCode,
        dependencies,
        warnings,
        errors,
        metadata: {
          compileTime,
          nodeCount: this.project.nodes.length,
          edgeCount: this.project.edges.length,
          complexity: this.calculateComplexity(),
          performance
        }
      }

    } catch (error) {
      errors.push({
        type: 'COMPILATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown compilation error'
      })
      return this.createErrorResult(errors, warnings, startTime)
    }
  }

  /**
   * 项目验证
   */
  private async validateProject(warnings: CompileWarning[], errors: CompileError[]): Promise<void> {
    // 验证节点连接
    this.validateNodeConnections(warnings, errors)
    
    // 验证循环依赖
    this.validateCyclicDependencies(warnings, errors)
    
    // 验证数据流
    this.validateDataFlow(warnings, errors)
    
    // 验证组件兼容性
    this.validateComponentCompatibility(warnings, errors)
  }

  private validateNodeConnections(warnings: CompileWarning[], errors: CompileError[]): void {
    for (const edge of this.project.edges) {
      const sourceNode = this.project.nodes.find(n => n.id === edge.sourceNodeId)
      const targetNode = this.project.nodes.find(n => n.id === edge.targetNodeId)

      if (!sourceNode || !targetNode) {
        errors.push({
          type: 'INVALID_CONNECTION',
          message: 'Connection references non-existent node',
          nodeId: edge.sourceNodeId
        })
        continue
      }

      const sourcePort = sourceNode.outputs.find(p => p.id === edge.sourcePortId)
      const targetPort = targetNode.inputs.find(p => p.id === edge.targetPortId)

      if (!sourcePort || !targetPort) {
        errors.push({
          type: 'INVALID_PORT',
          message: 'Connection references non-existent port',
          nodeId: sourceNode.id
        })
        continue
      }

      // 类型兼容性检查
      if (!this.isTypeCompatible(sourcePort.type, targetPort.type)) {
        warnings.push({
          type: 'TYPE_MISMATCH',
          message: `Type mismatch: ${sourcePort.type} -> ${targetPort.type}`,
          nodeId: sourceNode.id,
          severity: 'medium'
        })
      }
    }
  }

  private validateCyclicDependencies(warnings: CompileWarning[], errors: CompileError[]): void {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true // 发现循环
      }
      if (visited.has(nodeId)) {
        return false
      }

      visited.add(nodeId)
      recursionStack.add(nodeId)

      // 检查所有输出连接
      const outgoingEdges = this.project.edges.filter(e => e.sourceNodeId === nodeId)
      for (const edge of outgoingEdges) {
        if (dfs(edge.targetNodeId)) {
          errors.push({
            type: 'CYCLIC_DEPENDENCY',
            message: 'Cyclic dependency detected in node graph',
            nodeId
          })
          return true
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    for (const node of this.project.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id)
      }
    }
  }

  private validateDataFlow(warnings: CompileWarning[], errors: CompileError[]): void {
    // 检查必需输入是否已连接
    for (const node of this.project.nodes) {
      for (const input of node.inputs) {
        if (input.required) {
          const hasConnection = this.project.edges.some(
            e => e.targetNodeId === node.id && e.targetPortId === input.id
          )
          
          if (!hasConnection && input.defaultValue === undefined) {
            warnings.push({
              type: 'MISSING_REQUIRED_INPUT',
              message: `Required input '${input.name}' is not connected and has no default value`,
              nodeId: node.id,
              severity: 'high'
            })
          }
        }
      }
    }

    // 检查未使用的输出
    for (const node of this.project.nodes) {
      for (const output of node.outputs) {
        const hasConnection = this.project.edges.some(
          e => e.sourceNodeId === node.id && e.sourcePortId === output.id
        )
        
        if (!hasConnection) {
          warnings.push({
            type: 'UNUSED_OUTPUT',
            message: `Output '${output.name}' is not connected`,
            nodeId: node.id,
            severity: 'low'
          })
        }
      }
    }
  }

  private validateComponentCompatibility(warnings: CompileWarning[], errors: CompileError[]): void {
    const framework = this.options.framework
    
    for (const node of this.project.nodes) {
      // 检查框架兼容性
      if (node.type.includes('react') && framework !== 'react') {
        warnings.push({
          type: 'FRAMEWORK_MISMATCH',
          message: `React-specific component used in ${framework} project`,
          nodeId: node.id,
          severity: 'medium'
        })
      }
      
      // 检查功能兼容性
      if (node.category === 'emotion' && !this.project.metadata.emotionEnabled) {
        warnings.push({
          type: 'FEATURE_DISABLED',
          message: 'Emotion component used but emotion feature is disabled',
          nodeId: node.id,
          severity: 'medium'
        })
      }
      
      if (node.category === 'ai' && !this.project.metadata.aiEnabled) {
        warnings.push({
          type: 'FEATURE_DISABLED',
          message: 'AI component used but AI feature is disabled',
          nodeId: node.id,
          severity: 'medium'
        })
      }
    }
  }

  /**
   * 依赖分析
   */
  private analyzeDependencies(): string[] {
    const dependencies = new Set<string>()
    
    // 基础框架依赖
    switch (this.options.framework) {
      case 'react':
        dependencies.add('react')
        dependencies.add('react-dom')
        break
      case 'vue':
        dependencies.add('vue')
        break
    }

    // 分析节点依赖
    for (const node of this.project.nodes) {
      switch (node.category) {
        case 'ui':
          dependencies.add('@/components/ui')
          break
        case 'emotion':
          dependencies.add('@yyc3/emotion-sound-platform')
          dependencies.add('@/hooks/use-emotion-detection')
          break
        case 'ai':
          dependencies.add('@/hooks/use-ai')
          dependencies.add('@/services/ai')
          break
      }

      // 特殊节点依赖
      if (node.type === 'chart') {
        dependencies.add('recharts')
      }
      if (node.type === 'map') {
        dependencies.add('react-leaflet')
      }
    }

    return Array.from(dependencies)
  }

  /**
   * 代码生成
   */
  private generateCode(): string {
    switch (this.options.framework) {
      case 'react':
        return this.generateReactCode()
      case 'vue':
        return this.generateVueCode()
      case 'vanilla':
        return this.generateVanillaCode()
      default:
        throw new Error(`Unsupported framework: ${this.options.framework}`)
    }
  }

  private generateReactCode(): string {
    const imports = this.generateReactImports()
    const interfaces = this.generateTypeDefinitions()
    const component = this.generateReactComponent()
    const styles = this.generateStyles()
    
    return [imports, interfaces, component, styles].filter(Boolean).join('\n\n')
  }

  private generateReactImports(): string {
    const imports: string[] = []
    
    // React核心导入
    imports.push("import React, { useState, useEffect, useCallback, useMemo } from 'react'")
    
    // UI组件导入
    const uiComponents = new Set<string>()
    this.project.nodes.filter(n => n.category === 'ui').forEach(node => {
      switch (node.type) {
        case 'button':
          uiComponents.add('Button')
          break
        case 'input':
          uiComponents.add('Input')
          break
        case 'card':
          uiComponents.add('Card')
          break
      }
    })
    
    if (uiComponents.size > 0) {
      imports.push(`import { ${Array.from(uiComponents).join(', ')} } from '@/components/ui'`)
    }

    // 功能导入
    if (this.project.metadata.emotionEnabled) {
      imports.push("import { useYYC3EmotionDetection } from '@/hooks/use-emotion-detection'")
    }
    
    if (this.project.metadata.aiEnabled) {
      imports.push("import { useYYC3AI } from '@/hooks/use-ai'")
    }

    return imports.join('\n')
  }

  private generateTypeDefinitions(): string {
    if (!this.options.typescript) return ''

    const interfaces: string[] = []
    
    // 组件Props接口
    const componentName = this.getComponentName()
    interfaces.push(`interface ${componentName}Props {
  className?: string
  onInit?: () => void
}`)

    // 状态接口
    const stateFields = this.extractStateFields()
    if (stateFields.length > 0) {
      interfaces.push(`interface AppState {
${stateFields.map(field => `  ${field.name}: ${field.type}`).join('\n')}
}`)
    }

    return interfaces.join('\n\n')
  }

  private generateReactComponent(): string {
    const componentName = this.getComponentName()
    const propsType = this.options.typescript ? `${componentName}Props` : ''
    
    const hooks = this.generateReactHooks()
    const effects = this.generateReactEffects()
    const handlers = this.generateReactHandlers()
    const jsx = this.generateReactJSX()

    return `function ${componentName}(${propsType ? `props: ${propsType}` : ''}) {
${hooks}

${effects}

${handlers}

  return (
${jsx}
  )
}`
  }

  private generateReactHooks(): string {
    const hooks: string[] = []
    
    // 状态管理
    const stateFields = this.extractStateFields()
    stateFields.forEach(field => {
      hooks.push(`  const [${field.name}, set${this.toPascalCase(field.name)}] = useState${this.options.typescript ? `<${field.type}>` : ''}(${JSON.stringify(field.defaultValue)})`)
    })

    // 功能hooks
    if (this.project.metadata.emotionEnabled) {
      hooks.push('  const { detectEmotion, currentEmotion } = useYYC3EmotionDetection()')
    }
    
    if (this.project.metadata.aiEnabled) {
      hooks.push('  const { generateResponse, isLoading } = useYYC3AI()')
    }

    return hooks.join('\n')
  }

  private generateReactEffects(): string {
    const effects: string[] = []
    
    // 初始化效果
    effects.push(`  useEffect(() => {
    // Component initialization
  }, [])`)

    // 情感检测效果
    if (this.project.metadata.emotionEnabled) {
      effects.push(`  useEffect(() => {
    if (currentEmotion) {
      // Handle emotion changes
    }
  }, [currentEmotion])`)
    }

    return effects.join('\n\n')
  }

  private generateReactHandlers(): string {
    const handlers: string[] = []
    
    // 为逻辑节点生成处理函数
    const logicNodes = this.project.nodes.filter(n => n.category === 'logic')
    logicNodes.forEach(node => {
      const handlerName = `handle${this.toPascalCase(node.label)}`
      handlers.push(`  const ${handlerName} = useCallback((${this.generateHandlerParams(node)}) => {
    ${this.generateHandlerBody(node)}
  }, [])`)
    })

    return handlers.join('\n\n')
  }

  private generateReactJSX(): string {
    // 按位置排序UI节点
    const uiNodes = this.project.nodes
      .filter(n => n.category === 'ui')
      .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)

    const jsx = uiNodes.map(node => this.generateNodeJSX(node)).join('\n')

    return `    <div className="visual-app">
${jsx}
    </div>`
  }

  private generateNodeJSX(node: VisualNode): string {
    switch (node.type) {
      case 'button':
        return `      <Button
        onClick={${this.findEventHandler(node, 'click') || '() => {}'}}
        variant="${node.properties.variant || 'default'}"
        size="${node.properties.size || 'medium'}"
        className="mb-4"
      >
        ${node.properties.text || '按钮'}
      </Button>`
      
      case 'input':
        return `      <Input
        placeholder="${node.properties.placeholder || '请输入...'}"
        value={${this.findStateBinding(node, 'value') || "''"}}
        className="mb-4"
      />`
      
      case 'card':
        return `      <Card className="mb-4">
        <div className="p-4">
          ${node.properties.content || '卡片内容'}
        </div>
      </Card>`
      
      default:
        return `      <div /* ${node.label} */ className="mb-4">
        {/* TODO: Implement ${node.type} component */}
      </div>`
    }
  }

  private generateVueCode(): string {
    return `<template>
  <div class="visual-app">
    <!-- Generated Vue component -->
  </div>
</template>

<script>
export default {
  name: '${this.getComponentName()}',
  data() {
    return {
      // Component data
    }
  },
  mounted() {
    // Component initialization
  }
}
</script>

<style scoped>
.visual-app {
  padding: 1rem;
}
</style>`
  }

  private generateVanillaCode(): string {
    return `// Generated vanilla JavaScript
(function() {
  'use strict';
  
  // Component initialization
  function init() {
  }
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();`
  }

  private generateStyles(): string {
    return `/* Generated styles */
.visual-app {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.visual-app > * + * {
  margin-top: 1rem;
}`
  }

  /**
   * 代码转换和优化
   */
  private async transformCode(code: string, warnings: CompileWarning[], errors: CompileError[]): Promise<string> {
    try {
      let transformedCode = code

      // Babel转换
      if (this.options.framework === 'react') {
        const result = Babel.transform(code, {
          presets: [
            '@babel/preset-react',
            ...(this.options.typescript ? ['@babel/preset-typescript'] : [])
          ],
          plugins: [
            ...(this.options.optimization !== 'none' ? ['@babel/plugin-transform-runtime'] : [])
          ]
        })
        
        if (result.code) {
          transformedCode = result.code
        }
      }

      // 代码优化
      if (this.options.optimization === 'advanced') {
        transformedCode = this.optimizeCode(transformedCode)
      }

      // 代码压缩
      if (this.options.minify) {
        transformedCode = this.minifyCode(transformedCode)
      }

      return transformedCode

    } catch (error) {
      errors.push({
        type: 'TRANSFORM_ERROR',
        message: error instanceof Error ? error.message : 'Code transformation failed'
      })
      return code // 返回原始代码
    }
  }

  private optimizeCode(code: string): string {
    // 基础代码优化
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
      .replace(/\/\/.*$/gm, '') // 移除行注释
      .replace(/\s+/g, ' ') // 压缩空白字符
      .trim()
  }

  private minifyCode(code: string): string {
    // 简单的代码压缩
    return code
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*=\s*/g, '=')
      .trim()
  }

  /**
   * 性能分析
   */
  private analyzePerformance(): PerformanceMetrics {
    const nodeCount = this.project.nodes.length
    const edgeCount = this.project.edges.length
    
    // 估算包大小 (KB)
    const estimatedBundleSize = this.estimateBundleSize()
    
    // 计算渲染复杂度
    const renderComplexity = this.calculateRenderComplexity()
    
    // 估算内存使用 (MB)
    const memoryUsage = (nodeCount * 0.1) + (edgeCount * 0.05)
    
    // 估算执行时间 (ms)
    const executionTime = Math.max(10, nodeCount * 2 + edgeCount * 1)

    return {
      estimatedBundleSize,
      renderComplexity,
      memoryUsage,
      executionTime
    }
  }

  private estimateBundleSize(): number {
    let size = 50 // 基础大小 (KB)
    
    // 根据节点类型估算大小
    for (const node of this.project.nodes) {
      switch (node.category) {
        case 'ui':
          size += 5
          break
        case 'emotion':
          size += 20
          break
        case 'ai':
          size += 30
          break
        case 'logic':
          size += 2
          break
        case 'data':
          size += 3
          break
      }
    }

    return size
  }

  private calculateRenderComplexity(): number {
    let complexity = 1
    
    // UI节点增加复杂度
    const uiNodes = this.project.nodes.filter(n => n.category === 'ui')
    complexity += uiNodes.length * 0.5
    
    // 连接增加复杂度
    complexity += this.project.edges.length * 0.2
    
    // 嵌套层级增加复杂度
    const maxDepth = this.calculateMaxDepth()
    complexity += maxDepth * 0.3

    return Math.round(complexity * 10) / 10
  }

  private calculateMaxDepth(): number {
    // 计算节点图的最大深度
    const visited = new Set<string>()
    let maxDepth = 0

    const dfs = (nodeId: string, depth: number): void => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      
      maxDepth = Math.max(maxDepth, depth)
      
      const outgoingEdges = this.project.edges.filter(e => e.sourceNodeId === nodeId)
      for (const edge of outgoingEdges) {
        dfs(edge.targetNodeId, depth + 1)
      }
    }

    // 从没有输入连接的节点开始
    const rootNodes = this.project.nodes.filter(node => 
      !this.project.edges.some(edge => edge.targetNodeId === node.id)
    )

    for (const rootNode of rootNodes) {
      dfs(rootNode.id, 1)
    }

    return maxDepth
  }

  private calculateComplexity(): number {
    // McCabe圈复杂度的简化版本
    let complexity = 1 // 基础复杂度
    
    // 条件节点增加复杂度
    const logicNodes = this.project.nodes.filter(n => n.category === 'logic')
    complexity += logicNodes.length
    
    // 循环增加复杂度
    const loops = this.detectLoops()
    complexity += loops * 2

    return complexity
  }

  private detectLoops(): number {
    // 简单的循环检测
    let loopCount = 0
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        loopCount++
        return true
      }
      if (visited.has(nodeId)) return false

      visited.add(nodeId)
      recursionStack.add(nodeId)

      const outgoingEdges = this.project.edges.filter(e => e.sourceNodeId === nodeId)
      for (const edge of outgoingEdges) {
        dfs(edge.targetNodeId)
      }

      recursionStack.delete(nodeId)
      return false
    }

    for (const node of this.project.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id)
      }
    }

    return loopCount
  }

  // 工具方法
  private createErrorResult(errors: CompileError[], warnings: CompileWarning[], startTime: number): CompileResult {
    return {
      code: '',
      dependencies: [],
      warnings,
      errors,
      metadata: {
        compileTime: Date.now() - startTime,
        nodeCount: this.project.nodes.length,
        edgeCount: this.project.edges.length,
        complexity: 0,
        performance: {
          estimatedBundleSize: 0,
          renderComplexity: 0,
          memoryUsage: 0,
          executionTime: 0
        }
      }
    }
  }

  private isTypeCompatible(sourceType: string, targetType: string): boolean {
    if (sourceType === targetType) return true
    
    const compatibilityRules: Record<string, string[]> = {
      'string': ['object', 'any'],
      'number': ['string', 'object', 'any'],
      'boolean': ['string', 'object', 'any'],
      'object': ['any'],
      'array': ['object', 'any'],
      'function': ['any'],
      'emotion': ['object', 'any'],
      'ai-response': ['object', 'string', 'any']
    }

    return compatibilityRules[sourceType]?.includes(targetType) || false
  }

  private getComponentName(): string {
    return this.toPascalCase(this.project.name.replace(/[^\w\s]/g, '').replace(/\s+/g, ' '))
  }

  private toPascalCase(str: string): string {
    return str.replace(/(?:^|[\s-_])(\w)/g, (_, char) => char.toUpperCase())
  }

  private extractStateFields(): Array<{name: string, type: string, defaultValue: any}> {
    const fields: Array<{name: string, type: string, defaultValue: any}> = []
    
    for (const node of this.project.nodes) {
      Object.entries(node.properties).forEach(([key, value]) => {
        if (key.startsWith('state_')) {
          const fieldName = key.replace('state_', '')
          fields.push({
            name: fieldName,
            type: typeof value,
            defaultValue: value
          })
        }
      })
    }
    
    return fields
  }

  private generateHandlerParams(node: VisualNode): string {
    const inputEdges = this.project.edges.filter(e => e.targetNodeId === node.id)
    if (inputEdges.length === 0) return 'event'
    
    const params = inputEdges.map(edge => {
      const sourceNode = this.project.nodes.find(n => n.id === edge.sourceNodeId)
      const sourcePort = sourceNode?.outputs.find(p => p.id === edge.sourcePortId)
      return sourcePort ? `${sourcePort.name}: ${sourcePort.type}` : 'data'
    })
    
    return params.join(', ')
  }

  private generateHandlerBody(node: VisualNode): string {
    const outputEdges = this.project.edges.filter(e => e.sourceNodeId === node.id)
    
    let body = '// Handler implementation\n'
    
    if (outputEdges.length > 0) {
      body += '\n    // Trigger connected outputs\n'
      outputEdges.forEach(edge => {
        const targetNode = this.project.nodes.find(n => n.id === edge.targetNodeId)
        if (targetNode) {
          body += `    // -> ${targetNode.label}\n`
        }
      })
    }
    
    return body
  }

  private findEventHandler(node: VisualNode, eventType: string): string | null {
    const edge = this.project.edges.find(e => 
      e.sourceNodeId === node.id && e.sourcePortId === eventType
    )
    
    if (edge) {
      const targetNode = this.project.nodes.find(n => n.id === edge.targetNodeId)
      if (targetNode) {
        return `handle${this.toPascalCase(targetNode.label)}`
      }
    }
    
    return null
  }

  private findStateBinding(node: VisualNode, property: string): string | null {
    const edge = this.project.edges.find(e => 
      e.targetNodeId === node.id && e.targetPortId === property
    )
    
    if (edge) {
      const sourceNode = this.project.nodes.find(n => n.id === edge.sourceNodeId)
      if (sourceNode) {
        return this.toCamelCase(sourceNode.label)
      }
    }
    
    return null
  }

  private findChangeHandler(node: VisualNode): string | null {
    const edge = this.project.edges.find(e => 
      e.sourceNodeId === node.id && e.sourcePortId === 'change'
    )
    
    if (edge) {
      const targetNode = this.project.nodes.find(n => n.id === edge.targetNodeId)
      if (targetNode) {
        return `handle${this.toPascalCase(targetNode.label)}`
      }
    }
    
    return null
  }

  private toCamelCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    }).replace(/\s+/g, '')
  }
}