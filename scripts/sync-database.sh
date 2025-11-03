#!/bin/bash

# Database Sync Script for Neon
# This script helps you sync production data to development

echo "🔄 M4Capital Database Sync"
echo "=============================="
echo ""

echo "⚠️  IMPORTANT: This will overwrite your development database!"
echo ""
echo "Options:"
echo "1. Restore development branch from production (via Neon Console)"
echo "2. Update local .env to point to production branch (temporary)"
echo "3. Export/Import data manually"
echo ""

read -p "Choose an option (1-3): " choice

case $choice in
  1)
    echo ""
    echo "📋 Steps to restore development from production:"
    echo ""
    echo "1. Visit: https://console.neon.tech/"
    echo "2. Select your m4capital project"
    echo "3. Go to 'Branches' in the sidebar"
    echo "4. Find your development branch"
    echo "5. Click 'Restore' or 'Reset' button"
    echo "6. Select the production branch as source"
    echo "7. Confirm the restore"
    echo ""
    echo "Once done, run: npx prisma generate"
    ;;
  
  2)
    echo ""
    echo "⚠️  WARNING: This will point your local dev to PRODUCTION database!"
    echo ""
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo ""
      echo "Creating backup of current .env..."
      cp .env .env.backup
      echo ""
      echo "Please manually update DATABASE_URL in .env to production branch URL"
      echo "Then run: npx prisma generate && npm run dev"
    fi
    ;;
  
  3)
    echo ""
    echo "📦 Manual Export/Import Steps:"
    echo ""
    echo "Step 1: Install PostgreSQL client tools if not already installed"
    echo "Step 2: Export from production:"
    echo ""
    echo 'pg_dump "postgresql://neondb_owner:npg_IgHquiS7e1XW@ep-shy-bonus-acendrbq.sa-east-1.aws.neon.tech/neondb?sslmode=require" > production_backup.sql'
    echo ""
    echo "Step 3: Import to development:"
    echo "psql YOUR_DEV_DATABASE_URL < production_backup.sql"
    echo ""
    echo "Step 4: Run migrations:"
    echo "npx prisma generate"
    ;;
  
  *)
    echo "Invalid option. Exiting."
    exit 1
    ;;
esac

echo ""
echo "✅ Instructions provided. Please follow the steps above."
