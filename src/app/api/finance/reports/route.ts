import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/finance/reports
 * Generate financial reports from user data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get("type") || "summary";
    const period = searchParams.get("period") || "monthly";

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        Portfolio: true,
        Deposit: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
        },
        Withdrawal: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
        },
        Trade: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const deposits = user.Deposit || [];
    const withdrawals = user.Withdrawal || [];
    const trades = user.Trade || [];
    const portfolio = user.Portfolio;

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    if (period === "monthly") {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === "quarterly") {
      startDate.setMonth(now.getMonth() - 3);
    } else if (period === "yearly") {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const filteredDeposits = deposits.filter((d) => d.createdAt >= startDate);
    const filteredWithdrawals = withdrawals.filter(
      (w) => w.createdAt >= startDate
    );
    const filteredTrades = trades.filter((t) => t.createdAt >= startDate);

    // Calculate metrics
    const totalDeposits = filteredDeposits.reduce(
      (sum, d) => sum + parseFloat(d.amount.toString()),
      0
    );
    const totalWithdrawals = filteredWithdrawals.reduce(
      (sum, w) => sum + parseFloat(w.amount.toString()),
      0
    );
    const totalTradingProfit = filteredTrades.reduce(
      (sum, t) => sum + parseFloat(t.profit.toString()),
      0
    );
    const totalTradingFees = filteredTrades.reduce(
      (sum, t) => sum + parseFloat(t.commission.toString()),
      0
    );

    const currentBalance = portfolio
      ? parseFloat(portfolio.balance.toString())
      : 0;
    const assets = (portfolio?.assets as any[]) || [];
    const assetValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
    const totalPortfolioValue = currentBalance + assetValue;

    // Generate report based on type
    let reportData: any = {};

    if (reportType === "summary") {
      reportData = {
        type: "Portfolio Summary",
        period: period.charAt(0).toUpperCase() + period.slice(1),
        generatedAt: new Date().toISOString(),
        metrics: {
          portfolioValue: totalPortfolioValue,
          cashBalance: currentBalance,
          assetValue: assetValue,
          totalDeposits,
          totalWithdrawals,
          netCashFlow: totalDeposits - totalWithdrawals,
          tradingProfit: totalTradingProfit,
          tradingFees: totalTradingFees,
          netProfit: totalTradingProfit - totalTradingFees,
          totalTrades: filteredTrades.length,
          winningTrades: filteredTrades.filter(
            (t) => parseFloat(t.profit.toString()) > 0
          ).length,
        },
        breakdown: {
          deposits: filteredDeposits.map((d) => ({
            date: d.createdAt.toISOString(),
            amount: parseFloat(d.amount.toString()),
            currency: d.currency,
            method: d.method || "Unknown",
          })),
          withdrawals: filteredWithdrawals.map((w) => ({
            date: w.createdAt.toISOString(),
            amount: parseFloat(w.amount.toString()),
            currency: w.currency,
          })),
          trades: filteredTrades.slice(0, 10).map((t) => ({
            date: t.createdAt.toISOString(),
            symbol: t.symbol,
            side: t.side,
            profit: parseFloat(t.profit.toString()),
            commission: parseFloat(t.commission.toString()),
          })),
        },
      };
    } else if (reportType === "tax") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const taxTrades = trades.filter(
        (t) => t.createdAt >= yearStart && t.status === "CLOSED"
      );
      const taxableGains = taxTrades.reduce((sum, t) => {
        const profit = parseFloat(t.profit.toString());
        return sum + (profit > 0 ? profit : 0);
      }, 0);
      const taxableLosses = taxTrades.reduce((sum, t) => {
        const profit = parseFloat(t.profit.toString());
        return sum + (profit < 0 ? Math.abs(profit) : 0);
      }, 0);

      reportData = {
        type: "Tax Report",
        period: `Year ${now.getFullYear()}`,
        generatedAt: new Date().toISOString(),
        taxSummary: {
          totalTrades: taxTrades.length,
          capitalGains: taxableGains,
          capitalLosses: taxableLosses,
          netCapitalGains: taxableGains - taxableLosses,
          estimatedTax: (taxableGains - taxableLosses) * 0.2, // 20% estimate
        },
        tradingActivity: taxTrades.map((t) => ({
          date: t.createdAt.toISOString(),
          symbol: t.symbol,
          side: t.side,
          entryPrice: parseFloat(t.entryPrice.toString()),
          exitPrice: parseFloat(t.exitPrice?.toString() || "0"),
          quantity: parseFloat(t.quantity.toString()),
          profit: parseFloat(t.profit.toString()),
          commission: parseFloat(t.commission.toString()),
        })),
      };
    } else if (reportType === "performance") {
      reportData = {
        type: "Performance Report",
        period: period.charAt(0).toUpperCase() + period.slice(1),
        generatedAt: new Date().toISOString(),
        performance: {
          totalReturn: totalTradingProfit,
          totalReturnPercent:
            totalPortfolioValue > 0
              ? (totalTradingProfit / totalPortfolioValue) * 100
              : 0,
          winRate:
            filteredTrades.length > 0
              ? (filteredTrades.filter(
                  (t) => parseFloat(t.profit.toString()) > 0
                ).length /
                  filteredTrades.length) *
                100
              : 0,
          averageProfit:
            filteredTrades.length > 0
              ? totalTradingProfit / filteredTrades.length
              : 0,
          bestTrade: filteredTrades.reduce(
            (best, t) => {
              const profit = parseFloat(t.profit.toString());
              return profit > best.profit
                ? { symbol: t.symbol, profit, date: t.createdAt }
                : best;
            },
            { symbol: "N/A", profit: 0, date: now }
          ),
          worstTrade: filteredTrades.reduce(
            (worst, t) => {
              const profit = parseFloat(t.profit.toString());
              return profit < worst.profit
                ? { symbol: t.symbol, profit, date: t.createdAt }
                : worst;
            },
            { symbol: "N/A", profit: 0, date: now }
          ),
        },
      };
    }

    return NextResponse.json({
      success: true,
      report: reportData,
    });
  } catch (error) {
    console.error("Error generating financial report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
