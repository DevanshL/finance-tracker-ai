const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  },
  period: {
    type: String,
    required: [true, 'Budget period is required'],
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: [0, 'Alert threshold cannot be negative'],
    max: [100, 'Alert threshold cannot exceed 100']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes
budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, category: 1 });
budgetSchema.index({ startDate: 1, endDate: 1 });

// Virtual for remaining amount
budgetSchema.virtual('remaining').get(function() {
  return this.amount - this.spent;
});

// Virtual for percentage used
budgetSchema.virtual('percentageUsed').get(function() {
  return this.amount > 0 ? Math.round((this.spent / this.amount) * 100) : 0;
});

// Virtual for status
budgetSchema.virtual('status').get(function() {
  const percentage = this.percentageUsed;
  
  if (percentage >= 100) return 'exceeded';
  if (percentage >= this.alertThreshold) return 'warning';
  return 'on_track';
});

// Virtual for is expired
budgetSchema.virtual('isExpired').get(function() {
  return new Date() > this.endDate;
});

// Ensure virtuals are included in JSON
budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

// Instance method to check if budget is exceeded
budgetSchema.methods.isExceeded = function() {
  return this.spent >= this.amount;
};

// Instance method to check if alert threshold reached
budgetSchema.methods.shouldAlert = function() {
  const percentage = (this.spent / this.amount) * 100;
  return percentage >= this.alertThreshold;
};

// Static method to get user's active budgets
budgetSchema.statics.getActiveBudgets = async function(userId) {
  return await this.find({
    userId,
    isActive: true,
    endDate: { $gte: new Date() }
  }).sort({ startDate: -1 });
};

// Static method to get budget alerts
budgetSchema.statics.getBudgetAlerts = async function(userId) {
  const budgets = await this.find({
    userId,
    isActive: true,
    endDate: { $gte: new Date() }
  });

  return budgets.filter(budget => {
    const percentage = (budget.spent / budget.amount) * 100;
    return percentage >= budget.alertThreshold;
  });
};

// Pre-save validation
budgetSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);