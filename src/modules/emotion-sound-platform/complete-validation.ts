// 完整的类型验证脚本
// 此脚本用于检查所有情感声音平台的类型定义和使用

// 1. 首先导入必要的类型
try {
  const { 
    YYC3PrimaryEmotion, 
    YYC3EmotionalTone, 
    YYC3SoundParameters, 
    YYC3EmotionSoundPreset, 
    YYC3PresetUsage, 
    YYC3Waveform,
    YYC3RoomSize,
    YYC3WallMaterial
  } = require('./emotion-sound-types');
  
  console.log('✓ 成功导入所有类型定义');
  
  // 2. 检查类型结构
  console.log('\n=== 检查类型结构 ===');
  
  // 检查主要情感类型
  if (typeof YYC3PrimaryEmotion === 'object') {
    console.log('✓ YYC3PrimaryEmotion 是对象类型');
    console.log('  可用值:', Object.keys(YYC3PrimaryEmotion));
  } else {
    console.log('✗ YYC3PrimaryEmotion 不是对象类型，而是:', typeof YYC3PrimaryEmotion);
  }
  
  // 检查情感语调类型
  if (typeof YYC3EmotionalTone === 'object') {
    console.log('✓ YYC3EmotionalTone 是对象类型');
    console.log('  可用值:', Object.keys(YYC3EmotionalTone));
  } else {
    console.log('✗ YYC3EmotionalTone 不是对象类型，而是:', typeof YYC3EmotionalTone);
  }
  
  // 检查波形类型
  if (typeof YYC3Waveform === 'object') {
    console.log('✓ YYC3Waveform 是对象类型');
    console.log('  可用值:', Object.keys(YYC3Waveform));
  } else {
    console.log('✗ YYC3Waveform 不是对象类型，而是:', typeof YYC3Waveform);
  }
  
  // 3. 测试创建符合类型的对象
  console.log('\n=== 测试创建符合类型的对象 ===');
  
  try {
    // 创建一个最小化的有效配置
    const minimalPreset = {
      id: 'test',
      name: '测试预设',
      targetEmotion: 'neutral',
      usage: 'feedback',
      soundParameters: {
        frequency: 440,
        amplitude: 0.7,
        duration: 500,
        waveform: 'sine',
        envelope: {
          attack: 50,
          decay: 100,
          sustain: 0.7,
          release: 200
        },
        volume: 0.7,
        pitch: 0,
        timbre: 'sine',
        emotionalTone: 'serene',
        dynamicParams: {
          frequencyModulation: { enabled: false, rate: 0, depth: 0, waveform: 'sine' },
          amplitudeModulation: { enabled: false, rate: 0, depth: 0, waveform: 'sine' },
          filterSweep: { enabled: false, startFreq: 0, endFreq: 0, duration: 0, curve: 'linear' }
        },
        spatialAudio: {
          enabled: false,
          position: { x: 0, y: 0, z: 0 },
          radius: 1
        },
        learningParams: {
          enabled: false,
          adaptationRate: 0.1,
          memorySize: 10,
          userFeedbackWeight: 0.5,
          behaviorPatternWeight: 0.5,
          emotionAccuracyWeight: 0.5,
          forgettingFactor: 0.1
        }
      }
    };
    
    console.log('✓ 创建最小化预设配置成功');
    
    // 检查是否存在空间音频属性
    // spatialAudio是YYC3SoundParameters接口的必填属性
    if (minimalPreset.soundParameters.spatialAudio === undefined) {
      console.log('✗ soundParameters 中缺少 spatialAudio 属性，根据类型定义这是必填项');
      console.log('✓ 已识别类型错误，需要在soundParameters中添加spatialAudio属性');
    }
    
    // 4. 检查是否缺少必要的类型
    console.log('\n=== 检查是否缺少必要的类型 ===');
    
    if (typeof YYC3RoomSize === 'undefined') {
      console.log('✗ YYC3RoomSize 类型未定义');
    }
    
    if (typeof YYC3WallMaterial === 'undefined') {
      console.log('✗ YYC3WallMaterial 类型未定义');
    }
    
  } catch (error) {
    console.error('✗ 创建预设配置时出错:', (error as Error).message);
  }
  
} catch (error) {
    console.error('✗ 导入类型时出错:', (error as Error).message);
  
  // 尝试直接检查模块结构
  try {
    const emotionModule = require('./emotion-sound-types');
    console.log('\n=== 模块结构分析 ===');
    console.log('模块导出的所有内容:', Object.keys(emotionModule));
  } catch (moduleError) {
    console.error('✗ 无法分析模块结构:', (moduleError as Error).message);
  }
}

console.log('\n=== 验证完成 ===');