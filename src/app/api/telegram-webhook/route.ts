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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Telegram webhook verification
    if (!body.message) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const text = message.text;
    const userId = message.from.id;

    // Ignore non-text messages
    if (!text) {
      return NextResponse.json({ ok: true });
    }

    // Handle /start command
    if (text === "/start") {
      await sendTelegramMessage(
        chatId,
        "Welcome to M4Capital AI Assistant! 🤖\n\nI am powered by ChatGPT and ready to help you with any questions.\n\nJust send me a message and I'll respond!"
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /clear command to reset conversation
    if (text === "/clear") {
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

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use gpt-4o-mini for cost efficiency, or 'gpt-4' for better quality
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for M4Capital, a trading platform. Be concise, friendly, and helpful. Keep responses clear and to the point.",
        },
        ...history,
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const assistantMessage =
      completion.choices[0].message.content ||
      "Sorry, I could not generate a response.";

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

  await fetch(url, {
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
