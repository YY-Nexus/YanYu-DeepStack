import { aiService } from '../lib/ai-service'
import { templateManager } from '../lib/templates/template-manager'
import { distributedTracing } from '../lib/microservices/distributed-tracing'
import { edgeComputingManager } from '../lib/edge/edge-computing-manager'
import { enhancedOllamaService } from '../lib/ai/enhanced-ollama-service'

describe('AIService', () => {
  it('getCodeCompletion returns completions', async () => {
    const res = await aiService.getCodeCompletion('let a = 1;', 'js', 10)
    expect(Array.isArray(res)).toBe(true)
  })
  it('getCodeSuggestions returns suggestions', async () => {
    const res = await aiService.getCodeSuggestions('let a = 1;', 'js')
    expect(Array.isArray(res)).toBe(true)
  })
  it('analyzeCodeQuality returns report', async () => {
    const res = await aiService.analyzeCodeQuality('let a = 1;', 'js')
    expect(res).toHaveProperty('overallScore')
  })
  it('generateCodeFromNaturalLanguage returns code', async () => {
    const res = await aiService.generateCodeFromNaturalLanguage('生成一个加法函数', 'js')
    expect(res).toHaveProperty('code')
  })
  it('detectAndFixErrors returns fixes', async () => {
    const res = await aiService.detectAndFixErrors('let a = 1;', 'js')
    expect(Array.isArray(res)).toBe(true)
  })
})

describe('TemplateManager', () => {
  it('getAllTemplates returns templates', () => {
    const all = templateManager.getAllTemplates()
    expect(Array.isArray(all)).toBe(true)
    expect(all.length).toBeGreaterThan(0)
  })
  it('getTemplatesByCategory returns correct', () => {
    const arr = templateManager.getTemplatesByCategory('frontend')
    expect(Array.isArray(arr)).toBe(true)
  })
  it('searchTemplates returns match', () => {
    const arr = templateManager.searchTemplates('next')
    expect(Array.isArray(arr)).toBe(true)
  })
  it('getTemplateStats returns stats', () => {
    const stats = templateManager.getTemplateStats()
    expect(stats).toHaveProperty('totalTemplates')
  })
})

describe('DistributedTracing', () => {
  it('startTrace and finishTrace', () => {
    const trace = distributedTracing.startTrace('test-op')
    expect(trace).toHaveProperty('traceId')
    distributedTracing.finishTrace(trace.traceId)
  })
  it('getTracingStats returns stats', () => {
    const stats = distributedTracing.getTracingStats()
    expect(stats).toHaveProperty('activeTraces')
  })
})

describe('EdgeComputingManager', () => {
  it('getEdgeNodes returns nodes', () => {
    const nodes = edgeComputingManager.getEdgeNodes()
    expect(Array.isArray(nodes)).toBe(true)
  })
  it('getEdgeNetworkStats returns stats', () => {
    const stats = edgeComputingManager.getEdgeNetworkStats()
    expect(stats).toHaveProperty('totalNodes')
  })
})

describe('EnhancedOllamaService', () => {
  it('getAllModels returns array', () => {
    const arr = enhancedOllamaService.getAllModels()
    expect(Array.isArray(arr)).toBe(true)
  })
  it('getRecommendedModels returns array', () => {
    const arr = enhancedOllamaService.getRecommendedModels()
    expect(Array.isArray(arr)).toBe(true)
  })
  it('getModelStatistics returns stats', () => {
    const stats = enhancedOllamaService.getModelStatistics()
    expect(stats).toHaveProperty('total')
  })
  it('getActiveDownloads returns array', () => {
    const arr = enhancedOllamaService.getActiveDownloads()
    expect(Array.isArray(arr)).toBe(true)
  })
  it('getDownloadQueue returns array', () => {
    const arr = enhancedOllamaService.getDownloadQueue()
    expect(Array.isArray(arr)).toBe(true)
  })
  it('destroy does not throw', () => {
    expect(() => enhancedOllamaService.destroy()).not.toThrow()
  })
})
