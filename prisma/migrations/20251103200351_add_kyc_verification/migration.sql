/*
  Warnings:

  - You are about to drop the column `adminNotes` on the `KycVerification` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `KycVerification` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailNotifications` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `kycNotifications` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `securityNotifications` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tradingNotifications` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CryptoWatchlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FileStorage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModerationRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NewsArticle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PriceAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduledMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TelegramUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TradingSignal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserStatistics` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `country` on table `KycVerification` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."CryptoWatchlist" DROP CONSTRAINT "CryptoWatchlist_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FileStorage" DROP CONSTRAINT "FileStorage_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PriceAlert" DROP CONSTRAINT "PriceAlert_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ScheduledMessage" DROP CONSTRAINT "ScheduledMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserStatistics" DROP CONSTRAINT "UserStatistics_userId_fkey";

-- DropIndex
DROP INDEX "public"."KycVerification_status_idx";

-- DropIndex
DROP INDEX "public"."KycVerification_submittedAt_idx";

-- DropIndex
DROP INDEX "public"."User_isDeleted_idx";

-- AlterTable
ALTER TABLE "KycVerification" DROP COLUMN "adminNotes",
DROP COLUMN "createdAt",
ALTER COLUMN "dateOfBirth" SET DATA TYPE TEXT,
ALTER COLUMN "country" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "emailNotifications",
DROP COLUMN "emailVerificationCode",
DROP COLUMN "emailVerificationExpires",
DROP COLUMN "isDeleted",
DROP COLUMN "isEmailVerified",
DROP COLUMN "kycNotifications",
DROP COLUMN "securityNotifications",
DROP COLUMN "tradingNotifications",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "public"."CryptoWatchlist";

-- DropTable
DROP TABLE "public"."FileStorage";

-- DropTable
DROP TABLE "public"."ModerationRule";

-- DropTable
DROP TABLE "public"."NewsArticle";

-- DropTable
DROP TABLE "public"."PriceAlert";

-- DropTable
DROP TABLE "public"."Quiz";

-- DropTable
DROP TABLE "public"."ScheduledMessage";

-- DropTable
DROP TABLE "public"."TelegramUser";

-- DropTable
DROP TABLE "public"."TradingSignal";

-- DropTable
DROP TABLE "public"."UserStatistics";
