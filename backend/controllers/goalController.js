// backend/controllers/goalController.js

const Goal = require('../models/Goal');

// @desc    Create a new financial goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, deadline, priority, description } = req.body;

    // Validate required fields
    if (!name || !targetAmount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide goal name and target amount'
      });
    }

    // Validate amounts
    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than 0'
      });
    }

    if (currentAmount && currentAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Current amount cannot be negative'
      });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be low, medium, or high'
      });
    }

    // Calculate progress percentage
    const current = currentAmount || 0;
    const progress = (current / targetAmount) * 100;

    // Create goal
    const goal = await Goal.create({
      userId: req.user._id,
      name,
      targetAmount,
      currentAmount: current,
      deadline,
      priority: priority || 'medium',
      description,
      progress: Math.min(progress, 100), // Cap at 100%
      status: progress >= 100 ? 'completed' : 'in-progress'
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const { status, priority, sort } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    // Build sort
    let sortOption = '-createdAt'; // Default: newest first

    if (sort === 'deadline') {
      sortOption = 'deadline';
    } else if (sort === 'progress') {
      sortOption = '-progress';
    } else if (sort === 'priority') {
      // Custom sort: high > medium > low
      sortOption = '-priority';
    } else if (sort === 'amount') {
      sortOption = '-targetAmount';
    }

    const goals = await Goal.find(query).sort(sortOption);

    res.json({
      success: true,
      count: goals.length,
      data: { goals }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get goal by ID
// @route   GET /api/goals/:id
// @access  Private
exports.getGoalById = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const {
      name,
      targetAmount,
      currentAmount,
      deadline,
      priority,
      description,
      status
    } = req.body;

    // Update fields
    if (name) goal.name = name;
    if (description !== undefined) goal.description = description;
    if (deadline) goal.deadline = deadline;

    if (targetAmount !== undefined) {
      if (targetAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Target amount must be greater than 0'
        });
      }
      goal.targetAmount = targetAmount;
    }

    if (currentAmount !== undefined) {
      if (currentAmount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Current amount cannot be negative'
        });
      }
      goal.currentAmount = currentAmount;
    }

    if (priority) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be low, medium, or high'
        });
      }
      goal.priority = priority;
    }

    if (status) {
      const validStatuses = ['not-started', 'in-progress', 'completed', 'abandoned'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      goal.status = status;
    }

    // Recalculate progress
    goal.progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    // Auto-update status based on progress
    if (goal.progress >= 100 && goal.status !== 'completed') {
      goal.status = 'completed';
    } else if (goal.progress > 0 && goal.status === 'not-started') {
      goal.status = 'in-progress';
    }

    await goal.save();

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add contribution to goal
// @route   POST /api/goals/:id/contribute
// @access  Private
exports.addContribution = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Contribution amount must be greater than 0'
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Add to current amount
    goal.currentAmount += amount;

    // Recalculate progress
    goal.progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    // Update status if goal is reached
    if (goal.progress >= 100) {
      goal.status = 'completed';
    } else if (goal.status === 'not-started') {
      goal.status = 'in-progress';
    }

    await goal.save();

    res.json({
      success: true,
      message: `Added $${amount} to goal`,
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get goal statistics
// @route   GET /api/goals/stats
// @access  Private
exports.getGoalStats = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });

    const stats = {
      total: goals.length,
      completed: goals.filter((g) => g.status === 'completed').length,
      inProgress: goals.filter((g) => g.status === 'in-progress').length,
      notStarted: goals.filter((g) => g.status === 'not-started').length,
      totalTarget: goals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalSaved: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      averageProgress:
        goals.length > 0
          ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
          : 0
    };

    stats.remaining = stats.totalTarget - stats.totalSaved;
    stats.overallProgress = stats.totalTarget > 0 
      ? (stats.totalSaved / stats.totalTarget) * 100 
      : 0;

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};