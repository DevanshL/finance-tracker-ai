const express = require('express');
const router = express.Router();
const {
  getRecurringTransactions,
  createRecurringTransaction,
  processRecurringTransactions,
  deleteRecurringTransaction
} = require('../controllers/recurringController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getRecurringTransactions)
  .post(createRecurringTransaction);

router.post('/process', processRecurringTransactions);

router.delete('/:id', deleteRecurringTransaction);

module.exports = router;
