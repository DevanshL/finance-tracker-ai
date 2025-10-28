const express = require('express');
const router = express.Router();
const {
  getReports,
  getReport,
  generateSpendingReport,
  generateIncomeReport,
  generateBudgetReport,
  generateGoalsReport,
  generateComprehensiveReport,
  deleteReport,
  scheduleReport,
  exportReportPDF
} = require('../controllers/reportsController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Main routes
router.get('/', getReports);

// Generate specific reports
router.post('/spending', generateSpendingReport);
router.post('/income', generateIncomeReport);
router.post('/budget', generateBudgetReport);
router.post('/goals', generateGoalsReport);
router.post('/comprehensive', generateComprehensiveReport);

// Schedule reports
router.post('/schedule', scheduleReport);

// Single report routes
router.route('/:id')
  .get(getReport)
  .delete(deleteReport);

// Export report
router.get('/:id/export/pdf', exportReportPDF);

module.exports = router;