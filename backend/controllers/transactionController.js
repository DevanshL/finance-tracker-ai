const Transaction = require('../models/Transaction');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constants');
const { getPagination, getPaginationInfo, getDateRange } = require('../utils/helpers');
const { transactionsToCSV, csvToTransactions } = require('../utils/csvHandler');

/**
 * @desc    Get all transactions for logged in user
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    category,
    startDate,
    endDate,
    search,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { userId: req.user._id };

  // Filter by type
  if (type && ['income', 'expense'].includes(type)) {
    query.type = type;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by date range
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // Search in description
  if (search) {
    query.description = { $regex: search, $options: 'i' };
  }

  // Pagination
  const { skip, limit: limitNum } = getPagination(page, limit);

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const transactions = await Transaction.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Transaction.countDocuments(query);

  // Pagination info
  const pagination = getPaginationInfo(total, parseInt(page), limitNum);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: transactions.length,
    pagination,
    data: { transactions }
  });
});

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!transaction) {
    throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { transaction }
  });
});

/**
 * @desc    Create new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, category, description, date, paymentMethod, tags, notes } = req.body;

  const transaction = await Transaction.create({
    userId: req.user._id,
    type,
    amount,
    category,
    description,
    date: date || Date.now(),
    paymentMethod,
    tags,
    notes
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.CREATED,
    data: { transaction }
  });
});

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = asyncHandler(async (req, res) => {
  let transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!transaction) {
    throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND);
  }

  // Update fields
  const { type, amount, category, description, date, paymentMethod, tags, notes } = req.body;

  if (type) transaction.type = type;
  if (amount) transaction.amount = amount;
  if (category) transaction.category = category;
  if (description !== undefined) transaction.description = description;
  if (date) transaction.date = date;
  if (paymentMethod) transaction.paymentMethod = paymentMethod;
  if (tags) transaction.tags = tags;
  if (notes !== undefined) transaction.notes = notes;

  await transaction.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.UPDATED,
    data: { transaction }
  });
});

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!transaction) {
    throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND);
  }

  await transaction.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.DELETED,
    data: null
  });
});

/**
 * @desc    Get transaction summary
 * @route   GET /api/transactions/summary
 * @access  Private
 */
const getTransactionSummary = asyncHandler(async (req, res) => {
  const { period = 'month', startDate, endDate } = req.query;

  let dateRange;
  if (startDate && endDate) {
    dateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };
  } else {
    dateRange = getDateRange(period);
  }

  // Get total income
  const totalIncome = await Transaction.getTotalIncome(
    req.user._id,
    dateRange.startDate,
    dateRange.endDate
  );

  // Get total expenses
  const totalExpenses = await Transaction.getTotalExpenses(
    req.user._id,
    dateRange.startDate,
    dateRange.endDate
  );

  // Calculate balance and savings rate
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(2) : 0;

  // Get transaction count
  const transactionCount = await Transaction.countDocuments({
    userId: req.user._id,
    date: {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate
    }
  });

  // Get category breakdown
  const expensesByCategory = await Transaction.getCategoryBreakdown(
    req.user._id,
    'expense',
    dateRange.startDate,
    dateRange.endDate
  );

  const incomeByCategory = await Transaction.getCategoryBreakdown(
    req.user._id,
    'income',
    dateRange.startDate,
    dateRange.endDate
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      summary: {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate: parseFloat(savingsRate),
        transactionCount,
        period,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      },
      breakdown: {
        expensesByCategory,
        incomeByCategory
      }
    }
  });
});

/**
 * @desc    Get recent transactions
 * @route   GET /api/transactions/recent
 * @access  Private
 */
const getRecentTransactions = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const transactions = await Transaction.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: transactions.length,
    data: { transactions }
  });
});

/**
 * @desc    Export transactions to CSV
 * @route   GET /api/transactions/export
 * @access  Private
 */
const exportTransactions = asyncHandler(async (req, res) => {
  const { startDate, endDate, type } = req.query;

  const query = { userId: req.user._id };

  if (type) query.type = type;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(query).sort({ date: -1 });

  if (transactions.length === 0) {
    throw new AppError('No transactions found to export', HTTP_STATUS.NOT_FOUND);
  }

  const csv = transactionsToCSV(transactions);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
  res.status(HTTP_STATUS.OK).send(csv);
});

/**
 * @desc    Import transactions from CSV
 * @route   POST /api/transactions/import
 * @access  Private
 */
const importTransactions = asyncHandler(async (req, res) => {
  const { csvData } = req.body;

  if (!csvData) {
    throw new AppError('CSV data is required', HTTP_STATUS.BAD_REQUEST);
  }

  // Parse CSV
  const transactions = csvToTransactions(csvData);

  // Add userId to all transactions
  const transactionsWithUser = transactions.map(t => ({
    ...t,
    userId: req.user._id
  }));

  // Insert transactions
  const created = await Transaction.insertMany(transactionsWithUser);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: `Successfully imported ${created.length} transactions`,
    data: {
      count: created.length,
      transactions: created
    }
  });
});

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getRecentTransactions,
  exportTransactions,
  importTransactions
};