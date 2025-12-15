# M4Capital AI Agent Instructions

Welcome, agent! This guide provides the essential knowledge to be productive in the M4Capital codebase.

## ⚠️ CRITICAL SECURITY RULES - READ FIRST

### 🚫 NEVER Use Simulated or Fake Data

This is a **PRODUCTION APPLICATION**. Follow these rules strictly:

1. **NO Simulated Data**: Never use `Math.random()`, fake price generators, mock market data, or simulated trading signals
2. **NO Hardcoded Credentials**: Never hardcode emails, passwords, API keys, or wallet addresses in code
3. **NO Test/Sample Data**: Never create test users, sample portfolios, or fake balances in production code
4. **NO Placeholder Values**: Never use hardcoded values like "admin@example.com" or "password123" in actual logic

### ✅ ALWAYS Use Real Data Sources

1. **Real Market Data**: Use Binance WebSocket (`wss://stream.binance.com:9443`) for crypto prices
2. **Real APIs**: Use Frankfurter API for forex rates, NowPayments for crypto deposits
3. **Environment Variables**: All credentials, API keys, and configuration MUST come from `.env` files
4. **Database**: All user data, portfolios, and transactions MUST be stored in PostgreSQL via Prisma

### 🔒 Environment Variables Policy

**REQUIRED for all sensitive data:**

- Admin credentials: `ORIGIN_ADMIN_EMAIL`, `ORIGIN_ADMIN_PASSWORD`, `ORIGIN_ADMIN_NAME`
- Database: `DATABASE_URL`
- API Keys: `OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`, etc.
- Auth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

**NEVER:**

- Hardcode credentials in any file (even comments or documentation examples)
- Use placeholder emails like `admin@m4capital.com` in actual logic
- Commit `.env` files to git (only `.env.example` with fake placeholders)
- Create default/test accounts in production seeding

### 🚫 NEVER PERFORM AUTOMATIC GIT OPERATIONS

**CRITICAL RULE:** Never run git commands (commit, push, checkout, merge) automatically without explicit user request.

**FORBIDDEN actions:**

- ❌ `git commit` without user asking to commit
- ❌ `git push` without user asking to push
- ❌ `git checkout` without user asking to switch branches
- ❌ `git merge` without user asking to merge
- ❌ Any git operation in response to file changes or edits

**ONLY perform git operations when user explicitly says:**

- ✅ "push to github"
- ✅ "commit these changes"
- ✅ "merge to master"
- ✅ "push to both branches"

**When making code changes:**

- Make the edits ONLY
- DO NOT commit automatically
- DO NOT push automatically
- Wait for user to explicitly request git operations

### 🚫 NEVER PERFORM AUTOMATIC BUILD OPERATIONS

**CRITICAL RULE:** Never run build commands automatically without explicit user request.

**FORBIDDEN actions:**

- ❌ `npm run build` without user asking to build
- ❌ `npm run dev` without user asking to start dev server
- ❌ Running builds automatically after making changes
- ❌ Running builds to "verify" changes work

**ONLY run builds when user explicitly says:**

- ✅ "run build"
- ✅ "build the project"
- ✅ "check for errors"
- ✅ "run build and fix errors"

**When making code changes:**

- Make the edits ONLY
- DO NOT run build automatically
- DO NOT verify with build automatically
- Wait for user to explicitly request build operations

### ⚡ RAPID ERROR RESOLUTION

**CRITICAL RULE:** When errors are detected, fix them immediately without lengthy explanations.

**REQUIRED approach:**

1. **Dive straight into the solution** - No analysis paragraphs
2. **Fix errors on first detection** - Don't explain what the error is
3. **Make the edit immediately** - Use tools to fix, not describe
4. **Move to next error** - Chain fixes without commentary
5. **Only brief status updates** - "Fixed X, building..." maximum

### 📋 ALWAYS CREATE TODO LIST FOR MULTIPLE TASKS

**CRITICAL RULE:** When user requests multiple tasks/changes, ALWAYS create a todo list FIRST before starting any work.

**REQUIRED approach:**

1. **Identify all tasks** - Parse user request for all distinct items
2. **Create todo list immediately** - Use `manage_todo_list` tool before any edits
3. **Mark status correctly** - Start with all "not-started", mark "in-progress" when working
4. **Update on completion** - Mark each task "completed" as you finish it
5. **Work sequentially** - Complete one task at a time, updating status

**Examples of multiple task requests:**

- "fix the button and update the modal" → 2 tasks
- "remove X, add Y, and change Z styling" → 3 tasks
- Numbered lists or comma-separated items → Create corresponding todos

**Todo list format:**

```json
[
  {
    "id": 1,
    "title": "Short task name",
    "description": "Detailed description",
    "status": "not-started"
  },
  {
    "id": 2,
    "title": "Second task",
    "description": "Details",
    "status": "not-started"
  }
]
```

**NEVER skip the todo list when multiple tasks are requested.**

**FORBIDDEN responses:**

- ❌ Long explanations of what went wrong
- ❌ Analysis of why the error occurred
- ❌ Multiple paragraphs before fixing
- ❌ Describing the error instead of fixing it

**CORRECT workflow:**

- Error detected → Tool call to fix → Next error → Done

### 🐛 ALWAYS FIX DISCOVERED BUGS

