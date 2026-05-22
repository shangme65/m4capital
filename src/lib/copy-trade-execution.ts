import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";
import { sendPushNotification } from "@/lib/push-notifications";
import Decimal from "decimal.js";

interface TraderTrade {
  traderTradeId: string;
  traderName: string;
  symbol: string;
  direction: "HIGHER" | "LOWER";
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  leverage: number;
  status: "OPEN" | "CLOSED";
  openedAt: Date;
  closedAt?: Date;
}

interface ExecutionResult {
  success: boolean;
  executionId?: string;
  error?: string;
}

/**
 * Calculate position size for a user based on their balance and risk management
 * @param userBalance User's traderoom balance
 * @param traderAmount Original trader's trade amount
 * @param maxRiskPercent Maximum % of balance to risk per trade (default 5%)
 */
function calculatePositionSize(
  userBalance: number,
  traderAmount: number,
  maxRiskPercent: number = 5,
): number {
  // Calculate maximum amount user can risk
  const maxRiskAmount = (userBalance * maxRiskPercent) / 100;

  // Use the smaller of: trader's amount or user's max risk
  const positionSize = Math.min(traderAmount, maxRiskAmount);

  // Ensure minimum trade amount ($1)
  return Math.max(positionSize, 1);
}

/**
 * Execute a trade copy for all active copy trading relationships
 */
export async function executeCopyTrade(
  traderTrade: TraderTrade,
): Promise<ExecutionResult[]> {
  try {
    console.log(
      `🔄 [Copy Trade] Executing trade from ${traderTrade.traderName}`,
    );

    // Find all active copy trading relationships for this trader
    const activeCopyTrades = await prisma.copyTrading.findMany({
      where: {
        traderName: traderTrade.traderName,
        status: "ACTIVE",
      },
      include: {
        User: {
          include: {
            Portfolio: true,
          },
        },
      },
    });

    if (activeCopyTrades.length === 0) {
      console.log(
        `⚠️ [Copy Trade] No active copy traders found for ${traderTrade.traderName}`,
      );
      return [];
    }

    console.log(
      `📊 [Copy Trade] Found ${activeCopyTrades.length} active copy relationships`,
    );

    const results: ExecutionResult[] = [];

    for (const copyTrade of activeCopyTrades) {
      try {
        const user = copyTrade.User;
        const portfolio = user.Portfolio;

        if (!portfolio) {
          results.push({
            success: false,
            error: `User ${user.email} has no portfolio`,
          });
          continue;
        }

        // Get user's traderoom balance
        const traderoomBalance = parseFloat(
          portfolio.traderoomBalance.toString(),
        );

        // Calculate position size for this user
        const userAmount = calculatePositionSize(
          traderoomBalance,
          traderTrade.amount,
        );

        // Check if user has sufficient balance
        if (userAmount > traderoomBalance) {
          console.log(
            `⚠️ [Copy Trade] User ${user.email} has insufficient balance`,
          );
          results.push({
            success: false,
            error: "Insufficient balance",
          });
          continue;
        }

        // Calculate quantity based on entry price
        const quantity = userAmount / traderTrade.entryPrice;

        // Create copy trade execution record
        const execution = await prisma.copyTradeExecution.create({
          data: {
            id: generateId(),
            copyTradingId: copyTrade.id,
            userId: user.id,
            traderTradeId: traderTrade.traderTradeId,
            symbol: traderTrade.symbol,
            direction: traderTrade.direction,
            entryPrice: new Decimal(traderTrade.entryPrice),
            amount: new Decimal(userAmount),
            quantity: new Decimal(quantity),
            leverage: traderTrade.leverage,
            status: "OPEN",
            openedAt: traderTrade.openedAt,
            metadata: {
              originalTraderAmount: traderTrade.amount,
              riskPercent: 5,
            },
          },
        });

        // Deduct amount from traderoom balance
        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            traderoomBalance: {
              decrement: new Decimal(userAmount),
            },
          },
        });

        console.log(
          `✅ [Copy Trade] Executed for user ${user.email}: ${userAmount} on ${traderTrade.symbol}`,
        );

        // Create notification
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: user.id,
            type: "TRADE",
            title: `Copy Trade Opened`,
            message: `Copied ${traderTrade.traderName}'s ${traderTrade.direction} trade on ${traderTrade.symbol} for $${userAmount.toFixed(2)}`,
            metadata: {
              executionId: execution.id,
              symbol: traderTrade.symbol,
              direction: traderTrade.direction,
              amount: userAmount,
            },
          },
        });

        // Send push notification
        try {
          await sendPushNotification(
            user.id,
            "Copy Trade Opened",
            `Copied ${traderTrade.traderName}'s ${traderTrade.direction} trade on ${traderTrade.symbol}`,
            {
              type: "copy_trade",
              url: "/traderoom",
            },
          );
        } catch (pushError) {
          console.error("Failed to send push notification:", pushError);
        }

        results.push({
          success: true,
          executionId: execution.id,
        });
      } catch (userError) {
        console.error(
          `❌ [Copy Trade] Failed for user ${copyTrade.userId}:`,
          userError,
        );
        results.push({
          success: false,
          error:
            userError instanceof Error ? userError.message : "Unknown error",
        });
      }
    }

    return results;
  } catch (error) {
    console.error("❌ [Copy Trade] Execution failed:", error);
    throw error;
  }
}

/**
 * Close a copy trade execution and calculate profit/loss with profit share
 */
