# Telegram Bot Setup Guide

This guide will help you set up the Telegram bot integration with OpenAI ChatGPT for your M4Capital project.

## Prerequisites

1. **Telegram Bot Token**: Get it from [@BotFather](https://t.me/botfather) on Telegram
2. **OpenAI API Key**: Get it from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Deployed Application**: Your app must be deployed (Vercel, Heroku, etc.)

## Environment Variables

Add these to your `.env` file or Vercel environment variables:

```bash
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions to name your bot
4. Copy the bot token provided by BotFather
5. Add the token to your environment variables as `TELEGRAM_BOT_TOKEN`

### 2. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key and add it to your environment variables as `OPENAI_API_KEY`

### 3. Deploy to Vercel

```bash
# Install dependencies (already done)
npm install

# Deploy to Vercel
vercel

# Or push to GitHub and deploy automatically if connected
git add .
git commit -m "Add Telegram bot integration"
git push
```

### 4. Set Up Webhook

After deployment, you need to register the webhook with Telegram:

**Option A: Via Browser**
1. Visit: `https://your-app.vercel.app/api/telegram-webhook/setup`
2. This will automatically set up the webhook using your deployment URL
3. You should see a success message

**Option B: Via cURL**
```bash
curl https://your-app.vercel.app/api/telegram-webhook/setup
```

**Option C: Custom Webhook URL**
```bash
curl "https://your-app.vercel.app/api/telegram-webhook/setup?url=https://custom-url.com/api/telegram-webhook"
```

### 5. Test Your Bot

1. Open Telegram and search for your bot
2. Send `/start` to begin
3. Send any message and the bot should respond using ChatGPT

## Bot Commands

- `/start` - Start the bot and see welcome message
- `/clear` - Clear conversation history and start fresh
- Any text message - Get a response from ChatGPT

## API Endpoints

### Webhook Endpoint
- **URL**: `/api/telegram-webhook`
- **Method**: POST
- **Description**: Receives messages from Telegram

### Setup Endpoint
- **URL**: `/api/telegram-webhook/setup`
- **Method**: GET
- **Description**: Registers the webhook with Telegram
- **Query Params**: `url` (optional) - Custom webhook URL

### Webhook Management
- **URL**: `/api/telegram-webhook/setup`
- **Method**: POST
- **Description**: Manage webhook (get info or delete)
- **Body**:
  ```json
  {
    "action": "info" | "delete"
  }
  ```

## Vercel Deployment Steps

1. **Add Environment Variables in Vercel Dashboard**:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     - `TELEGRAM_BOT_TOKEN`
     - `OPENAI_API_KEY`

2. **Redeploy**: Click "Redeploy" or push changes to trigger deployment

3. **Register Webhook**: Visit the setup URL after deployment

## Troubleshooting

### Bot Not Responding

1. **Check Webhook Status**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/telegram-webhook/setup \
     -H "Content-Type: application/json" \
     -d '{"action": "info"}'
   ```

2. **Check Vercel Logs**:
   - Go to Vercel Dashboard
   - Navigate to your project
   - Check "Functions" logs

3. **Verify Environment Variables**:
   - Ensure both `TELEGRAM_BOT_TOKEN` and `OPENAI_API_KEY` are set
   - Redeploy after adding variables

### Re-register Webhook

If you need to change the webhook URL:

1. **Delete existing webhook**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/telegram-webhook/setup \
     -H "Content-Type: application/json" \
     -d '{"action": "delete"}'
   ```

2. **Register new webhook**:
   ```bash
   curl https://your-app.vercel.app/api/telegram-webhook/setup
   ```

## Features

- ✅ ChatGPT-powered responses using OpenAI API
- ✅ Conversation history (last 10 messages per user)
- ✅ Typing indicator while processing
- ✅ Markdown support in responses
- ✅ `/start` and `/clear` commands
- ✅ Cost-efficient using `gpt-4o-mini` model

## Cost Optimization

The bot uses `gpt-4o-mini` model by default, which is cost-efficient. To change the model, edit `/src/app/api/telegram-webhook/route.ts`:

```typescript
model: 'gpt-4o-mini', // or 'gpt-4', 'gpt-3.5-turbo'
```

## Security Notes

- Never commit your `.env` file
- Keep your API keys secure
- Use environment variables in production
- Monitor your OpenAI API usage to avoid unexpected costs

## Next Steps

1. Customize the bot's system prompt in `route.ts`
2. Add more commands (e.g., `/help`, `/about`)
3. Implement persistent conversation history using your database
4. Add rate limiting to prevent abuse
5. Add admin features (broadcast messages, user management)

## Support

For issues or questions, contact: support@m4capital.online
