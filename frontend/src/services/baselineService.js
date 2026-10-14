import api from './api';

export const baselineService = {
  getBaseline: async (roleId = null) => {
    const url = roleId ? `/students/skill-baseline?role_id=${roleId}` : '/students/skill-baseline';
    const response = await api.get(url);
    return response.data.data;
  },

  saveBaseline: async (roleId, ratings) => {
    const response = await api.post('/students/skill-baseline', {
      role_id: roleId,
      ratings,
    });
    return response.data.data;
  },

  updateSkillRating: async (skillId, proficiencyLevel) => {
    const response = await api.put(`/students/skill-baseline/${skillId}`, {
      proficiency_level: proficiencyLevel,
    });
    return response.data.data;
  },

  updateSkillBaseline: async (skillId, proficiencyLevel) => {
    return baselineService.updateSkillRating(skillId, proficiencyLevel);
  },
};

export default baselineService;
