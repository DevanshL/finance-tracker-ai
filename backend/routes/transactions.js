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
  getRecentTransactions,
  exportTransactions,
  // importTransactions  // Comment this out
} = require('../controllers/transactionController');

// Fix the import names to match the actual exports
const {
  bulkCreate,        // Changed from createBulkTransactions
  bulkDelete,        // Changed from deleteBulkTransactions
  bulkUpdate         // Changed from updateBulkTransactions
} = require('../controllers/bulkController');

// Import middleware
const { protect } = require('../middleware/auth');
const {
  transactionValidation,
  idValidation,
  paginationValidation
} = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// IMPORTANT: Specific routes MUST come before /:id routes!

// Summary and special routes
router.get('/summary', getTransactionSummary);
router.get('/recent', getRecentTransactions);
router.get('/export', exportTransactions);
// router.post('/import', importTransactions);  // Comment this out

// Bulk operations - MUST be before /:id
router.post('/bulk', bulkCreate);        // Changed from createBulkTransactions
router.put('/bulk', bulkUpdate);         // Changed from updateBulkTransactions
router.delete('/bulk', bulkDelete);      // Changed from deleteBulkTransactions

// Main CRUD routes (/:id must be last!)
router.route('/')
  .get(paginationValidation, getTransactions)
  .post(transactionValidation, createTransaction);

router.route('/:id')
  .get(idValidation, getTransaction)
  .put(idValidation, updateTransaction)
  .delete(idValidation, deleteTransaction);

module.exports = router;