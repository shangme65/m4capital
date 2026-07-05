-- Add lastSeenAt column for real-time presence tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'lastSeenAt'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "lastSeenAt" TIMESTAMP(3);
    END IF;
END $$;
