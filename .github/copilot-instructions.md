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

### 📋 Code Review Checklist

Before making any changes, verify:

- [ ] No `Math.random()` or simulated data generators
- [ ] No hardcoded emails, passwords, or API keys
- [ ] All credentials come from `process.env.*`
- [ ] Real API endpoints are used (not mock/fake data)
- [ ] No test users or sample data in seed scripts
- [ ] Database schema uses proper foreign keys and relations
- [ ] All sensitive data is properly encrypted (bcrypt for passwords)

## 1. The Big Picture: Architecture & Stack

This is a full-stack application built on the T3 stack principles, but with some key differences.

- **Framework**: Next.js 14 (App Router) with TypeScript.
- **Database**: PostgreSQL managed by Prisma ORM. The schema is the source of truth for our data models (`prisma/schema.prisma`).
- **Authentication**: NextAuth.js is used for authentication, configured with a `CredentialsProvider` for email/password logins. The core configuration is in `src/lib/auth.ts`.
- **Styling**: Tailwind CSS is used for styling. Global styles are in `src/app/globals.css`.
- **3D Graphics**: We use `react-three-fiber` for 3D visualizations. Note the custom webpack config in `next.config.mjs` for handling `.glsl` shader files.

## 2. Getting Started: Developer Workflow

The primary setup and development workflow is captured in `setup.sh`.

1.  **Installation**: Run `npm install` to install all dependencies.
2.  **Environment**: The script creates a `.env` file from `.env.example`. **You must manually add your `DATABASE_URL` for a PostgreSQL database.**
3.  **Database Migration**: Run `npx prisma migrate dev` to apply schema changes to your database.
4.  **Database Seeding**: Run `npm run seed` to populate the database with initial data. The seed script is `prisma/seed.ts`.
5.  **Run Dev Server**: Use `npm run dev` to start the Next.js development server.

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
