# Express Rate Limiter

A simple rate-limiting middleware for Express.js that allows only **5 requests per minute per user** using UUID v4 identification.

## 🚀 Features

- ✅ **5 requests per minute limit** per user
- ✅ **UUID v4 user identification** with automatic assignment
- ✅ **In-memory Map storage** for request tracking
- ✅ **Sliding window rate limiting** with automatic reset
- ✅ **Global middleware** applied to all routes
- ✅ **Standard rate limiting headers** (X-RateLimit-*)
- ✅ **HTTP 429 error responses** with JSON format
- ✅ **Environment configuration** (RATE_LIMIT, RATE_WINDOW_SEC)
- ✅ **Automatic cleanup** to prevent memory leaks

## 📦 Quick Start

1. **Clone and install**:
```bash
git clone <your-repo-url>
cd express-rate-limiter
npm install
```

2. **Start the server**:
```bash
npm start
```

3. **Test the rate limiter**:
```bash
# Make 6 quick requests to see rate limiting in action
curl http://localhost:3000/api/test  # Request 1-5: 200 OK
curl http://localhost:3000/api/test  # Request 6: 429 Too Many Requests
```

## ⚙️ Configuration

Create or edit `.env` file:
```env
RATE_LIMIT=5          # Max requests per window
RATE_WINDOW_SEC=60    # Window duration in seconds
PORT=3000             # Server port
```

## 🛡️ Rate Limiting Behavior

### Successful Requests (1-5)
- **Status**: `200 OK`
- **Headers**:
  - `X-RateLimit-Limit: 5`
  - `X-RateLimit-Remaining: 4, 3, 2, 1, 0`
  - `X-RateLimit-Reset: <seconds-until-reset>`
  - `X-User-ID: <uuid-v4>`

### Rate Limited Requests (6+)
- **Status**: `429 Too Many Requests`
- **Response**:
```json
{
  "error": "rate_limited",
  "message": "Too many requests, please try again later."
}
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome page |
| GET | `/api/test` | Test endpoint for rate limiting |
| POST | `/api/data` | Data submission endpoint |
| GET | `/api/status` | Server status |

## 🧪 Testing with Postman

Import `postman_collection_simple.json` for ready-to-use requests:
1. **Test API** - Basic rate limiting test
2. **Home Page** - Welcome endpoint
3. **Submit Data** - POST request test

## 🏗️ Architecture

### Rate Limiting Algorithm
- **Sliding window**: Tracks individual request timestamps
- **Per-user limits**: Each UUID gets separate 5-request quota
- **Automatic reset**: Old requests expire after 60 seconds
- **Memory efficient**: Cleanup removes expired data every minute

### User Identification
- **New users**: Auto-assigned UUID v4 on first request
- **Persistence**: Stored in HTTP-only secure cookies
- **Headers**: User ID exposed via `X-User-ID` header

### Storage
- **In-memory Map**: Fast O(1) user lookups
- **Request tracking**: Array of timestamps per user
- **Auto-cleanup**: Prevents memory leaks in long-running apps

## 📊 Implementation Details

### Core Requirements ✅
- [x] 5 requests per minute per user
- [x] UUID v4 user identification
- [x] In-memory Map storage
- [x] 1-minute reset window with auto-cleanup
- [x] Global middleware application
- [x] All required headers (X-RateLimit-*)
- [x] Exact 429 error format
- [x] Environment configuration

### Code Quality ✅
- [x] Modular middleware design
- [x] Comprehensive error handling
- [x] Environment-based configuration
- [x] Extensive documentation
- [x] Memory leak prevention

## 🔧 Development

### File Structure
```
express-rate-limiter/
├── middleware/
│   └── rateLimiter.js      # Core rate limiting logic
├── app.js                  # Express application
├── package.json            # Dependencies
├── .env                    # Configuration
├── .env.example           # Configuration template
├── README.md              # This file
├── prompts.md             # LLM development prompts
└── postman_collection_simple.json  # Postman tests
```

### Key Files
- **`middleware/rateLimiter.js`**: Main rate limiting implementation
- **`app.js`**: Express server with global middleware
- **`.env`**: Environment configuration
- **`prompts.md`**: Documents LLM usage in development

## 🚀 Production Considerations

### Current Implementation
- ✅ Perfect for single-server deployments
- ✅ Low latency with in-memory storage
- ✅ No external dependencies

### Scaling Recommendations
- **Multi-server**: Use Redis for shared state
- **Authentication**: Replace UUID with user accounts
- **Monitoring**: Add rate limit violation logging
- **Flexibility**: Different limits per user tier

## 📝 LLM Development

This project was developed with LLM assistance. See `prompts.md` for:
- Original requirements and prompts
- Development process documentation
- Architecture decisions and reasoning
- Code quality improvements

---

**Ready for GitHub submission** ✅ All requirements implemented and documented.