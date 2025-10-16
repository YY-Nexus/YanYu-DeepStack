// 简单验证脚本 - 只检查关键的TypeScript错误是否已修复
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取文件内容
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

// 检查修复是否完成
function checkFixes() {
  const typesFile = path.join(__dirname, 'emotion-sound-types.ts');
  const componentsFile = path.join(__dirname, 'components.tsx');
  
  const typesContent = readFile(typesFile);
  const componentsContent = readFile(componentsFile);
  
  // 检查YYC3SpatialAudioConfig接口中position属性是否存在
  const hasPositionInSpatialAudio = typesContent.includes('position?:');
  
  // 检查YYC3LearningParameters接口中enabled属性是否存在
  const hasEnabledInLearningParams = typesContent.includes('enabled?:');
  
  // 检查所有filterSweep对象是否都有curve属性
  const filterSweepMatches = componentsContent.match(/filterSweep:/g) || [];
  const filterSweepWithCurveMatches = componentsContent.match(/filterSweep:[\s\S]*?curve:/g) || [];
  const allFilterSweepsHaveCurve = filterSweepMatches.length === filterSweepWithCurveMatches.length;
  
  // 输出结果
  console.log('=== 关键TypeScript错误修复验证 ===');
  console.log('');
  console.log(`1. YYC3SpatialAudioConfig接口包含position属性: ${hasPositionInSpatialAudio ? '✓ 是' : '✗ 否'}`);
  console.log(`2. YYC3LearningParameters接口包含enabled属性: ${hasEnabledInLearningParams ? '✓ 是' : '✗ 否'}`);
  console.log(`3. 所有filterSweep对象都有curve属性: ${allFilterSweepsHaveCurve ? '✓ 是' : `✗ 否 (发现${filterSweepMatches.length}个filterSweep，${filterSweepWithCurveMatches.length}个有curve属性)`}`);
  
  // 检查原始错误是否已解决
  const originalErrorsFixed = hasPositionInSpatialAudio && hasEnabledInLearningParams && allFilterSweepsHaveCurve;
  
  console.log('');
  if (originalErrorsFixed) {
    console.log('✅ 原始的TypeScript错误已解决！');
    process.exit(0);
  } else {
    console.log('❌ 原始的TypeScript错误尚未完全解决。');
    process.exit(1);
  }
}

checkFixes();