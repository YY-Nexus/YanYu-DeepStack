/**
 * EnhancedOllamaService 模拟实现
 * 用于测试环境，避免真实的网络请求
 */

class MockEnhancedOllamaService {
  // 模拟服务状态
  private connected = false;
  
  // 模拟连接检查
  async checkConnection() {
    console.log('模拟检查连接...');
    // 模拟连接成功
    this.connected = true;
    return true;
  }
  
  // 模拟发送请求
  async sendRequest(prompt: string) {
    return {
      success: true,
      response: `模拟响应: ${prompt}`,
      model: 'mock-model'
    };
  }
  
  // 获取连接状态
  getConnectionStatus() {
    return this.connected;
  }
  
  // 其他模拟方法
  scheduleReconnect() {
    console.log('模拟重连调度');
  }
  
  async initialize() {
    await this.checkConnection();
    return true;
  }
}

// 导出模拟实例
export const EnhancedOllamaService = MockEnhancedOllamaService;
export default new MockEnhancedOllamaService();