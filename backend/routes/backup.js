const express = require('express');
const router = express.Router();
const {
  createBackup,
  downloadBackup,
  restoreBackup,
  validateBackup,
  clearData,
  getBackupHistory
} = require('../controllers/backupController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Backup operations
router.post('/create', createBackup);
router.get('/download', downloadBackup);
router.post('/restore', restoreBackup);
router.post('/validate', validateBackup);
router.delete('/clear', clearData);
router.get('/history', getBackupHistory);

module.exports = router;