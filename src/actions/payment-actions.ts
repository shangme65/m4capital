"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";

interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Calculate withdrawal fees based on method
 */
function calculateWithdrawalFees(
  amount: number,
  method: string,
  currency: string = "USD"
): {
  processingFee: number;
  networkFee: number;
  serviceFee: number;
  complianceFee: number;
  totalFees: number;
  breakdown: string[];
} {
  const currSymbol = getCurrencySymbol(currency);
  let processingFee = 0;
  let networkFee = 0;
  let serviceFee = 0;
  let complianceFee = 0;

  switch (method) {
    case "CRYPTO_BTC":
      processingFee = amount * 0.01;
      networkFee = 0.0005;
      serviceFee = 2.5;
      complianceFee = amount * 0.005;
      break;

    case "CRYPTO_ETH":
      processingFee = amount * 0.01;
      networkFee = 0.002;
      serviceFee = 2.5;
      complianceFee = amount * 0.005;
      break;

    case "BANK_TRANSFER":
      processingFee = amount * 0.02;
      networkFee = 0;
      serviceFee = 5.0;
      complianceFee = amount * 0.01;
      break;

    case "WIRE_TRANSFER":
      processingFee = amount * 0.025;
      networkFee = 0;
      serviceFee = 15.0;
      complianceFee = amount * 0.01;
      break;

    default:
      processingFee = amount * 0.015;
      serviceFee = 3.0;
      complianceFee = amount * 0.005;
  }

  const totalFees = processingFee + networkFee + serviceFee + complianceFee;

  const breakdown = [
    `Processing Fee: ${currSymbol}${processingFee.toFixed(2)}`,
    `Network Fee: ${currSymbol}${networkFee.toFixed(2)}`,
    `Service Fee: ${currSymbol}${serviceFee.toFixed(2)}`,
    `Compliance Fee: ${currSymbol}${complianceFee.toFixed(2)}`,
  ];

  return {
    processingFee,
    networkFee,
    serviceFee,
    complianceFee,
    totalFees,
    breakdown,
  };
}

/**
 * Create withdrawal request action
 */
export async function createWithdrawalAction(params: {
  amount: number;
  currency: string;
  withdrawalMethod: string;
  address?: string;
  memo?: string;
}): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const { amount, currency, withdrawalMethod, address, memo } = params;

    if (!amount || !currency || !withdrawalMethod) {
      return { success: false, error: "Missing required fields" };
    }

    if (amount <= 0) {
      return { success: false, error: "Invalid withdrawal amount" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user || !user.Portfolio) {
      return { success: false, error: "Portfolio not found" };
    }

    const currentBalance = Number(user.Portfolio.balance);
    const fees = calculateWithdrawalFees(amount, withdrawalMethod, currency);
    const totalRequired = amount + fees.totalFees;

    if (currentBalance < totalRequired) {
      return {
        success: false,
        error: "Insufficient balance",
        data: {
          requested: amount,
          fees,
          totalRequired,
          currentBalance,
          shortfall: totalRequired - currentBalance,
        },
      };
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        id: generateId(),
        portfolioId: user.Portfolio.id,
        userId: user.id,
        amount,
        currency,
        status: "PENDING_PAYMENT",
        type: withdrawalMethod,
        metadata: {
          address: address || null,
          memo: memo || null,
          fees,
          requestedAt: new Date().toISOString(),
          requiresPayment: true,
        },
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/wallet");

    return {
      success: true,
      data: {
        id: withdrawal.id,
        amount,
        currency,
        fees,
        totalDeduction: totalRequired,
        status: "PENDING_PAYMENT",
        message: "Please complete the fee payment to process your withdrawal.",
      },
    };
  } catch (error) {
    console.error("Create withdrawal action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create withdrawal",
    };
  }
}

/**
 * Pay withdrawal fee action
 */
