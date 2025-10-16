# YYC³ 情感声效交互平台

基于言语云立方³(YanYuCloudCube)架构的情感化智能声效交互系统，让情感与声音共舞，创造有温度的人机交互体验。

## 🏗️ 架构概述

### 4层架构集成

- **言(Yan)层**: 多模态情感输入捕获 (文本、语音、视觉、行为)
- **语(Yu)层**: 情感智能分析和理解 (NLP、情感识别、意图分析)
- **云(Cloud)层**: 云端AI服务集成和数据同步
- **立方³(Cube)层**: 声效合成、播放控制和系统集成

### 核心特性

- 🎵 **实时情感声效合成** - 基于Russell情感环型模型的音频参数映射
- 🧠 **多模态情感识别** - 支持文本、语音、视觉、行为等多种输入方式
- 🔊 **Web Audio API驱动** - 原生浏览器音频处理，无需插件
- 🎨 **情感可视化** - 实时情感状态和声效波形可视化展示
- 🎛️ **个性化适应** - 基于用户反馈的声效参数自适应调整
- 🌐 **品牌标准化** - 严格遵循YYC³命名规范和架构标准

## 📦 安装使用

### 基础安装

```bash
npm install @yyc3/emotion-sound-platform
```

### 依赖要求

```json
{
  "react": "^18.0.0",
  "framer-motion": "^10.0.0",
  "@mui/material": "^5.0.0",
  "@mui/icons-material": "^5.0.0"
}
```

## 🚀 快速开始

### 1. 基础使用

```tsx
import React from "react";
import {
  YYC3EmotionSoundProvider,
  YYC3EmotionSoundControlPanel,
  useYYC3EmotionSound,
} from "@yyc3/emotion-sound-platform";

function App() {
  return (
    <YYC3EmotionSoundProvider enabled={true} volume={0.3}>
      <EmotionSoundDemo />
    </YYC3EmotionSoundProvider>
  );
}

function EmotionSoundDemo() {
  const { playEmotionSound } = useYYC3EmotionSound();

  const handlePlayJoySound = async () => {
    await playEmotionSound({
      valence: 0.8,
      arousal: 0.6,
      dominance: 0.4,
      primaryEmotion: "joy",
      emotionIntensity: 0.8,
      confidence: 0.9,
      timestamp: new Date(),
    });
  };

  return (
    <div>
      <YYC3EmotionSoundControlPanel />
      <button onClick={handlePlayJoySound}>播放快乐声效</button>
    </div>
  );
}
```

### 2. 完整功能演示

```tsx
import React from "react";
import {
  YYC3EmotionSoundProvider,
  YYC3EmotionSoundDemoPage,
} from "@yyc3/emotion-sound-platform";

export default function EmotionSoundApp() {
  return (
    <YYC3EmotionSoundProvider enabled={true} volume={0.3}>
      <YYC3EmotionSoundDemoPage />
    </YYC3EmotionSoundProvider>
  );
}
```

## 🎯 核心API

### 情感状态接口

```typescript
interface YYC3EmotionState {
  valence: number; // 效价 [-1, 1]: 负面到正面
  arousal: number; // 唤醒度 [-1, 1]: 平静到兴奋
  dominance: number; // 支配性 [-1, 1]: 被动到主动

  primaryEmotion: YYC3PrimaryEmotion;
  emotionIntensity: number; // [0, 1]: 情绪强度
  confidence: number; // [0, 1]: 识别置信度
  timestamp: Date;
}
```

### 声效参数接口

```typescript
interface YYC3SoundParameters {
  frequency: number; // 频率 (Hz)
  amplitude: number; // 振幅 [0, 1]
  duration: number; // 持续时间 (ms)
  waveform: YYC3Waveform; // 波形类型
  envelope: YYC3SoundEnvelope; // 包络参数
  harmonics: number[]; // 泛音列表
  emotionalTone: YYC3EmotionalTone;
}
```

