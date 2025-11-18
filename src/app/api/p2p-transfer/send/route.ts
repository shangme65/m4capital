import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  generateTransactionReference,
  validateTransferPin,
} from "@/lib/p2p-transfer-utils";

/**
 * POST /api/p2p-transfer/send
 * Process a P2P transfer between users
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverIdentifier, amount, pin, description } = body;

    // Validate inputs
    if (!receiverIdentifier || !amount || !pin) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!validateTransferPin(pin)) {
      return NextResponse.json(
        { error: "Invalid transfer PIN. Must be 4 digits." },
        { status: 400 }
      );
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Get sender with portfolio
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!sender || sender.isDeleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify transfer PIN
    if (!sender.transferPin) {
      return NextResponse.json(
        { error: "Transfer PIN not set up. Please set up your PIN first." },
        { status: 400 }
      );
    }

    const isPinValid = await bcrypt.compare(pin, sender.transferPin);
    if (!isPinValid) {
      return NextResponse.json(
        { error: "Incorrect transfer PIN" },
        { status: 401 }
      );
    }

    // Check sender balance
    if (!sender.Portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    const senderBalance = parseFloat(sender.Portfolio.balance.toString());
    if (senderBalance < transferAmount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Look up receiver
    const receiver = await prisma.user.findFirst({
      where: {
        OR: [
          { email: receiverIdentifier },
          { accountNumber: receiverIdentifier },
        ],
        isDeleted: false,
        id: { not: sender.id },
      },
      include: { Portfolio: true },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    if (!receiver.Portfolio) {
      return NextResponse.json(
        { error: "Receiver portfolio not found" },
        { status: 404 }
      );
    }

    if (!receiver.accountNumber) {
      return NextResponse.json(
        { error: "Receiver account is not fully set up" },
        { status: 400 }
      );
    }

    // Generate transaction reference
    const transactionReference = generateTransactionReference();

    // Perform the transfer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from sender
      await tx.portfolio.update({
        where: { id: sender.Portfolio!.id },
        data: {
          balance: {
            decrement: transferAmount,
          },
        },
      });

      // Add to receiver
      await tx.portfolio.update({
        where: { id: receiver.Portfolio!.id },
        data: {
          balance: {
            increment: transferAmount,
          },
        },
      });

      // Create transfer record
      const transfer = await tx.p2PTransfer.create({
        data: {
          id: transactionReference,
          senderId: sender.id,
          receiverId: receiver.id,
          amount: transferAmount,
          currency: sender.preferredCurrency || "USD",
          status: "COMPLETED",
          description: description || null,
          senderAccountNumber: sender.accountNumber!,
          receiverAccountNumber: receiver.accountNumber,
          receiverEmail: receiver.email!,
          receiverName: receiver.name || "Unknown",
          transactionReference,
          processedAt: new Date(),
        },
      });

      // Create notifications for both users
      await tx.notification.createMany({
        data: [
          {
            id: `notif-sender-${transactionReference}`,
            userId: sender.id,
            type: "TRANSACTION",
            title: "Transfer Sent",
            message: `You sent ${transferAmount.toFixed(2)} ${
              sender.preferredCurrency || "USD"
            } to ${receiver.name || receiver.email}`,
            isRead: false,
          },
          {
            id: `notif-receiver-${transactionReference}`,
            userId: receiver.id,
            type: "TRANSACTION",
            title: "Money Received",
            message: `You received ${transferAmount.toFixed(2)} ${
              sender.preferredCurrency || "USD"
            } from ${sender.name || sender.email}`,
            isRead: false,
          },
        ],
      });

      return transfer;
    });

    return NextResponse.json({
      success: true,
      transfer: {
        id: result.id,
        amount: result.amount,
        currency: result.currency,
        receiverName: result.receiverName,
        receiverEmail: result.receiverEmail,
        transactionReference: result.transactionReference,
        processedAt: result.processedAt,
      },
    });
  } catch (error) {
    console.error("Error processing transfer:", error);
    return NextResponse.json(
      { error: "Failed to process transfer" },
      { status: 500 }
    );
  }
}
