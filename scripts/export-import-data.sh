#!/bin/bash
# Export data from production and import to development

echo "🔄 Exporting data from Production Neon branch..."
echo ""

# You'll need to install PostgreSQL client tools first
# Windows: Download from https://www.postgresql.org/download/windows/
# Or use: winget install PostgreSQL.PostgreSQL

# Step 1: Export from production (replace with your production connection string)
echo "Step 1: Exporting from production..."
# pg_dump "YOUR_PRODUCTION_DATABASE_URL" > production_backup.sql

# Step 2: Import to development (replace with your development connection string)
echo "Step 2: Importing to development..."
# psql "YOUR_DEVELOPMENT_DATABASE_URL" < production_backup.sql

echo ""
echo "⚠️  Before running this script:"
echo "1. Install PostgreSQL client tools"
echo "2. Replace YOUR_PRODUCTION_DATABASE_URL with production connection string"
echo "3. Replace YOUR_DEVELOPMENT_DATABASE_URL with development connection string"
echo "4. Run: bash scripts/export-import-data.sh"
