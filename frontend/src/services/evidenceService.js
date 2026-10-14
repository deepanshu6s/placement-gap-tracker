import api from './api';

export const evidenceService = {
  // Student operations
  getStudentEvidence: async (params = {}) => {
    const response = await api.get('/students/evidence', { params });
    return response.data.data;
  },

  submitEvidence: async (data) => {
    const response = await api.post('/students/evidence', data);
    return response.data.data;
  },

  updateEvidence: async (id, data) => {
    const response = await api.put(`/students/evidence/${id}`, data);
    return response.data.data;
  },

  deleteEvidence: async (id) => {
    const response = await api.delete(`/students/evidence/${id}`);
    return response.data.data;
  },

  // Faculty operations
  getFacultyEvidenceQueue: async (params = {}) => {
    const response = await api.get('/faculty/evidence', { params });
    return response.data.data;
  },

  reviewEvidence: async (id, data) => {
    const response = await api.put(`/faculty/evidence/${id}/review`, data);
    return response.data.data;
  },
};

export default evidenceService;
