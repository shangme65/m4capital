import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/middleware/ratelimit";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";

export const dynamic = "force-dynamic";

/**
 * POST /api/traderoom/fund
 * Transfer funds from fiat balance to traderoom balance
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimiters.standard(request);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse(
        "Unauthorized",
        "Authentication required",
        undefined,
        401
      );
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return createErrorResponse(
        "Invalid input",
        "Amount must be greater than 0",
        undefined,
        400
      );
    }

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: { Portfolio: true },
    });

    if (!user) {
      return createErrorResponse("Not found", "User not found", undefined, 404);
    }

    if (!user.Portfolio) {
      return createErrorResponse(
        "Not found",
        "Portfolio not found. Please make a deposit first.",
        undefined,
        404
      );
    }

    const currentBalance = Number(user.Portfolio.balance);
    const currentTraderoomBalance = Number(
      user.Portfolio.traderoomBalance || 0
    );

    // Get user's preferred currency
    const userCurrency = user.preferredCurrency || "USD";
    const currSymbol = getCurrencySymbol(userCurrency);

    // Check if user has sufficient balance
    if (currentBalance < amount) {
      return createErrorResponse(
        "Insufficient funds",
        `You only have ${currSymbol}${currentBalance.toFixed(
          2
        )} available. Cannot transfer ${currSymbol}${amount.toFixed(
          2
        )} to Traderoom.`,
        undefined,
        400
      );
    }

    // Transfer funds: subtract from fiat balance, add to traderoom balance
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: user.Portfolio.id },
      data: {
        balance: currentBalance - amount,
        traderoomBalance: currentTraderoomBalance + amount,
      },
    });

    // Create a notification for the transfer
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "TRANSACTION",
        title: "Traderoom Funded",
        message: `Successfully transferred ${currSymbol}${amount.toFixed(
          2
        )} to your Traderoom balance`,
        metadata: {
          type: "traderoom_fund",
          amount: amount,
          fromBalance: currentBalance,
          toTraderoomBalance: currentTraderoomBalance + amount,
        },
      },
    });

    console.log(
      `✅ Traderoom funded: User ${user.email} transferred ${currSymbol}${amount} to traderoom`
    );

    return createSuccessResponse(
      {
        newFiatBalance: Number(updatedPortfolio.balance),
        newTraderoomBalance: Number(updatedPortfolio.traderoomBalance),
        transferredAmount: amount,
      },
      "Funds transferred to Traderoom successfully"
    );
  } catch (error) {
    console.error("Traderoom fund error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to fund traderoom",
      error,
      500
    );
  }
}

/**
 * GET /api/traderoom/fund
 * Get current traderoom balance
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse(
        "Unauthorized",
        "Authentication required",
        undefined,
        401
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: { Portfolio: true },
    });

    if (!user) {
      return createErrorResponse("Not found", "User not found", undefined, 404);
    }

    const fiatBalance = user.Portfolio ? Number(user.Portfolio.balance) : 0;
    const traderoomBalance = user.Portfolio
      ? Number(user.Portfolio.traderoomBalance || 0)
      : 0;

    return createSuccessResponse({
      fiatBalance,
      traderoomBalance,
      balanceCurrency: user.Portfolio?.balanceCurrency || "USD",
    });
  } catch (error) {
    console.error("Get traderoom balance error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to get balance",
      error,
      500
    );
  }
}
