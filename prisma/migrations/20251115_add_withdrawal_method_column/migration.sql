-- Add missing method column to Withdrawal table
-- Run this when database is accessible

ALTER TABLE "Withdrawal" ADD COLUMN IF NOT EXISTS "method" TEXT;

-- Verify the column was added
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Withdrawal' AND column_name = 'method';
