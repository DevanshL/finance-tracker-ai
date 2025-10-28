const express = require('express');
const router = express.Router();
const { getPreferences, updatePreferences } = require('../controllers/preferencesController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPreferences)
  .put(updatePreferences);

module.exports = router;