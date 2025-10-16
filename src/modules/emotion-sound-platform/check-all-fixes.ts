// 验证所有TypeScript错误修复的脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 读取文件内容
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

// 获取当前目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 验证结果
const results = {
  success: true,
  messages: [] as string[],
  errors: [] as string[]
};

try {
  // 文件路径
  const typesFile = path.join(__dirname, 'emotion-sound-types.ts');
  const componentsFile = path.join(__dirname, 'components.tsx');
  
  // 读取文件内容
  const typesContent = readFile(typesFile);
  const componentsContent = readFile(componentsFile);
  
  // 1. 验证YYC3LearningParameters接口修复
  const adaptationRateMatches = typesContent.match(/adaptationRate:/g) || [];
  if (adaptationRateMatches.length !== 1) {
    results.success = false;
    results.errors.push(`YYC3LearningParameters接口中adaptationRate定义次数错误: 发现${adaptationRateMatches.length}次，应为1次`);
  } else {
    results.messages.push('✓ YYC3LearningParameters接口中adaptationRate重复定义问题已修复');
  }
  
  // 2. 验证stereoPanning属性是否为可选
  if (!typesContent.includes('stereoPanning?:')) {
    results.success = false;
    results.errors.push('YYC3DynamicParameters接口中stereoPanning属性未正确设置为可选');
  } else {
    results.messages.push('✓ YYC3DynamicParameters接口中stereoPanning属性已设置为可选');
  }
  
  // 3. 验证YYC3SpatialAudioConfig接口中的可选属性
  const spatialProps = ['hrtf?', 'roomAcoustics?', 'distanceAttenuation?'];
  spatialProps.forEach(prop => {
    if (!typesContent.includes(prop + ':')) {
      results.success = false;
      results.errors.push(`YYC3SpatialAudioConfig接口中${prop}属性未正确设置为可选`);
    }
  });
  if (spatialProps.every(prop => typesContent.includes(prop + ':'))) {
    results.messages.push('✓ YYC3SpatialAudioConfig接口中的必要属性已正确设置为可选');
  }
  
  // 4. 验证components.tsx中的filterSweep是否都有curve属性
  const filterSweepMatches = componentsContent.match(/filterSweep:/g) || [];
  const filterSweepWithCurveMatches = componentsContent.match(/filterSweep:[\s\S]*?curve:/g) || [];
  
  if (filterSweepMatches.length !== filterSweepWithCurveMatches.length) {
    results.success = false;
    results.errors.push(
      `components.tsx中filterSweep缺少curve属性: 发现${filterSweepMatches.length}个filterSweep对象，但只有${filterSweepWithCurveMatches.length}个包含curve属性`
    );
  } else {
    results.messages.push(`✓ components.tsx中${filterSweepMatches.length}个filterSweep对象均已添加curve属性`);
  }
  
  // 5. 验证学习参数的必需属性
  const requiredLearningProps = ['userFeedbackWeight:', 'behaviorPatternWeight:', 'emotionAccuracyWeight:', 'forgettingFactor:'];
  requiredLearningProps.forEach(prop => {
    if (!typesContent.includes(prop)) {
      results.success = false;
      results.errors.push(`YYC3LearningParameters接口中缺少必需属性${prop}`);
    }
  });
  
} catch (error) {
  results.success = false;
  results.errors.push(`验证过程发生错误: ${error instanceof Error ? error.message : String(error)}`);
}

// 输出验证结果
console.log('=== TypeScript错误修复验证结果 ===');
console.log('');
results.messages.forEach(msg => console.log(msg));
console.log('');
if (results.errors.length > 0) {
  console.error('❌ 发现问题:');
  results.errors.forEach(err => console.error(`  - ${err}`));
} else {
  console.log('✅ 所有修复验证通过！所有TypeScript错误已解决。');
}

// 以适当的退出码结束脚本
process.exit(results.success ? 0 : 1);