const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getOverview,
  getCategoryAnalysis,
  getTrends,
  getMonthlyAnalysis,
  getBudgetPerformance,
  getGoalProgress,
  getInsights,
  getComparison,
  getTopCategories,
  getComprehensiveReport
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Analytics routes
router.get('/dashboard', getDashboard);
router.get('/overview', getOverview);
router.get('/categories', getCategoryAnalysis);
router.get('/trends', getTrends);
router.get('/monthly', getMonthlyAnalysis);
router.get('/budget-performance', getBudgetPerformance);
router.get('/goal-progress', getGoalProgress);
router.get('/insights', getInsights);
router.get('/comparison', getComparison);
router.get('/top-categories', getTopCategories);
router.get('/report', getComprehensiveReport);

module.exports = router;