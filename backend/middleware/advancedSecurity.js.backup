const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');

// ==============================================
// RATE LIMITING - DISABLED
// ==============================================

exports.apiLimiter = (req, res, next) => next();
exports.authLimiter = (req, res, next) => next();
exports.createAccountLimiter = (req, res, next) => next();
exports.exportLimiter = (req, res, next) => next();
exports.aiLimiter = (req, res, next) => next();
exports.websocketLimiter = (req, res, next) => next();

// ==============================================
// SECURITY MIDDLEWARE
// ==============================================

exports.mongoSanitize = () => mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ MongoDB injection attempt: ${key}`);
  }
});

exports.xssProtection = () => xss();

exports.hppProtection = () => hpp({
  whitelist: ['amount', 'type', 'category', 'date']
});

exports.helmetSecurity = () => helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

exports.sanitizeRequest = (req, res, next) => {
  const sanitize = (obj) => {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/\0/g, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    });
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

exports.securityHeaders = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

const blacklistedIPs = new Set();

exports.ipFilter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  if (blacklistedIPs.has(clientIP)) {
    console.warn(`⚠️ Blocked IP: ${clientIP}`);
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

exports.blacklistIP = (ip) => {
  blacklistedIPs.add(ip);
  console.log(`🚫 IP blacklisted: ${ip}`);
};

exports.unblacklistIP = (ip) => {
  blacklistedIPs.delete(ip);
  console.log(`✅ IP removed: ${ip}`);
};

const suspiciousActivity = new Map();

exports.detectSuspiciousActivity = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const userId = req.user?._id?.toString() || 'anonymous';
  const key = `${clientIP}-${userId}`;

  if (!suspiciousActivity.has(key)) {
    suspiciousActivity.set(key, {
      requests: 0,
      lastRequest: Date.now(),
      suspiciousPatterns: 0
    });
  }

  const activity = suspiciousActivity.get(key);
  activity.requests++;
  activity.lastRequest = Date.now();

  if (activity.requests > 50) {
    const timeDiff = Date.now() - activity.lastRequest;
    if (timeDiff < 10000) {
      console.warn(`⚠️ Suspicious activity: ${clientIP}`);
      activity.suspiciousPatterns++;
      
      if (activity.suspiciousPatterns > 3) {
        exports.blacklistIP(clientIP);
        return res.status(403).json({
          success: false,
          message: 'Suspicious activity detected.'
        });
      }
    }
  }

  setTimeout(() => {
    if (suspiciousActivity.has(key)) {
      suspiciousActivity.get(key).requests = 0;
    }
  }, 60000);

  next();
};

const failedLoginAttempts = new Map();

exports.trackFailedLogin = (identifier) => {
  if (!failedLoginAttempts.has(identifier)) {
    failedLoginAttempts.set(identifier, {
      count: 0,
      lastAttempt: Date.now(),
      lockedUntil: null
    });
  }

  const attempts = failedLoginAttempts.get(identifier);
  attempts.count++;
  attempts.lastAttempt = Date.now();

  if (attempts.count >= 5) {
    attempts.lockedUntil = Date.now() + 15 * 60 * 1000;
    console.warn(`🔒 Account locked: ${identifier}`);
  }

  return attempts;
};

exports.isAccountLocked = (identifier) => {
  const attempts = failedLoginAttempts.get(identifier);
  if (!attempts) return false;
  
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return true;
  }
  
  if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
    attempts.count = 0;
    attempts.lockedUntil = null;
  }
  
  return false;
};

exports.resetFailedLoginAttempts = (identifier) => {
  failedLoginAttempts.delete(identifier);
};

const userLocks = new Map();

exports.acquireLock = async (userId, resource, timeout = 5000) => {
  const lockKey = `${userId}-${resource}`;
  
  if (userLocks.has(lockKey)) {
    const lock = userLocks.get(lockKey);
    const age = Date.now() - lock.timestamp;
    
    if (age > timeout) {
      userLocks.delete(lockKey);
    } else {
      throw new Error('Resource locked.');
    }
  }
  
  userLocks.set(lockKey, {
    timestamp: Date.now(),
    resource
  });
  
  return lockKey;
};

exports.releaseLock = (lockKey) => {
  userLocks.delete(lockKey);
};

exports.preventConcurrentModifications = (resourceType) => {
  return async (req, res, next) => {
    if (!req.user) return next();
    
    const resourceId = req.params.id || resourceType;
    const lockKey = `${req.user._id}-${resourceId}`;
    
    try {
      await exports.acquireLock(req.user._id, resourceId);
      req.lockKey = lockKey;
      
      res.on('finish', () => {
        exports.releaseLock(lockKey);
      });
      
      next();
    } catch (error) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
  };
};

class RequestQueue {
  constructor(maxConcurrent = 10, maxQueueSize = 100) {
    this.maxConcurrent = maxConcurrent;
    this.maxQueueSize = maxQueueSize;
    this.currentRequests = 0;
    this.queue = [];
  }

  async add(fn) {
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error('Queue full.');
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.currentRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.currentRequests++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.currentRequests--;
      this.process();
    }
  }

  getStats() {
    return {
      currentRequests: this.currentRequests,
      queueLength: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      maxQueueSize: this.maxQueueSize
    };
  }
}

const queues = {
  aiRequests: new RequestQueue(5, 50),
  exports: new RequestQueue(3, 30),
  heavyOperations: new RequestQueue(10, 100)
};

exports.queueRequest = (queueName = 'heavyOperations') => {
  return async (req, res, next) => {
    const queue = queues[queueName];
    if (!queue) return next();

    try {
      await queue.add(async () => {
        return new Promise((resolve) => {
          const originalSend = res.send;
          res.send = function(data) {
            resolve(data);
            return originalSend.call(this, data);
          };
          next();
        });
      });
    } catch (error) {
      return res.status(503).json({
        success: false,
        message: error.message
      });
    }
  };
};

exports.getQueueStats = () => {
  return Object.keys(queues).reduce((acc, key) => {
    acc[key] = queues[key].getStats();
    return acc;
  }, {});
};

module.exports = exports;