**CRITICAL RULE:** When you discover bugs, errors, or issues during any task, ALWAYS add them to your todo list and fix them.

**REQUIRED approach:**

1. **Add discovered bugs to todo list** - Even if not part of original request
2. **Fix bugs immediately** - Don't leave bugs behind
3. **Track all issues** - Update todo list with discovered problems
4. **Complete all fixes** - Don't mark task complete until all related bugs are fixed
5. **Report fixes** - Briefly mention discovered and fixed bugs to user

**Examples of discovered bugs:**

- Wrong function signature causing errors
- Double-conversion issues in currency handling
- Case sensitivity bugs (lowercase vs uppercase keys)
- Missing null checks or validation
- Type mismatches

**NEVER leave discovered bugs unfixed. Always add them to the todo list and resolve them.**

### 🏆 ALWAYS USE FIRST-CLASS SOLUTIONS

**CRITICAL RULE:** Always respond and fix issues with first-class, most advanced, and production-ready solutions.

**REQUIRED approach:**

1. **Research best practices** - Check how similar problems are solved in the codebase first
2. **Use modern patterns** - Prefer latest Next.js, React, and TypeScript patterns
3. **Write maintainable code** - Code should be readable, documented, and easy to extend
4. **Consider edge cases** - Handle null, undefined, empty arrays, and error states
5. **Test your changes** - Mentally trace through the code flow to catch issues early

**Examples of first-class solutions:**

- Using TypeScript strict typing instead of `any`
- Proper error handling with try/catch and user feedback
- Optimistic UI updates with proper rollback
- Debouncing expensive operations
- Using React Query/SWR patterns for data fetching

### 🔒 NEVER BREAK EXISTING CODE

**CRITICAL RULE:** Before making ANY changes, understand the impact on other parts of the codebase.

**REQUIRED approach:**

1. **Check dependencies** - Use `grep_search` to find all usages of code you're modifying
2. **Understand the flow** - Trace how data flows through components and APIs
3. **Test in isolation** - Make sure your changes don't break existing functionality
4. **Use backward-compatible changes** - Add optional parameters, don't remove required ones
5. **Maintain type contracts** - Don't change return types or function signatures without updating callers

**Before modifying a function, always check:**

```bash
# Find all usages
grep -rn "functionName" src/
grep -rn "ComponentName" src/

# Find imports
grep -rn "import.*functionName" src/
```

**WARNING patterns to avoid:**

- ❌ Changing function parameters without updating all callers
- ❌ Modifying API response shape without updating frontend consumers
- ❌ Removing fields from types that are used elsewhere
- ❌ Changing default values that other code depends on
- ❌ Breaking existing working code to "improve" it

**CORRECT approach:**

- Add new parameters with default values
- Extend types with optional fields
- Create new functions instead of modifying widely-used ones
- Test changes against existing use cases

### 📋 Code Review Checklist

Before making any changes, verify:

- [ ] No `Math.random()` or simulated data generators
- [ ] No hardcoded emails, passwords, or API keys
- [ ] All credentials come from `process.env.*`
- [ ] Real API endpoints are used (not mock/fake data)
- [ ] No test users or sample data in seed scripts
- [ ] Database schema uses proper foreign keys and relations
- [ ] All sensitive data is properly encrypted (bcrypt for passwords)
- [ ] NOT performing automatic git operations without user request
- [ ] NOT performing automatic build operations without user request

### 🔍 ALWAYS CHECK EXISTING CODE BEFORE CREATING NEW

**CRITICAL RULE:** Before creating any new component, function, constant, or utility, ALWAYS search the codebase first.

**REQUIRED approach:**

1. **Search first** - Use `grep_search` or `semantic_search` to find existing implementations
2. **Check shared utilities** - Look in `src/lib/` for existing utility functions
3. **Check shared components** - Look in `src/components/` for reusable components
4. **Check constants** - Look for existing constant files before creating duplicates
5. **Reuse existing code** - Import and use existing implementations instead of recreating

**Shared utility locations:**

| Category           | Location                             | Examples                                                                     |
| ------------------ | ------------------------------------ | ---------------------------------------------------------------------------- |
| Currency utilities | `src/lib/currencies.ts`              | `getCurrencySymbol`, `formatCurrency`, `convertCurrency`, `getExchangeRates` |
| Crypto constants   | `src/lib/crypto-constants.ts`        | `SUPPORTED_CRYPTOS`, `CRYPTO_METADATA`, `getCryptoMetadata`, `formatTimeAgo` |
| API responses      | `src/lib/middleware/errorHandler.ts` | `createSuccessResponse`, `createErrorResponse`                               |
| Rate limiting      | `src/lib/middleware/ratelimit.ts`    | `rateLimiters`                                                               |
| Prisma client      | `src/lib/prisma.ts`                  | `prisma`                                                                     |
| Auth config        | `src/lib/auth.ts`                    | `authOptions`                                                                |
| Telegram helpers   | `src/lib/telegram-bot-helper.ts`     | `formatCurrency`, `convertCurrency` (async)                                  |

**Before creating:**

```typescript
// ❌ WRONG - Creating local duplicate
const getCryptoMetadata = (symbol: string) => { ... }
const formatTimeAgo = (date: Date) => { ... }
const SUPPORTED_CRYPTOS = { btc: {...}, eth: {...} }

// ✅ CORRECT - Import from shared location
import { getCryptoMetadata, formatTimeAgo, SUPPORTED_CRYPTOS } from "@/lib/crypto-constants";
import { getCurrencySymbol, formatCurrency } from "@/lib/currencies";
```

