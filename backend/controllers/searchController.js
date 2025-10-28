const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// @desc    Global search across all entities
// @route   GET /api/search
// @access  Private
exports.globalSearch = async (req, res, next) => {
  try {
    const { q, type, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchRegex = new RegExp(q, 'i');
    const results = {};

    // Search transactions
    if (!type || type === 'transactions') {
      const transactions = await Transaction.find({
        user: req.user._id,
        $or: [
          { description: searchRegex },
          { notes: searchRegex }
        ]
      })
        .populate('category')
        .limit(parseInt(limit))
        .sort({ date: -1 });

      results.transactions = transactions;
    }

    // Search budgets
    if (!type || type === 'budgets') {
      const budgets = await Budget.find({
        user: req.user._id
      })
        .populate({
          path: 'category',
          match: { name: searchRegex }
        })
        .limit(parseInt(limit));

      results.budgets = budgets.filter(b => b.category !== null);
    }

    // Search goals
    if (!type || type === 'goals') {
      const goals = await Goal.find({
        user: req.user._id,
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      })
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      results.goals = goals;
    }

    const totalResults = 
      (results.transactions?.length || 0) +
      (results.budgets?.length || 0) +
      (results.goals?.length || 0);

    res.status(200).json({
      success: true,
      query: q,
      totalResults,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Advanced transaction filtering
// @route   GET /api/search/transactions/advanced
// @access  Private
exports.advancedTransactionSearch = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      minAmount,
      maxAmount,
      type,
      category,
      paymentMethod,
      description,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    // Build filter
    const filter = { user: req.user._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (description) filter.description = new RegExp(description, 'i');

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('category')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};