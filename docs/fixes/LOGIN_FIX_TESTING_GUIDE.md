# Quick Testing Guide - Login Fix

## Immediate Test (No Database Required)

The code changes have been made. Here's what to test:

### 1. Test Existing User Login ✅

**User:** Any user created before November 1, 2025

```bash
# Try logging in with:
Email: [existing user email]
Password: [their correct password]

Expected Result: ✅ Login successful
```

**Why it works now:**

- The auth check now allows users created before Nov 1, 2025 to login
- Even if `isEmailVerified: false`, they can still access their account

### 2. Test New User Flow 📧

**User:** Newly created user (after signup)

```bash
# Sign up first
POST /api/auth/signup
{
  "email": "newuser@test.com",
  "password": "password123",
  "name": "Test User"
}

# Try logging in immediately
Expected Result: ❌ "Please verify your email address before logging in"

# Verify email with code
POST /api/auth/verify-code
{
  "email": "newuser@test.com",
  "code": "123456"
}

# Try logging in again
Expected Result: ✅ Login successful
```

### 3. Test Admin Login ⚡

**User:** Admin account

```bash
Email: [admin email]
Password: [admin password]

Expected Result: ✅ Login successful (always works)
```

## Database Migration (When Database is Available)

Run this script to auto-verify all existing users:

```bash
npx tsx scripts/verify-existing-users.js
```

**What it does:**

- Finds all users with `isEmailVerified: false` created before Nov 1, 2025
- Sets `isEmailVerified: true` for all of them
- Logs the updated users

## Admin Tools

### Check User Verification Status

```bash
GET /api/admin/verify-user?email=user@example.com
```

**Response:**

```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "isEmailVerified": true,
    "createdAt": "2025-10-15T10:30:00.000Z",
    "role": "USER"
  }
}
```

### Manually Verify a User

```bash
POST /api/admin/verify-user
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User email verified successfully",
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "isEmailVerified": true
  }
}
```

## Troubleshooting Quick Fixes

### User still can't login?

**Check 1: Browser Console**

```javascript
// Open browser console and look for:
"🔐 SignIn callback triggered";
"❌ Error: EMAIL_NOT_VERIFIED";
```

**Check 2: Date Threshold**

```typescript
// In src/lib/auth.ts, line ~55
const emailVerificationStartDate = new Date("2025-11-01");
// Make sure this date is AFTER the user's creation date
```

**Check 3: User's Created Date**

```sql
-- Check in database
SELECT email, createdAt, isEmailVerified FROM "User" WHERE email = 'user@example.com';
```

### Quick Fix: Adjust Date Threshold

If you want ALL users to login immediately (regardless of verification):

```typescript
// In src/lib/auth.ts
const emailVerificationStartDate = new Date("2099-01-01"); // Far future date
```

This effectively disables email verification enforcement.

### Quick Fix: Manually Verify User via Database

If you have database access:

```sql
-- Verify specific user
UPDATE "User"
SET "isEmailVerified" = true
WHERE email = 'user@example.com';

-- Verify all unverified users
UPDATE "User"
SET "isEmailVerified" = true
WHERE "isEmailVerified" = false;
```

## Testing Checklist

- [ ] Existing user can login with correct password
- [ ] Wrong password shows "Invalid email or password"
- [ ] New user gets "verify email" message
- [ ] New user can login after verification
- [ ] Admin can login regardless of verification
- [ ] Verification modal appears for unverified new users
- [ ] Error messages are clear and helpful

## Expected Behavior Summary

| User Type               | Verified?      | Can Login? | Message                     |
| ----------------------- | -------------- | ---------- | --------------------------- |
| Existing (before Nov 1) | ❌ No          | ✅ Yes     | Success                     |
| Existing (before Nov 1) | ✅ Yes         | ✅ Yes     | Success                     |
| New (after Nov 1)       | ❌ No          | ❌ No      | "Please verify email"       |
| New (after Nov 1)       | ✅ Yes         | ✅ Yes     | Success                     |
| Admin                   | ❌ No          | ✅ Yes     | Success (bypass)            |
| Admin                   | ✅ Yes         | ✅ Yes     | Success                     |
| Any                     | Wrong password | ❌ No      | "Invalid email or password" |

## Success Indicators

✅ **Login is working when:**

- User redirects to `/dashboard` after login
- Session cookie is set (`next-auth.session-token`)
- User data appears in dashboard
- No error messages in browser console

❌ **Login is NOT working when:**

- Error message appears: "Please verify your email"
- Error message: "Invalid email or password" (with correct password)
- Page doesn't redirect after submit
- Session cookie not set

## Next Steps After Testing

1. ✅ Confirm existing users can login
2. ✅ Confirm new users see verification prompt
3. ✅ Run migration script when database is available
4. ✅ Monitor login success rate
5. ✅ Update user documentation if needed

## Support Commands

```bash
# Check TypeScript compilation
npm run build

# Start dev server
npm run dev

# Check for errors
npm run lint

# Run migration script
npx tsx scripts/verify-existing-users.js

# Check specific user in database (when available)
npx prisma studio
```

## Contact Points

If issues persist after these fixes:

1. Check browser console for specific error messages
2. Verify database connection is working
3. Confirm `.env` file has correct credentials
4. Check if email service is configured properly
5. Review server logs for detailed error traces

---

**Fix Applied:** ✅ Date-based email verification enforcement
**Date:** November 17, 2025
**Files Modified:** `src/lib/auth.ts`
**Status:** Ready for testing
