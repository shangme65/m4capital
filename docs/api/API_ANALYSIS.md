# API Routes Analysis & Optimization Recommendations

## Current API Structure

### ✅ Well-Organized Routes

**Authentication** (`/api/auth/`)

- `[...nextauth]/route.ts` - NextAuth handler ✓
- `signup/route.ts` - User registration ✓
- `verify-code/route.ts` - Email verification ✓
- `resend-code/route.ts` - Resend verification ✓
- `forgot-password/route.ts` - Password reset request ✓
- `reset-password/route.ts` - Password reset confirmation ✓

**Portfolio** (`/api/portfolio/`)

- `route.ts` - Get user portfolio ✓

**Trading** (`/api/trades/`)

- `record/route.ts` - Record trades ✓

**User** (`/api/user/`)

- `email-preferences/route.ts` - Email settings ✓

**Crypto** (`/api/crypto/`)

- `prices/route.ts` - Real-time crypto prices ✓

**KYC** (`/api/kyc/`)

- `submit/route.ts` - Submit KYC documents ✓
- `status/route.ts` - Check KYC status ✓

**Telegram** (`/api/telegram/`)

- `route.ts` - Webhook handler ✓
- `setup/route.ts` - Bot configuration ✓

---

## ⚠️ Redundant/Overlapping Routes

### 1. Payment Routes - Consolidation Needed

**Current State:**

- `/api/payment/create-bitcoin/route.ts`
- `/api/payment/create-bitcoin-invoice/route.ts`

**Issue**: Two routes doing nearly identical Bitcoin payment creation.

**Recommendation**: Merge into single route

```typescript
// Consolidated: /api/payment/create/route.ts
POST /api/payment/create
{
  "amount": 100,
  "currency": "USD",
  "method": "bitcoin" | "invoice" // Optional parameter
}
```

**Action**:

```bash
# Keep: create-bitcoin/route.ts (more complete implementation)
# Remove: create-bitcoin-invoice/route.ts
# Add method parameter to create-bitcoin
```

---

### 2. Admin Initialization Routes

**Current State:**

- `/api/init-admin/route.ts` - Initialize admin from env vars
- `/api/fix-admin/route.ts` - Fix admin roles (hardcoded emails)

**Issue**: `fix-admin` appears to be a one-time fix/migration script, not a production endpoint.

**Recommendation**:

- Keep `init-admin` for production use
- Move `fix-admin` to `/scripts/` directory as a Node script
- Or delete if no longer needed

**Action**:

```bash
# Keep: init-admin/route.ts
# Convert to script: fix-admin/route.ts → scripts/fix-admin.ts
# Or delete if obsolete
```

---

### 3. Admin User Management Routes

**Current Structure:**

```
/api/admin/users/route.ts              # Generic user operations?
/api/admin/users/list/route.ts         # List users
/api/admin/users/delete/[userId]/route.ts
/api/admin/users/restore/[userId]/route.ts
/api/admin/users/permanent-delete/[userId]/route.ts
/api/admin/users/bin/route.ts          # List deleted users
/api/admin/update-user/route.ts        # Outside users/ folder
```

**Recommendation**: Consolidate for consistency

**Proposed Structure:**

```
/api/admin/users/route.ts              # GET: list, POST: create
/api/admin/users/[userId]/route.ts     # GET: one, PUT: update, DELETE: soft delete
/api/admin/users/[userId]/restore/route.ts
/api/admin/users/[userId]/permanent-delete/route.ts
/api/admin/users/bin/route.ts
```

**Action**:

```bash
# Merge update-user into users/[userId] PUT handler
# Keep RESTful structure
```

---

## 🚨 Potential Issues

### Security Concerns

**1. Open Admin Initialization**

```typescript
// /api/init-admin/route.ts
export async function GET() {
  // No authentication check!
  // Anyone can call this endpoint
}
```

**Fix**: Add IP whitelist or remove after first use

```typescript
export async function GET(request: NextRequest) {
  // Option 1: Check if admin already exists
  const adminExists = await prisma.user.findFirst({
    where: { role: "ADMIN", isOriginAdmin: true },
  });

  if (adminExists) {
    return NextResponse.json(
      { error: "Admin already initialized" },
      { status: 403 }
    );
  }

  // Option 2: Require secret token
  const token = request.headers.get("X-Admin-Token");
  if (token !== process.env.ADMIN_INIT_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Continue with initialization...
}
```

