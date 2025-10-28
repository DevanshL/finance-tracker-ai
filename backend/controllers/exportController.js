const exportService = require('../services/exportService');
const { getDateRange } = require('../utils/dateHelpers');

// @desc    Export transactions to CSV
// @route   GET /api/export/transactions/csv
// @access  Private
exports.exportTransactionsCSV = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const csv = await exportService.exportTransactionsCSV(req.user._id, startDate, endDate);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export budgets to CSV
// @route   GET /api/export/budgets/csv
// @access  Private
exports.exportBudgetsCSV = async (req, res, next) => {
  try {
    const csv = await exportService.exportBudgetsCSV(req.user._id);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=budgets-${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export goals to CSV
// @route   GET /api/export/goals/csv
// @access  Private
exports.exportGoalsCSV = async (req, res, next) => {
  try {
    const csv = await exportService.exportGoalsCSV(req.user._id);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=goals-${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate PDF report
// @route   GET /api/export/report/pdf
// @access  Private
exports.generatePDFReport = async (req, res, next) => {
  try {
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const pdfBuffer = await exportService.generatePDFReport(req.user._id, startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=financial-report-${Date.now()}.pdf`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Export all data as JSON
// @route   GET /api/export/all/json
// @access  Private
exports.exportAllJSON = async (req, res, next) => {
  try {
    const { period = 'year', startDate: customStart, endDate: customEnd } = req.query;
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const data = await exportService.exportAllDataJSON(req.user._id, startDate, endDate);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=finance-data-${Date.now()}.json`);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};