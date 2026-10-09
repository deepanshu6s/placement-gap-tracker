import api from './api';

export const preparationService = {
  getLogs: async () => {
    const response = await api.get('/preparation/me');
    return response.data.data;
  },
  logActivity: async (data) => {
    const response = await api.post('/preparation/me', data);
    return response.data.data;
  }
};
