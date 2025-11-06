# Security Fix: Removed Hardcoded Admin Credentials

## 🚨 Critical Security Issue - RESOLVED

**Date**: November 6, 2025  
**Commit**: `2784e1c`  
**Severity**: HIGH

---

## Problem

Multiple files in the codebase contained **hardcoded admin credentials** that were committed to git and deployed to production:

### Hardcoded Values Found:

- `admin@m4capital.com` - Hardcoded email in multiple files
- `admin@m4capital` - Alternative hardcoded email (inconsistent)
- `password123` - Hardcoded password in scripts

### Affected Files (BEFORE):

1. ❌ `add-admin.ts` - Duplicate script with wrong email
2. ❌ `prisma/seed.ts` - Hardcoded `admin@m4capital.com` / `password123`
3. ❌ `scripts/fix-admin.ts` - Hardcoded both email variants
4. ❌ `src/app/api/fix-admin/route.ts` - Hardcoded credentials in API endpoint
5. ❌ `src/app/(dashboard)/admin/page.tsx` - Hardcoded email in UI
6. ❌ `docs/api/API_REFERENCE.md` - Hardcoded example email

---

## Solution

All admin credentials now use **environment variables** from `.env`:

```bash
ORIGIN_ADMIN_EMAIL="admin@yourdomain.com"
ORIGIN_ADMIN_PASSWORD="your-secure-password"
ORIGIN_ADMIN_NAME="Super Admin"
```

### Changes Made:

#### 1. Deleted Redundant Script

- ✅ **Removed** `add-admin.ts` entirely (duplicated seed.ts functionality)

#### 2. Updated Database Seeding (`prisma/seed.ts`)

```typescript
// BEFORE (INSECURE):
email: "admin@m4capital.com",
password: await bcrypt.hash("password123", 10)

// AFTER (SECURE):
email: process.env.ORIGIN_ADMIN_EMAIL,
password: await bcrypt.hash(process.env.ORIGIN_ADMIN_PASSWORD, 10)
```

#### 3. Updated Fix Script (`scripts/fix-admin.ts`)

```typescript
// BEFORE (INSECURE):
where: {
  email: "admin@m4capital.com";
}
password: await bcrypt.hash("password123", 10);

// AFTER (SECURE):
import dotenv from "dotenv";
dotenv.config();

where: {
  email: process.env.ORIGIN_ADMIN_EMAIL;
}
password: await bcrypt.hash(process.env.ORIGIN_ADMIN_PASSWORD, 10);
```

#### 4. Updated API Route (`/api/fix-admin`)

```typescript
// BEFORE (INSECURE):
where: {
  email: "admin@m4capital.com";
}

// AFTER (SECURE):
const adminEmail = process.env.ORIGIN_ADMIN_EMAIL;
if (!adminEmail || !adminPasswordRaw) {
  return NextResponse.json({ error: "Env vars required" }, { status: 500 });
}
where: {
  email: adminEmail;
}
```

#### 5. Updated Admin UI Mock Data

```typescript
// BEFORE:
user: "admin@m4capital.com";

// AFTER:
user: "admin@example.com"; // Generic placeholder
```

#### 6. Updated Documentation

- Updated `.env.example` with secure defaults
- Updated `API_REFERENCE.md` to show env var usage
- Added clear warnings about changing credentials

---

## Required Actions for Production

### 🔥 IMMEDIATE (Critical):

1. **Update Production Environment Variables**

   ```bash
   ORIGIN_ADMIN_EMAIL="your-real-admin@yourdomain.com"
   ORIGIN_ADMIN_PASSWORD="<generate-secure-random-password>"
   ```

2. **Change Existing Admin Password**

   - If `admin@m4capital.com` user exists in production, change password immediately
   - Delete any test accounts

3. **Rotate Credentials**
   - Generate new secure password (min 16 characters, random)
   - Update production `.env` file
   - Re-run database migration if needed

### 📋 Verification Checklist:

- [ ] Production `.env` has `ORIGIN_ADMIN_EMAIL` set to real email
- [ ] Production `.env` has `ORIGIN_ADMIN_PASSWORD` set to secure password
- [ ] Old admin accounts deleted or password changed
- [ ] Deployment pipeline updated with new env vars
- [ ] Git history reviewed (credentials exposed in commits)
- [ ] Consider rotating database credentials if exposed

---

## Testing

### Local Development:

1. Update your local `.env`:

   ```bash
   ORIGIN_ADMIN_EMAIL="admin@localhost.dev"
   ORIGIN_ADMIN_PASSWORD="dev-password-123"
   ```

2. Run database seed:

   ```bash
   npx prisma migrate dev
   npm run seed
   ```

3. Verify admin login works with credentials from `.env`

### Production:

1. Set production env vars in your hosting platform
2. Run fix-admin script if needed:
   ```bash
   npx ts-node scripts/fix-admin.ts
   ```

---

## Security Best Practices Applied

✅ **No hardcoded credentials** in source code  
✅ **Environment variables** for sensitive data  
✅ **Secure defaults** in `.env.example`  
✅ **Input validation** for env vars  
✅ **Clear error messages** when env vars missing  
✅ **Documentation updated** with security warnings  
✅ **Consistent email usage** (single source of truth)

---

## Files Changed

| File                                             | Status   | Change                                              |
| ------------------------------------------------ | -------- | --------------------------------------------------- |
| `add-admin.ts`                                   | DELETED  | Removed redundant script                            |
| `prisma/seed.ts`                                 | MODIFIED | Uses `ORIGIN_ADMIN_EMAIL` / `ORIGIN_ADMIN_PASSWORD` |
| `scripts/fix-admin.ts`                           | MODIFIED | Uses env vars with dotenv                           |
| `src/app/api/fix-admin/route.ts`                 | MODIFIED | Uses env vars, validates presence                   |
| `src/app/(dashboard)/admin/page.tsx`             | MODIFIED | Generic mock data                                   |
| `.env.example`                                   | MODIFIED | Secure defaults, clear instructions                 |
| `docs/api/API_REFERENCE.md`                      | MODIFIED | Shows env var usage                                 |
| `src/components/client/CryptoMarketProvider.tsx` | MODIFIED | WebSocket fallback (unrelated)                      |

**Total**: 7 files modified, 1 file deleted

---

## Lessons Learned

1. **Never hardcode credentials** - Always use environment variables
2. **Consistent naming** - Use one admin email source of truth
3. **Seed scripts** - Should always read from `.env`
4. **API endpoints** - Must validate env vars before use
5. **Mock data** - Should use generic placeholders like `example.com`

---

## Additional Recommendations

### Git History

⚠️ **WARNING**: Hardcoded credentials are in git history. Consider:

- Using `git filter-branch` or `BFG Repo Cleaner` to remove from history
- Rotating ALL credentials that were exposed
- Reviewing all commits for other sensitive data

### Future Prevention

- Add pre-commit hooks to detect hardcoded credentials
- Use tools like `git-secrets` or `trufflehog`
- Regular security audits of codebase
- Code review process for sensitive changes

---

## Contact

For security concerns or questions:

- Review this document
- Check `.env.example` for required variables
- Ensure production environment is properly configured
