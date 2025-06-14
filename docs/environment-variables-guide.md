# 言語云³深度堆栈 - 环境变量配置指南

## 📋 环境变量总览

本系统需要配置多个环境变量来支持各种第三方服务集成。以下是详细的配置说明：

## 🔐 身份认证相关

### Google OAuth 2.0
\`\`\`bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
\`\`\`

**作用**: 支持Google账号登录和Google服务集成
**必须性**: 可选 - 如果需要Google登录功能则必须
**获取方式**:
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API 和 OAuth 2.0
4. 在"凭据"页面创建OAuth 2.0客户端ID
5. 设置授权重定向URI: `https://your-domain.com/auth/callback/google`

### Microsoft Azure AD
\`\`\`bash
NEXT_PUBLIC_AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
\`\`\`

**作用**: 支持Microsoft账号登录和Azure服务集成
**必须性**: 可选 - 如果需要Microsoft登录功能则必须
**获取方式**:
1. 访问 [Azure Portal](https://portal.azure.com/)
2. 进入"Azure Active Directory" > "应用注册"
3. 创建新的应用注册
4. 在"证书和密码"中创建客户端密码
5. 配置重定向URI: `https://your-domain.com/auth/callback/azure`

### GitHub OAuth
\`\`\`bash
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
\`\`\`

**作用**: 支持GitHub账号登录和代码仓库集成
**必须性**: 推荐 - 开发平台通常需要GitHub集成
**获取方式**:
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击"New OAuth App"
3. 填写应用信息
4. 设置Authorization callback URL: `https://your-domain.com/auth/callback/github`

### SAML SSO (企业级)
\`\`\`bash
SAML_ENTRY_POINT=https://your-idp.com/saml/sso
SAML_ISSUER=your-saml-issuer
SAML_CERT=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----
\`\`\`

**作用**: 支持企业级SAML单点登录
**必须性**: 可选 - 仅企业客户需要
**获取方式**:
1. 联系企业IT管理员获取SAML配置
2. 从身份提供商(IdP)获取元数据文件
3. 提取Entry Point、Issuer和证书信息

## 🤖 AI服务相关

### OpenAI (服务端专用)
\`\`\`bash
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
\`\`\`

**作用**: 集成OpenAI GPT模型进行代码生成和AI对话
**必须性**: 可选 - 本地模型优先，云端模型作为备选
**安全性**: 仅在服务端使用，不暴露给客户端
**获取方式**:
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册账号并验证
3. 在API Keys页面创建新的API密钥
4. 如有组织账号，获取Organization ID

**注意**: API密钥以`sk-`开头，请妥善保管，仅在服务端环境变量中配置

### Anthropic Claude (服务端专用)
\`\`\`bash
ANTHROPIC_API_KEY=sk-ant-...
\`\`\`

**作用**: 集成Anthropic Claude模型作为AI助手
**必须性**: 可选 - 提供更多AI模型选择
**安全性**: 仅在服务端使用
**获取方式**:
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 申请API访问权限
3. 创建API密钥

### Google AI (服务端专用)
\`\`\`bash
GOOGLE_API_KEY=AIza...
\`\`\`

**作用**: 集成Google Gemini模型和其他Google AI服务
**必须性**: 可选 - 多模态AI功能
**安全性**: 仅在服务端使用
**获取方式**:
1. 访问 [Google AI Studio](https://makersuite.google.com/)
2. 创建API密钥
3. 启用相关AI服务

## 💬 协作通信相关

### Slack集成
\`\`\`bash
NEXT_PUBLIC_SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
\`\`\`

**作用**: 支持Slack通知和团队协作功能
**必须性**: 可选 - 团队协作功能
**获取方式**:
1. 访问 [Slack API](https://api.slack.com/apps)
2. 创建新的Slack应用
3. 配置OAuth & Permissions
4. 设置重定向URL: `https://your-domain.com/api/webhooks/slack`

## 📊 监控追踪相关

### Jaeger分布式追踪
\`\`\`bash
JAEGER_ENDPOINT=http://jaeger-collector:14268
\`\`\`

**作用**: 分布式系统追踪和性能监控
**必须性**: 可选 - 生产环境推荐
**获取方式**:
1. 部署Jaeger服务器
2. 获取Collector端点地址
3. 通常格式: `http://jaeger-host:14268`

### Zipkin追踪
\`\`\`bash
ZIPKIN_ENDPOINT=http://zipkin:9411
\`\`\`

**作用**: 另一种分布式追踪解决方案
**必须性**: 可选 - 与Jaeger二选一
**获取方式**:
1. 部署Zipkin服务器
2. 获取服务端点地址
3. 通常格式: `http://zipkin-host:9411`

## ☁️ 阿里云服务相关

