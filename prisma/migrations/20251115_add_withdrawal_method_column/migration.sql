-- Add missing method and fee columns to Withdrawal table
-- Run this when database is accessible

ALTER TABLE "Withdrawal" ADD COLUMN IF NOT EXISTS "method" TEXT;
ALTER TABLE "Withdrawal" ADD COLUMN IF NOT EXISTS "fee" DECIMAL(65,30);

-- Verify the columns were added
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Withdrawal' AND column_name IN ('method', 'fee');
