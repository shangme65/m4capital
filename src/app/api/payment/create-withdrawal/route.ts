import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/create-withdrawal
 * Creates a withdrawal request with fee calculation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency, withdrawalMethod, address, memo } = body;

    // Validate inputs
    if (!amount || !currency || !withdrawalMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid withdrawal amount" },
        { status: 400 }
      );
    }

    // Get user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email },
      include: { Portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.Portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(user.Portfolio.balance.toString());

    // Calculate fees based on withdrawal method
    const fees = calculateWithdrawalFees(withdrawAmount, withdrawalMethod);

    // Check if user has sufficient balance (amount + all fees)
    const totalRequired = withdrawAmount + fees.totalFees;
    if (currentBalance < totalRequired) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          details: {
            requested: withdrawAmount,
            fees: fees,
            totalRequired: totalRequired,
            currentBalance: currentBalance,
            shortfall: totalRequired - currentBalance,
          },
        },
        { status: 400 }
      );
    }

    // Create withdrawal record
    const withdrawal = await prisma.withdrawal.create({
      data: {
        portfolioId: user.Portfolio.id,
        userId: user.id,
        amount: withdrawAmount,
        currency: currency,
        status: "PENDING_PAYMENT",
        type: withdrawalMethod,
        metadata: {
          address: address || null,
          memo: memo || null,
          fees: fees,
          requestedAt: new Date().toISOString(),
          requiresPayment: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawAmount,
        currency: currency,
        fees: fees,
        totalDeduction: totalRequired,
        status: "PENDING_PAYMENT",
        message:
          "Please complete the fee payment to process your withdrawal request.",
      },
    });
  } catch (error) {
    console.error("❌ Withdrawal creation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create withdrawal",
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate withdrawal fees based on method
 */
function calculateWithdrawalFees(
  amount: number,
  method: string
): {
  processingFee: number;
  networkFee: number;
  serviceFee: number;
  complianceFee: number;
  totalFees: number;
  breakdown: string[];
} {
  let processingFee = 0;
  let networkFee = 0;
  let serviceFee = 0;
  let complianceFee = 0;

  switch (method) {
    case "CRYPTO_BTC":
      processingFee = amount * 0.01; // 1% processing fee
      networkFee = 0.0005; // Fixed BTC network fee (in USD equivalent)
      serviceFee = 2.5; // Fixed service fee
      complianceFee = amount * 0.005; // 0.5% compliance fee
      break;

    case "CRYPTO_ETH":
      processingFee = amount * 0.01; // 1% processing fee
      networkFee = 0.002; // Fixed ETH network fee (in USD equivalent)
      serviceFee = 2.5; // Fixed service fee
      complianceFee = amount * 0.005; // 0.5% compliance fee
      break;

    case "BANK_TRANSFER":
      processingFee = amount * 0.02; // 2% processing fee
      networkFee = 0; // No network fee for bank transfers
      serviceFee = 5.0; // Higher fixed service fee
      complianceFee = amount * 0.01; // 1% compliance fee
      break;

    case "WIRE_TRANSFER":
      processingFee = amount * 0.025; // 2.5% processing fee
      networkFee = 0; // No network fee
      serviceFee = 15.0; // Higher fixed service fee for wire
      complianceFee = amount * 0.01; // 1% compliance fee
      break;

    default:
      processingFee = amount * 0.015; // 1.5% default processing fee
      serviceFee = 3.0; // Default service fee
      complianceFee = amount * 0.005; // 0.5% compliance fee
  }

  const totalFees = processingFee + networkFee + serviceFee + complianceFee;

  const breakdown = [
    `Processing Fee (${
      method.includes("CRYPTO")
        ? "1%"
        : method === "BANK_TRANSFER"
        ? "2%"
        : "2.5%"
    }): $${processingFee.toFixed(2)}`,
    networkFee > 0
      ? `Network Fee: $${networkFee.toFixed(2)}`
      : "Network Fee: $0.00",
    `Service Fee: $${serviceFee.toFixed(2)}`,
    `Compliance & Security Fee (${
      method === "BANK_TRANSFER" || method === "WIRE_TRANSFER" ? "1%" : "0.5%"
    }): $${complianceFee.toFixed(2)}`,
  ];

  return {
    processingFee: parseFloat(processingFee.toFixed(2)),
    networkFee: parseFloat(networkFee.toFixed(2)),
    serviceFee: parseFloat(serviceFee.toFixed(2)),
    complianceFee: parseFloat(complianceFee.toFixed(2)),
    totalFees: parseFloat(totalFees.toFixed(2)),
    breakdown,
  };
}

/**
 * GET /api/payment/create-withdrawal
 * Calculate fees without creating withdrawal
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = parseFloat(searchParams.get("amount") || "0");
    const method = searchParams.get("method") || "CRYPTO_BTC";

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const fees = calculateWithdrawalFees(amount, method);

    return NextResponse.json({
      amount,
      method,
      fees,
      totalDeduction: amount + fees.totalFees,
    });
  } catch (error) {
    console.error("❌ Fee calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate fees" },
      { status: 500 }
    );
  }
}
