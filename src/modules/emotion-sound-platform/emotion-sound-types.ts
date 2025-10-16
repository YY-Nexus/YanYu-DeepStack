// 情感声效类型定义 - 统一版本

// 预设用途枚举
export enum YYC3PresetUsage {
  FEEDBACK = 'feedback',
  AMBIENT = 'ambient',
  INTERACTION = 'interaction',
  GUIDANCE = 'guidance',
  ALERT = 'alert'
}

// 波形类型枚举
export enum YYC3Waveform {
  SINE = 'sine',
  SQUARE = 'square',
  TRIANGLE = 'triangle',
  SAWTOOTH = 'sawtooth',
  NOISE = 'noise'
}

// 房间大小枚举
export enum YYC3RoomSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  HALL = 'hall'
}

// 墙壁材料枚举
export enum YYC3WallMaterial {
  CONCRETE = 'concrete',
  WOOD = 'wood',
  GLASS = 'glass',
  CARPET = 'carpet',
  CURTAIN = 'curtain'
}

// 情感预设接口
export interface YYC3EmotionSoundPreset {
  id: string;
  name: string;
  targetEmotion: YYC3PrimaryEmotion;
  usage: YYC3PresetUsage;
  soundParameters: YYC3SoundParameters;
}

// 主要情感类型枚举
export enum YYC3PrimaryEmotion {
  JOY = 'joy',
  SADNESS = 'sadness', 
  ANGER = 'anger',
  FEAR = 'fear',
  SURPRISE = 'surprise',
  DISGUST = 'disgust',
  NEUTRAL = 'neutral'
}

// 情感声调类型
export enum YYC3EmotionalTone {
  SERENE = 'serene',
  HAPPY = 'happy',
  CALM = 'calm',
  TENSE = 'tense',
  EXCITED = 'excited',
  RELAXED = 'relaxed'
}

// 情感状态接口
export interface YYC3EmotionState {
  // 核心情感维度
  valence: number;           // 效价 [-1, 1]: 负面到正面
  arousal: number;           // 唤醒度 [-1, 1]: 平静到兴奋  
  dominance: number;         // 支配性 [-1, 1]: 被动到主动
  primaryEmotion: YYC3PrimaryEmotion;  // 主要情感
  emotionIntensity: number;  // 情感强度 [0, 1]
  secondaryEmotions: string[]; // 次级情感
  confidence: number;        // 置信度 [0, 1]
  timestamp: Date;           // 时间戳
}

// 动态参数接口
export interface YYC3DynamicParams {
  frequencyModulation: {
    enabled: boolean;
    rate: number;
    depth: number;
    waveform: string;
  };
  amplitudeModulation: {
    enabled: boolean;
    rate: number;
    depth: number;
    waveform: string;
  };
  filterSweep: {
    enabled: boolean;
    startFreq: number;
    endFreq: number;
    duration: number;
    curve: string;
  };
  stereoPanning?: {
    enabled: boolean;
    startPan: number;
    endPan: number;
    duration: number;
  };
}

// 空间音频参数
export interface YYC3SpatialAudio {
  enabled: boolean;
  position: { x: number; y: number; z: number };
  radius: number;
  distanceModel?: string;
  maxDistance?: number;
  refDistance?: number;
  rolloffFactor?: number;
}

// 学习参数
export interface YYC3LearningParameters {
  enabled: boolean;
  adaptationRate: number;
  memorySize: number;
  userFeedbackWeight: number;
  behaviorPatternWeight: number;
  emotionAccuracyWeight: number;
  forgettingFactor: number;
}

// 声效参数接口
export interface YYC3SoundParameters {
  frequency: number;
  amplitude: number;
  duration: number;
  waveform: string;
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  volume: number;
  pitch: number;
  timbre: string;
  emotionalTone: YYC3EmotionalTone;
  dynamicParams: YYC3DynamicParams;
  spatialAudio: YYC3SpatialAudio;
  learningParams: YYC3LearningParameters;
}

// 情感声效钩子返回类型
export interface YYC3EmotionSoundHook {
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  getCurrentEmotion: () => YYC3EmotionState | null;
  playEmotionSound: (emotion: YYC3EmotionState) => Promise<void>;
}
