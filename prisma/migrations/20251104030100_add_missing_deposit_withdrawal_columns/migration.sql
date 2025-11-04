-- AlterTable Deposit: Add missing columns
DO $$
BEGIN
    -- Add method column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Deposit' AND column_name = 'method') THEN
        ALTER TABLE "public"."Deposit" ADD COLUMN "method" TEXT;
    END IF;
    
    -- Add metadata column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Deposit' AND column_name = 'metadata') THEN
        ALTER TABLE "public"."Deposit" ADD COLUMN "metadata" JSONB DEFAULT '{}';
    END IF;
    
    -- Add transactionId column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Deposit' AND column_name = 'transactionId') THEN
        ALTER TABLE "public"."Deposit" ADD COLUMN "transactionId" TEXT;
    END IF;
    
    -- Add type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Deposit' AND column_name = 'type') THEN
        ALTER TABLE "public"."Deposit" ADD COLUMN "type" TEXT;
    END IF;
    
    -- Add paymentId column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Deposit' AND column_name = 'paymentId') THEN
        ALTER TABLE "public"."Deposit" ADD COLUMN "paymentId" TEXT;
        -- Add unique constraint only if column was just created
        ALTER TABLE "public"."Deposit" ADD CONSTRAINT "Deposit_paymentId_key" UNIQUE ("paymentId");
    END IF;
    
    -- Add paymentAddress column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Deposit' AND column_name = 'paymentAddress') THEN
        ALTER TABLE "public"."Deposit" ADD COLUMN "paymentAddress" TEXT;
    END IF;
    
    -- Add paymentAmount column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Deposit' AND column_name = 'paymentAmount') THEN
        ALTER TABLE "public"."Deposit" ADD COLUMN "paymentAmount" DECIMAL(65,30);
    END IF;
    
    -- Add paymentStatus column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Deposit' AND column_name = 'paymentStatus') THEN
        ALTER TABLE "public"."Deposit" ADD COLUMN "paymentStatus" TEXT;
    END IF;
    
    -- Add cryptoAmount column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Deposit' AND column_name = 'cryptoAmount') THEN
        ALTER TABLE "public"."Deposit" ADD COLUMN "cryptoAmount" DECIMAL(65,30);
    END IF;
    
    -- Add cryptoCurrency column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Deposit' AND column_name = 'cryptoCurrency') THEN
        ALTER TABLE "public"."Deposit" ADD COLUMN "cryptoCurrency" TEXT;
    END IF;
END
$$;

-- AlterTable Withdrawal: Add missing columns
DO $$
BEGIN
    -- Add method column to Withdrawal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Withdrawal' AND column_name = 'method') THEN
        ALTER TABLE "public"."Withdrawal" ADD COLUMN "method" TEXT;
    END IF;
    
    -- Add metadata column to Withdrawal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Withdrawal' AND column_name = 'metadata') THEN
        ALTER TABLE "public"."Withdrawal" ADD COLUMN "metadata" JSONB DEFAULT '{}';
    END IF;
    
    -- Add transactionId column to Withdrawal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Withdrawal' AND column_name = 'transactionId') THEN
        ALTER TABLE "public"."Withdrawal" ADD COLUMN "transactionId" TEXT;
    END IF;
    
    -- Add type column to Withdrawal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Withdrawal' AND column_name = 'type') THEN
        ALTER TABLE "public"."Withdrawal" ADD COLUMN "type" TEXT;
    END IF;
    
    -- Add walletAddress column to Withdrawal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Withdrawal' AND column_name = 'walletAddress') THEN
        ALTER TABLE "public"."Withdrawal" ADD COLUMN "walletAddress" TEXT;
    END IF;
END
$$;
