// backend/controllers/aiController.js

const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const { startOfMonth, endOfMonth, subMonths } = require('date-fns');

// @desc    Get comprehensive AI financial insights
// @route   GET /api/ai/insights
// @access  Private
exports.getFinancialInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get last 3 months of transactions
    const threeMonthsAgo = subMonths(new Date(), 3);
    const transactions = await Transaction.find({
      userId,
      date: { $gte: threeMonthsAgo }
    }).sort('-date');

    if (transactions.length === 0) {
      return res.json({
        success: true,
        data: {
          insights: [],
          recommendations: ['Start tracking your transactions to get personalized insights'],
          spendingPatterns: {},
          alerts: []
        }
      });
    }

    // Calculate basic stats
    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const avgMonthlyExpense = totalExpense / 3;
    const avgMonthlyIncome = totalIncome / 3;

    // Category breakdown
    const categorySpending = {};
    expenses.forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    // Find top spending categories
    const topCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        percentage: ((amount / totalExpense) * 100).toFixed(1)
      }));

    // Generate insights
    const insights = [];
    const recommendations = [];
    const alerts = [];

    // Insight 1: Spending vs Income
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    insights.push({
      type: 'savings-rate',
      title: 'Savings Rate',
      message: `You're saving ${savingsRate.toFixed(1)}% of your income`,
      value: savingsRate.toFixed(1),
      status: savingsRate >= 20 ? 'good' : savingsRate >= 10 ? 'fair' : 'poor'
    });

    if (savingsRate < 20) {
      recommendations.push(
        `Try to increase your savings rate to at least 20%. Currently at ${savingsRate.toFixed(1)}%`
      );
    }

    // Insight 2: Top spending category
    if (topCategories.length > 0) {
      const topCategory = topCategories[0];
      insights.push({
        type: 'top-spending',
        title: 'Highest Spending Category',
        message: `${topCategory.category} accounts for ${topCategory.percentage}% of your expenses`,
        category: topCategory.category,
        amount: topCategory.amount,
        percentage: topCategory.percentage
      });

      if (parseFloat(topCategory.percentage) > 40) {
        alerts.push({
          severity: 'warning',
          message: `${topCategory.category} takes up ${topCategory.percentage}% of your spending. Consider reducing expenses in this area.`
        });
      }
    }

    // Insight 3: Spending trend
    const currentMonth = new Date();
    const lastMonth = subMonths(currentMonth, 1);

    const currentMonthExpenses = expenses.filter(
      (t) => t.date >= startOfMonth(currentMonth) && t.date <= endOfMonth(currentMonth)
    );

    const lastMonthExpenses = expenses.filter(
      (t) => t.date >= startOfMonth(lastMonth) && t.date <= endOfMonth(lastMonth)
    );

    const currentMonthTotal = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

    if (lastMonthTotal > 0) {
      const percentageChange = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

      insights.push({
        type: 'spending-trend',
        title: 'Monthly Spending Trend',
        message:
          percentageChange > 0
            ? `Your spending increased by ${percentageChange.toFixed(1)}% this month`
            : `Your spending decreased by ${Math.abs(percentageChange).toFixed(1)}% this month`,
        change: percentageChange.toFixed(1),
        status: percentageChange > 10 ? 'warning' : percentageChange < -10 ? 'good' : 'neutral'
      });

      if (percentageChange > 20) {
        alerts.push({
          severity: 'warning',
          message: `Your spending has increased significantly (${percentageChange.toFixed(
            1
          )}%) compared to last month`
        });
      }
    }

    // Get budget alerts
    const budgets = await Budget.find({ userId, isActive: true });
    for (const budget of budgets) {
      const percentageUsed = (budget.spent / budget.amount) * 100;
      if (percentageUsed >= 80) {
        alerts.push({
          severity: percentageUsed >= 100 ? 'critical' : 'warning',
          message: `You've used ${percentageUsed.toFixed(1)}% of your ${
            budget.category
          } budget`,
          budgetId: budget._id
        });
      }
    }

    // Add general recommendations
    recommendations.push('Track all your expenses consistently for better insights');

    if (avgMonthlyExpense > avgMonthlyIncome) {
      recommendations.push('Your expenses exceed your income. Consider ways to increase income or reduce spending');
    }

    if (topCategories.length > 0 && parseFloat(topCategories[0].percentage) > 30) {
      recommendations.push(
        `Review your ${topCategories[0].category} expenses - they represent a large portion of your spending`
      );
    }

    // Spending patterns
    const spendingPatterns = {
      averageMonthlyExpense: avgMonthlyExpense.toFixed(2),
      averageMonthlyIncome: avgMonthlyIncome.toFixed(2),
      topCategories,
      transactionCount: transactions.length,
      mostFrequentCategory: topCategories.length > 0 ? topCategories[0].category : 'None'
    };

    res.json({
      success: true,
      data: {
        insights,
        recommendations,
        spendingPatterns,
        alerts,
        period: {
          from: threeMonthsAgo.toISOString(),
          to: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Predict future spending
// @route   GET /api/ai/predict-spending
// @access  Private
exports.getSpendingPrediction = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { category, months = 1 } = req.query;

    // Get last 6 months of data
    const sixMonthsAgo = subMonths(new Date(), 6);
    const query = {
      userId,
      type: 'expense',
      date: { $gte: sixMonthsAgo }
    };

    if (category) {
      query.category = category;
    }

    const transactions = await Transaction.find(query);

    if (transactions.length < 10) {
      return res.json({
        success: true,
        data: {
          prediction: null,
          message: 'Not enough data for accurate prediction. Need at least 10 transactions.'
        }
      });
    }

    // Simple moving average prediction
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const average = total / 6; // 6 months average

    const prediction = average * parseInt(months);

    res.json({
      success: true,
      data: {
        prediction: prediction.toFixed(2),
        period: `${months} month(s)`,
        confidence: 'medium',
        basedOn: `${transactions.length} transactions from the last 6 months`,
        category: category || 'All categories'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest category for transaction
// @route   POST /api/ai/suggest-category
// @access  Private
exports.getCategorySuggestions = async (req, res, next) => {
  try {
    const { description, amount } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description'
      });
    }

    // Simple keyword-based categorization
    const categoryKeywords = {
      Food: ['grocery', 'restaurant', 'food', 'coffee', 'lunch', 'dinner', 'breakfast', 'cafe'],
      Transportation: ['uber', 'taxi', 'gas', 'fuel', 'metro', 'bus', 'train', 'parking'],
      Entertainment: ['movie', 'concert', 'game', 'netflix', 'spotify', 'youtube'],
      Shopping: ['amazon', 'store', 'mall', 'shopping', 'clothes', 'shoes'],
      Utilities: ['electric', 'water', 'internet', 'phone', 'bill'],
      Healthcare: ['doctor', 'medicine', 'pharmacy', 'hospital', 'clinic'],
      Housing: ['rent', 'mortgage', 'lease']
    };

    const lowerDesc = description.toLowerCase();
    const suggestions = [];

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matchCount = keywords.filter((keyword) => lowerDesc.includes(keyword)).length;
      if (matchCount > 0) {
        suggestions.push({
          category,
          confidence: matchCount / keywords.length,
          matchedKeywords: keywords.filter((keyword) => lowerDesc.includes(keyword))
        });
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 3),
        topSuggestion: suggestions.length > 0 ? suggestions[0].category : 'Other'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget recommendations
// @route   GET /api/ai/budget-recommendations
// @access  Private
exports.getBudgetRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get last 3 months of expenses
    const threeMonthsAgo = subMonths(new Date(), 3);
    const expenses = await Transaction.find({
      userId,
      type: 'expense',
      date: { $gte: threeMonthsAgo }
    });

    // Calculate average spending per category
    const categorySpending = {};
    expenses.forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    const recommendations = [];

    for (const [category, total] of Object.entries(categorySpending)) {
      const average = total / 3;
      const recommendedBudget = Math.ceil(average * 1.1); // 10% buffer

      recommendations.push({
        category,
        recommendedAmount: recommendedBudget,
        averageSpending: average.toFixed(2),
        reasoning: `Based on your average ${category} spending of $${average.toFixed(2)}/month`
      });
    }

    // Sort by spending
    recommendations.sort((a, b) => b.recommendedAmount - a.recommendedAmount);

    res.json({
      success: true,
      data: { recommendations }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Detect spending anomalies
// @route   GET /api/ai/anomaly-detection
// @access  Private
exports.getAnomalyDetection = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get last 3 months
    const threeMonthsAgo = subMonths(new Date(), 3);
    const transactions = await Transaction.find({
      userId,
      type: 'expense',
      date: { $gte: threeMonthsAgo }
    });

    if (transactions.length < 10) {
      return res.json({
        success: true,
        data: { anomalies: [], message: 'Not enough data for anomaly detection' }
      });
    }

    // Calculate average and standard deviation
    const amounts = transactions.map((t) => t.amount);
    const avg = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const variance =
      amounts.reduce((sum, a) => sum + Math.pow(a - avg, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    // Find anomalies (transactions > 2 standard deviations from mean)
    const anomalies = transactions
      .filter((t) => Math.abs(t.amount - avg) > 2 * stdDev)
      .map((t) => ({
        transaction: t,
        deviation: ((t.amount - avg) / stdDev).toFixed(2),
        reason: `This ${t.category} expense of $${t.amount} is unusually ${
          t.amount > avg ? 'high' : 'low'
        }`
      }));

    res.json({
      success: true,
      data: {
        anomalies,
        stats: {
          average: avg.toFixed(2),
          standardDeviation: stdDev.toFixed(2),
          analyzed: transactions.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized savings tips
// @route   GET /api/ai/savings-tips
// @access  Private
exports.getSavingsTips = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get recent transactions and budgets
    const oneMonthAgo = subMonths(new Date(), 1);
    const transactions = await Transaction.find({
      userId,
      date: { $gte: oneMonthAgo }
    });

    const budgets = await Budget.find({ userId, isActive: true });
    const goals = await Goal.find({ userId, status: { $ne: 'completed' } });

    const tips = [];

    // Analyze spending patterns
    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

    // Tip 1: Based on savings rate
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      if (savingsRate < 20) {
        tips.push({
          category: 'savings',
          priority: 'high',
          tip: 'Increase your savings rate',
          description: `You're currently saving ${savingsRate.toFixed(
            1
          )}%. Try to reach at least 20% by reducing unnecessary expenses.`,
          potentialSavings: ((totalIncome * 0.2 - (totalIncome - totalExpense))).toFixed(2)
        });
      }
    }

    // Tip 2: Budget optimization
    for (const budget of budgets) {
      const percentageUsed = (budget.spent / budget.amount) * 100;
      if (percentageUsed > 90) {
        tips.push({
          category: 'budget',
          priority: 'high',
          tip: `Reduce ${budget.category} spending`,
          description: `You've used ${percentageUsed.toFixed(1)}% of your ${
            budget.category
          } budget. Consider cutting back.`
        });
      }
    }

    // Tip 3: Goal-based savings
    if (goals.length > 0) {
      const totalGoalAmount = goals.reduce((sum, g) => g.targetAmount - g.currentAmount, 0);
      const monthsToDeadline = goals.reduce((min, g) => {
        if (!g.deadline) return min;
        const months = Math.floor(
          (new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)
        );
        return months < min ? months : min;
      }, Infinity);

      if (monthsToDeadline !== Infinity && monthsToDeadline > 0) {
        const monthlyRequired = totalGoalAmount / monthsToDeadline;
        tips.push({
          category: 'goals',
          priority: 'medium',
          tip: 'Stay on track with your goals',
          description: `Save $${monthlyRequired.toFixed(
            2
          )}/month to reach your financial goals on time.`,
          potentialSavings: monthlyRequired.toFixed(2)
        });
      }
    }

    // General tips
    tips.push({
      category: 'general',
      priority: 'low',
      tip: 'Track every expense',
      description: 'Consistent tracking helps identify saving opportunities you might miss.'
    });

    res.json({
      success: true,
      count: tips.length,
      data: { tips }
    });
  } catch (error) {
    next(error);
  }
};