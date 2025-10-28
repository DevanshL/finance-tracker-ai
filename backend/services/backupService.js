const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Category = require('../models/Category');
const RecurringTransaction = require('../models/RecurringTransaction');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create full backup of user data
 */
exports.createBackup = async (userId) => {
  try {
    const [
      user,
      transactions,
      budgets,
      goals,
      categories,
      recurringTransactions,
      reports,
      notifications
    ] = await Promise.all([
      User.findById(userId).select('-password').lean(),
      Transaction.find({ user: userId }).populate('category').lean(),
      Budget.find({ user: userId }).populate('category').lean(),
      Goal.find({ user: userId }).lean(),
      Category.find({ user: userId }).lean(),
      RecurringTransaction.find({ user: userId }).populate('category').lean(),
      Report.find({ user: userId }).lean(),
      Notification.find({ user: userId }).lean()
    ]);

    const backup = {
      version: '1.0.0',
      backupDate: new Date(),
      userId: userId,
      user: {
        name: user.name,
        email: user.email,
        preferences: user.preferences
      },
      data: {
        transactions: transactions.map(t => ({
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category?.name,
          date: t.date,
          paymentMethod: t.paymentMethod,
          notes: t.notes,
          createdAt: t.createdAt
        })),
        budgets: budgets.map(b => ({
          amount: b.amount,
          category: b.category?.name,
          period: b.period,
          startDate: b.startDate,
          endDate: b.endDate,
          spent: b.spent,
          status: b.status
        })),
        goals: goals.map(g => ({
          name: g.name,
          description: g.description,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          targetDate: g.targetDate,
          priority: g.priority,
          status: g.status
        })),
        categories: categories.map(c => ({
          name: c.name,
          type: c.type,
          icon: c.icon,
          color: c.color
        })),
        recurringTransactions: recurringTransactions.map(r => ({
          description: r.description,
          amount: r.amount,
          type: r.type,
          category: r.category?.name,
          frequency: r.frequency,
          startDate: r.startDate,
          endDate: r.endDate,
          isActive: r.isActive,
          autoProcess: r.autoProcess
        })),
        reports: reports.map(r => ({
          name: r.name,
          type: r.type,
          period: r.period,
          startDate: r.startDate,
          endDate: r.endDate,
          summary: r.summary,
          createdAt: r.createdAt
        }))
      },
      stats: {
        totalTransactions: transactions.length,
        totalBudgets: budgets.length,
        totalGoals: goals.length,
        totalCategories: categories.length,
        totalRecurring: recurringTransactions.length,
        totalReports: reports.length
      }
    };

    return backup;
  } catch (error) {
    throw new Error('Failed to create backup: ' + error.message);
  }
};

/**
 * Restore data from backup
 */
