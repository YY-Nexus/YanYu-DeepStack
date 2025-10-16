// 使用ES模块语法的简单文件检查脚本
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// 获取当前目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 简单的日志函数
function log(message) {
  console.log(message);
}

function success(message) {
  log(`✅ ${message}`);
}

function error(message) {
  log(`❌ ${message}`);
}

// 检查文件是否存在
function checkFileExists(filePath, fileName) {
  if (existsSync(filePath)) {
    success(`${fileName} 文件存在`);
    return true;
  } else {
    error(`${fileName} 文件不存在`);
    return false;
  }
}

// 检查我们修复的核心文件
function checkCoreFiles() {
  log('\n=== 情感声效平台核心文件检查 ===\n');
  
  // 文件路径
  const files = [
    { name: 'index.ts', path: join(__dirname, 'index.ts') },
    { name: 'components.tsx', path: join(__dirname, 'components.tsx') },
    { name: 'emotion-sound-types.ts', path: join(__dirname, 'emotion-sound-types.ts') },
    { name: 'basic-validator.js', path: join(__dirname, 'basic-validator.js') }
  ];
  
  let allFilesExist = true;
  
  // 检查每个文件是否存在
  for (const file of files) {
    const exists = checkFileExists(file.path, file.name);
    allFilesExist = allFilesExist && exists;
  }
  
  // 检查我们做的主要修复是否存在
  if (allFilesExist) {
    log('\n=== 核心修复验证 ===');
    
    try {
      // 检查index.ts中的export type
      const indexContent = readFileSync(files[0].path, 'utf8');
      const hasExportType = indexContent.includes('export type');
      if (hasExportType) {
        success('index.ts 已正确使用 export type 导出类型');
      } else {
        error('index.ts 尚未使用 export type 导出类型');
      }
      
      // 检查components.tsx中是否移除了Grid组件
      const componentsContent = readFileSync(files[1].path, 'utf8');
      const hasGridImport = componentsContent.includes('Grid,');
      const hasGridComponent = componentsContent.includes('<Grid');
      if (!hasGridImport) {
        success('components.tsx 已移除 Grid 组件导入');
      } else {
        error('components.tsx 仍包含 Grid 组件导入');
      }
      if (!hasGridComponent) {
        success('components.tsx 已移除 Grid 组件使用');
      } else {
        error('components.tsx 仍包含 Grid 组件使用');
      }
      
      // 检查emotion-sound-types.ts中的类型定义
      const typesContent = readFileSync(files[2].path, 'utf8');
      const hasPrimaryEmotion = typesContent.includes('YYC3PrimaryEmotion');
      const hasEmotionalTone = typesContent.includes('YYC3EmotionalTone');
      if (hasPrimaryEmotion) {
        success('emotion-sound-types.ts 包含 YYC3PrimaryEmotion 类型定义');
      } else {
        error('emotion-sound-types.ts 缺少 YYC3PrimaryEmotion 类型定义');
      }
      if (hasEmotionalTone) {
        success('emotion-sound-types.ts 包含 YYC3EmotionalTone 类型定义');
      } else {
        error('emotion-sound-types.ts 缺少 YYC3EmotionalTone 类型定义');
      }
      
    } catch (err) {
      error(`读取文件时出错: ${err.message}`);
    }
  }
  
  log('\n=== 验证完成 ===');
  log('\n建议下一步操作:');
  log('1. 运行 `npx tsc --noEmit` 进行完整的TypeScript编译检查');
  log('2. 启动项目并手动测试情感声效功能模块');
  log('3. 查看是否还有其他需要修复的地方');
}

// 执行检查
checkCoreFiles();