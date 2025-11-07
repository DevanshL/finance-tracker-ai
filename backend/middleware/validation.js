const Joi = require('joi');

// ==============================================
// VALIDATION SCHEMAS
// ==============================================

// User Registration
exports.registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    })
});

// User Login
exports.loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim(),
  
  password: Joi.string()
    .required()
});

// Transaction
exports.transactionSchema = Joi.object({
  description: Joi.string()
    .min(1)
    .max(200)
    .required()
    .trim(),
  
  amount: Joi.number()
    .positive()
    .max(1000000000)
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.max': 'Amount is too large'
    }),
  
  type: Joi.string()
    .valid('income', 'expense')
    .required(),
  
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid category ID'
    }),
  
  date: Joi.date()
    .max('now')
    .required()
    .messages({
      'date.max': 'Transaction date cannot be in the future'
    }),
  
  paymentMethod: Joi.string()
    .valid('cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other')
    .optional(),
  
  notes: Joi.string()
    .max(500)
    .optional()
    .trim()
});

// Budget
exports.budgetSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .max(1000000000)
    .required(),
  
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  
  period: Joi.string()
    .valid('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')
    .required(),
  
  startDate: Joi.date()
    .required(),
  
  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({
      'date.greater': 'End date must be after start date'
    }),
  
  alertThreshold: Joi.number()
    .min(50)
    .max(100)
    .optional()
});

// Goal
exports.goalSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim(),
  
  description: Joi.string()
    .max(500)
    .optional()
    .trim(),
  
  targetAmount: Joi.number()
    .positive()
    .max(1000000000)
    .required(),
  
  currentAmount: Joi.number()
    .min(0)
    .max(Joi.ref('targetAmount'))
    .optional()
    .default(0),
  
  targetDate: Joi.date()
    .greater('now')
    .required()
    .messages({
      'date.greater': 'Target date must be in the future'
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .default('medium')
});

// Category
exports.categorySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim(),
  
  type: Joi.string()
    .valid('income', 'expense', 'both')
    .required(),
  
  icon: Joi.string()
    .max(50)
    .optional(),
  
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Color must be a valid hex code (e.g., #FF5733)'
    })
});

// Recurring Transaction
exports.recurringTransactionSchema = Joi.object({
  description: Joi.string()
    .min(1)
    .max(200)
    .required()
    .trim(),
  
  amount: Joi.number()
    .positive()
    .max(1000000000)
    .required(),
  
  type: Joi.string()
    .valid('income', 'expense')
    .required(),
  
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  
  frequency: Joi.string()
    .valid('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')
    .required(),
  
  startDate: Joi.date()
    .required(),
  
  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .optional(),
  
  isActive: Joi.boolean()
    .optional()
    .default(true),
  
  autoProcess: Joi.boolean()
    .optional()
    .default(false)
});

// Report
exports.reportSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim(),
  
  type: Joi.string()
    .valid('spending', 'income', 'budget', 'goal', 'comprehensive')
    .required(),
  
  period: Joi.string()
    .valid('weekly', 'monthly', 'quarterly', 'yearly', 'custom')
    .required(),
  
  startDate: Joi.date()
    .required(),
  
  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .required(),
  
  scheduled: Joi.boolean()
    .optional()
    .default(false),
  
  frequency: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly')
    .when('scheduled', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
});

// Notification
exports.notificationSchema = Joi.object({
  type: Joi.string()
    .valid(
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
    )
    .required(),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .optional()
    .default('medium'),
  
  title: Joi.string()
    .min(1)
    .max(100)
    .required()
    .trim(),
  
  message: Joi.string()
    .min(1)
    .max(500)
    .required()
    .trim()
});

// Settings
exports.settingsSchema = Joi.object({
  display: Joi.object({
    currency: Joi.string()
      .valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'BRL', 'MXN')
      .optional(),
    
    language: Joi.string()
      .valid('en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'hi', 'ar')
      .optional(),
    
    theme: Joi.string()
      .valid('light', 'dark', 'auto')
      .optional()
  }).optional(),
  
  notifications: Joi.object({
    email: Joi.object({
      enabled: Joi.boolean().optional(),
      budgetAlerts: Joi.boolean().optional(),
      goalReminders: Joi.boolean().optional()
    }).optional(),
    
    push: Joi.object({
      enabled: Joi.boolean().optional()
    }).optional()
  }).optional()
});

// ==============================================
// VALIDATION MIDDLEWARE
// ==============================================

exports.validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

// ==============================================
// QUERY PARAMETER VALIDATION
// ==============================================

exports.paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
});

exports.dateRangeSchema = Joi.object({
  startDate: Joi.date()
    .optional(),
  
  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.greater': 'End date must be after start date'
    })
});

exports.sortSchema = Joi.object({
  sortBy: Joi.string()
    .optional()
    .default('createdAt'),
  
  order: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

// Validate query parameters
exports.validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors
      });
    }

    req.query = value;
    next();
  };
};

// ==============================================
// CUSTOM VALIDATORS
// ==============================================

exports.isValidObjectId = (value, helpers) => {
  if (!/^[0-9a-fA-F]{24}$/.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

exports.isStrongPassword = (value, helpers) => {
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecialChar = /[@$!%*?&]/.test(value);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return helpers.error('password.weak');
  }

  return value;
};

// ==============================================
// SANITIZATION HELPERS
// ==============================================

exports.sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/\0/g, ''); // Remove null bytes
  }
  return input;
};

exports.sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = exports.sanitizeInput(obj[key]);
    }
  }
  
  return sanitized;
};