"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { Decimal } from "@prisma/client/runtime/library";

interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Fund traderoom action - Transfer from fiat balance to traderoom
 * @param amountInUserCurrency - Amount to deduct from user's fiat balance (in their currency)
 * @param amountUSD - Amount to credit to traderoom balance (in USD)
 */
export async function fundTraderoomAction(
  amountInUserCurrency: number,
  amountUSD?: number
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    if (!amountInUserCurrency || amountInUserCurrency <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!user.Portfolio) {
      return {
        success: false,
        error: "Portfolio not found. Please make a deposit first.",
      };
    }

    const currentBalance = Number(user.Portfolio.balance);
    const currentTraderoomBalance = Number(
      user.Portfolio.traderoomBalance || 0
    );
    const userCurrency = user.preferredCurrency || "USD";
    const currSymbol = getCurrencySymbol(userCurrency);
    
    // If amountUSD not provided, assume balance is in USD (backwards compatibility)
    const traderoomCreditAmount = amountUSD !== undefined ? amountUSD : amountInUserCurrency;

    if (currentBalance < amountInUserCurrency) {
      return {
        success: false,
        error: `Insufficient funds. You only have ${currSymbol}${currentBalance.toFixed(
          2
        )} available.`,
      };
    }

    // Transfer funds:
    // - Deduct amountInUserCurrency from fiat balance (user's currency)
    // - Credit traderoomCreditAmount to traderoom balance (USD)
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: user.Portfolio.id },
      data: {
        balance: currentBalance - amountInUserCurrency,
        traderoomBalance: currentTraderoomBalance + traderoomCreditAmount,
      },
    });

    // Create deposit record for transaction history
    await prisma.deposit.create({
      data: {
        id: generateId(),
        portfolioId: user.Portfolio.id,
        userId: user.id,
        amount: traderoomCreditAmount,
        currency: "USD",
        status: "COMPLETED",
        method: "Traderoom Fund",
        type: "TRADEROOM_FUND",
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          amountInUserCurrency: amountInUserCurrency,
          userCurrency: userCurrency,
          amountUSD: traderoomCreditAmount,
        },
      },
    });

    // Create notification with USD amount (traderoom balance is in USD)
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "TRANSACTION",
        title: "Traderoom Funded",
        message: `Successfully transferred $${traderoomCreditAmount.toFixed(
          2
        )} to your Traderoom balance`,
        amount: traderoomCreditAmount,
        asset: "USD", // Traderoom balance is always in USD
      },
    });

    revalidatePath("/traderoom");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        newFiatBalance: Number(updatedPortfolio.balance),
        newTraderoomBalance: Number(updatedPortfolio.traderoomBalance),
        transferredAmount: amountInUserCurrency,
      },
    };
  } catch (error) {
    console.error("Fund traderoom action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fund traderoom",
    };
  }
}

/**
 * Fund traderoom with crypto action - Transfer crypto to traderoom
 */
