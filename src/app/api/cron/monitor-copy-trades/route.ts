import { NextRequest, NextResponse } from "next/server";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";
import { prisma } from "@/lib/prisma";
import { closeCopyTrade } from "@/lib/copy-trade-execution";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/monitor-copy-trades
 * Monitors active copy trade executions and checks for expired trades
 *
 * This cron job runs periodically to:
 * 1. Check for any trades that should have been closed but weren't
 * 2. Monitor open positions for risk management
 * 3. Provide statistics and health checks
 *
 * Should be called every 5-10 minutes via external cron service
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      console.error("❌ [Copy Trade Monitor] CRON_SECRET not configured");
      return createErrorResponse(
        "Configuration error",
        "CRON_SECRET not configured",
        undefined,
        500,
      );
    }

    if (token !== expectedSecret) {
      console.error("❌ [Copy Trade Monitor] Invalid cron secret");
      return createErrorResponse(
        "Unauthorized",
        "Invalid cron secret",
        undefined,
        401,
      );
    }

    console.log("🔍 [Copy Trade Monitor] Starting monitoring check...");

    // Get all open copy trade executions
    const openExecutions = await prisma.copyTradeExecution.findMany({
      where: {
        status: "OPEN",
      },
      include: {
        CopyTrading: true,
        User: {
          include: {
            Portfolio: true,
          },
        },
      },
      orderBy: {
        openedAt: "asc",
      },
    });

    console.log(
      `📊 [Copy Trade Monitor] Found ${openExecutions.length} open executions`,
    );

    // Check for stale trades (open for more than 24 hours)
    const staleTrades = openExecutions.filter((exec) => {
      const hoursSinceOpen =
        (Date.now() - exec.openedAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceOpen > 24;
    });

    if (staleTrades.length > 0) {
      console.warn(
        `⚠️ [Copy Trade Monitor] Found ${staleTrades.length} stale trades (open >24h)`,
      );
    }

    // Calculate total exposure per user
    const userExposureMap = new Map<string, number>();
    openExecutions.forEach((exec) => {
      const userId = exec.userId;
      const currentExposure = userExposureMap.get(userId) || 0;
      userExposureMap.set(
        userId,
        currentExposure + parseFloat(exec.amount.toString()),
      );
    });

    // Check for users with high exposure (>50% of their traderoom balance)
    const highExposureUsers: Array<{
      userId: string;
      email: string;
      exposure: number;
      balance: number;
      exposurePercent: number;
    }> = [];

    for (const [userId, exposure] of userExposureMap.entries()) {
      const execution = openExecutions.find((e) => e.userId === userId);
      if (execution?.User?.Portfolio) {
        const balance = parseFloat(
          execution.User.Portfolio.traderoomBalance.toString(),
        );
        const exposurePercent = (exposure / (balance + exposure)) * 100;

        if (exposurePercent > 50) {
          highExposureUsers.push({
            userId,
            email: execution.User.email || "Unknown",
            exposure,
            balance,
            exposurePercent: Math.round(exposurePercent),
          });
        }
      }
    }

    if (highExposureUsers.length > 0) {
      console.warn(
        `⚠️ [Copy Trade Monitor] ${highExposureUsers.length} users have high exposure (>50%)`,
      );
    }

    // Get statistics by trader
    const traderStats = new Map<
      string,
      { openTrades: number; totalExposure: number }
    >();

    openExecutions.forEach((exec) => {
      const traderName = exec.CopyTrading.traderName;
      const stats = traderStats.get(traderName) || {
        openTrades: 0,
        totalExposure: 0,
      };
      stats.openTrades++;
      stats.totalExposure += parseFloat(exec.amount.toString());
      traderStats.set(traderName, stats);
    });

    const traderStatsArray = Array.from(traderStats.entries()).map(
      ([trader, stats]) => ({
        trader,
        openTrades: stats.openTrades,
        totalExposure: stats.totalExposure.toFixed(2),
      }),
    );

    // Get active copy trading relationships
    const activeCopyRelationships = await prisma.copyTrading.count({
      where: { status: "ACTIVE" },
    });

    const pausedCopyRelationships = await prisma.copyTrading.count({
      where: { status: "PAUSED" },
    });

    // Get closed executions from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentClosedExecutions = await prisma.copyTradeExecution.findMany({
      where: {
        status: "CLOSED",
        closedAt: {
          gte: yesterday,
        },
      },
      select: {
        profit: true,
        userProfit: true,
        traderProfit: true,
      },
    });

    const last24hStats = {
      closedTrades: recentClosedExecutions.length,
      totalProfit: recentClosedExecutions
        .reduce((sum, exec) => sum + parseFloat(exec.profit.toString()), 0)
        .toFixed(2),
      totalUserProfit: recentClosedExecutions
        .reduce((sum, exec) => sum + parseFloat(exec.userProfit.toString()), 0)
        .toFixed(2),
      totalTraderShare: recentClosedExecutions
        .reduce(
          (sum, exec) => sum + parseFloat(exec.traderProfit.toString()),
          0,
        )
        .toFixed(2),
    };

    console.log(
      `✅ [Copy Trade Monitor] Monitoring complete. Active relationships: ${activeCopyRelationships}, Open executions: ${openExecutions.length}`,
    );

    return createSuccessResponse(
      {
        timestamp: new Date().toISOString(),
        relationships: {
          active: activeCopyRelationships,
          paused: pausedCopyRelationships,
        },
        executions: {
          open: openExecutions.length,
          stale: staleTrades.length,
        },
        exposure: {
          totalUsers: userExposureMap.size,
          highExposureUsers: highExposureUsers.length,
          details: highExposureUsers,
        },
        traderStats: traderStatsArray,
        last24h: last24hStats,
      },
      "Copy trade monitoring complete",
    );
  } catch (error) {
    console.error("❌ [Copy Trade Monitor] Error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to monitor copy trades",
      error,
      500,
    );
  }
}
