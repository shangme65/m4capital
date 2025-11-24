-- Enable Row-Level Security on all user-owned tables in Neon
-- Neon supports standard PostgreSQL RLS

-- Enable RLS on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KycVerification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Portfolio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Deposit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Withdrawal" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Trade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaperPortfolio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaperTrade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Strategy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StrategyComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StrategyLike" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CourseProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TelegramUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CryptoWatchlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PriceAlert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserStatistics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScheduledMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FileStorage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModerationRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TradingSignal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quiz" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NewsArticle" ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user ID from session variable
CREATE OR REPLACE FUNCTION current_user_id() RETURNS TEXT AS $$
  SELECT nullif(current_setting('app.current_user_id', true), '')::TEXT;
$$ LANGUAGE SQL STABLE;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "User" 
    WHERE id = current_user_id() AND role = 'ADMIN'
  );
$$ LANGUAGE SQL STABLE;

-- Bypass RLS for service role (migrations, seeds, system operations)
-- Application code will set session variable for user requests
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Portfolio" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Deposit" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Withdrawal" FORCE ROW LEVEL SECURITY;
-- ALTER TABLE "Trade" FORCE ROW LEVEL SECURITY;
ALTER TABLE "PaperPortfolio" FORCE ROW LEVEL SECURITY;
ALTER TABLE "PaperTrade" FORCE ROW LEVEL SECURITY;
ALTER TABLE "KycVerification" FORCE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT
  USING (id = current_user_id() OR is_admin());

CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE
  USING (id = current_user_id())
  WITH CHECK (id = current_user_id());

CREATE POLICY "Admins can manage all users" ON "User"
  FOR ALL
  USING (is_admin());

-- Portfolio policies
CREATE POLICY "Users can view own portfolio" ON "Portfolio"
  FOR SELECT
  USING ("userId" = current_user_id());

CREATE POLICY "Users can update own portfolio" ON "Portfolio"
  FOR UPDATE
  USING ("userId" = current_user_id())
  WITH CHECK ("userId" = current_user_id());

CREATE POLICY "Users can insert own portfolio" ON "Portfolio"
  FOR INSERT
  WITH CHECK ("userId" = current_user_id());

-- Deposit policies
CREATE POLICY "Users can view own deposits" ON "Deposit"
  FOR SELECT
  USING ("userId" = current_user_id() OR is_admin());

CREATE POLICY "Users can create own deposits" ON "Deposit"
  FOR INSERT
  WITH CHECK ("userId" = current_user_id());

CREATE POLICY "Admins can manage all deposits" ON "Deposit"
  FOR ALL
  USING (is_admin());

-- Withdrawal policies
CREATE POLICY "Users can view own withdrawals" ON "Withdrawal"
  FOR SELECT
  USING ("userId" = current_user_id() OR is_admin());

CREATE POLICY "Users can create own withdrawals" ON "Withdrawal"
  FOR INSERT
  WITH CHECK ("userId" = current_user_id());

CREATE POLICY "Admins can manage all withdrawals" ON "Withdrawal"
  FOR ALL
  USING (is_admin());

-- Trade policies (commented out - table not created yet)
-- CREATE POLICY "Users can view own trades" ON "Trade"
--   FOR SELECT
--   USING ("userId" = current_user_id());

-- CREATE POLICY "Users can manage own trades" ON "Trade"
--   FOR ALL
--   USING ("userId" = current_user_id())
--   WITH CHECK ("userId" = current_user_id());

-- Paper Portfolio policies
CREATE POLICY "Users can view own paper portfolio" ON "PaperPortfolio"
  FOR SELECT
  USING ("userId" = current_user_id());

CREATE POLICY "Users can manage own paper portfolio" ON "PaperPortfolio"
  FOR ALL
  USING ("userId" = current_user_id())
  WITH CHECK ("userId" = current_user_id());

-- Paper Trade policies
CREATE POLICY "Users can view own paper trades" ON "PaperTrade"
  FOR SELECT
  USING ("userId" = current_user_id());

CREATE POLICY "Users can manage own paper trades" ON "PaperTrade"
  FOR ALL
  USING ("userId" = current_user_id())
  WITH CHECK ("userId" = current_user_id());

-- Strategy policies (public read)
CREATE POLICY "Anyone can view published strategies" ON "Strategy"
  FOR SELECT
  USING ("isPublished" = true OR "userId" = current_user_id());

CREATE POLICY "Users can manage own strategies" ON "Strategy"
  FOR ALL
  USING ("userId" = current_user_id())
  WITH CHECK ("userId" = current_user_id());

-- KYC policies
CREATE POLICY "Users can view own KYC" ON "KycVerification"
  FOR SELECT
  USING ("userId" = current_user_id() OR is_admin());

CREATE POLICY "Users can create own KYC" ON "KycVerification"
  FOR INSERT
  WITH CHECK ("userId" = current_user_id());

CREATE POLICY "Admins can manage all KYC" ON "KycVerification"
  FOR ALL
  USING (is_admin());
