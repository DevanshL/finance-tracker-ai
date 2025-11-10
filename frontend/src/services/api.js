import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

// AUTH ENDPOINTS
export const authAPI = {
  register: async (name, email, password, passwordConfirm) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        passwordConfirm
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  updatePassword: async (currentPassword, newPassword, newPasswordConfirm) => {
    try {
      const response = await api.put('/auth/update-password', {
        currentPassword,
        newPassword,
        newPasswordConfirm
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// TRANSACTION ENDPOINTS
export const transactionAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/transactions', { params: filters });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  create: async (transactionData) => {
    try {
      const response = await api.post('/transactions', transactionData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, transactionData) => {
    try {
      const response = await api.put(`/transactions/${id}`, transactionData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/transactions/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  bulk: async (transactions) => {
    try {
      const response = await api.post('/transactions/bulk', { transactions });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// CATEGORY ENDPOINTS
export const categoryAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/categories');
      return response;
    } catch (error) {
      throw error;
    }
  },

  create: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// DASHBOARD ENDPOINTS
export const dashboardAPI = {
  getSummary: async () => {
    try {
      const response = await api.get('/dashboard/summary');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getStats: async (period = 'month') => {
    try {
      const response = await api.get('/dashboard/stats', { params: { period } });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default api;