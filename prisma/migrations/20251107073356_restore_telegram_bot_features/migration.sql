/*
  Warnings:

  - You are about to drop the column `emailVerificationCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `Withdrawal` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationCode",
DROP COLUMN "emailVerificationExpires";

-- AlterTable
ALTER TABLE "Withdrawal" DROP COLUMN "method",
DROP COLUMN "walletAddress";

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" "TradeType" NOT NULL,
    "entryPrice" DECIMAL(65,30) NOT NULL,
    "exitPrice" DECIMAL(65,30),
    "quantity" DECIMAL(65,30) NOT NULL,
    "profit" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "commission" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "leverage" INTEGER NOT NULL DEFAULT 1,
    "status" "TradeStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaperPortfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 100000.00,
    "assets" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaperPortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaperTrade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paperPortfolioId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" "TradeType" NOT NULL,
    "entryPrice" DECIMAL(65,30) NOT NULL,
    "exitPrice" DECIMAL(65,30),
    "quantity" DECIMAL(65,30) NOT NULL,
    "profit" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "commission" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "leverage" INTEGER NOT NULL DEFAULT 1,
    "status" "TradeStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "PaperTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyComment" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyLike" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategyLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramUser" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "languageCode" TEXT NOT NULL DEFAULT 'en',
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT,
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP(3),
    "bannedReason" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoWatchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CryptoWatchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "targetPrice" DECIMAL(65,30) NOT NULL,
    "condition" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggered" BOOLEAN NOT NULL DEFAULT false,
    "triggeredAt" TIMESTAMP(3),
    "chatId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStatistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messagesCount" INTEGER NOT NULL DEFAULT 0,
    "imagesGenerated" INTEGER NOT NULL DEFAULT 0,
    "cryptoQueriesCount" INTEGER NOT NULL DEFAULT 0,
    "commandsUsed" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "UserStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatId" BIGINT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileStorage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "extractedText" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileStorage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationRule" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "caseSensitive" BOOLEAN NOT NULL DEFAULT false,
    "isRegex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModerationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingSignal" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "targetPrice" DECIMAL(65,30),
    "stopLoss" DECIMAL(65,30),
    "confidence" DECIMAL(65,30) NOT NULL,
    "analysis" TEXT NOT NULL,
    "indicators" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradingSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL,
    "chatId" BIGINT,
    "messageId" BIGINT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "responses" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "sentiment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trade_userId_idx" ON "Trade"("userId");

-- CreateIndex
CREATE INDEX "Trade_createdAt_idx" ON "Trade"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaperPortfolio_userId_key" ON "PaperPortfolio"("userId");

-- CreateIndex
CREATE INDEX "PaperTrade_userId_idx" ON "PaperTrade"("userId");

-- CreateIndex
CREATE INDEX "PaperTrade_paperPortfolioId_idx" ON "PaperTrade"("paperPortfolioId");

-- CreateIndex
CREATE INDEX "PaperTrade_createdAt_idx" ON "PaperTrade"("createdAt");

-- CreateIndex
CREATE INDEX "Strategy_userId_idx" ON "Strategy"("userId");

-- CreateIndex
CREATE INDEX "Strategy_category_idx" ON "Strategy"("category");

-- CreateIndex
CREATE INDEX "Strategy_createdAt_idx" ON "Strategy"("createdAt");

-- CreateIndex
CREATE INDEX "StrategyComment_strategyId_idx" ON "StrategyComment"("strategyId");

-- CreateIndex
CREATE INDEX "StrategyComment_userId_idx" ON "StrategyComment"("userId");

-- CreateIndex
CREATE INDEX "StrategyLike_strategyId_idx" ON "StrategyLike"("strategyId");

-- CreateIndex
CREATE INDEX "StrategyLike_userId_idx" ON "StrategyLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StrategyLike_strategyId_userId_key" ON "StrategyLike"("strategyId", "userId");

-- CreateIndex
CREATE INDEX "CourseProgress_userId_idx" ON "CourseProgress"("userId");

-- CreateIndex
CREATE INDEX "CourseProgress_courseId_idx" ON "CourseProgress"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseProgress_userId_courseId_lessonId_key" ON "CourseProgress"("userId", "courseId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_telegramId_key" ON "TelegramUser"("telegramId");

-- CreateIndex
CREATE INDEX "TelegramUser_telegramId_idx" ON "TelegramUser"("telegramId");

-- CreateIndex
CREATE INDEX "TelegramUser_username_idx" ON "TelegramUser"("username");

-- CreateIndex
CREATE INDEX "CryptoWatchlist_userId_idx" ON "CryptoWatchlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoWatchlist_userId_symbol_key" ON "CryptoWatchlist"("userId", "symbol");

-- CreateIndex
CREATE INDEX "PriceAlert_userId_idx" ON "PriceAlert"("userId");

-- CreateIndex
CREATE INDEX "PriceAlert_symbol_isActive_idx" ON "PriceAlert"("symbol", "isActive");

-- CreateIndex
CREATE INDEX "UserStatistics_userId_idx" ON "UserStatistics"("userId");

-- CreateIndex
CREATE INDEX "UserStatistics_date_idx" ON "UserStatistics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "UserStatistics_userId_date_key" ON "UserStatistics"("userId", "date");

-- CreateIndex
CREATE INDEX "ScheduledMessage_scheduledFor_sent_idx" ON "ScheduledMessage"("scheduledFor", "sent");

-- CreateIndex
CREATE INDEX "ScheduledMessage_userId_idx" ON "ScheduledMessage"("userId");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperPortfolio" ADD CONSTRAINT "PaperPortfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperTrade" ADD CONSTRAINT "PaperTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperTrade" ADD CONSTRAINT "PaperTrade_paperPortfolioId_fkey" FOREIGN KEY ("paperPortfolioId") REFERENCES "PaperPortfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyComment" ADD CONSTRAINT "StrategyComment_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyComment" ADD CONSTRAINT "StrategyComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyLike" ADD CONSTRAINT "StrategyLike_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyLike" ADD CONSTRAINT "StrategyLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoWatchlist" ADD CONSTRAINT "CryptoWatchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStatistics" ADD CONSTRAINT "UserStatistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileStorage" ADD CONSTRAINT "FileStorage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
