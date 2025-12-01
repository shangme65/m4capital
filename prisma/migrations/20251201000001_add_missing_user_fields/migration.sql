-- Add missing User fields that were removed by bad migrations

-- Add preferredCurrency if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'User' AND column_name = 'preferredCurrency') THEN
        ALTER TABLE "User" ADD COLUMN "preferredCurrency" TEXT NOT NULL DEFAULT 'USD';
    END IF;
END $$;

-- Add isEmailVerified if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'User' AND column_name = 'isEmailVerified') THEN
        ALTER TABLE "User" ADD COLUMN "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Add isDeleted if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'User' AND column_name = 'isDeleted') THEN
        ALTER TABLE "User" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Add deletedAt if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'User' AND column_name = 'deletedAt') THEN
        ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);
    END IF;
END $$;

-- Add emailNotifications if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'User' AND column_name = 'emailNotifications') THEN
        ALTER TABLE "User" ADD COLUMN "emailNotifications" BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- Add tradingNotifications if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'User' AND column_name = 'tradingNotifications') THEN
        ALTER TABLE "User" ADD COLUMN "tradingNotifications" BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- Add securityNotifications if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'User' AND column_name = 'securityNotifications') THEN
        ALTER TABLE "User" ADD COLUMN "securityNotifications" BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- Add kycNotifications if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'User' AND column_name = 'kycNotifications') THEN
        ALTER TABLE "User" ADD COLUMN "kycNotifications" BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- Add createdAt if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'User' AND column_name = 'createdAt') THEN
        ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Add updatedAt if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'User' AND column_name = 'updatedAt') THEN
        ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "User_isDeleted_idx" ON "User"("isDeleted");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
