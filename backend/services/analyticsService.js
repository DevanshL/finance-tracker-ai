const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const { calculatePercentageChange } = require('../utils/dateHelpers');

/**
 * Get spending overview
 */
exports.getSpendingOverview = async (userId, startDate, endDate) => {
  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate }
  });

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = income - expenses;
  const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netSavings,
    savingsRate: savingsRate.toFixed(2),
    transactionCount: transactions.length
  };
};

/**
 * Get category breakdown
 */
exports.getCategoryBreakdown = async (userId, startDate, endDate, type = 'expense') => {
  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: type,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: '$categoryInfo'
    },
    {
      $group: {
        _id: '$category',
        categoryName: { $first: '$categoryInfo.name' },
        categoryIcon: { $first: '$categoryInfo.icon' },
        categoryColor: { $first: '$categoryInfo.color' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);

  const grandTotal = result.reduce((sum, cat) => sum + cat.total, 0);

  return result.map(cat => ({
    category: cat._id,
    name: cat.categoryName,
    icon: cat.categoryIcon,
    color: cat.categoryColor,
    total: cat.total,
    count: cat.count,
    averageAmount: cat.averageAmount,
    percentage: grandTotal > 0 ? ((cat.total / grandTotal) * 100).toFixed(2) : 0
  }));
};

/**
 * Get daily spending trend
 */
exports.getDailyTrend = async (userId, startDate, endDate) => {
  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);

  const trendMap = new Map();

  result.forEach(item => {
    const date = item._id.date;
    if (!trendMap.has(date)) {
      trendMap.set(date, { date, income: 0, expenses: 0, net: 0 });
    }

    const dayData = trendMap.get(date);
    if (item._id.type === 'income') {
      dayData.income = item.total;
    } else {
      dayData.expenses = item.total;
    }
    dayData.net = dayData.income - dayData.expenses;
  });

  return Array.from(trendMap.values());
};

/**
 * Get monthly comparison
 */
exports.getMonthlyComparison = async (userId, months = 6) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          month: { $dateToString: { format: '%Y-%m', date: '$date' } },
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    },
    {
      $sort: { '_id.month': 1 }
    }
  ]);

  const monthlyMap = new Map();

  result.forEach(item => {
    const month = item._id.month;
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { month, income: 0, expenses: 0, savings: 0 });
    }

    const monthData = monthlyMap.get(month);
    if (item._id.type === 'income') {
      monthData.income = item.total;
    } else {
      monthData.expenses = item.total;
    }
    monthData.savings = monthData.income - monthData.expenses;
  });

  return Array.from(monthlyMap.values());
};

/**
 * Get top spending categories
 */
exports.getTopCategories = async (userId, startDate, endDate, limit = 5) => {
  const categories = await this.getCategoryBreakdown(userId, startDate, endDate, 'expense');
  return categories.slice(0, limit);
};

/**
 * Get budget performance
 */
exports.getBudgetPerformance = async (userId, startDate, endDate) => {
  const budgets = await Budget.find({
    user: userId,
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      { period: 'monthly', startDate: { $lte: endDate } }
    ]
  }).populate('category');

  const performance = [];

  for (const budget of budgets) {
    const spent = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          category: budget.category._id,
          type: 'expense',
          date: { $gte: budget.startDate, $lte: budget.endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const spentAmount = spent.length > 0 ? spent[0].total : 0;
    const remaining = budget.amount - spentAmount;
    const percentUsed = (spentAmount / budget.amount) * 100;

    performance.push({
      budgetId: budget._id,
      category: budget.category.name,
      budgetAmount: budget.amount,
      spent: spentAmount,
      remaining,
      percentUsed: percentUsed.toFixed(2),
      status: percentUsed >= 100 ? 'exceeded' : percentUsed >= 80 ? 'warning' : 'good'
    });
  }

  return performance;
};

/**
 * Get goal progress summary
 */
exports.getGoalProgress = async (userId) => {
  const goals = await Goal.find({ user: userId, status: { $ne: 'cancelled' } });

  const summary = {
    totalGoals: goals.length,
    active: 0,
    completed: 0,
    totalTarget: 0,
    totalSaved: 0,
    overallProgress: 0
  };

  goals.forEach(goal => {
    if (goal.status === 'active') summary.active++;
    if (goal.status === 'completed') summary.completed++;
    summary.totalTarget += goal.targetAmount;
    summary.totalSaved += goal.currentAmount;
  });

  summary.overallProgress = summary.totalTarget > 0 
    ? ((summary.totalSaved / summary.totalTarget) * 100).toFixed(2)
    : 0;

  return {
    summary,
    goals: goals.map(g => ({
      id: g._id,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      progress: g.progress,
      status: g.status,
      daysRemaining: Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
    }))
  };
};

/**
 * Get financial insights
 */
exports.getFinancialInsights = async (userId, startDate, endDate) => {
  const overview = await this.getSpendingOverview(userId, startDate, endDate);
  const categories = await this.getCategoryBreakdown(userId, startDate, endDate, 'expense');
  
  const insights = [];

  if (overview.savingsRate < 20) {
    insights.push({
      type: 'warning',
      category: 'savings',
      message: `Your savings rate is ${overview.savingsRate}%. Consider reducing expenses to save at least 20% of your income.`,
      priority: 'high'
    });
  } else if (overview.savingsRate >= 30) {
    insights.push({
      type: 'success',
      category: 'savings',
      message: `Great job! You're saving ${overview.savingsRate}% of your income.`,
      priority: 'low'
    });
  }

  if (categories.length > 0) {
    const topCategory = categories[0];
    if (parseFloat(topCategory.percentage) > 30) {
      insights.push({
        type: 'info',
        category: 'spending',
        message: `${topCategory.name} accounts for ${topCategory.percentage}% of your expenses. Consider reviewing this category.`,
        priority: 'medium'
      });
    }
  }

  if (overview.netSavings < 0) {
    insights.push({
      type: 'alert',
      category: 'budget',
      message: `You're spending more than you earn. Your expenses exceed income by $${Math.abs(overview.netSavings).toFixed(2)}.`,
      priority: 'high'
    });
  }

  return insights;
};

/**
 * Get comparison with previous period
 */
exports.getPeriodComparison = async (userId, currentStart, currentEnd) => {
  const duration = currentEnd - currentStart;
  const prevEnd = new Date(currentStart);
  prevEnd.setMilliseconds(-1);
  const prevStart = new Date(prevEnd - duration);

  const current = await this.getSpendingOverview(userId, currentStart, currentEnd);
  const previous = await this.getSpendingOverview(userId, prevStart, prevEnd);

  return {
    current,
    previous,
    changes: {
      income: {
        amount: current.totalIncome - previous.totalIncome,
        percentage: calculatePercentageChange(current.totalIncome, previous.totalIncome).toFixed(2)
      },
      expenses: {
        amount: current.totalExpenses - previous.totalExpenses,
        percentage: calculatePercentageChange(current.totalExpenses, previous.totalExpenses).toFixed(2)
      },
      savings: {
        amount: current.netSavings - previous.netSavings,
        percentage: calculatePercentageChange(current.netSavings, previous.netSavings).toFixed(2)
      }
    }
  };
};