import { rateLimit } from 'express-rate-limit';

// Configure rate limiting middleware to prevent abuse
const limiter = rateLimit({
  windowMs: 6000, // 1 minute time window for request limiting
  limit: 60, // allow a maximum of 60 requests per window per IP
  standardHeaders: 'draft-8', // use the latest standard rate-limit headers
  legacyHeaders: false, //disable deprecated X-RateLimit headers
  message: {
    error:
      'You have sent to many requests in a given amount of time. Please try again later.',
  },
});

export default limiter;
