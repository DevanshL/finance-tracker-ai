const { body, param, query, validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../config/constants');

// Validate Request
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// Auth Validation Rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

// Transaction Validation Rules
const transactionValidation = [
  body('type')
    .notEmpty().withMessage('Transaction type is required')
    .isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  
  body('paymentMethod')
    .optional()
    .trim(),
  
  validate
];

// Budget Validation Rules
const budgetValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Budget name is required')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  
  body('period')
    .notEmpty().withMessage('Period is required')
    .isIn(['weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
  
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format'),
  
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('alertThreshold')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Alert threshold must be between 0 and 100'),
  
  validate
];

// Goal Validation Rules
const goalValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Goal name is required')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
  
  body('targetAmount')
    .notEmpty().withMessage('Target amount is required')
    .isFloat({ min: 0.01 }).withMessage('Target amount must be greater than 0'),
  
  body('currentAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Current amount must be 0 or greater'),
  
  body('targetDate')
    .notEmpty().withMessage('Target date is required')
    .isISO8601().withMessage('Invalid target date format')
    .custom((targetDate) => {
      if (new Date(targetDate) <= new Date()) {
        throw new Error('Target date must be in the future');
      }
      return true;
    }),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  validate
];

// ID Param Validation
const idValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  
  validate
];

// Query Validation for Pagination
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  transactionValidation,
  budgetValidation,
  goalValidation,
  idValidation,
  paginationValidation
};