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

// Helper function to send typing action
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
        `Welcome to M4Capital AI Assistant! 🤖\n\nI'm powered by ChatGPT and ready to help you.\n\nJust send me any message and I'll respond!\n\nUse /clear to reset our conversation.`
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

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for M4Capital, a trading platform. Be concise, friendly, and helpful. Keep responses under 500 words.",
        },
        ...history,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const assistantMessage =
      completion.choices[0].message.content ||
      "Sorry, I couldn't generate a response.";

    // Add assistant response to history
    history.push({ role: "assistant", content: assistantMessage });

    // Send response to user
    await sendTelegramMessage(chatId, assistantMessage);

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
