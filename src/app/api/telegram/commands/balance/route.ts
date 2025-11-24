import { NextRequest, NextResponse } from "next/server";
import {
  sendTelegramMessage,
  getUserByTelegramId,
  updatePortfolioRealtime,
  formatCurrency,
  convertCurrency,
  trackTelegramActivity,
} from "@/lib/telegram-bot-helper";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/commands/balance
 * Handle /balance command - Show account balance with real-time updates
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegramId, chatId } = body;

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
        "⚠️ *No Portfolio Found*\n\nYour portfolio hasn't been created yet. Please contact support."
      );
      return NextResponse.json({ success: true });
    }

    // Update portfolio with real-time prices
    const updatedPortfolio = await updatePortfolioRealtime(user.id);
    if (!updatedPortfolio) {
      await sendTelegramMessage(
        chatId,
        "❌ Failed to fetch balance. Please try again."
      );
      return NextResponse.json({ success: true });
    }

    const balanceUSD = Number(updatedPortfolio.balance);
    const assets = (updatedPortfolio.assets as any[]) || [];
    const userCurrency = user.preferredCurrency || "USD";

    // Convert balance to user's preferred currency
    const balanceInUserCurrency = await convertCurrency(
      balanceUSD,
      "USD",
      userCurrency
    );

    // Calculate total portfolio value in USD
    let totalAssetValueUSD = 0;
    if (assets && assets.length > 0) {
      for (const asset of assets) {
        const assetValue = Number(asset.amount || 0) * Number(asset.price || 0);
        totalAssetValueUSD += assetValue;
      }
    }

    const totalValueUSD = balanceUSD + totalAssetValueUSD;
    const totalValueInUserCurrency = await convertCurrency(
      totalValueUSD,
      "USD",
      userCurrency
    );

    const responseMessage =
      `💼 *Account Balance*\n\n` +
      `👤 *Account:* ${user.name || user.email}\n` +
      `💱 *Currency:* ${userCurrency}\n` +
      `💵 *Cash Balance:* ${formatCurrency(
        balanceInUserCurrency,
        userCurrency
      )}\n` +
      `📊 *Total Portfolio:* ${formatCurrency(
        totalValueInUserCurrency,
        userCurrency
      )}\n\n` +
      `_Balance updated in real-time_\n\n` +
      `Use /portfolio for detailed holdings.`;

    await sendTelegramMessage(chatId, responseMessage);

    // Track activity
    await trackTelegramActivity(user.id, "/balance", {
      telegramId: telegramId.toString(),
      currency: userCurrency,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling /balance command:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
