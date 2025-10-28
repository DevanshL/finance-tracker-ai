const express = require('express');
const router = express.Router();
const {
  chat,
  analyzeSpending,
  getBudgetRecommendations,
  generateSavingsPlan,
  predictExpenses,
  generateDebtPayoff,
  getInvestmentAdvice,
  getTaxTips,
  getFinancialHealth
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// AI Chat & Analysis
router.post('/chat', chat);
router.get('/analyze-spending', analyzeSpending);
router.get('/financial-health', getFinancialHealth);

// Planning & Recommendations
router.post('/budget-recommendations', getBudgetRecommendations);
router.post('/savings-plan', generateSavingsPlan);
router.get('/predict-expenses', predictExpenses);

// Advanced Financial Planning
router.post('/debt-payoff', generateDebtPayoff);
router.post('/investment-advice', getInvestmentAdvice);
router.post('/tax-tips', getTaxTips);

module.exports = router;