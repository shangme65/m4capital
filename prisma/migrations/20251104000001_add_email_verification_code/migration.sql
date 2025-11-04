-- Add email verification code fields
ALTER TABLE "User" ADD COLUMN "emailVerificationCode" TEXT;
ALTER TABLE "User" ADD COLUMN "emailVerificationExpires" TIMESTAMP(3);
