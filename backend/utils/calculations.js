// Financial calculation utilities

const calculations = {
  // Calculate percentage
  percentage: (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(2);
  },

  // Calculate growth rate
  growthRate: (currentValue, previousValue) => {
    if (previousValue === 0) return 0;
    return (((currentValue - previousValue) / previousValue) * 100).toFixed(2);
  },

  // Calculate average
  average: (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return (sum / numbers.length).toFixed(2);
  },

  // Calculate budget utilization
  budgetUtilization: (spent, budgeted) => {
    if (budgeted === 0) return 0;
    return ((spent / budgeted) * 100).toFixed(2);
  },

  // Calculate savings rate
  savingsRate: (income, expenses) => {
    if (income === 0) return 0;
    const savings = income - expenses;
    return ((savings / income) * 100).toFixed(2);
  },

  // Calculate goal progress
  goalProgress: (current, target) => {
    if (target === 0) return 0;
    return Math.min(((current / target) * 100), 100).toFixed(2);
  },

  // Calculate remaining days to goal deadline
  daysUntilDeadline: (deadline) => {
    const now = new Date();
    const target = new Date(deadline);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Calculate monthly burn rate
  burnRate: (totalExpenses, daysInMonth) => {
    return (totalExpenses / daysInMonth).toFixed(2);
  },

  // Round to 2 decimal places
  round: (number) => {
    return Math.round(number * 100) / 100;
  }
};

module.exports = calculations;
