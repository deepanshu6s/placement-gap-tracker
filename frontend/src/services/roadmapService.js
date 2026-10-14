import api from './api';

export const roadmapService = {
  getRoadmap: async (roleId = null) => {
    const url = roleId ? `/students/roadmap?role_id=${roleId}` : '/students/roadmap';
    const response = await api.get(url);
    return response.data.data;
  },
};

export default roadmapService;
