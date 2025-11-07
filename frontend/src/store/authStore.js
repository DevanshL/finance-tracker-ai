import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Register
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(data);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem('token', response.token);
          toast.success('Account created successfully!');
          return response;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Login
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem('token', response.token);
          toast.success('Logged in successfully!');
          return response;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.success('Logged out successfully!');
        }
      },

      // Get current user
      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await authAPI.getMe();
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
          return response;
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },

      // Update profile
      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.updateProfile(data);
          set({
            user: response.data,
            isLoading: false,
          });
          toast.success('Profile updated successfully!');
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Change password
      changePassword: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.changePassword(data);
          set({ isLoading: false });
          toast.success('Password changed successfully!');
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;