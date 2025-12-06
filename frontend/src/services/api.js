import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('=== API REQUEST ===');
    console.log('URL:', config.baseURL + config.url);
    console.log('Method:', config.method);
    console.log('Token present:', !!token);
    console.log('Headers:', config.headers);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Project APIs
export const projectAPI = {
  generateBulletPoints: (data) => api.post('/projects/generate', data),
  regenerateBulletPoints: (id, data) => api.post(`/projects/regenerate/${id}`, data),
  getAllProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

// Email APIs
export const emailAPI = {
  generateEmail: (data) => api.post('/emails/generate', data),
  regenerateEmail: (id, data) => api.post(`/emails/regenerate/${id}`, data),
  getAllEmails: () => api.get('/emails'),
  getEmail: (id) => api.get(`/emails/${id}`),
  updateEmail: (id, data) => api.put(`/emails/${id}`, data),
  deleteEmail: (id) => api.delete(`/emails/${id}`),
};

export default api;
