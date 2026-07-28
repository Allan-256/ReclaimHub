import axios from 'axios';

// Use relative path since backend serves frontend
const API = axios.create({
  baseURL: '/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const loginUser = (email, password) => API.post('/auth/login', { email, password });
export const registerUser = (userData) => API.post('/auth/register', userData);
export const getCurrentUser = () => API.get('/auth/me');

export const getItems = (params) => API.get('/items', { params });
export const getItem = (id) => API.get(`/items/${id}`);
export const createItem = (itemData) => API.post('/items', itemData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteItem = (id) => API.delete(`/items/${id}`);

export const createClaim = (itemId, message) => API.post('/claims', { itemId, message });
export const getMyClaims = () => API.get('/claims/my-claims');
export const getAllClaims = () => API.get('/claims');
export const approveClaim = (id, response) => API.put(`/claims/${id}/approve`, { response });
export const rejectClaim = (id, response) => API.put(`/claims/${id}/reject`, { response });

export const getStats = () => API.get('/admin/stats');
export const getUsers = () => API.get('/admin/users');
export const getNotifications = () => API.get('/admin/notifications');
export const markNotificationRead = (id) => API.put(`/admin/notifications/${id}/read`);
export const getUnreadCount = () => API.get('/admin/notifications/unread-count');

export default API;