**FORBIDDEN patterns:**

- ❌ Creating local `getCurrencySymbol` when `@/lib/currencies` exists
- ❌ Creating local `formatTimeAgo` when `@/lib/crypto-constants` exists
- ❌ Defining `SUPPORTED_CRYPTOS` locally when shared constant exists
- ❌ Creating local crypto metadata objects when `CRYPTO_METADATA` exists
- ❌ Creating utility functions without first checking if they exist

**Search commands before creating:**

```bash
# Check for existing functions
grep -rn "function functionName" src/
grep -rn "const functionName" src/
grep -rn "export.*functionName" src/lib/

# Check for existing constants
grep -rn "CONSTANT_NAME" src/
```

## 1. The Big Picture: Architecture & Stack

This is a full-stack application built on the T3 stack principles, but with some key differences.

- **Framework**: Next.js 16 (App Router) with TypeScript and Turbopack as the default bundler.
- **React**: React 19 with Server Actions, `useOptimistic`, `useTransition`, and the `use()` hook.
- **Database**: PostgreSQL managed by Prisma ORM. The schema is the source of truth for our data models (`prisma/schema.prisma`).
- **Authentication**: NextAuth.js is used for authentication, configured with a `CredentialsProvider` for email/password logins. The core configuration is in `src/lib/auth.ts`.
- **Styling**: Tailwind CSS is used for styling. Global styles are in `src/app/globals.css`.
- **3D Graphics**: We use `react-three-fiber` for 3D visualizations. Note: `.npmrc` has `legacy-peer-deps=true` for React 19 compatibility.

### React 19 Patterns - MUST USE

**Server Actions (preferred over API routes for mutations):**

```typescript
// src/actions/crypto-actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function buyCryptoAction(symbol: string, amount: number, price: number) {
  // Direct database operations
  await prisma.trade.create({ ... });
  revalidatePath("/dashboard");
  return { success: true };
}
```

**useOptimistic for instant UI feedback:**

```typescript
"use client";
import { useOptimistic, useTransition } from "react";

function BuyModal() {
  const [isPending, startTransition] = useTransition();
  const [optimisticBalance, setOptimisticBalance] = useOptimistic(balance);

  const handleBuy = () => {
    startTransition(async () => {
      setOptimisticBalance(balance - cost); // Instant UI update
      await buyCryptoAction(symbol, amount, price); // Server action
    });
  };
}
```

**Loading States with Suspense:**

```typescript
import { Suspense } from "react";
import { PortfolioGridSkeleton } from "@/components/ui/LoadingSkeletons";

export default function Dashboard() {
  return (
    <Suspense fallback={<PortfolioGridSkeleton />}>
      <PortfolioGrid />
    </Suspense>
  );
}
```

### Key Files for React 19 Patterns

| File | Purpose |
|------|---------|
| `src/actions/crypto-actions.ts` | Server Actions for buy/sell crypto |
| `src/actions/p2p-actions.ts` | Server Action for P2P transfers |
| `src/components/ui/LoadingSkeletons.tsx` | Suspense-ready skeleton components |
| `src/hooks/useNavigationTransition.tsx` | View Transitions API hook |

### React 19 Rules

1. **NO useMemo/useCallback** - React Compiler handles memoization automatically
2. **NO forwardRef** - Pass `ref` as a regular prop
3. **Prefer Server Actions** over API routes for mutations
4. **Use useOptimistic** for instant UI feedback before server response
5. **Use useTransition** for non-blocking state updates
6. **Wrap async components** in Suspense with skeleton fallbacks

## 2. Getting Started: Developer Workflow

The primary setup and development workflow is captured in `setup.sh`.

1.  **Installation**: Run `npm install` (uses `.npmrc` with `legacy-peer-deps=true` for React 19).
2.  **Environment**: The script creates a `.env` file from `.env.example`. **You must manually add your `DATABASE_URL` for a PostgreSQL database.**
3.  **Database Migration**: Run `npx prisma migrate dev` to apply schema changes to your database.
4.  **Database Seeding**: Run `npm run seed` to populate the database with initial data. The seed script is `prisma/seed.ts`.
5.  **Run Dev Server**: Use `npm run dev` to start the Next.js development server (Turbopack enabled by default).

## 3. Key Codebase Patterns & Conventions

### Authentication and Authorization

- **Credentials-based**: We use email and password, not OAuth providers. The authorization logic is in `src/lib/auth.ts` within the `CredentialsProvider`.
- **User Roles**: The `User` model in `prisma/schema.prisma` has a `role` field. This is critical for authorization logic. When extending user functionality, ensure you check this role.
- **Signup**: New users are created via the API endpoint at `src/app/api/auth/signup/route.ts`, which hashes the password using `bcrypt`.

### Database and Prisma

- **Schema First**: Always modify `prisma/schema.prisma` to change data models.
- **Migrations**: After changing the schema, create a new migration by running `npx prisma migrate dev --name <migration-name>`.
- **Prisma Client**: The Prisma client is instantiated in `src/lib/prisma.ts` and should be imported from there in any backend service or API route.

### API Routes

