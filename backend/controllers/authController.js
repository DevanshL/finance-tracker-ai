const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET not defined');
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// FIX FOR ISSUE 1: Blank Page on Sign Up
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // VALIDATION 1: Check all required fields exist
    if (!name || !email || !password || !confirmPassword) {
      console.warn('Registration: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // VALIDATION 2: Validate email format
    if (!isValidEmail(email.toLowerCase())) {
      console.warn(`Registration: Invalid email format - ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // VALIDATION 3: Validate name length
    if (name.trim().length < 2 || name.trim().length > 50) {
      console.warn('Registration: Invalid name length');
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 50 characters'
      });
    }

    // VALIDATION 4: Validate password length
    if (password.length < 6) {
      console.warn('Registration: Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // VALIDATION 5: Check passwords match
    if (password !== confirmPassword) {
      console.warn('Registration: Passwords do not match');
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // CHECK: User already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      console.warn(`Registration: User already exists - ${email}`);
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // CREATE: New user
    console.log(`Creating new user: ${email}`);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password // Will be hashed by User model pre-save hook
    });

    if (!user) {
      console.error('Registration: Failed to create user');
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    // GENERATE: JWT Token
    const token = generateToken(user._id);

    // RESPONSE: Success with all required data
    console.log(`Registration successful: ${email}`);
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Don't expose internal errors to client
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// FIX FOR ISSUE 2: Page Refresh on Wrong Credentials
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // VALIDATION 1: Check required fields
    if (!email || !password) {
      console.warn('Login: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // VALIDATION 2: Validate email format
    if (!isValidEmail(email.toLowerCase())) {
      console.warn(`Login: Invalid email format - ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    console.log(`Login attempt: ${email}`);

    // STEP 1: Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.warn(`Login failed: User not found - ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials' // Don't reveal if email exists
      });
    }

    // STEP 2: Compare password
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (passwordError) {
      console.error('Password comparison error:', passwordError.message);
      return res.status(500).json({
        success: false,
        message: 'Error validating credentials'
      });
    }

    if (!isPasswordValid) {
      console.warn(`Login failed: Invalid password - ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials' // Don't reveal which field is wrong
      });
    }

    // STEP 3: Generate token
    const token = generateToken(user._id);

    // STEP 4: Return success response
    console.log(`Login successful: ${email}`);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Login failed. Please try again.'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      console.warn('GetMe: No user in request');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      console.warn('GetMe: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('GetMe error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user data'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { name, email } = req.body;
    const fieldsToUpdate = {};

    // Validate name if provided
    if (name) {
      if (name.trim().length < 2 || name.trim().length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 50 characters'
        });
      }
      fieldsToUpdate.name = name.trim();
    }

    // Validate email if provided
    if (email) {
      if (!isValidEmail(email.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Check if email taken by another user
      if (email.toLowerCase() !== req.user.email) {
        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }
      fieldsToUpdate.email = email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`Profile updated: ${user.email}`);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate all fields provided
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    console.log(`Password changed: ${user.email}`);
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      token
    });
  } catch (error) {
    console.error('Change password error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // In a stateless JWT system, logout is handled client-side
    // by removing the token from storage
    
    console.log(`User logged out: ${req.user._id}`);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};