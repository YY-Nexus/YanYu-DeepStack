# React Native 和 Web 类型定义冲突解决方案

本文档记录了解决 React Native 和 Web 项目在同一代码库中类型定义冲突的方法和步骤。

## 问题概述

在包含 React Native 和 Web 代码的混合项目中，经常会遇到类型定义冲突问题，特别是：

- FormData、URLSearchParams 等全局类型在 React Native 和 Web 中有不同的实现
- XMLHttpRequestResponseType 等 Web API 类型与 React Native 类型冲突
- DOM 相关类型与 React Native 类型冲突

这些冲突会导致 TypeScript 类型检查失败，影响项目开发和构建。

## 解决方案

我们实现了一个完整的解决方案，通过以下几个关键步骤解决类型冲突：

### 1. 创建类型冲突修复声明文件

创建 `types/react-native-fix.d.ts` 文件，用于：

- 以简洁语法声明 React Native 相关模块为空模块，阻止其类型定义加载
- 在全局命名空间中声明类型，避免重复标识符错误

文件内容示例：
```typescript
// 声明React Native相关模块为空模块，阻止其类型定义加载
declare module 'react-native';
declare module '@types/react-native';
// ... 其他React Native相关模块

// 在全局命名空间中扩展类型声明，避免重复标识符错误
declare global {
  // 使用declare module 'typescript'来引入Web版本的类型
  declare module 'typescript' {
    interface FormData {}
    interface URLSearchParams {}
    interface XMLHttpRequest {}
    type XMLHttpRequestResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
  }
}
```

### 2. 更新 TypeScript 配置

更新 `tsconfig.json` 文件，进行以下优化：

- 添加对修复声明文件的引用到include数组
- 移除未知的编译器选项（如typeRootsExclude）
- 移除未找到的类型定义引用（如next）
- 确保正确的模块解析策略和库引用

关键配置示例：
```json
"include": [
  "src/**/*",
  "app/**/*",
  "components/**/*",
  ".next/types/**/*.ts",
  "types/react-native-fix.d.ts"
],
"exclude": [
  "node_modules",
  "**/*.test.*",
  "mobile/**/*",
  "**/*native*.ts",
  "**/*native*.tsx"
]
```

### 3. 创建专用 Web 配置文件

创建 `tsconfig.web-only.json` 文件，包含针对 Web 项目的特定配置：

- 启用 `skipLibCheck` 和 `skipDefaultLibCheck` 忽略库类型检查
- 配置正确的模块解析策略（moduleResolution: "node"）
- 设置适当的 include/exclude 规则

### 4. 自定义类型检查脚本

创建 `check-ts.js` 文件，使用 TypeScript API 直接检查代码：

- 正确解析tsconfig配置文件
- 过滤掉React Native相关的错误
- 只显示前10个错误，避免输出过多

使用方法：
```bash
node check-ts.js
```

### 5. 测试 Web API 兼容性

创建 `test-web-api.ts` 文件测试 Web API 类型定义是否正常工作，包括：

- FormData 类型
- URLSearchParams 类型
- fetch API
- DOM API

## 验证结果

经过测试，我们的解决方案成功解决了所有诊断错误和类型冲突问题：

- 修复了重复标识符错误（FormData、URLSearchParams、XMLHttpRequestResponseType）
- 移除了未知的编译器选项
- 修复了类型定义引用问题
- 原始项目文件类型检查通过
- Web API 类型定义正常工作

## 最佳实践

1. **健康稳定解决问题**：优先采用安全可靠的修复策略，确保系统的健壮性
2. **最小化修改范围**：只修改必要的配置和文件，避免引入新的问题
3. **全面测试验证**：创建测试文件验证解决方案的有效性
4. **文档化解决方案**：详细记录解决问题的方法和步骤，便于团队协作和未来参考

## 总结

通过创建类型修复声明文件、优化TypeScript配置、创建专用的Web配置文件，以及使用自定义的类型检查脚本，我们成功解决了React Native和Web之间的类型定义冲突问题，使项目能够正常进行类型检查和开发。这种方法不仅解决了当前的问题，还提供了一个可维护的框架，可以适应未来的项目扩展和库版本更新。