- API endpoints follow the Next.js App Router convention and are located in `src/app/api/`.
- For example, the logic to update a user by an admin is at `src/app/api/admin/update-user/route.ts`.

### Frontend and UI

- **Component Structure**: Components are organized into `client` (interactive, client-side rendered) and `layout` (structural) folders within `src/components`.
- **3D Scenes**: The `src/components/client/ThreeScene.tsx` is the entry point for our `react-three-fiber` 3D graphics. Any work on 3D visualizations will likely involve this component and its children.
- **Routing**: The app uses the Next.js App Router. Pages are defined by `page.tsx` files within the `src/app` directory. Route groups like `(auth)` and `(dashboard)` are used to organize routes and share layouts.

### 🖼️ Full-Screen Modals - MUST USE PORTALS

**CRITICAL RULE:** Full-screen modals MUST use React Portals to render at `document.body` level.

**WHY:** The dashboard layout has nested containers with overflow, padding, and stacking contexts. Modals rendered inside these containers will NOT cover the full viewport on mobile devices - they'll appear below the header area.

**REQUIRED for all full-screen modals:**

```typescript
import ReactDOM from "react-dom";

// ✅ CORRECT - Portal to document.body
const FullScreenModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[100] min-h-screen w-screen bg-gray-900">
      {children}
    </div>,
    document.body
  );
};

// ❌ WRONG - Regular fixed positioning (won't cover header on mobile)
const BrokenModal = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return <div className="fixed inset-0 z-50 bg-gray-900">{children}</div>;
};
```

**Key points:**

1. **Import ReactDOM**: `import ReactDOM from "react-dom";`
2. **Use createPortal**: `ReactDOM.createPortal(content, document.body)`
3. **Explicit positioning**: Use `top-0 left-0 right-0 bottom-0` not just `inset-0`
4. **High z-index**: Use `z-[100]` to ensure it covers all dashboard elements
5. **Full dimensions**: Add `min-h-screen w-screen` for safety

**Dashboard layout context:**

- Header is rendered BEFORE main content area
- Main has `p-2 sm:p-4` padding
- Modals inside main won't reach viewport edges without portals

## 4. Production Security Guidelines

### Database Seeding (`prisma/seed.ts`)

**CRITICAL RULES:**

- ✅ **ONLY** create admin user from environment variables
- ✅ Admin uses: `ORIGIN_ADMIN_EMAIL`, `ORIGIN_ADMIN_PASSWORD`, `ORIGIN_ADMIN_NAME`
- ✅ Admin portfolio starts with **zero balance** and **empty assets**
- ❌ **NEVER** create test users in seed script
- ❌ **NEVER** create sample data (fake balances, fake crypto assets)
- ❌ **NEVER** hardcode any credentials

**Acceptable seed.ts structure:**

```typescript
// ✅ CORRECT - Uses env vars, no fake data
const adminEmail = process.env.ORIGIN_ADMIN_EMAIL;
const adminPassword = await bcrypt.hash(process.env.ORIGIN_ADMIN_PASSWORD, 10);
const adminUser = await prisma.user.create({
  data: {
    name: process.env.ORIGIN_ADMIN_NAME || "Admin",
    email: adminEmail,
    password: adminPassword,
    role: "ADMIN",
    portfolio: { create: { balance: 0, assets: [] } }, // Empty portfolio
  },
});

// ❌ WRONG - Hardcoded, fake data
const admin = await prisma.user.create({
  data: {
    email: "admin@example.com", // WRONG: Hardcoded
    password: await bcrypt.hash("password123", 10), // WRONG: Hardcoded
    portfolio: {
      create: {
        balance: 1000000, // WRONG: Fake money
        assets: [{ symbol: "BTC", amount: 10 }], // WRONG: Fake crypto
      },
    },
  },
});
```

### API Routes Security

**ALWAYS:**

- Validate environment variables before use
- Return proper error responses if env vars missing
- Use `process.env.*` for all sensitive configuration
- Sanitize and validate all user inputs

**Example:**

```typescript
// ✅ CORRECT
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  return NextResponse.json(
    { error: "API key not configured" },
    { status: 500 }
  );
}

// ❌ WRONG
const apiKey = "sk-hardcoded-api-key"; // NEVER do this
```

### Real-Time Data Sources

**Crypto Prices:**

- ✅ Primary: Binance WebSocket (`wss://stream.binance.com:9443/stream`)
- ✅ Fallback: Binance REST API (`https://api.binance.com/api/v3/ticker/24hr`)
- ❌ NEVER use `Math.random()` for prices

**Forex Rates:**

- ✅ Use: Frankfurter API (`https://api.frankfurter.app/latest`)
- ❌ NEVER simulate exchange rates

**Crypto Deposits:**

- ✅ Use: NowPayments API for Bitcoin/crypto deposits
- ❌ NEVER use hardcoded wallet addresses
- ❌ NEVER create fake deposit records

### User Management

**Admin Creation:**

- ✅ Admin created ONLY from env vars during seed
- ✅ One admin per environment (production, staging, dev)
- ❌ NEVER create multiple admin accounts in code
- ❌ NEVER hardcode admin credentials anywhere

**User Registration:**

- ✅ All users register via `/api/auth/signup`
- ✅ Passwords hashed with `bcryptjs` (10 rounds minimum)
- ✅ Email verification required (unless admin)
- ❌ NEVER create users with hardcoded data
- ❌ NEVER skip password hashing

