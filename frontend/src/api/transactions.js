import api from './axios';

export const transactionsAPI = {
  // Get all transactions with filters
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  // Get single transaction
  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Create transaction
  createTransaction: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  // Update transaction
  updateTransaction: async (id, data) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // Get transaction summary
  getSummary: async (params = {}) => {
    const response = await api.get('/transactions/summary', { params });
    return response.data;
  },

  // Get recent transactions
  getRecent: async (limit = 10) => {
    const response = await api.get('/transactions/recent', { params: { limit } });
    return response.data;
  },

  // Bulk operations
  bulkCreate: async (transactions) => {
    const response = await api.post('/transactions/bulk', { transactions });
    return response.data;
  },

  bulkDelete: async (ids) => {
    const response = await api.delete('/transactions/bulk', { data: { transactionIds: ids } });
    return response.data;
  },
};

export default transactionsAPI;