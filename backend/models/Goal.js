const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  achieved: {
    type: Boolean,
    default: false
  },
  achievedDate: {
    type: Date
  }
}, { _id: true });

const contributionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0.01, 'Target amount must be greater than 0']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  milestones: [milestoneSchema],
  contributions: [contributionSchema]
}, {
  timestamps: true
});

// Indexes
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, targetDate: 1 });
goalSchema.index({ userId: 1, priority: 1 });

// Virtual for remaining amount
goalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  return this.targetAmount > 0
    ? Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100))
    : 0;
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diff = this.targetDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Virtual for monthly savings needed
goalSchema.virtual('monthlySavingsNeeded').get(function() {
  const monthsRemaining = this.daysRemaining / 30;
  if (monthsRemaining <= 0) return this.remainingAmount;
  return Math.ceil(this.remainingAmount / monthsRemaining);
});

// Virtual for is achieved
goalSchema.virtual('isAchieved').get(function() {
  return this.currentAmount >= this.targetAmount;
});

// Virtual for is overdue
goalSchema.virtual('isOverdue').get(function() {
  return new Date() > this.targetDate && !this.isAchieved;
});

// Ensure virtuals are included in JSON
goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

// Instance method to add contribution
goalSchema.methods.addContribution = async function(amount, note) {
  this.contributions.push({
    amount,
    note,
    date: new Date()
  });

  this.currentAmount += amount;

  // Check if goal is achieved
  if (this.currentAmount >= this.targetAmount) {
    this.status = 'completed';
  }

  // Check milestones
  this.milestones.forEach(milestone => {
    if (!milestone.achieved && this.currentAmount >= milestone.amount) {
      milestone.achieved = true;
      milestone.achievedDate = new Date();
    }
  });

  await this.save();
  return this;
};

// Static method to get user's active goals
goalSchema.statics.getActiveGoals = async function(userId) {
  return await this.find({
    userId,
    status: 'active'
  }).sort({ priority: -1, targetDate: 1 });
};

// Static method to get goals summary
goalSchema.statics.getGoalsSummary = async function(userId) {
  const goals = await this.find({ userId });

  const summary = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    totalTargetAmount: goals.reduce((sum, g) => sum + g.targetAmount, 0),
    totalCurrentAmount: goals.reduce((sum, g) => sum + g.currentAmount, 0),
    totalContributions: goals.reduce((sum, g) => sum + g.contributions.length, 0)
  };

  summary.overallProgress = summary.totalTargetAmount > 0
    ? Math.round((summary.totalCurrentAmount / summary.totalTargetAmount) * 100)
    : 0;

  return summary;
};

// Pre-save validation
goalSchema.pre('save', function(next) {
  if (this.targetDate <= new Date() && this.isNew) {
    next(new Error('Target date must be in the future'));
  }
  next();
});

module.exports = mongoose.models.Goal || mongoose.model('Goal', goalSchema);
