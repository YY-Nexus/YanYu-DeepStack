import { StateCreator } from 'zustand'

export interface MobileSlice {
  isMobileMenuOpen: boolean
  isMobileDevice: boolean
  toggleMobileMenu: () => void
  setMobileDevice: (isMobile: boolean) => void
  closeMobileMenu: () => void
}

export const createMobileSlice: StateCreator<MobileSlice> = (set) => ({
  isMobileMenuOpen: false,
  isMobileDevice: false,
  
  toggleMobileMenu: () =>
    set((state) => ({
      isMobileMenuOpen: !state.isMobileMenuOpen,
    })),
    
  setMobileDevice: (isMobile: boolean) =>
    set({ isMobileDevice: isMobile }),
    
  closeMobileMenu: () =>
    set({ isMobileMenuOpen: false }),
})