import api from './api';

export const assessmentService = {
  startAttempt: async (skillId) => {
    const response = await api.post('/assessments/start', { skill_id: skillId });
    return response.data.data;
  },
  getQuestions: async (attemptId) => {
    const response = await api.get(`/assessments/${attemptId}/questions`);
    return response.data.data;
  },
  submitAttempt: async (attemptId, answers) => {
    const response = await api.post(`/assessments/${attemptId}/submit`, { answers });
    return response.data.data;
  },
  getResult: async (attemptId) => {
    const response = await api.get(`/assessments/${attemptId}/result`);
    return response.data.data;
  }
};
