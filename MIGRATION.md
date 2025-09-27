# Migration from Supabase

This document outlines the steps to migrate from Supabase to a standard PostgreSQL database.

## Changes Made

1. **Removed Supabase CLI**: The `supabase` package has been removed from `devDependencies`
2. **Created .env.example**: Added a template environment file with generic PostgreSQL connection string

## Migration Steps

### 1. Update Environment Variables

Replace your Supabase `DATABASE_URL` in your `.env` file with a standard PostgreSQL connection string:

```bash
# Before (Supabase)
DATABASE_URL="postgresql://postgres:[password]@[host].supabase.co:5432/postgres"

# After (Generic PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/m4capital?schema=public"
```

### 2. Set up PostgreSQL Database

If migrating from Supabase to a local or remote PostgreSQL instance:

1. **Create the database**:
   ```sql
   CREATE DATABASE m4capital;
   ```

2. **Run Prisma migrations**:
   ```bash
   npx prisma migrate dev
   ```

3. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

### 3. Update NextAuth Configuration

Ensure your `NEXTAUTH_SECRET` and `NEXTAUTH_URL` environment variables are set:

```bash
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## VS Code Extension Removal

If you had the Supabase VS Code extension installed:

1. Open VS Code Extensions view (Ctrl+Shift+X)
2. Search for "Supabase"
3. Click "Uninstall" on the Supabase extension
4. Reload VS Code if prompted

## Verification

Test your setup:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

The application should now work with your new PostgreSQL database without any Supabase dependencies.