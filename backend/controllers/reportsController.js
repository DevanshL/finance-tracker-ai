const Report = require('../models/Report');
const analyticsService = require('../services/analyticsService');
const exportService = require('../services/exportService');
const { getDateRange } = require('../utils/dateHelpers');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res, next) => {
  try {
    const { type, period, limit = 20 } = req.query;

    const filter = { user: req.user._id };
    
    if (type) filter.type = type;
    if (period) filter.period = period;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check ownership
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this report'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate spending report
// @route   POST /api/reports/spending
// @access  Private
exports.generateSpendingReport = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd, name } = req.body;

    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const [overview, categories, trends] = await Promise.all([
      analyticsService.getSpendingOverview(req.user._id, startDate, endDate),
      analyticsService.getCategoryBreakdown(req.user._id, startDate, endDate),
      analyticsService.getDailyTrend(req.user._id, startDate, endDate)
    ]);

    const insights = await analyticsService.getFinancialInsights(req.user._id, startDate, endDate);

    const report = await Report.create({
      user: req.user._id,
      name: name || `Spending Report - ${new Date().toLocaleDateString()}`,
      type: 'spending',
      period,
      startDate,
      endDate,
      data: {
        overview,
        categories,
        trends
      },
      summary: {
        totalIncome: overview.totalIncome,
        totalExpenses: overview.totalExpenses,
        netSavings: overview.netSavings,
        savingsRate: overview.savingsRate,
        transactionCount: overview.transactionCount
      },
      insights: insights.map(i => i.message)
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate income report
// @route   POST /api/reports/income
// @access  Private
exports.generateIncomeReport = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd, name } = req.body;

    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const overview = await analyticsService.getSpendingOverview(req.user._id, startDate, endDate);
    const incomeCategories = await analyticsService.getCategoryBreakdown(req.user._id, startDate, endDate, 'income');
    const monthlyIncome = await analyticsService.getMonthlyComparison(req.user._id, 6);

    const report = await Report.create({
      user: req.user._id,
      name: name || `Income Report - ${new Date().toLocaleDateString()}`,
      type: 'income',
      period,
      startDate,
      endDate,
      data: {
        overview,
        incomeCategories,
        monthlyIncome
      },
      summary: {
        totalIncome: overview.totalIncome
      }
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate budget report
// @route   POST /api/reports/budget
// @access  Private
exports.generateBudgetReport = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd, name } = req.body;

    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const budgetPerformance = await analyticsService.getBudgetPerformance(req.user._id, startDate, endDate);

    const report = await Report.create({
      user: req.user._id,
      name: name || `Budget Report - ${new Date().toLocaleDateString()}`,
      type: 'budget',
      period,
      startDate,
      endDate,
      data: {
        budgetPerformance
      }
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate goals report
// @route   POST /api/reports/goals
// @access  Private
exports.generateGoalsReport = async (req, res, next) => {
  try {
    const { name } = req.body;

    const goalProgress = await analyticsService.getGoalProgress(req.user._id);

    const report = await Report.create({
      user: req.user._id,
      name: name || `Goals Report - ${new Date().toLocaleDateString()}`,
      type: 'goals',
      period: 'custom',
      startDate: new Date(),
      endDate: new Date(),
      data: {
        goalProgress
      }
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate comprehensive report
// @route   POST /api/reports/comprehensive
// @access  Private
exports.generateComprehensiveReport = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd, name } = req.body;

    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const [
      overview,
      categories,
      trends,
      monthlyData,
      budgetPerformance,
      goalProgress,
      insights
    ] = await Promise.all([
      analyticsService.getSpendingOverview(req.user._id, startDate, endDate),
      analyticsService.getCategoryBreakdown(req.user._id, startDate, endDate),
      analyticsService.getDailyTrend(req.user._id, startDate, endDate),
      analyticsService.getMonthlyComparison(req.user._id, 6),
      analyticsService.getBudgetPerformance(req.user._id, startDate, endDate),
      analyticsService.getGoalProgress(req.user._id),
      analyticsService.getFinancialInsights(req.user._id, startDate, endDate)
    ]);

    const report = await Report.create({
      user: req.user._id,
      name: name || `Comprehensive Report - ${new Date().toLocaleDateString()}`,
      type: 'comprehensive',
      period,
      startDate,
      endDate,
      data: {
        overview,
        categories,
        trends,
        monthlyData,
        budgetPerformance,
        goalProgress
      },
      summary: {
        totalIncome: overview.totalIncome,
        totalExpenses: overview.totalExpenses,
        netSavings: overview.netSavings,
        savingsRate: overview.savingsRate,
        transactionCount: overview.transactionCount
      },
      insights: insights.map(i => i.message)
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check ownership
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule report
// @route   POST /api/reports/schedule
// @access  Private
exports.scheduleReport = async (req, res, next) => {
  try {
    const { type, frequency, period = 'month', name } = req.body;

    if (!type || !frequency) {
      return res.status(400).json({
        success: false,
        message: 'Type and frequency are required'
      });
    }

    const nextDate = new Date();
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
    }

    const report = await Report.create({
      user: req.user._id,
      name: name || `Scheduled ${type} Report`,
      type,
      period,
      startDate: new Date(),
      endDate: new Date(),
      data: {},
      isScheduled: true,
      scheduleFrequency: frequency,
      nextScheduledDate: nextDate,
      status: 'generating'
    });

    res.status(201).json({
      success: true,
      message: 'Report scheduled successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export report as PDF
// @route   GET /api/reports/:id/export/pdf
// @access  Private
exports.exportReportPDF = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check ownership
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this report'
      });
    }

    const pdfBuffer = await exportService.generatePDFReport(
      req.user._id,
      report.startDate,
      report.endDate
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report._id}.pdf`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};