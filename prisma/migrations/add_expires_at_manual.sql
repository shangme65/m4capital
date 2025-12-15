-- Manual migration for adding expiresAt to Deposit table
-- Run this in production database

ALTER TABLE "Deposit" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Add comment for documentation
COMMENT ON COLUMN "Deposit"."expiresAt" IS 'Timestamp when the payment expires (from NowPayments API)';
