import api from './axios';

export const authAPI = {
  // Register new user
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await api.put('/auth/password', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Enable 2FA
  enable2FA: async () => {
    const response = await api.post('/auth/2fa/enable');
    return response.data;
  },

  // Verify 2FA
  verify2FA: async (token) => {
    const response = await api.post('/auth/2fa/verify', { token });
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (password) => {
    const response = await api.post('/auth/2fa/disable', { password });
    return response.data;
  },
};

export default authAPI;