import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendTelegramMessage,
  sendInlineKeyboard,
  getUserByTelegramId,
  updatePortfolioRealtime,
  formatCurrency,
  convertCurrency,
  trackTelegramActivity,
} from "@/lib/telegram-bot-helper";
import { generateId } from "@/lib/generate-id";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/commands/portfolio
 * Handle /portfolio command - Show detailed portfolio with real-time updates
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
        "❌ Failed to update portfolio. Please try again."
      );
      return NextResponse.json({ success: true });
    }

    const balance = Number(updatedPortfolio.balance);
    const assets = (updatedPortfolio.assets as any[]) || [];
    const userCurrency = user.preferredCurrency || "USD";

    // Convert balance to user's preferred currency
    const balanceInUserCurrency = await convertCurrency(
      balance,
      "USD",
      userCurrency
    );

    let responseMessage = `📊 *Your Portfolio*\n\n`;
    responseMessage += `👤 *Account:* ${user.name || user.email}\n`;
    responseMessage += `💰 *Currency:* ${userCurrency}\n`;
    responseMessage += `💵 *Cash Balance:* ${formatCurrency(
      balanceInUserCurrency,
      userCurrency
    )}\n\n`;

    if (!assets || assets.length === 0) {
      responseMessage += `📭 *No Assets*\n\nYou don't have any crypto assets yet. Use /buy to start investing!\n\n`;
    } else {
      responseMessage += `💎 *Assets:*\n\n`;

      let totalAssetValueUSD = 0;
      for (const asset of assets) {
        const amount = Number(asset.amount || 0);
        const priceUSD = Number(asset.price || 0);
        const valueUSD = amount * priceUSD;
        totalAssetValueUSD += valueUSD;

        // Convert to user's currency
        const valueInUserCurrency = await convertCurrency(
          valueUSD,
          "USD",
          userCurrency
        );
        const priceInUserCurrency = await convertCurrency(
          priceUSD,
          "USD",
          userCurrency
        );

        responseMessage += `*${asset.symbol}*\n`;
        responseMessage += `  Amount: ${amount.toFixed(8)}\n`;
        responseMessage += `  Price: ${formatCurrency(
          priceInUserCurrency,
          userCurrency
        )}\n`;
        responseMessage += `  Value: ${formatCurrency(
          valueInUserCurrency,
          userCurrency
        )}\n\n`;
      }

      const totalValueInUserCurrency = await convertCurrency(
        balance + totalAssetValueUSD,
        "USD",
        userCurrency
      );

      responseMessage += `━━━━━━━━━━━━━━━━\n`;
      responseMessage += `*Total Portfolio Value:* ${formatCurrency(
        totalValueInUserCurrency,
        userCurrency
      )}`;
    }

    responseMessage += `\n\n_Prices updated in real-time_`;

    await sendTelegramMessage(chatId, responseMessage);

    // Track activity
    await trackTelegramActivity(user.id, "/portfolio", {
      telegramId: telegramId.toString(),
      currency: userCurrency,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling /portfolio command:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
