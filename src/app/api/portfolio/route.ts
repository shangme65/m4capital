import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Mark this route as dynamic to prevent static generation attempts
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Portfolio API endpoint called");
    const session = await getServerSession(authOptions);

    console.log(
      "🔐 Session:",
      session ? `User: ${session.user?.email}` : "No session"
    );

    if (!session?.user?.email) {
      console.error("❌ No authentication - session:", session);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get timeframe parameter from query string (default: '1Y')
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "1Y"; // 1D, 1W, 1M, 3M, 6M, 1Y, ALL
    const period = searchParams.get("period") || "all"; // Legacy support

    console.log(
      "🔍 Looking up user:",
      session.user.email,
      "| Timeframe:",
      timeframe,
      "| Period:",
      period
    );

    // Calculate period start date based on timeframe
    let periodStart: Date | undefined;
    let periodEnd: Date;
    const now = new Date();
    periodEnd = now; // End period is always now

    // Map timeframe to period start
    switch (timeframe) {
      case "1D":
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "1W":
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "1M":
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3M":
        periodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "6M":
        periodStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case "1Y":
        periodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "ALL":
        periodStart = undefined; // No start date = all time
        break;
      default:
        // Legacy period support
        switch (period) {
          case "today":
            periodStart = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0
            );
            break;
          case "7d":
            periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "all":
          default:
            periodStart = undefined; // No filter
            break;
        }
    }

    // Find user and their portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: {
        Portfolio: true,
      },
    });

    console.log("👤 User found:", user ? `ID: ${user.id}` : "Not found");
    console.log("💼 Portfolio exists:", user?.Portfolio ? "Yes" : "No");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create portfolio if it doesn't exist
    let portfolio = user.Portfolio;
    if (!portfolio) {
      console.log("📝 Creating new portfolio for user:", user.id);
      portfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          balance: 0.0,
          assets: [],
        },
      });
    }

    // Fetch deposits and withdrawals separately to avoid schema relation issues
    // Query by portfolioId (not userId) to match current schema
    const deposits = await prisma.deposit.findMany({
      where: {
        portfolioId: portfolio.id,
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        portfolioId: portfolio.id,
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Aggregate sums for full history to compute income percent
    const depositSum = await prisma.deposit.aggregate({
      _sum: { amount: true },
      where: { portfolioId: portfolio.id, status: "COMPLETED" },
    });

    const withdrawalSum = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { portfolioId: portfolio.id, status: "COMPLETED" },
    });

    // Aggregate sums for the specific period
    const periodDepositSum = await prisma.deposit.aggregate({
      _sum: { amount: true },
      where: {
        portfolioId: portfolio.id,
        status: "COMPLETED",
        ...(periodStart && { createdAt: { gte: periodStart } }),
      },
    });

    const periodWithdrawalSum = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: {
        portfolioId: portfolio.id,
        status: "COMPLETED",
        ...(periodStart && { createdAt: { gte: periodStart } }),
      },
    });

    // Trade earnings tracking
    const periodTradeEarnings = await prisma.trade.aggregate({
      where: {
        userId: user.id,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      _sum: {
        profit: true,
      },
    });

    const totalDeposited = parseFloat((depositSum._sum.amount ?? 0).toString());
    const totalWithdrawn = parseFloat(
      (withdrawalSum._sum.amount ?? 0).toString()
    );

    const periodDeposits = parseFloat(
      (periodDepositSum._sum.amount ?? 0).toString()
    );
    const periodWithdrawals = parseFloat(
      (periodWithdrawalSum._sum.amount ?? 0).toString()
    );

    // Net added money = deposits - withdrawals. This represents total money
    // the user has put into the account (not market movements).
    const netAdded = totalDeposited - totalWithdrawn;

    // Period net change = deposits - withdrawals + trade earnings for period
    const periodNetChange =
      periodDeposits -
      periodWithdrawals +
      parseFloat((periodTradeEarnings._sum.profit ?? 0).toString());

    // Parse assets JSON
    const assets = Array.isArray(portfolio.assets) ? portfolio.assets : [];

    // Calculate portfolio value (this would integrate with real-time crypto prices)
    const portfolioValue = parseFloat(portfolio.balance.toString());

    // Income percent = percentage change of user's money (current balance
    // relative to the net amount they added). This excludes crypto market
    // fluctuations and only measures increase/decrease of user's funds.
    const incomePercent =
      netAdded > 0 ? ((portfolioValue - netAdded) / netAdded) * 100 : 0;

    // Period income percent - calculate baseline balance at period start
    // Baseline = current balance - period net change
    const periodBaselineBalance = portfolioValue - periodNetChange;
    const periodIncomePercent =
      periodBaselineBalance > 0
        ? (periodNetChange / periodBaselineBalance) * 100
        : periodNetChange > 0
        ? 100
        : 0; // If starting from 0, show 100% if positive gain

    // Return portfolio data
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
      },
      portfolio: {
        balance: portfolioValue,
        assets: assets,
        totalDeposited,
        totalWithdrawn,
        netAdded,
        incomePercent,
        period,
        periodDeposits,
        periodWithdrawals,
        periodTradeEarnings,
        periodNetChange,
        periodIncomePercent,
        recentDeposits: deposits.map((d) => ({
          id: d.id,
          amount: parseFloat(d.amount.toString()),
          currency: d.currency,
          status: d.status,
          createdAt: d.createdAt,
        })),
        recentWithdrawals: withdrawals.map((w) => ({
          id: w.id,
          amount: parseFloat(w.amount.toString()),
          currency: w.currency,
          status: w.status,
          createdAt: w.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Portfolio API error:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Handle specific Prisma/database errors
    if (
      error instanceof Error &&
      error.message.includes("Can't reach database")
    ) {
      return NextResponse.json(
        { error: "Database connection issue. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
