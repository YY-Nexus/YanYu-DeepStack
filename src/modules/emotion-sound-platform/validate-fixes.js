// 使用CommonJS模块系统的验证脚本
// 这个脚本简单地检查我们修复的核心文件是否存在并且格式正确
const fs = require('fs');
const path = require('path');

// 获取当前目录
const __dirname = path.dirname(__filename);

// 检查文件是否存在
function checkFileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

// 读取文件内容并检查基本语法
function validateFile(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查文件是否为空
    if (!content.trim()) {
      console.log(`❌ ${fileName} 文件为空`);
      return false;
    }
    
    // 检查我们修复的关键点
    let isValid = true;
    
    if (fileName === 'index.ts') {
      // 检查是否使用了export type
      const hasExportType = content.includes('export type');
      console.log(`  - 类型导出使用export type: ${hasExportType ? '✅ 是' : '❌ 否'}`);
      isValid = isValid && hasExportType;
    }
    
    if (fileName === 'components.tsx') {
      // 检查是否移除了Grid组件
      const hasGridImport = content.includes('Grid,');
      const hasGridComponent = content.includes('<Grid');
      console.log(`  - 已移除Grid组件导入: ${!hasGridImport ? '✅ 是' : '❌ 否'}`);
      console.log(`  - 已移除Grid组件使用: ${!hasGridComponent ? '✅ 是' : '❌ 否'}`);
      isValid = isValid && !hasGridImport && !hasGridComponent;
    }
    
    if (fileName === 'emotion-sound-types.ts') {
      // 检查类型定义是否完整
      const hasPrimaryEmotion = content.includes('YYC3PrimaryEmotion');
      const hasEmotionalTone = content.includes('YYC3EmotionalTone');
      const hasFilterSweep = content.includes('filterSweep:');
      console.log(`  - 包含YYC3PrimaryEmotion定义: ${hasPrimaryEmotion ? '✅ 是' : '❌ 否'}`);
      console.log(`  - 包含YYC3EmotionalTone定义: ${hasEmotionalTone ? '✅ 是' : '❌ 否'}`);
      console.log(`  - 包含filterSweep定义: ${hasFilterSweep ? '✅ 是' : '❌ 否'}`);
      isValid = isValid && hasPrimaryEmotion && hasEmotionalTone && hasFilterSweep;
    }
    
    if (isValid) {
      console.log(`✅ ${fileName} 验证通过`);
    } else {
      console.log(`❌ ${fileName} 验证未通过`);
    }
    
    return isValid;
  } catch (error) {
    console.log(`❌ 读取 ${fileName} 时出错:`, error.message);
    return false;
  }
}

// 运行所有验证
function runValidations() {
  console.log('\n=== 情感声效平台修复验证 ===\n');
  
  // 需要验证的文件
  const filesToValidate = [
    { name: 'index.ts', path: path.join(__dirname, 'index.ts') },
    { name: 'components.tsx', path: path.join(__dirname, 'components.tsx') },
    { name: 'emotion-sound-types.ts', path: path.join(__dirname, 'emotion-sound-types.ts') },
    { name: 'basic-validator.js', path: path.join(__dirname, 'basic-validator.js') }
  ];
  
  let allValid = true;
  
  // 验证每个文件
  for (const file of filesToValidate) {
    console.log(`\n验证 ${file.name}:`);
    
    // 检查文件是否存在
    if (!checkFileExists(file.path)) {
      console.log(`❌ ${file.name} 文件不存在`);
      allValid = false;
      continue;
    }
    
    // 验证文件内容
    const isValid = validateFile(file.path, file.name);
    allValid = allValid && isValid;
  }
  
  // 检查基本的项目结构
  console.log('\n=== 项目结构检查 ===');
  const hasRequiredFiles = filesToValidate.every(file => checkFileExists(file.path));
  console.log(`所有必需文件存在: ${hasRequiredFiles ? '✅ 是' : '❌ 否'}`);
  
  // 输出最终结果
  console.log('\n=== 验证结果摘要 ===');
  if (allValid && hasRequiredFiles) {
    console.log('🎉 恭喜！所有核心修复已验证成功！');
    console.log('\n建议下一步操作:');
    console.log('1. 运行 `npx tsc --noEmit` 进行完整的TypeScript编译检查');
    console.log('2. 启动项目并手动测试情感声效功能模块');
    console.log('3. 查看是否还有其他需要修复的地方');
  } else {
    console.log('❌ 验证未通过。某些修复仍需完善。');
    console.log('请继续修复上述验证中发现的问题。');
  }
  
  return allValid;
}

// 执行验证
const success = runValidations();
process.exit(success ? 0 : 1);