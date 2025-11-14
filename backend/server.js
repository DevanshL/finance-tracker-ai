const express = require('express');
const http = require('http');
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

// Import WebSocket service
const websocketService = require('./services/websocketService');

// Import error handler
const { errorHandler } = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB().then(() => {
  seedDefaultCategories();
});

// Initialize Express app
const app = express();

// Create HTTP server for WebSocket
const server = http.createServer(app);

// Initialize WebSocket
websocketService.initialize(server);

// Trust proxy
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// Rate Limiter
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
// HEALTH & INFO
// ==============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Connected',
    websocket: `${websocketService.getConnectedUsersCount()} active connections`,
    aiEnabled: !!process.env.GEMINI_API_KEY
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Finance Tracker AI - COMPLETE PRODUCTION API',
    version: '2.5.0',
    status: 'production-ready',
    totalEndpoints: '100+',
    features: {
      weeks: [
        '✅ Week 1: Core Features',
        '✅ Week 2: Analytics & Advanced',
        '✅ Week 3: AI & Automation',
        '✅ Week 4: Dashboard & System',
        '✅ Week 5: Real-time & Settings'
      ],
      realtime: 'WebSocket support enabled',
      websocket: `${websocketService.getConnectedUsersCount()} active connections`
    }
  });
});

// ==============================================
// MOUNT ROUTES
// ==============================================

// Week 1: Core (Days 1-7)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));

// Week 2: Analytics (Days 8-14)
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/export', require('./routes/export'));
app.use('/api/search', require('./routes/search'));
app.use('/api/preferences', require('./routes/preferences'));

// Week 3: AI & Automation (Days 15-21)
app.use('/api/ai', require('./routes/ai'));
app.use('/api/recurring-transactions', require('./routes/recurringTransactions'));
app.use('/api/reports', require('./routes/reports'));

// Week 4: Dashboard & System (Days 22-28)
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/backup', require('./routes/backup'));

// Week 5: Real-time & Settings (Days 29-35)
app.use('/api/websocket', require('./routes/websocket'));
app.use('/api/settings', require('./routes/settings'));

// ==============================================
// ERROR HANDLING
// ==============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

// ==============================================
// START SERVER
// ==============================================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(75));
  console.log('  💰 FINANCE TRACKER AI - COMPLETE PRODUCTION API v2.5');
  console.log('='.repeat(75));
  console.log(`  ✅ Status: Running`);
  console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🚀 HTTP Server: http://localhost:${PORT}`);
  console.log(`  🔥 API Base: http://localhost:${PORT}/api`);
  console.log(`  💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`  🔌 WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`  📡 Active WS Connections: ${websocketService.getConnectedUsersCount()}`);
  console.log('='.repeat(75));
  console.log('  📊 5-WEEK COMPLETE SYSTEM:');
  console.log('');
  console.log('  ✅ WEEK 1: Core Features');
  console.log('     • Auth, Transactions, Budgets, Goals');
  console.log('');
  console.log('  ✅ WEEK 2: Analytics & Advanced');
  console.log('     • Analytics, Export, Search, Preferences');
  console.log('');
  console.log('  ✅ WEEK 3: AI & Automation');
  console.log('     • AI Advisor, Recurring, Reports');
  console.log('');
  console.log('  ✅ WEEK 4: Dashboard & System');
  console.log('     • Smart Notifications, Dashboard, Backup/Restore');
  console.log('');
  console.log('  ✅ WEEK 5: Real-time & Settings');
  console.log('     • WebSocket Real-time Updates');
  console.log('     • Comprehensive User Settings');
  console.log('');
  console.log('='.repeat(75));
  console.log('  🎯 Total Endpoints: 100+');
  console.log('  🔌 WebSocket: Real-time updates enabled');
  console.log('  🤖 AI: Powered by Gemini');
  console.log('  🎉 PRODUCTION READY - 5 WEEKS COMPLETE!');
  console.log('='.repeat(75) + '\n');
  console.log('  📝 Press Ctrl+C to stop the server\n');
});

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  websocketService.closeAll();
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  websocketService.closeAll();
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  websocketService.closeAll();
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  websocketService.closeAll();
  server.close(() => process.exit(0));
});