### 阿里云访问凭证
\`\`\`bash
ALIYUN_ACCESS_KEY_ID=LTAI...
ALIYUN_ACCESS_KEY_SECRET=your_secret_key
ALIYUN_REGION=cn-hangzhou
ALIYUN_ENDPOINT=https://ecs.cn-hangzhou.aliyuncs.com
\`\`\`

**作用**: 集成阿里云各项服务(ECS、RDS、OSS等)
**必须性**: 可选 - 如果使用阿里云部署则必须
**获取方式**:
1. 登录 [阿里云控制台](https://ram.console.aliyun.com/)
2. 进入"访问控制RAM" > "用户"
3. 创建用户并生成AccessKey
4. 分配相应的权限策略
5. 选择合适的地域(region)

**安全建议**: 
- 使用RAM子账号，避免使用主账号AccessKey
- 遵循最小权限原则
- 定期轮换AccessKey

## 🔧 配置文件示例

创建 `.env.local` 文件：

\`\`\`bash
# === 核心服务配置 ===
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=言語云³深度堆栈
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_API_BASE_URL=https://nettrack.yyhnit.com

# === AI服务配置 (服务端专用) ===
# 如需使用OpenAI服务，请在服务端配置
# OPENAI_API_KEY=sk-your-openai-api-key
# OPENAI_ORG_ID=org-your-organization-id

# 如需使用Anthropic服务，请在服务端配置
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# 如需使用Google AI服务，请在服务端配置
# GOOGLE_API_KEY=AIza-your-google-api-key

# === 身份认证配置 ===
# 如需GitHub OAuth登录，请取消注释并配置
# NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret

# 如需Google OAuth登录，请取消注释并配置
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# === 云服务配置 ===
# 如需阿里云服务，请取消注释并配置
# ALIYUN_ACCESS_KEY_ID=your-aliyun-access-key-id
# ALIYUN_ACCESS_KEY_SECRET=your-aliyun-access-key-secret
# ALIYUN_REGION=cn-hangzhou
# ALIYUN_ENDPOINT=https://ecs.cn-hangzhou.aliyuncs.com

# === 监控追踪配置 ===
# 如需分布式追踪，请取消注释并配置
# JAEGER_ENDPOINT=http://localhost:14268
# ZIPKIN_ENDPOINT=http://localhost:9411

# === 协作通信配置 ===
# 如需Slack集成，请取消注释并配置
# NEXT_PUBLIC_SLACK_CLIENT_ID=your-slack-client-id
# SLACK_CLIENT_SECRET=your-slack-client-secret
\`\`\`

## ⚠️ 安全注意事项

1. **环境变量安全**:
   - 永远不要将包含敏感信息的`.env`文件提交到版本控制
   - 在`.gitignore`中添加`.env*`
   - 生产环境使用环境变量或密钥管理服务

2. **API密钥管理**:
   - 定期轮换API密钥
   - 监控API使用情况
   - 设置适当的权限和限制
   - **重要**: AI服务API密钥仅在服务端使用，不暴露给客户端

3. **访问控制**:
   - 使用最小权限原则
   - 为不同环境使用不同的凭证
   - 启用多因素认证(MFA)

## 🚀 部署配置

### 开发环境
\`\`\`bash
# 复制示例配置文件
cp .env.example .env.local

# 编辑配置文件
nano .env.local

# 启动开发服务器
npm run dev
\`\`\`

### 生产环境
\`\`\`bash
# 在Vercel中配置环境变量（服务端专用）
vercel env add OPENAI_API_KEY

# 或在服务器中设置
export OPENAI_API_KEY=your_key

# 构建和启动
npm run build
npm start
\`\`\`

## 📞 获取帮助

如果在配置过程中遇到问题：

1. **查看文档**: 每个服务都有详细的API文档
2. **社区支持**: 访问相关服务的开发者社区
3. **技术支持**: 联系服务提供商的技术支持
4. **系统日志**: 查看应用日志获取错误信息

## 🔄 配置验证

系统启动时会自动验证关键环境变量：

\`\`\`typescript
// 在应用启动时验证配置
function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_OLLAMA_URL',
  ];
  
  const optional = [
    'OPENAI_API_KEY', // 服务端专用
    'ALIYUN_ACCESS_KEY_ID',
    'NEXT_PUBLIC_GITHUB_CLIENT_ID',
  ];
  
  // 验证必需的环境变量
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`❌ 缺少必需的环境变量: ${key}`);
    }
  }
  
  // 检查可选的环境变量
  for (const key of optional) {
    if (!process.env[key]) {
      console.warn(`⚠️ 可选环境变量未配置: ${key}`);
    }
  }
}
\`\`\`

配置完成后，您的言語云³深度堆栈系统将具备完整的功能，包括AI代码生成、云服务集成、身份认证和监控追踪等核心能力。
