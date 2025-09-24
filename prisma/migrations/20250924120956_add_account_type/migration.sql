-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('INVESTOR', 'TRADER');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "accountType" "public"."AccountType" NOT NULL DEFAULT 'INVESTOR';
