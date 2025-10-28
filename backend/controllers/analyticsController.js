const analyticsService = require('../services/analyticsService');
const { getDateRange, getDateLabel } = require('../utils/dateHelpers');

// @desc    Get dashboard overview
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const [
      overview,
      categoryBreakdown,
      dailyTrend,
      budgetPerformance,
      goalProgress,
      insights
    ] = await Promise.all([
      analyticsService.getSpendingOverview(req.user._id, startDate, endDate),
      analyticsService.getCategoryBreakdown(req.user._id, startDate, endDate),
      analyticsService.getDailyTrend(req.user._id, startDate, endDate),
      analyticsService.getBudgetPerformance(req.user._id, startDate, endDate),
      analyticsService.getGoalProgress(req.user._id),
      analyticsService.getFinancialInsights(req.user._id, startDate, endDate)
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: getDateLabel(period),
        dateRange: { startDate, endDate },
        overview,
        categoryBreakdown,
        dailyTrend,
        budgetPerformance,
        goalProgress,
        insights
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get spending overview
// @route   GET /api/analytics/overview
// @access  Private
exports.getOverview = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const overview = await analyticsService.getSpendingOverview(
      req.user._id,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: {
        period: getDateLabel(period),
        dateRange: { startDate, endDate },
        ...overview
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category breakdown
// @route   GET /api/analytics/categories
// @access  Private
exports.getCategoryAnalysis = async (req, res, next) => {
  try {
    const { 
      period = 'month', 
      type = 'expense',
      startDate: customStart, 
      endDate: customEnd 
    } = req.query;
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const breakdown = await analyticsService.getCategoryBreakdown(
      req.user._id,
      startDate,
      endDate,
      type
    );

    res.status(200).json({
      success: true,
      data: {
        period: getDateLabel(period),
        type,
        categories: breakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get spending trends
// @route   GET /api/analytics/trends
// @access  Private
exports.getTrends = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const dailyTrend = await analyticsService.getDailyTrend(
      req.user._id,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: {
        period: getDateLabel(period),
        trend: dailyTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly comparison
// @route   GET /api/analytics/monthly
// @access  Private
exports.getMonthlyAnalysis = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;

    const monthlyData = await analyticsService.getMonthlyComparison(
      req.user._id,
      parseInt(months)
    );

    res.status(200).json({
      success: true,
      data: {
        months: monthlyData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget performance
// @route   GET /api/analytics/budget-performance
// @access  Private
exports.getBudgetPerformance = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const performance = await analyticsService.getBudgetPerformance(
      req.user._id,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: {
        budgets: performance
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get goal progress
// @route   GET /api/analytics/goal-progress
// @access  Private
exports.getGoalProgress = async (req, res, next) => {
  try {
    const goalData = await analyticsService.getGoalProgress(req.user._id);

    res.status(200).json({
      success: true,
      data: goalData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial insights
// @route   GET /api/analytics/insights
// @access  Private
exports.getInsights = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const insights = await analyticsService.getFinancialInsights(
      req.user._id,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: {
        insights
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get period comparison
// @route   GET /api/analytics/comparison
// @access  Private
exports.getComparison = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const comparison = await analyticsService.getPeriodComparison(
      req.user._id,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top spending categories
// @route   GET /api/analytics/top-categories
// @access  Private
exports.getTopCategories = async (req, res, next) => {
  try {
    const { 
      period = 'month', 
      limit = 5,
      startDate: customStart, 
      endDate: customEnd 
    } = req.query;
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const topCategories = await analyticsService.getTopCategories(
      req.user._id,
      startDate,
      endDate,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: {
        categories: topCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive report
// @route   GET /api/analytics/report
// @access  Private
exports.getComprehensiveReport = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const [
      overview,
      comparison,
      categoryBreakdown,
      dailyTrend,
      monthlyData,
      budgetPerformance,
      goalProgress,
      insights,
      topCategories
    ] = await Promise.all([
      analyticsService.getSpendingOverview(req.user._id, startDate, endDate),
      analyticsService.getPeriodComparison(req.user._id, startDate, endDate),
      analyticsService.getCategoryBreakdown(req.user._id, startDate, endDate),
      analyticsService.getDailyTrend(req.user._id, startDate, endDate),
      analyticsService.getMonthlyComparison(req.user._id, 6),
      analyticsService.getBudgetPerformance(req.user._id, startDate, endDate),
      analyticsService.getGoalProgress(req.user._id),
      analyticsService.getFinancialInsights(req.user._id, startDate, endDate),
      analyticsService.getTopCategories(req.user._id, startDate, endDate, 10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: getDateLabel(period),
        dateRange: { startDate, endDate },
        generatedAt: new Date(),
        overview,
        comparison,
        categoryBreakdown,
        dailyTrend,
        monthlyData,
        budgetPerformance,
        goalProgress,
        insights,
        topCategories
      }
    });
  } catch (error) {
    next(error);
  }
};