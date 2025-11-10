const express = require('express');
const router = express.Router();
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetByCategory,
  getAnalytics,
  getMonthlyAnalytics,
  getBudgetAlerts
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

// Budget by category
router.get('/category/:category', getBudgetByCategory);

// Budget analytics
router.get('/analytics/monthly', getMonthlyAnalytics);
router.get('/analytics/:period', getAnalytics);

// Budget alerts
router.get('/alerts/all', getBudgetAlerts);

module.exports = router;
