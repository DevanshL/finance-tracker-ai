const aiService = require('../services/aiService');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const analyticsService = require('../services/analyticsService');

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const response = await aiService.chatWithAI(message, conversationHistory);

    res.status(200).json({
      success: true,
      data: {
        message: response,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze spending patterns with AI
// @route   GET /api/ai/analyze-spending
// @access  Private
exports.analyzeSpending = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    // Get date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const endDate = new Date();

    // Get transactions and budgets
    const [transactions, budgets] = await Promise.all([
      Transaction.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      }).populate('category').lean(),
      Budget.find({ user: req.user._id }).populate('category').lean()
    ]);

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No transactions found for analysis',
        data: {
          analysis: 'You need to add some transactions first before I can analyze your spending patterns.'
        }
      });
    }

    const analysis = await aiService.analyzeSpending(transactions, budgets);

    res.status(200).json({
      success: true,
      data: {
        period,
        transactionCount: transactions.length,
        analysis,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget recommendations from AI
// @route   POST /api/ai/budget-recommendations
// @access  Private
exports.getBudgetRecommendations = async (req, res, next) => {
  try {
    const { monthlyIncome, period = 'month' } = req.body;

    if (!monthlyIncome || monthlyIncome <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid monthly income is required'
      });
    }

    // Get spending data
    const now = new Date();
    const startDate = new Date(now.setMonth(now.getMonth() - 1));
    const endDate = new Date();

    const overview = await analyticsService.getSpendingOverview(
      req.user._id,
      startDate,
      endDate
    );

    const categoryBreakdown = await analyticsService.getCategoryBreakdown(
      req.user._id,
      startDate,
      endDate,
      'expense'
    );

    const recommendations = await aiService.generateBudgetRecommendations(
      monthlyIncome,
      overview.totalExpenses,
      categoryBreakdown
    );

    res.status(200).json({
      success: true,
      data: {
        monthlyIncome,
        currentExpenses: overview.totalExpenses,
        savingsRate: overview.savingsRate,
        recommendations,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate savings plan
// @route   POST /api/ai/savings-plan
// @access  Private
exports.generateSavingsPlan = async (req, res, next) => {
  try {
    const { currentSavings, goalAmount, timeframe, monthlyIncome } = req.body;

    if (!goalAmount || !timeframe || !monthlyIncome) {
      return res.status(400).json({
        success: false,
        message: 'Goal amount, timeframe, and monthly income are required'
      });
    }

    const plan = await aiService.generateSavingsPlan(
      currentSavings || 0,
      goalAmount,
      timeframe,
      monthlyIncome
    );

    res.status(200).json({
      success: true,
      data: {
        currentSavings: currentSavings || 0,
        goalAmount,
        timeframe,
        monthlyIncome,
        plan,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Predict future expenses
// @route   GET /api/ai/predict-expenses
// @access  Private
exports.predictExpenses = async (req, res, next) => {
  try {
    const { months = 3 } = req.query;

    // Get last 6 months of data
    const now = new Date();
    const startDate = new Date(now.setMonth(now.getMonth() - 6));
    const endDate = new Date();

    const monthlyData = await analyticsService.getMonthlyComparison(
      req.user._id,
      6
    );

    if (monthlyData.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Not enough historical data for predictions',
        data: {
          predictions: 'Add more transactions to get expense predictions.'
        }
      });
    }

    const predictions = await aiService.predictExpenses(monthlyData, parseInt(months));

    res.status(200).json({
      success: true,
      data: {
        historicalMonths: monthlyData.length,
        predictionMonths: parseInt(months),
        predictions,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate debt payoff plan
// @route   POST /api/ai/debt-payoff
// @access  Private
exports.generateDebtPayoff = async (req, res, next) => {
  try {
    const { debts, monthlyIncome, monthlyExpenses } = req.body;

    if (!debts || !Array.isArray(debts) || debts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debts array is required'
      });
    }

    if (!monthlyIncome || !monthlyExpenses) {
      return res.status(400).json({
        success: false,
        message: 'Monthly income and expenses are required'
      });
    }

    const plan = await aiService.generateDebtPayoffPlan(
      debts,
      monthlyIncome,
      monthlyExpenses
    );

    res.status(200).json({
      success: true,
      data: {
        totalDebt: debts.reduce((sum, d) => sum + d.amount, 0),
        debtCount: debts.length,
        availableForDebt: monthlyIncome - monthlyExpenses,
        plan,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get investment advice
// @route   POST /api/ai/investment-advice
// @access  Private
exports.getInvestmentAdvice = async (req, res, next) => {
  try {
    const { age, riskTolerance, savingsAmount, goals } = req.body;

    if (!age || !riskTolerance || !savingsAmount) {
      return res.status(400).json({
        success: false,
        message: 'Age, risk tolerance, and savings amount are required'
      });
    }

    const advice = await aiService.getInvestmentAdvice(
      age,
      riskTolerance,
      savingsAmount,
      goals || []
    );

    res.status(200).json({
      success: true,
      data: {
        advice,
        disclaimer: 'This is general information only and not professional financial advice. Consult with a licensed financial advisor.',
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tax optimization tips
// @route   POST /api/ai/tax-tips
// @access  Private
exports.getTaxTips = async (req, res, next) => {
  try {
    const { annualIncome, deductions, investments } = req.body;

    if (!annualIncome) {
      return res.status(400).json({
        success: false,
        message: 'Annual income is required'
      });
    }

    const tips = await aiService.getTaxOptimizationTips(
      annualIncome,
      deductions || [],
      investments || []
    );

    res.status(200).json({
      success: true,
      data: {
        tips,
        disclaimer: 'This is general tax information only. Consult with a licensed tax professional.',
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial health score
// @route   GET /api/ai/financial-health
// @access  Private
exports.getFinancialHealth = async (req, res, next) => {
  try {
    const now = new Date();
    const startDate = new Date(now.setMonth(now.getMonth() - 3));
    const endDate = new Date();

    const [overview, budgets, goals] = await Promise.all([
      analyticsService.getSpendingOverview(req.user._id, startDate, endDate),
      Budget.find({ user: req.user._id }).lean(),
      Goal.find({ user: req.user._id }).lean()
    ]);

    const healthData = {
      savingsRate: parseFloat(overview.savingsRate),
      budgetAdherence: budgets.length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      netSavings: overview.netSavings
    };

    const prompt = `
Analyze this financial health data and provide a score (0-100) and assessment:

${JSON.stringify(healthData)}

Provide:
1. Overall financial health score (0-100)
2. Strengths
3. Areas for improvement
4. Specific action items
5. Next steps

Be encouraging but honest.
`;

    const assessment = await aiService.generateAIResponse(prompt, healthData);

    res.status(200).json({
      success: true,
      data: {
        metrics: healthData,
        assessment,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};