// Data validation utilities

const validators = {
  // Validate email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  isStrongPassword: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongRegex.test(password);
  },

  // Validate phone number
  isValidPhone: (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  },

  // Validate positive number
  isPositiveNumber: (num) => {
    return typeof num === 'number' && num > 0;
  },

  // Validate date
  isValidDate: (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  },

  // Validate future date
  isFutureDate: (date) => {
    return new Date(date) > new Date();
  },

  // Validate past date
  isPastDate: (date) => {
    return new Date(date) < new Date();
  },

  // Validate transaction type
  isValidTransactionType: (type) => {
    return ['income', 'expense'].includes(type.toLowerCase());
  },

  // Validate category
  isValidCategory: (category) => {
    return typeof category === 'string' && category.trim().length > 0;
  },

  // Validate amount
  isValidAmount: (amount) => {
    return typeof amount === 'number' && amount > 0 && amount <= 1000000000;
  },

  // Validate budget period
  isValidBudgetPeriod: (period) => {
    return ['daily', 'weekly', 'monthly', 'yearly'].includes(period.toLowerCase());
  },

  // Validate goal status
  isValidGoalStatus: (status) => {
    return ['active', 'completed', 'cancelled'].includes(status.toLowerCase());
  },

  // Sanitize input (remove dangerous characters)
  sanitize: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript:
      .trim();
  },

  // Validate MongoDB ObjectId
  isValidObjectId: (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
};

module.exports = validators;
