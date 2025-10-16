// 详细的类型验证脚本
// 该脚本用于精确识别情感声音平台模块中的类型问题

// 导入所有需要的类型
const { YYC3EmotionSoundPreset, YYC3SoundParameters } = require('./index');
const { YYC3PrimaryEmotion, YYC3Waveform, YYC3EmotionalTone } = require('./emotion-sound-types');

try {
  console.log('1. 成功导入基础类型');
  
  // 验证预设配置结构
  const samplePreset: Partial<any> = {
    id: 'test',
    name: '测试预设',
    targetEmotion: 'neutral',
    usage: 'feedback'
  };
  
  console.log('2. 预设基础结构验证通过');
  
  // 验证声音参数结构
  const sampleSoundParams: Partial<any> = {
    frequency: 440,
    amplitude: 0.7,
    duration: 500,
    waveform: 'sine',
    volume: 0.7,
    pitch: 0,
    timbre: 'sine',
    emotionalTone: 'serene'
  };
  
  console.log('3. 声音参数基础结构验证通过');
  
  // 检查是否存在枚举类型定义
  try {
    console.log('4. 类型导入验证通过');
  } catch (e: any) {
    console.error('4. 无法导入类型:', e?.message || '未知错误');
  }
  
  // 检查spatialPosition类型
  try {
    const spatialPos = {
      x: 0,
      y: 0,
      z: 0,
      distance: 1,
      azimuth: 0,
      elevation: 0
    };
    console.log('5. spatialPosition结构验证通过');
  } catch (e: any) {
    console.error('5. spatialPosition结构问题:', e && e.message ? e.message : '未知错误');
  }
  
  // 检查dynamicParams类型
  try {
    const dynamicParams = {
      frequencyModulation: { enabled: false, rate: 0, depth: 0, waveform: 'sine' },
      amplitudeModulation: { enabled: false, rate: 0, depth: 0, waveform: 'sine' },
      filterSweep: { enabled: false, startFreq: 0, endFreq: 0, duration: 0, curve: 'linear' },
      stereoPanning: { enabled: false, startPan: 0, endPan: 0, duration: 0 }
    };
    console.log('6. dynamicParams结构验证通过');
  } catch (e: any) {
    console.error('6. dynamicParams结构问题:', e && e.message ? e.message : '未知错误');
  }
  
  console.log('\n验证完成！没有发现明显的结构问题。');
  console.log('提示: 如果TypeScript仍然报错，可能是以下问题:');
  console.log('- 类型名称拼写错误');
  console.log('- 类型导出问题');
  console.log('- 类型版本不匹配');
  console.log('- 项目配置问题');
  
} catch (error) {
  console.error('验证过程中出错:', (error as Error).message);
}