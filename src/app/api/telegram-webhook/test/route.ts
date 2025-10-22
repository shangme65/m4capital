import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const openaiKey = process.env.OPENAI_API_KEY;
    const secretToken = process.env.TELEGRAM_SECRET_TOKEN;

    // Check configuration
    const config = {
      botTokenSet: !!botToken,
      openaiKeySet: !!openaiKey,
      secretTokenSet: !!secretToken,
      webhookUrl: `${req.nextUrl.origin}/api/telegram-webhook`,
    };

    // Get webhook info from Telegram
    let webhookInfo = null;
    if (botToken) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/getWebhookInfo`
        );
        webhookInfo = await response.json();
      } catch (error) {
        webhookInfo = { error: String(error) };
      }
    }

    // Test bot token by getting bot info
    let botInfo = null;
    if (botToken) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/getMe`
        );
        botInfo = await response.json();
      } catch (error) {
        botInfo = { error: String(error) };
      }
    }

    return NextResponse.json({
      config,
      webhookInfo,
      botInfo,
      message: "Diagnostic information for Telegram bot",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get diagnostic info",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
