// src/store/app-store.test.ts
import { useAppStore } from './app-store';
import { act } from '@testing-library/react';
import { ModuleId } from '@/src/core/module-system';

describe('AppStore Zustand Store', () => {
  it('should have correct initial state', () => {
    const { activeModule, accessibility } = useAppStore.getState();

    // 验证 UI Slice 的初始状态
    expect(activeModule).toBe(ModuleId.AUDIT);

    // 验证 Accessibility Slice 的初始状态
    expect(accessibility.fontSize).toBe(16);
    expect(accessibility.highContrast).toBe(false);
  });

  it('should correctly update the active module', () => {
    // 使用 act 来包装状态更新
    act(() => {
      useAppStore.getState().setActiveModule(ModuleId.EMOTION);
    });

    expect(useAppStore.getState().activeModule).toBe(ModuleId.EMOTION);
  });

  it('should correctly update accessibility settings', () => {
    act(() => {
      useAppStore.getState().updateAccessibility({ fontSize: 20, highContrast: true });
    });

    const { accessibility } = useAppStore.getState();
    expect(accessibility.fontSize).toBe(20);
    expect(accessibility.highContrast).toBe(true);
  });
});