import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store conversation history per user (in production, use a database)
const conversationHistory = new Map<
  number,
  Array<{ role: "user" | "assistant"; content: string }>
>();

// Store warning counts per user per chat
const userWarnings = new Map<string, number>();

// Moderation settings
const MODERATION_CONFIG = {
  MAX_WARNINGS: 3,
  AUTO_BAN_ENABLED: true,
  AUTO_MODERATE_GROUPS: true,
  TOXICITY_THRESHOLD: 0.7, // 0-1 scale, higher = more strict
};

// Crypto price API functions
async function getCryptoPriceFromCoinGecko(symbols: string[]): Promise<any> {
  try {
    const ids = symbols.join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );
    const data = await response.json();
    return { source: "CoinGecko", data };
  } catch (error) {
    console.error("CoinGecko API error:", error);
    return null;
  }
}

async function getCryptoPriceFromBinance(symbols: string[]): Promise<any> {
  try {
    const prices: any = {};
    for (const symbol of symbols) {
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}USDT`
      );
      if (response.ok) {
        const data = await response.json();
        prices[symbol] = {
          usd: parseFloat(data.lastPrice),
          usd_24h_change: parseFloat(data.priceChangePercent),
          usd_24h_vol: parseFloat(data.volume),
        };
      }
    }
    return { source: "Binance", data: prices };
  } catch (error) {
    console.error("Binance API error:", error);
    return null;
  }
}

async function getCryptoPriceFromCoinMarketCap(
  symbols: string[]
): Promise<any> {
  try {
    const apiKey = process.env.COINMARKETCAP_API_KEY;
    if (!apiKey) {
      return null;
    }

    const slugs = symbols.join(",");
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?slug=${slugs}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
        },
      }
    );
    const result = await response.json();
    return { source: "CoinMarketCap", data: result.data };
  } catch (error) {
    console.error("CoinMarketCap API error:", error);
    return null;
  }
}

// Combined crypto price fetcher
async function getCryptoPrices(symbols: string[]): Promise<string> {
  const results = await Promise.all([
    getCryptoPriceFromCoinGecko(symbols),
    getCryptoPriceFromBinance(symbols),
    getCryptoPriceFromCoinMarketCap(symbols),
  ]);

  const validResults = results.filter((r) => r !== null);

  if (validResults.length === 0) {
    return "Unable to fetch crypto prices at the moment.";
  }

  let response = "📊 **Cryptocurrency Prices** (from multiple sources):\n\n";

  for (const result of validResults) {
    response += `**${result.source}:**\n`;
    const data = result.data;

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "object" && value !== null) {
        const priceData: any = value;
        const price = priceData.usd || priceData.lastPrice || "N/A";
        const change =
          priceData.usd_24h_change || priceData.priceChangePercent || "N/A";
        response += `  • ${key.toUpperCase()}: $${
          typeof price === "number" ? price.toLocaleString() : price
        }`;
        if (change !== "N/A") {
          const changeNum =
            typeof change === "number" ? change : parseFloat(change);
          const emoji = changeNum >= 0 ? "📈" : "📉";
          response += ` (${changeNum >= 0 ? "+" : ""}${changeNum.toFixed(
            2
          )}% ${emoji})`;
        }
        response += "\n";
      }
    }
    response += "\n";
  }

  return response;
}

// Get list of top cryptocurrencies
async function getTopCryptos(limit: number = 200): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`
    );
    const data = await response.json();
    return data.map((coin: any) => coin.id);
  } catch (error) {
    console.error("Error fetching top cryptos:", error);
    return ["bitcoin", "ethereum", "tether", "binancecoin", "solana"];
  }
}

