import api from './api';

export const taskProgressService = {
  getSkillTasks: async (skillId) => {
    const response = await api.get(`/students/skills/${skillId}/tasks`);
    return response.data.data;
  },

  updateTaskProgress: async (skillId, taskKey, data) => {
    const response = await api.put(`/students/skills/${skillId}/tasks/${taskKey}`, data);
    return response.data.data;
  },

  getStats: async () => {
    const response = await api.get('/students/stats/tasks-evidence');
    return response.data.data;
  },
};

export default taskProgressService;
