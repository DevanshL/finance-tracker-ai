// backend/routes/ai.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getFinancialInsights,
  getSpendingPrediction,
  getCategorySuggestions,
  getBudgetRecommendations,
  getAnomalyDetection,
  getSavingsTips
} = require('../controllers/aiController');

// All routes are protected
router.use(protect);

// @route   GET /api/ai/insights
// @desc    Get comprehensive AI financial insights
// @access  Private
router.get('/insights', getFinancialInsights);

// @route   GET /api/ai/predict-spending
// @desc    Predict future spending based on historical data
// @access  Private
router.get('/predict-spending', getSpendingPrediction);

// @route   POST /api/ai/suggest-category
// @desc    Suggest category for a transaction based on description
// @access  Private
router.post('/suggest-category', getCategorySuggestions);

// @route   GET /api/ai/budget-recommendations
// @desc    Get AI-powered budget recommendations
// @access  Private
router.get('/budget-recommendations', getBudgetRecommendations);

// @route   GET /api/ai/anomaly-detection
// @desc    Detect unusual spending patterns
// @access  Private
router.get('/anomaly-detection', getAnomalyDetection);

// @route   GET /api/ai/savings-tips
// @desc    Get personalized savings tips
// @access  Private
router.get('/savings-tips', getSavingsTips);

module.exports = router;