### Environment Variables Management

**Required Variables:**

```bash
# Database
DATABASE_URL="postgresql://..."

# Admin (Production)
ORIGIN_ADMIN_EMAIL="admin@yourdomain.com"
ORIGIN_ADMIN_PASSWORD="secure-random-password"
ORIGIN_ADMIN_NAME="Super Admin"

# Authentication
NEXTAUTH_SECRET="random-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# API Keys
OPENAI_API_KEY="sk-..."
TELEGRAM_BOT_TOKEN="..."
NOWPAYMENTS_API_KEY="..."
```

**Best Practices:**

- ✅ Keep `.env` in `.gitignore`
- ✅ Update `.env.example` with all required variables (use placeholders)
- ✅ Validate env vars at application startup
- ✅ Use different credentials per environment (dev/staging/prod)
- ❌ NEVER commit `.env` files to git
- ❌ NEVER use production credentials in development

### Code Examples - DO vs DON'T

**User Creation:**

```typescript
// ✅ DO: Use env vars
const email = process.env.ORIGIN_ADMIN_EMAIL;
const password = await bcrypt.hash(process.env.ORIGIN_ADMIN_PASSWORD, 10);

// ❌ DON'T: Hardcode
const email = "admin@example.com";
const password = await bcrypt.hash("password123", 10);
```

**Market Data:**

```typescript
// ✅ DO: Fetch from real API
const response = await fetch(
  "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
);
const data = await response.json();
const price = parseFloat(data.price);

// ❌ DON'T: Generate random
const price = 50000 + Math.random() * 1000;
```

**Portfolio Initialization:**

```typescript
// ✅ DO: Start empty
portfolio: { create: { balance: 0, assets: [] } }

// ❌ DON'T: Add fake data
portfolio: { create: {
  balance: 100000,
  assets: [{ symbol: "BTC", amount: 5 }]
}}
```

## 5. Testing Guidelines

### Local Development

- Use separate `.env` file for local development
- Test with small amounts if testing payments
- Never use production database for testing
- Clear test data after development

### Production Deployment

- Verify all environment variables are set
- Run database migrations before deployment
- Seed database only once (check if admin exists first)
- Monitor logs for environment variable errors
- Rotate credentials regularly

## 6. Common Pitfalls to Avoid

1. **Hardcoded Credentials**: Always check for hardcoded emails, passwords, API keys
2. **Simulated Data**: Verify all market data comes from real APIs
3. **Test Users in Production**: Never create test accounts in production seed
4. **Sample Balances**: Never initialize users with fake money or crypto
5. **Duplicate Admin Scripts**: Don't create multiple scripts that do the same thing
6. **Inconsistent Emails**: Use ONE admin email from env vars everywhere
7. **Missing Env Var Checks**: Always validate env vars before use
8. **Committed Secrets**: Never commit `.env` files or secrets to git

## 7. Security Incident Response

If you discover:

- Hardcoded credentials in code
- Simulated data in production
- Missing environment variable validation
- Test data in production database

**Immediate Actions:**

1. Remove the hardcoded/fake data immediately
2. Replace with environment variables
3. Update `.env.example` with proper documentation
4. Commit changes with clear security fix message
5. Rotate any exposed credentials
6. Audit for similar issues in other files

---

## 8. PRODUCTION-ONLY CODE RULES

### Database Seed Scripts

**ABSOLUTE REQUIREMENTS:**

1. **Single Admin Only**

   - Create ONLY ONE admin user from environment variables
   - Check if admin exists before creating (idempotent)
   - Exit gracefully if admin already exists

2. **Zero Balance Start**

   - Admin portfolio MUST start with `balance: 0`
   - Admin assets MUST be empty array: `assets: []`
   - NO sample crypto holdings
   - NO fake money

3. **Environment Variables Only**

   ```typescript
   // REQUIRED: ALL three env vars
   ORIGIN_ADMIN_EMAIL="admin@yourdomain.com"
   ORIGIN_ADMIN_PASSWORD="secure-password"
   ORIGIN_ADMIN_NAME="Admin Name"

   // FORBIDDEN: Any hardcoded values
   ❌ email: "admin@anything.com"
   ❌ password: "password123"
   ❌ name: "Admin User"
   ```

4. **NO Test Data**
   - ❌ NO test users
   - ❌ NO sample deposits
   - ❌ NO mock transactions
   - ❌ NO fake portfolios
   - ❌ NO development-only data

### API Route Requirements

**MANDATORY for ALL API routes:**

1. **Environment Variable Validation**

   ```typescript
   // ✅ ALWAYS validate before use
   const apiKey = process.env.SOME_API_KEY;
   if (!apiKey) {
     return NextResponse.json(
       { error: "Configuration missing" },
       { status: 500 }
     );
   }
   ```

2. **Authentication Required**

   - Check user session for protected routes
   - Verify admin role for admin-only endpoints
   - Return 401 Unauthorized if not authenticated
   - Return 403 Forbidden if insufficient permissions

3. **Input Validation**
   - Validate ALL user inputs
   - Sanitize data before database operations
   - Return 400 Bad Request for invalid inputs
   - Use TypeScript types for type safety

### Real Data Sources - NO EXCEPTIONS

**Crypto Prices:**

