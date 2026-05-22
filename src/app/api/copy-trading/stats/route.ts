import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/copy-trading/stats
 * Get copy trading statistics and profit share breakdown for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return createErrorResponse(
        "Unauthorized",
        "You must be logged in",
        undefined,
        401,
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return createErrorResponse(
        "User not found",
        "User account not found",
        undefined,
        404,
      );
    }

    // Get all active copy trading relationships
    const activeRelationships = await prisma.copyTrading.findMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      select: {
        id: true,
        traderName: true,
        traderImage: true,
        winRate: true,
        profitShare: true,
        startedAt: true,
      },
    });

    // Get all trade executions (both open and closed)
    const allExecutions = await prisma.copyTradeExecution.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        copyTradingId: true,
        symbol: true,
        direction: true,
        entryPrice: true,
        exitPrice: true,
        amount: true,
        status: true,
        profit: true,
        profitShare: true,
        userProfit: true,
        traderProfit: true,
        openedAt: true,
        closedAt: true,
        CopyTrading: {
          select: {
            traderName: true,
          },
        },
      },
      orderBy: {
        openedAt: "desc",
      },
    });

    // Separate open and closed executions
    const openExecutions = allExecutions.filter((e) => e.status === "OPEN");
    const closedExecutions = allExecutions.filter((e) => e.status === "CLOSED");

    // Calculate overall statistics
    const totalTrades = closedExecutions.length;
    const winningTrades = closedExecutions.filter(
      (e) => parseFloat(e.profit.toString()) > 0,
    ).length;
    const losingTrades = closedExecutions.filter(
      (e) => parseFloat(e.profit.toString()) < 0,
    ).length;
    const winRate =
      totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(2) : "0";

    // Calculate profit/loss totals
    const totalProfit = closedExecutions.reduce(
      (sum, e) => sum + parseFloat(e.profit.toString()),
      0,
    );
    const totalUserProfit = closedExecutions.reduce(
      (sum, e) => sum + parseFloat(e.userProfit.toString()),
      0,
    );
    const totalProfitSharePaid = closedExecutions.reduce(
      (sum, e) => sum + parseFloat(e.traderProfit.toString()),
      0,
    );

    // Calculate profit share percentage
    const avgProfitSharePercent =
      totalProfit > 0
        ? ((totalProfitSharePaid / totalProfit) * 100).toFixed(2)
        : "0";

    // Group executions by trader
    const traderStatsMap = new Map<
      string,
      {
        traderName: string;
        totalTrades: number;
        openTrades: number;
        closedTrades: number;
        winningTrades: number;
        losingTrades: number;
        winRate: string;
        totalProfit: number;
        userProfit: number;
        profitSharePaid: number;
        avgProfitSharePercent: string;
      }
    >();

    allExecutions.forEach((exec) => {
      const traderName = exec.CopyTrading.traderName;
      const existing = traderStatsMap.get(traderName) || {
        traderName,
        totalTrades: 0,
        openTrades: 0,
        closedTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: "0",
        totalProfit: 0,
        userProfit: 0,
        profitSharePaid: 0,
        avgProfitSharePercent: "0",
      };

      if (exec.status === "OPEN") {
        existing.openTrades++;
      } else {
        existing.closedTrades++;
        existing.totalTrades++;

        const profit = parseFloat(exec.profit.toString());
        if (profit > 0) existing.winningTrades++;
        if (profit < 0) existing.losingTrades++;

        existing.totalProfit += profit;
        existing.userProfit += parseFloat(exec.userProfit.toString());
        existing.profitSharePaid += parseFloat(exec.traderProfit.toString());
      }

      traderStatsMap.set(traderName, existing);
    });

    // Calculate win rate and profit share percentage for each trader
    const traderStats = Array.from(traderStatsMap.values()).map((stats) => ({
      ...stats,
      winRate:
        stats.totalTrades > 0
          ? ((stats.winningTrades / stats.totalTrades) * 100).toFixed(2)
          : "0",
      avgProfitSharePercent:
        stats.totalProfit > 0
          ? ((stats.profitSharePaid / stats.totalProfit) * 100).toFixed(2)
          : "0",
      totalProfit: stats.totalProfit.toFixed(2),
      userProfit: stats.userProfit.toFixed(2),
      profitSharePaid: stats.profitSharePaid.toFixed(2),
    }));

    // Get recent closed trades (last 10)
    const recentTrades = closedExecutions.slice(0, 10).map((exec) => ({
      id: exec.id,
      traderName: exec.CopyTrading.traderName,
      symbol: exec.symbol,
      direction: exec.direction,
      entryPrice: parseFloat(exec.entryPrice.toString()),
      exitPrice: exec.exitPrice ? parseFloat(exec.exitPrice.toString()) : null,
      amount: parseFloat(exec.amount.toString()),
      profit: parseFloat(exec.profit.toString()),
      profitShare: parseFloat(exec.profitShare.toString()),
      userProfit: parseFloat(exec.userProfit.toString()),
      traderProfit: parseFloat(exec.traderProfit.toString()),
      openedAt: exec.openedAt,
      closedAt: exec.closedAt,
      isWin: parseFloat(exec.profit.toString()) > 0,
    }));

    // Calculate current open positions value
    const totalOpenPositionsValue = openExecutions.reduce(
      (sum, e) => sum + parseFloat(e.amount.toString()),
      0,
    );

    return createSuccessResponse(
      {
        summary: {
          activeTraders: activeRelationships.length,
          openPositions: openExecutions.length,
          totalTrades,
          winningTrades,
          losingTrades,
          winRate,
          totalProfit: totalProfit.toFixed(2),
          totalUserProfit: totalUserProfit.toFixed(2),
          totalProfitSharePaid: totalProfitSharePaid.toFixed(2),
          avgProfitSharePercent,
          totalOpenPositionsValue: totalOpenPositionsValue.toFixed(2),
        },
        activeRelationships: activeRelationships.map((rel) => ({
          id: rel.id,
          traderName: rel.traderName,
          traderImage: rel.traderImage,
          winRate: parseFloat(rel.winRate.toString()),
          profitShare: parseFloat(rel.profitShare.toString()),
          startedAt: rel.startedAt,
        })),
        traderStats,
        recentTrades,
        openPositions: openExecutions.map((exec) => ({
          id: exec.id,
          traderName: exec.CopyTrading.traderName,
          symbol: exec.symbol,
          direction: exec.direction,
          entryPrice: parseFloat(exec.entryPrice.toString()),
          amount: parseFloat(exec.amount.toString()),
          openedAt: exec.openedAt,
        })),
      },
      "Copy trading statistics retrieved successfully",
    );
  } catch (error) {
    console.error("❌ [Copy Trading Stats] Error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to fetch statistics",
      error,
      500,
    );
  }
}
