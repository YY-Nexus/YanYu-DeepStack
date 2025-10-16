# YYC³ 平台配置指南

**版本**：1.0.0  
**文档编号**：YYC-CG-20250703

## 一、配置文件概述

本指南介绍YYC³平台的主要配置文件、配置项及其用途，帮助团队成员更好地理解和使用项目配置。

## 二、核心配置文件说明

### 1. Next.js配置

#### next.config.mjs

**主要用途**：Next.js应用的核心配置文件，包含构建、路由、优化等配置。

**关键配置项**：

- `eslint.ignoreDuringBuilds`: 控制构建时是否忽略ESLint错误
- `typescript.ignoreBuildErrors`: 控制构建时是否忽略TypeScript错误
- `images.unoptimized`: 控制图片是否进行优化处理
- `output: 'export'`: 静态导出配置（当`NEXT_EXPORT=true`时启用）
- `trailingSlash`: 控制是否为静态文件添加尾部斜杠
- `headers`: 配置HTTP响应头，包含安全相关设置

#### 配置示例

```javascript
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 其他配置...
}
```

### 2. TypeScript配置

#### tsconfig.json

**主要用途**：项目的主要TypeScript配置文件，定义编译选项和包含/排除规则。

**关键配置项**：

- `compilerOptions`: TypeScript编译选项
  - `target`: 输出JavaScript版本
  - `lib`: 包含的库文件
  - `strict`: 启用严格类型检查
  - `module`: 模块系统
  - `paths`: 路径别名配置
- `include`: 包含的文件
- `exclude`: 排除的文件

### 3. ESLint配置

#### .eslintrc.json

**主要用途**：定义代码质量和风格检查规则。

**关键配置项**：

- `extends`: 继承的规则集
  - `next/core-web-vitals`: Next.js核心规则
  - `next/typescript`: TypeScript规则
  - `plugin:@typescript-eslint/recommended`: TypeScript ESLint推荐规则
  - `plugin:react/recommended`: React推荐规则
  - `plugin:react-hooks/recommended`: React Hooks推荐规则
  - `prettier`: Prettier集成配置
- `plugins`: 使用的ESLint插件
- `rules`: 自定义规则配置
- `settings`: 插件设置

### 4. Prettier配置

#### .prettierrc

**主要用途**：定义代码格式化规则。

**关键配置项**：

- `printWidth`: 每行最大字符数
- `tabWidth`: 制表符宽度
- `useTabs`: 是否使用制表符
- `semi`: 是否使用分号
- `singleQuote`: 是否使用单引号
- `trailingComma`: 尾部逗号规则
- `bracketSpacing`: 对象括号之间是否添加空格
- `arrowParens`: 箭头函数参数是否使用括号
- `endOfLine`: 行结束符

### 5. Tailwind CSS配置

#### tailwind.config.js

**主要用途**：Tailwind CSS配置文件，定义主题、颜色、字体等样式配置。

**关键配置项**：

- `content`: Tailwind需要处理的文件路径
- `theme`: 主题配置
  - `extend.colors`: 自定义颜色配置
- `plugins`: Tailwind插件

#### 自定义颜色说明

- `primary`: 主色调 - `#2F54EB`（深蓝色）
- `secondary`: 辅助色 - `#A57FFE`（紫色）
- `cloud-blue-500`: 云蓝色 - `#5B8FF9`
- `mint-green`: 薄荷绿 - `#4ecdc4`
- `coral-pink`: 珊瑚粉 - `#ff6b6b`
- `sky-blue`: 天蓝色 - `#45b7d1`
- `lemon-yellow`: 柠檬黄 - `#ffe66d`
- `light-blue`: 浅蓝色 - `#a2d2ff`
- `dark-gray`: 深灰色 - `#333333`

### 6. PostCSS配置

#### postcss.config.mjs

**主要用途**：PostCSS配置文件，定义CSS处理插件。

**关键配置项**：

- `plugins`: PostCSS插件配置
  - `tailwindcss`: Tailwind CSS插件
  - `autoprefixer`: 自动添加浏览器前缀

