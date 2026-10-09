import api from './api';

export const dashboardService = {
  getReadiness: async () => {
    const response = await api.get('/readiness/me');
    return response.data; // Note: may contain status like ROLE_HAS_NO_SKILLS
  },
  getSkillGaps: async () => {
    const response = await api.get('/skill-gaps/me');
    return response.data.data;
  },
  getRecommendations: async () => {
    const response = await api.get('/recommendations/me');
    return response.data.data;
  }
};
