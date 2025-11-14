import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/pay-withdrawal-fee
 * Process fee payment and update withdrawal to processing
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { withdrawalId, paymentMethod } = body;

    if (!withdrawalId) {
      return NextResponse.json(
        { error: "Withdrawal ID required" },
        { status: 400 }
      );
    }

    // Get user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { portfolio: true },
    });

    if (!user || !user.portfolio) {
      return NextResponse.json(
        { error: "User or portfolio not found" },
        { status: 404 }
      );
    }

    // Get withdrawal
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 }
      );
    }

    if (withdrawal.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to withdrawal" },
        { status: 403 }
      );
    }

    if (withdrawal.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { error: "Withdrawal is not pending payment" },
        { status: 400 }
      );
    }

    const metadata = withdrawal.metadata as any;
    const fees = metadata?.fees || {};
    const totalFees = fees.totalFees || 0;
    const withdrawAmount = parseFloat(withdrawal.amount.toString());
    const totalRequired = withdrawAmount + totalFees;

    const currentBalance = parseFloat(user.portfolio.balance.toString());

    // Verify user still has sufficient balance
    if (currentBalance < totalRequired) {
      return NextResponse.json(
        {
          error: "Insufficient balance to complete withdrawal",
          details: {
            currentBalance,
            required: totalRequired,
            shortfall: totalRequired - currentBalance,
          },
        },
        { status: 400 }
      );
    }

    // Deduct total amount from portfolio
    const newBalance = currentBalance - totalRequired;

    await prisma.$transaction([
      // Update portfolio balance
      prisma.portfolio.update({
        where: { id: user.portfolio.id },
        data: { balance: newBalance },
      }),

      // Update withdrawal status
      prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "PROCESSING",
          metadata: {
            ...metadata,
            feesPaidAt: new Date().toISOString(),
            paymentMethod: paymentMethod || "BALANCE_DEDUCTION",
            processingStartedAt: new Date().toISOString(),
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Fee payment completed. Withdrawal is now being processed.",
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawAmount,
        fees: totalFees,
        totalDeducted: totalRequired,
        newBalance: newBalance,
        status: "PROCESSING",
        estimatedCompletion: "1-3 business days",
      },
    });
  } catch (error) {
    console.error("❌ Fee payment error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process payment",
      },
      { status: 500 }
    );
  }
}
