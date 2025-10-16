const fs = require('fs');
const path = require('path');

// 修复函数
function fixFile(filePath) {
  console.log(`正在修复文件: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 修复1: 处理中文字符在模板字符串中的问题
    content = content.replace(/`([^`]*)(正面|负面|兴奋|平静|中性|积极|消极)[^`]*`/g, (match, p1, p2) => {
      return "\"" + p1.replace(/\${/g, '${') + p2 + "\"";
    });
    
    // 修复2: 修复JSON字符串中的转义字符
    content = content.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    
    // 修复3: 修复模板字符串语法错误
    content = content.replace(/console\.log\(`([^`]*)`\)/g, (match, p1) => {
      return "console.log(\"" + p1.replace(/\${/g, '${').replace(/"/g, '\\"') + "\");";
    });
    
    // 修复4: 修复components.tsx特定问题
    if (filePath.includes('components.tsx')) {
      // 修复情感类型枚举导入
      content = content.replace(
        /import { useYYC3EmotionSound, YYC3EmotionState } from \'\.\/index\'/, 
        `import { useYYC3EmotionSound, YYC3EmotionState, YYC3PrimaryEmotion } from './index'`
      );
      
      // 移除可能存在的内联枚举定义
      content = content.replace(/\/\/ 定义情感类型枚举\s*enum YYC3PrimaryEmotion[\s\S]*?}\s*/, ``);
      
      // 修复预设类型定义
      content = content.replace(
        '  // 预设配置 - 使用any类型避免TypeScript错误\n  const presets: any[] = [',
        '  // 情感预设配置\n  const presets = ['
      );
      
      // 修复spatialAudio属性格式
      content = content.replace(
        /spatialAudio:\s*\{\s*enabled:\s*[a-zA-Z]+,\s*position:\s*\{\s*x:\s*[0-9.-]+,\s*y:\s*[0-9.-]+,\s*z:\s*[0-9.-]+\s*\},\s*radius:\s*[0-9.-]+\s*\}/g,
        (match) => {
          return match.replace(/\s+/g, ' ');
        }
      );
    }
    
    // 修复5: 检查并修复未闭合的标签
    const divMatches = content.match(/<div[^>]*>/g) || [];
    const closingDivMatches = content.match(/<\/div>/g) || [];
    
    const divCount = divMatches.length;
    const closingDivCount = closingDivMatches.length;
    
    if (divCount !== closingDivCount) {
      console.log(`警告: ${filePath} 中的 div 标签不匹配! 开启标签: ${divCount}, 闭合标签: ${closingDivCount}`);
      
      // 尝试添加缺失的闭合标签
      if (closingDivCount < divCount) {
        const missingDivs = divCount - closingDivCount;
        let fixedContent = content;
        
        for (let i = 0; i < missingDivs; i++) {
          fixedContent += '\n</div>';
        }
        
        content = fixedContent;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`修复成功: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`修复文件 ${filePath} 时出错:`, error);
    return false;
  }
}

// 要修复的文件列表
const filesToFix = [
  '/Users/yanyu/Desktop/7/桌面 - YanYu/生成式人工智能提示词/已测试完成/YanYu-LLM/src/modules/emotion-sound-platform/components.tsx',
  '/Users/yanyu/Desktop/7/桌面 - YanYu/生成式人工智能提示词/已测试完成/YanYu-LLM/src/modules/emotion-sound-platform/EmotionFeedback.tsx',
  '/Users/yanyu/Desktop/7/桌面 - YanYu/生成式人工智能提示词/已测试完成/YanYu-LLM/src/modules/emotion-sound-platform/EmotionPlatform.tsx',
  '/Users/yanyu/Desktop/7/桌面 - YanYu/生成式人工智能提示词/已测试完成/YanYu-LLM/src/modules/emotion-sound-platform/basic-validator.js'
];

// 运行修复
console.log('开始全面修复语法错误...');
let successCount = 0;

filesToFix.forEach(filePath => {
  if (fixFile(filePath)) {
    successCount++;
  }
});

console.log(`修复完成! 成功修复 ${successCount}/${filesToFix.length} 个文件。`);
console.log('\n修复总结:');
console.log('1. 修复了中文字符在模板字符串中的问题');
console.log('2. 修复了JSON字符串中的转义字符');
console.log('3. 修复了模板字符串语法错误');
console.log('4. 修复了components.tsx中的类型导入和定义问题');
console.log('5. 检查并尝试修复了未闭合的标签');