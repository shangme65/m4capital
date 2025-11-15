-- Enable Row-Level Security on new tables
-- These tables were added after the initial RLS setup

-- Enable RLS on new tables
ALTER TABLE "TelegramLinkCode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserActivity" ENABLE ROW LEVEL SECURITY;

-- Force RLS on sensitive tables (even for service role on user-specific operations)
ALTER TABLE "TelegramLinkCode" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Notification" FORCE ROW LEVEL SECURITY;
ALTER TABLE "UserActivity" FORCE ROW LEVEL SECURITY;

-- TelegramLinkCode policies
-- Users can only view and manage their own link codes
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
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON "Notification"
  FOR SELECT
  USING ("userId" = current_user_id());

CREATE POLICY "Users can update own notifications" ON "Notification"
  FOR UPDATE
  USING ("userId" = current_user_id())
  WITH CHECK ("userId" = current_user_id());

CREATE POLICY "System can create notifications" ON "Notification"
  FOR INSERT
  WITH CHECK (true); -- System/admin can create notifications for any user

CREATE POLICY "Users can delete own notifications" ON "Notification"
  FOR DELETE
  USING ("userId" = current_user_id());

CREATE POLICY "Admins can manage all notifications" ON "Notification"
  FOR ALL
  USING (is_admin());

-- UserActivity policies
-- Users can view their own activity, admins can view all
CREATE POLICY "Users can view own activity" ON "UserActivity"
  FOR SELECT
  USING ("userId" = current_user_id() OR is_admin());

CREATE POLICY "System can create activity logs" ON "UserActivity"
  FOR INSERT
  WITH CHECK (true); -- System can log activity for any user

CREATE POLICY "Admins can manage all activity logs" ON "UserActivity"
  FOR ALL
  USING (is_admin());

-- Note: UserActivity typically doesn't need UPDATE or DELETE for users
-- Only system/admin should be able to manage activity logs
