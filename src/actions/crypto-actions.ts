"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { sendWebPushToUser } from "@/lib/push-notifications";
import { getCurrencySymbol } from "@/lib/currencies";
import { generateId } from "@/lib/generate-id";

/**
 * React 19 Server Action for buying cryptocurrency
 * Replaces the /api/crypto/buy endpoint
 */

const CRYPTO_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  XRP: "Ripple",
  TRX: "Tron",
  TON: "Toncoin",
  LTC: "Litecoin",
  BCH: "Bitcoin Cash",
  ETC: "Ethereum Classic",
  USDC: "USD Coin",
  USDT: "Tether",
  BNB: "Binance Coin",
  SOL: "Solana",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  DOT: "Polkadot",
  MATIC: "Polygon",
  AVAX: "Avalanche",
  LINK: "Chainlink",
  UNI: "Uniswap",
  ATOM: "Cosmos",
};

interface BuyCryptoResult {
  success: boolean;
  error?: string;
  data?: {
    asset: string;
    amount: number;
    value: number;
    balance: number;
  };
}

export async function buyCryptoAction(
  symbol: string,
  amount: number,
  price: number
): Promise<BuyCryptoResult> {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    // Validate inputs
    if (!symbol || !amount || !price) {
      return { success: false, error: "Missing required fields" };
    }

    if (amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    // Calculate total cost in USD
    const totalCostUSD = amount * price;

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Create portfolio if it doesn't exist
    let portfolio = user.Portfolio;
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          id: `portfolio_${user.id}`,
          userId: user.id,
          balance: 0,
          balanceCurrency: user.preferredCurrency || "USD",
          assets: { assets: [] },
        },
      });
    }

    const currentBalance = parseFloat(portfolio.balance.toString());
    const balanceCurrency = portfolio.balanceCurrency || "USD";

    // Convert totalCost from USD to the portfolio's balance currency for comparison and deduction
    let totalCostInBalanceCurrency = totalCostUSD;
    if (balanceCurrency !== "USD") {
      const { getExchangeRates, convertCurrency } = await import(
        "@/lib/currencies"
      );
      const exchangeRates = await getExchangeRates();
      totalCostInBalanceCurrency = convertCurrency(
        totalCostUSD,
        balanceCurrency,
        exchangeRates
      );
    }

    // Check if user has enough balance (in their currency)
    if (currentBalance < totalCostInBalanceCurrency) {
      return {
        success: false,
        error: `Insufficient balance. You need ${getCurrencySymbol(
          balanceCurrency
        )}${totalCostInBalanceCurrency.toFixed(2)} but have ${getCurrencySymbol(
          balanceCurrency
        )}${currentBalance.toFixed(2)}`,
      };
    }

    // Parse existing assets
    let assets: Array<{ symbol: string; amount: number }> = [];
    if (portfolio.assets && typeof portfolio.assets === "object") {
      if (Array.isArray(portfolio.assets)) {
        assets = portfolio.assets as Array<{ symbol: string; amount: number }>;
      } else {
        assets = (portfolio.assets as any).assets || [];
      }
    }

    // Update or add crypto to assets
    const existingAssetIndex = assets.findIndex((a) => a.symbol === symbol);

    let updatedAssets;
    if (existingAssetIndex >= 0) {
      // Add to existing asset
      updatedAssets = assets.map((asset, index) =>
        index === existingAssetIndex
          ? { ...asset, amount: asset.amount + amount }
          : asset
      );
    } else {
      // Add new asset with full structure
      const cryptoName = CRYPTO_NAMES[symbol] || symbol;
      updatedAssets = [
        ...assets,
        {
          symbol,
          name: cryptoName,
          amount,
          averagePrice: price,
          totalInvested: totalCostUSD,
        },
      ];
    }

    // Use transaction to atomically update portfolio and create trade record
    const [updatedPortfolio, trade] = await prisma.$transaction([
      prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: {
            decrement: new Decimal(totalCostInBalanceCurrency),
          },
          assets: updatedAssets,
        },
      }),
      prisma.trade.create({
        data: {
          id: generateId(),
          userId: user.id,
          symbol: symbol,
          side: "BUY",
          entryPrice: new Decimal(price),
          quantity: new Decimal(amount),
          profit: new Decimal(0),
          commission: new Decimal(0),
          status: "CLOSED",
          openedAt: new Date(),
          closedAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            method: "USD_BALANCE",
            cryptoSymbol: symbol,
            cryptoAmount: amount,
            pricePerUnit: price,
            totalCostUSD: totalCostUSD,
            totalCostInBalanceCurrency: totalCostInBalanceCurrency,
            balanceCurrency: balanceCurrency,
            purchaseType: "SPOT",
          },
        },
      }),
    ]);

    const newBalance = parseFloat(updatedPortfolio.balance.toString());

    // Create notification
    const cryptoName = CRYPTO_NAMES[symbol] || symbol;
    const currencySymbol = getCurrencySymbol(balanceCurrency);
    const displayAmount = Math.round(totalCostInBalanceCurrency * 100) / 100;

    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "TRADE",
        title: "Crypto Purchase Successful",
        message: `You successfully purchased ${amount.toFixed(
          8
        )} ${symbol} (${cryptoName}) for ${currencySymbol}${displayAmount.toFixed(
          2
        )}`,
        amount: displayAmount,
        asset: balanceCurrency,
        read: false,
        createdAt: new Date(),
      },
    });

    // Send push notification
    try {
      await sendWebPushToUser(user.id, {
        title: "Crypto Purchase Successful",
        body: `You purchased ${amount.toFixed(
          8
        )} ${symbol} for ${currencySymbol}${displayAmount.toFixed(2)}`,
        icon: `/crypto/${symbol.toLowerCase()}.png`,
      });
    } catch (pushError) {
      console.error("Push notification failed:", pushError);
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/traderoom");

    return {
      success: true,
      data: {
        asset: symbol,
        amount,
        value: totalCostUSD,
        balance: newBalance,
      },
    };
  } catch (error) {
    console.error("Buy crypto action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to buy crypto",
    };
  }
}

