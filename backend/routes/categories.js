const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import controllers
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Import middleware
const { protect } = require('../middleware/auth');
const { validate, idValidation } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// Category validation
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 50 }).withMessage('Name must not exceed 50 characters'),
  
  body('type')
    .notEmpty().withMessage('Category type is required')
    .isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  
  body('icon')
    .optional()
    .trim(),
  
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code'),
  
  validate
];

// Routes
router.route('/')
  .get(getCategories)
  .post(categoryValidation, createCategory);

router.route('/:id')
  .get(idValidation, getCategory)
  .put(idValidation, updateCategory)
  .delete(idValidation, deleteCategory);

module.exports = router;