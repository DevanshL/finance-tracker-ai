const express = require('express');
const router = express.Router();
const {
  createGoal,
  getGoals,
  getGoalById,           // Changed from getGoal
  updateGoal,
  deleteGoal,
  addContribution,       // Changed from contributeToGoal
  // withdrawFromGoal,   // Not exported in controller
  // updateGoalStatus,   // Not exported in controller
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
  .get(getGoalById)      // Changed from getGoal
  .put(updateGoal)
  .delete(deleteGoal);

// Additional actions
router.post('/:id/contribute', addContribution);  // Changed from contributeToGoal

// Comment out these routes as functions don't exist in controller
// router.post('/:id/withdraw', withdrawFromGoal);
// router.patch('/:id/status', updateGoalStatus);

module.exports = router;