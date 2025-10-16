import { POST as codeAnalysisPOST } from '../app/api/code-analysis/route'
import { POST as configCheckPOST } from '../app/api/config/check/route'

// Mock NextRequest
class MockRequest {
  constructor(private body: any) {}
  async json() { return this.body }
}

describe('API 路由测试', () => {
  describe('code-analysis/route.ts', () => {
    it('参数缺失应返回 400', async () => {
      const req = new MockRequest({ code: '', language: '' })
      const res: any = await codeAnalysisPOST(req as any)
      expect(res.status).toBe(400)
    })
    it('正常分析返回 success', async () => {
      const req = new MockRequest({ code: 'function foo(){}', language: 'js' })
      const res: any = await codeAnalysisPOST(req as any)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toBeDefined()
    })
    it('异常处理', async () => {
      // 传入无法被 split 的对象，触发 catch
      const req = { json: async () => { throw new Error('test') } }
      const res: any = await codeAnalysisPOST(req as any)
      expect(res.status).toBe(500)
    })
  })

  describe('config/check/route.ts', () => {
    it('未知配置项应返回 400', async () => {
      const req = new MockRequest({ key: 'UNKNOWN_KEY' })
      const res: any = await configCheckPOST(req as any)
      expect(res.status).toBe(400)
    })
    it('正常配置项返回', async () => {
      process.env.OPENAI_API_KEY = 'sk-test';
      const req = new MockRequest({ key: 'OPENAI_API_KEY' })
      const res: any = await configCheckPOST(req as any)
      const json = await res.json()
      expect(json.key).toBe('OPENAI_API_KEY')
      expect(typeof json.configured).toBe('boolean')
      expect(typeof json.valid).toBe('boolean')
    })
    it('异常处理', async () => {
      const req = { json: async () => { throw new Error('test') } }
      const res: any = await configCheckPOST(req as any)
      expect(res.status).toBe(500)
    })
  })
})
