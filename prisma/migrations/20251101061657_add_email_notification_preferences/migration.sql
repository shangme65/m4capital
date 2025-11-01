-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "kycNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "securityNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tradingNotifications" BOOLEAN NOT NULL DEFAULT true;
