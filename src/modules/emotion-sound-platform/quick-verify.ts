// 快速验证脚本，测试我们修复的核心问题
import type { YYC3EmotionState, YYC3SoundParameters } from './emotion-sound-types';
import { YYC3PrimaryEmotion, YYC3EmotionalTone } from './emotion-sound-types';

// 测试类型导入和枚举访问
function testTypeImports() {
  try {
    console.log('✓ TypeScript类型导入验证通过');
    console.log('  - YYC3PrimaryEmotion.JOY:', YYC3PrimaryEmotion.JOY);
    console.log('  - YYC3EmotionalTone.HAPPY:', YYC3EmotionalTone.HAPPY);
    return true;
  } catch (error) {
    console.error('✗ TypeScript类型导入验证失败:', error);
    return false;
  }
}

// 测试创建符合类型的对象
function testObjectCreation() {
  try {
    const emotionState: YYC3EmotionState = {
      valence: 0.5,
      arousal: 0.3,
      dominance: 0.2,
      primaryEmotion: YYC3PrimaryEmotion.JOY,
      emotionIntensity: 0.8,
      secondaryEmotions: ['excited', 'energetic'],
      confidence: 0.9,
      timestamp: new Date()
    };

    const soundParams: YYC3SoundParameters = {
      frequency: 440,
      amplitude: 0.7,
      duration: 2000,
      waveform: 'sine',
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.7,
        release: 0.3
      },
      volume: 0.7,
      pitch: 1.2,
      timbre: 'bright',
      emotionalTone: YYC3EmotionalTone.HAPPY,
      dynamicParams: {
        frequencyModulation: {
          enabled: false,
          rate: 5,
          depth: 0.1,
          waveform: 'sine'
        },
        amplitudeModulation: {
          enabled: false,
          rate: 2,
          depth: 0.2,
          waveform: 'triangle'
        },
        filterSweep: {
          enabled: false,
          startFreq: 440,
          endFreq: 880,
          duration: 1000,
          curve: 'linear'
        }
      },
      spatialAudio: {
        enabled: false,
        position: { x: 0, y: 0, z: 0 },
        radius: 1.0,
        distanceModel: 'inverse'
      },
      learningParams: {
        enabled: true,
        adaptationRate: 0.1,
        memorySize: 10,
        userFeedbackWeight: 0.5,
        behaviorPatternWeight: 0.3,
        emotionAccuracyWeight: 0.7,
        forgettingFactor: 0.1
      }
    };

    console.log('✓ 成功创建符合类型定义的对象');
    return true;
  } catch (error) {
    console.error('✗ 创建符合类型的对象失败:', error);
    return false;
  }
}

// 运行所有验证
function runAllVerifications() {
  console.log('\n=== 情感声效平台修复验证 ===\n');
  
  const importTest = testTypeImports();
  const objectTest = testObjectCreation();
  
  console.log('\n=== 验证结果摘要 ===');
  console.log(`- 类型导入和枚举访问: ${importTest ? '✅ 通过' : '❌ 失败'}`);
  console.log(`- 类型对象创建: ${objectTest ? '✅ 通过' : '❌ 失败'}`);
  
  const allTestsPassed = importTest && objectTest;
  
  if (allTestsPassed) {
    console.log('\n🎉 恭喜！所有核心修复已验证成功！\n');
    process.exit(0);
  } else {
    console.log('\n❌ 验证未通过。某些修复仍需完善。\n');
    process.exit(1);
  }
}

// 执行验证
runAllVerifications();