import api from './api';

export const studentService = {
  getProfile: async () => {
    const response = await api.get('/students/me');
    return response.data.data;
  },
  setupProfile: async (profileData) => {
    const response = await api.post('/students/me', profileData);
    return response.data.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/students/me', profileData);
    return response.data.data;
  }
};

export const roleService = {
  getRoles: async () => {
    const response = await api.get('/roles');
    return response.data.data;
  },
  getRoleDetails: async (roleId) => {
    const response = await api.get(`/roles/${roleId}`);
    return response.data.data;
  }
};
