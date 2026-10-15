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

  // --- Analytics Dashboard endpoints (TASK 4) ---

  getAnalyticsOverview: async (batchYear, branch) => {
    const params = {};
    if (batchYear) params.batch_year = batchYear;
    if (branch)    params.branch     = branch;
    const response = await api.get('/faculty/analytics/overview', { params });
    return response.data.data;
  },

  getAnalyticsRoleDistribution: async (batchYear, branch) => {
    const params = {};
    if (batchYear) params.batch_year = batchYear;
    if (branch)    params.branch     = branch;
    const response = await api.get('/faculty/analytics/role-distribution', { params });
    return response.data.data;
  },

  getAnalyticsSkillGaps: async (batchYear, branch, roleId) => {
    const params = {};
    if (batchYear) params.batch_year = batchYear;
    if (branch)    params.branch     = branch;
    if (roleId)    params.role_id    = roleId;
    const response = await api.get('/faculty/analytics/skill-gaps', { params });
    return response.data.data;
  },

  getStudentSupportList: async (batchYear, branch) => {
    const params = {};
    if (batchYear) params.batch_year = batchYear;
    if (branch)    params.branch     = branch;
    const response = await api.get('/faculty/analytics/student-support', { params });
    return response.data.data;
  },

  getAnalyticsInsights: async (batchYear, branch) => {
    const params = {};
    if (batchYear) params.batch_year = batchYear;
    if (branch)    params.branch     = branch;
    const response = await api.get('/faculty/analytics/insights', { params });
    return response.data.data;
  },

  exportAnalyticsCSV: async (batchYear, branch) => {
    const params = {};
    if (batchYear) params.batch_year = batchYear;
    if (branch)    params.branch     = branch;
    const response = await api.get('/faculty/analytics/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  getStudentDetails: async (studentId) => {
    const response = await api.get(`/faculty/students/${studentId}`);
    return response.data.data;
  },

  getStudentSkillGaps: async (studentId) => {
    const response = await api.get(`/faculty/students/${studentId}/skill-gaps`);
    return response.data.data;
  },
};
