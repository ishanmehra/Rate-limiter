# Express Rate Limiter

A simple rate-limiting middleware for Express.js that limits requests per user using UUID v4 identification.

## Features

- **User Identification**: Each user is assigned a unique UUID v4 identifier
- **Rate Limiting**: Configurable request limits per time window (default: 5 requests per minute)
- **In-Memory Storage**: Uses Map for efficient request tracking
- **Automatic Cleanup**: Old request data is automatically cleaned up to prevent memory leaks
- **Informative Headers**: Returns useful rate limiting headers
- **Error Handling**: Returns JSON error responses for rate-limited requests
- **Environment Configuration**: Fully configurable via environment variables

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd express-rate-limiter
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
```bash
cp .env.example .env
# Edit .env file with your preferred settings
```

4. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## Configuration

Configure the rate limiter using environment variables in your `.env` file:

```env
RATE_LIMIT=5          # Maximum requests per time window
RATE_WINDOW_SEC=60    # Time window in seconds
PORT=3000             # Server port
NODE_ENV=development  # Environment
```

## API Endpoints

- `GET /` - Welcome endpoint
- `GET /api/test` - Test endpoint
- `POST /api/data` - Data submission endpoint
- `GET /api/status` - Server status endpoint

## Rate Limiting Headers

All responses include the following headers:

- `X-RateLimit-Limit`: Maximum requests allowed in the current window
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Time in seconds until the rate limit resets
- `X-User-ID`: The UUID v4 identifier for the user (set on first request)

## Error Response

When rate limit is exceeded, the API returns:

```json
{
  "error": "rate_limited",
  "message": "Too many requests, please try again later."
}
```

HTTP Status Code: `429 Too Many Requests`

## Architecture

### Middleware Structure

The rate limiter middleware (`middleware/rateLimiter.js`) implements:

1. **User Identification**: Generates UUID v4 for new users, stores in HTTP-only cookie
2. **Request Tracking**: Maintains request timestamps in memory using Map
3. **Window-based Limiting**: Implements sliding window rate limiting
4. **Automatic Cleanup**: Periodically removes old data to prevent memory leaks
5. **Header Management**: Sets appropriate rate limiting headers

### Memory Management

- Uses in-memory Map for fast lookups
- Automatic cleanup runs every minute
- Removes expired request data and inactive users
- Prevents memory leaks in long-running applications

## Testing

You can test the rate limiter using curl or any HTTP client:

```bash
# Make multiple requests quickly to test rate limiting
for i in {1..10}; do
  curl -H "Content-Type: application/json" http://localhost:3000/api/test
  echo ""
done
```

## Scalability Considerations

- **Current Implementation**: In-memory storage suitable for single-instance deployments
- **Production Recommendations**: 
  - Use Redis or similar for distributed rate limiting
  - Implement user authentication for better user identification
  - Add monitoring and logging for rate limit violations
  - Consider implementing different limits for different user tiers

## Code Quality Features

- **Error Handling**: Comprehensive error handling with meaningful messages
- **Modular Design**: Separate middleware module for reusability
- **Configuration**: Environment-based configuration for flexibility
- **Documentation**: Extensive inline comments and documentation
- **Headers**: Standard HTTP headers for client integration