export async function payWithdrawalFeeAction(params: {
  withdrawalId: string;
  paymentMethod?: string;
}): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const { withdrawalId, paymentMethod } = params;

    if (!withdrawalId) {
      return { success: false, error: "Withdrawal ID required" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user || !user.Portfolio) {
      return { success: false, error: "Portfolio not found" };
    }

    const userCurrency = user.preferredCurrency || "USD";
    const currSymbol = getCurrencySymbol(userCurrency);

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return { success: false, error: "Withdrawal not found" };
    }

    if (withdrawal.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (withdrawal.status !== "PENDING_PAYMENT") {
      return { success: false, error: "Withdrawal is not pending payment" };
    }

    const metadata = withdrawal.metadata as any;
    const fees = metadata?.fees || {};
    const totalFees = fees.totalFees || 0;
    const withdrawAmount = Number(withdrawal.amount);
    const totalRequired = withdrawAmount + totalFees;
    const currentBalance = Number(user.Portfolio.balance);

    if (currentBalance < totalRequired) {
      return {
        success: false,
        error: "Insufficient balance",
        data: {
          currentBalance,
          required: totalRequired,
          shortfall: totalRequired - currentBalance,
        },
      };
    }

    const newBalance = currentBalance - totalRequired;

    await prisma.$transaction([
      prisma.portfolio.update({
        where: { id: user.Portfolio.id },
        data: { balance: newBalance },
      }),
      prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "PENDING",
          metadata: {
            ...metadata,
            feesPaidAt: new Date().toISOString(),
            paymentMethod: paymentMethod || "BALANCE_DEDUCTION",
            pendingSince: new Date().toISOString(),
          },
        },
      }),
      prisma.notification.create({
        data: {
          id: generateId(),
          userId: user.id,
          type: "WITHDRAW",
          title: "Withdrawal Pending Approval",
          message: `Your withdrawal of ${currSymbol}${withdrawAmount.toLocaleString()} is pending admin approval.`,
          amount: withdrawAmount,
          asset: userCurrency,
          metadata: {
            withdrawalId: withdrawal.id,
            fees: totalFees,
            method: withdrawal.type,
          },
        },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/wallet");

    return {
      success: true,
      data: {
        id: withdrawal.id,
        amount: withdrawAmount,
        fees: totalFees,
        totalDeducted: totalRequired,
        newBalance,
        status: "PENDING",
        message: "Withdrawal is pending admin approval",
      },
    };
  } catch (error) {
    console.error("Pay withdrawal fee action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process payment",
    };
  }
}

/**
 * Cancel withdrawal action
 */
export async function cancelWithdrawalAction(
  withdrawalId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return { success: false, error: "Withdrawal not found" };
    }

    if (withdrawal.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (withdrawal.status !== "PENDING_PAYMENT") {
      return {
        success: false,
        error: "Only pending withdrawals can be cancelled",
      };
    }

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "CANCELLED",
        metadata: {
          ...(withdrawal.metadata as any),
          cancelledAt: new Date().toISOString(),
          cancelledBy: "user",
        },
      },
    });

    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "INFO",
        title: "Withdrawal Cancelled",
        message: `Your withdrawal request of ${getCurrencySymbol(
          withdrawal.currency
        )}${Number(withdrawal.amount).toLocaleString()} has been cancelled.`,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/wallet");

    return { success: true };
  } catch (error) {
    console.error("Cancel withdrawal action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to cancel withdrawal",
    };
  }
}

/**
 * Get withdrawal history action
 */
export async function getWithdrawalHistoryAction(): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      success: true,
      data: withdrawals.map((w) => ({
        id: w.id,
        amount: Number(w.amount),
        currency: w.currency,
        status: w.status,
        type: w.type,
        createdAt: w.createdAt.toISOString(),
        metadata: w.metadata,
      })),
    };
  } catch (error) {
    console.error("Get withdrawal history action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get withdrawals",
    };
  }
}

/**
 * Get pending withdrawals action
 */
export async function getPendingWithdrawalsAction(): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        userId: user.id,
        status: { in: ["PENDING_PAYMENT", "PROCESSING"] },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: withdrawals.map((w) => ({
        id: w.id,
        amount: Number(w.amount),
        currency: w.currency,
        status: w.status,
        type: w.type,
        createdAt: w.createdAt.toISOString(),
        metadata: w.metadata,
      })),
    };
  } catch (error) {
    console.error("Get pending withdrawals action error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get pending withdrawals",
    };
  }
}
