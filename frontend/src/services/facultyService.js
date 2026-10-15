import api from './api';

export const facultyService = {
  getProfile: async () => {
    const response = await api.get('/faculty/me');
    return response.data.data;
  },
  getStudents: async (batchYear, branch) => {
    const response = await api.get('/faculty/students', { params: { batch_year: batchYear, branch } });
    return response.data.data;
  },
  getBatchAnalytics: async (batchYear, branch) => {
    const response = await api.get('/faculty/analytics/batch', { params: { batch_year: batchYear, branch } });
    return response.data.data;
  },
  exportStudentsCSV: async (batchYear, branch) => {
    const response = await api.get('/faculty/students/export', {
      params: { batch_year: batchYear, branch },
      responseType: 'blob',
    });
    return response.data;
  },
};
