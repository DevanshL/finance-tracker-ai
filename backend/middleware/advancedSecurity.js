const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');

// Rate limiters (currently disabled for development)
exports.apiLimiter = (req, res, next) => next();
exports.authLimiter = (req, res, next) => next();
exports.createAccountLimiter = (req, res, next) => next();
exports.exportLimiter = (req, res, next) => next();
exports.aiLimiter = (req, res, next) => next();
exports.websocketLimiter = (req, res, next) => next();

/**
 * MongoDB Sanitization - Prevent NoSQL injection
 */
exports.mongoSanitize = () => mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Potential NoSQL injection detected in ${key}`);
  }
});

/**
 * XSS Protection - Prevent Cross-Site Scripting
 */
exports.xssProtection = () => xss();

/**
 * HPP Protection - Prevent HTTP Parameter Pollution
 */
exports.hppProtection = () => hpp({
  whitelist: ['sort', 'fields', 'limit', 'page']
});

/**
 * Helmet Security Headers
 */
exports.helmetSecurity = () => helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      scriptSrcAttr: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
});

/**
 * Sanitize Request Data
 */
exports.sanitizeRequest = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/<[^>]*>/g, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
};

/**
 * Security Headers Middleware
 */
exports.securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests");
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Origin-Agent-Cluster', '?1');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  next();
};

/**
 * IP Filter - DISABLED FOR DEVELOPMENT
 * Enable this in production if needed
 */
const blacklistedIPs = new Set();

exports.ipFilter = (req, res, next) => {
  // DISABLED: Allow all IPs in development
  // In production, check and enforce IP blacklist here
  next();
  
  // Production version (commented out):
  // const clientIP = req.ip || req.connection.remoteAddress;
  // if (blacklistedIPs.has(clientIP)) {
  //   return res.status(403).json({ success: false, message: 'Access denied' });
  // }
  // next();
};

/**
 * Blacklist an IP address
 */
exports.blacklistIP = (ip) => {
  blacklistedIPs.add(ip);
  console.log(`IP blacklisted: ${ip}`);
};

/**
 * Remove IP from blacklist
 */
exports.unblacklistIP = (ip) => {
  blacklistedIPs.delete(ip);
  console.log(`IP unblacklisted: ${ip}`);
};

/**
 * Detect Suspicious Activity - DISABLED FOR DEVELOPMENT
 */
const suspiciousActivity = new Map();

exports.detectSuspiciousActivity = (req, res, next) => {
  // DISABLED: Allow all requests in development
  // Enable in production for rate limiting and bot detection
  next();
  
  // Production version (commented out):
  // const userId = req.user?._id?.toString() || 'anonymous';
  // const key = `${userId}:${req.ip}`;
  //
  // if (!suspiciousActivity.has(key)) {
  //   suspiciousActivity.set(key, { count: 0, lastRequest: Date.now() });
  // }
  //
  // const activity = suspiciousActivity.get(key);
  // activity.count++;
  // const timeDiff = Date.now() - activity.lastRequest;
  //
  // if (timeDiff > 60000) {
  //   activity.count = 1;
  // }
  //
  // if (activity.count > 100) {
  //   exports.blacklistIP(req.ip);
  //   return res.status(429).json({ success: false, message: 'Too many requests' });
  // }
  //
  // activity.lastRequest = Date.now();
  // next();
};

/**
 * Track failed login attempts
 */
const failedLoginAttempts = new Map();

exports.trackFailedLogin = (identifier) => {
  const now = Date.now();
  
  if (!failedLoginAttempts.has(identifier)) {
    failedLoginAttempts.set(identifier, { attempts: 0, lockTime: null });
  }
  
  const attempts = failedLoginAttempts.get(identifier);
  attempts.attempts++;
  
  if (attempts.attempts >= 5) {
    attempts.lockTime = now + (15 * 60 * 1000); // Lock for 15 minutes
  }
};

/**
 * Check if account is locked
 */
exports.isAccountLocked = (identifier) => {
  const attempts = failedLoginAttempts.get(identifier);
  
  if (!attempts) return false;
  
  if (attempts.lockTime && Date.now() < attempts.lockTime) {
    return true;
  }
  
  if (attempts.lockTime && Date.now() >= attempts.lockTime) {
    failedLoginAttempts.delete(identifier);
  }
  
  return false;
};

/**
 * Reset failed login attempts
 */
exports.resetFailedLoginAttempts = (identifier) => {
  failedLoginAttempts.delete(identifier);
};
