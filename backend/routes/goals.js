const express = require('express');
const router = express.Router();
const {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal,
  withdrawFromGoal,
  updateGoalStatus,
  getGoalStats
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Stats route (must be before /:id routes)
router.get('/stats', getGoalStats);

// Main CRUD routes
router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .get(getGoal)
  .put(updateGoal)
  .delete(deleteGoal);

// Additional actions
router.post('/:id/contribute', contributeToGoal);
router.post('/:id/withdraw', withdrawFromGoal);
router.patch('/:id/status', updateGoalStatus);

module.exports = router;