// src/store/slices/createAccessibilitySlice.ts
import { StateCreator } from 'zustand';
import { AllSlices } from '../app-store';

export interface AccessibilityState {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface AccessibilitySlice {
  accessibility: AccessibilityState;
  updateAccessibility: (newSettings: Partial<AccessibilityState>) => void;
}

export const createAccessibilitySlice: StateCreator<AllSlices, [], [], AccessibilitySlice> = (set, get) => ({
  accessibility: {
    fontSize: 16,
    highContrast: false,
    reducedMotion: false,
  },
  updateAccessibility: (newSettings) => {
    set((state) => ({
      accessibility: { ...state.accessibility, ...newSettings },
    }));
  },
});