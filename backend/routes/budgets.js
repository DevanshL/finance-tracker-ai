const express = require('express');
const router = express.Router();

// Import controllers
const {
  getBudgets,
  getBudgetById,      // Changed from getBudget
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  getBudgetStatus     
} = require('../controllers/budgetController');

// Import middleware
const { protect } = require('../middleware/auth');
const {
  budgetValidation,
  idValidation,
  paginationValidation
} = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// Special routes (must come before /:id)
router.get('/alerts', getBudgetAlerts);

// Main CRUD routes
router.route('/')
  .get(paginationValidation, getBudgets)
  .post(budgetValidation, createBudget);

router.route('/:id')
  .get(idValidation, getBudgetById)        // Changed from getBudget
  .put(idValidation, updateBudget)
  .delete(idValidation, deleteBudget);

// Status endpoint
router.get('/:id/status', idValidation, getBudgetStatus);

module.exports = router;