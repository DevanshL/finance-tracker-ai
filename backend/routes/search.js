const express = require('express');
const router = express.Router();
const { globalSearch, advancedTransactionSearch } = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', globalSearch);
router.get('/transactions/advanced', advancedTransactionSearch);

module.exports = router;