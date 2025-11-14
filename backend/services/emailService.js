// Email notification service
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    // Create transporter (configure based on your email provider)
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send email
  async sendEmail(to, subject, html, text) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Finance Tracker <noreply@financetracker.com>',
        to,
        subject,
        text,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.success(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Finance Tracker!';
    const html = `
      <h1>Welcome ${user.name}!</h1>
      <p>Thank you for joining Finance Tracker. We're excited to help you manage your finances.</p>
      <p>Get started by:</p>
      <ul>
        <li>Adding your first transaction</li>
        <li>Setting up budgets</li>
        <li>Creating financial goals</li>
        <li>Exploring AI-powered insights</li>
      </ul>
      <p>Happy tracking!</p>
    `;
    const text = `Welcome ${user.name}! Thank you for joining Finance Tracker.`;
    
    return this.sendEmail(user.email, subject, html, text);
  }

  // Send budget alert
  async sendBudgetAlert(user, budget, percentUsed) {
    const subject = `Budget Alert: ${budget.name}`;
    const html = `
      <h2>Budget Alert!</h2>
      <p>Hi ${user.name},</p>
      <p>Your budget "${budget.name}" is at ${percentUsed}% utilization.</p>
      <p><strong>Budget:</strong> $${budget.amount}</p>
      <p><strong>Spent:</strong> $${(budget.amount * percentUsed / 100).toFixed(2)}</p>
      <p><strong>Remaining:</strong> $${(budget.amount * (100 - percentUsed) / 100).toFixed(2)}</p>
      ${percentUsed >= 100 ? '<p style="color: red;"><strong>⚠️ Budget exceeded!</strong></p>' : ''}
      <p>Consider adjusting your spending to stay on track.</p>
    `;
    const text = `Budget Alert: ${budget.name} is at ${percentUsed}% utilization.`;
    
    return this.sendEmail(user.email, subject, html, text);
  }

  // Send goal achievement notification
  async sendGoalAchieved(user, goal) {
    const subject = `🎉 Goal Achieved: ${goal.name}`;
    const html = `
      <h1>Congratulations ${user.name}!</h1>
      <p>You've achieved your financial goal: <strong>${goal.name}</strong></p>
      <p><strong>Target:</strong> $${goal.targetAmount}</p>
      <p><strong>Achieved:</strong> $${goal.currentAmount}</p>
      <p>Keep up the great work with your financial planning!</p>
    `;
    const text = `Congratulations! You've achieved your goal: ${goal.name}`;
    
    return this.sendEmail(user.email, subject, html, text);
  }

  // Send weekly summary
  async sendWeeklySummary(user, summary) {
    const subject = 'Your Weekly Finance Summary';
    const html = `
      <h2>Weekly Finance Summary</h2>
      <p>Hi ${user.name},</p>
      <h3>This Week:</h3>
      <ul>
        <li><strong>Income:</strong> $${summary.income}</li>
        <li><strong>Expenses:</strong> $${summary.expenses}</li>
        <li><strong>Net:</strong> $${summary.income - summary.expenses}</li>
        <li><strong>Transactions:</strong> ${summary.transactionCount}</li>
      </ul>
      <h3>Top Categories:</h3>
      <ul>
        ${summary.topCategories.map(cat => `<li>${cat.name}: $${cat.total}</li>`).join('')}
      </ul>
      <p>Keep tracking your finances to reach your goals!</p>
    `;
    const text = `Weekly Summary - Income: $${summary.income}, Expenses: $${summary.expenses}`;
    
    return this.sendEmail(user.email, subject, html, text);
  }

  // Send password reset email
  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <h2>Password Reset</h2>
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    const text = `Password reset link: ${resetUrl}`;
    
    return this.sendEmail(user.email, subject, html, text);
  }
}

// Export singleton instance
module.exports = new EmailService();