// AI-powered content moderation
async function moderateContent(text: string, username: string): Promise<{
  shouldModerate: boolean;
  reason: string;
  severity: "low" | "medium" | "high";
}> {
  try {
    const moderationResponse = await openai.moderations.create({
      input: text,
    });

    const result = moderationResponse.results[0];
    
    // Check if content is flagged
    if (result.flagged) {
      const categories = result.categories;
      const scores = result.category_scores;
      
      // Determine severity and reason
      let highestScore = 0;
      let highestCategory = "";
      
      for (const [category, flagged] of Object.entries(categories)) {
        if (flagged) {
          const score = scores[category as keyof typeof scores];
          if (score > highestScore) {
            highestScore = score;
            highestCategory = category;
          }
        }
      }
      
      const severity: "low" | "medium" | "high" = 
        highestScore > 0.9 ? "high" : 
        highestScore > 0.7 ? "medium" : "low";
      
      return {
        shouldModerate: true,
        reason: `Flagged for ${highestCategory.replace(/[_-]/g, " ")}`,
        severity,
      };
    }
    
    // Additional AI analysis for spam/promotional content
    const aiAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a content moderator. Analyze if this message is spam, scam, or inappropriate for a professional trading community. 
          
          Consider:
          - Excessive promotional content
          - Scam/phishing attempts
          - Off-topic spam
          - Repetitive messages
          - Suspicious links
          
          Respond with JSON only: {"is_spam": boolean, "confidence": number (0-1), "reason": "brief explanation"}`,
        },
        {
          role: "user",
          content: `Username: ${username}\nMessage: ${text}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
    });
    
    const analysis = JSON.parse(aiAnalysis.choices[0].message.content || "{}");
    
    if (analysis.is_spam && analysis.confidence > MODERATION_CONFIG.TOXICITY_THRESHOLD) {
      return {
        shouldModerate: true,
        reason: analysis.reason || "Potential spam detected",
        severity: analysis.confidence > 0.9 ? "high" : "medium",
      };
    }
    
    return {
      shouldModerate: false,
      reason: "",
      severity: "low",
    };
  } catch (error) {
    console.error("Moderation error:", error);
    return {
      shouldModerate: false,
      reason: "",
      severity: "low",
    };
  }
}

