const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const RecurringTransaction = require('../models/RecurringTransaction');
const Notification = require('../models/Notification');
const analyticsService = require('./analyticsService');

/**
 * Get comprehensive dashboard data
 */
exports.getDashboardData = async (userId, period = 'month') => {
  try {
    const now = new Date();
    let startDate;

    // Calculate date range
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const endDate = new Date();

    // Fetch all dashboard data in parallel
    const [
      overview,
      recentTransactions,
      categoryBreakdown,
      budgetSummary,
      goalSummary,
      upcomingRecurring,
      recentNotifications,
      monthlyTrend
    ] = await Promise.all([
      analyticsService.getSpendingOverview(userId, startDate, endDate),
      this.getRecentTransactions(userId, 10),
      analyticsService.getCategoryBreakdown(userId, startDate, endDate, 'expense'),
      this.getBudgetSummary(userId),
      this.getGoalSummary(userId),
      this.getUpcomingRecurring(userId, 7),
      this.getRecentNotifications(userId, 5),
      analyticsService.getDailyTrend(userId, startDate, endDate)
    ]);

    return {
      overview,
      recentTransactions,
      categoryBreakdown: categoryBreakdown.slice(0, 5),
      budgetSummary,
      goalSummary,
      upcomingRecurring,
      recentNotifications,
      monthlyTrend,
      insights: await this.generateQuickInsights(userId, overview, budgetSummary, goalSummary)
    };
  } catch (error) {
    throw new Error('Failed to get dashboard data: ' + error.message);
  }
};

/**
 * Get recent transactions
 */
exports.getRecentTransactions = async (userId, limit = 10) => {
  return await Transaction.find({ user: userId })
    .populate('category')
    .sort({ date: -1 })
    .limit(limit)
    .lean();
};

/**
 * Get budget summary
 */
exports.getBudgetSummary = async (userId) => {
  const budgets = await Budget.find({ 
    user: userId, 
    status: 'active' 
  }).populate('category');

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;

  const atRisk = budgets.filter(b => (b.spent / b.amount) >= 0.9).length;
  const exceeded = budgets.filter(b => b.spent > b.amount).length;

  return {
    totalBudgets: budgets.length,
    totalBudgeted,
    totalSpent,
    totalRemaining,
    percentUsed: totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(2) : 0,
    atRisk,
    exceeded,
    budgets: budgets.slice(0, 5).map(b => ({
      id: b._id,
      category: b.category?.name || 'General',
      amount: b.amount,
      spent: b.spent,
      remaining: b.remaining,
      percentUsed: ((b.spent / b.amount) * 100).toFixed(2)
    }))
  };
};

/**
 * Get goal summary
 */
exports.getGoalSummary = async (userId) => {
  const goals = await Goal.find({ user: userId });

  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');
  
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return {
    totalGoals: goals.length,
    active: active.length,
    completed: completed.length,
    totalTarget,
    totalSaved,
    overallProgress: totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(2) : 0,
    goals: active.slice(0, 5).map(g => ({
      id: g._id,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      progress: g.progress,
      daysRemaining: Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
    }))
  };
};

/**
 * Get upcoming recurring transactions
 */
exports.getUpcomingRecurring = async (userId, days = 7) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const upcoming = await RecurringTransaction.find({
    user: userId,
    isActive: true,
    nextOccurrence: { $lte: futureDate }
  })
    .populate('category')
    .sort({ nextOccurrence: 1 })
    .limit(10)
    .lean();

  return upcoming.map(r => ({
    id: r._id,
    description: r.description,
    amount: r.amount,
    type: r.type,
    category: r.category?.name,
    frequency: r.frequency,
    nextOccurrence: r.nextOccurrence
  }));
};

/**
 * Get recent notifications
 */
exports.getRecentNotifications = async (userId, limit = 5) => {
  return await Notification.find({ 
    user: userId,
    isRead: false
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Generate quick insights
 */
exports.generateQuickInsights = async (userId, overview, budgetSummary, goalSummary) => {
  const insights = [];

  // Savings rate insight
  if (parseFloat(overview.savingsRate) < 20) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Low Savings Rate',
      message: `Your savings rate is ${overview.savingsRate}%. Try to save at least 20% of your income.`,
      priority: 'high'
    });
  } else if (parseFloat(overview.savingsRate) >= 30) {
    insights.push({
      type: 'success',
      icon: '🎉',
      title: 'Great Savings!',
      message: `Excellent! You're saving ${overview.savingsRate}% of your income.`,
      priority: 'low'
    });
  }

  // Budget insight
  if (budgetSummary.exceeded > 0) {
    insights.push({
      type: 'alert',
      icon: '🚨',
      title: 'Budgets Exceeded',
      message: `${budgetSummary.exceeded} budget(s) have been exceeded. Review your spending.`,
      priority: 'high'
    });
  } else if (budgetSummary.atRisk > 0) {
    insights.push({
      type: 'warning',
      icon: '⚡',
      title: 'Budgets At Risk',
      message: `${budgetSummary.atRisk} budget(s) are over 90% used.`,
      priority: 'medium'
    });
  }

  // Goal insight
  if (goalSummary.active > 0) {
    const avgProgress = parseFloat(goalSummary.overallProgress);
    if (avgProgress < 25) {
      insights.push({
        type: 'info',
        icon: '📊',
        title: 'Goal Progress',
        message: 'Your goals need attention. Consider increasing contributions.',
        priority: 'medium'
      });
    }
  }

  // Net savings insight
  if (overview.netSavings < 0) {
    insights.push({
      type: 'alert',
      icon: '💸',
      title: 'Negative Savings',
      message: `You're spending $${Math.abs(overview.netSavings).toFixed(2)} more than you earn.`,
      priority: 'urgent'
    });
  }

  return insights;
};

/**
 * Get financial summary card
 */
exports.getFinancialSummaryCard = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const overview = await analyticsService.getSpendingOverview(userId, startOfMonth, endOfMonth);

  return {
    currentMonth: {
      income: overview.totalIncome,
      expenses: overview.totalExpenses,
      savings: overview.netSavings,
      savingsRate: overview.savingsRate
    },
    status: overview.netSavings > 0 ? 'positive' : 'negative'
  };
};

/**
 * Get spending by category chart data
 */
exports.getSpendingChartData = async (userId, period = 'month') => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  const endDate = new Date();

  const categories = await analyticsService.getCategoryBreakdown(userId, startDate, endDate, 'expense');

  return categories.slice(0, 8).map(cat => ({
    name: cat.name,
    value: cat.total,
    percentage: cat.percentage,
    color: cat.color || '#3b82f6'
  }));
};

/**
 * Get income vs expenses trend
 */
exports.getIncomeVsExpensesTrend = async (userId, months = 6) => {
  const monthlyData = await analyticsService.getMonthlyComparison(userId, months);

  return monthlyData.map(month => ({
    month: month.month,
    income: month.income,
    expenses: month.expenses,
    net: month.savings
  }));
};