export async function fundTraderoomCryptoAction(params: {
  symbol: string;
  amount: number;
  price: number;
}): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const { symbol, amount, price } = params;

    if (!symbol || !amount || amount <= 0 || !price) {
      return { success: false, error: "Invalid parameters" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user || !user.Portfolio) {
      return { success: false, error: "Portfolio not found" };
    }

    const portfolio = user.Portfolio;
    const assets = (portfolio.assets as any[]) || [];
    const assetIndex = assets.findIndex(
      (a) => a.symbol.toUpperCase() === symbol.toUpperCase()
    );

    if (assetIndex === -1) {
      return { success: false, error: `You don't have any ${symbol}` };
    }

    const currentAssetAmount = parseFloat(assets[assetIndex].amount.toString());
    if (currentAssetAmount < amount) {
      return { success: false, error: `Insufficient ${symbol} balance` };
    }

    // Calculate value in user's currency
    const valueUSD = amount * price;
    const currentTraderoomBalance = Number(portfolio.traderoomBalance || 0);

    // Update portfolio - reduce crypto, add to traderoom balance
    const newAssetAmount = currentAssetAmount - amount;
    if (newAssetAmount <= 0.00000001) {
      assets.splice(assetIndex, 1);
    } else {
      assets[assetIndex].amount = newAssetAmount;
    }

    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        assets,
        traderoomBalance: currentTraderoomBalance + valueUSD,
      },
    });

    // Create deposit record for transaction history
    await prisma.deposit.create({
      data: {
        id: generateId(),
        portfolioId: portfolio.id,
        userId: user.id,
        amount: valueUSD,
        cryptoAmount: amount,
        currency: "USD",
        targetAsset: symbol,
        cryptoCurrency: symbol,
        status: "COMPLETED",
        method: "Traderoom Crypto Fund",
        type: "TRADEROOM_CRYPTO_FUND",
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          cryptoAmount: amount,
          priceUSD: price,
          valueUSD: valueUSD,
        },
      },
    });

    // Create notification
    const userCurrency = user.preferredCurrency || "USD";
    const currSymbol = getCurrencySymbol(userCurrency);

    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "TRANSACTION",
        title: "Traderoom Funded with Crypto",
        message: `Transferred ${amount} ${symbol} (${currSymbol}${valueUSD.toFixed(
          2
        )}) to Traderoom`,
        amount: valueUSD,
        asset: symbol,
      },
    });

    revalidatePath("/traderoom");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        symbol,
        amount,
        valueUSD,
        newTraderoomBalance: currentTraderoomBalance + valueUSD,
      },
    };
  } catch (error) {
    console.error("Fund traderoom crypto action error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fund traderoom with crypto",
    };
  }
}

/**
 * Withdraw from traderoom action - Transfer from traderoom back to fiat balance
 */
export async function withdrawFromTraderoomAction(
  amount: number
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    if (!amount || amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user || !user.Portfolio) {
      return { success: false, error: "Portfolio not found" };
    }

    const currentBalance = Number(user.Portfolio.balance);
    const currentTraderoomBalance = Number(
      user.Portfolio.traderoomBalance || 0
    );
    const userCurrency = user.preferredCurrency || "USD";
    const currSymbol = getCurrencySymbol(userCurrency);

    if (currentTraderoomBalance < amount) {
      return {
        success: false,
        error: `Insufficient traderoom balance. You only have ${currSymbol}${currentTraderoomBalance.toFixed(
          2
        )} available.`,
      };
    }

    // Transfer funds back
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: user.Portfolio.id },
      data: {
        balance: currentBalance + amount,
        traderoomBalance: currentTraderoomBalance - amount,
      },
    });

    // Create withdrawal record for transaction history
    await prisma.withdrawal.create({
      data: {
        id: generateId(),
        portfolioId: user.Portfolio.id,
        userId: user.id,
        amount,
        currency: "USD",
        status: "COMPLETED",
        method: "Traderoom Withdrawal",
        type: "TRADEROOM_WITHDRAWAL",
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          userCurrency: userCurrency,
        },
      },
    });

    // Create notification (amount is in USD as traderoom balance is USD)
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "TRANSACTION",
        title: "Traderoom Withdrawal",
        message: `Withdrew $${amount.toFixed(
          2
        )} from Traderoom to your main balance`,
        amount,
        asset: "USD", // Traderoom balance is always in USD
      },
    });

    revalidatePath("/traderoom");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        newFiatBalance: Number(updatedPortfolio.balance),
        newTraderoomBalance: Number(updatedPortfolio.traderoomBalance),
        withdrawnAmount: amount,
      },
    };
  } catch (error) {
    console.error("Withdraw from traderoom action error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to withdraw from traderoom",
    };
  }
}

/**
 * Record trade action - Record a trade in the traderoom
 */
