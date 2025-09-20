# Express Rate Limiter

Simple rate-limiting middleware for Express.js - allows 5 requests per minute per user.

## Setup

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`

## Configuration

Edit `.env` file:
```
RATE_LIMIT=5
RATE_WINDOW_SEC=60
PORT=3000
```

## How it works

- Each user gets a unique UUID (stored in cookie)
- Track requests using in-memory Map
- 5 requests allowed per 60-second window
- Returns 429 error when limit exceeded

## API Endpoints

- `GET /` - Welcome page
- `GET /api/test` - Test endpoint
- `POST /api/data` - Submit data
- `GET /api/status` - Server status

## Rate Limiting

**Successful requests return:**
- Status: 200
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Rate limited requests return:**
- Status: 429
- Body: `{"error": "rate_limited", "message": "Too many requests, please try again later."}`

## Testing

Make 6 quick requests to see rate limiting:
```bash
curl http://localhost:3000/api/test
```

First 5 will succeed, 6th will return 429.

## Files

- `app.js` - Main Express server
- `middleware/rateLimiter.js` - Rate limiting logic
- `postman_collection_simple.json` - Postman tests