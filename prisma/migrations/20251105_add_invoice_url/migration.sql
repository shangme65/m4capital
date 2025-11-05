-- Add invoiceUrl field to Deposit table
-- This field stores the NOWPayments invoice URL when using invoice API method

ALTER TABLE "Deposit" ADD COLUMN "invoiceUrl" TEXT;

COMMENT ON COLUMN "Deposit"."invoiceUrl" IS 'NOWPayments invoice URL (for invoice API method)';
