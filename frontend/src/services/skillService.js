import api from './api';

export const skillService = {
  getSkillDetail: async (skillId) => {
    const response = await api.get(`/skills/${skillId}/detail`);
    return response.data.data;
  },

  getAllSkills: async () => {
    const response = await api.get('/skills');
    return response.data.data;
  },
};

export default skillService;
