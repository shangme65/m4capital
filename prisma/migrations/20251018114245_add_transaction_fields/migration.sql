-- AlterTable
ALTER TABLE "public"."Deposit" ADD COLUMN     "metadata" JSONB DEFAULT '{}',
ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "public"."Withdrawal" ADD COLUMN     "metadata" JSONB DEFAULT '{}',
ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "type" TEXT;
