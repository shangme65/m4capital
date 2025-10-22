// Vercel serverless webhook for Telegram → OpenAI
// Place this file at /api/telegram-webhook.js in your repo and deploy to Vercel.
//
// Required environment variables (set in Vercel Dashboard):
//   TELEGRAM_TOKEN       - bot token (bot must be created via BotFather)
//   OPENAI_API_KEY       - your OpenAI API key (your billing will be used)
//   TELEGRAM_SECRET_TOKEN- secret string you set when calling setWebhook
//
// Notes:
// - This endpoint verifies Telegram's 'x-telegram-bot-api-secret-token' header.
// - It acknowledges Telegram immediately (HTTP 200) then calls OpenAI async and replies via Telegram sendMessage.
// - To limit costs, enable useCommandOnly = true which requires messages to start with /ask
//
// Where to insert identity (if any script asks):
//   GITHUB_REPO: https://github.com/shangme65/m4capital
//   GITHUB_USERNAME: shangme65
//   EMAIL: shangme65@gmail.com

const OpenAI = require('openai');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TELEGRAM_SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN;

if (!TELEGRAM_TOKEN || !OPENAI_API_KEY || !TELEGRAM_SECRET_TOKEN) {
  console.error('Missing required env vars. Set TELEGRAM_TOKEN, OPENAI_API_KEY, TELEGRAM_SECRET_TOKEN in Vercel.');
}

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Use global fetch (Node 18+ / Vercel) or fallback
const fetch = global.fetch || require('node-fetch');

const USE_COMMAND_ONLY = false; // set true to require '/ask' command to avoid unwanted costs

// Helper: send message via Telegram sendMessage
async function telegramSendMessage(chatId, text, replyTo) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    reply_to_message_id: replyTo || undefined,
    parse_mode: 'Markdown'
  };
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// Helper: send chat action
async function telegramChatAction(chatId, action = 'typing') {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendChatAction`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action })
  });
}

// Vercel serverless handler
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    // Health check
    res.status(200).send('OK');
    return;
  }

  // Verify Telegram secret header
  const incoming = req.headers['x-telegram-bot-api-secret-token'];
  if (!incoming || incoming !== TELEGRAM_SECRET_TOKEN) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Telegram update payload (body should already be parsed by Vercel)
  const update = req.body;
  if (!update) {
    res.status(400).send('Bad Request: empty body');
    return;
  }

  const msg = update.message || update.edited_message;
  if (!msg || !msg.text) {
    // Nothing to process (we only handle text messages here)
    res.status(200).send('No text message to process');
    return;
  }

  // Optionally require /ask command to control usage
  let prompt = msg.text.trim();
  if (USE_COMMAND_ONLY) {
    if (!prompt.startsWith('/ask')) {
      // do not process; respond OK so Telegram won't retry
      res.status(200).send('Ignored');
      return;
    }
    prompt = prompt.replace(/^\/ask\s*/i, '');
    if (!prompt) {
      // tell user how to use
      await telegramSendMessage(msg.chat.id, 'Usage: /ask <your question>', msg.message_id);
      res.status(200).send('OK');
      return;
    }
  }

  // Acknowledge quickly (avoid Telegram retries)
  res.status(200).send('OK');

  // Asynchronous processing
  (async () => {
    try {
      // Show typing
      await telegramChatAction(msg.chat.id, 'typing');

      // Call OpenAI Chat Completions
      const completion = await openai.chat.completions.create({
        model: 'gpt-4', // change to gpt-3.5-turbo if you want lower cost
        messages: [
          { role: 'system', content: 'You are a helpful assistant for Telegram users.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const aiText =
        completion?.choices?.[0]?.message?.content?.trim() ||
        'Sorry, I could not generate a reply at this time.';

      // Send reply back to Telegram
      await telegramSendMessage(msg.chat.id, aiText, msg.message_id);
    } catch (err) {
      console.error('Processing error:', err);
      try {
        await telegramSendMessage(msg.chat.id, 'Sorry, an error occurred contacting the AI.');
      } catch (err2) {
        console.error('Failed to notify user:', err2);
      }
    }
  })();
};