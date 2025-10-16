const fs = require('fs');
const path = require('path');

// 要修复的文件列表
const filesToFix = [
  'src/emotion-platform/EmotionFeedback.tsx',
  'src/emotion-platform/EmotionPlatform.tsx',
  'src/modules/emotion-sound-platform/basic-validator.js'
];

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      console.log(`正在修复: ${fullPath}`);
      
      // 修复 EmotionFeedback.tsx 中的转义字符问题
      if (filePath.includes('EmotionFeedback.tsx')) {
        // 移除错误的转义字符
        content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"');
        
        // 修复中文字符在JSX中的问题（确保中文字符直接使用）
        content = content.replace(/\{\{currentEmotion\.valence\s*>\s*0\s*\?\s*'正面'\s*:\s*'负面'\}\}/g, '{currentEmotion.valence > 0 ? \'正面\' : \'负面\'}');
        content = content.replace(/\{\{currentEmotion\.arousal\s*>\s*0\.5\s*\?\s*'兴奋'\s*:\s*'平静'\}\}/g, '{currentEmotion.arousal > 0.5 ? \'兴奋\' : \'平静\'}');
        
        console.log(`  ✓ 已修复 EmotionFeedback.tsx 中的转义字符和中文字符问题`);
      }
      
      // 修复 basic-validator.js 中的模板字符串问题
      if (filePath.includes('basic-validator.js')) {
        // 将模板字符串改为普通字符串连接
        content = content.replace(/`- \${preset\.name} \(\${preset\.id}\): \${preset\.targetEmotion}`/g, '"- " + preset.name + " (" + preset.id + "): " + preset.targetEmotion');
        content = content.replace(/console\.log\(`[^`]*`\)/g, match => {
          return match.replace(/`/g, '"').replace(/\\\${/g, '${');
        });
        
        console.log(`  ✓ 已修复 basic-validator.js 中的模板字符串问题`);
      }
      
      // 确保所有JSX标签正确闭合
      if (filePath.endsWith('.tsx')) {
        // 这是一个简化的闭合检查，实际应用中可能需要更复杂的解析
        const divMatches = content.match(/<div\s+[^>]*>/g) || [];
        const divCloseMatches = content.match(/<\/div>/g) || [];
        
        if (divMatches.length !== divCloseMatches.length) {
          console.log(`  ⚠️  警告: ${filePath} 中可能存在未闭合的 div 标签`);
          console.log(`  打开标签数: ${divMatches.length}, 关闭标签数: ${divCloseMatches.length}`);
        }
      }
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ 已修复: ${filePath}`);
    } else {
      console.log(`❌ 文件不存在: ${fullPath}`);
    }
  } catch (error) {
    console.error(`❌ 修复 ${filePath} 时出错:`, error.message);
  }
});

console.log('\n✨ 语法修复完成！');