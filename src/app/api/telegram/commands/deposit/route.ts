import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendTelegramMessage,
  sendInlineKeyboard,
  getUserByTelegramId,
  formatCurrency,
  convertCurrency,
  trackTelegramActivity,
} from "@/lib/telegram-bot-helper";
import { generateId } from "@/lib/generate-id";

export const dynamic = "force-dynamic";

/**
 * Create NowPayments invoice for crypto deposit
 */
async function createCryptoDepositInvoice(
  amountUSD: number,
  userEmail: string,
  userId: string
) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error("NowPayments API key not configured");
  }

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: amountUSD,
        price_currency: "usd",
        pay_currency: "btc",
        order_id: `telegram_deposit_${userId}_${Date.now()}`,
        order_description: `M4Capital Deposit via Telegram - ${amountUSD} USD`,
        ipn_callback_url: `${process.env.NEXTAUTH_URL}/api/payment/webhook`,
        success_url: `${process.env.NEXTAUTH_URL}/dashboard`,
        cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create invoice");
    }

    const data = await response.json();
    return {
      success: true,
      invoiceUrl: data.invoice_url,
      invoiceId: data.id,
      paymentAddress: data.pay_address,
    };
  } catch (error) {
    console.error("Error creating crypto deposit invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * POST /api/telegram/commands/deposit
 * Handle deposit command via Telegram
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

    // Parse command - format: /deposit 100 or /deposit
    const parts = command.trim().split(/\s+/);

    if (parts.length < 2) {
      await sendTelegramMessage(
        chatId,
        `💳 *Deposit Funds*\n\nUsage:\n\`/deposit AMOUNT\`\n\nExample:\n\`/deposit 100\` - Deposit $100\n\n*Note:* Amount is in your preferred currency (${
          user.preferredCurrency || "USD"
        })\n\n*Available Methods:*\n₿ Bitcoin (BTC)\n📱 Cryptocurrency\n\n_Deposits are credited to your ${
          user.preferredCurrency || "USD"
        } balance_`
      );
      return NextResponse.json({ success: true });
    }

    const amountInUserCurrency = parseFloat(parts[1]);
    const userCurrency = user.preferredCurrency || "USD";

    // Validate amount
    if (isNaN(amountInUserCurrency) || amountInUserCurrency <= 0) {
      await sendTelegramMessage(
        chatId,
        "❌ *Invalid Amount*\n\nPlease enter a valid positive number."
      );
      return NextResponse.json({ success: true });
    }

    // Minimum deposit check ($10 USD equivalent)
    const minDepositUSD = 10;
    const amountUSD = await convertCurrency(
      amountInUserCurrency,
      userCurrency,
      "USD"
    );

    if (amountUSD < minDepositUSD) {
      const minInUserCurrency = await convertCurrency(
        minDepositUSD,
        "USD",
        userCurrency
      );
      await sendTelegramMessage(
        chatId,
        `❌ *Amount Too Low*\n\nMinimum deposit: ${formatCurrency(
          minInUserCurrency,
          userCurrency
        )}\n\nPlease deposit at least ${formatCurrency(
          minInUserCurrency,
          userCurrency
        )}.`
      );
      return NextResponse.json({ success: true });
    }

    // Create deposit invoice
    await sendTelegramMessage(
      chatId,
      "⏳ Creating your deposit invoice...\n\n_Please wait_"
    );

    const invoice = await createCryptoDepositInvoice(
      amountUSD,
      user.email || "",
      user.id
    );

    if (!invoice.success) {
      await sendTelegramMessage(
        chatId,
        `❌ *Deposit Failed*\n\nError: ${invoice.error}\n\nPlease try again or contact support.`
      );
      return NextResponse.json({ success: true });
    }

    // Send deposit instructions with payment link
    await sendInlineKeyboard(
      chatId,
      `💳 *Deposit Invoice Created*\n\n` +
        `💰 *Amount:* ${formatCurrency(amountInUserCurrency, userCurrency)}\n` +
        `💵 *USD Equivalent:* $${amountUSD.toFixed(2)}\n` +
        `💱 *Currency:* Will be credited in ${userCurrency}\n\n` +
        `Click the button below to complete your deposit:`,
      [[{ text: "₿ Pay with Crypto", url: invoice.invoiceUrl! }]]
    );

    await sendTelegramMessage(
      chatId,
      `*Payment Instructions:*\n\n` +
        `1️⃣ Click the payment button above\n` +
        `2️⃣ Choose your payment cryptocurrency\n` +
        `3️⃣ Send the exact amount shown\n` +
        `4️⃣ Wait for confirmation (usually 10-30 minutes)\n\n` +
        `✅ Funds will be automatically credited to your ${userCurrency} balance once confirmed.\n\n` +
        `📧 *Invoice ID:* \`${invoice.invoiceId}\`\n\n` +
        `_You'll receive a notification when your deposit is confirmed._`
    );

    // Track activity
    await trackTelegramActivity(user.id, "/deposit", {
      telegramId: telegramId.toString(),
      amount: amountInUserCurrency,
      amountUSD,
      currency: userCurrency,
      invoiceId: invoice.invoiceId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling /deposit command:", error);

    try {
      const { chatId } = await req.json();
      await sendTelegramMessage(
        chatId,
        "❌ Deposit creation failed. Please try again or contact support."
      );
    } catch {}

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
