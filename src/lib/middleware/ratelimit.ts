import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the window
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// For production, consider using Redis or similar
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Rate limiting middleware
 * Limits requests based on IP address
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    // Get client IP address
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const key = `ratelimit:${ip}`;
    const now = Date.now();

    // Get or create rate limit record
    let record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      record = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(key, record);
    }

    // Increment request count
    record.count++;

    // Check if limit exceeded
    if (record.count > config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      return NextResponse.json(
        {
          success: false,
          error: "Too many requests",
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(record.resetTime).toISOString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const remaining = config.maxRequests - record.count;

    return {
      headers: {
        "X-RateLimit-Limit": config.maxRequests.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(record.resetTime).toISOString(),
      },
    };
  };
}

/**
 * Cleanup old rate limit records periodically
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  const keysToDelete: string[] = [];

  rateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => rateLimitStore.delete(key));
}

// Run cleanup every 10 minutes
if (typeof window === "undefined") {
  // Server-side only
  setInterval(cleanupRateLimitStore, 10 * 60 * 1000);
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict: 10 requests per minute
  strict: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 10,
  }),

  // Auth: 5 login attempts per 15 minutes
  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  }),

  // Standard: 100 requests per 15 minutes
  standard: rateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  }),

  // Public: 30 requests per minute
  public: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 30,
  }),

  // Admin operations: 20 requests per minute
  admin: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 20,
  }),
};
