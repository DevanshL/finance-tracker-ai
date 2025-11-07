const redis = require('redis');

class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      // Only connect if Redis URL is provided
      if (!process.env.REDIS_URL) {
        console.log('⚠️  Redis URL not configured. Cache disabled.');
        return;
      }

      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > this.maxRetries) {
              console.error('❌ Redis max retries reached. Cache disabled.');
              return false;
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('🔄 Connecting to Redis...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
        this.retryAttempts = 0;
      });

      this.client.on('reconnecting', () => {
        this.retryAttempts++;
        console.log(`🔄 Reconnecting to Redis... (Attempt ${this.retryAttempts})`);
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      this.isConnected = false;
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable() {
    return this.isConnected && this.client;
  }

  /**
   * Set cache value
   */
  async set(key, value, expireSeconds = 3600) {
    if (!this.isAvailable()) return false;

    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, expireSeconds, serialized);
      return true;
    } catch (error) {
      console.error('Redis SET error:', error.message);
      return false;
    }
  }

  /**
   * Get cache value
   */
  async get(key) {
    if (!this.isAvailable()) return null;

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error.message);
      return null;
    }
  }

  /**
   * Delete cache key
   */
  async del(key) {
    if (!this.isAvailable()) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error.message);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern) {
    if (!this.isAvailable()) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis DEL pattern error:', error.message);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.isAvailable()) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error.message);
      return false;
    }
  }

  /**
   * Increment counter
   */
  async incr(key) {
    if (!this.isAvailable()) return null;

    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', error.message);
      return null;
    }
  }

  /**
   * Decrement counter
   */
  async decr(key) {
    if (!this.isAvailable()) return null;

    try {
      return await this.client.decr(key);
    } catch (error) {
      console.error('Redis DECR error:', error.message);
      return null;
    }
  }

  /**
   * Set expiration on key
   */
  async expire(key, seconds) {
    if (!this.isAvailable()) return false;

    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Redis EXPIRE error:', error.message);
      return false;
    }
  }

  /**
   * Flush all cache (use with caution!)
   */
  async flushAll() {
    if (!this.isAvailable()) return false;

    try {
      await this.client.flushAll();
      console.log('🗑️  Redis cache flushed');
      return true;
    } catch (error) {
      console.error('Redis FLUSHALL error:', error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    if (!this.isAvailable()) {
      return {
        connected: false,
        keys: 0
      };
    }

    try {
      const info = await this.client.info('stats');
      const dbSize = await this.client.dbSize();
      
      return {
        connected: true,
        keys: dbSize,
        info
      };
    } catch (error) {
      console.error('Redis STATS error:', error.message);
      return {
        connected: false,
        keys: 0,
        error: error.message
      };
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('👋 Redis disconnected');
    }
  }

  // ==============================================
  // CACHE PATTERNS
  // ==============================================

  /**
   * Cache middleware for Express routes
   */
  cacheMiddleware(expireSeconds = 300) {
    return async (req, res, next) => {
      if (!this.isAvailable()) return next();

      // Create cache key from request
      const cacheKey = `cache:${req.method}:${req.originalUrl}:${req.user?._id || 'anonymous'}`;

      try {
        // Try to get cached response
        const cachedData = await this.get(cacheKey);
        
        if (cachedData) {
          console.log(`✅ Cache HIT: ${cacheKey}`);
          return res.status(200).json(cachedData);
        }

        console.log(`❌ Cache MISS: ${cacheKey}`);

        // Store original res.json
        const originalJson = res.json.bind(res);

        // Override res.json to cache response
        res.json = (data) => {
          if (res.statusCode === 200) {
            this.set(cacheKey, data, expireSeconds).catch(err => {
              console.error('Cache set error:', err);
            });
          }
          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Invalidate user-specific cache
   */
  async invalidateUserCache(userId) {
    return await this.delPattern(`cache:*:*:${userId}`);
  }

  /**
   * Cache dashboard data
   */
  async cacheDashboard(userId, data, expireSeconds = 300) {
    const key = `dashboard:${userId}`;
    return await this.set(key, data, expireSeconds);
  }

  async getDashboard(userId) {
    const key = `dashboard:${userId}`;
    return await this.get(key);
  }

  /**
   * Cache analytics data
   */
  async cacheAnalytics(userId, type, data, expireSeconds = 600) {
    const key = `analytics:${userId}:${type}`;
    return await this.set(key, data, expireSeconds);
  }

  async getAnalytics(userId, type) {
    const key = `analytics:${userId}:${type}`;
    return await this.get(key);
  }

  /**
   * Session management
   */
  async setSession(sessionId, data, expireSeconds = 86400) {
    const key = `session:${sessionId}`;
    return await this.set(key, data, expireSeconds);
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.del(key);
  }

  /**
   * Rate limiting with Redis
   */
  async checkRateLimit(identifier, maxRequests, windowSeconds) {
    if (!this.isAvailable()) return { allowed: true };

    const key = `ratelimit:${identifier}`;
    
    try {
      const current = await this.incr(key);
      
      if (current === 1) {
        await this.expire(key, windowSeconds);
      }
      
      const allowed = current <= maxRequests;
      const remaining = Math.max(0, maxRequests - current);
      
      return {
        allowed,
        current,
        remaining,
        resetIn: windowSeconds
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true };
    }
  }

  /**
   * Token blacklist (for logout)
   */
  async blacklistToken(token, expireSeconds) {
    const key = `blacklist:${token}`;
    return await this.set(key, true, expireSeconds);
  }

  async isTokenBlacklisted(token) {
    const key = `blacklist:${token}`;
    return await this.exists(key);
  }
}

// Export singleton instance
module.exports = new RedisCache();