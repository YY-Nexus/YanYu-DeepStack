// 简单的脚本，用于直接检查TypeScript文件
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 读取文件内容
const filePath = './components/monitoring/configuration/SLAConfiguration.tsx';
const fileContent = fs.readFileSync(filePath, 'utf8');

console.log('文件内容检查开始...');
console.log(`文件路径: ${filePath}`);
console.log(`文件行数: ${fileContent.split('\n').length}`);

// 尝试使用tsc检查单个文件，重定向输出到文件
const outputFile = './tsc-output.log';
try {
  console.log('正在执行TypeScript检查...');
  execSync(`tsc --noEmit ${filePath} > ${outputFile} 2>&1`);
  console.log('TypeScript检查通过！');
} catch (error) {
  console.log('TypeScript检查失败，查看输出日志');
}

// 读取输出日志
const output = fs.readFileSync(outputFile, 'utf8');
console.log('\n=== TypeScript检查输出 ===');
console.log(output || '无输出');

console.log('\n检查完成');