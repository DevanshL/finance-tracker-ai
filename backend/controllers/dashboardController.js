const dashboardService = require('../services/dashboardService');

// @desc    Get complete dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    const dashboardData = await dashboardService.getDashboardData(req.user._id, period);

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial summary card
// @route   GET /api/dashboard/summary
// @access  Private
exports.getFinancialSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getFinancialSummaryCard(req.user._id);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get spending chart data
// @route   GET /api/dashboard/spending-chart
// @access  Private
exports.getSpendingChart = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    const chartData = await dashboardService.getSpendingChartData(req.user._id, period);

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get income vs expenses trend
// @route   GET /api/dashboard/trend
// @access  Private
exports.getIncomeVsExpensesTrend = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;

    const trendData = await dashboardService.getIncomeVsExpensesTrend(req.user._id, parseInt(months));

    res.status(200).json({
      success: true,
      data: trendData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
exports.getRecentActivity = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const recentTransactions = await dashboardService.getRecentTransactions(req.user._id, parseInt(limit));

    res.status(200).json({
      success: true,
      count: recentTransactions.length,
      data: recentTransactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quick stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getQuickStats = async (req, res, next) => {
  try {
    const [budgetSummary, goalSummary, upcomingRecurring] = await Promise.all([
      dashboardService.getBudgetSummary(req.user._id),
      dashboardService.getGoalSummary(req.user._id),
      dashboardService.getUpcomingRecurring(req.user._id, 7)
    ]);

    res.status(200).json({
      success: true,
      data: {
        budgets: budgetSummary,
        goals: goalSummary,
        upcomingRecurring: {
          count: upcomingRecurring.length,
          items: upcomingRecurring
        }
      }
    });
  } catch (error) {
    next(error);
  }
};