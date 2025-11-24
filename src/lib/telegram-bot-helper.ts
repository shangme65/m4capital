/**
 * Telegram Bot Helper Functions
 * Utilities for Telegram bot operations
 */

import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Send message to Telegram user
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  parseMode: "Markdown" | "HTML" = "Markdown"
) {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    return false;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
      }),
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
}

/**
 * Send inline keyboard to Telegram user
 */
export async function sendInlineKeyboard(
  chatId: number,
  text: string,
  buttons: Array<Array<{ text: string; callback_data?: string; url?: string }>>
) {
  if (!BOT_TOKEN) return false;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: buttons,
        },
      }),
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error("Error sending inline keyboard:", error);
    return false;
  }
}

/**
 * Get crypto price from CoinGecko
 */
export async function getCryptoPrice(symbol: string): Promise<number | null> {
  try {
    const symbolLower = symbol.toLowerCase();
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbolLower}&vs_currencies=usd`
    );

    if (response.ok) {
      const data = await response.json();
      return data[symbolLower]?.usd || null;
    }

    // Fallback to Binance
    const binanceSymbol = `${symbol.toUpperCase()}USDT`;
    const binanceResponse = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`
    );

    if (binanceResponse.ok) {
      const binanceData = await binanceResponse.json();
      return parseFloat(binanceData.lastPrice);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get forex conversion rate
 */
export async function getForexRate(
  from: string,
  to: string
): Promise<number | null> {
  if (from === to) return 1;

  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${from.toUpperCase()}&to=${to.toUpperCase()}`
    );

    if (response.ok) {
      const data = await response.json();
      return data.rates[to.toUpperCase()] || null;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching forex rate ${from}/${to}:`, error);
    return null;
  }
}

/**
 * Convert amount between currencies
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  const rate = await getForexRate(from, to);
  if (rate) {
    return amount * rate;
  }
  return amount;
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  decimals: number = 2
): string {
  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    INR: "₹",
    NGN: "₦",
    ZAR: "R",
  };

  const symbol = currencySymbols[currency] || currency + " ";
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Update user portfolio with real-time crypto prices
 */
export async function updatePortfolioRealtime(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Portfolio: true },
    });

    if (!user || !user.Portfolio) {
      return null;
    }

    const assets = (user.Portfolio.assets as any[]) || [];
    if (assets.length === 0) {
      return user.Portfolio;
    }

    // Update prices for all crypto assets
    const updatedAssets = await Promise.all(
      assets.map(async (asset) => {
        const currentPrice = await getCryptoPrice(asset.symbol);
        return {
          ...asset,
          price: currentPrice || asset.price,
          lastUpdated: new Date().toISOString(),
        };
      })
    );

    // Update portfolio with new prices
    await prisma.portfolio.update({
      where: { id: user.Portfolio.id },
      data: {
        assets: updatedAssets,
      },
    });

    return await prisma.portfolio.findUnique({
      where: { id: user.Portfolio.id },
    });
  } catch (error) {
    console.error("Error updating portfolio realtime:", error);
    return null;
  }
}

/**
 * Track user activity
 */
export async function trackTelegramActivity(
  userId: string,
  action: string,
  metadata?: any
) {
  try {
    await prisma.userActivity.create({
      data: {
        id: generateId(),
        userId,
        activityType: "TELEGRAM_COMMAND",
        action,
        metadata: metadata || {},
      },
    });
  } catch (error) {
    console.error("Error tracking activity:", error);
  }
}

/**
 * Get user by Telegram ID
 */
export async function getUserByTelegramId(telegramId: bigint | number) {
  try {
    const user = await prisma.user.findFirst({
      where: { linkedTelegramId: BigInt(telegramId) },
      include: {
        Portfolio: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error getting user by Telegram ID:", error);
    return null;
  }
}
