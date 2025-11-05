# Security Implementations & Best Practices

This document outlines the security measures implemented in the M4Capital platform.

---

## 🔒 Implemented Security Features

### 1. Authentication & Authorization

#### Middleware Components

**Location**: `src/lib/middleware/auth.ts`

```typescript
import { requireAuth, requireAdmin } from "@/lib/middleware/auth";

// Require any authenticated user
const { error, session } = await requireAuth(request);
if (error) return error;

// Require admin user
const { error, session } = await requireAdmin(request);
if (error) return error;
```

**Features**:

- ✅ Centralized authentication checking
- ✅ Role-based authorization (USER, ADMIN)
- ✅ Session validation
- ✅ Standardized error responses

**Usage Example**:

```typescript
// In any API route
export async function POST(request: NextRequest) {
  const { error, session } = await requireAdmin(request);
  if (error) return error;

  // Admin-only logic here
}
```

---

### 2. Rate Limiting

#### Middleware Components

**Location**: `src/lib/middleware/ratelimit.ts`

**Pre-configured Limiters**:

- `rateLimiters.strict` - 10 requests/minute (sensitive operations)
- `rateLimiters.auth` - 5 requests/15 minutes (login attempts)
- `rateLimiters.standard` - 100 requests/15 minutes (general API)
- `rateLimiters.public` - 30 requests/minute (public endpoints)
- `rateLimiters.admin` - 20 requests/minute (admin operations)

**Usage Example**:

```typescript
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimiters.standard(request);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  // Continue with request handling
}
```

**Response Headers**:

- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - When the limit resets
- `Retry-After` - Seconds until retry (when limited)

**Implementation Details**:

- In-memory store (consider Redis for production)
- IP-based tracking
- Automatic cleanup of expired records
- Configurable time windows

---

### 3. Error Handling

#### Middleware Components

**Location**: `src/lib/middleware/errorHandler.ts`

**Standardized Responses**:

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2025-11-05T12:00:00.000Z"
}

// Error response
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": { ... },  // Only in development
  "timestamp": "2025-11-05T12:00:00.000Z"
}
```

**Helper Functions**:

```typescript
import {
  createSuccessResponse,
  createErrorResponse,
  withErrorHandler,
} from "@/lib/middleware/errorHandler";

// Success
return createSuccessResponse(data, "User created successfully");

// Error
return createErrorResponse(
  "Invalid input",
  "Email is required",
  undefined,
  400
);

// Automatic error handling
return withErrorHandler(async () => {
  // Your logic here
});
```

**Prisma Error Handling**:

- `P2002` → "Record already exists" (409)
- `P2025` → "Record not found" (404)
- `P2003` → "Invalid reference" (400)
- Auto-converts database errors to user-friendly messages

---

### 4. Secured Endpoints

#### init-admin Endpoint

**File**: `src/app/api/init-admin/route.ts`

**Security Measures**:

- ✅ Can only be called once (when no admin exists)
- ✅ After first admin exists, requires admin authentication
- ✅ Rate limited (10 requests/minute)
- ✅ Environment variable validation
- ✅ No password exposure in responses
- ✅ Standardized error responses

**Before**:

```typescript
// ❌ INSECURE: Anyone could create admins
export async function GET() {
  // No authentication check
  const admin = await prisma.user.create({ role: "ADMIN" });
  return { tempPassword: password }; // Exposed password
}
```

**After**:

```typescript
// ✅ SECURE: Protected with authentication
export async function GET(request: Request) {
  const rateLimitResult = await rateLimiters.strict(request);
  if (rateLimitResult instanceof NextResponse) return rateLimitResult;

  const existingAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
  const isCallerAdmin = session?.user?.role === "ADMIN";

  if (existingAdmins > 0 && !isCallerAdmin) {
    return createErrorResponse(
      "Forbidden",
      "Admin already exists",
      undefined,
      403
    );
  }

  // Create/update admin (no password in response)
}
```

---

#### Payment Endpoints

**File**: `src/app/api/payment/create-bitcoin/route.ts`

**Security Measures**:

- ✅ Authentication required
- ✅ Rate limiting (100 requests/15 minutes)
- ✅ Input validation
- ✅ Amount verification
- ✅ Automatic fallback between payment methods
- ✅ Standardized error handling

**Consolidated Functionality**:

```typescript
// Single endpoint handles both methods
POST /api/payment/create-bitcoin
{
  "amount": 100,
  "currency": "USD",
  "useInvoice": false  // Optional: force invoice method
}
```

**Features**:

- Tries standard payment API first
- Automatically falls back to invoice API if payment API fails
- Validates minimum deposit amounts
- Creates database records before external API calls
- Returns consistent response format

---

#### Admin Update User

**File**: `src/app/api/admin/update-user/route.ts`

**Security Measures**:

- ✅ Admin authentication required
- ✅ Rate limiting (20 requests/minute)
- ✅ Role validation
- ✅ Standardized error responses

---

### 5. Migration Scripts

#### fix-admin Script

**File**: `scripts/fix-admin.ts`

**Migration from API to Script**:

```bash
# Before (API endpoint - insecure)
curl -X POST http://localhost:3000/api/fix-admin

