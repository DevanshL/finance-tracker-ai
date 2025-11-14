// Recurring transactions controller
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// @desc    Get all recurring transactions
// @route   GET /api/recurring
// @access  Private
exports.getRecurringTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
      isRecurring: true
    }).sort('-createdAt');

    res.json({
      success: true,
      count: transactions.length,
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create recurring transaction
// @route   POST /api/recurring
// @access  Private
exports.createRecurringTransaction = async (req, res, next) => {
  try {
    const transactionData = {
      ...req.body,
      userId: req.user._id,
      isRecurring: true
    };

    if (!transactionData.recurringFrequency) {
      return res.status(400).json({
        success: false,
        message: 'Recurring frequency is required'
      });
    }

    const transaction = await Transaction.create(transactionData);

    res.status(201).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process recurring transactions (called by cron job)
// @route   POST /api/recurring/process
// @access  Private (admin/system only)
exports.processRecurringTransactions = async (req, res, next) => {
  try {
    const recurringTransactions = await Transaction.find({
      isRecurring: true
    });

    const created = [];
    const today = new Date();

    for (const template of recurringTransactions) {
      const shouldCreate = this.shouldCreateRecurring(template, today);
      
      if (shouldCreate) {
        const newTransaction = await Transaction.create({
          userId: template.userId,
          type: template.type,
          amount: template.amount,
          category: template.category,
          description: template.description + ' (Recurring)',
          date: today,
          paymentMethod: template.paymentMethod,
          tags: template.tags,
          isRecurring: false // The actual transaction is not recurring
        });
        
        created.push(newTransaction);
      }
    }

    logger.success(`Processed ${created.length} recurring transactions`);

    res.json({
      success: true,
      message: `Created ${created.length} recurring transactions`,
      data: { created }
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Check if recurring transaction should be created
exports.shouldCreateRecurring = (template, today) => {
  const lastCreated = template.lastRecurringDate || template.createdAt;
  const daysSince = Math.floor((today - lastCreated) / (1000 * 60 * 60 * 24));

  switch (template.recurringFrequency) {
    case 'daily':
      return daysSince >= 1;
    case 'weekly':
      return daysSince >= 7;
    case 'monthly':
      return daysSince >= 30;
    case 'yearly':
      return daysSince >= 365;
    default:
      return false;
  }
};

// @desc    Delete recurring transaction
// @route   DELETE /api/recurring/:id
// @access  Private
exports.deleteRecurringTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isRecurring: true
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: 'Recurring transaction deleted'
    });
  } catch (error) {
    next(error);
  }
};
