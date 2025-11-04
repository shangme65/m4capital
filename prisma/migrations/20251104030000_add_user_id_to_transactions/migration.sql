-- AlterTable Deposit: Add userId column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Deposit' 
        AND column_name = 'userId'
    ) THEN
        ALTER TABLE "public"."Deposit" ADD COLUMN "userId" TEXT;
        
        -- Add foreign key constraint
        ALTER TABLE "public"."Deposit" ADD CONSTRAINT "Deposit_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END
$$;

-- AlterTable Withdrawal: Add userId column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Withdrawal' 
        AND column_name = 'userId'
    ) THEN
        ALTER TABLE "public"."Withdrawal" ADD COLUMN "userId" TEXT;
        
        -- Add foreign key constraint
        ALTER TABLE "public"."Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END
$$;
