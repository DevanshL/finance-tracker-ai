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
    database: 'Connected'
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Finance Tracker API v1.0',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health',
      api: 'GET /api',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getMe: 'GET /api/auth/me'
      },
      transactions: {
        getAll: 'GET /api/transactions',
        getOne: 'GET /api/transactions/:id',
        create: 'POST /api/transactions',
        update: 'PUT /api/transactions/:id',
        delete: 'DELETE /api/transactions/:id',
        summary: 'GET /api/transactions/summary'
      },
      categories: {
        getAll: 'GET /api/categories',
        getOne: 'GET /api/categories/:id',
        create: 'POST /api/categories',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id'
      },
      budgets: {
        getAll: 'GET /api/budgets',
        getOne: 'GET /api/budgets/:id',
        create: 'POST /api/budgets',
        update: 'PUT /api/budgets/:id',
        delete: 'DELETE /api/budgets/:id',
        alerts: 'GET /api/budgets/alerts'
      },
      goals: {
        getAll: 'GET /api/goals',
        getOne: 'GET /api/goals/:id',
        create: 'POST /api/goals',
        update: 'PUT /api/goals/:id',
        delete: 'DELETE /api/goals/:id',
        contribute: 'POST /api/goals/:id/contribute',
        withdraw: 'POST /api/goals/:id/withdraw',
        stats: 'GET /api/goals/stats'
      },
      analytics: {
        dashboard: 'GET /api/analytics/dashboard',
        overview: 'GET /api/analytics/overview',
        categories: 'GET /api/analytics/categories',
        trends: 'GET /api/analytics/trends',
        monthly: 'GET /api/analytics/monthly',
        budgetPerformance: 'GET /api/analytics/budget-performance',
        goalProgress: 'GET /api/analytics/goal-progress',
        insights: 'GET /api/analytics/insights',
        comparison: 'GET /api/analytics/comparison',
        topCategories: 'GET /api/analytics/top-categories',
        report: 'GET /api/analytics/report'
      },
      export: {
        transactionsCSV: 'GET /api/export/transactions/csv',
        budgetsCSV: 'GET /api/export/budgets/csv',
        goalsCSV: 'GET /api/export/goals/csv',
        reportPDF: 'GET /api/export/report/pdf',
        allJSON: 'GET /api/export/all/json'
      },
      search: {
        global: 'GET /api/search',
        advancedTransactions: 'GET /api/search/transactions/advanced'
      },
      notifications: {
        getAll: 'GET /api/notifications',
        markRead: 'POST /api/notifications/read'
      },
      preferences: {
        get: 'GET /api/preferences',
        update: 'PUT /api/preferences'
      }
    }
  });
});

// ==============================================
// MOUNT ROUTES
// ==============================================

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Transaction routes
app.use('/api/transactions', require('./routes/transactions'));

// Category routes
app.use('/api/categories', require('./routes/categories'));

// Budget routes
app.use('/api/budgets', require('./routes/budgets'));

// Goal routes
app.use('/api/goals', require('./routes/goals'));

// Analytics routes (Day 9)
app.use('/api/analytics', require('./routes/analytics'));

// Export routes (Day 10)
app.use('/api/export', require('./routes/export'));

// Search routes (Day 11-12)
app.use('/api/search', require('./routes/search'));

// Notification routes (Day 11-12)
app.use('/api/notifications', require('./routes/notifications'));

// Preferences routes (Day 11-12)
app.use('/api/preferences', require('./routes/preferences'));

// AI routes (coming soon)
// app.use('/api/ai', require('./routes/ai'));

// ==============================================
// ERROR HANDLING
// ==============================================

// 404 Handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /health',
      'GET /api',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/transactions',
      'GET /api/categories',
      'GET /api/budgets',
      'GET /api/goals',
      'GET /api/analytics/dashboard',
      'GET /api/export/transactions/csv',
      'GET /api/search',
      'GET /api/notifications',
      'GET /api/preferences'
    ]
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
  console.log('  💰 FINANCE TRACKER API - BACKEND SERVER');
  console.log('='.repeat(70));
  console.log(`  ✅ Status: Running`);
  console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🚀 Server: http://localhost:${PORT}`);
  console.log(`  🔥 API Base: http://localhost:${PORT}/api`);
  console.log(`  💚 Health: http://localhost:${PORT}/health`);
  console.log(`  📦 Dependencies: All loaded locally`);
  console.log(`  🗄️  Database: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
  console.log(`  🔐 JWT: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`);
  console.log(`  🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log('='.repeat(70));
  console.log('  📊 NEW FEATURES (Days 9-12):');
  console.log('     ✅ Analytics System (11 endpoints)');
  console.log('     ✅ Export System (5 endpoints)');
  console.log('     ✅ Search & Filter (2 endpoints)');
  console.log('     ✅ Notifications (2 endpoints)');
  console.log('     ✅ User Preferences (2 endpoints)');
  console.log('='.repeat(70));
  console.log('  🎯 Total Endpoints: 50+');
  console.log('='.repeat(70) + '\n');
  console.log('  📝 Press Ctrl+C to stop the server\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error('💡 Stack:', err.stack);
  // Close server & exit process
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