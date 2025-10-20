// Application Constants

// Transaction Types
const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Default Categories
const DEFAULT_CATEGORIES = {
  INCOME: [
    { name: 'Salary', icon: '💰', color: '#10b981' },
    { name: 'Freelance', icon: '💼', color: '#3b82f6' },
    { name: 'Business', icon: '🏢', color: '#8b5cf6' },
    { name: 'Investment', icon: '📈', color: '#06b6d4' },
    { name: 'Gift', icon: '🎁', color: '#ec4899' },
    { name: 'Other Income', icon: '💵', color: '#6b7280' }
  ],
  EXPENSE: [
    { name: 'Food & Dining', icon: '🍔', color: '#ef4444' },
    { name: 'Transportation', icon: '🚗', color: '#f59e0b' },
    { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
    { name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
    { name: 'Bills & Utilities', icon: '📱', color: '#06b6d4' },
    { name: 'Healthcare', icon: '🏥', color: '#10b981' },
    { name: 'Education', icon: '📚', color: '#3b82f6' },
    { name: 'Travel', icon: '✈️', color: '#14b8a6' },
    { name: 'Housing', icon: '🏠', color: '#f97316' },
    { name: 'Insurance', icon: '🛡️', color: '#6366f1' },
    { name: 'Personal Care', icon: '💅', color: '#ec4899' },
    { name: 'Fitness', icon: '💪', color: '#10b981' },
    { name: 'Gifts & Donations', icon: '🎁', color: '#f43f5e' },
    { name: 'Other Expense', icon: '💳', color: '#6b7280' }
  ]
};

// Payment Methods
const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Digital Wallet',
  'Check',
  'Other'
];

// Budget Periods
const BUDGET_PERIODS = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

// Budget Status
const BUDGET_STATUS = {
  ON_TRACK: 'on_track',
  WARNING: 'warning',
  EXCEEDED: 'exceeded'
};

// Goal Status
const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Goal Priority Levels
const GOAL_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

// Error Messages
const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Not authorized, please login',
  TOKEN_INVALID: 'Invalid or expired token',
  
  // Validation errors
  REQUIRED_FIELDS: 'Please provide all required fields',
  INVALID_EMAIL: 'Please provide a valid email',
  WEAK_PASSWORD: 'Password must be at least 6 characters',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'Resource not found',
  UNAUTHORIZED_ACCESS: 'You are not authorized to access this resource',
  
  // Server errors
  SERVER_ERROR: 'Server error, please try again later'
};

// Success Messages
const SUCCESS_MESSAGES = {
  // Auth
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  
  // CRUD operations
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  FETCHED: 'Data fetched successfully'
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Date Formats
const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  FULL: 'YYYY-MM-DD HH:mm:ss'
};

module.exports = {
  TRANSACTION_TYPES,
  DEFAULT_CATEGORIES,
  PAYMENT_METHODS,
  BUDGET_PERIODS,
  BUDGET_STATUS,
  GOAL_STATUS,
  GOAL_PRIORITY,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION,
  DATE_FORMATS
};