```typescript
// ✅ CORRECT - Real Binance WebSocket
const ws = new WebSocket("wss://stream.binance.com:9443/stream");

// ✅ CORRECT - Real Binance REST API
const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");

// ❌ FORBIDDEN - ANY simulation
const price = 50000 + Math.random() * 1000; // NEVER
const mockData = { price: 50000, change: 2.5 }; // NEVER
```

**Forex Rates:**

```typescript
// ✅ CORRECT - Real Frankfurter API
const response = await fetch("https://api.frankfurter.app/latest");

// ❌ FORBIDDEN - ANY hardcoded rates
const rates = { EUR: 1.1, GBP: 1.3 }; // NEVER
```

**Crypto Deposits:**

```typescript
// ✅ CORRECT - Real NowPayments API
const payment = await createNowPayment(amount, currency);

// ❌ FORBIDDEN - ANY fake addresses
const address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"; // NEVER
```

### Credential Management

**ZERO TOLERANCE for hardcoded credentials:**

1. **Email Addresses**

   - ❌ NEVER: `"admin@m4capital.com"`
   - ❌ NEVER: `"user@test.com"`
   - ❌ NEVER: `"test@example.com"` in actual logic
   - ✅ ALWAYS: `process.env.ORIGIN_ADMIN_EMAIL`

2. **Passwords**

   - ❌ NEVER: `"password123"`
   - ❌ NEVER: `"admin123"`
   - ❌ NEVER: Any hardcoded password value
   - ✅ ALWAYS: `process.env.ORIGIN_ADMIN_PASSWORD`

3. **API Keys**

   - ❌ NEVER: `"sk-hardcoded-key"`
   - ❌ NEVER: Any string that looks like an API key
   - ✅ ALWAYS: `process.env.OPENAI_API_KEY`

4. **Wallet Addresses**
   - ❌ NEVER: Hardcoded Bitcoin/crypto addresses
   - ✅ ALWAYS: Generated from payment provider API

### Mock/Test Data Detection

**FORBIDDEN patterns to NEVER use:**

```typescript
// ❌ FORBIDDEN - Random number generators for real data
Math.random()
Math.floor(Math.random() * 100)
faker.datatype.number()

// ❌ FORBIDDEN - Mock data objects
const mockUsers = [...]
const sampleData = [...]
const testAccounts = [...]

// ❌ FORBIDDEN - Hardcoded arrays of data
const prices = [50000, 51000, 49000]
const users = [{ email: "test@..." }]

// ❌ FORBIDDEN - Simulated updates
setInterval(() => {
  setPrice(Math.random() * 1000); // NEVER
}, 1000);

// ❌ FORBIDDEN - Test/demo flags in production
if (isDemoMode) { ... } // Remove demo modes entirely
```

### Code Review - STOP and CHECK

**Before committing ANY code, verify:**

- [ ] Zero uses of `Math.random()` for real data
- [ ] Zero hardcoded email addresses (except `.example.com` in docs)
- [ ] Zero hardcoded passwords
- [ ] Zero hardcoded API keys
- [ ] Zero hardcoded wallet addresses
- [ ] All credentials from `process.env.*`
- [ ] All market data from real APIs
- [ ] No test users in seed scripts
- [ ] No sample balances or fake assets
- [ ] Environment variables validated before use
- [ ] Proper error handling when env vars missing
- [ ] No `TODO` comments for security-critical code
- [ ] No commented-out credentials
- [ ] `.env` file in `.gitignore`
- [ ] `.env.example` updated with all required vars

### File-Specific Rules

**`prisma/seed.ts`:**

- ONLY create admin from env vars
- Check if admin exists first
- Zero balance, empty assets
- NO test users, NO sample data
- Exit with error if env vars missing

**`scripts/fix-admin.ts`:**

- ONLY use env vars
- Import `dotenv` to load `.env`
- Validate env vars before use
- NO hardcoded credentials

**`src/app/api/**/route.ts`:\*\*

- Validate env vars at top of handler
- Return 500 if env vars missing
- Authenticate user session
- Validate all inputs
- Use Prisma client from `@/lib/prisma`

**`src/components/client/*`:**

- Fetch data from real APIs
- NO Math.random() for prices
- NO hardcoded market data
- Use WebSocket for real-time updates
- Fallback to REST API if WebSocket fails

### Environment Variable Checklist

**REQUIRED in production `.env`:**

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Admin Credentials (CHANGE IN PRODUCTION)
ORIGIN_ADMIN_EMAIL="admin@yourdomain.com"
ORIGIN_ADMIN_PASSWORD="<generate-secure-random-32-char-password>"
ORIGIN_ADMIN_NAME="System Administrator"

# NextAuth
NEXTAUTH_SECRET="<generate-random-secret>"
NEXTAUTH_URL="https://yourdomain.com"

# API Keys
OPENAI_API_KEY="sk-..."
TELEGRAM_BOT_TOKEN="..."
NOWPAYMENTS_API_KEY="..."

