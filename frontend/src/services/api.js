import axios from 'axios';

/**
 * Foundation Axios API Client Placeholder (Phase 1 Day 1 Stub)
 * Configured by Member 1 with baseURL to unblock all team feature branches
 * Token interceptors and refresh logic will be attached in Phase 2
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;
