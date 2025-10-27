const express = require('express');
const router = express.Router();

// Import controllers
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getRecentTransactions
} = require('../controllers/transactionController');

// Import middleware
const { protect } = require('../middleware/auth');
const {
  transactionValidation,
  idValidation,
  paginationValidation
} = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// Summary and recent routes (must come before /:id)
router.get('/summary', getTransactionSummary);
router.get('/recent', getRecentTransactions);

// Main CRUD routes
router.route('/')
  .get(paginationValidation, getTransactions)
  .post(transactionValidation, createTransaction);

router.route('/:id')
  .get(idValidation, getTransaction)
  .put(idValidation, updateTransaction)
  .delete(idValidation, deleteTransaction);

module.exports = router;