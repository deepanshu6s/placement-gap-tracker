import { create } from 'zustand';

/**
 * UI Store Foundation (Owned by Member 5)
 * Manages global UI toggles, sidebar collapse, active modals, and toast alerts
 */
export const useUiStore = create((set) => ({
  isSidebarOpen: true,
  activeModal: null,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}));
