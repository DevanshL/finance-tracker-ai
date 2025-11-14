// Financial prediction and forecasting service
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const logger = require('../utils/logger');

class PredictionService {
  // Predict next month's spending based on historical data
  async predictMonthlySpending(userId, category = null) {
    try {
      // Get last 6 months of data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const query = {
        userId,
        type: 'expense',
        date: { $gte: sixMonthsAgo }
      };

      if (category) {
        query.category = category;
      }

      const transactions = await Transaction.find(query);

      // Group by month
      const monthlyTotals = {};
      transactions.forEach(t => {
        const month = new Date(t.date).toISOString().slice(0, 7);
        monthlyTotals[month] = (monthlyTotals[month] || 0) + t.amount;
      });

      const values = Object.values(monthlyTotals);
      if (values.length === 0) return 0;

      // Simple moving average
      const average = values.reduce((a, b) => a + b, 0) / values.length;

      // Add trend (simple linear regression)
      let trend = 0;
      if (values.length >= 2) {
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        trend = (secondAvg - firstAvg) / firstAvg;
      }

      // Predict next month (average + trend)
      const prediction = average * (1 + trend);

      return {
        predictedAmount: Math.round(prediction * 100) / 100,
        confidence: this.calculateConfidence(values),
        historicalAverage: Math.round(average * 100) / 100,
        trend: (trend * 100).toFixed(2) + '%',
        dataPoints: values.length
      };
    } catch (error) {
      logger.error('Prediction error:', error);
      throw error;
    }
  }

  // Calculate confidence level based on data variance
  calculateConfidence(values) {
    if (values.length < 2) return 'low';
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    if (coefficientOfVariation < 0.2) return 'high';
    if (coefficientOfVariation < 0.4) return 'medium';
    return 'low';
  }

  // Detect spending anomalies
  async detectAnomalies(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const transactions = await Transaction.find({
        userId,
        type: 'expense',
        date: { $gte: startDate }
      }).sort('-date');

      if (transactions.length < 10) {
        return { anomalies: [], message: 'Not enough data for anomaly detection' };
      }

      const amounts = transactions.map(t => t.amount);
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = Math.sqrt(
        amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
      );

      // Identify outliers (> 2 standard deviations from mean)
      const anomalies = transactions.filter(t => {
        return Math.abs(t.amount - mean) > 2 * stdDev;
      }).map(t => ({
        transaction: t,
        deviation: ((t.amount - mean) / stdDev).toFixed(2),
        severity: Math.abs(t.amount - mean) > 3 * stdDev ? 'high' : 'medium'
      }));

      return {
        anomalies,
        statistics: {
          mean: Math.round(mean * 100) / 100,
          stdDev: Math.round(stdDev * 100) / 100,
          totalTransactions: transactions.length
        }
      };
    } catch (error) {
      logger.error('Anomaly detection error:', error);
      throw error;
    }
  }

  // Predict budget overrun
  async predictBudgetOverrun(budgetId) {
    try {
      const budget = await Budget.findById(budgetId).populate('userId');
      if (!budget) throw new Error('Budget not found');

      const currentDate = new Date();
      const daysElapsed = Math.floor((currentDate - budget.startDate) / (1000 * 60 * 60 * 24));
      const totalDays = Math.floor((budget.endDate - budget.startDate) / (1000 * 60 * 60 * 24));
      const daysRemaining = totalDays - daysElapsed;

      // Get current spending
      const transactions = await Transaction.find({
        userId: budget.userId,
        category: budget.category,
        date: { $gte: budget.startDate, $lte: currentDate }
      });

      const currentSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const dailyBurnRate = currentSpent / daysElapsed;
      const projectedTotal = dailyBurnRate * totalDays;

      return {
        budgetAmount: budget.amount,
        currentSpent,
        projectedTotal: Math.round(projectedTotal * 100) / 100,
        willExceed: projectedTotal > budget.amount,
        overrunAmount: Math.max(0, projectedTotal - budget.amount),
        daysRemaining,
        dailyBudget: Math.round((budget.amount - currentSpent) / daysRemaining * 100) / 100,
        currentDailyRate: Math.round(dailyBurnRate * 100) / 100
      };
    } catch (error) {
      logger.error('Budget overrun prediction error:', error);
      throw error;
    }
  }

  // Suggest savings opportunities
  async suggestSavings(userId) {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const transactions = await Transaction.find({
        userId,
        type: 'expense',
        date: { $gte: lastMonth }
      });

      // Group by category
      const categoryTotals = {};
      transactions.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

      const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

      // Find categories with high spending
      const suggestions = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount: Math.round(amount * 100) / 100,
          percentage: ((amount / totalSpending) * 100).toFixed(2),
          potentialSavings: Math.round(amount * 0.1 * 100) / 100 // Suggest 10% reduction
        }))
        .filter(s => s.amount > 100) // Only suggest for significant categories
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      return {
        totalSpending: Math.round(totalSpending * 100) / 100,
        suggestions,
        totalPotentialSavings: suggestions.reduce((sum, s) => sum + s.potentialSavings, 0)
      };
    } catch (error) {
      logger.error('Savings suggestion error:', error);
      throw error;
    }
  }
}

module.exports = new PredictionService();
