const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['income', 'expense'],
    lowercase: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },
  paymentMethod: {
    type: String,
    trim: true,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Check', 'Other'],
    default: 'Cash'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: function() {
      return this.isRecurring;
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });
transactionSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toFixed(2)}`;
});

// Instance method to check if transaction is this month
transactionSchema.methods.isThisMonth = function() {
  const now = new Date();
  const transactionDate = new Date(this.date);
  return (
    transactionDate.getMonth() === now.getMonth() &&
    transactionDate.getFullYear() === now.getFullYear()
  );
};

// Static method to get user's total income
transactionSchema.statics.getTotalIncome = async function(userId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'income',
        date: {
          $gte: startDate,
          $lte: endDate
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
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get user's total expenses
transactionSchema.statics.getTotalExpenses = async function(userId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: {
          $gte: startDate,
          $lte: endDate
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
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get category breakdown
transactionSchema.statics.getCategoryBreakdown = async function(userId, type, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: type,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        total: 1,
        count: 1
      }
    }
  ]);
};

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
