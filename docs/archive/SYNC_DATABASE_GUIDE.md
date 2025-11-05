# Database Sync Guide: Production to Development

## Current Setup

You have a single Neon database that both production and development are using.

## ⚠️ Important

Using the same database for both production and development is risky - development changes can affect live data!

## Solution Options

### Option 1: Use Neon Database Branching (Recommended)

Neon allows you to create branches of your database, similar to Git branches.

#### Steps:

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click "Branches" in the sidebar
4. Create a new branch (e.g., "development")
5. Copy the connection string for the development branch
6. Update your local `.env` file with the development branch connection string

```bash
# Development branch
DATABASE_URL="postgresql://neondb_owner:password@ep-dev-branch-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require"
```

#### Sync data from production to development:

```bash
# Neon will automatically copy data when creating a branch
# Or you can restore from a production branch snapshot
```

---

### Option 2: Export/Import Data Manually

#### Export from Production:

```bash
# Using pg_dump (requires PostgreSQL client)
pg_dump "postgresql://neondb_owner:npg_IgHquiS7e1XW@ep-shy-bonus-acendrbq.sa-east-1.aws.neon.tech/neondb?sslmode=require" > production_backup.sql
```

#### Import to Development:

```bash
# First, create a development database branch in Neon
# Then import the data
psql "postgresql://your-dev-connection-string" < production_backup.sql
```

---

### Option 3: Use Prisma to Seed Development Database

Create a seed script that mimics production data structure:

```bash
# Run the existing seed
npm run seed
```

Or create a production data export:

```typescript
// scripts/export-production-data.ts
import { prisma } from "@/lib/prisma";
import fs from "fs";

async function exportData() {
  const users = await prisma.user.findMany({
    include: {
      portfolio: true,
      kycVerification: true,
    },
  });

  const deposits = await prisma.deposit.findMany();
  const withdrawals = await prisma.withdrawal.findMany();

  const data = {
    users,
    deposits,
    withdrawals,
  };

  fs.writeFileSync("production-data.json", JSON.stringify(data, null, 2));
  console.log("Data exported successfully!");
}

exportData();
```

---

### Option 4: Direct Database Query Copy

If you want to quickly copy specific records:

```sql
-- Connect to development database and run:
-- This requires both databases accessible simultaneously

-- Example: Copy users from production
INSERT INTO "User"
SELECT * FROM dblink(
  'host=ep-shy-bonus-acendrbq.sa-east-1.aws.neon.tech
   dbname=neondb
   user=neondb_owner
   password=npg_IgHquiS7e1XW',
  'SELECT * FROM "User"'
) AS t(id text, name text, email text, ...);
```

---

## Recommended Workflow

1. **Create separate database branches in Neon:**

   - `main` - Production database
   - `develop` - Development database
   - `staging` - Staging database (optional)

2. **Update your `.env` files:**

   ```bash
   # .env.local (for local development)
   DATABASE_URL="postgresql://...dev-branch..."

   # .env.production (for production deployment)
   DATABASE_URL="postgresql://...main-branch..."
   ```

3. **When you need production data in development:**

   - Use Neon's branch restore feature
   - Or create a new development branch from the main branch

4. **Keep separate super admin accounts:**

   ```bash
   # Development
   ORIGIN_ADMIN_EMAIL="admin@dev.m4capital.com"

   # Production
   ORIGIN_ADMIN_EMAIL="admin@m4capital.com"
   ```

---

## Quick Setup Steps

### Step 1: Create Development Branch in Neon

```bash
# In Neon Console:
# 1. Click "Branches"
# 2. Click "Create Branch"
# 3. Name: "development"
# 4. Source: "main" (current production branch)
# 5. Copy the new connection string
```

### Step 2: Update Local Environment

```bash
# Create .env.local for local development
cp .env .env.local

# Edit .env.local and update DATABASE_URL to development branch
DATABASE_URL="postgresql://neondb_owner:password@ep-dev-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Step 3: Run Migrations on Development

```bash
npx prisma migrate deploy
npx prisma generate
```

### Step 4: Test Connection

```bash
npm run dev
# Visit http://localhost:3000
# Login with admin@m4capital.com / Admin@123456
```

---

## Safety Tips

✅ **DO:**

- Use separate database branches for development and production
- Regularly backup production data
- Test migrations on development first
- Use `.env.local` for local development (Git-ignored)

❌ **DON'T:**

- Use the same database for development and production
- Commit real database credentials to Git
- Test destructive operations on production
- Share production database connection strings

---

## Need Help?

- [Neon Branching Docs](https://neon.tech/docs/guides/branching)
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
