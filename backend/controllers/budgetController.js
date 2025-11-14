// backend/controllers/budgetController.js

const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { startOfMonth, endOfMonth, startOfWeek, endOfWeek } = require('date-fns');

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res, next) => {
  try {
    const { category, amount, period, startDate } = req.body;

    // Validate required fields
    if (!category || !amount || !period) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, amount, and period'
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be greater than 0'
      });
    }

    // Validate period
    const validPeriods = ['weekly', 'monthly', 'yearly'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Period must be weekly, monthly, or yearly'
      });
    }

    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      userId: req.user._id,
      category,
      period,
      isActive: true
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and period'
      });
    }

    // Create budget
    const budget = await Budget.create({
      userId: req.user._id,
      category,
      amount,
      period,
      startDate: startDate || new Date(),
      spent: 0,
      remaining: amount
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: { budget }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const { period, category, status } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (period) {
      query.period = period;
    }

    if (category) {
      query.category = category;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const budgets = await Budget.find(query).sort('-createdAt');

    res.json({
      success: true,
      count: budgets.length,
      data: { budgets }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget by ID
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      data: { budget }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    const { amount, period, startDate, isActive } = req.body;

    // Update fields
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Budget amount must be greater than 0'
        });
      }
      budget.amount = amount;
      budget.remaining = amount - budget.spent;
    }

    if (period) {
      const validPeriods = ['weekly', 'monthly', 'yearly'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          message: 'Period must be weekly, monthly, or yearly'
        });
      }
      budget.period = period;
    }

    if (startDate) {
      budget.startDate = startDate;
    }

    if (isActive !== undefined) {
      budget.isActive = isActive;
    }

    await budget.save();

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: { budget }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget status with spending details
// @route   GET /api/budgets/status
// @access  Private
exports.getBudgetStatus = async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      userId: req.user._id,
      isActive: true
    });

    // Calculate spending for each budget
    const budgetStatus = await Promise.all(
      budgets.map(async (budget) => {
        let startDate, endDate;

        // Calculate date range based on period
        const now = new Date();
        switch (budget.period) {
          case 'weekly':
            startDate = startOfWeek(now);
            endDate = endOfWeek(now);
            break;
          case 'monthly':
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
          case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            break;
          default:
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
        }

        // Get spending for this category in the period
        const transactions = await Transaction.find({
          userId: req.user._id,
          category: budget.category,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        });

        const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
        const remaining = budget.amount - spent;
        const percentageUsed = (spent / budget.amount) * 100;

        // Update budget with current spending
        budget.spent = spent;
        budget.remaining = remaining;
        await budget.save();

        return {
          _id: budget._id,
          category: budget.category,
          amount: budget.amount,
          spent: spent,
          remaining: remaining,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          period: budget.period,
          status:
            percentageUsed >= 100
              ? 'exceeded'
              : percentageUsed >= 80
              ? 'warning'
              : 'on-track',
          startDate,
          endDate
        };
      })
    );

    res.json({
      success: true,
      data: { budgets: budgetStatus }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget alerts (budgets exceeding threshold)
// @route   GET /api/budgets/alerts
// @access  Private
exports.getBudgetAlerts = async (req, res, next) => {
  try {
    const threshold = req.query.threshold || 80; // Default 80%

    const budgets = await Budget.find({
      userId: req.user._id,
      isActive: true
    });

    const alerts = [];

    for (const budget of budgets) {
      const percentageUsed = (budget.spent / budget.amount) * 100;

      if (percentageUsed >= threshold) {
        alerts.push({
          budgetId: budget._id,
          category: budget.category,
          amount: budget.amount,
          spent: budget.spent,
          remaining: budget.remaining,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          severity: percentageUsed >= 100 ? 'critical' : 'warning'
        });
      }
    }

    res.json({
      success: true,
      count: alerts.length,
      data: { alerts }
    });
  } catch (error) {
    next(error);
  }
};