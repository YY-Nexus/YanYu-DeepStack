import { YYC3PrimaryEmotion, YYC3EmotionalTone, YYC3SoundParameters } from './emotion-sound-types';

// 定义情感预设接口
export interface YYC3EmotionPreset {
  name: string;
  targetEmotion: YYC3PrimaryEmotion;
  emotionalTone: YYC3EmotionalTone;
  soundParameters: YYC3SoundParameters;
}

// 模拟情感预设配置
const emotionPresets: YYC3EmotionPreset[] = [
  {
    name: '中性模式',
    targetEmotion: YYC3PrimaryEmotion.NEUTRAL,
    emotionalTone: YYC3EmotionalTone.SERENE,
    soundParameters: {
      frequency: 440,
      amplitude: 0.8,
      duration: 1000,
      waveform: 'sine',
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.7,
        release: 0.5
      },
      volume: 0.3,
      pitch: 0.5,
      timbre: 'neutral',
      emotionalTone: YYC3EmotionalTone.SERENE,
      dynamicParams: {
        frequencyModulation: {
          enabled: false,
          rate: 0.1,
          depth: 0.2,
          waveform: 'sine'
        },
        amplitudeModulation: {
          enabled: false,
          rate: 0.1,
          depth: 0.2,
          waveform: 'sine'
        },
        filterSweep: {
          enabled: false,
          startFreq: 440,
          endFreq: 880,
          duration: 1000,
          curve: 'sine'
        }
      },
      spatialAudio: {
        enabled: false,
        position: { x: 0, y: 0, z: 0 },
        radius: 1,
        distanceModel: 'inverse',
        refDistance: 1,
        maxDistance: 10000
      },
      learningParams: {
        enabled: true,
        adaptationRate: 0.1,
        memorySize: 100,
        userFeedbackWeight: 0.5,
        behaviorPatternWeight: 0.3,
        emotionAccuracyWeight: 0.7,
        forgettingFactor: 0.1
      }
    }
  },
  {
    name: '愉悦模式',
    targetEmotion: YYC3PrimaryEmotion.JOY,
    emotionalTone: YYC3EmotionalTone.HAPPY,
    soundParameters: {
      frequency: 550,
      amplitude: 0.9,
      duration: 1000,
      waveform: 'sine',
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.8,
        release: 0.5
      },
      volume: 0.5,
      pitch: 0.7,
      timbre: 'bright',
      emotionalTone: YYC3EmotionalTone.HAPPY,
      dynamicParams: {
        frequencyModulation: {
          enabled: true,
          rate: 0.2,
          depth: 0.3,
          waveform: 'sine'
        },
        amplitudeModulation: {
          enabled: true,
          rate: 0.2,
          depth: 0.3,
          waveform: 'sine'
        },
        filterSweep: {
          enabled: true,
          startFreq: 440,
          endFreq: 1000,
          duration: 1000,
          curve: 'sine'
        }
      },
      spatialAudio: {
        enabled: false,
        position: { x: 0, y: 0, z: 0 },
        radius: 1,
        distanceModel: 'inverse',
        refDistance: 1,
        maxDistance: 10000
      },
      learningParams: {
        enabled: true,
        adaptationRate: 0.1,
        memorySize: 100,
        userFeedbackWeight: 0.5,
        behaviorPatternWeight: 0.3,
        emotionAccuracyWeight: 0.7,
        forgettingFactor: 0.1
      }
    }
  }
];

// 验证预设配置的类型兼容性
function validateEmotionPresets() {
  console.log('=== 情感预设配置类型验证 ===');
  
  try {
    // 尝试访问每个预设的属性以验证类型兼容性
    emotionPresets.forEach((preset, index) => {
      console.log(`\n预设 ${index + 1}: ${preset.name}`);
      console.log(`- targetEmotion: ${preset.targetEmotion}`);
      console.log(`- emotionalTone: ${preset.emotionalTone}`);
      console.log(`- soundParameters.volume: ${preset.soundParameters.volume}`);
      console.log(`- soundParameters.pitch: ${preset.soundParameters.pitch}`);
      console.log(`- soundParameters.timbre: ${preset.soundParameters.timbre}`);
      console.log(`- soundParameters.spatialAudio.position: {x: ${preset.soundParameters.spatialAudio.position.x}, y: ${preset.soundParameters.spatialAudio.position.y}, z: ${preset.soundParameters.spatialAudio.position.z}}`);
      console.log(`- soundParameters.learningParams.enabled: ${preset.soundParameters.learningParams.enabled}`);
      console.log(`- soundParameters.learningParams.adaptationRate: ${preset.soundParameters.learningParams.adaptationRate}`);
    });
    
    console.log('\n✅ 所有情感预设配置类型验证通过！');
  } catch (error) {
    console.error('❌ 情感预设配置类型验证失败:', error);
  }
}

// 运行验证
validateEmotionPresets();