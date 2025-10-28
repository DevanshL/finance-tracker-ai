const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  getUnreadCount,
  generateNotifications,
  createNotification
} = require('../controllers/notificationsController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Main routes
router.route('/')
  .get(getNotifications)
  .post(createNotification);

// Special routes
router.get('/unread/count', getUnreadCount);
router.post('/generate', generateNotifications);
router.patch('/read-all', markAllAsRead);
router.delete('/clear-read', clearReadNotifications);

// Single notification routes
router.route('/:id')
  .get(getNotification)
  .delete(deleteNotification);

router.patch('/:id/read', markAsRead);

module.exports = router;