# Optional
NODE_ENV="production"
```

**FORBIDDEN in `.env.example`:**

- Real passwords
- Real API keys
- Real email addresses (use `admin@yourdomain.com` placeholder)
- Production database URLs

---

## 9. Deployment Checklist

**Before deploying to production:**

1. **Environment Variables**

   - [ ] All required env vars set in hosting platform
   - [ ] No placeholder values in production
   - [ ] Credentials rotated from development
   - [ ] NEXTAUTH_SECRET is random and secure

2. **Database**

   - [ ] Migrations run successfully
   - [ ] Seed script executed ONCE
   - [ ] Admin user created from env vars
   - [ ] No test data in database

3. **Security**

   - [ ] No hardcoded credentials in code
   - [ ] All API keys from environment
   - [ ] `.env` file not in git
   - [ ] Real data sources verified

4. **API Integrations**
   - [ ] Binance WebSocket working
   - [ ] Frankfurter API accessible
   - [ ] NowPayments configured
   - [ ] No mock/fake data in responses

---

## 10. Emergency Response

**If production breaks due to missing env vars:**

1. **Identify the issue**

   - Check application logs
   - Look for "env var not set" errors
   - Verify which variable is missing

2. **Fix immediately**

   - Add missing env var to hosting platform
   - Restart application
   - Verify functionality restored

3. **Prevent recurrence**
   - Update `.env.example` with variable
   - Document in deployment guide
   - Add validation in application startup
   - Create pre-deployment checklist

**If hardcoded credentials discovered:**

1. **Immediate action**

   - Remove from code
   - Replace with env vars
   - Rotate exposed credentials
   - Deploy fix urgently

2. **Audit**

   - Search entire codebase
   - Check git history
   - Review all similar files
   - Document findings

3. **Prevention**
   - Add pre-commit hooks
   - Enable secret scanning
   - Team training on security
   - Regular security audits

---

## 11. Build Error Reporting Protocol

**CRITICAL INSTRUCTION FOR BUILD FAILURES:**

When a build fails (`npm run build`, `npm run lint`, or similar), you MUST:

### Step-by-Step Process:

1. **STOP and ANALYZE** the error output first

   - Read the complete error message
   - Identify ALL files and line numbers with errors
   - Note the type of each error (syntax, type, import, etc.)

2. **EXPLAIN to the user** what is causing the build to fail:

   ```
   **Build Error Found:**
   The build is failing in `src/app/api/example/route.ts` at line 42 because
   TypeScript is reporting "Property 'name' does not exist on type 'User'".
   This occurs because we're trying to access a property that isn't defined
   in the User type definition.
   ```

3. **ONLY AFTER explaining**, proceed to fix the error

   - Fix all related errors in one batch if possible
   - Use `multi_replace_string_in_file` for multiple independent fixes

4. **Then run the build again** to verify the fix worked

### What to Report:

- **File path and line number** where error occurs
- **Type of error**: Syntax error, type error, import error, null check, etc.
- **Root cause**: What the code is trying to do that's invalid
- **Impact**: Why this is breaking the build

### Example:

**CORRECT:**

```
**Build Error Analysis:**
The build is failing because of a TypeScript null safety check in
`src/app/api/cron/process-confirmations/route.ts` at line 119.

Error: "Object is possibly 'null'"

Cause: We're accessing `assets[existingAssetIndex].amount` without checking
if the array element exists. TypeScript's strict null checking requires we
verify the element isn't null before accessing its properties.

Fix: Add a null check: `if (existingAssetIndex >= 0 && assets[existingAssetIndex])`
```

**INCORRECT:**

```
[Immediately runs fix without explaining]
```

### Never:

- Immediately fix errors without explanation
- Run multiple build attempts without diagnosing the issue first
- Ignore warning messages that might become errors
- Fix errors one at a time when they could be batched
- Skip explaining the root cause to the user

### Build Warnings:

- Always report warnings even if build succeeds
- Explain which warnings are safe to ignore vs which need fixing
- Prioritize fixing import warnings (often become errors in production)

---

## 12. Currency System Rules

### Database Storage

**Portfolio balance stores ORIGINAL currency:**

- `balance` - The amount in the user's original currency
- `balanceCurrency` - The currency code (e.g., "EUR", "USD", "GBP")

**Example:**

- User deposits €100 → `balance: 100, balanceCurrency: "EUR"`
- Balance does NOT fluctuate with exchange rates
- User always sees their original deposited amount

### Currency Context Functions

**CRITICAL: `formatAmount()` already converts USD → preferred currency internally!**

```typescript
// ✅ CORRECT - formatAmount handles conversion
formatAmount(valueInUSD, 2);

// ❌ WRONG - Double conversion!
formatAmount(convertAmount(valueInUSD), 2);
```

**Function Reference:**

| Function                            | Input              | Output                             | Use Case                     |
| ----------------------------------- | ------------------ | ---------------------------------- | ---------------------------- |
| `formatAmount(amountUSD, decimals)` | USD number         | Formatted string (e.g., "€100.00") | Display values to user       |
| `convertAmount(amountUSD)`          | USD number         | Number in preferred currency       | When you need raw number     |
| `convertAmount(amount, true)`       | Preferred currency | USD number                         | Converting user input to USD |

### Display Logic

**When showing portfolio balance:**

1. If `balanceCurrency` matches user's `preferredCurrency` → show `balance` directly
2. If different → convert from `balanceCurrency` to `preferredCurrency`

**NEVER double-convert. Check if value is already in user's currency first.**

### Common Mistakes to Avoid

```typescript
// ❌ WRONG - Double conversion
{
  formatAmount(convertAmount(userBalance), 2);
}

// ✅ CORRECT - formatAmount already converts
{
  formatAmount(userBalance, 2);
}

