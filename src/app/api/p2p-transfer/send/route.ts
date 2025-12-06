import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  generateTransactionReference,
  validateTransferPin,
} from "@/lib/p2p-transfer-utils";
import { getCurrencySymbol } from "@/lib/currencies";

/**
 * POST /api/p2p-transfer/send
 * Process a P2P transfer between users with proper currency conversion
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
    // Note: Actual balance check happens after currency conversion below
    // because user enters amount in preferredCurrency but balance is in balanceCurrency

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

    // Get currencies - IMPORTANT DISTINCTION:
    // - preferredCurrency: what the user sees in the UI (can be changed)
    // - balanceCurrency: what the balance is actually stored in (set at deposit time)
    // User enters amount in preferredCurrency, but balance is in balanceCurrency
    const senderPreferredCurrency = sender.preferredCurrency || "USD";
    const senderBalanceCurrency =
      sender.Portfolio.balanceCurrency || senderPreferredCurrency;
    const receiverPreferredCurrency = receiver.preferredCurrency || "USD";
    const receiverBalanceCurrency =
      receiver.Portfolio.balanceCurrency || receiverPreferredCurrency;

    // Fetch exchange rates for currency conversion
    let exchangeRates: Record<string, number> = { USD: 1 };
    try {
      const ratesRes = await fetch(
        "https://api.frankfurter.app/latest?from=USD",
        { next: { revalidate: 300 } } // Cache for 5 minutes
      );
      if (ratesRes.ok) {
        const ratesData = await ratesRes.json();
        exchangeRates = { USD: 1, ...ratesData.rates };
      }
    } catch (e) {
      console.error("Error fetching exchange rates:", e);
    }

    // Helper function to convert between currencies
    const convertCurrency = (
      amountToConvert: number,
      fromCurrency: string,
      toCurrency: string
    ): number => {
      if (fromCurrency === toCurrency) return amountToConvert;
      // Convert to USD first, then to target currency
      const fromRate = exchangeRates[fromCurrency] || 1;
      const toRate = exchangeRates[toCurrency] || 1;
      const usdAmount = amountToConvert / fromRate;
      return usdAmount * toRate;
    };

    // Step 1: Convert input amount from preferredCurrency to balanceCurrency (for deduction)
    // User enters "100 EUR" but balance is in BRL, need to deduct equivalent BRL
    const amountInSenderBalanceCurrency = convertCurrency(
      transferAmount,
      senderPreferredCurrency,
      senderBalanceCurrency
    );
    const roundedDeductAmount =
      Math.round(amountInSenderBalanceCurrency * 100) / 100;

    // Verify sender has enough balance (in their balance currency)
    if (senderBalance < roundedDeductAmount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Step 2: Convert from sender's balance currency to receiver's balance currency (for credit)
    const amountInReceiverBalanceCurrency = convertCurrency(
      roundedDeductAmount,
      senderBalanceCurrency,
      receiverBalanceCurrency
    );
    const roundedCreditAmount =
      Math.round(amountInReceiverBalanceCurrency * 100) / 100;

    // Get currency symbols for notifications (use preferred currencies for display)
    const senderSymbol = getCurrencySymbol(senderPreferredCurrency);
    const receiverSymbol = getCurrencySymbol(receiverPreferredCurrency);

    // Calculate display amount for receiver in their preferred currency
    const receiverDisplayAmount = convertCurrency(
      roundedCreditAmount,
      receiverBalanceCurrency,
      receiverPreferredCurrency
    );
    const roundedReceiverDisplay =
      Math.round(receiverDisplayAmount * 100) / 100;

    // Generate transaction reference
    const transactionReference = generateTransactionReference();

    // Perform the transfer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from sender (in sender's BALANCE currency)
      await tx.portfolio.update({
        where: { id: sender.Portfolio!.id },
        data: {
          balance: {
            decrement: roundedDeductAmount,
          },
        },
      });

      // Add to receiver (in receiver's BALANCE currency)
      await tx.portfolio.update({
        where: { id: receiver.Portfolio!.id },
        data: {
          balance: {
            increment: roundedCreditAmount,
          },
        },
      });

      // Create transfer record with comprehensive conversion metadata
      // This stores all the info needed to display correctly in history for both users
      const transfer = await tx.p2PTransfer.create({
        data: {
          id: transactionReference,
          senderId: sender.id,
          receiverId: receiver.id,
          amount: roundedDeductAmount, // Store actual deducted amount (in sender's balance currency)
          currency: senderBalanceCurrency, // Store sender's balance currency
          status: "COMPLETED",
          // Store complete conversion metadata for proper history display
          description: JSON.stringify({
            memo: description || "P2P Transfer",
            // Sender's perspective (for sender's history)
            senderInputAmount: transferAmount, // What user typed
            senderInputCurrency: senderPreferredCurrency, // User's display currency
            senderDeductedAmount: roundedDeductAmount, // Actually deducted from balance
            senderBalanceCurrency: senderBalanceCurrency, // Balance storage currency
            // Receiver's perspective (for receiver's history)
            receiverCreditedAmount: roundedCreditAmount, // Actually credited to balance
            receiverBalanceCurrency: receiverBalanceCurrency, // Balance storage currency
            receiverDisplayAmount: roundedReceiverDisplay, // For display in their preferred
            receiverDisplayCurrency: receiverPreferredCurrency, // Receiver's display currency
            // Legacy fields for backward compatibility
            senderAmount: transferAmount,
            senderCurrency: senderPreferredCurrency,
            receiverAmount: roundedReceiverDisplay,
            receiverCurrency: receiverPreferredCurrency,
          }),
          senderAccountNumber: sender.accountNumber!,
          receiverAccountNumber: receiver.accountNumber!,
          receiverEmail: receiver.email!,
          receiverName: receiver.name || "Unknown",
          transactionReference,
          processedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create notifications for both users with amounts in their PREFERRED currencies
      await tx.notification.createMany({
        data: [
          {
            id: `notif-sender-${transactionReference}`,
            userId: sender.id,
            type: "TRANSACTION",
            title: "Transfer Sent",
            message: `You sent ${senderSymbol}${transferAmount.toFixed(2)} to ${
              receiver.name || receiver.email
            }`,
            read: false,
          },
          {
            id: `notif-receiver-${transactionReference}`,
            userId: receiver.id,
            type: "TRANSACTION",
            title: "Money Received",
            message: `You received ${receiverSymbol}${roundedReceiverDisplay.toFixed(
              2
            )} from ${sender.name || sender.email}`,
            read: false,
          },
        ],
      });

      return transfer;
    });

    return NextResponse.json({
      success: true,
      transfer: {
        id: result.id,
        amount: transferAmount,
        currency: senderPreferredCurrency,
        deductedAmount: roundedDeductAmount,
        deductedCurrency: senderBalanceCurrency,
        creditedAmount: roundedCreditAmount,
        creditedCurrency: receiverBalanceCurrency,
        receiverDisplayAmount: roundedReceiverDisplay,
        receiverDisplayCurrency: receiverPreferredCurrency,
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
