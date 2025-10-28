const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const analyticsService = require('./analyticsService');

/**
 * Export transactions to CSV
 */
exports.exportTransactionsCSV = async (userId, startDate, endDate) => {
  try {
    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('category', 'name')
      .sort({ date: -1 })
      .lean();

    const formattedData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description,
      Category: t.category?.name || 'Uncategorized',
      Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      Amount: t.amount.toFixed(2),
      PaymentMethod: t.paymentMethod || 'N/A',
      Notes: t.notes || ''
    }));

    const fields = ['Date', 'Description', 'Category', 'Type', 'Amount', 'PaymentMethod', 'Notes'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedData);

    return csv;
  } catch (error) {
    throw new Error('Failed to export transactions: ' + error.message);
  }
};

/**
 * Export budgets to CSV
 */
exports.exportBudgetsCSV = async (userId) => {
  try {
    const budgets = await Budget.find({ user: userId })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const formattedData = budgets.map(b => ({
      Category: b.category?.name || 'General',
      Amount: b.amount.toFixed(2),
      Spent: b.spent.toFixed(2),
      Remaining: b.remaining.toFixed(2),
      Period: b.period,
      Status: b.status,
      StartDate: new Date(b.startDate).toLocaleDateString(),
      EndDate: new Date(b.endDate).toLocaleDateString()
    }));

    const fields = ['Category', 'Amount', 'Spent', 'Remaining', 'Period', 'Status', 'StartDate', 'EndDate'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedData);

    return csv;
  } catch (error) {
    throw new Error('Failed to export budgets: ' + error.message);
  }
};

/**
 * Export goals to CSV
 */
exports.exportGoalsCSV = async (userId) => {
  try {
    const goals = await Goal.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const formattedData = goals.map(g => ({
      Name: g.name,
      Description: g.description || '',
      TargetAmount: g.targetAmount.toFixed(2),
      CurrentAmount: g.currentAmount.toFixed(2),
      Progress: g.progress.toFixed(2) + '%',
      Priority: g.priority,
      Status: g.status,
      TargetDate: new Date(g.targetDate).toLocaleDateString(),
      DaysRemaining: Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    const fields = ['Name', 'Description', 'TargetAmount', 'CurrentAmount', 'Progress', 'Priority', 'Status', 'TargetDate', 'DaysRemaining'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedData);

    return csv;
  } catch (error) {
    throw new Error('Failed to export goals: ' + error.message);
  }
};

/**
 * Generate PDF Financial Report
 */
exports.generatePDFReport = async (userId, startDate, endDate) => {
  try {
    const [overview, categories, budgets, goals] = await Promise.all([
      analyticsService.getSpendingOverview(userId, startDate, endDate),
      analyticsService.getCategoryBreakdown(userId, startDate, endDate),
      analyticsService.getBudgetPerformance(userId, startDate, endDate),
      analyticsService.getGoalProgress(userId)
    ]);

    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));

    // Header
    doc.fontSize(24).text('Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Overview Section
    doc.fontSize(18).text('Financial Overview', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Income: $${overview.totalIncome.toFixed(2)}`);
    doc.text(`Total Expenses: $${overview.totalExpenses.toFixed(2)}`);
    doc.text(`Net Savings: $${overview.netSavings.toFixed(2)}`);
    doc.text(`Savings Rate: ${overview.savingsRate}%`);
    doc.text(`Transactions: ${overview.transactionCount}`);
    doc.moveDown(2);

    // Category Breakdown
    doc.fontSize(18).text('Top Spending Categories', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    
    categories.slice(0, 5).forEach((cat, index) => {
      doc.text(`${index + 1}. ${cat.name}: $${cat.total.toFixed(2)} (${cat.percentage}%)`);
    });
    doc.moveDown(2);

    // Budget Performance
    if (budgets.length > 0) {
      doc.fontSize(18).text('Budget Performance', { underline: true });
      doc.moveDown();
      doc.fontSize(12);

      budgets.forEach(budget => {
        doc.text(`${budget.category}:`);
        doc.text(`  Budget: $${budget.budgetAmount.toFixed(2)}`);
        doc.text(`  Spent: $${budget.spent.toFixed(2)}`);
        doc.text(`  Remaining: $${budget.remaining.toFixed(2)}`);
        doc.text(`  Status: ${budget.status}`);
        doc.moveDown();
      });
    }

    // Goal Progress
    if (goals.goals.length > 0) {
      doc.addPage();
      doc.fontSize(18).text('Goal Progress', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total Goals: ${goals.summary.totalGoals}`);
      doc.text(`Active: ${goals.summary.active}`);
      doc.text(`Completed: ${goals.summary.completed}`);
      doc.text(`Overall Progress: ${goals.summary.overallProgress}%`);
      doc.moveDown(2);

      goals.goals.forEach(goal => {
        doc.text(`${goal.name}:`);
        doc.text(`  Target: $${goal.targetAmount.toFixed(2)}`);
        doc.text(`  Current: $${goal.currentAmount.toFixed(2)}`);
        doc.text(`  Progress: ${goal.progress.toFixed(2)}%`);
        doc.text(`  Status: ${goal.status}`);
        doc.moveDown();
      });
    }

    // Footer
    doc.fontSize(10).text('This is an automated report generated by Finance Tracker AI', {
      align: 'center',
      color: 'gray'
    });

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });
  } catch (error) {
    throw new Error('Failed to generate PDF report: ' + error.message);
  }
};

/**
 * Generate JSON export of all data
 */
exports.exportAllDataJSON = async (userId, startDate, endDate) => {
  try {
    const [transactions, budgets, goals, analytics] = await Promise.all([
      Transaction.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate }
      }).populate('category').lean(),
      Budget.find({ user: userId }).populate('category').lean(),
      Goal.find({ user: userId }).lean(),
      analyticsService.getSpendingOverview(userId, startDate, endDate)
    ]);

    return {
      exportDate: new Date(),
      period: {
        startDate,
        endDate
      },
      summary: analytics,
      transactions,
      budgets,
      goals
    };
  } catch (error) {
    throw new Error('Failed to export data: ' + error.message);
  }
};