#!/usr/bin/env node
// 这个脚本用于验证修复后的TypeScript文件是否有类型错误

import { execSync } from 'child_process';
import * as path from 'path';

// 我们修复过的文件列表
const filesToCheck = [
  'lib/ai/model-code-integration.ts',
  'lib/ai/model-management-center.ts',
  'lib/ai/multimodal-ai-service.ts'
];

console.log('开始检查修复过的TypeScript文件...\n');

let allFilesValid = true;

for (const file of filesToCheck) {
  const filePath = path.resolve(process.cwd(), file);
  try {
    console.log(`检查文件: ${file}`);
    // 使用TypeScript编译器检查单个文件，对包含空格的路径添加引号
    execSync(`npx tsc --noEmit --skipLibCheck "${filePath}"`, { stdio: 'pipe' });
    console.log('  ✅ 没有发现类型错误\n');
  } catch (error) {
    console.log('  ❌ 发现类型错误:');
    console.log(error.stdout?.toString() || error.stderr?.toString() || '未知错误');
    console.log('');
    allFilesValid = false;
  }
}

if (allFilesValid) {
  console.log('🎉 所有修复过的文件都通过了类型检查！');
  console.log('\n这表明我们修复的代码语法上是正确的。');
  console.log('项目构建问题可能与依赖安装有关，建议：');
  console.log('1. 删除node_modules和package-lock.json');
  console.log('2. 重新运行npm install');
  console.log('3. 然后运行npm run build');
} else {
  console.log('❌ 有文件未通过类型检查，请查看上面的错误信息。');
}