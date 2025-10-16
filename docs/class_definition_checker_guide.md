# 类定义检测与修复工具指南

## 🌟 工具介绍

本工具集用于自动化检测和修复项目中的类定义问题，支持JavaScript、TypeScript和Python文件。它能够：

- ✅ 检查类名是否以大写字母开头
- ✅ 验证类是否继承了指定的基类
- ✅ 检测并警告空类
- ✅ 自动修复可修复的问题
- ✅ 整合ESLint和Python脚本功能

## 🛠️ 工具组成

1. **JavaScript/TypeScript检测** - 基于ESLint自定义规则
2. **Python检测** - 基于Python脚本
3. **集成脚本** - 将所有功能整合在一起
4. **启动脚本** - 提供便捷的命令行界面

## 🚀 快速开始

### 前置条件

- Node.js (14.x 或更高版本)
- npm 或 yarn
- Python 3.x

### 安装依赖

```bash
# 给启动脚本添加执行权限
chmod +x start_class_check.sh

# 运行启动脚本（会自动安装依赖并执行检测）
./start_class_check.sh
```

## 📋 使用说明

### 完整检测流程

运行完整的检测和修复流程（包括安装依赖）：

```bash
./start_class_check.sh
```

### 仅安装依赖

```bash
./start_class_check.sh --install
```

### 仅运行检测（不重新安装依赖）

```bash
./start_class_check.sh --check
```

### 清理临时文件

```bash
./start_class_check.sh --clean
```

### 直接运行JavaScript检测脚本

```bash
node scripts/class_definition_checker.js
```

### 单独检查Python文件

```bash
python yyc3_TypeScript/scripts/class_checker.py --file path/to/your/file.py
```

### 检查整个Python目录

```bash
python yyc3_TypeScript/scripts/class_checker.py --dir path/to/your/directory
```

## ⚙️ 配置选项

### JavaScript/TypeScript配置

在 `scripts/class_definition_checker.js` 文件中可以修改以下配置：

```javascript
const CONFIG = {
  // 项目根目录
  projectRoot: path.resolve(__dirname, '..'),
  // 要检查的文件扩展名
  extensions: ['.js', '.ts', '.tsx', '.py'],
  // 要忽略的目录
  ignoreDirs: ['node_modules', '.git', 'dist', 'build', '__tests__', 'coverage'],
  // JavaScript/TypeScript的配置
  jsConfig: {
    requiredBase: 'BaseComponent', // JavaScript/TypeScript需要继承的基类
    eslintConfigPath: path.resolve(__dirname, '../yyc3_TypeScript/.eslintrc.js')
  },
  // Python的配置
  pyConfig: {
    requiredBase: 'BaseModel', // Python需要继承的基类
    checkerScriptPath: path.resolve(__dirname, '../yyc3_TypeScript/scripts/class_checker.py')
  }
};
```

### ESLint规则配置

在 `.eslintrc.js` 文件中可以配置JavaScript/TypeScript的规则：

```javascript
rules: {
  "custom/class-rules": ["error", { requiredBase: "BaseComponent" }]
}
```

### Python脚本配置

在 `yyc3_TypeScript/scripts/class_checker.py` 文件中可以修改Python相关配置：

```python
REQUIRED_BASE = "BaseModel"  # Python需要继承的基类
```

## 📝 规则说明

### 1. 类名首字母大写

**规则**：所有类名必须以大写字母开头（遵循大驼峰命名法）

**示例**：

- ✅ `class User {}`
- ❌ `class user {}`

### 2. 继承指定基类

**规则**：所有类必须继承指定的基类

- JavaScript/TypeScript：默认需要继承 `BaseComponent`
- Python：默认需要继承 `BaseModel`

**示例**：

- ✅ `class User extends BaseComponent {}`
- ❌ `class User {}`

### 3. 禁止空类

**规则**：不允许创建没有任何方法或属性的空类

**示例**：

- ✅ `class User extends BaseComponent { constructor() { super(); } }`
- ❌ `class User extends BaseComponent {}` 或 `class User extends BaseComponent { pass }`

## 🔧 常见问题解决

### 1. 依赖安装失败

如果 `npm install` 失败，请尝试：

```bash
# 清除npm缓存
npm cache clean --force

# 重新安装
npm install
```

### 2. ESLint找不到模块

确保项目根目录下有 `.eslintrc.js` 配置文件，并且已安装所有依赖：

```bash
npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev
```

### 3. Python脚本执行错误

确保Python 3已正确安装：

```bash
# 检查Python版本
python --version

# 或者
python3 --version
```

如果使用的是 `python3`，请修改相关脚本中的命令。

## 🤝 贡献指南

如果您发现问题或有改进建议，请提交Issue或Pull Request。

## 📅 维护计划

- 每季度更新依赖版本
- 根据项目需求调整默认配置
- 持续优化检测性能