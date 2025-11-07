import { create } from 'zustand';
import { transactionsAPI } from '../api/transactions';
import toast from 'react-hot-toast';

const useTransactionStore = create((set, get) => ({
  transactions: [],
  transaction: null,
  summary: null,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 20,
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },

  // Set filters
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        page: 1,
        limit: 20,
        type: '',
        category: '',
        startDate: '',
        endDate: '',
        search: '',
        sortBy: 'date',
        sortOrder: 'desc',
      },
    });
  },

  // Fetch transactions
  fetchTransactions: async (customFilters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const filters = { ...get().filters, ...customFilters };
      const response = await transactionsAPI.getTransactions(filters);
      
      set({
        transactions: response.data?.transactions || [],
        pagination: {
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
          total: response.pagination?.total || 0,
        },
        isLoading: false,
      });
      
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Fetch single transaction
  fetchTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionsAPI.getTransaction(id);
      set({ transaction: response.data, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Create transaction
  createTransaction: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionsAPI.createTransaction(data);
      
      // Add to local state
      set((state) => ({
        transactions: [response.data, ...state.transactions],
        isLoading: false,
      }));
      
      toast.success('Transaction created successfully!');
      
      // Refresh summary
      get().fetchSummary();
      
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update transaction
  updateTransaction: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionsAPI.updateTransaction(id, data);
      
      // Update in local state
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t._id === id ? response.data : t
        ),
        isLoading: false,
      }));
      
      toast.success('Transaction updated successfully!');
      
      // Refresh summary
      get().fetchSummary();
      
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await transactionsAPI.deleteTransaction(id);
      
      // Remove from local state
      set((state) => ({
        transactions: state.transactions.filter((t) => t._id !== id),
        isLoading: false,
      }));
      
      toast.success('Transaction deleted successfully!');
      
      // Refresh summary
      get().fetchSummary();
      
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Fetch summary
  fetchSummary: async (params = {}) => {
    try {
      const response = await transactionsAPI.getSummary(params);
      set({ summary: response.data });
      return response;
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  },

  // Bulk delete
  bulkDelete: async (ids) => {
    set({ isLoading: true, error: null });
    try {
      await transactionsAPI.bulkDelete(ids);
      
      // Remove from local state
      set((state) => ({
        transactions: state.transactions.filter((t) => !ids.includes(t._id)),
        isLoading: false,
      }));
      
      toast.success(`${ids.length} transactions deleted successfully!`);
      
      // Refresh summary
      get().fetchSummary();
      
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useTransactionStore;