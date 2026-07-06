import { create } from 'zustand';

export const use3DStore = create((set) => ({
  // Global States
  introCompleted: false,
  currentSection: 'hero', // 'hero', 'about', 'philosophy', 'categories', 'performances', 'judges', 'sponsors', 'footer'
  
  // Specific Interactions
  activePhilosophyIndex: null, // 0, 1, 2, ... or null if not focused
  hoveredCategory: null, // string ID or null
  isActivating: false, // For the success screen
  
  // Actions
  setIntroCompleted: (status) => set({ introCompleted: status }),
  setCurrentSection: (section) => set({ currentSection: section }),
  setActivePhilosophyIndex: (index) => set({ activePhilosophyIndex: index }),
  setHoveredCategory: (category) => set({ hoveredCategory: category }),
  triggerActivation: () => set({ isActivating: true }),
  resetActivation: () => set({ isActivating: false }),
}));
