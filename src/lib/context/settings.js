import { create } from 'zustand'

const SIDEPANEL_KEY = 'sidePanelModeV1'

export const useSettings = create((set) => ({
  sidePanelMode: typeof window !== 'undefined' ? (localStorage.getItem(SIDEPANEL_KEY) || 'auto') : 'auto',
  setSidePanelMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEPANEL_KEY, mode)
    }
    set({ sidePanelMode: mode })
  }
}))
