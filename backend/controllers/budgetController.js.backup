const Budget = require('../models/Budget');
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
      await budget.save();
    }

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single budget
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

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this budget'
      });
    }

    // Calculate spent amount
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
    await budget.save();

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res, next) => {
  try {
    req.body.user = req.user._id;

    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      user: req.user._id,
      category: req.body.category,
      startDate: { $lte: new Date(req.body.endDate) },
      endDate: { $gte: new Date(req.body.startDate) },
      status: 'active'
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category in this period'
      });
    }

    const budget = await Budget.create(req.body);
    await budget.populate('category', 'name icon color');

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget
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
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this budget'
      });
    }

    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name icon color');

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: budget
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
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this budget'
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};