**2. Test Endpoints in Production**

```typescript
// /api/payment/test-nowpayments/route.ts
export async function GET() {
  // Should only exist in development
}
```

**Fix**: Add environment check

```typescript
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 404 }
    );
  }
  // Test logic...
}
```

---

## 🎯 Optimization Recommendations

### 1. Implement Middleware for Common Patterns

**Create**: `src/middleware/auth.ts`

```typescript
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requireAdmin(request: NextRequest) {
  const session = await requireAuth(request);
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
```

**Usage**:

```typescript
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  // Admin-only logic
}
```

---

### 2. Add Rate Limiting

**Create**: `src/middleware/rateLimit.ts`

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

**Apply to Public Endpoints**:

```typescript
// /api/crypto/prices/route.ts
export async function GET(request: NextRequest) {
  const ip = request.ip ?? "anonymous";
  const allowed = await checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Continue...
}
```

---

### 3. Standardize Error Responses

**Create**: `src/lib/apiResponse.ts`

```typescript
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  console.error("Unhandled error:", error);
  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export function successResponse(data: any, statusCode: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
```

---

### 4. Add Request Validation

**Install**: `npm install zod`

**Create**: `src/schemas/api.ts`

```typescript
import { z } from "zod";

export const depositSchema = z.object({
  amount: z.number().positive().max(1000000),
  currency: z.enum(["USD", "EUR", "BTC", "ETH"]),
  method: z.enum(["CRYPTO", "BANK", "CARD"]).optional(),
});

export const tradeSchema = z.object({
  asset: z.string().min(2).max(10),
  type: z.enum(["BUY", "SELL"]),
  amount: z.number().positive(),
  price: z.number().positive(),
  leverage: z.number().min(1).max(100).default(1),
});
```

**Usage**:

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate
  const result = tradeSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request", details: result.error.errors },
      { status: 400 }
    );
  }

  const validatedData = result.data;
  // Continue with validated data...
}
```

---

## 📊 Recommended Actions Summary

| Priority  | Action                                | Impact       | Effort |
| --------- | ------------------------------------- | ------------ | ------ |
| 🔴 HIGH   | Secure `/api/init-admin`              | Security     | Low    |
| 🔴 HIGH   | Add rate limiting to public endpoints | Security     | Medium |
| 🟡 MEDIUM | Consolidate payment routes            | Clean Code   | Low    |
| 🟡 MEDIUM | Move/delete `fix-admin`               | Organization | Low    |
| 🟡 MEDIUM | Standardize error responses           | DX           | Medium |
| 🟢 LOW    | Add request validation                | Quality      | Medium |
| 🟢 LOW    | Reorganize admin routes               | Organization | Medium |

---

## 🚀 Future Enhancements

1. **API Versioning**: `/api/v1/`, `/api/v2/`
2. **GraphQL Endpoint**: For complex queries
3. **WebSocket Support**: Real-time price updates
4. **API Documentation UI**: Swagger/OpenAPI
5. **Request Logging**: Structured logging with correlation IDs
6. **Health Check Endpoint**: `/api/health`
7. **Metrics Endpoint**: `/api/metrics` (Prometheus format)

---

## 🛠️ Implementation Plan

### Phase 1: Security (Week 1)

- [ ] Secure init-admin endpoint
- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Add request validation

### Phase 2: Consolidation (Week 2)

- [ ] Merge payment routes
- [ ] Remove/migrate fix-admin
- [ ] Standardize error handling
- [ ] Reorganize admin routes

### Phase 3: Enhancement (Week 3)

- [ ] Add API documentation
- [ ] Implement logging
- [ ] Add health checks
- [ ] Performance monitoring

---

## 📝 Testing Checklist

After implementing changes:

- [ ] All auth endpoints work correctly
- [ ] Rate limiting triggers at threshold
- [ ] Error responses are consistent
- [ ] Validation catches invalid inputs
- [ ] Admin routes require proper permissions
- [ ] Payment flow works end-to-end
- [ ] KYC submission and review work
- [ ] Telegram webhook processes messages
- [ ] Crypto prices endpoint returns data
- [ ] Portfolio calculations are accurate