export async function recordTradeAction(params: {
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  entryPrice: number;
  leverage?: number;
  commission?: number;
}): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const {
      symbol,
      side,
      quantity,
      entryPrice,
      leverage = 1,
      commission = 0,
    } = params;

    if (!symbol || !side || !quantity || !entryPrice) {
      return { success: false, error: "Missing required trade parameters" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Calculate trade value
    const tradeValue = quantity * entryPrice * leverage;

    // Check traderoom balance for buys
    if (side === "BUY") {
      const traderoomBalance = Number(user.Portfolio?.traderoomBalance || 0);
      if (traderoomBalance < tradeValue + commission) {
        return { success: false, error: "Insufficient traderoom balance" };
      }

      // Deduct from traderoom balance
      if (user.Portfolio) {
        await prisma.portfolio.update({
          where: { id: user.Portfolio.id },
          data: {
            traderoomBalance: traderoomBalance - tradeValue - commission,
          },
        });
      }
    }

    // Create trade record
    const trade = await prisma.trade.create({
      data: {
        id: generateId(),
        userId: user.id,
        symbol: symbol.toUpperCase(),
        side,
        entryPrice: new Decimal(entryPrice),
        quantity: new Decimal(quantity),
        leverage,
        commission: new Decimal(commission),
        status: "OPEN",
        updatedAt: new Date(),
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "TRADE",
        title: `${side} Order Placed`,
        message: `${side} ${quantity} ${symbol} at $${entryPrice.toFixed(2)}`,
        amount: tradeValue,
        asset: symbol,
      },
    });

    revalidatePath("/traderoom");

    return {
      success: true,
      data: {
        tradeId: trade.id,
        symbol,
        side,
        quantity,
        entryPrice,
        value: tradeValue,
      },
    };
  } catch (error) {
    console.error("Record trade action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record trade",
    };
  }
}

/**
 * Close trade action - Close an open trade
 */
export async function closeTradeAction(params: {
  tradeId: string;
  exitPrice: number;
}): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const { tradeId, exitPrice } = params;

    if (!tradeId || !exitPrice) {
      return { success: false, error: "Trade ID and exit price are required" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Find the trade
    const trade = await prisma.trade.findFirst({
      where: { id: tradeId, userId: user.id, status: "OPEN" },
    });

    if (!trade) {
      return { success: false, error: "Trade not found or already closed" };
    }

    // Calculate profit/loss
    const entryValue =
      Number(trade.quantity) * Number(trade.entryPrice) * trade.leverage;
    const exitValue = Number(trade.quantity) * exitPrice * trade.leverage;
    const profit =
      trade.side === "BUY" ? exitValue - entryValue : entryValue - exitValue;

    // Update trade
    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: {
        exitPrice: new Decimal(exitPrice),
        profit: new Decimal(profit),
        status: "CLOSED",
        closedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Credit profit/loss to traderoom balance
    if (user.Portfolio) {
      const currentTraderoomBalance = Number(
        user.Portfolio.traderoomBalance || 0
      );
      const returnAmount =
        trade.side === "BUY" ? exitValue : entryValue + profit;

      await prisma.portfolio.update({
        where: { id: user.Portfolio.id },
        data: {
          traderoomBalance: currentTraderoomBalance + returnAmount,
        },
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "TRADE",
        title: "Trade Closed",
        message: `Closed ${trade.symbol} position. ${
          profit >= 0 ? "Profit" : "Loss"
        }: $${Math.abs(profit).toFixed(2)}`,
        amount: profit,
        asset: trade.symbol,
      },
    });

    revalidatePath("/traderoom");

    return {
      success: true,
      data: {
        tradeId,
        symbol: trade.symbol,
        entryPrice: Number(trade.entryPrice),
        exitPrice,
        profit,
        status: "CLOSED",
      },
    };
  } catch (error) {
    console.error("Close trade action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to close trade",
    };
  }
}
