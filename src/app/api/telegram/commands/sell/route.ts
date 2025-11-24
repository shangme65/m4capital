import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendTelegramMessage,
  getUserByTelegramId,
  formatCurrency,
  convertCurrency,
  trackTelegramActivity,
  getCryptoPrice,
} from "@/lib/telegram-bot-helper";
import { generateId } from "@/lib/generate-id";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/commands/sell
 * Handle crypto sell via Telegram
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegramId, chatId, command } = body;

    if (!telegramId || !chatId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user by Telegram ID
    const user = await getUserByTelegramId(BigInt(telegramId));

    if (!user) {
      await sendTelegramMessage(
        chatId,
        "⚠️ *Account Not Linked*\n\nPlease link your M4Capital account first using the `/link` command."
      );
      return NextResponse.json({ success: true });
    }

    if (!user.Portfolio) {
      await sendTelegramMessage(
        chatId,
        "⚠️ *No Portfolio Found*\n\nPlease contact support."
      );
      return NextResponse.json({ success: true });
    }

    // Parse command - format: /sell BTC 0.001 or /sell BTC all
    const parts = command.trim().split(/\s+/);

    if (parts.length < 3) {
      await sendTelegramMessage(
        chatId,
        `💎 *Sell Cryptocurrency*\n\nUsage:\n\`/sell SYMBOL AMOUNT\`\n\`/sell SYMBOL all\`\n\nExamples:\n\`/sell BTC 0.01\` - Sell 0.01 Bitcoin\n\`/sell ETH all\` - Sell all Ethereum\n\n*Your Holdings:*\nUse /portfolio to view your crypto assets.\n\n*Note:* Proceeds will be added to your ${
          user.preferredCurrency || "USD"
        } balance`
      );
      return NextResponse.json({ success: true });
    }

    let cryptoSymbol = parts[1].toUpperCase();
    const amountStr = parts[2].toLowerCase();

    // Get current portfolio assets
    const assets = (user.Portfolio.assets as any[]) || [];

    // Find the asset
    const assetIndex = assets.findIndex((a) => a.symbol === cryptoSymbol);

    if (assetIndex < 0) {
      await sendTelegramMessage(
        chatId,
        `❌ *Asset Not Found*\n\nYou don't have any ${cryptoSymbol} in your portfolio.\n\nUse /portfolio to view your holdings.`
      );
      return NextResponse.json({ success: true });
    }

    const asset = assets[assetIndex];
    const availableAmount = Number(asset.amount || 0);

    if (availableAmount <= 0) {
      await sendTelegramMessage(
        chatId,
        `❌ *No ${cryptoSymbol} Available*\n\nYour ${cryptoSymbol} balance is zero.`
      );
      return NextResponse.json({ success: true });
    }

    // Determine amount to sell
    let sellAmount: number;
    if (amountStr === "all") {
      sellAmount = availableAmount;
    } else {
      sellAmount = parseFloat(amountStr);
      if (isNaN(sellAmount) || sellAmount <= 0) {
        await sendTelegramMessage(
          chatId,
          "❌ *Invalid Amount*\n\nPlease enter a valid positive number or 'all'."
        );
        return NextResponse.json({ success: true });
      }
    }

    // Check if user has enough
    if (sellAmount > availableAmount) {
      await sendTelegramMessage(
        chatId,
        `❌ *Insufficient ${cryptoSymbol}*\n\nYou have: ${availableAmount.toFixed(
          8
        )} ${cryptoSymbol}\nTrying to sell: ${sellAmount.toFixed(
          8
        )} ${cryptoSymbol}`
      );
      return NextResponse.json({ success: true });
    }

    // Get current crypto price
    const coinGeckoIds: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      XRP: "ripple",
      TRX: "tron",
      TON: "the-open-network",
      LTC: "litecoin",
      BCH: "bitcoin-cash",
      ETC: "ethereum-classic",
      USDT: "tether",
      USDC: "usd-coin",
    };

    const currentPrice = await getCryptoPrice(
      coinGeckoIds[cryptoSymbol] || cryptoSymbol.toLowerCase()
    );

    if (!currentPrice) {
      await sendTelegramMessage(
        chatId,
        `❌ *Price Error*\n\nCouldn't fetch current price for ${cryptoSymbol}. Please try again.`
      );
      return NextResponse.json({ success: true });
    }

    // Calculate sale value in USD
    const saleValueUSD = sellAmount * currentPrice;
    const userCurrency = user.preferredCurrency || "USD";

    // Perform the sale in a transaction
    await prisma.$transaction(async (tx) => {
      // Update or remove asset
      const updatedAssets = [...assets];
      const remainingAmount = availableAmount - sellAmount;

      if (remainingAmount <= 0.00000001) {
        // Remove asset completely
        updatedAssets.splice(assetIndex, 1);
      } else {
        // Update asset amount
        updatedAssets[assetIndex] = {
          ...asset,
          amount: remainingAmount,
          price: currentPrice,
          lastUpdated: new Date().toISOString(),
        };
      }

      // Update portfolio
      await tx.portfolio.update({
        where: { id: user.Portfolio!.id },
        data: {
          balance: {
            increment: saleValueUSD,
          },
          assets: updatedAssets,
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          id: generateId(),
          userId: user.id,
          type: "TRADE",
          title: "Crypto Sold",
          message: `Sold ${sellAmount.toFixed(
            8
          )} ${cryptoSymbol} for ${formatCurrency(
            saleValueUSD,
            "USD"
          )} via Telegram`,
          amount: saleValueUSD,
          asset: cryptoSymbol,
          read: false,
        },
      });

      // Create trade record
      await tx.trade.create({
        data: {
          id: generateId(),
          userId: user.id,
          symbol: cryptoSymbol,
          side: "SELL",
          entryPrice: asset.price || currentPrice,
          exitPrice: currentPrice,
          quantity: sellAmount,
          status: "CLOSED",
          openedAt: new Date(),
          closedAt: new Date(),
          updatedAt: new Date(),
          profit: saleValueUSD - (asset.price || currentPrice) * sellAmount,
          metadata: {
            totalUSD: saleValueUSD,
            source: "telegram",
          },
        },
      });
    });

    // Calculate values for confirmation message
    const saleValueInUserCurrency = await convertCurrency(
      saleValueUSD,
      "USD",
      userCurrency
    );
    const priceInUserCurrency = await convertCurrency(
      currentPrice,
      "USD",
      userCurrency
    );

    await sendTelegramMessage(
      chatId,
      `✅ *Sale Successful!*\n\n💎 *Crypto:* ${cryptoSymbol}\n📊 *Amount:* ${sellAmount.toFixed(
        8
      )} ${cryptoSymbol}\n💰 *Price:* ${formatCurrency(
        priceInUserCurrency,
        userCurrency
      )}\n💵 *Total Received:* ${formatCurrency(
        saleValueInUserCurrency,
        userCurrency
      )}\n\n_Sale completed via Telegram_\n\nYour ${userCurrency} balance has been updated.\nUse /balance to check.`
    );

    // Track activity
    await trackTelegramActivity(user.id, "/sell", {
      telegramId: telegramId.toString(),
      crypto: cryptoSymbol,
      amount: sellAmount,
      saleValue: saleValueUSD,
      currency: userCurrency,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling /sell command:", error);

    try {
      const { chatId } = await req.json();
      await sendTelegramMessage(
        chatId,
        "❌ Sale failed. Please try again or contact support."
      );
    } catch {}

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