### 主要钩子函数

```typescript
const {
  playEmotionSound, // 播放情感声效
  setEnabled, // 启用/禁用声效
  setVolume, // 设置音量
  getCurrentEmotion, // 获取当前情感状态
} = useYYC3EmotionSound();
```

## 🎨 组件库

### 控制组件

- `YYC3EmotionSoundControlPanel` - 声效控制面板
- `YYC3EmotionSoundSettings` - 详细设置对话框
- `YYC3EmotionSoundTester` - 情感声效测试器

### 显示组件

- `YYC3EmotionStateDisplay` - 情感状态显示组件
- `YYC3EmotionSoundVisualizer` - 声效可视化组件
- `YYC3EmotionSoundPresetSelector` - 预设选择器

### 演示组件

- `YYC3EmotionSoundDemoPage` - 完整功能演示页面

## ⚙️ 配置选项

### 全局配置

```typescript
interface YYC3EmotionSoundConfig {
  globalSettings: {
    enabled: boolean;
    masterVolume: number; // [0, 1]
    sampleRate: number; // 采样率 (Hz)
    maxPolyphony: number; // 最大同时声音数
  };

  emotionMapping: {
    sensitivityLevel: number; // [0, 1]: 情感敏感度
    adaptationRate: number; // [0, 1]: 适应速度
    smoothingFactor: number; // [0, 1]: 平滑因子
  };

  audioQuality: {
    bitDepth: 16 | 24 | 32;
    dynamicRange: number; // dB
    distortionLimit: number; // %
  };
}
```

### 情感映射规则

#### 频率映射

- **正面情绪** (joy, surprise) → **高频率** (880-1760 Hz)
- **负面情绪** (sadness, fear) → **低频率** (220-440 Hz)
- **激烈情绪** (anger, disgust) → **中频率** (440-880 Hz)

#### 音色映射

- **快乐** → 纯净正弦波 + 丰富泛音
- **悲伤** → 柔和正弦波 + 低通滤波
- **愤怒** → 尖锐方波 + 高Q滤波
- **恐惧** → 不稳定锯齿波 + 颤音
- **惊讶** → 锐利三角波 + 快速包络
- **厌恶** → 噪声波 + 带阻滤波

#### 动态参数

- **唤醒度** → 影响音量和动画速度
- **效价** → 影响音调高低和色彩
- **支配性** → 影响泛音丰富度和空间感

## 🌟 高级特性

### 1. 空间音频支持

```typescript
interface YYC3SpatialAudioConfig {
  enabled: boolean;
  hrtf: {
    enabled: boolean;
    profile: "generic" | "personalized";
  };
  roomAcoustics: {
    enabled: boolean;
    roomSize: YYC3RoomSize;
    reverbTime: number;
  };
}
```

### 2. 文化适应性

```typescript
interface YYC3CulturalContext {
  region: string;
  emotionExpression: number; // 情感表达强度
  socialNorms: YYC3SocialNorm[];
  languageStyle: "direct" | "indirect" | "contextual";
}
```

### 3. 个性化学习

```typescript
interface YYC3LearningParameters {
  userFeedbackWeight: number; // 用户反馈权重
  behaviorPatternWeight: number; // 行为模式权重
  adaptationRate: number; // 适应速度
  forgettingFactor: number; // 遗忘因子
}
```

## 🧪 测试和调试

### 情感声效测试器

使用内置的测试器组件快速验证不同情感状态的声效表现:

```tsx
import { YYC3EmotionSoundTester } from "@yyc3/emotion-sound-platform";

<YYC3EmotionSoundTester />;
```

### 可视化调试

通过可视化组件实时观察情感状态和声效参数的变化:

```tsx
import { YYC3EmotionSoundVisualizer } from "@yyc3/emotion-sound-platform";

<YYC3EmotionSoundVisualizer
  emotion={currentEmotion}
  soundParameters={soundParams}
  width={400}
  height={200}
/>;
```

