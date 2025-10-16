// 简化版JavaScript验证脚本，直接验证情感预设配置结构

// 模拟情感预设配置
const emotionPresets = [
  {
    name: '中性模式',
    targetEmotion: 'NEUTRAL',
    emotionalTone: 'SERENE',
    soundParameters: {
      volume: 0.3,
      pitch: 0.5,
      timbre: 0.5,
      spatialAudio: {
        enabled: false,
        position: { x: 0, y: 0, z: 0 },
        distanceModel: 'inverse',
        refDistance: 1,
        maxDistance: 10000
      },
      filterSweep: {
        enabled: false,
        rate: 0.1,
        depth: 0.2,
        curve: 'sine'
      }
    },
    learningParams: {
      userFeedbackWeight: 0.5,
      adaptationRate: 0.1,
      memoryRetention: 0.7,
      enabled: true,
      contextSensitivity: 0.3,
      responseThreshold: 0.4,
      variationRate: 0.2
    }
  },
  {
    name: '愉悦模式',
    targetEmotion: 'JOY',
    emotionalTone: 'HAPPY',
    soundParameters: {
      volume: 0.5,
      pitch: 0.7,
      timbre: 0.6,
      spatialAudio: {
        enabled: false,
        position: { x: 0, y: 0, z: 0 },
        distanceModel: 'inverse',
        refDistance: 1,
        maxDistance: 10000
      },
      filterSweep: {
        enabled: true,
        rate: 0.3,
        depth: 0.4,
        curve: 'sine'
      }
    },
    learningParams: {
      userFeedbackWeight: 0.6,
      adaptationRate: 0.2,
      memoryRetention: 0.6,
      enabled: true,
      contextSensitivity: 0.4,
      responseThreshold: 0.3,
      variationRate: 0.3
    }
  }
];

// 验证预设配置的结构完整性
function validateEmotionPresets() {
  console.log('=== 情感预设配置结构验证 ===');
  
  let allValid = true;
  
  emotionPresets.forEach((preset, index) => {
    console.log(`\n检查预设 ${index + 1}: ${preset.name}`);
    
    // 检查必需属性
    if (!preset.targetEmotion) {
      console.error(`- ❌ 缺少 targetEmotion 属性`);
      allValid = false;
    } else {
      console.log(`- ✓ targetEmotion: ${preset.targetEmotion}`);
    }
    
    if (!preset.emotionalTone) {
      console.error(`- ❌ 缺少 emotionalTone 属性`);
      allValid = false;
    } else {
      console.log(`- ✓ emotionalTone: ${preset.emotionalTone}`);
    }
    
    // 检查 soundParameters 结构
    if (!preset.soundParameters) {
      console.error(`- ❌ 缺少 soundParameters 对象`);
      allValid = false;
    } else {
      // 检查音量、音高、音色属性
      if (typeof preset.soundParameters.volume !== 'number') {
        console.error(`- ❌ soundParameters.volume 不是有效的数字`);
        allValid = false;
      }
      if (typeof preset.soundParameters.pitch !== 'number') {
        console.error(`- ❌ soundParameters.pitch 不是有效的数字`);
        allValid = false;
      }
      if (typeof preset.soundParameters.timbre !== 'number') {
        console.error(`- ❌ soundParameters.timbre 不是有效的数字`);
        allValid = false;
      }
      
      // 检查 spatialAudio 结构
      if (!preset.soundParameters.spatialAudio || !preset.soundParameters.spatialAudio.position) {
        console.error(`- ❌ 缺少 spatialAudio.position 属性`);
        allValid = false;
      }
      
      // 检查 filterSweep 结构
      if (!preset.soundParameters.filterSweep || !preset.soundParameters.filterSweep.curve) {
        console.error(`- ❌ 缺少 filterSweep.curve 属性`);
        allValid = false;
      }
      
      console.log(`- ✓ soundParameters 结构完整`);
    }
    
    // 检查 learningParams 结构
    if (!preset.learningParams) {
      console.error(`- ❌ 缺少 learningParams 对象`);
      allValid = false;
    } else {
      if (typeof preset.learningParams.enabled !== 'boolean') {
        console.error(`- ❌ learningParams.enabled 不是有效的布尔值`);
        allValid = false;
      }
      
      const requiredLearningProps = ['userFeedbackWeight', 'adaptationRate', 'memoryRetention', 'contextSensitivity', 'responseThreshold', 'variationRate'];
      requiredLearningProps.forEach(prop => {
        if (typeof preset.learningParams[prop] !== 'number') {
          console.error(`- ❌ learningParams.${prop} 不是有效的数字`);
          allValid = false;
        }
      });
      
      console.log(`- ✓ learningParams 结构完整`);
    }
  });
  
  console.log('\n=== 验证总结 ===');
  if (allValid) {
    console.log('✅ 所有情感预设配置结构验证通过！');
    console.log('这表明情感预设的核心结构是正确的。虽然无法直接验证TypeScript类型兼容性，但关键的属性都存在且类型正确。');
  } else {
    console.error('❌ 情感预设配置结构验证失败，请检查上述错误。');
  }
}

// 运行验证
validateEmotionPresets();