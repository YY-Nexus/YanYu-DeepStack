// YYC³ 情感声效交互平台 - 核心模块
import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';

// 导入类型
import { 
  YYC3PrimaryEmotion, 
  YYC3EmotionState, 
  YYC3SoundParameters,
  YYC3EmotionSoundHook 
} from './emotion-sound-types';

// YYC³ 情感声效映射器
export class YYC3EmotionSoundMapper {
  public mapEmotionToSound(emotion: YYC3EmotionState): YYC3SoundParameters {
    // 简化的映射逻辑
    return {
      frequency: 440 + (emotion.valence * 100),
      amplitude: 0.5 + (emotion.arousal * 0.25),
      duration: 500 + (emotion.emotionIntensity * 300),
      waveform: 'sine',
      envelope: {
        attack: 50,
        decay: 100,
        sustain: 0.7,
        release: 200
      },
      volume: 0.3,
      pitch: 0,
      timbre: 'sine',
      emotionalTone: YYC3EmotionalTone.SERENE,
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
    };
  }
}

// YYC³ 情感声效管理器
export class YYC3EmotionSoundManager {
  private mapper: YYC3EmotionSoundMapper;
  private isEnabled: boolean = true;
  private currentEmotion: YYC3EmotionState | null = null;

  constructor() {
    this.mapper = new YYC3EmotionSoundMapper();
  }

  public async playEmotionSound(emotion: YYC3EmotionState): Promise<void> {
    if (!this.isEnabled) return;
    
    const soundParams = this.mapper.mapEmotionToSound(emotion);
    this.currentEmotion = emotion;
    
    // 模拟音频播放
    console.log('播放情感声效:', emotion.primaryEmotion, soundParams);
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public setVolume(volume: number): void {
    // 音量设置逻辑
  }

  public getCurrentEmotion(): YYC3EmotionState | null {
    return this.currentEmotion;
  }
}

// YYC³ 情感声效上下文
export const YYC3EmotionSoundContext = createContext<{
  soundManager: YYC3EmotionSoundManager;
  playEmotionSound: (emotion: YYC3EmotionState) => Promise<void>;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  getCurrentEmotion: () => YYC3EmotionState | null;
} | null>(null);

// YYC³ 情感声效提供者组件
export const YYC3EmotionSoundProvider: React.FC<{
  children: React.ReactNode;
  enabled?: boolean;
  volume?: number;
}> = ({ children, enabled = true, volume = 0.3 }) => {
  const soundManagerRef = useRef<YYC3EmotionSoundManager | undefined>(undefined);
  
  if (!soundManagerRef.current) {
    soundManagerRef.current = new YYC3EmotionSoundManager();
  }
  
  const soundManager = soundManagerRef.current;

  useEffect(() => {
    soundManager.setEnabled(enabled);
  }, [enabled, soundManager]);

  useEffect(() => {
    soundManager.setVolume(volume);
  }, [volume, soundManager]);

  const playEmotionSound = useCallback(async (emotion: YYC3EmotionState) => {
    await soundManager.playEmotionSound(emotion);
  }, [soundManager]);

  const setEnabled = useCallback((enabled: boolean) => {
    soundManager.setEnabled(enabled);
  }, [soundManager]);

  const setVolume = useCallback((volume: number) => {
    soundManager.setVolume(volume);
  }, [soundManager]);

  const getCurrentEmotion = useCallback(() => {
    return soundManager.getCurrentEmotion();
  }, [soundManager]);

  const contextValue = {
    soundManager,
    playEmotionSound,
    setEnabled,
    setVolume,
    getCurrentEmotion
  };

  return (
    <YYC3EmotionSoundContext.Provider value={contextValue}>
      {children}
    </YYC3EmotionSoundContext.Provider>
  );
};

// YYC³ 情感声效钩子
export const useYYC3EmotionSound = () => {
  const context = useContext(YYC3EmotionSoundContext);
  
  if (!context) {
    throw new Error('useYYC3EmotionSound 必须在 YYC3EmotionSoundProvider 内使用');
  }
  
  return context;
};

// 导出情感声调枚举（需要在 types 文件中定义）
export enum YYC3EmotionalTone {
  SERENE = 'serene',
  HAPPY = 'happy',
  CALM = 'calm',
  TENSE = 'tense',
  EXCITED = 'excited',
  RELAXED = 'relaxed'
}
