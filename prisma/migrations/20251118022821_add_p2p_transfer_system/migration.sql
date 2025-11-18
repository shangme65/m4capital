-- AlterTable
ALTER TABLE "User" ADD COLUMN "transferPin" TEXT,
ADD COLUMN "accountNumber" TEXT UNIQUE;

-- CreateTable
CREATE TABLE "P2PTransfer" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "senderAccountNumber" TEXT NOT NULL,
    "receiverAccountNumber" TEXT NOT NULL,
    "receiverEmail" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "transactionReference" TEXT NOT NULL UNIQUE,
    "failureReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P2PTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "P2PTransfer_senderId_idx" ON "P2PTransfer"("senderId");

-- CreateIndex
CREATE INDEX "P2PTransfer_receiverId_idx" ON "P2PTransfer"("receiverId");

-- CreateIndex
CREATE INDEX "P2PTransfer_status_idx" ON "P2PTransfer"("status");

-- CreateIndex
CREATE INDEX "P2PTransfer_createdAt_idx" ON "P2PTransfer"("createdAt");

-- CreateIndex
CREATE INDEX "P2PTransfer_transactionReference_idx" ON "P2PTransfer"("transactionReference");

-- AddForeignKey
ALTER TABLE "P2PTransfer" ADD CONSTRAINT "P2PTransfer_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "P2PTransfer" ADD CONSTRAINT "P2PTransfer_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
