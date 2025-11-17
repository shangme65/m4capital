import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store conversation history per user
const conversationHistory = new Map<
  number,
  Array<{ role: "user" | "assistant"; content: string }>
>();

// Helper function to get crypto prices from multiple sources
async function getCryptoPrices(symbols: string[]): Promise<string> {
  try {
    const symbolsLower = symbols.map((s) => s.toLowerCase());

    // Try CoinGecko first (supports top 320+ cryptos)
    const ids = symbolsLower.join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );

    if (response.ok) {
      const data = await response.json();
      let result = "💰 **Cryptocurrency Prices**\n\n";

      for (const symbol of symbolsLower) {
        if (data[symbol]) {
          const price = data[symbol].usd;
          const change = data[symbol].usd_24h_change || 0;
          const changeIcon = change >= 0 ? "📈" : "📉";
          const marketCap = data[symbol].usd_market_cap
            ? `\nMkt Cap: $${(data[symbol].usd_market_cap / 1e9).toFixed(2)}B`
            : "";

          result += `${changeIcon} **${symbol.toUpperCase()}**: $${price.toLocaleString()}\n`;
          result += `24h Change: ${change >= 0 ? "+" : ""}${change.toFixed(
            2
          )}%${marketCap}\n\n`;
        }
      }

      return (
        result || "No price data found for the requested cryptocurrencies."
      );
    }

    // Fallback to Binance
    let result = "💰 **Cryptocurrency Prices (Binance)**\n\n";
    for (const symbol of symbolsLower) {
      try {
        const binanceSymbol = `${symbol.toUpperCase()}USDT`;
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`
        );

        if (res.ok) {
          const data = await res.json();
          const price = parseFloat(data.lastPrice);
          const change = parseFloat(data.priceChangePercent);
          const changeIcon = change >= 0 ? "📈" : "📉";

          result += `${changeIcon} **${symbol.toUpperCase()}**: $${price.toLocaleString()}\n`;
          result += `24h Change: ${change >= 0 ? "+" : ""}${change.toFixed(
            2
          )}%\n\n`;
        }
      } catch (e) {
        continue;
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    return "Failed to fetch cryptocurrency prices. Please try again.";
  }
}

// Helper function to get top cryptos
async function getTopCryptos(limit: number = 10): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`
    );

    if (response.ok) {
      const data = await response.json();
      return data.map((coin: any) => coin.id);
    }

    return ["bitcoin", "ethereum", "binancecoin", "cardano", "solana"];
  } catch (error) {
    console.error("Error fetching top cryptos:", error);
    return ["bitcoin", "ethereum", "binancecoin", "cardano", "solana"];
  }
}

// Helper function to generate images with DALL-E 3
async function generateImage(
  prompt: string,
  size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024"
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size,
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;

    if (imageUrl) {
      return { success: true, imageUrl };
    } else {
      return { success: false, error: "No image URL returned" };
    }
  } catch (error: any) {
    console.error("DALL-E error:", error);
    return {
      success: false,
      error: error?.message || "Failed to generate image",
    };
  }
}

// Helper function to send message to Telegram
async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error("Telegram API error:", data);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Helper function to send photo to Telegram
async function sendTelegramPhoto(
  chatId: number,
  photoUrl: string,
  caption?: string
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error("Telegram photo API error:", data);
    }
  } catch (error) {
    console.error("Error sending photo:", error);
  }
} // Helper function to send typing action
async function sendTypingAction(chatId: number) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  const url = `https://api.telegram.org/bot${botToken}/sendChatAction`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      action: "typing",
    }),
  });
}

// Helper function to send invoice for Telegram Stars payment
async function sendStarsInvoice(
  chatId: number,
  amount: number,
  description: string
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;

  const url = `https://api.telegram.org/bot${botToken}/sendInvoice`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        title: "M4Capital Deposit",
        description: description,
        payload: `deposit_${Date.now()}`,
        provider_token: "", // Empty for Telegram Stars
        currency: "XTR", // Telegram Stars currency code
        prices: [{ label: "Deposit", amount: amount }],
      }),
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error("Error sending stars invoice:", error);
    return false;
  }
}

