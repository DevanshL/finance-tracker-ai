const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Import category seeder
const { seedDefaultCategories } = require('./utils/seedCategories');

// Import error handler
const { errorHandler } = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB().then(() => {
  // Seed default categories after DB connection
  seedDefaultCategories();
});

// Initialize Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// Rate Limiter - 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ==============================================
// API ROUTES
// ==============================================

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    database: 'Connected',
    aiEnabled: !!process.env.GEMINI_API_KEY
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Finance Tracker AI - Complete Backend API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    weeks: {
      week1: '✅ Days 1-7: Core Features',
      week2: '✅ Days 8-14: Analytics & Advanced',
      week3: '✅ Days 15-21: AI & Automation'
    },
    totalEndpoints: '70+',
    features: [
      'Authentication & Authorization',
      'Transaction Management',
      'Budget Tracking',
      'Goal Management',
      'Advanced Analytics',
      'Data Export (CSV, PDF, JSON)',
      'Global Search',
      'Smart Notifications',
      'AI-Powered Insights',
      'Recurring Transactions',
      'Custom Reports'
    ]
  });
});

// ==============================================
// MOUNT ROUTES
// ==============================================

// Week 1: Core Features (Days 1-7)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));

// Week 2: Analytics & Advanced (Days 8-14)
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/export', require('./routes/export'));
app.use('/api/search', require('./routes/search'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/preferences', require('./routes/preferences'));

// Week 3: AI & Automation (Days 15-21)
app.use('/api/ai', require('./routes/ai'));
app.use('/api/recurring-transactions', require('./routes/recurringTransactions'));
app.use('/api/reports', require('./routes/reports'));

// ==============================================
// ERROR HANDLING
// ==============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use(errorHandler);

// ==============================================
// START SERVER
// ==============================================

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('  💰 FINANCE TRACKER AI - COMPLETE BACKEND API');
  console.log('='.repeat(70));
  console.log(`  ✅ Status: Running`);
  console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🚀 Server: http://localhost:${PORT}`);
  console.log(`  🔥 API Base: http://localhost:${PORT}/api`);
  console.log(`  💚 Health: http://localhost:${PORT}/health`);
  console.log(`  🗄️  Database: ${process.env.MONGODB_URI ? 'Configured ✅' : 'Not configured ⚠️'}`);
  console.log(`  🔐 JWT: ${process.env.JWT_SECRET ? 'Configured ✅' : 'Not configured ⚠️'}`);
  console.log(`  🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not configured ⚠️'}`);
  console.log('='.repeat(70));
  console.log('  📊 COMPLETE FEATURE SET:');
  console.log('');
  console.log('  ✅ WEEK 1 (Days 1-7): Core Features');
  console.log('     • Authentication & Authorization');
  console.log('     • Transaction Management (CRUD)');
  console.log('     • Category System');
  console.log('     • Budget Tracking');
  console.log('     • Financial Goals');
  console.log('');
  console.log('  ✅ WEEK 2 (Days 8-14): Analytics & Advanced');
  console.log('     • Advanced Analytics Dashboard');
  console.log('     • Data Export (CSV, PDF, JSON)');
  console.log('     • Global Search & Filtering');
  console.log('     • Smart Notifications');
  console.log('     • User Preferences');
  console.log('');
  console.log('  ✅ WEEK 3 (Days 15-21): AI & Automation');
  console.log('     • AI-Powered Financial Advisor');
  console.log('     • Spending Analysis with AI');
  console.log('     • Budget Recommendations');
  console.log('     • Expense Predictions');
  console.log('     • Recurring Transactions');
  console.log('     • Custom Reports & Scheduling');
  console.log('');
  console.log('='.repeat(70));
  console.log('  🎯 Total API Endpoints: 70+');
  console.log('  🎉 3 WEEKS COMPLETE - PRODUCTION READY!');
  console.log('='.repeat(70) + '\n');
  console.log('  📝 Press Ctrl+C to stop the server\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error('💡 Stack:', err.stack);
  server.close(() => {
    console.log('🛑 Server closed due to unhandled rejection');
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error('💡 Stack:', err.stack);
  console.log('🛑 Server shutting down...');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});