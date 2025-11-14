const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getProfile,  // Changed from getMe
  updateProfile,
  changePassword
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
router.get('/me', protect, getProfile);  // Changed from getMe
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
// Remove logout route for now since it's not implemented
// router.post('/logout', protect, logout);

module.exports = router;