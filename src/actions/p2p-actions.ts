"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrencySymbol } from "@/lib/currencies";
import {
  generateTransactionReference,
  validateTransferPin,
} from "@/lib/p2p-transfer-utils";

/**
 * React 19 Server Action for P2P transfers
 * Replaces the /api/p2p-transfer/send endpoint
 */

interface P2PTransferResult {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    amount: number;
    currency: string;
    deductedAmount: number;
    deductedCurrency: string;
    creditedAmount: number;
    creditedCurrency: string;
    receiverDisplayAmount: number;
    receiverDisplayCurrency: string;
    receiverName: string;
    receiverEmail: string;
    transactionReference: string;
    processedAt: Date;
  };
}

export async function sendP2PTransferAction(
  receiverIdentifier: string,
  amount: number,
  pin: string,
  description?: string
): Promise<P2PTransferResult> {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    // Validate inputs
    if (!receiverIdentifier || !amount || !pin) {
      return { success: false, error: "Missing required fields" };
    }

    if (!validateTransferPin(pin)) {
      return {
        success: false,
        error: "Invalid transfer PIN. Must be 4 digits.",
      };
    }

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    // Get sender with portfolio
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!sender || sender.isDeleted) {
      return { success: false, error: "User not found" };
    }

    // Verify transfer PIN
    if (!sender.transferPin) {
      return {
        success: false,
        error: "Transfer PIN not set up. Please set up your PIN first.",
      };
    }

    const isPinValid = await bcrypt.compare(pin, sender.transferPin);
    if (!isPinValid) {
      return { success: false, error: "Incorrect transfer PIN" };
    }

    // Check sender balance
    if (!sender.Portfolio) {
      return { success: false, error: "Portfolio not found" };
    }

    const senderBalance = parseFloat(sender.Portfolio.balance.toString());

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
      return { success: false, error: "Receiver not found" };
    }

    if (!receiver.Portfolio) {
      return { success: false, error: "Receiver portfolio not found" };
    }

    if (!receiver.accountNumber) {
      return { success: false, error: "Receiver account is not fully set up" };
    }

    // Get currencies
    const senderPreferredCurrency = sender.preferredCurrency || "USD";
    const senderBalanceCurrency =
      sender.Portfolio.balanceCurrency || senderPreferredCurrency;
    const receiverPreferredCurrency = receiver.preferredCurrency || "USD";
    const receiverBalanceCurrency =
      receiver.Portfolio.balanceCurrency || receiverPreferredCurrency;

    // Fetch exchange rates
    let exchangeRates: Record<string, number> = { USD: 1 };
    try {
      const ratesRes = await fetch(
        "https://api.frankfurter.app/latest?from=USD",
        { next: { revalidate: 300 } }
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
      const fromRate = exchangeRates[fromCurrency] || 1;
      const toRate = exchangeRates[toCurrency] || 1;
      const usdAmount = amountToConvert / fromRate;
      return usdAmount * toRate;
    };

    // Convert input amount from preferredCurrency to balanceCurrency (for deduction)
    const amountInSenderBalanceCurrency = convertCurrency(
      amount,
      senderPreferredCurrency,
      senderBalanceCurrency
    );
    const roundedDeductAmount =
      Math.round(amountInSenderBalanceCurrency * 100) / 100;

    // Verify sender has enough balance
    if (senderBalance < roundedDeductAmount) {
      return { success: false, error: "Insufficient balance" };
    }

    // Convert from sender's balance currency to receiver's balance currency (for credit)
    const amountInReceiverBalanceCurrency = convertCurrency(
      roundedDeductAmount,
      senderBalanceCurrency,
      receiverBalanceCurrency
    );
    const roundedCreditAmount =
      Math.round(amountInReceiverBalanceCurrency * 100) / 100;

    // Get currency symbols
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
    const transfer = await prisma.$transaction(async (tx) => {
      // Deduct from sender
      await tx.portfolio.update({
        where: { id: sender.Portfolio!.id },
        data: {
          balance: {
            decrement: roundedDeductAmount,
          },
        },
      });

      // Add to receiver
      await tx.portfolio.update({
        where: { id: receiver.Portfolio!.id },
        data: {
          balance: {
            increment: roundedCreditAmount,
          },
        },
      });

      // Create transfer record
      const transferRecord = await tx.p2PTransfer.create({
        data: {
          id: transactionReference,
          senderId: sender.id,
          receiverId: receiver.id,
          amount: roundedDeductAmount,
          currency: senderBalanceCurrency,
          status: "COMPLETED",
          description: JSON.stringify({
            memo: description || "P2P Transfer",
            senderInputAmount: amount,
            senderInputCurrency: senderPreferredCurrency,
            senderDeductedAmount: roundedDeductAmount,
            senderBalanceCurrency: senderBalanceCurrency,
            receiverCreditedAmount: roundedCreditAmount,
            receiverBalanceCurrency: receiverBalanceCurrency,
            receiverDisplayAmount: roundedReceiverDisplay,
            receiverDisplayCurrency: receiverPreferredCurrency,
            senderAmount: amount,
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

      // Create notifications
      await tx.notification.createMany({
        data: [
          {
            id: `notif-sender-${transactionReference}`,
            userId: sender.id,
            type: "TRANSACTION",
            title: "Transfer Sent",
            message: `You sent ${senderSymbol}${amount.toFixed(2)} to ${
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

      return transferRecord;
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/finance");

    return {
      success: true,
      data: {
        id: transfer.id,
        amount: amount,
        currency: senderPreferredCurrency,
        deductedAmount: roundedDeductAmount,
        deductedCurrency: senderBalanceCurrency,
        creditedAmount: roundedCreditAmount,
        creditedCurrency: receiverBalanceCurrency,
        receiverDisplayAmount: roundedReceiverDisplay,
        receiverDisplayCurrency: receiverPreferredCurrency,
        receiverName: transfer.receiverName,
        receiverEmail: transfer.receiverEmail,
        transactionReference: transfer.transactionReference,
        processedAt: transfer.processedAt || new Date(),
      },
    };
  } catch (error) {
    console.error("P2P transfer action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process transfer",
    };
  }
}
