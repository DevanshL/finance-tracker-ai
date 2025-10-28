const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constants');
const { getPagination, getPaginationInfo } = require('../utils/helpers');

/**
 * @desc    Get all budgets for logged in user
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isActive, period, status } = req.query;

  const query = { userId: req.user._id };

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (period) {
    query.period = period;
  }

  const { skip, limit: limitNum } = getPagination(page, limit);

  let budgets = await Budget.find(query)
    .sort({ startDate: -1 })
    .skip(skip)
    .limit(limitNum);

  // Calculate current spending for each budget
  for (let budget of budgets) {
    const spent = await Transaction.aggregate([
      {
        $match: {
          userId: budget.userId,
          type: 'expense',
          category: budget.category,
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate
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
    await budget.save();
  }

  // Filter by status if requested
  if (status) {
    budgets = budgets.filter(b => b.status === status);
  }

  const total = await Budget.countDocuments(query);
  const pagination = getPaginationInfo(total, parseInt(page), limitNum);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: budgets.length,
    pagination,
    data: { budgets }
  });
});

/**
 * @desc    Get single budget
 * @route   GET /api/budgets/:id
 * @access  Private
 */
const getBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!budget) {
    throw new AppError('Budget not found', HTTP_STATUS.NOT_FOUND);
  }

  // Calculate current spending
  const spent = await Transaction.aggregate([
    {
      $match: {
        userId: budget.userId,
        type: 'expense',
        category: budget.category,
        date: {
          $gte: budget.startDate,
          $lte: budget.endDate
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
  await budget.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { budget }
  });
});

/**
 * @desc    Create new budget
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    amount,
    period,
    startDate,
    endDate,
    alertThreshold,
    notes
  } = req.body;

  // Check for overlapping budgets
  const overlapping = await Budget.findOne({
    userId: req.user._id,
    category,
    isActive: true,
    $or: [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      }
    ]
  });

  if (overlapping) {
    throw new AppError(
      `An active budget for ${category} already exists in this period`,
      HTTP_STATUS.CONFLICT
    );
  }

  const budget = await Budget.create({
    userId: req.user._id,
    name,
    category,
    amount,
    period,
    startDate,
    endDate,
    alertThreshold: alertThreshold || 80,
    notes
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.CREATED,
    data: { budget }
  });
});

/**
 * @desc    Update budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = asyncHandler(async (req, res) => {
  let budget = await Budget.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!budget) {
    throw new AppError('Budget not found', HTTP_STATUS.NOT_FOUND);
  }

  const {
    name,
    amount,
    period,
    startDate,
    endDate,
    alertThreshold,
    isActive,
    notes
  } = req.body;

  if (name) budget.name = name;
  if (amount) budget.amount = amount;
  if (period) budget.period = period;
  if (startDate) budget.startDate = startDate;
  if (endDate) budget.endDate = endDate;
  if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold;
  if (isActive !== undefined) budget.isActive = isActive;
  if (notes !== undefined) budget.notes = notes;

  await budget.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.UPDATED,
    data: { budget }
  });
});

/**
 * @desc    Delete budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!budget) {
    throw new AppError('Budget not found', HTTP_STATUS.NOT_FOUND);
  }

  await budget.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.DELETED,
    data: null
  });
});

/**
 * @desc    Get budget alerts
 * @route   GET /api/budgets/alerts
 * @access  Private
 */
const getBudgetAlerts = asyncHandler(async (req, res) => {
  const budgets = await Budget.getBudgetAlerts(req.user._id);

  const alerts = budgets.map(budget => ({
    budgetId: budget._id,
    name: budget.name,
    category: budget.category,
    amount: budget.amount,
    spent: budget.spent,
    remaining: budget.remaining,
    percentageUsed: budget.percentageUsed,
    status: budget.status,
    message: budget.isExceeded()
      ? `Budget exceeded! You've spent $${budget.spent} of $${budget.amount}`
      : `Warning: You've used ${budget.percentageUsed}% of your ${budget.name} budget`
  }));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: alerts.length,
    data: { alerts }
  });
});

/**
 * @desc    Get budget progress
 * @route   GET /api/budgets/:id/progress
 * @access  Private
 */
const getBudgetProgress = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!budget) {
    throw new AppError('Budget not found', HTTP_STATUS.NOT_FOUND);
  }

  // Get all transactions for this budget
  const transactions = await Transaction.find({
    userId: req.user._id,
    type: 'expense',
    category: budget.category,
    date: {
      $gte: budget.startDate,
      $lte: budget.endDate
    }
  }).sort({ date: -1 });

  // Calculate daily spending
  const dailySpending = {};
  transactions.forEach(t => {
    const date = t.date.toISOString().split('T')[0];
    dailySpending[date] = (dailySpending[date] || 0) + t.amount;
  });

  // Calculate spending trend
  const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
  budget.spent = spent;
  await budget.save();

  // Calculate days remaining
  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((budget.endDate - now) / (1000 * 60 * 60 * 24))
  );

  // Calculate average daily spending
  const totalDays = Math.ceil(
    (budget.endDate - budget.startDate) / (1000 * 60 * 60 * 24)
  );
  const daysPassed = totalDays - daysRemaining;
  const avgDailySpending = daysPassed > 0 ? spent / daysPassed : 0;

  // Project end-of-period spending
  const projectedSpending = avgDailySpending * totalDays;

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      budget: {
        id: budget._id,
        name: budget.name,
        category: budget.category,
        amount: budget.amount,
        spent: budget.spent,
        remaining: budget.remaining,
        percentageUsed: budget.percentageUsed,
        status: budget.status
      },
      progress: {
        daysRemaining,
        totalDays,
        daysPassed,
        avgDailySpending: Math.round(avgDailySpending * 100) / 100,
        projectedSpending: Math.round(projectedSpending * 100) / 100,
        projectedRemaining: Math.round((budget.amount - projectedSpending) * 100) / 100,
        dailySpending
      },
      transactions: transactions.slice(0, 10) // Last 10 transactions
    }
  });
});

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  getBudgetProgress
};
