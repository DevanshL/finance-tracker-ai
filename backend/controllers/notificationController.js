const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = [];

    // Check budget alerts
    const budgets = await Budget.find({
      user: req.user._id,
      status: 'active'
    }).populate('category');

    budgets.forEach(budget => {
      const percentUsed = (budget.spent / budget.amount) * 100;

      if (percentUsed >= 100) {
        notifications.push({
          type: 'alert',
          category: 'budget',
          priority: 'high',
          title: 'Budget Exceeded',
          message: `You've exceeded your ${budget.category.name} budget by $${(budget.spent - budget.amount).toFixed(2)}`,
          data: { budgetId: budget._id },
          timestamp: new Date()
        });
      } else if (percentUsed >= 90) {
        notifications.push({
          type: 'warning',
          category: 'budget',
          priority: 'medium',
          title: 'Budget Alert',
          message: `You've used ${percentUsed.toFixed(0)}% of your ${budget.category.name} budget`,
          data: { budgetId: budget._id },
          timestamp: new Date()
        });
      }
    });

    // Check goal deadlines
    const goals = await Goal.find({
      user: req.user._id,
      status: 'active'
    });

    const now = new Date();
    goals.forEach(goal => {
      const daysLeft = Math.ceil((new Date(goal.targetDate) - now) / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) {
        notifications.push({
          type: 'alert',
          category: 'goal',
          priority: 'high',
          title: 'Goal Overdue',
          message: `Your goal "${goal.name}" deadline has passed`,
          data: { goalId: goal._id },
          timestamp: new Date()
        });
      } else if (daysLeft <= 7 && goal.progress < 100) {
        notifications.push({
          type: 'warning',
          category: 'goal',
          priority: 'medium',
          title: 'Goal Deadline Approaching',
          message: `Only ${daysLeft} days left for "${goal.name}" (${goal.progress.toFixed(0)}% complete)`,
          data: { goalId: goal._id },
          timestamp: new Date()
        });
      } else if (goal.progress >= 100 && goal.status !== 'completed') {
        notifications.push({
          type: 'success',
          category: 'goal',
          priority: 'low',
          title: 'Goal Achieved!',
          message: `Congratulations! You've reached your goal: "${goal.name}"`,
          data: { goalId: goal._id },
          timestamp: new Date()
        });
      }
    });

    // Check for unusual spending
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await Transaction.find({
      user: req.user._id,
      type: 'expense',
      date: { $gte: thirtyDaysAgo }
    });

    if (recentTransactions.length > 0) {
      const avgDaily = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / 30;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const yesterdaySpending = await Transaction.find({
        user: req.user._id,
        type: 'expense',
        date: { $gte: yesterday, $lte: yesterdayEnd }
      });

      const yesterdayTotal = yesterdaySpending.reduce((sum, t) => sum + t.amount, 0);

      if (yesterdayTotal > avgDaily * 2) {
        notifications.push({
          type: 'info',
          category: 'spending',
          priority: 'medium',
          title: 'Unusual Spending Detected',
          message: `Yesterday's spending ($${yesterdayTotal.toFixed(2)}) was significantly higher than your average`,
          data: {},
          timestamp: new Date()
        });
      }
    }

    // Sort by priority and timestamp
    notifications.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.timestamp - a.timestamp;
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   POST /api/notifications/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};