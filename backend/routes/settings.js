const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  updateDisplaySettings,
  updateNotificationSettings,
  updatePrivacySettings,
  updateBudgetSettings,
  updateGoalSettings,
  updateAISettings,
  updateExportSettings,
  updateBackupSettings,
  resetSettings,
  getAvailableOptions
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Main settings routes
router.route('/')
  .get(getSettings)
  .put(updateSettings);

// Specific settings sections
router.patch('/display', updateDisplaySettings);
router.patch('/notifications', updateNotificationSettings);
router.patch('/privacy', updatePrivacySettings);
router.patch('/budgets', updateBudgetSettings);
router.patch('/goals', updateGoalSettings);
router.patch('/ai', updateAISettings);
router.patch('/export', updateExportSettings);
router.patch('/backup', updateBackupSettings);

// Special routes
router.post('/reset', resetSettings);
router.get('/options', getAvailableOptions);

module.exports = router;