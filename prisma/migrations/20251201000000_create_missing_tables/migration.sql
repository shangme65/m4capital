-- CreateEnum for missing enums
CREATE TYPE "ActivityType" AS ENUM ('PAGE_VIEW', 'BUTTON_CLICK', 'API_CALL', 'TELEGRAM_COMMAND', 'TELEGRAM_MESSAGE', 'LOGIN', 'LOGOUT', 'SIGNUP', 'DEPOSIT', 'WITHDRAWAL', 'TRADE', 'KYC_SUBMISSION', 'SETTINGS_UPDATE', 'ERROR');

CREATE TYPE "NotificationType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'TRADE', 'INFO', 'WARNING', 'SUCCESS', 'TRANSACTION');

-- CreateTable for BitcoinDeposit
CREATE TABLE "BitcoinDeposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "amountBtc" DECIMAL(65,30),
    "amountUsd" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "txHash" TEXT,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "BitcoinDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(65,30),
    "asset" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable for TelegramLinkCode
CREATE TABLE "TelegramLinkCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramLinkCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable for UserActivity
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "activityType" "ActivityType" NOT NULL,
    "page" TEXT,
    "action" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BitcoinDeposit_userId_idx" ON "BitcoinDeposit"("userId");
CREATE INDEX "BitcoinDeposit_address_idx" ON "BitcoinDeposit"("address");
CREATE INDEX "BitcoinDeposit_status_idx" ON "BitcoinDeposit"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramLinkCode_userId_key" ON "TelegramLinkCode"("userId");
CREATE UNIQUE INDEX "TelegramLinkCode_code_key" ON "TelegramLinkCode"("code");
CREATE INDEX "TelegramLinkCode_code_idx" ON "TelegramLinkCode"("code");
CREATE INDEX "TelegramLinkCode_expiresAt_idx" ON "TelegramLinkCode"("expiresAt");

-- CreateIndex
CREATE INDEX "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt");
CREATE INDEX "UserActivity_sessionId_idx" ON "UserActivity"("sessionId");
CREATE INDEX "UserActivity_activityType_createdAt_idx" ON "UserActivity"("activityType", "createdAt");

-- AddForeignKey
ALTER TABLE "BitcoinDeposit" ADD CONSTRAINT "BitcoinDeposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramLinkCode" ADD CONSTRAINT "TelegramLinkCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row-Level Security for new tables
ALTER TABLE "BitcoinDeposit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TelegramLinkCode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserActivity" ENABLE ROW LEVEL SECURITY;

-- Force RLS on sensitive tables
ALTER TABLE "BitcoinDeposit" FORCE ROW LEVEL SECURITY;
ALTER TABLE "TelegramLinkCode" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Notification" FORCE ROW LEVEL SECURITY;
ALTER TABLE "UserActivity" FORCE ROW LEVEL SECURITY;

-- BitcoinDeposit policies
CREATE POLICY "Users can view own bitcoin deposits" ON "BitcoinDeposit"
  FOR SELECT
  USING ("userId" = current_user_id());

CREATE POLICY "Users can create own bitcoin deposits" ON "BitcoinDeposit"
  FOR INSERT
  WITH CHECK ("userId" = current_user_id());

CREATE POLICY "Users can update own bitcoin deposits" ON "BitcoinDeposit"
  FOR UPDATE
  USING ("userId" = current_user_id())
  WITH CHECK ("userId" = current_user_id());

CREATE POLICY "System can update bitcoin deposits" ON "BitcoinDeposit"
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all bitcoin deposits" ON "BitcoinDeposit"
  FOR ALL
  USING (is_admin());

-- TelegramLinkCode policies
CREATE POLICY "Users can view own telegram link code" ON "TelegramLinkCode"
  FOR SELECT
  USING ("userId" = current_user_id());

CREATE POLICY "Users can create own telegram link code" ON "TelegramLinkCode"
  FOR INSERT
  WITH CHECK ("userId" = current_user_id());

CREATE POLICY "Users can update own telegram link code" ON "TelegramLinkCode"
  FOR UPDATE
  USING ("userId" = current_user_id())
  WITH CHECK ("userId" = current_user_id());

CREATE POLICY "Users can delete own telegram link code" ON "TelegramLinkCode"
  FOR DELETE
  USING ("userId" = current_user_id());

CREATE POLICY "Admins can manage all telegram link codes" ON "TelegramLinkCode"
  FOR ALL
  USING (is_admin());

-- Notification policies
CREATE POLICY "Users can view own notifications" ON "Notification"
  FOR SELECT
  USING ("userId" = current_user_id());

CREATE POLICY "Users can update own notifications" ON "Notification"
  FOR UPDATE
  USING ("userId" = current_user_id())
  WITH CHECK ("userId" = current_user_id());

CREATE POLICY "System can create notifications" ON "Notification"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own notifications" ON "Notification"
  FOR DELETE
  USING ("userId" = current_user_id());

CREATE POLICY "Admins can manage all notifications" ON "Notification"
  FOR ALL
  USING (is_admin());

-- UserActivity policies
CREATE POLICY "Users can view own activity" ON "UserActivity"
  FOR SELECT
  USING ("userId" = current_user_id() OR is_admin());

CREATE POLICY "System can create activity logs" ON "UserActivity"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all activity logs" ON "UserActivity"
  FOR ALL
  USING (is_admin());
