// Central route aggregator
const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const transactionRoutes = require('./transactions');
const budgetRoutes = require('./budgets');
const goalRoutes = require('./goals');
const categoryRoutes = require('./categories');
const analyticsRoutes = require('./analytics');
const dashboardRoutes = require('./dashboard');
const aiRoutes = require('./ai');

// Mount routes
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/categories', categoryRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
