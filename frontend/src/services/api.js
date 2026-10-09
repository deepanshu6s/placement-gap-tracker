import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach current in-memory access token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and refresh access token cleanly
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints to prevent loops
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token present');

        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });

        // Backend returns: { success: true, data: { accessToken, refreshToken } }
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        const currentUser = useAuthStore.getState().user;
        useAuthStore.getState().setAuth(currentUser, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        localStorage.removeItem('refreshToken');

        // Only redirect to login if user is currently inside a protected route
        const path = window.location.pathname;
        if (path.startsWith('/student') || path.startsWith('/faculty')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
