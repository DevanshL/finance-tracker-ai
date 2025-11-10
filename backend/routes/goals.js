const express = require('express');
const router = express.Router();
const {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getGoalProgress,
  getActiveGoals,
  getCompletedGoals,
  getGoalStats,
  getRecommendations
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Stats route (must be before /:id routes)
router.get('/stats', getGoalStats);

// Get active/completed goals (must be before /:id routes)
router.get('/status/active', getActiveGoals);
router.get('/status/completed', getCompletedGoals);

// Main CRUD routes
router.route('/')
  .get(getGoals)
  .post(createGoal);

// Single goal routes
router.route('/:id')
  .get(getGoal)
  .put(updateGoal)
  .delete(deleteGoal);

// Goal progress routes
router.patch('/:id/progress', updateGoalProgress);
router.get('/:id/progress', getGoalProgress);

// Recommendations
router.get('/recommendations/smart', getRecommendations);

module.exports = router;
