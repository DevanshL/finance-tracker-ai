const express = require('express');
const router = express.Router();
const {
  getRecurringTransactions,
  getRecurringTransaction,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
  processRecurringTransactions,
  getUpcomingRecurring,
  skipNextOccurrence
} = require('../controllers/recurringTransactionsController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Main routes
router.route('/')
  .get(getRecurringTransactions)
  .post(createRecurringTransaction);

// Special routes
router.get('/upcoming', getUpcomingRecurring);
router.post('/process', processRecurringTransactions);

// Single recurring transaction routes
router.route('/:id')
  .get(getRecurringTransaction)
  .put(updateRecurringTransaction)
  .delete(deleteRecurringTransaction);

// Action routes
router.patch('/:id/toggle', toggleRecurringTransaction);
router.post('/:id/skip', skipNextOccurrence);

module.exports = router;