const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Report name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['spending', 'income', 'budget', 'goals', 'comprehensive', 'custom'],
      required: true
    },
    period: {
      type: String,
      enum: ['week', 'month', 'quarter', 'year', 'custom'],
      default: 'month'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    summary: {
      totalIncome: Number,
      totalExpenses: Number,
      netSavings: Number,
      savingsRate: Number,
      transactionCount: Number
    },
    charts: [{
      type: String,
      data: mongoose.Schema.Types.Mixed
    }],
    insights: [String],
    format: {
      type: String,
      enum: ['json', 'pdf', 'csv', 'excel'],
      default: 'json'
    },
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'completed'
    },
    fileUrl: String,
    isScheduled: {
      type: Boolean,
      default: false
    },
    scheduleFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly']
    },
    nextScheduledDate: Date,
    tags: [String]
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
reportSchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ user: 1, type: 1 });
reportSchema.index({ user: 1, isScheduled: 1 });

module.exports = mongoose.model('Report', reportSchema);