export async function closeCopyTrade(
  traderTrade: TraderTrade,
): Promise<ExecutionResult[]> {
  try {
    console.log(
      `🔒 [Copy Trade] Closing trades for ${traderTrade.traderTradeId}`,
    );

    // Find all open copy trade executions for this trader trade
    const openExecutions = await prisma.copyTradeExecution.findMany({
      where: {
        traderTradeId: traderTrade.traderTradeId,
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
    });

    if (openExecutions.length === 0) {
      console.log(
        `⚠️ [Copy Trade] No open executions found for trade ${traderTrade.traderTradeId}`,
      );
      return [];
    }

    console.log(
      `📊 [Copy Trade] Found ${openExecutions.length} executions to close`,
    );

    const results: ExecutionResult[] = [];

    for (const execution of openExecutions) {
      try {
        if (!traderTrade.exitPrice) {
          throw new Error("Exit price is required to close trade");
        }

        const user = execution.User;
        const portfolio = user.Portfolio;

        if (!portfolio) {
          results.push({
            success: false,
            error: `User ${user.email} has no portfolio`,
          });
          continue;
        }

        // Calculate profit/loss
        const entryPrice = parseFloat(execution.entryPrice.toString());
        const exitPrice = traderTrade.exitPrice;
        const amount = parseFloat(execution.amount.toString());
        const quantity = parseFloat(execution.quantity.toString());

        // Calculate raw profit/loss based on direction
        let rawProfit = 0;
        if (execution.direction === "HIGHER") {
          // Profit if price goes up
          rawProfit = (exitPrice - entryPrice) * quantity;
        } else {
          // Profit if price goes down
          rawProfit = (entryPrice - exitPrice) * quantity;
        }

        // Get profit share percentage from copy trading relationship
        const profitSharePercent = parseFloat(
          execution.CopyTrading.profitShare.replace("%", ""),
        );

        // Calculate profit share (only if profitable)
        let traderShare = 0;
        let userProfit = rawProfit;

        if (rawProfit > 0) {
          // Trader gets their share of the profit
          traderShare = (rawProfit * profitSharePercent) / 100;
          // User gets remaining profit after trader's share
          userProfit = rawProfit - traderShare;
        }

        // Total payout = original amount + user's profit
        const totalPayout = amount + userProfit;

        // Update execution record
        await prisma.copyTradeExecution.update({
          where: { id: execution.id },
          data: {
            exitPrice: new Decimal(exitPrice),
            status: "CLOSED",
            closedAt: traderTrade.closedAt || new Date(),
            profit: new Decimal(rawProfit),
            profitShare: new Decimal(traderShare),
            userProfit: new Decimal(userProfit),
            traderProfit: new Decimal(traderShare),
          },
        });

        // Credit user's traderoom balance with payout
        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            traderoomBalance: {
              increment: new Decimal(totalPayout),
            },
          },
        });

        console.log(
          `✅ [Copy Trade] Closed for user ${user.email}: Profit ${userProfit.toFixed(2)} (Trader share: ${traderShare.toFixed(2)})`,
        );

        // Determine notification title and message
        const isProfit = userProfit > 0;
        const title = isProfit ? "Copy Trade Won! 🎉" : "Copy Trade Closed";
        const message = isProfit
          ? `Your copy trade on ${execution.symbol} closed with $${userProfit.toFixed(2)} profit! (Trader's share: $${traderShare.toFixed(2)})`
          : `Your copy trade on ${execution.symbol} closed with $${Math.abs(userProfit).toFixed(2)} loss.`;

        // Create notification
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: user.id,
            type: "TRADE",
            title: title,
            message: message,
            metadata: {
              executionId: execution.id,
              symbol: execution.symbol,
              direction: execution.direction,
              profit: userProfit,
              traderShare: traderShare,
              rawProfit: rawProfit,
            },
          },
        });

        // Send push notification
        try {
          await sendPushNotification(user.id, title, message, {
            type: "copy_trade",
            url: "/traderoom",
          });
        } catch (pushError) {
          console.error("Failed to send push notification:", pushError);
        }

        results.push({
          success: true,
          executionId: execution.id,
        });
      } catch (userError) {
        console.error(
          `❌ [Copy Trade] Failed to close for user ${execution.userId}:`,
          userError,
        );
        results.push({
          success: false,
          error:
            userError instanceof Error ? userError.message : "Unknown error",
        });
      }
    }

    return results;
  } catch (error) {
    console.error("❌ [Copy Trade] Close failed:", error);
    throw error;
  }
}

/**
 * Get all open copy trade executions for a user
 */
export async function getUserCopyTradeExecutions(userId: string) {
  return await prisma.copyTradeExecution.findMany({
    where: {
      userId: userId,
      status: "OPEN",
    },
    include: {
      CopyTrading: true,
    },
    orderBy: {
      openedAt: "desc",
    },
  });
}

/**
 * Get copy trade execution history for a user
 */
export async function getUserCopyTradeHistory(
  userId: string,
  limit: number = 50,
) {
  return await prisma.copyTradeExecution.findMany({
    where: {
      userId: userId,
    },
    include: {
      CopyTrading: true,
    },
    orderBy: {
      closedAt: "desc",
    },
    take: limit,
  });
}

/**
 * Calculate total profit share paid to traders by a user
 */
export async function calculateTotalProfitShare(userId: string) {
  const closedTrades = await prisma.copyTradeExecution.findMany({
    where: {
      userId: userId,
      status: "CLOSED",
    },
    select: {
      traderProfit: true,
    },
  });

  const total = closedTrades.reduce((sum, trade) => {
    return sum + parseFloat(trade.traderProfit.toString());
  }, 0);

  return total;
}
