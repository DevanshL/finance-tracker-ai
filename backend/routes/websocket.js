const express = require('express');
const router = express.Router();
const {
  getConnectionInfo,
  sendTestNotification,
  getStats,
  disconnectUser
} = require('../controllers/websocketController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/info', getConnectionInfo);
router.post('/test', sendTestNotification);
router.get('/stats', getStats);
router.post('/disconnect', disconnectUser);

module.exports = router;