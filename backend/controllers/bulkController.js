const Transaction = require('../models/Transaction');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constants');

/**
 * @desc    Create multiple transactions at once
 * @route   POST /api/transactions/bulk
 * @access  Private
 */
const createBulkTransactions = asyncHandler(async (req, res) => {
  const { transactions } = req.body;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new AppError('Please provide an array of transactions', HTTP_STATUS.BAD_REQUEST);
  }

  if (transactions.length > 100) {
    throw new AppError('Cannot create more than 100 transactions at once', HTTP_STATUS.BAD_REQUEST);
  }

  // Add userId to all transactions
  const transactionsWithUser = transactions.map(t => ({
    ...t,
    userId: req.user._id,
    date: t.date || Date.now()
  }));

  // Validate all transactions
  for (let i = 0; i < transactionsWithUser.length; i++) {
    const t = transactionsWithUser[i];
    if (!t.type || !['income', 'expense'].includes(t.type)) {
      throw new AppError(`Transaction ${i + 1}: Invalid type`, HTTP_STATUS.BAD_REQUEST);
    }
    if (!t.amount || t.amount <= 0) {
      throw new AppError(`Transaction ${i + 1}: Invalid amount`, HTTP_STATUS.BAD_REQUEST);
    }
    if (!t.category) {
      throw new AppError(`Transaction ${i + 1}: Category required`, HTTP_STATUS.BAD_REQUEST);
    }
  }

  // Insert all transactions
  const created = await Transaction.insertMany(transactionsWithUser);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: `Successfully created ${created.length} transactions`,
    data: { 
      count: created.length,
      transactions: created 
    }
  });
});

/**
 * @desc    Delete multiple transactions
 * @route   DELETE /api/transactions/bulk
 * @access  Private
 */
const deleteBulkTransactions = asyncHandler(async (req, res) => {
  const { transactionIds } = req.body;

  if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
    throw new AppError('Please provide an array of transaction IDs', HTTP_STATUS.BAD_REQUEST);
  }

  // Delete only user's transactions
  const result = await Transaction.deleteMany({
    _id: { $in: transactionIds },
    userId: req.user._id
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Successfully deleted ${result.deletedCount} transactions`,
    data: {
      deletedCount: result.deletedCount
    }
  });
});

/**
 * @desc    Update multiple transactions
 * @route   PUT /api/transactions/bulk
 * @access  Private
 */
const updateBulkTransactions = asyncHandler(async (req, res) => {
  const { transactionIds, updates } = req.body;

  if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
    throw new AppError('Please provide an array of transaction IDs', HTTP_STATUS.BAD_REQUEST);
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw new AppError('Please provide updates', HTTP_STATUS.BAD_REQUEST);
  }

  // Update only allowed fields
  const allowedUpdates = ['category', 'description', 'paymentMethod', 'tags', 'notes'];
  const updateFields = {};

  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updateFields[key] = updates[key];
    }
  });

  if (Object.keys(updateFields).length === 0) {
    throw new AppError('No valid fields to update', HTTP_STATUS.BAD_REQUEST);
  }

  // Update only user's transactions
  const result = await Transaction.updateMany(
    {
      _id: { $in: transactionIds },
      userId: req.user._id
    },
    { $set: updateFields }
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Successfully updated ${result.modifiedCount} transactions`,
    data: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    }
  });
});

module.exports = {
  createBulkTransactions,
  deleteBulkTransactions,
  updateBulkTransactions
};