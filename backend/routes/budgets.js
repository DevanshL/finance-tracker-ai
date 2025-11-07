const express = require('express');
const router = express.Router();
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Main routes
router.route('/')
  .get(getBudgets)
  .post(createBudget);

// Single budget routes
router.route('/:id')
  .get(getBudget)
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;