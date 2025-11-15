-- Add missing fee column to Withdrawal table

ALTER TABLE "Withdrawal" ADD COLUMN IF NOT EXISTS "fee" DECIMAL(65,30);
