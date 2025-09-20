const { v4: uuidv4 } = require('uuid');

// In-memory storage for rate limiting data
const rateLimitStore = new Map();

// Configuration - can be overridden by environment variables
const config = {
  limit: parseInt(process.env.RATE_LIMIT) || 5,
  windowMs: (parseInt(process.env.RATE_WINDOW_SEC) || 60) * 1000, // Convert to milliseconds
};

/**
 * Rate limiting middleware for Express.js
 * Limits requests per user identified by UUID v4
 */
function rateLimiter(req, res, next) {
  // Get or create user ID from cookies/headers
  let userId = req.headers['x-user-id'] || req.cookies?.userId;
  
  if (!userId) {
    userId = uuidv4();
    res.cookie('userId', userId, { 
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    res.setHeader('X-User-ID', userId);
  }

  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get or initialize user data
  let userData = rateLimitStore.get(userId);
  
  if (!userData) {
    userData = {
      requests: [],
      lastReset: now
    };
    rateLimitStore.set(userId, userData);
  }

  // Clean up old requests outside the current window
  userData.requests = userData.requests.filter(timestamp => timestamp > windowStart);

  // Check if user has exceeded the limit
  if (userData.requests.length >= config.limit) {
    const oldestRequest = Math.min(...userData.requests);
    const resetTime = Math.ceil((oldestRequest + config.windowMs - now) / 1000);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.limit);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset', resetTime);

    return res.status(429).json({
      error: 'rate_limited',
      message: 'Too many requests, please try again later.'
    });
  }

  // Add current request to the list
  userData.requests.push(now);
  userData.lastReset = now;

  // Calculate remaining requests
  const remaining = Math.max(0, config.limit - userData.requests.length);
  const oldestRequest = userData.requests[0] || now;
  const resetTime = Math.ceil((oldestRequest + config.windowMs - now) / 1000);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', config.limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', Math.max(1, resetTime));

  next();
}

/**
 * Cleanup function to remove old entries from the rate limit store
 * Should be called periodically to prevent memory leaks
 */
function cleanupOldEntries() {
  const now = Date.now();
  const cutoff = now - config.windowMs;

  for (const [userId, userData] of rateLimitStore.entries()) {
    // Remove requests older than the window
    userData.requests = userData.requests.filter(timestamp => timestamp > cutoff);
    
    // If no recent requests, remove the user entirely
    if (userData.requests.length === 0 && (now - userData.lastReset) > config.windowMs) {
      rateLimitStore.delete(userId);
    }
  }
}

// Set up automatic cleanup every minute
setInterval(cleanupOldEntries, 60000);

module.exports = {
  rateLimiter,
  cleanupOldEntries,
  getRateLimitStore: () => rateLimitStore, // For testing purposes
  getConfig: () => config
};