-- Add isOriginAdmin column to User table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='User' AND column_name='isOriginAdmin') THEN
    ALTER TABLE "User" ADD COLUMN "isOriginAdmin" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
