import { create } from 'zustand';

// ─── Theme helpers ────────────────────────────────────────────────────────────
const THEME_KEY = 'pt-theme';
const ONBOARDING_KEY = 'pt-onboarding-seen';

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
  }
};

const getSavedTheme = () => {
  try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
};

export const useUiStore = create((set) => {
  const initialTheme = getSavedTheme();
  applyTheme(initialTheme);

  return {
    // ── Sidebar ──────────────────────────────────────────────────────────────
    isSidebarOpen: false,
    activeModal: null,

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    openSidebar:  () => set({ isSidebarOpen: true }),
    closeSidebar: () => set({ isSidebarOpen: false }),
    openModal:  (modalId) => set({ activeModal: modalId }),
    closeModal: () => set({ activeModal: null }),

    // ── Theme ─────────────────────────────────────────────────────────────────
    theme: initialTheme,
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch {}
        return { theme: next };
      }),
    setTheme: (theme) => {
      applyTheme(theme);
      try { localStorage.setItem(THEME_KEY, theme); } catch {}
      set({ theme });
    },

    // ── Onboarding ────────────────────────────────────────────────────────────
    onboardingVisible: false,
    showOnboarding: () => set({ onboardingVisible: true }),
    hideOnboarding: () => {
      try { localStorage.setItem(ONBOARDING_KEY, 'true'); } catch {}
      set({ onboardingVisible: false });
    },
    checkAndShowOnboarding: () => {
      try {
        const seen = localStorage.getItem(ONBOARDING_KEY);
        if (!seen) set({ onboardingVisible: true });
      } catch {}
    },
  };
});

export default useUiStore;
