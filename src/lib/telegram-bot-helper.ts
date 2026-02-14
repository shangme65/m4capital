/**
 * Telegram Bot Helper Functions
 * Utilities for Telegram bot operations
 */

import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";
import { formatCurrency } from "@/lib/currencies";

// Re-export formatCurrency from currencies.ts for backward compatibility
export { formatCurrency } from "@/lib/currencies";

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
 * Get crypto price from internal API (uses Binance)
 */
export async function getCryptoPrice(symbol: string): Promise<number | null> {
  try {
    console.log(`[getCryptoPrice] Fetching price for ${symbol}`);
    // Use internal API which already handles all crypto symbols correctly
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${apiUrl}/api/crypto/prices?symbols=${symbol.toUpperCase()}`;
    console.log(`[getCryptoPrice] Fetching from: ${url}`);
    
    const response = await fetch(url, {
      cache: "no-store",
    });

    console.log(`[getCryptoPrice] Response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`[getCryptoPrice] Response data:`, JSON.stringify(data, null, 2));
      if (data.prices && data.prices.length > 0) {
        console.log(`[getCryptoPrice] Returning price: ${data.prices[0].price}`);
        return data.prices[0].price;
      }
    }

    // Fallback to direct Binance API call
    console.log(`[getCryptoPrice] Falling back to Binance API`);
    const binanceSymbol = `${symbol.toUpperCase()}USDT`;
    const binanceUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`;
    console.log(`[getCryptoPrice] Binance URL: ${binanceUrl}`);
    
    const binanceResponse = await fetch(binanceUrl, { cache: "no-store" });
    console.log(`[getCryptoPrice] Binance response status: ${binanceResponse.status}`);

    if (binanceResponse.ok) {
      const binanceData = await binanceResponse.json();
      console.log(`[getCryptoPrice] Binance data:`, JSON.stringify(binanceData, null, 2));
      const price = parseFloat(binanceData.price);
      console.log(`[getCryptoPrice] Returning Binance price: ${price}`);
      return price;
    }

    console.error(`[getCryptoPrice] Both APIs failed for ${symbol}`);
    return null;
  } catch (error) {
    console.error(`[getCryptoPrice] Error fetching price for ${symbol}:`, error);
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
  // If same currency, no conversion needed
  if (from === to) return amount;
  
  const rate = await getForexRate(from, to);
  if (rate) {
    const converted = amount * rate;
    console.log(`Currency conversion: ${amount} ${from} -> ${converted} ${to} (rate: ${rate})`);
    return converted;
  }
  
  // Log error if conversion fails
  console.error(`Failed to convert currency from ${from} to ${to}, returning original amount`);
  return amount;
}

/**
 * Update user portfolio with real-time crypto prices
 * Updates prices for ALL assets, even those with 0 balance
 */
export async function updatePortfolioRealtime(userId: string) {
  try {
    console.log(`[updatePortfolioRealtime] Starting update for user ${userId}`);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Portfolio: true },
    });

    if (!user || !user.Portfolio) {
      console.error(`[updatePortfolioRealtime] User or portfolio not found for ${userId}`);
      return null;
    }

    const assets = (user.Portfolio.assets as any[]) || [];
    console.log(`[updatePortfolioRealtime] Found ${assets.length} assets in portfolio`);

    // Always update prices, even if no assets exist
    if (assets.length === 0) {
      console.log(`[updatePortfolioRealtime] No assets to update`);
      return user.Portfolio;
    }

    // Fetch all symbols at once for better performance
    const symbols = assets.map((asset) => asset.symbol).join(",");
    console.log(`[updatePortfolioRealtime] Fetching prices for symbols: ${symbols}`);
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    console.log(`[updatePortfolioRealtime] API URL: ${apiUrl}`);

    let priceMap: Record<string, number> = {};

    try {
      const response = await fetch(
        `${apiUrl}/api/crypto/prices?symbols=${symbols}`,
        {
          cache: "no-store",
        }
      );

      console.log(`[updatePortfolioRealtime] API response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`[updatePortfolioRealtime] API response data:`, JSON.stringify(data, null, 2));
        if (data.prices && Array.isArray(data.prices)) {
          data.prices.forEach((priceData: any) => {
            priceMap[priceData.symbol] = priceData.price;
            console.log(`[updatePortfolioRealtime] Mapped ${priceData.symbol} = ${priceData.price}`);
          });
        }
      } else {
        console.error(`[updatePortfolioRealtime] API request failed with status ${response.status}`);
      }
    } catch (fetchError) {
      console.error(
        "[updatePortfolioRealtime] Error fetching bulk prices, falling back to individual fetches:",
        fetchError
      );
    }

    // Update prices for all crypto assets
    const updatedAssets = await Promise.all(
      assets.map(async (asset) => {
        // Try to get price from bulk fetch first
        let currentPrice: number | null = priceMap[asset.symbol];

        // If not found, fetch individually
        if (!currentPrice) {
          console.log(`[updatePortfolioRealtime] Price not in bulk fetch for ${asset.symbol}, fetching individually`);
          currentPrice = await getCryptoPrice(asset.symbol);
          console.log(`[updatePortfolioRealtime] Individual fetch for ${asset.symbol}: ${currentPrice}`);
        }

        const finalPrice = currentPrice || asset.price || 0;
        console.log(`[updatePortfolioRealtime] Final price for ${asset.symbol}: ${finalPrice}`);

        // Always update the price, even if asset amount is 0
        return {
          ...asset,
          price: finalPrice,
          lastUpdated: new Date().toISOString(),
        };
      })
    );

    console.log(`[updatePortfolioRealtime] Updated assets:`, JSON.stringify(updatedAssets, null, 2));

    // Update portfolio with new prices
    await prisma.portfolio.update({
      where: { id: user.Portfolio.id },
      data: {
        assets: updatedAssets,
      },
    });

    console.log(`[updatePortfolioRealtime] Portfolio updated successfully`);

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
