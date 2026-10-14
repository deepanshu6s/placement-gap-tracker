import { create } from 'zustand';

// ─── Theme helpers ────────────────────────────────────────────────────────────
const THEME_KEY = 'pt-theme';
const ONBOARDING_KEY = 'pt-onboarding-seen';

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
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
    hideOnboarding: (userId) => {
      try {
        const key = userId ? `${ONBOARDING_KEY}-${userId}` : ONBOARDING_KEY;
        localStorage.setItem(key, 'true');
      } catch {}
      set({ onboardingVisible: false });
    },
    checkAndShowOnboarding: (userId) => {
      try {
        const key = userId ? `${ONBOARDING_KEY}-${userId}` : ONBOARDING_KEY;
        const seen = localStorage.getItem(key);
        if (!seen) set({ onboardingVisible: true });
      } catch {}
    },
    hasSeenOnboarding: (userId) => {
      try {
        const key = userId ? `${ONBOARDING_KEY}-${userId}` : ONBOARDING_KEY;
        return localStorage.getItem(key) === 'true';
      } catch {
        return false;
      }
    },
  };
});

export default useUiStore;
