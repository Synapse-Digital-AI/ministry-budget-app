// src/services/auth.js
import api from './api';

export const authService = {
  async login(email, pin) {
    const response = await api.post('/auth/login', { email, pin });
    return response.data;
  },

  async verify() {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  async changePin(currentPin, newPin) {
    const response = await api.put('/auth/change-pin', { currentPin, newPin });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

export default authService;