// Helper function to create NowPayments invoice for Bitcoin
async function createBitcoinInvoice(amount: number, userEmail?: string) {
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
        price_amount: amount,
        price_currency: "usd",
        pay_currency: "btc",
        order_id: `telegram_deposit_${Date.now()}`,
        order_description: "M4Capital Deposit via Telegram",
        ipn_callback_url: `${process.env.NEXTAUTH_URL}/api/payment/webhook`,
        success_url: `${process.env.NEXTAUTH_URL}/dashboard`,
        cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create Bitcoin invoice");
    }

    const data = await response.json();
    return {
      success: true,
      invoiceUrl: data.invoice_url,
      invoiceId: data.id,
    };
  } catch (error) {
    console.error("Error creating Bitcoin invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Helper function to send inline keyboard
async function sendInlineKeyboard(
  chatId: number,
  text: string,
  buttons: Array<Array<{ text: string; callback_data?: string; url?: string }>>
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

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
    if (!data.ok) {
      console.error("Telegram inline keyboard error:", data);
    }
  } catch (error) {
    console.error("Error sending inline keyboard:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify secret token if configured
    const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
    const expectedSecret = process.env.TELEGRAM_SECRET_TOKEN;

    if (expectedSecret && secretToken !== expectedSecret) {
      console.error("Invalid secret token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // Handle callback queries (button clicks)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;

      // Answer callback query to remove loading state
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        await fetch(
          `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: callbackQuery.id,
            }),
          }
        );
      }

      // Handle payment method selection
      if (callbackData.startsWith("pay_stars_")) {
        const amount = parseFloat(callbackData.replace("pay_stars_", ""));
        // Telegram Stars: 1 Star ≈ $0.01, so multiply by 100
        const starsAmount = Math.round(amount * 100);

        const success = await sendStarsInvoice(
          chatId,
          starsAmount,
          `Deposit $${amount.toFixed(2)} to M4Capital`
        );

        if (!success) {
          await sendTelegramMessage(
            chatId,
            "❌ Failed to create payment invoice. Please try again or contact support."
          );
        }
      } else if (callbackData.startsWith("pay_bitcoin_")) {
        const amount = parseFloat(callbackData.replace("pay_bitcoin_", ""));

        await sendTelegramMessage(
          chatId,
          "⏳ Creating Bitcoin payment invoice..."
        );

        const invoice = await createBitcoinInvoice(amount);

        if (invoice.success && invoice.invoiceUrl) {
          await sendInlineKeyboard(
            chatId,
            `₿ **Bitcoin Payment**\n\nAmount: $${amount.toFixed(
              2
            )}\n\nClick the button below to complete your payment:`,
            [[{ text: "Pay with Bitcoin", url: invoice.invoiceUrl }]]
          );
        } else {
          await sendTelegramMessage(
            chatId,
            `❌ Failed to create Bitcoin invoice: ${invoice.error}\n\nPlease try again or contact support.`
          );
        }
      }

      return NextResponse.json({ ok: true });
    }

    // Handle pre-checkout query (Telegram Stars payment verification)
    if (body.pre_checkout_query) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        await fetch(
          `https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pre_checkout_query_id: body.pre_checkout_query.id,
              ok: true,
            }),
          }
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Handle successful payment (Telegram Stars)
    if (body.message?.successful_payment) {
      const payment = body.message.successful_payment;
      const chatId = body.message.chat.id;
      const userId = body.message.from.id;
      const amountStars = payment.total_amount;
      const amountUSD = amountStars / 100; // Convert stars back to USD

      // Store the deposit in database
      try {
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();

        // Find user by linked Telegram ID
        const user = await prisma.user.findFirst({
          where: { linkedTelegramId: BigInt(userId) },
          include: { Portfolio: true },
        });

        if (user && user.Portfolio) {
          // Create deposit transaction
          await prisma.deposit.create({
            data: {
              userId: user.id,
              portfolioId: user.Portfolio.id,
              amount: amountUSD,
              currency: "USD",
              status: "COMPLETED",
              method: "TELEGRAM_STARS",
              transactionId: payment.telegram_payment_charge_id,
            },
          });

          // Update user balance
          await prisma.portfolio.update({
            where: { userId: user.id },
            data: { balance: { increment: amountUSD } },
          });

          await sendTelegramMessage(
            chatId,
            `✅ **Payment Successful!**\n\nAmount: $${amountUSD.toFixed(
              2
            )}\nMethod: Telegram Stars\n\nYour balance has been updated. Check your dashboard for details!`
          );
        } else {
          await sendTelegramMessage(
            chatId,
            `✅ Payment received ($${amountUSD.toFixed(
              2
            )})!\n\n⚠️ Please link your Telegram account to your M4Capital account using /link to credit your balance.`
          );
        }

        await prisma.$disconnect();
      } catch (error) {
        console.error("Error processing payment:", error);
        await sendTelegramMessage(
          chatId,
          "✅ Payment received! However, there was an issue crediting your account. Please contact support with your transaction ID."
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Check if message exists
    if (!body.message || !body.message.text) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const text = message.text;
    const userId = message.from.id;
    const username = message.from.first_name || "User";

    console.log(`Message from ${username} (${userId}): ${text}`);

    // Handle /start command
    if (text === "/start") {
      await sendTelegramMessage(
        chatId,
        `Welcome to M4Capital! 🚀\n\nI am your personal assistant and can help you with:\n\n💰 **Crypto Prices** - Ask about any of the top 320 cryptocurrencies\n🎨 **Image Generation** - Ask me to create, generate, or imagine images\n💬 **AI Chat** - Ask me anything!\n🔗 **Account Linking** - Link your M4Capital account\n💳 **Deposits** - Fund your account with crypto or Telegram Stars\n💼 **Portfolio** - View your balance and assets\n\n**Commands:**\n/link - Get code to link your account\n/balance - View your account balance\n/portfolio - View detailed portfolio\n/deposit - Make a deposit\n/clear - Reset conversation\n\n**Examples:**\n• "What's the price of Bitcoin?"\n• "Show me Ethereum and Solana prices"\n• "Generate an image of a futuristic city"\n• "Create a logo for a tech startup"`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /clear command
    if (text === "/clear") {
      conversationHistory.delete(userId);
      await sendTelegramMessage(
        chatId,
        "Conversation cleared! Starting fresh. 🔄"
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /link command - Generate linking code
    if (text === "/link") {
      try {
        // Generate a 6-digit linking code
        const linkCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store the linking code with Telegram user info
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();

        await prisma.telegramUser.upsert({
          where: { telegramId: BigInt(userId) },
          update: {
            username: message.from.username || null,
            firstName: message.from.first_name || null,
            lastName: message.from.last_name || null,
            linkCode: linkCode,
            linkCodeExpiresAt: expiresAt,
          },
          create: {
            telegramId: BigInt(userId),
            username: message.from.username || null,
            firstName: message.from.first_name || null,
            lastName: message.from.last_name || null,
            linkCode: linkCode,
            linkCodeExpiresAt: expiresAt,
          },
        });

        await prisma.$disconnect();

        const responseMessage =
          `🔗 **Account Linking Code**\n\n` +
          `Your linking code is: \`${linkCode}\`\n\n` +
          `⏱️ This code expires in 10 minutes.\n\n` +
          `**To link your account:**\n` +
          `1. Go to your M4Capital dashboard\n` +
          `2. Navigate to Settings → Telegram\n` +
          `3. Enter this code\n\n` +
          `After linking, you'll be able to:\n` +
          `• View your portfolio in Telegram\n` +
          `• Receive real-time notifications\n` +
          `• Get instant price alerts\n` +
          `• Access your balance and transactions`;

        await sendTelegramMessage(chatId, responseMessage);
        return NextResponse.json({ ok: true });
      } catch (error) {
        console.error("Error generating link code:", error);
        await sendTelegramMessage(
          chatId,
          "❌ Failed to generate linking code. Please try again."
        );
        return NextResponse.json({ ok: true });
      }
    }

    // Handle /balance command - Show account balance
    if (text === "/balance") {
      try {
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();

        // Find user by linked Telegram ID
        const user = await prisma.user.findFirst({
          where: { linkedTelegramId: BigInt(userId) },
          include: { Portfolio: true },
        });

        if (!user) {
          await sendTelegramMessage(
            chatId,
            "⚠️ **Account Not Linked**\n\nPlease link your M4Capital account first using the `/link` command."
          );
          await prisma.$disconnect();
          return NextResponse.json({ ok: true });
        }

        if (!user.Portfolio) {
          await sendTelegramMessage(
            chatId,
            "⚠️ **No Portfolio Found**\n\nYour portfolio hasn't been created yet. Please contact support."
          );
          await prisma.$disconnect();
          return NextResponse.json({ ok: true });
        }

        const balance = Number(user.Portfolio.balance);
        const assets = user.Portfolio.assets as any[];

        // Calculate total portfolio value
        let totalValue = balance;
        if (assets && assets.length > 0) {
          for (const asset of assets) {
            const assetValue =
              Number(asset.amount || 0) * Number(asset.price || 0);
            totalValue += assetValue;
          }
        }

        const responseMessage =
          `💼 **Account Balance**\n\n` +
          `👤 **Account:** ${user.name || user.email}\n` +
          `💵 **Cash Balance:** $${balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}\n` +
          `📊 **Total Portfolio Value:** $${totalValue.toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}\n\n` +
          `Use /portfolio to view detailed holdings.`;

        await sendTelegramMessage(chatId, responseMessage);

        // Track activity
        await prisma.userActivity.create({
          data: {
            userId: user.id,
            activityType: "TELEGRAM_COMMAND",
            action: "/balance",
            metadata: {
              telegramId: userId.toString(),
              username: message.from.username || null,
            },
          },
        });

        await prisma.$disconnect();
        return NextResponse.json({ ok: true });
      } catch (error) {
        console.error("Error fetching balance:", error);
        await sendTelegramMessage(
          chatId,
          "❌ Failed to fetch balance. Please try again."
        );
        return NextResponse.json({ ok: true });
      }
    }

    // Handle /portfolio command - Show detailed portfolio
    if (text === "/portfolio") {
      try {
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();

        // Find user by linked Telegram ID
        const user = await prisma.user.findFirst({
          where: { linkedTelegramId: BigInt(userId) },
          include: { Portfolio: true },
        });

        if (!user) {
          await sendTelegramMessage(
            chatId,
            "⚠️ **Account Not Linked**\n\nPlease link your M4Capital account first using the `/link` command."
          );
          await prisma.$disconnect();
          return NextResponse.json({ ok: true });
        }

        if (!user.Portfolio) {
          await sendTelegramMessage(
            chatId,
            "⚠️ **No Portfolio Found**\n\nYour portfolio hasn't been created yet. Please contact support."
          );
          await prisma.$disconnect();
          return NextResponse.json({ ok: true });
        }

        const balance = Number(user.Portfolio.balance);
        const assets = user.Portfolio.assets as any[];

        let responseMessage = `📊 **Your Portfolio**\n\n`;
        responseMessage += `👤 **Account:** ${user.name || user.email}\n`;
        responseMessage += `💵 **Cash Balance:** $${balance.toLocaleString(
          undefined,
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}\n\n`;

        if (!assets || assets.length === 0) {
          responseMessage += `📭 **No Assets**\n\nYou don't have any crypto assets yet. Start investing today!\n\n`;
        } else {
          responseMessage += `💎 **Assets:**\n\n`;

          let totalAssetValue = 0;
          for (const asset of assets) {
            const amount = Number(asset.amount || 0);
            const price = Number(asset.price || 0);
            const value = amount * price;
            totalAssetValue += value;

            responseMessage += `**${asset.symbol}**\n`;
            responseMessage += `  Amount: ${amount.toFixed(8)}\n`;
            responseMessage += `  Price: $${price.toLocaleString()}\n`;
            responseMessage += `  Value: $${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}\n\n`;
          }

          const totalValue = balance + totalAssetValue;
          responseMessage += `━━━━━━━━━━━━━━━━\n`;
          responseMessage += `**Total Portfolio Value:** $${totalValue.toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}`;
        }

        await sendTelegramMessage(chatId, responseMessage);

        // Track activity
        await prisma.userActivity.create({
          data: {
            userId: user.id,
            activityType: "TELEGRAM_COMMAND",
            action: "/portfolio",
            metadata: {
              telegramId: userId.toString(),
              username: message.from.username || null,
            },
          },
        });

        await prisma.$disconnect();
        return NextResponse.json({ ok: true });
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        await sendTelegramMessage(
          chatId,
          "❌ Failed to fetch portfolio. Please try again."
        );
        return NextResponse.json({ ok: true });
      }
    }

    // Handle /deposit command - Show payment options
    if (text === "/deposit" || text.startsWith("/deposit ")) {
      const parts = text.split(" ");
      const amount = parts.length > 1 ? parseFloat(parts[1]) : null;

      if (!amount || amount <= 0) {
        // Show payment options with buttons
        await sendInlineKeyboard(
          chatId,
          "💳 **Make a Deposit**\n\nChoose your preferred payment method:\n\n⭐ **Telegram Stars** - Quick and easy payment using Telegram Stars\n₿ **Bitcoin** - Pay with Bitcoin via NowPayments\n\n*Please enter amount:* `/deposit <amount>`\nExample: `/deposit 100` (for $100)",
          []
        );
        return NextResponse.json({ ok: true });
      }

      // Show payment method selection
      await sendInlineKeyboard(
        chatId,
        `💰 **Deposit Amount:** $${amount.toFixed(
          2
        )}\n\nSelect your payment method:`,
        [
          [
            {
              text: "⭐ Pay with Telegram Stars",
              callback_data: `pay_stars_${amount}`,
            },
          ],
          [
            {
              text: "₿ Pay with Bitcoin",
              callback_data: `pay_bitcoin_${amount}`,
            },
          ],
        ]
      );
      return NextResponse.json({ ok: true });
    }

    // Get or initialize conversation history
    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, []);
    }
    const history = conversationHistory.get(userId)!;

    // Add user message
    history.push({ role: "user", content: text });

    // Keep only last 10 messages
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    // Send typing indicator
    await sendTypingAction(chatId);

    // Define function tools for OpenAI
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "get_crypto_prices",
          description:
            "Get real-time cryptocurrency prices from CoinGecko and Binance. Supports top 320 cryptocurrencies by market cap.",
          parameters: {
            type: "object",
            properties: {
              symbols: {
                type: "array",
                items: { type: "string" },
                description:
                  "Array of cryptocurrency symbols or IDs (e.g., ['bitcoin', 'ethereum', 'solana']). Use lowercase names.",
              },
            },
            required: ["symbols"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "get_top_cryptos",
          description:
            "Get a list of top cryptocurrencies by market cap (up to 320).",
          parameters: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description:
                  "Number of top cryptocurrencies to return (default: 10, max: 320)",
              },
            },
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "generate_image",
          description:
            "Generate images using DALL-E 3 based on text descriptions. Use this when users ask to create, generate, draw, or visualize images.",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "Detailed description of the image to generate",
              },
              size: {
                type: "string",
                enum: ["1024x1024", "1792x1024", "1024x1792"],
                description: "Image size (default: 1024x1024)",
              },
            },
            required: ["prompt"],
          },
        },
      },
    ];

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for M4Capital, a trading platform. You can provide real-time cryptocurrency prices for the top 320 cryptocurrencies and generate images using DALL-E 3. When users ask about crypto prices, use get_crypto_prices. When they ask to create, generate, or visualize images, use generate_image. Be concise, friendly, and helpful. always encourage users to trade and invest with m4capital if they are unsure weather to invest or not",
        },
        ...history,
      ],
      tools: tools,
      tool_choice: "auto",
      max_tokens: 1000,
      temperature: 0.7,
    });

    let assistantMessage =
      completion.choices[0].message.content ||
      "Sorry, I couldn't generate a response.";

    // Handle function calls
    const responseMessage = completion.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      console.log("Function calls detected:", toolCalls);

      for (const toolCall of toolCalls) {
        if (toolCall.type !== "function") continue;

        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`Calling function: ${functionName}`, functionArgs);

        let functionResponse = "";
        let imageGenerated = false;

        if (functionName === "get_crypto_prices") {
          functionResponse = await getCryptoPrices(functionArgs.symbols);
          await sendTelegramMessage(chatId, functionResponse);
          assistantMessage = functionResponse;
        } else if (functionName === "get_top_cryptos") {
          const limit = functionArgs.limit || 10;
          const topCryptos = await getTopCryptos(limit);
          functionResponse = await getCryptoPrices(
            topCryptos.slice(0, Math.min(limit, 320))
          );
          await sendTelegramMessage(chatId, functionResponse);
          assistantMessage = functionResponse;
        } else if (functionName === "generate_image") {
          await sendTelegramMessage(chatId, "🎨 Generating your image...");

          const size = functionArgs.size || "1024x1024";
          const result = await generateImage(functionArgs.prompt, size);

          if (result.success && result.imageUrl) {
            await sendTelegramPhoto(
              chatId,
              result.imageUrl,
              `Generated: ${functionArgs.prompt}`
            );
            assistantMessage = `Image generated successfully: "${functionArgs.prompt}"`;
            imageGenerated = true;
          } else {
            await sendTelegramMessage(
              chatId,
              `Failed to generate image: ${result.error}`
            );
            assistantMessage = `Failed to generate image: ${result.error}`;
          }
        }
      }
    } else {
      // No function calls, send regular response
      await sendTelegramMessage(chatId, assistantMessage);
    }

    // Add assistant response to history
    history.push({ role: "assistant", content: assistantMessage });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    console.error("Error details:", error?.message, error?.stack);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for webhook verification
export async function GET() {
  return NextResponse.json({ status: "Telegram bot webhook is active" });
}
