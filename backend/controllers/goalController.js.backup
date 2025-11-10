const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res, next) => {
  try {
    const {
      name,
      description,
      targetAmount,
      currentAmount,
      targetDate,
      category,
      priority
    } = req.body;

    // Validate required fields
    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, target amount, and target date'
      });
    }

    // Validate target amount
    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than 0'
      });
    }

    // Validate target date is in the future
    if (new Date(targetDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Target date must be in the future'
      });
    }

    // Validate current amount if provided
    if (currentAmount && currentAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Current amount cannot be negative'
      });
    }

    // Create goal
    const goal = await Goal.create({
      user: req.user._id,
      name,
      description,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate,
      category,
      priority: priority || 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all goals for logged in user
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const { status, priority, category } = req.query;

    // Build filter
    const filter = { user: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (category) {
      filter.category = category;
    }

    const goals = await Goal.find(filter).sort({ createdAt: -1 });

    // Calculate additional statistics
    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      paused: goals.filter(g => g.status === 'paused').length,
      totalTargetAmount: goals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalCurrentAmount: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      totalProgress: goals.length > 0 
        ? (goals.reduce((sum, g) => sum + g.progress, 0) / goals.length).toFixed(2)
        : 0
    };

    res.status(200).json({
      success: true,
      count: goals.length,
      stats,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single goal by ID
// @route   GET /api/goals/:id
// @access  Private
exports.getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if goal belongs to user
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this goal'
      });
    }

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if goal belongs to user
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal'
      });
    }

    const {
      name,
      description,
      targetAmount,
      currentAmount,
      targetDate,
      category,
      priority,
      status
    } = req.body;

    // Validate target amount if updating
    if (targetAmount && targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than 0'
      });
    }

    // Validate current amount if updating
    if (currentAmount !== undefined && currentAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Current amount cannot be negative'
      });
    }

    // Validate target date if updating
    if (targetDate && new Date(targetDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Target date must be in the future'
      });
    }

    // Update fields
    if (name) goal.name = name;
    if (description !== undefined) goal.description = description;
    if (targetAmount) goal.targetAmount = targetAmount;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;
    if (targetDate) goal.targetDate = targetDate;
    if (category) goal.category = category;
    if (priority) goal.priority = priority;
    if (status) goal.status = status;

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if goal belongs to user
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this goal'
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    next(error);
  }
};

// @desc    Add contribution to goal
// @route   POST /api/goals/:id/contribute
// @access  Private
exports.contributeToGoal = async (req, res, next) => {
  try {
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contribution amount'
      });
    }

    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if goal belongs to user
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to contribute to this goal'
      });
    }

    // Check if goal is active
    if (goal.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Can only contribute to active goals'
      });
    }

    // Add contribution
    goal.currentAmount += amount;

    // Add to contributions array
    goal.contributions.push({
      amount,
      note: note || '',
      date: new Date()
    });

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
      goal.completedDate = new Date();
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Contribution added successfully',
      data: goal
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    next(error);
  }
};

// @desc    Withdraw from goal
// @route   POST /api/goals/:id/withdraw
// @access  Private
exports.withdrawFromGoal = async (req, res, next) => {
  try {
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid withdrawal amount'
      });
    }

    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if goal belongs to user
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw from this goal'
      });
    }

    // Check if sufficient funds
    if (goal.currentAmount < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds in goal'
      });
    }

    // Subtract withdrawal
    goal.currentAmount -= amount;

    // Add to withdrawals array
    goal.withdrawals.push({
      amount,
      note: note || '',
      date: new Date()
    });

    // If was completed, set back to active
    if (goal.status === 'completed' && goal.currentAmount < goal.targetAmount) {
      goal.status = 'active';
      goal.completedDate = null;
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal processed successfully',
      data: goal
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    next(error);
  }
};

// @desc    Update goal status
// @route   PATCH /api/goals/:id/status
// @access  Private
exports.updateGoalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'completed', 'paused', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (active, completed, paused, cancelled)'
      });
    }

    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if goal belongs to user
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal'
      });
    }

    goal.status = status;

    if (status === 'completed') {
      goal.completedDate = new Date();
    } else if (status === 'active') {
      goal.completedDate = null;
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: `Goal status updated to ${status}`,
      data: goal
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    next(error);
  }
};

// @desc    Get goal statistics
// @route   GET /api/goals/stats
// @access  Private
exports.getGoalStats = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id });

    const stats = {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      pausedGoals: goals.filter(g => g.status === 'paused').length,
      cancelledGoals: goals.filter(g => g.status === 'cancelled').length,
      
      totalTargetAmount: goals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalCurrentAmount: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      totalRemaining: goals.reduce((sum, g) => sum + (g.targetAmount - g.currentAmount), 0),
      
      averageProgress: goals.length > 0 
        ? (goals.reduce((sum, g) => sum + g.progress, 0) / goals.length).toFixed(2)
        : 0,
      
      highPriorityGoals: goals.filter(g => g.priority === 'high' && g.status === 'active').length,
      mediumPriorityGoals: goals.filter(g => g.priority === 'medium' && g.status === 'active').length,
      lowPriorityGoals: goals.filter(g => g.priority === 'low' && g.status === 'active').length,

      nearingDeadline: goals.filter(g => {
        const daysLeft = Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        return g.status === 'active' && daysLeft <= 30 && daysLeft > 0;
      }).length,

      overdue: goals.filter(g => {
        return g.status === 'active' && new Date(g.targetDate) < new Date();
      }).length,

      totalContributions: goals.reduce((sum, g) => sum + g.contributions.length, 0),
      totalWithdrawals: goals.reduce((sum, g) => sum + g.withdrawals.length, 0)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};