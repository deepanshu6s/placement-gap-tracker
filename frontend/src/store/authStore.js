import { create } from 'zustand';

/**
 * Global Authentication Store
 * Manages authenticated user state, JWT access token, and active session status
 */
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (userOrPayload, maybeToken) => {
    let user = null;
    let token = null;

    if (maybeToken) {
      user = userOrPayload;
      token = maybeToken;
    } else if (userOrPayload && typeof userOrPayload === 'object') {
      user = userOrPayload.user || userOrPayload;
      token = userOrPayload.accessToken || userOrPayload.token || null;
    }

    set({
      user,
      accessToken: token,
      isAuthenticated: Boolean(user && token),
    });
  },

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),
}));

export default useAuthStore;
