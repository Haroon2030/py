import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token to requests
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export const authAPI = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  logout: () => api.post('/auth/logout/'),
  getUser: () => api.get('/auth/user/'),
};

export const statsAPI = {
  get: () => api.get('/stats/'),
};

export const branchAPI = {
  list: () => api.get('/branches/?format=json'),
  create: (name) => api.post('/branches/', { name }),
  delete: (id) => api.delete(`/branches/${id}/`),
};

export const documentAPI = {
  list: (params) => api.get('/documents/', { params }),
  get: (id) => api.get(`/documents/${id}/`),
  upload: (formData) => api.post('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/documents/${id}/`),
};

export default api;
