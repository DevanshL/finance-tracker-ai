const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');

// @desc    Get all recurring transactions
// @route   GET /api/recurring-transactions
// @access  Private
exports.getRecurringTransactions = async (req, res, next) => {
  try {
    const { isActive, frequency } = req.query;

    const filter = { user: req.user._id };
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (frequency) {
      filter.frequency = frequency;
    }

    const recurringTransactions = await RecurringTransaction.find(filter)
      .populate('category')
      .sort({ nextOccurrence: 1 });

    res.status(200).json({
      success: true,
      count: recurringTransactions.length,
      data: recurringTransactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recurring transaction
// @route   GET /api/recurring-transactions/:id
// @access  Private
exports.getRecurringTransaction = async (req, res, next) => {
  try {
    const recurringTransaction = await RecurringTransaction.findById(req.params.id)
      .populate('category');

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }

    // Check ownership
    if (recurringTransaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this recurring transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: recurringTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create recurring transaction
// @route   POST /api/recurring-transactions
// @access  Private
exports.createRecurringTransaction = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    
    // Set nextOccurrence to startDate if not provided
    if (!req.body.nextOccurrence) {
      req.body.nextOccurrence = req.body.startDate;
    }

    const recurringTransaction = await RecurringTransaction.create(req.body);

    res.status(201).json({
      success: true,
      data: recurringTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recurring transaction
// @route   PUT /api/recurring-transactions/:id
// @access  Private
exports.updateRecurringTransaction = async (req, res, next) => {
  try {
    let recurringTransaction = await RecurringTransaction.findById(req.params.id);

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }

    // Check ownership
    if (recurringTransaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recurring transaction'
      });
    }

    recurringTransaction = await RecurringTransaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category');

    res.status(200).json({
      success: true,
      data: recurringTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recurring transaction
// @route   DELETE /api/recurring-transactions/:id
// @access  Private
exports.deleteRecurringTransaction = async (req, res, next) => {
  try {
    const recurringTransaction = await RecurringTransaction.findById(req.params.id);

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }

    // Check ownership
    if (recurringTransaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recurring transaction'
      });
    }

    await recurringTransaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Recurring transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle recurring transaction active status
// @route   PATCH /api/recurring-transactions/:id/toggle
// @access  Private
exports.toggleRecurringTransaction = async (req, res, next) => {
  try {
    const recurringTransaction = await RecurringTransaction.findById(req.params.id);

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }

    // Check ownership
    if (recurringTransaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this recurring transaction'
      });
    }

    recurringTransaction.isActive = !recurringTransaction.isActive;
    await recurringTransaction.save();

    res.status(200).json({
      success: true,
      data: recurringTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process due recurring transactions
// @route   POST /api/recurring-transactions/process
// @access  Private
exports.processRecurringTransactions = async (req, res, next) => {
  try {
    const recurringTransactions = await RecurringTransaction.find({
      user: req.user._id,
      isActive: true,
      autoProcess: true,
      nextOccurrence: { $lte: new Date() }
    }).populate('category');

    const processedTransactions = [];
    const errors = [];

    for (const recurring of recurringTransactions) {
      try {
        // Check if end date has passed
        if (recurring.endDate && new Date() > recurring.endDate) {
          recurring.isActive = false;
          await recurring.save();
          continue;
        }

        // Create new transaction
        const transaction = await Transaction.create({
          user: recurring.user,
          description: recurring.description,
          amount: recurring.amount,
          type: recurring.type,
          category: recurring.category,
          date: new Date(),
          paymentMethod: recurring.paymentMethod,
          notes: `Auto-generated from recurring transaction: ${recurring.notes || ''}`
        });

        // Update recurring transaction
        recurring.lastProcessed = new Date();
        recurring.nextOccurrence = recurring.calculateNextOccurrence();
        await recurring.save();

        processedTransactions.push(transaction);
      } catch (error) {
        errors.push({
          recurringId: recurring._id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      processed: processedTransactions.length,
      data: processedTransactions,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming recurring transactions
// @route   GET /api/recurring-transactions/upcoming
// @access  Private
exports.getUpcomingRecurring = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const upcoming = await RecurringTransaction.find({
      user: req.user._id,
      isActive: true,
      nextOccurrence: { $lte: futureDate }
    })
      .populate('category')
      .sort({ nextOccurrence: 1 });

    res.status(200).json({
      success: true,
      count: upcoming.length,
      data: upcoming
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Skip next occurrence
// @route   POST /api/recurring-transactions/:id/skip
// @access  Private
exports.skipNextOccurrence = async (req, res, next) => {
  try {
    const recurringTransaction = await RecurringTransaction.findById(req.params.id);

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }

    // Check ownership
    if (recurringTransaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this recurring transaction'
      });
    }

    // Calculate and set next occurrence
    recurringTransaction.nextOccurrence = recurringTransaction.calculateNextOccurrence();
    await recurringTransaction.save();

    res.status(200).json({
      success: true,
      message: 'Next occurrence skipped',
      data: recurringTransaction
    });
  } catch (error) {
    next(error);
  }
};