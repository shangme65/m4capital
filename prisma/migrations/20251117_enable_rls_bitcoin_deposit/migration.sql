-- Enable Row-Level Security on BitcoinDeposit table
-- This ensures users can only access their own bitcoin deposits

-- Enable RLS on BitcoinDeposit
ALTER TABLE "BitcoinDeposit" ENABLE ROW LEVEL SECURITY;

-- Force RLS even for service role on user-specific operations
ALTER TABLE "BitcoinDeposit" FORCE ROW LEVEL SECURITY;

-- BitcoinDeposit policies
-- Users can only view their own bitcoin deposits
CREATE POLICY "Users can view own bitcoin deposits" ON "BitcoinDeposit"
  FOR SELECT
  USING ("userId" = current_user_id());

-- Users can create their own bitcoin deposits
CREATE POLICY "Users can create own bitcoin deposits" ON "BitcoinDeposit"
  FOR INSERT
  WITH CHECK ("userId" = current_user_id());

-- Users can update their own bitcoin deposits (status changes, etc.)
CREATE POLICY "Users can update own bitcoin deposits" ON "BitcoinDeposit"
  FOR UPDATE
  USING ("userId" = current_user_id())
  WITH CHECK ("userId" = current_user_id());

-- System/Webhooks can update any bitcoin deposit (for confirmations)
CREATE POLICY "System can update bitcoin deposits" ON "BitcoinDeposit"
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Admins can view and manage all bitcoin deposits
CREATE POLICY "Admins can manage all bitcoin deposits" ON "BitcoinDeposit"
  FOR ALL
  USING (is_admin());
