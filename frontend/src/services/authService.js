import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data.data;
  },
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  }
};
