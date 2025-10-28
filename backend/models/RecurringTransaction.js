const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive']
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    nextOccurrence: {
      type: Date,
      required: true
    },
    lastProcessed: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    autoProcess: {
      type: Boolean,
      default: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'other']
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
recurringTransactionSchema.index({ user: 1, nextOccurrence: 1 });
recurringTransactionSchema.index({ user: 1, isActive: 1 });

// Calculate next occurrence date
recurringTransactionSchema.methods.calculateNextOccurrence = function() {
  const current = this.nextOccurrence;
  let next = new Date(current);

  switch (this.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
};

// Check if should be processed
recurringTransactionSchema.methods.shouldProcess = function() {
  if (!this.isActive || !this.autoProcess) return false;
  
  const now = new Date();
  
  // Check if next occurrence has passed
  if (this.nextOccurrence > now) return false;
  
  // Check if end date has passed
  if (this.endDate && this.endDate < now) {
    this.isActive = false;
    return false;
  }
  
  return true;
};

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);