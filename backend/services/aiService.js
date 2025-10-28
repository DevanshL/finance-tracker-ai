const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate AI response
 */
exports.generateAIResponse = async (prompt, context = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let fullPrompt = prompt;
    
    if (context) {
      fullPrompt = `Context: ${JSON.stringify(context)}\n\nUser Question: ${prompt}`;
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to generate AI response');
  }
};

/**
 * Analyze spending patterns
 */
exports.analyzeSpending = async (transactions, budgets = []) => {
  try {
    const prompt = `
You are a financial advisor AI. Analyze the following transaction data and provide insights:

Transactions: ${JSON.stringify(transactions.slice(0, 50))}
Budgets: ${JSON.stringify(budgets)}

Provide a detailed analysis including:
1. Spending patterns and trends
2. Areas where user is overspending
3. Budget adherence
4. Specific recommendations to improve financial health
5. Categories that need attention

Format your response in a clear, actionable way.
`;

    const analysis = await this.generateAIResponse(prompt);
    return analysis;
  } catch (error) {
    throw new Error('Failed to analyze spending: ' + error.message);
  }
};

/**
 * Generate budget recommendations
 */
exports.generateBudgetRecommendations = async (income, expenses, categoryBreakdown) => {
  try {
    const prompt = `
You are a financial planning AI. Based on the following financial data, provide budget recommendations:

Monthly Income: $${income}
Monthly Expenses: $${expenses}
Category Breakdown: ${JSON.stringify(categoryBreakdown)}

Provide:
1. Recommended budget allocation for each category (using 50/30/20 rule or similar)
2. Specific dollar amounts for each category
3. Areas to reduce spending
4. Savings goals
5. Emergency fund recommendations

Format as JSON with category names and recommended amounts.
`;

    const recommendations = await this.generateAIResponse(prompt);
    return recommendations;
  } catch (error) {
    throw new Error('Failed to generate budget recommendations: ' + error.message);
  }
};

/**
 * Financial advice chatbot
 */
exports.chatWithAI = async (userMessage, conversationHistory = []) => {
  try {
    const context = conversationHistory.length > 0 
      ? `Previous conversation: ${JSON.stringify(conversationHistory.slice(-5))}\n\n`
      : '';

    const prompt = `${context}You are a helpful financial advisor assistant. Answer the following question with practical, actionable advice:

User: ${userMessage}

Provide a clear, concise, and helpful response focused on personal finance.`;

    const response = await this.generateAIResponse(prompt);
    return response;
  } catch (error) {
    throw new Error('Failed to generate chat response: ' + error.message);
  }
};

/**
 * Generate savings plan
 */
exports.generateSavingsPlan = async (currentSavings, goalAmount, timeframe, monthlyIncome) => {
  try {
    const prompt = `
You are a financial planning AI. Create a detailed savings plan:

Current Savings: $${currentSavings}
Goal Amount: $${goalAmount}
Timeframe: ${timeframe} months
Monthly Income: $${monthlyIncome}

Provide:
1. Monthly savings required
2. Percentage of income to save
3. Actionable steps to reach the goal
4. Tips to increase savings
5. Milestone checkpoints

Be specific and practical.
`;

    const plan = await this.generateAIResponse(prompt);
    return plan;
  } catch (error) {
    throw new Error('Failed to generate savings plan: ' + error.message);
  }
};

/**
 * Predict future expenses
 */
exports.predictExpenses = async (historicalData, futureMonths = 3) => {
  try {
    const prompt = `
You are a financial forecasting AI. Based on this historical transaction data, predict expenses for the next ${futureMonths} months:

Historical Data: ${JSON.stringify(historicalData)}

Provide:
1. Predicted monthly expenses for each of the next ${futureMonths} months
2. Category-wise predictions
3. Confidence level for predictions
4. Factors that might affect predictions
5. Recommendations to prepare for predicted expenses

Format as JSON with month, category, and predicted amount.
`;

    const predictions = await this.generateAIResponse(prompt);
    return predictions;
  } catch (error) {
    throw new Error('Failed to predict expenses: ' + error.message);
  }
};

/**
 * Debt payoff strategy
 */
exports.generateDebtPayoffPlan = async (debts, monthlyIncome, expenses) => {
  try {
    const prompt = `
You are a debt management AI. Create a debt payoff strategy:

Debts: ${JSON.stringify(debts)}
Monthly Income: $${monthlyIncome}
Monthly Expenses: $${expenses}

Provide:
1. Recommended payoff method (Avalanche vs Snowball)
2. Payment priority order
3. Monthly payment amounts for each debt
4. Estimated payoff timeline
5. Tips to accelerate debt payoff

Be specific with dollar amounts and timelines.
`;

    const plan = await this.generateAIResponse(prompt);
    return plan;
  } catch (error) {
    throw new Error('Failed to generate debt payoff plan: ' + error.message);
  }
};

/**
 * Investment advice
 */
exports.getInvestmentAdvice = async (age, riskTolerance, savingsAmount, goals) => {
  try {
    const prompt = `
You are an investment advisory AI. Provide investment guidance:

Age: ${age}
Risk Tolerance: ${riskTolerance}
Available Savings: $${savingsAmount}
Financial Goals: ${JSON.stringify(goals)}

Provide:
1. Recommended asset allocation
2. Investment vehicle suggestions (401k, IRA, stocks, bonds, etc.)
3. Risk management strategies
4. Diversification recommendations
5. Next steps to start investing

Note: Include standard disclaimer about not being professional financial advice.
`;

    const advice = await this.generateAIResponse(prompt);
    return advice;
  } catch (error) {
    throw new Error('Failed to generate investment advice: ' + error.message);
  }
};

/**
 * Tax optimization tips
 */
exports.getTaxOptimizationTips = async (income, deductions, investments) => {
  try {
    const prompt = `
You are a tax planning AI. Provide tax optimization strategies:

Annual Income: $${income}
Current Deductions: ${JSON.stringify(deductions)}
Investments: ${JSON.stringify(investments)}

Provide:
1. Available tax deductions and credits
2. Retirement account optimization
3. Investment tax strategies
4. Record-keeping recommendations
5. Tax-advantaged savings opportunities

Include disclaimer about consulting a tax professional.
`;

    const tips = await this.generateAIResponse(prompt);
    return tips;
  } catch (error) {
    throw new Error('Failed to generate tax tips: ' + error.message);
  }
};