exports.restoreBackup = async (userId, backupData) => {
  try {
    const results = {
      transactions: 0,
      budgets: 0,
      goals: 0,
      categories: 0,
      recurringTransactions: 0,
      errors: []
    };

    // Validate backup structure
    if (!backupData.version || !backupData.data) {
      throw new Error('Invalid backup format');
    }

    // Restore categories first (needed for transactions and budgets)
    const categoryMap = new Map();
    if (backupData.data.categories) {
      for (const cat of backupData.data.categories) {
        try {
          const existing = await Category.findOne({
            user: userId,
            name: cat.name,
            type: cat.type
          });

          if (!existing) {
            const newCategory = await Category.create({
              user: userId,
              ...cat
            });
            categoryMap.set(cat.name, newCategory._id);
            results.categories++;
          } else {
            categoryMap.set(cat.name, existing._id);
          }
        } catch (error) {
          results.errors.push(`Category ${cat.name}: ${error.message}`);
        }
      }
    }

    // Restore transactions
    if (backupData.data.transactions) {
      for (const trans of backupData.data.transactions) {
        try {
          const categoryId = categoryMap.get(trans.category);
          await Transaction.create({
            user: userId,
            description: trans.description,
            amount: trans.amount,
            type: trans.type,
            category: categoryId,
            date: trans.date,
            paymentMethod: trans.paymentMethod,
            notes: trans.notes
          });
          results.transactions++;
        } catch (error) {
          results.errors.push(`Transaction: ${error.message}`);
        }
      }
    }

    // Restore budgets
    if (backupData.data.budgets) {
      for (const budget of backupData.data.budgets) {
        try {
          const categoryId = categoryMap.get(budget.category);
          await Budget.create({
            user: userId,
            amount: budget.amount,
            category: categoryId,
            period: budget.period,
            startDate: budget.startDate,
            endDate: budget.endDate
          });
          results.budgets++;
        } catch (error) {
          results.errors.push(`Budget: ${error.message}`);
        }
      }
    }

    // Restore goals
    if (backupData.data.goals) {
      for (const goal of backupData.data.goals) {
        try {
          await Goal.create({
            user: userId,
            name: goal.name,
            description: goal.description,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            targetDate: goal.targetDate,
            priority: goal.priority
          });
          results.goals++;
        } catch (error) {
          results.errors.push(`Goal: ${error.message}`);
        }
      }
    }

    // Restore recurring transactions
    if (backupData.data.recurringTransactions) {
      for (const recurring of backupData.data.recurringTransactions) {
        try {
          const categoryId = categoryMap.get(recurring.category);
          await RecurringTransaction.create({
            user: userId,
            description: recurring.description,
            amount: recurring.amount,
            type: recurring.type,
            category: categoryId,
            frequency: recurring.frequency,
            startDate: recurring.startDate,
            endDate: recurring.endDate,
            nextOccurrence: recurring.startDate,
            isActive: recurring.isActive,
            autoProcess: recurring.autoProcess
          });
          results.recurringTransactions++;
        } catch (error) {
          results.errors.push(`Recurring: ${error.message}`);
        }
      }
    }

    return results;
  } catch (error) {
    throw new Error('Failed to restore backup: ' + error.message);
  }
};

/**
 * Export backup as JSON file
 */
exports.exportBackupJSON = async (userId) => {
  const backup = await this.createBackup(userId);
  return JSON.stringify(backup, null, 2);
};

/**
 * Validate backup file
 */
exports.validateBackup = (backupData) => {
  const errors = [];

  if (!backupData.version) {
    errors.push('Missing version number');
  }

  if (!backupData.data) {
    errors.push('Missing data section');
  }

  if (!backupData.backupDate) {
    errors.push('Missing backup date');
  }

  // Check data structure
  if (backupData.data) {
    const requiredFields = ['transactions', 'budgets', 'goals', 'categories'];
    requiredFields.forEach(field => {
      if (!backupData.data[field]) {
        errors.push(`Missing ${field} data`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get backup history
 */
exports.getBackupHistory = async (userId) => {
  // This would store backup metadata in a Backup collection
  // For now, return empty array
  return [];
};

/**
 * Delete old data (for fresh start after restore)
 */
exports.clearUserData = async (userId, options = {}) => {
  const results = {
    deleted: {
      transactions: 0,
      budgets: 0,
      goals: 0,
      categories: 0,
      recurringTransactions: 0,
      reports: 0,
      notifications: 0
    }
  };

  if (options.transactions !== false) {
    const trans = await Transaction.deleteMany({ user: userId });
    results.deleted.transactions = trans.deletedCount;
  }

  if (options.budgets !== false) {
    const budg = await Budget.deleteMany({ user: userId });
    results.deleted.budgets = budg.deletedCount;
  }

  if (options.goals !== false) {
    const goal = await Goal.deleteMany({ user: userId });
    results.deleted.goals = goal.deletedCount;
  }

  if (options.categories !== false) {
    const cat = await Category.deleteMany({ user: userId });
    results.deleted.categories = cat.deletedCount;
  }

  if (options.recurringTransactions !== false) {
    const rec = await RecurringTransaction.deleteMany({ user: userId });
    results.deleted.recurringTransactions = rec.deletedCount;
  }

  if (options.reports !== false) {
    const rep = await Report.deleteMany({ user: userId });
    results.deleted.reports = rep.deletedCount;
  }

  if (options.notifications !== false) {
    const notif = await Notification.deleteMany({ user: userId });
    results.deleted.notifications = notif.deletedCount;
  }

  return results;
};