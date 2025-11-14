// backend/controllers/bulkController.js

const Transaction = require('../models/Transaction');

// @desc    Bulk create transactions
// @route   POST /api/transactions/bulk
// @access  Private
exports.bulkCreate = async (req, res, next) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of transactions'
      });
    }

    // Validate each transaction
    const errors = [];
    transactions.forEach((transaction, index) => {
      if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
        errors.push(`Transaction ${index + 1}: Invalid type`);
      }
      if (!transaction.amount || transaction.amount <= 0) {
        errors.push(`Transaction ${index + 1}: Invalid amount`);
      }
      if (!transaction.category) {
        errors.push(`Transaction ${index + 1}: Category is required`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0], // Return first error
        errors
      });
    }

    // Add userId to each transaction
    const transactionsToCreate = transactions.map((transaction) => ({
      ...transaction,
      userId: req.user._id,
      paymentMethod: transaction.paymentMethod || 'Cash',
      tags: transaction.tags || [],
      isRecurring: transaction.isRecurring || false
    }));

    // Create all transactions
    const createdTransactions = await Transaction.insertMany(transactionsToCreate);

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdTransactions.length} transactions`,
      data: {
        count: createdTransactions.length,
        transactions: createdTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete transactions
// @route   DELETE /api/transactions/bulk
// @access  Private
exports.bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of transaction IDs'
      });
    }

    // Delete transactions belonging to the user
    const result = await Transaction.deleteMany({
      _id: { $in: ids },
      userId: req.user._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No transactions found to delete'
      });
    }

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} transactions`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update transactions
// @route   PUT /api/transactions/bulk
// @access  Private
exports.bulkUpdate = async (req, res, next) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of updates with id and fields to update'
      });
    }

    const updatedTransactions = [];
    const errors = [];

    // Update each transaction
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];

      if (!update.id) {
        errors.push(`Update ${i + 1}: Transaction ID is required`);
        continue;
      }

      try {
        const transaction = await Transaction.findOne({
          _id: update.id,
          userId: req.user._id
        });

        if (!transaction) {
          errors.push(`Update ${i + 1}: Transaction not found`);
          continue;
        }

        // Update allowed fields
        if (update.amount !== undefined) {
          if (update.amount <= 0) {
            errors.push(`Update ${i + 1}: Invalid amount`);
            continue;
          }
          transaction.amount = update.amount;
        }

        if (update.type && ['income', 'expense'].includes(update.type)) {
          transaction.type = update.type;
        }

        if (update.category) {
          transaction.category = update.category;
        }

        if (update.description !== undefined) {
          transaction.description = update.description;
        }

        if (update.date) {
          transaction.date = update.date;
        }

        if (update.paymentMethod) {
          transaction.paymentMethod = update.paymentMethod;
        }

        if (update.tags) {
          transaction.tags = update.tags;
        }

        await transaction.save();
        updatedTransactions.push(transaction);
      } catch (error) {
        errors.push(`Update ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Successfully updated ${updatedTransactions.length} transactions`,
      data: {
        updatedCount: updatedTransactions.length,
        transactions: updatedTransactions,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk categorize transactions
// @route   PUT /api/transactions/bulk/categorize
// @access  Private
exports.bulkCategorize = async (req, res, next) => {
  try {
    const { ids, category } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of transaction IDs'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a category'
      });
    }

    // Update category for all specified transactions
    const result = await Transaction.updateMany(
      {
        _id: { $in: ids },
        userId: req.user._id
      },
      {
        $set: { category }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No transactions found to update'
      });
    }

    res.json({
      success: true,
      message: `Successfully categorized ${result.modifiedCount} transactions`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk export transactions
// @route   POST /api/transactions/bulk/export
// @access  Private
exports.bulkExport = async (req, res, next) => {
  try {
    const { ids, format } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of transaction IDs'
      });
    }

    const transactions = await Transaction.find({
      _id: { $in: ids },
      userId: req.user._id
    }).sort('-date');

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No transactions found'
      });
    }

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Date,Type,Category,Amount,Description,Payment Method\n';
      const csvRows = transactions
        .map((t) =>
          `${t.date.toISOString().split('T')[0]},${t.type},${t.category},${t.amount},"${
            t.description || ''
          }",${t.paymentMethod}`
        )
        .join('\n');

      const csv = csvHeader + csvRows;

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=transactions.csv');
      return res.send(csv);
    }

    // Default: JSON format
    res.json({
      success: true,
      count: transactions.length,
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};