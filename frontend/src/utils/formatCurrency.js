export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const abbreviateCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

export const getAmountColor = (amount) => {
  if (amount > 0) return 'text-green-600 dark:text-green-400';
  if (amount < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
};

export const getAmountBgColor = (amount) => {
  if (amount > 0) return 'bg-green-50 dark:bg-green-900/20';
  if (amount < 0) return 'bg-red-50 dark:bg-red-900/20';
  return 'bg-gray-50 dark:bg-gray-800';
};

export const getAmountSign = (amount) => {
  if (amount > 0) return '+';
  if (amount < 0) return '-';
  return '';
};