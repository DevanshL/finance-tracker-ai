const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getFinancialSummary,
  getSpendingChart,
  getIncomeVsExpensesTrend,
  getRecentActivity,
  getQuickStats
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Main dashboard route
router.get('/', getDashboard);

// Dashboard components
router.get('/summary', getFinancialSummary);
router.get('/spending-chart', getSpendingChart);
router.get('/trend', getIncomeVsExpensesTrend);
router.get('/activity', getRecentActivity);
router.get('/stats', getQuickStats);

module.exports = router;