import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (phone, password, name) =>
    api.post('/auth/register', { phone, password, name }),
  login: (phone, password) => api.post('/auth/login', { phone, password }),
};

export const usersAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUser: (id) => api.get(`/users/${id}`),
  search: (q) => api.get('/users/search', { params: { q } }),
  connect: (id) => api.post(`/users/connect/${id}`),
  disconnect: (id) => api.delete(`/users/disconnect/${id}`),
};

export const postsAPI = {
  getAll: () => api.get('/posts'),
  getByUser: (userId) => api.get(`/posts/user/${userId}`),
  create: (data) => api.post('/posts', data),
  comment: (id, text) => api.post(`/posts/${id}/comment`, { text }),
  share: (id) => api.post(`/posts/${id}/share`),
  delete: (id) => api.delete(`/posts/${id}`),
};

export const uploadAPI = {
  media: (files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return api.post('/upload/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const UPLOADS_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
