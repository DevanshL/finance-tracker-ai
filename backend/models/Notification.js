const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'budget_alert',
        'budget_exceeded',
        'goal_achieved',
        'goal_reminder',
        'recurring_processed',
        'recurring_failed',
        'report_generated',
        'unusual_spending',
        'low_balance',
        'bill_reminder',
        'system'
      ],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    actionUrl: {
      type: String
    },
    actionText: {
      type: String
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['transaction', 'budget', 'goal', 'recurring', 'report']
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId
      }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);