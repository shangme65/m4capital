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

-- CreateIndex
CREATE UNIQUE INDEX "FileStorage_fileId_key" ON "FileStorage"("fileId");

-- CreateIndex
CREATE INDEX "FileStorage_userId_idx" ON "FileStorage"("userId");

-- CreateIndex
CREATE INDEX "FileStorage_fileType_idx" ON "FileStorage"("fileType");

-- CreateIndex
CREATE INDEX "ModerationRule_isActive_idx" ON "ModerationRule"("isActive");

-- CreateIndex
CREATE INDEX "TradingSignal_symbol_isActive_idx" ON "TradingSignal"("symbol", "isActive");

-- CreateIndex
CREATE INDEX "TradingSignal_createdAt_idx" ON "TradingSignal"("createdAt");

-- CreateIndex
CREATE INDEX "Quiz_isActive_idx" ON "Quiz"("isActive");

-- CreateIndex
CREATE INDEX "NewsArticle_category_idx" ON "NewsArticle"("category");

-- CreateIndex
CREATE INDEX "NewsArticle_publishedAt_idx" ON "NewsArticle"("publishedAt");

-- AddForeignKey
ALTER TABLE "CryptoWatchlist" ADD CONSTRAINT "CryptoWatchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStatistics" ADD CONSTRAINT "UserStatistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileStorage" ADD CONSTRAINT "FileStorage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
