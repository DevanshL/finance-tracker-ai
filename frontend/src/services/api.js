import axios from 'axios';

// Get backend URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add request interceptor - include token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✓ Token added to request');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor - handle token expiration and errors
api.interceptors.response.use(
  (response) => {
    console.log('✓ Response received:', response.status);
    return response;
  },
  (error) => {
    // HANDLE: 401 - Token expired or invalid
    if (error.response?.status === 401) {
      console.warn('⚠ Token expired or invalid');
      
      // Clear token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // HANDLE: 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('✗ Access forbidden:', error.response.data?.message);
    }
    
    // HANDLE: 500 - Server error
    if (error.response?.status === 500) {
      console.error('✗ Server error:', error.response.data?.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;