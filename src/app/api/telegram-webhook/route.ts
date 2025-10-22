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

    console.log(`Message from user ${userId} in chat ${chatId}: ${text}`);

    // Ignore non-text messages
    if (!text) {
      console.log("Non-text message, ignoring");
      return NextResponse.json({ ok: true });
    }

    // Handle /start command
    if (text === "/start") {
      console.log("Handling /start command");
      await sendTelegramMessage(
        chatId,
        "Welcome to M4Capital AI Assistant! 🤖\n\nI am powered by ChatGPT and ready to help you with any questions.\n\nJust send me a message and I'll respond!"
      );
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
