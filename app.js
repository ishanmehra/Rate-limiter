require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { rateLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({
  // Custom error handler for JSON parsing
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (err) {
      err.statusCode = 400;
      err.body = buf.toString();
      throw err;
    }
  }
}));
app.use(cookieParser());

// Apply rate limiting middleware globally
app.use(rateLimiter);

// Test routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Rate Limited API!',
    userId: req.headers['x-user-id'] || 'Generated on first request',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'This is a test endpoint',
    data: {
      random: Math.random(),
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/data', (req, res) => {
  res.json({
    message: 'Data received',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    server: 'Express Rate Limiter',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to view current users and their rate limit status
app.get('/api/debug/users', (req, res) => {
  const { getRateLimitStore, getConfig } = require('./middleware/rateLimiter');
  const store = getRateLimitStore();
  const config = getConfig();
  
  const users = [];
  const now = Date.now();
  
  for (const [userId, userData] of store.entries()) {
    // Filter out old requests for accurate count
    const validRequests = userData.requests.filter(timestamp => 
      timestamp > (now - config.windowMs)
    );
    
    users.push({
      userId: userId,
      totalRequests: validRequests.length,
      remainingRequests: Math.max(0, config.limit - validRequests.length),
      lastRequest: validRequests.length > 0 ? new Date(Math.max(...validRequests)).toISOString() : null,
      requestTimestamps: validRequests.map(ts => new Date(ts).toISOString()),
      isRateLimited: validRequests.length >= config.limit
    });
  }
  
  res.json({
    totalUsers: users.length,
    rateLimitConfig: {
      limit: config.limit,
      windowSeconds: config.windowMs / 1000
    },
    users: users,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message || err);
  
  // Handle JSON parsing errors specifically
  if (err.type === 'entity.parse.failed' || err.statusCode === 400) {
    return res.status(400).json({
      error: 'invalid_json',
      message: 'Invalid JSON format in request body.'
    });
  }
  
  // Handle other errors
  res.status(err.statusCode || 500).json({
    error: 'internal_server_error',
    message: err.message || 'Something went wrong on our end.'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'not_found',
    message: 'The requested resource was not found.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Rate limiting: ${process.env.RATE_LIMIT || 5} requests per ${process.env.RATE_WINDOW_SEC || 60} seconds`);
  console.log(`🌐 Visit http://localhost:${PORT} to test the API`);
});

module.exports = app;