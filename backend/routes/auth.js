const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation
} = require('../middleware/validator');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