# After (CLI script - secure)
npx ts-node scripts/fix-admin.ts
```

**Why This is Better**:

- ❌ API endpoints can be called by anyone
- ✅ Scripts require server access
- ✅ Can be run during deployment
- ✅ Better logging and error handling
- ✅ No exposure to public internet

---

## 📋 Security Checklist

### Endpoint Security

- [ ] Authentication check implemented
- [ ] Rate limiting applied
- [ ] Input validation
- [ ] Error handling standardized
- [ ] No sensitive data in responses
- [ ] Proper HTTP status codes

### Code Review

- [ ] No hardcoded credentials
- [ ] Environment variables used
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Proper CORS configuration

---

## 🚀 Implementation Guide

### Securing a New Endpoint

```typescript
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { rateLimiters } from "@/lib/middleware/ratelimit";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/middleware/errorHandler";

export async function POST(request: NextRequest) {
  // 1. Apply rate limiting
  const rateLimitResult = await rateLimiters.standard(request);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  // 2. Check authentication
  const { error, session } = await requireAuth(request);
  if (error) return error;

  // 3. Validate input
  const body = await request.json();
  if (!body.requiredField) {
    return createErrorResponse(
      "Invalid input",
      "requiredField is required",
      undefined,
      400
    );
  }

  // 4. Execute logic with error handling
  try {
    const result = await yourLogic(body);
    return createSuccessResponse(result, "Operation successful");
  } catch (error) {
    console.error("Operation failed:", error);
    return createErrorResponse(
      "Operation failed",
      "An error occurred",
      error,
      500
    );
  }
}
```

---

## 🔍 Security Monitoring

### What to Monitor

1. **Failed Authentication Attempts**

   - Track IP addresses with repeated failures
   - Alert on brute force patterns

2. **Rate Limit Violations**

   - Log all 429 responses
   - Track repeat offenders

3. **Suspicious Activity**
   - Multiple failed admin access attempts
   - Unusual API usage patterns
   - Geographic anomalies

### Recommended Tools

- **Error Tracking**: Sentry
- **Logging**: Winston + CloudWatch
- **Monitoring**: Datadog, New Relic
- **Rate Limiting**: Redis (production)

---

## 🛡️ Production Recommendations

### Environment Variables

```env
# Required for security
NEXTAUTH_SECRET="complex-random-string-min-32-chars"
NEXTAUTH_URL="https://yourdomain.com"
DATABASE_URL="postgresql://encrypted-connection"

# Admin credentials (use strong passwords)
ORIGIN_ADMIN_EMAIL="admin@yourdomain.com"
ORIGIN_ADMIN_PASSWORD="Complex!Password123"

# API keys (rotate regularly)
OPENAI_API_KEY="sk-..."
NOWPAYMENTS_API_KEY="..."
```

### HTTPS Configuration

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};
```

### Database Security

- Use connection pooling
- Enable SSL/TLS
- Rotate credentials regularly
- Implement backup strategy
- Use read replicas for scaling

---

## 📊 Audit Log

| Date       | Change                       | Impact                              | Status |
| ---------- | ---------------------------- | ----------------------------------- | ------ |
| 2025-11-05 | Created auth middleware      | Centralized authentication          | ✅     |
| 2025-11-05 | Implemented rate limiting    | Prevent abuse                       | ✅     |
| 2025-11-05 | Standardized error responses | Consistent API                      | ✅     |
| 2025-11-05 | Secured init-admin endpoint  | Prevent unauthorized admin creation | ✅     |
| 2025-11-05 | Consolidated payment routes  | Simplified API, better security     | ✅     |
| 2025-11-05 | Moved fix-admin to script    | Removed public admin modification   | ✅     |

---

## 🎯 Next Steps

### High Priority

1. Migrate rate limiting to Redis for production
2. Implement request logging
3. Add CSRF protection
4. Setup Sentry for error tracking
5. Enable database query logging

### Medium Priority

1. Add API request/response validation with Zod
2. Implement webhook signature verification
3. Add IP whitelisting for admin routes
4. Setup automated security scanning
5. Implement session management improvements

### Low Priority

1. Add captcha for public endpoints
2. Implement geolocation-based restrictions
3. Add user activity logging
4. Setup anomaly detection
5. Implement API versioning

---

**Last Updated**: November 5, 2025  
**Maintainer**: Development Team
