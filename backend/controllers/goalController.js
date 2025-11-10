const Goal = require('../models/Goal');

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    console.error('Error getting goals:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching goals'
    });
  }
};

// @desc    Get a single goal
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

    // Check if user owns the goal
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
    console.error('Error getting goal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching goal'
    });
  }
};

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
      deadline,
      targetDate,
      category,
      priority
    } = req.body;

    console.log('🎯 Creating goal:', { name, targetAmount, deadline, targetDate });

    // Use deadline or targetDate (support both field names)
    const goalDate = deadline || targetDate;

    // Validate required fields
    if (!name || !targetAmount || !goalDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, targetAmount, and deadline (or targetDate)'
      });
    }

    // Validate target amount
    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than 0'
      });
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(goalDate);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Deadline must be in the future'
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
      description: description || '',
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline: deadlineDate,
      category: category || 'Other',
      priority: priority || 'medium',
      status: 'active',
      progress: (currentAmount || 0) / targetAmount * 100
    });

    console.log('✅ Goal created:', goal._id);

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating goal'
    });
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    const { name, description, targetAmount, currentAmount, deadline, priority, status } = req.body;

    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if user owns the goal
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal'
      });
    }

    if (name) goal.name = name;
    if (description !== undefined) goal.description = description;
    if (targetAmount) goal.targetAmount = targetAmount;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;
    if (deadline) goal.deadline = deadline;
    if (priority) goal.priority = priority;
    if (status) goal.status = status;

    // Update progress
    if (currentAmount !== undefined || targetAmount) {
      goal.progress = ((currentAmount || goal.currentAmount) / (targetAmount || goal.targetAmount)) * 100;
    }

    await goal.save();

    console.log('✅ Goal updated:', goal._id);

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating goal'
    });
  }
};

// @desc    Delete a goal
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

    // Check if user owns the goal
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this goal'
      });
    }

    await Goal.findByIdAndDelete(req.params.id);

    console.log('✅ Goal deleted:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting goal'
    });
  }
};

// @desc    Contribute to goal
// @route   PATCH /api/goals/:id/progress
// @access  Private
exports.updateGoalProgress = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal'
      });
    }

    goal.currentAmount += amount;
    goal.progress = (goal.currentAmount / goal.targetAmount) * 100;

    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    console.log('✅ Goal progress updated:', goal._id);

    res.status(200).json({
      success: true,
      message: 'Goal progress updated successfully',
      data: goal
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating goal progress'
    });
  }
};

// @desc    Get goal progress
// @route   GET /api/goals/:id/progress
// @access  Private
exports.getGoalProgress = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this goal'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        goalId: goal._id,
        name: goal.name,
        progress: goal.progress,
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
        status: goal.status
      }
    });
  } catch (error) {
    console.error('Error getting goal progress:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching goal progress'
    });
  }
};

// @desc    Get active goals
// @route   GET /api/goals/status/active
// @access  Private
exports.getActiveGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id, status: 'active' }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    console.error('Error getting active goals:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching goals'
    });
  }
};

// @desc    Get completed goals
// @route   GET /api/goals/status/completed
// @access  Private
exports.getCompletedGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id, status: 'completed' }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    console.error('Error getting completed goals:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching goals'
    });
  }
};

// @desc    Get goal stats
// @route   GET /api/goals/stats
// @access  Private
exports.getGoalStats = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id });

    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      totalTarget: goals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalSaved: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      averageProgress: goals.length > 0 ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length : 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting goal stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching goal stats'
    });
  }
};

// @desc    Get recommendations
// @route   GET /api/goals/recommendations/smart
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id });

    const recommendations = {
      activeGoals: goals.filter(g => g.status === 'active').length,
      recommendedNewGoals: 3 - goals.filter(g => g.status === 'active').length,
      totalProgress: goals.length > 0 ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length : 0
    };

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching recommendations'
    });
  }
};