### 7. 组件配置

#### components.json

**主要用途**：shadcn/ui组件库的配置文件。

**关键配置项**：

- `style`: 组件风格
- `rsc`: 是否支持React Server Components
- `tsx`: 是否使用TypeScript JSX
- `tailwind`: Tailwind配置
- `aliases`: 路径别名配置
- `iconLibrary`: 图标库选择

## 三、环境变量配置

### 1. 环境变量类型

项目支持以下几种环境变量文件：

- `.env`: 所有环境通用的配置
- `.env.local`: 本地开发环境配置，不应提交到版本控制系统
- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置
- `.env.test`: 测试环境配置

### 2. 常用环境变量

| 环境变量 | 描述 | 默认值 | 适用环境 |
|---------|------|--------|---------|
| `NEXT_EXPORT` | 是否启用静态导出 | `false` | 所有环境 |
| `NODE_ENV` | 应用运行环境 | - | 所有环境 |
| `PORT` | 应用运行端口 | `3000` | 开发环境 |

### 3. 环境变量设置流程

1. 查看`.env.example`文件，了解可用的环境变量
2. 创建对应的`.env`文件，根据需要设置环境变量
3. 运行`npm run setup:env`脚本，自动生成必要的环境配置
4. 运行`npm run validate:env`脚本，验证环境配置是否正确

## 四、配置最佳实践

### 1. 配置文件管理

- 保持配置文件的整洁和有序
- 为关键配置添加注释说明
- 避免在配置文件中包含敏感信息
- 定期审查和清理不需要的配置

### 2. 开发环境配置

- 使用`.env.local`文件存储个人开发配置
- 确保开发环境与生产环境的配置尽可能一致
- 使用`npm run dev:full`命令启动完整的开发环境

### 3. 配置变更流程

1. 提出配置变更申请，说明变更原因和影响
2. 在测试环境进行配置变更测试
3. 收集测试结果，确认变更效果
4. 在生产环境实施配置变更
5. 监控变更后的系统状态
6. 记录配置变更信息

### 4. 常见配置问题排查

- **构建失败**：检查TypeScript和ESLint配置，确保没有语法错误
- **样式问题**：检查Tailwind和PostCSS配置，确保样式加载正确
- **路由问题**：检查Next.js路由配置，确保路由规则正确
- **环境问题**：检查环境变量配置，确保环境变量设置正确

## 五、配置命令说明

项目提供了一系列npm脚本，用于配置管理和验证：

| 命令 | 描述 |
|------|------|
| `npm run setup:env` | 设置核心环境配置 |
| `npm run validate:env` | 验证环境配置是否正确 |
| `npm run type-check` | 检查TypeScript类型错误 |
| `npm run lint` | 运行ESLint检查代码质量 |
| `npm run format` | 使用Prettier格式化代码 |
| `npm run format:check` | 检查代码是否符合格式化要求 |
| `npm run validate` | 运行完整的代码验证（类型检查、ESLint、测试） |

## 六、开发工具配置推荐

为了更好地使用项目配置，推荐以下开发工具设置：

### 1. VSCode配置

在项目根目录创建`.vscode/settings.json`文件，添加以下配置：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n"
}
```

### 2. 推荐插件

- **ESLint**: 代码质量检查
- **Prettier - Code formatter**: 代码格式化
- **Tailwind CSS IntelliSense**: Tailwind CSS智能提示
- **TypeScript Hero**: TypeScript辅助工具
- **GitLens**: Git增强工具

## 七、结语

配置是项目的重要组成部分，正确理解和使用配置文件对于保证项目质量和开发效率至关重要。希望本指南能够帮助团队成员更好地掌握YYC³平台的配置体系，共同维护一个高质量、高效率的开发环境。

如果您在使用配置过程中遇到问题，请随时咨询项目维护人员。

---

**版本**：1.0.0  
**最后更新**：2025年7月3日  
**作者**：YYC 团队  
**保持代码健康，稳步前行！ 🌹**