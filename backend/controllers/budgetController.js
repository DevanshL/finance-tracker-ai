const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const { status, period } = req.query;

    const filter = { user: req.user._id };

    if (status) filter.status = status;
    if (period) filter.period = period;

    const budgets = await Budget.find(filter)
      .populate('category', 'name icon color')
      .sort({ createdAt: -1 });

    // Calculate spent amount for each budget
    for (let budget of budgets) {
      const spent = await Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            category: budget.category._id,
            type: 'expense',
            date: {
              $gte: new Date(budget.startDate),
              $lte: new Date(budget.endDate)
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      budget.spent = spent.length > 0 ? spent[0].total : 0;
      budget.remaining = budget.amount - budget.spent;
    }

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    console.error('Error getting budgets:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching budgets'
    });
  }
};

// @desc    Get a single budget
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('category', 'name icon color');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if user owns the budget
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this budget'
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Error getting budget:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching budget'
    });
  }
};

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res, next) => {
  try {
    const { category, amount, period, alert, description } = req.body;

    console.log('📊 Creating budget:', { category, amount, period, alert });

    // Validation
    if (!category || !amount || !period) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, amount, and period'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    if (!['weekly', 'monthly', 'yearly'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Period must be weekly, monthly, or yearly'
      });
    }

    // Check if category exists
    const categoryDoc = await Category.findOne({ name: category, user: req.user._id });
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: `Category "${category}" not found`
      });
    }

    // Calculate startDate and endDate based on period
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (period === 'weekly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    // Create budget
    const budget = await Budget.create({
      user: req.user._id,
      category: categoryDoc._id,
      amount,
      period,
      alert: alert || 80,
      description: description || '',
      startDate,
      endDate,
      spent: 0,
      remaining: amount,
      status: 'on_track'
    });

    console.log('✅ Budget created:', budget._id);

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating budget'
    });
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res, next) => {
  try {
    const { amount, alert, description, period } = req.body;

    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if user owns the budget
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this budget'
      });
    }

    if (amount) budget.amount = amount;
    if (alert) budget.alert = alert;
    if (description !== undefined) budget.description = description;
    if (period) {
      if (!['weekly', 'monthly', 'yearly'].includes(period)) {
        return res.status(400).json({
          success: false,
          message: 'Period must be weekly, monthly, or yearly'
        });
      }
      budget.period = period;
    }

    await budget.save();

    console.log('✅ Budget updated:', budget._id);

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: budget
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating budget'
    });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if user owns the budget
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this budget'
      });
    }

    await Budget.findByIdAndDelete(req.params.id);

    console.log('✅ Budget deleted:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting budget'
    });
  }
};

// @desc    Get budget by category
// @route   GET /api/budgets/category/:categoryName
// @access  Private
exports.getBudgetByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;

    const category = await Category.findOne({ name: categoryName, user: req.user._id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const budget = await Budget.findOne({ user: req.user._id, category: category._id })
      .populate('category', 'name icon color');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: `Budget for category "${categoryName}" not found`
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Error getting budget by category:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching budget'
    });
  }
};

// @desc    Get budget analytics
// @route   GET /api/budgets/analytics/:period
// @access  Private
exports.getAnalytics = async (req, res, next) => {
  try {
    const { period } = req.params;

    const budgets = await Budget.find({ user: req.user._id, period })
      .populate('category', 'name icon color');

    let totalBudget = 0;
    let totalSpent = 0;

    for (let budget of budgets) {
      totalBudget += budget.amount;
      totalSpent += budget.spent || 0;
    }

    res.status(200).json({
      success: true,
      data: {
        period,
        totalBudget,
        totalSpent,
        remaining: totalBudget - totalSpent,
        budgets
      }
    });
  } catch (error) {
    console.error('Error getting budget analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching analytics'
    });
  }
};

// Alias for analytics
exports.getMonthlyAnalytics = async (req, res, next) => {
  req.params.period = 'monthly';
  exports.getAnalytics(req, res, next);
};

// @desc    Get budget alerts
// @route   GET /api/budgets/alerts
// @access  Private
exports.getBudgetAlerts = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user._id })
      .populate('category', 'name icon color');

    const alerts = budgets.filter(budget => {
      const percentageUsed = (budget.spent / budget.amount) * 100;
      return percentageUsed >= (budget.alert || 80);
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error getting budget alerts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching alerts'
    });
  }
};
