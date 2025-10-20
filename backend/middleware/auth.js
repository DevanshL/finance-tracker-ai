const jwt = require('jsonwebtoken');
const { AppError, asyncHandler } = require('./errorHandler');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const User = require('../models/User');

/**
 * Protect routes - Check if user is authenticated
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    // Check if user still exists
    if (!req.user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError(ERROR_MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired, please login again', HTTP_STATUS.UNAUTHORIZED);
    }
    throw error;
  }
});

/**
 * Optional authentication - Attach user if token is valid
 * But don't fail if no token
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid, but continue without user
      req.user = null;
    }
  }

  next();
});

/**
 * Check if user owns the resource
 * @param {Model} Model - Mongoose model to check
 * @param {String} paramName - Parameter name in route (default: 'id')
 */
const authorize = (Model, paramName = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[paramName];

    // Find the resource
    const resource = await Model.findById(resourceId);

    if (!resource) {
      throw new AppError('Resource not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if user owns the resource
    if (resource.userId.toString() !== req.user._id.toString()) {
      throw new AppError(
        ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Attach resource to request for later use
    req.resource = resource;

    next();
  });
};

module.exports = {
  protect,
  optionalAuth,
  authorize
};