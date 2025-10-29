const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    // Display preferences
    display: {
      currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'BRL', 'MXN']
      },
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'hi', 'ar']
      },
      timezone: {
        type: String,
        default: 'UTC'
      },
      dateFormat: {
        type: String,
        default: 'MM/DD/YYYY',
        enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
      },
      numberFormat: {
        type: String,
        default: '1,234.56',
        enum: ['1,234.56', '1.234,56', '1 234.56']
      },
      theme: {
        type: String,
        default: 'light',
        enum: ['light', 'dark', 'auto']
      }
    },
    // Notification preferences
    notifications: {
      email: {
        enabled: { type: Boolean, default: true },
        budgetAlerts: { type: Boolean, default: true },
        goalReminders: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: false },
        monthlyReports: { type: Boolean, default: true },
        unusualSpending: { type: Boolean, default: true },
        recurringReminders: { type: Boolean, default: true }
      },
      push: {
        enabled: { type: Boolean, default: true },
        budgetAlerts: { type: Boolean, default: true },
        goalReminders: { type: Boolean, default: true },
        transactionConfirmations: { type: Boolean, default: false },
        dailySummary: { type: Boolean, default: false }
      },
      inApp: {
        enabled: { type: Boolean, default: true },
        sound: { type: Boolean, default: true }
      }
    },
    // Privacy & Security
    privacy: {
      profileVisibility: {
        type: String,
        default: 'private',
        enum: ['public', 'private']
      },
      dataSharing: {
        analytics: { type: Boolean, default: true },
        improvements: { type: Boolean, default: true },
        thirdParty: { type: Boolean, default: false }
      },
      twoFactorAuth: {
        enabled: { type: Boolean, default: false },
        method: {
          type: String,
          enum: ['sms', 'email', 'authenticator']
        }
      }
    },
    // Budget preferences
    budgets: {
      defaultPeriod: {
        type: String,
        default: 'monthly',
        enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']
      },
      alertThreshold: {
        type: Number,
        default: 90,
        min: 50,
        max: 100
      },
      rolloverUnspent: {
        type: Boolean,
        default: false
      },
      autoCreateCategories: {
        type: Boolean,
        default: true
      }
    },
    // Goal preferences
    goals: {
      defaultPriority: {
        type: String,
        default: 'medium',
        enum: ['low', 'medium', 'high']
      },
      reminderFrequency: {
        type: String,
        default: 'weekly',
        enum: ['daily', 'weekly', 'monthly', 'never']
      },
      celebrateAchievements: {
        type: Boolean,
        default: true
      }
    },
    // Transaction preferences
    transactions: {
      defaultView: {
        type: String,
        default: 'list',
        enum: ['list', 'grid', 'calendar']
      },
      defaultSort: {
        type: String,
        default: 'date_desc',
        enum: ['date_desc', 'date_asc', 'amount_desc', 'amount_asc']
      },
      showPending: {
        type: Boolean,
        default: true
      },
      quickAddEnabled: {
        type: Boolean,
        default: true
      }
    },
    // AI preferences
    ai: {
      enabled: {
        type: Boolean,
        default: true
      },
      autoAnalysis: {
        type: Boolean,
        default: true
      },
      suggestionFrequency: {
        type: String,
        default: 'weekly',
        enum: ['daily', 'weekly', 'monthly', 'never']
      },
      personalizedRecommendations: {
        type: Boolean,
        default: true
      }
    },
    // Export preferences
    export: {
      defaultFormat: {
        type: String,
        default: 'csv',
        enum: ['csv', 'pdf', 'json', 'excel']
      },
      includeCharts: {
        type: Boolean,
        default: true
      },
      includeNotes: {
        type: Boolean,
        default: true
      }
    },
    // Backup preferences
    backup: {
      autoBackup: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        default: 'weekly',
        enum: ['daily', 'weekly', 'monthly']
      },
      retentionDays: {
        type: Number,
        default: 30
      }
    }
  },
  {
    timestamps: true
  }
);

// Index
settingsSchema.index({ user: 1 });

module.exports = mongoose.model('Settings', settingsSchema);