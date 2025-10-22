import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json(
        { error: 'TELEGRAM_BOT_TOKEN is not configured' },
        { status: 500 }
      );
    }

    // Get the webhook URL from query params or construct from host
    const webhookUrl = req.nextUrl.searchParams.get('url') || 
                       `${req.nextUrl.origin}/api/telegram-webhook`;

    // Set the webhook
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message'],
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      return NextResponse.json({
        success: true,
        message: 'Webhook set successfully',
        webhook_url: webhookUrl,
        telegram_response: data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to set webhook',
          telegram_response: data,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Setup webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Get webhook info
export async function POST(req: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json(
        { error: 'TELEGRAM_BOT_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const action = body.action;

    if (action === 'delete') {
      // Delete webhook
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/deleteWebhook`
      );
      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        message: 'Webhook deleted',
        telegram_response: data,
      });
    }

    if (action === 'info') {
      // Get webhook info
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getWebhookInfo`
      );
      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        webhook_info: data.result,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "delete" or "info"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Webhook management error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