## 📊 性能优化

### 音频优化

- **缓冲区管理**: 智能音频缓冲区大小调整
- **CPU使用率**: 限制最大CPU使用率
- **内存管理**: 自动清理未使用的音频资源
- **延迟优化**: 目标延迟 < 20ms

### 渲染优化

- **虚拟化**: 大量数据的虚拟化渲染
- **动画节流**: 智能动画帧率控制
- **状态缓存**: 情感状态变化的智能缓存

## 🔧 扩展开发

### 自定义情感映射器

```typescript
import { YYC3EmotionSoundMapper } from "@yyc3/emotion-sound-platform";

class CustomEmotionMapper extends YYC3EmotionSoundMapper {
  protected mapEmotionToSound(emotion: YYC3EmotionState): YYC3SoundParameters {
    // 自定义映射逻辑
    return {
      frequency: this.customFrequencyMapping(emotion),
      amplitude: this.customAmplitudeMapping(emotion),
      // ... 其他参数
    };
  }
}
```

### 自定义音效预设

```typescript
const customPresets: YYC3EmotionSoundPreset[] = [
  {
    id: "custom-joy",
    name: "欢快旋律",
    targetEmotion: YYC3PrimaryEmotion.JOY,
    soundParameters: {
      frequency: 880,
      amplitude: 0.7,
      duration: 1200,
      waveform: YYC3Waveform.SINE,
      // ... 其他参数
    },
    usage: YYC3PresetUsage.CELEBRATION,
  },
];
```

## 🌍 国际化支持

目前支持语言:

- 🇨🇳 中文 (默认)
- 🇺🇸 English
- 🇯🇵 日本語

添加新语言支持:

```typescript
import { addLocale } from "@yyc3/emotion-sound-platform/i18n";

addLocale("fr", {
  "emotion.joy": "Joie",
  "emotion.sadness": "Tristesse",
  // ... 其他翻译
});
```

## 📚 深入理解

### 情感计算理论基础

本系统基于以下心理学和计算机科学理论：

1. **Russell环形模型**: 效价-唤醒度二维情感空间
2. **Ekman基本情绪**: 六种基本情绪分类
3. **PAD模型**: 效价-唤醒度-支配性三维情感模型
4. **音乐情感理论**: 音乐参数与情感感知的关系

### 技术实现原理

1. **Web Audio API**: 现代浏览器的原生音频处理
2. **实时合成**: 基于振荡器的实时音频合成
3. **参数映射**: 情感维度到音频参数的数学映射
4. **自适应学习**: 基于用户反馈的参数优化算法

## 🤝 贡献指南

欢迎参与YYC³情感声效交互平台的开发！

### 开发环境搭建

```bash
# 克隆仓库
git clone https://github.com/yyc3/emotion-sound-platform

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build
```

### 提交代码

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

### 代码规范

- 遵循YYC³命名规范
- 使用TypeScript严格模式
- 编写完整的类型定义
- 添加适当的注释和文档
- 确保测试覆盖率 > 80%

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

特别感谢以下项目和研究：

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Russell's Circumplex Model](https://en.wikipedia.org/wiki/Emotion_classification#Circumplex_model)
- [Ekman's Basic Emotions](https://en.wikipedia.org/wiki/Emotion_classification#Basic_emotions)
- [PAD Emotional State Model](https://en.wikipedia.org/wiki/PAD_emotional_state_model)

## 📞 联系我们

- 🌐 官网: [https://yyc3.dev](https://yyc3.dev)
- 📧 邮箱: [contact@yyc3.dev](mailto:contact@yyc3.dev)
- 💬 讨论: [GitHub Discussions](https://github.com/yyc3/emotion-sound-platform/discussions)
- 🐛 问题: [GitHub Issues](https://github.com/yyc3/emotion-sound-platform/issues)

---

---

### 关于项目

> 让情感与声音共舞，创造有温度的人机交互体验

Made with ❤️ by YYC³ Team