/**
 * React 19 Server Action for selling cryptocurrency
 * Replaces the /api/crypto/sell endpoint
 */
export async function sellCryptoAction(
  symbol: string,
  amount: number,
  price: number
): Promise<BuyCryptoResult> {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    // Validate inputs
    if (!symbol || !amount || !price) {
      return { success: false, error: "Missing required fields" };
    }

    if (amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    // Calculate total value in USD
    const totalValueUSD = amount * price;
    const feeUSD = totalValueUSD * 0.015; // 1.5% fee
    const netReceivedUSD = totalValueUSD - feeUSD;

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!user.Portfolio) {
      return { success: false, error: "Portfolio not found" };
    }

    const portfolio = user.Portfolio;
    const balanceCurrency = portfolio.balanceCurrency || "USD";

    // Convert netReceived from USD to the portfolio's balance currency
    let netReceivedInBalanceCurrency = netReceivedUSD;
    if (balanceCurrency !== "USD") {
      const { getExchangeRates, convertCurrency } = await import(
        "@/lib/currencies"
      );
      const exchangeRates = await getExchangeRates();
      netReceivedInBalanceCurrency = convertCurrency(
        netReceivedUSD,
        balanceCurrency,
        exchangeRates
      );
    }

    // Parse existing assets
    let assets: Array<{ symbol: string; amount: number; name?: string }> = [];
    if (portfolio.assets && typeof portfolio.assets === "object") {
      if (Array.isArray(portfolio.assets)) {
        assets = portfolio.assets as Array<{
          symbol: string;
          amount: number;
          name?: string;
        }>;
      } else {
        assets = (portfolio.assets as any).assets || [];
      }
    }

    // Find the asset
    const assetIndex = assets.findIndex((a) => a.symbol === symbol);

    if (assetIndex === -1) {
      return {
        success: false,
        error: `You don't own any ${symbol}`,
      };
    }

    const currentAsset = assets[assetIndex];

    // Check if user has enough
    if (currentAsset.amount < amount) {
      return {
        success: false,
        error: `Insufficient ${symbol}. You have ${currentAsset.amount} but tried to sell ${amount}`,
      };
    }

    // Update assets array
    let updatedAssets;
    if (currentAsset.amount === amount) {
      // Remove asset completely if selling all
      updatedAssets = assets.filter((a) => a.symbol !== symbol);
    } else {
      // Reduce amount
      updatedAssets = assets.map((a) =>
        a.symbol === symbol ? { ...a, amount: a.amount - amount } : a
      );
    }

    // Use transaction to atomically update portfolio and create trade record
    const [updatedPortfolio, trade] = await prisma.$transaction([
      prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: {
            increment: new Decimal(netReceivedInBalanceCurrency),
          },
          assets: updatedAssets,
        },
      }),
      prisma.trade.create({
        data: {
          id: generateId(),
          userId: user.id,
          symbol: symbol,
          side: "SELL",
          entryPrice: new Decimal(price),
          quantity: new Decimal(amount),
          profit: new Decimal(netReceivedUSD - amount * price),
          commission: new Decimal(feeUSD),
          status: "CLOSED",
          openedAt: new Date(),
          closedAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            method: "USD_BALANCE",
            cryptoSymbol: symbol,
            cryptoAmount: amount,
            pricePerUnit: price,
            totalValue: totalValueUSD,
            fee: feeUSD,
            netReceived: netReceivedUSD,
            netReceivedInBalanceCurrency: netReceivedInBalanceCurrency,
            balanceCurrency: balanceCurrency,
            saleType: "SPOT",
          },
        },
      }),
    ]);

    const newBalance = parseFloat(updatedPortfolio.balance.toString());

    // Create notification
    const cryptoName = CRYPTO_NAMES[symbol] || symbol;
    const currencySymbol = getCurrencySymbol(balanceCurrency);
    const displayAmount = Math.round(netReceivedInBalanceCurrency * 100) / 100;

    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "TRADE",
        title: "Crypto Sale Successful",
        message: `You successfully sold ${amount.toFixed(
          8
        )} ${symbol} (${cryptoName}) for ${currencySymbol}${displayAmount.toFixed(
          2
        )}`,
        amount: displayAmount,
        asset: balanceCurrency,
        read: false,
        createdAt: new Date(),
      },
    });

    // Send push notification
    try {
      await sendWebPushToUser(user.id, {
        title: "Crypto Sale Successful",
        body: `You sold ${amount.toFixed(
          8
        )} ${symbol} for ${currencySymbol}${displayAmount.toFixed(2)}`,
        icon: `/crypto/${symbol.toLowerCase()}.png`,
      });
    } catch (pushError) {
      console.error("Push notification failed:", pushError);
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/traderoom");

    return {
      success: true,
      data: {
        asset: symbol,
        amount,
        value: netReceivedUSD,
        balance: newBalance,
      },
    };
  } catch (error) {
    console.error("Sell crypto action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sell crypto",
    };
  }
}
