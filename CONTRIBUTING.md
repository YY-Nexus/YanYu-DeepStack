# 贡献指南

**版本**：1.0.0  
**文档编号**：YYC-CONTRIB-20250703

欢迎您参与言語云³项目的开发和改进！本指南将帮助您了解如何为项目做出贡献。

## 行为准则

参与本项目的所有贡献者都应遵守[行为准则](CODE_OF_CONDUCT.md)，确保社区友好、包容和专业。

## 开始贡献

### 1. 开发环境设置

```bash
# 克隆仓库
git clone <repository-url>
cd YanYu-LLM

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. 代码规范

请遵循项目的代码规范：

- 使用TypeScript进行开发
- 遵循ESLint和Prettier的格式化规则
- 为所有组件和函数添加适当的文档注释
- 确保测试覆盖关键功能

## 贡献流程

### 1. 创建Issue

在开始工作前，请先创建一个Issue来描述您要解决的问题或添加的功能。这有助于：

- 避免重复工作
- 获取团队反馈
- 确保您的贡献符合项目方向

### 2. 分支管理

```bash
# 创建新分支
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-fix-name
```

分支命名规范：

- `feature/` 用于新功能
- `fix/` 用于bug修复
- `docs/` 用于文档更新
- `refactor/` 用于代码重构

### 3. 提交代码

请使用清晰、简洁的提交信息：

```
feat: 添加新功能描述
fix: 修复具体问题
docs: 更新文档内容
refactor: 重构特定模块
style: 调整代码格式
```

### 4. 运行测试

在提交Pull Request前，请确保所有测试都能通过：

```bash
# 运行所有测试
npm test

# 检查TypeScript错误
npx tsc --noEmit

# 运行ESLint检查
npx eslint .
```

### 5. 创建Pull Request

当您的工作完成后，创建一个Pull Request并：

- 清晰描述您的更改
- 引用相关的Issue
- 提供测试结果
- 请求适当的审阅者

## 代码审查

所有Pull Request都将经过代码审查，审查者可能会要求一些修改。请及时响应反馈并进行必要的调整。

## 版本发布

项目维护者负责版本发布，遵循语义化版本控制规范：

- `MAJOR`：不兼容的API更改
- `MINOR`：向后兼容的新功能
- `PATCH`：向后兼容的错误修复

## 获取帮助

如果您在贡献过程中遇到任何问题，请通过以下方式获取帮助：

- 在相关Issue中提问
- 联系项目维护者

## 贡献者列表

感谢所有为项目做出贡献的开发者！

---

**版本**：1.0.0  
**最后更新**：2025年7月3日  
**作者**：YYC 团队  
**保持代码健康，稳步前行！ 🌹**