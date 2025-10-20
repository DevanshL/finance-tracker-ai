/**
 * Calculate percentage
 * @param {Number} value - Current value
 * @param {Number} total - Total value
 * @returns {Number} Percentage (0-100)
 */
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Format currency
 * @param {Number} amount - Amount to format
 * @param {String} currency - Currency code (default: USD)
 * @returns {String} Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Calculate date difference in days
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {Number} Difference in days
 */
const dateDifferenceInDays = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

/**
 * Get date range for period
 * @param {String} period - Period type (today, week, month, year)
 * @returns {Object} Start and end dates
 */
const getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    
    case 'week':
      const firstDay = now.getDate() - now.getDay();
      startDate = new Date(now.setDate(firstDay));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.setDate(firstDay + 6));
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return { startDate, endDate };
};

/**
 * Paginate results
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} Skip and limit for query
 */
const getPagination = (page = 1, limit = 20) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  return { skip, limit: limitNum, page: pageNum };
};

/**
 * Generate pagination metadata
 * @param {Number} total - Total items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} Pagination info
 */
const getPaginationInfo = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev
  };
};

/**
 * Sanitize object (remove undefined/null values)
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

/**
 * Calculate average
 * @param {Array} numbers - Array of numbers
 * @returns {Number} Average value
 */
const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {String} key - Key to group by
 * @returns {Object} Grouped object
 */
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Calculate savings rate
 * @param {Number} income - Total income
 * @param {Number} expenses - Total expenses
 * @returns {Number} Savings rate percentage
 */
const calculateSavingsRate = (income, expenses) => {
  if (income === 0) return 0;
  const savings = income - expenses;
  return Math.round((savings / income) * 100);
};

module.exports = {
  calculatePercentage,
  formatCurrency,
  dateDifferenceInDays,
  getDateRange,
  getPagination,
  getPaginationInfo,
  sanitizeObject,
  calculateAverage,
  groupBy,
  calculateSavingsRate
};