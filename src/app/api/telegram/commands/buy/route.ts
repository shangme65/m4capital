import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrencySymbol } from "@/lib/currencies";
import {
  sendTelegramMessage,
  sendInlineKeyboard,
  getUserByTelegramId,
  formatCurrency,
  convertCurrency,
  trackTelegramActivity,
  getCryptoPrice,
} from "@/lib/telegram-bot-helper";
import { generateId } from "@/lib/generate-id";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/commands/buy
 * Handle crypto purchase via Telegram
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

    // Parse command - format: /buy BTC 100 or /buy bitcoin 100
    const parts = command.trim().split(/\s+/);

    if (parts.length < 3) {
      const userCurrency = user.preferredCurrency || "USD";
      const currSymbol = getCurrencySymbol(userCurrency);
      await sendTelegramMessage(
        chatId,
        `💎 *Buy Cryptocurrency*\n\nUsage:\n\`/buy SYMBOL AMOUNT\`\n\nExamples:\n\`/buy BTC 100\` - Buy ${currSymbol}100 worth of Bitcoin\n\`/buy ETH 50\` - Buy ${currSymbol}50 worth of Ethereum\n\`/buy bitcoin 200\` - Buy ${currSymbol}200 worth of Bitcoin\n\n*Supported:* BTC, ETH, XRP, TRX, TON, LTC, BCH, ETC, USDT, USDC\n\n*Note:* Amount is in your preferred currency (${userCurrency})`
      );
      return NextResponse.json({ success: true });
    }

    let cryptoSymbol = parts[1].toUpperCase();
    const amountInUserCurrency = parseFloat(parts[2]);

    // Map common names to symbols
    const symbolMap: Record<string, string> = {
      BITCOIN: "BTC",
      ETHEREUM: "ETH",
      RIPPLE: "XRP",
      TRON: "TRX",
      TON: "TON",
      LITECOIN: "LTC",
      "BITCOIN-CASH": "BCH",
      "ETHEREUM-CLASSIC": "ETC",
      TETHER: "USDT",
      "USD-COIN": "USDC",
    };

    if (symbolMap[cryptoSymbol]) {
      cryptoSymbol = symbolMap[cryptoSymbol];
    }

    // Supported cryptocurrencies
    const supportedCryptos = [
      "BTC",
      "ETH",
      "XRP",
      "TRX",
      "TON",
      "LTC",
      "BCH",
      "ETC",
      "USDT",
      "USDC",
    ];

    if (!supportedCryptos.includes(cryptoSymbol)) {
      await sendTelegramMessage(
        chatId,
        `❌ *Unsupported Cryptocurrency*\n\nWe currently support:\n${supportedCryptos.join(
          ", "
        )}\n\nPlease choose from the supported list.`
      );
      return NextResponse.json({ success: true });
    }

    // Validate amount
    if (isNaN(amountInUserCurrency) || amountInUserCurrency <= 0) {
      await sendTelegramMessage(
        chatId,
        "❌ *Invalid Amount*\n\nPlease enter a valid positive number."
      );
      return NextResponse.json({ success: true });
    }

    // Convert amount from user's currency to USD (for crypto purchase)
    const userCurrency = user.preferredCurrency || "USD";
    const amountUSD = await convertCurrency(
      amountInUserCurrency,
      userCurrency,
      "USD"
    );

    // Check balance
    const balance = parseFloat(user.Portfolio.balance.toString());
    const balanceCurrency = user.Portfolio.balanceCurrency || "USD";
    
    // Convert user's input amount to balance currency for comparison
    const amountInBalanceCurrency = await convertCurrency(
      amountInUserCurrency,
      userCurrency,
      balanceCurrency
    );
    
    if (balance < amountInBalanceCurrency) {
      // Convert balance to user's currency for display
      const balanceInUserCurrency = await convertCurrency(
        balance,
        balanceCurrency,
        userCurrency
      );
      await sendTelegramMessage(
        chatId,
        `❌ *Insufficient Balance*\n\nYour balance: ${formatCurrency(
          balanceInUserCurrency,
          userCurrency
        )}\nRequired: ${formatCurrency(
          amountInUserCurrency,
          userCurrency
        )}\n\nUse /deposit to add funds.`
      );
      return NextResponse.json({ success: true });
    }

    // Get current crypto price (using symbol, not CoinGecko ID)
    const currentPrice = await getCryptoPrice(cryptoSymbol);

    if (!currentPrice) {
      await sendTelegramMessage(
        chatId,
        `❌ *Price Error*\n\nCouldn't fetch current price for ${cryptoSymbol}. Please try again.`
      );
      return NextResponse.json({ success: true });
    }

    // Calculate crypto amount
    const cryptoAmount = amountUSD / currentPrice;

    // Perform the purchase in a transaction
    await prisma.$transaction(async (tx) => {
      // Deduct USD from balance
      await tx.portfolio.update({
        where: { id: user.Portfolio!.id },
        data: {
          balance: {
            decrement: amountUSD,
          },
        },
      });

      // Get current portfolio assets
      const portfolio = await tx.portfolio.findUnique({
        where: { id: user.Portfolio!.id },
      });

      const assets = (portfolio?.assets as any[]) || [];

      // Check if user already has this asset
      const existingAssetIndex = assets.findIndex(
        (a) => a.symbol === cryptoSymbol
      );

      let updatedAssets;
      if (existingAssetIndex >= 0) {
        // Update existing asset
        const existingAsset = assets[existingAssetIndex];
        updatedAssets = [...assets];
        updatedAssets[existingAssetIndex] = {
          ...existingAsset,
          amount: Number(existingAsset.amount) + cryptoAmount,
          price: currentPrice,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        // Add new asset
        updatedAssets = [
          ...assets,
          {
            symbol: cryptoSymbol,
            amount: cryptoAmount,
            price: currentPrice,
            lastUpdated: new Date().toISOString(),
          },
        ];
      }

      // Update portfolio with new assets
      await tx.portfolio.update({
        where: { id: user.Portfolio!.id },
        data: {
          assets: updatedAssets,
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          id: generateId(),
          userId: user.id,
          type: "TRADE",
          title: "Crypto Purchase",
          message: `Bought ${cryptoAmount.toFixed(
            8
          )} ${cryptoSymbol} for ${formatCurrency(
            amountInUserCurrency,
            userCurrency
          )} via Telegram`,
          amount: amountUSD,
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
          side: "BUY",
          entryPrice: currentPrice,
          quantity: cryptoAmount,
          status: "CLOSED",
          openedAt: new Date(),
          closedAt: new Date(),
          exitPrice: currentPrice,
          updatedAt: new Date(),
          metadata: {
            totalUSD: amountUSD,
            source: "telegram",
          },
        },
      });
    });

    // Calculate values for confirmation message
    const valueInUserCurrency = await convertCurrency(
      amountUSD,
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
      `✅ *Purchase Successful!*\n\n💎 *Crypto:* ${cryptoSymbol}\n📊 *Amount:* ${cryptoAmount.toFixed(
        8
      )} ${cryptoSymbol}\n💰 *Price:* ${formatCurrency(
        priceInUserCurrency,
        userCurrency
      )}\n💵 *Total Cost:* ${formatCurrency(
        valueInUserCurrency,
        userCurrency
      )}\n\n_Purchase completed via Telegram_\n\nUse /portfolio to view your updated holdings.`
    );

    // Track activity
    await trackTelegramActivity(user.id, "/buy", {
      telegramId: telegramId.toString(),
      crypto: cryptoSymbol,
      amount: amountInUserCurrency,
      cryptoAmount,
      currency: userCurrency,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling /buy command:", error);

    try {
      const { chatId } = await req.json();
      await sendTelegramMessage(
        chatId,
        "❌ Purchase failed. Please try again or contact support."
      );
    } catch {}

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