// ❌ WRONG - Assuming all values are USD
const total = balance1 + balance2; // If different currencies!

// ✅ CORRECT - Convert to common currency first
const total =
  convertToUSD(balance1, currency1) + convertToUSD(balance2, currency2);
```

---

## 13. Amount Input & API Storage Rules

### ⚠️ CRITICAL: All API Storage Must Use USD

**All monetary values stored in the database or sent to APIs MUST be in USD.**

This is because:

1. Crypto prices from APIs (Binance, etc.) are always in USD
2. Trade records store `entryPrice` in USD
3. Transactions API returns `value` in USD for proper conversion on frontend

### User Input Handling

**When user enters an amount in their preferred currency (e.g., R$10,000):**

```typescript
// ✅ CORRECT - Convert user input to USD before using
const userInputAmount = parseFloat(amount); // e.g., 10000 (BRL)
const usdValue = convertAmount(userInputAmount, true); // Convert BRL → USD

// Send USD values to API
fetch("/api/crypto/buy", {
  body: JSON.stringify({
    symbol: "BTC",
    amount: cryptoAmount, // Amount of crypto to buy
    price: currentPrice, // USD price per unit (from market API)
  }),
});

// ❌ WRONG - Sending user's currency as if it were USD
const usdValue = parseFloat(amount); // This is BRL, not USD!
price: usdValue / cryptoAmount; // Wrong! This calculates price in BRL, not USD
```

### Crypto Amount Calculation

**When calculating how much crypto to buy/sell:**

```typescript
// ✅ CORRECT - Convert user's currency to USD, then divide by USD price
const userInputAmount = parseFloat(amount); // User's input in their currency
const usdAmount = convertAmount(userInputAmount, true); // Convert to USD
const cryptoAmount = usdAmount / usdPrice; // Divide USD by USD price

// ❌ WRONG - Dividing user's currency by USD price (mixing currencies!)
const cryptoAmount = parseFloat(amount) / usdPrice; // BRL / USD = nonsense!
```

### Notification Storage

**When creating notifications for crypto transactions:**

```typescript
// ✅ CORRECT - Store pre-converted display amount with user's currency as asset
const displayAmount = Math.round(convertedAmount * 100) / 100;
await prisma.notification.create({
  data: {
    amount: displayAmount, // Pre-converted to user's currency
    asset: userCurrency, // "BRL", "EUR", etc. (NOT "BTC"!)
    message: `Purchased 0.01 BTC for R$500.00`,
  },
});

// ❌ WRONG - Storing USD amount with crypto symbol (causes double-conversion)
await prisma.notification.create({
  data: {
    amount: usdAmount, // USD value
    asset: "BTC", // Crypto symbol - frontend will try to convert USD again!
  },
});
```

### Trade Record Storage

**Trade records store USD values for proper historical tracking:**

```typescript
// ✅ CORRECT - Store USD price and quantity
prisma.trade.create({
  data: {
    entryPrice: new Decimal(usdPrice), // USD price per unit
    quantity: new Decimal(cryptoAmount),
    // value = entryPrice × quantity = USD value
  },
});
```

### Frontend Display Rules

**History Tab and Transaction Details:**

```typescript
// For FIAT deposits (BRL, EUR, USD, etc.) - value is already in user's currency
if (FIAT_CURRENCIES.has(assetSymbol)) {
  return formatCurrencyUtil(activity.value, assetSymbol, 2); // No conversion
}

// For CRYPTO transactions - value is in USD, needs conversion
return formatAmount(activity.value, 2); // Converts USD → user's currency
```

### Variable Naming Convention

**ALWAYS name variables according to their actual currency:**

```typescript
// ✅ CORRECT - Clear naming
const userInputBRL = parseFloat(amount); // User's input in BRL
const valueUSD = convertAmount(userInputBRL, true); // Converted to USD
const priceUSD = getCurrentPrice(); // Price from API is always USD

// ❌ WRONG - Misleading names
const usdValue = parseFloat(amount); // This is NOT USD if user's currency is BRL!
const price = userInputBRL / cryptoAmount; // This is BRL/crypto, not USD/crypto!
```

### Checklist for Buy/Sell Modals

Before submitting to API, verify:

- [ ] User's input amount is converted to USD using `convertAmount(input, true)`
- [ ] Crypto price is from market API (always USD)
- [ ] Crypto amount = USD value / USD price
- [ ] API receives USD values for `price` and calculates `totalCost` in USD
- [ ] Notification stores pre-converted display amount with user's currency code

### Common Bugs to Avoid

1. **Wrong crypto amount calculation:**

   - Bug: `cryptoAmount = parseFloat(userInput) / usdPrice`
   - Fix: `cryptoAmount = convertAmount(parseFloat(userInput), true) / usdPrice`

2. **Wrong price stored in trades:**

   - Bug: `price: userCurrencyValue / cryptoAmount` (stores BRL price as USD)
   - Fix: `price: usdPrice` (use the actual USD price from market API)

3. **Double-conversion in display:**

   - Bug: `formatAmount(convertAmount(value), 2)` (converts twice)
   - Fix: `formatAmount(value, 2)` or `convertAmount(value)` (pick one)

4. **Notification shows wrong currency:**
   - Bug: Storing `asset: 'BTC'` with USD amount (frontend converts again)
   - Fix: Store `asset: userCurrency` with pre-converted display amount

---
