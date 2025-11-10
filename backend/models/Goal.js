const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: [100, 'Goal name cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
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
  // Accept both deadline and targetDate
  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },
  deadline: {
    type: Date
  },
  category: {
    type: String,
    default: 'Other',
    enum: ['Savings', 'Education', 'Travel', 'Health', 'Home', 'Other']
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high']
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'completed', 'cancelled']
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Set deadline to targetDate if not provided
goalSchema.pre('save', function(next) {
  if (this.targetDate && !this.deadline) {
    this.deadline = this.targetDate;
  }
  next();
});

module.exports = mongoose.model('Goal', goalSchema);
