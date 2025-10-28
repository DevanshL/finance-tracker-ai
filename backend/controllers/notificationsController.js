const Notification = require('../models/Notification');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const { isRead, type, priority, limit = 50 } = req.query;

    const filter = { user: req.user._id };
    
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (priority) {
      filter.priority = priority;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check ownership
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this notification'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check ownership
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this notification'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check ownership
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
exports.clearReadNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({
      user: req.user._id,
      isRead: true
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications cleared`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread/count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate smart notifications (check budgets, goals, etc.)
// @route   POST /api/notifications/generate
// @access  Private
exports.generateNotifications = async (req, res, next) => {
  try {
    const notifications = [];

    // Check budget alerts
    const budgets = await Budget.find({
      user: req.user._id,
      status: 'active'
    }).populate('category');

    for (const budget of budgets) {
      const percentUsed = (budget.spent / budget.amount) * 100;

      if (percentUsed >= 100) {
        notifications.push({
          user: req.user._id,
          type: 'budget_exceeded',
          priority: 'high',
          title: 'Budget Exceeded',
          message: `You've exceeded your ${budget.category?.name || 'budget'} by $${(budget.spent - budget.amount).toFixed(2)}`,
          relatedEntity: {
            entityType: 'budget',
            entityId: budget._id
          },
          actionUrl: `/budgets/${budget._id}`,
          actionText: 'View Budget'
        });
      } else if (percentUsed >= 90) {
        notifications.push({
          user: req.user._id,
          type: 'budget_alert',
          priority: 'medium',
          title: 'Budget Alert',
          message: `You've used ${percentUsed.toFixed(0)}% of your ${budget.category?.name || 'budget'}`,
          relatedEntity: {
            entityType: 'budget',
            entityId: budget._id
          },
          actionUrl: `/budgets/${budget._id}`,
          actionText: 'View Budget'
        });
      }
    }

    // Check goal deadlines
    const goals = await Goal.find({
      user: req.user._id,
      status: 'active'
    });

    const now = new Date();
    for (const goal of goals) {
      const daysLeft = Math.ceil((new Date(goal.targetDate) - now) / (1000 * 60 * 60 * 24));

      if (goal.progress >= 100 && goal.status !== 'completed') {
        notifications.push({
          user: req.user._id,
          type: 'goal_achieved',
          priority: 'low',
          title: 'Goal Achieved!',
          message: `Congratulations! You've reached your goal: "${goal.name}"`,
          relatedEntity: {
            entityType: 'goal',
            entityId: goal._id
          },
          actionUrl: `/goals/${goal._id}`,
          actionText: 'View Goal'
        });
      } else if (daysLeft <= 7 && daysLeft > 0 && goal.progress < 100) {
        notifications.push({
          user: req.user._id,
          type: 'goal_reminder',
          priority: 'medium',
          title: 'Goal Deadline Approaching',
          message: `Only ${daysLeft} days left for "${goal.name}" (${goal.progress.toFixed(0)}% complete)`,
          relatedEntity: {
            entityType: 'goal',
            entityId: goal._id
          },
          actionUrl: `/goals/${goal._id}`,
          actionText: 'View Goal'
        });
      } else if (daysLeft < 0) {
        notifications.push({
          user: req.user._id,
          type: 'goal_reminder',
          priority: 'high',
          title: 'Goal Overdue',
          message: `Your goal "${goal.name}" deadline has passed`,
          relatedEntity: {
            entityType: 'goal',
            entityId: goal._id
          },
          actionUrl: `/goals/${goal._id}`,
          actionText: 'View Goal'
        });
      }
    }

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
          user: req.user._id,
          type: 'unusual_spending',
          priority: 'medium',
          title: 'Unusual Spending Detected',
          message: `Yesterday's spending ($${yesterdayTotal.toFixed(2)}) was significantly higher than your average`,
          actionUrl: '/analytics',
          actionText: 'View Analytics'
        });
      }
    }

    // Create notifications (avoid duplicates)
    const createdNotifications = [];
    for (const notif of notifications) {
      // Check if similar notification exists in last 24 hours
      const existing = await Notification.findOne({
        user: notif.user,
        type: notif.type,
        'relatedEntity.entityId': notif.relatedEntity?.entityId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (!existing) {
        const created = await Notification.create(notif);
        createdNotifications.push(created);
      }
    }

    res.status(200).json({
      success: true,
      generated: createdNotifications.length,
      data: createdNotifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create custom notification
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res, next) => {
  try {
    req.body.user = req.user._id;

    const notification = await Notification.create(req.body);

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};