import { create } from 'zustand';

/**
 * Authentication Store Foundation (Owned by Member 1)
 * Manages client user session, role, and in-memory access token
 */
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  // Placeholder actions for Phase 2
  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),
}));