// Ban user from chat
async function banUser(chatId: number, userId: number): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/banChatMember`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
        }),
      }
    );
    
    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Error banning user:", error);
    return false;
  }
}

// Delete message
async function deleteMessage(chatId: number, messageId: number): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/deleteMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
        }),
      }
    );
    
    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
}

// Warn user
async function warnUser(
  chatId: number,
  userId: number,
  username: string,
  reason: string
): Promise<void> {
  const warningKey = `${chatId}_${userId}`;
  const warnings = (userWarnings.get(warningKey) || 0) + 1;
  userWarnings.set(warningKey, warnings);

  const message = `⚠️ Warning ${warnings}/${MODERATION_CONFIG.MAX_WARNINGS} for @${username}\n\nReason: ${reason}\n\n${
    warnings >= MODERATION_CONFIG.MAX_WARNINGS
      ? "⛔️ Maximum warnings reached. User will be banned."
      : `You have ${MODERATION_CONFIG.MAX_WARNINGS - warnings} warning(s) left.`
  }`;

  await sendTelegramMessage(chatId, message);

  // Auto-ban if max warnings reached
  if (warnings >= MODERATION_CONFIG.MAX_WARNINGS && MODERATION_CONFIG.AUTO_BAN_ENABLED) {
    await banUser(chatId, userId);
    await sendTelegramMessage(
      chatId,
      `🔨 User @${username} has been banned for repeated violations.`
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify Telegram secret token for webhook security (only if set)
    const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
    const expectedSecret = process.env.TELEGRAM_SECRET_TOKEN;

    if (expectedSecret && secretToken !== expectedSecret) {
      console.error("Invalid secret token received");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Received webhook:", JSON.stringify(body));

    // Telegram webhook verification
    if (!body.message) {
      console.log("No message in webhook body");
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const text = message.text;
    const userId = message.from.id;
    const username = message.from.username || message.from.first_name || "User";
    const isGroup = message.chat.type === "group" || message.chat.type === "supergroup";
    const messageId = message.message_id;

    console.log(`Message from user ${userId} (@${username}) in chat ${chatId}: ${text}`);

    // Ignore non-text messages
    if (!text) {
      console.log("Non-text message, ignoring");
      return NextResponse.json({ ok: true });
    }

    // AI-powered moderation for group chats
    if (isGroup && MODERATION_CONFIG.AUTO_MODERATE_GROUPS) {
      console.log("Running AI moderation check...");
      const moderation = await moderateContent(text, username);
      
      if (moderation.shouldModerate) {
        console.log(`Content flagged: ${moderation.reason} (${moderation.severity})`);
        
        // Delete the message
        await deleteMessage(chatId, messageId);
        
        // Handle based on severity
        if (moderation.severity === "high") {
          // Immediate ban for severe violations
          await banUser(chatId, userId);
          await sendTelegramMessage(
            chatId,
            `🚫 User @${username} has been banned.\n\nReason: ${moderation.reason}\n\nThis action was taken by AI moderation for severe policy violation.`
          );
        } else {
          // Warn user for medium/low violations
          await warnUser(chatId, userId, username, moderation.reason);
        }
        
        return NextResponse.json({ ok: true });
      }
    }

    // Handle /start command
    if (text === "/start") {
      console.log("Handling /start command");
      const welcomeMsg = isGroup 
        ? "Welcome to M4Capital AI Assistant! 🤖\n\nI provide AI-powered moderation and can answer your questions about crypto and trading.\n\n👮 Auto-moderation is active to keep this group safe and spam-free."
        : "Welcome to M4Capital AI Assistant! 🤖\n\nI am powered by ChatGPT and ready to help you with any questions.\n\nJust send me a message and I'll respond!";
      
      await sendTelegramMessage(chatId, welcomeMsg);
      return NextResponse.json({ ok: true });
    }

    // Handle /clear command to reset conversation
    if (text === "/clear") {
      console.log("Handling /clear command");
      conversationHistory.delete(userId);
      await sendTelegramMessage(
        chatId,
        "Conversation history cleared! Starting fresh. 🔄"
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /ban command (admin only - reply to message or mention user)
    if (text.startsWith("/ban") && isGroup) {
      console.log("Handling /ban command");
      
      const replyToMessage = message.reply_to_message;
      if (replyToMessage) {
        const targetUserId = replyToMessage.from.id;
        const targetUsername = replyToMessage.from.username || replyToMessage.from.first_name;
        
        const banned = await banUser(chatId, targetUserId);
        if (banned) {
          await deleteMessage(chatId, replyToMessage.message_id);
          await sendTelegramMessage(
            chatId,
            `🔨 User @${targetUsername} has been banned by admin.`
          );
        }
      } else {
        await sendTelegramMessage(
          chatId,
          "❌ Reply to a message to ban that user."
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Handle /warn command (admin only)
    if (text.startsWith("/warn") && isGroup) {
      console.log("Handling /warn command");
      
      const replyToMessage = message.reply_to_message;
      if (replyToMessage) {
        const targetUserId = replyToMessage.from.id;
        const targetUsername = replyToMessage.from.username || replyToMessage.from.first_name;
        const reason = text.replace("/warn", "").trim() || "Violation of group rules";
        
        await warnUser(chatId, targetUserId, targetUsername, reason);
      } else {
        await sendTelegramMessage(
          chatId,
          "❌ Reply to a message to warn that user.\n\nUsage: /warn [reason]"
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Handle /modstatus command
    if (text === "/modstatus" && isGroup) {
      const statusMsg = `🤖 **AI Moderation Status**\n\n` +
        `✅ Auto-moderation: ${MODERATION_CONFIG.AUTO_MODERATE_GROUPS ? "Enabled" : "Disabled"}\n` +
        `🔨 Auto-ban: ${MODERATION_CONFIG.AUTO_BAN_ENABLED ? "Enabled" : "Disabled"}\n` +
        `⚠️ Max warnings: ${MODERATION_CONFIG.MAX_WARNINGS}\n` +
        `📊 Toxicity threshold: ${(MODERATION_CONFIG.TOXICITY_THRESHOLD * 100).toFixed(0)}%\n\n` +
        `The bot uses OpenAI to detect:\n` +
        `• Spam & scams\n` +
        `• Harassment & hate speech\n` +
        `• Inappropriate content\n` +
        `• Phishing attempts\n\n` +
        `Admin commands:\n` +
        `/ban - Ban user (reply to message)\n` +
        `/warn - Warn user (reply to message)`;
      
      await sendTelegramMessage(chatId, statusMsg);
      return NextResponse.json({ ok: true });
    }

    // Get or initialize user conversation history
    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, []);
    }
    const history = conversationHistory.get(userId)!;

    // Add user message to history
    history.push({ role: "user", content: text });

    // Keep only last 10 messages to manage token usage
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    // Send "typing" action
    await sendTelegramTypingAction(chatId);

    // Define available functions for OpenAI
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "get_crypto_prices",
          description:
            "Get real-time cryptocurrency prices from multiple sources (CoinGecko, Binance, CoinMarketCap). Supports top 200 cryptocurrencies by market cap.",
          parameters: {
            type: "object",
            properties: {
              symbols: {
                type: "array",
                items: { type: "string" },
                description:
                  "Array of cryptocurrency symbols or IDs (e.g., ['bitcoin', 'ethereum', 'cardano']). Use lowercase names.",
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
            "Get a list of top cryptocurrencies by market cap (up to 200).",
          parameters: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description:
                  "Number of top cryptocurrencies to return (default: 10, max: 200)",
              },
            },
          },
        },
      },
    ];

    // Get response from OpenAI with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for M4Capital, a trading platform. You can provide real-time cryptocurrency prices for the top 200 cryptocurrencies using multiple data sources (CoinGecko, Binance, and CoinMarketCap). When users ask about crypto prices, use the get_crypto_prices function. Be concise, friendly, and helpful. Format prices clearly with currency symbols and percentage changes.",
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
      "Sorry, I could not generate a response.";

    // Handle function calls
    const responseMessage = completion.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      console.log("Function calls detected:", toolCalls);

      for (const toolCall of toolCalls) {
        // Type guard to check if it's a function tool call
        if (toolCall.type !== "function") continue;

        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`Calling function: ${functionName}`, functionArgs);

        let functionResponse = "";

        if (functionName === "get_crypto_prices") {
          functionResponse = await getCryptoPrices(functionArgs.symbols);
        } else if (functionName === "get_top_cryptos") {
          const limit = functionArgs.limit || 10;
          const topCryptos = await getTopCryptos(limit);
          functionResponse = `Top ${limit} cryptocurrencies by market cap:\n${topCryptos
            .slice(0, limit)
            .join(", ")}`;
        }

        // Get final response from OpenAI with function result
        const secondCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant for M4Capital, a trading platform. Present cryptocurrency data in a clear, formatted way.",
            },
            ...history,
            responseMessage,
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content: functionResponse,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        assistantMessage =
          secondCompletion.choices[0].message.content ||
          "Sorry, I could not generate a response.";
      }
    }

    // Add assistant response to history
    history.push({ role: "assistant", content: assistantMessage });

    // Send response to user
    await sendTelegramMessage(chatId, assistantMessage);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to send Telegram message
async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("Failed to send message:", result);
    } else {
      console.log("Message sent successfully");
    }

    return result;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}

// Helper function to send typing action
async function sendTelegramTypingAction(chatId: number) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendChatAction`;

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      action: "typing",
    }),
  });
}

// Handle GET request (for webhook verification)
export async function GET() {
  return NextResponse.json({ status: "Telegram bot webhook is active" });
}
