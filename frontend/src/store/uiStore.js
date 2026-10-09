import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isSidebarOpen: false, // default closed on mobile, responsive on desktop
  activeModal: null,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}));

export default useUiStore;
