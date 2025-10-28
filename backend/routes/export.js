const express = require('express');
const router = express.Router();
const {
  exportTransactionsCSV,
  exportBudgetsCSV,
  exportGoalsCSV,
  generatePDFReport,
  exportAllJSON
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Export routes
router.get('/transactions/csv', exportTransactionsCSV);
router.get('/budgets/csv', exportBudgetsCSV);
router.get('/goals/csv', exportGoalsCSV);
router.get('/report/pdf', generatePDFReport);
router.get('/all/json', exportAllJSON);

module.exports = router;