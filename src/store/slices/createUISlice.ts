// src/store/slices/createUISlice.ts
import { StateCreator } from 'zustand';
import { AllSlices } from '../app-store';

// 临时定义ModuleId类型以解决构建错误
// 实际项目中应该从正确的位置导入
export enum ModuleId {
  AUDIT = 'audit',
  OTHER_MODULES = 'other-modules'
}

export interface UISlice {
  activeModule: ModuleId;
  setActiveModule: (moduleId: ModuleId) => void;
}

export const createUISlice: StateCreator<AllSlices, [], [], UISlice> = (set) => ({
  activeModule: ModuleId.AUDIT,
  setActiveModule: (moduleId) => set({ activeModule: moduleId }),
});