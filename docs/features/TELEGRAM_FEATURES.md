# M4Capital - Telegram Bot Features

## Overview

M4Capital Telegram Bot is an AI-powered assistant that integrates GPT-4o-mini, DALL-E 3, and real-time crypto data.

---

## 🤖 Core Features

### 1. AI Conversations (GPT-4o-mini)

Natural language conversations with context awareness:

```
User: "What's the best strategy for swing trading?"
Bot: [Provides detailed trading strategy explanation]

User: "Can you explain what makes a good entry point?"
Bot: [Continues contextual conversation]
```

**Features**:

- Context retention (recent messages)
- Multi-turn conversations
- Personality tuning
- Smart command detection

---

### 2. Crypto Price Tracking

Real-time cryptocurrency prices from multiple sources:

**Commands**:

```
/price BTC
/price ETH USD
/price bitcoin
"What's the price of ethereum?"
"Show me BTC price"
```

**Data Sources**:

- CoinGecko API (primary)
- Binance API (fallback)
- CoinMarketCap (backup)

**Information Provided**:

- Current price in USD
- 24h price change (%)
- Market cap
- 24h trading volume
- Price trend indicator

---

### 3. AI Image Generation (DALL-E 3)

High-quality image generation with natural language:

**Direct Command**:

```
/imagine a cyberpunk city at night with neon lights
/imagine a golden retriever puppy playing in snow
/imagine futuristic trading floor with holographic charts
```

**Natural Conversation**:

```
"Can you create an image of a sunset over mountains?"
"Show me what a Mars colony would look like"
"Draw a minimalist logo for crypto trading"
```

**Supported Formats**:

- Square: 1024x1024 (default)
- Landscape: 1792x1024
- Portrait: 1024x1792

**Tips for Best Results**:

- Be specific and descriptive
- Include style preferences (photorealistic, cartoon, painting)
- Mention setting, mood, and time of day
- Describe colors and lighting

---

### 4. Group Moderation

AI-powered spam and scam detection:

**Auto-Moderation**:

- Spam message detection
- Scam link identification
- Promotional content filtering
- Repetitive message blocking
- Suspicious pattern recognition

**Admin Commands**:

```
/ban @username - Ban user permanently
/warn @username - Issue warning to user
/modstatus - Check moderation statistics
```

**Moderation Levels**:

- **Low**: Only obvious spam/scams
- **Medium**: Moderate filtering (default)
- **High**: Strict moderation

---

### 5. User Statistics

Track bot usage and engagement:

```
/stats - View your usage statistics
/leaderboard - Top users by activity
```

**Tracked Metrics**:

- Messages sent
- Commands used
- Images generated
- Crypto lookups
- AI conversations
- Last activity

---

## 📋 Command Reference

### General Commands

| Command     | Description              | Example     |
| ----------- | ------------------------ | ----------- |
| `/start`    | Start bot & show welcome | `/start`    |
| `/help`     | Show help message        | `/help`     |
| `/about`    | Bot information          | `/about`    |
| `/commands` | List all commands        | `/commands` |

### Crypto Commands

| Command                   | Description      | Example             |
| ------------------------- | ---------------- | ------------------- |
| `/price <symbol>`         | Get crypto price | `/price BTC`        |
| `/watch <symbol>`         | Add to watchlist | `/watch ETH`        |
| `/watchlist`              | View watchlist   | `/watchlist`        |
| `/alert <symbol> <price>` | Set price alert  | `/alert BTC 100000` |

### AI Commands

| Command             | Description           | Example                 |
| ------------------- | --------------------- | ----------------------- |
| `/imagine <prompt>` | Generate image        | `/imagine sunset beach` |
| `/chat`             | Start AI conversation | `/chat`                 |
| `/reset`            | Reset conversation    | `/reset`                |

### Moderation Commands (Admin Only)

| Command                | Description    | Example             |
| ---------------------- | -------------- | ------------------- |
| `/ban @user`           | Ban user       | `/ban @spammer`     |
| `/unban @user`         | Unban user     | `/unban @user123`   |
| `/warn @user`          | Warn user      | `/warn @user`       |
| `/modstatus`           | Mod statistics | `/modstatus`        |
| `/setmodlevel <level>` | Set mod level  | `/setmodlevel high` |

---

## 🔧 Setup & Configuration

### 1. Create Telegram Bot

```bash
# Talk to @BotFather on Telegram
/newbot
# Follow prompts to create bot
# Save the bot token
```

### 2. Environment Variables

```env
TELEGRAM_BOT_TOKEN="your-bot-token-from-botfather"
OPENAI_API_KEY="sk-proj-your-openai-api-key"
```

### 3. Set Webhook

```bash
# Use the provided script
bash scripts/set_webhook.sh

# Or manually
curl -X POST \
  "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://yourdomain.com/api/telegram"}'
```

### 4. Verify Setup

```bash
# Check webhook status
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

---

## 💡 Usage Examples

### Example 1: Trading Discussion

```
User: "What's a good strategy for day trading crypto?"
Bot: [Provides comprehensive strategy with risk management]

User: "How do I identify support and resistance levels?"
Bot: [Explains technical analysis concepts]

User: "What's BTC at right now?"
Bot: "Bitcoin (BTC)
💰 $101,241.00 USD
📊 -5.42% (24h)
🧮 Market Cap: $2.02T
📈 24h Volume: $118.44B"
```

### Example 2: Image Generation

```
User: "/imagine a futuristic trading desk with multiple holographic crypto charts"
Bot: [Generates and sends high-quality image]

User: "Can you make it more cyberpunk style?"
Bot: "/imagine a cyberpunk-style futuristic trading desk with neon-lit holographic crypto charts"
[Generates updated image]
```

### Example 3: Price Alerts

```
User: "/alert BTC 105000"
Bot: "✅ Price alert set! I'll notify you when BTC reaches $105,000"

[Later when price hits target]
Bot: "🚨 PRICE ALERT! Bitcoin (BTC) has reached $105,000!"
```

---

## 🎨 Customization

### Personality Configuration

Edit bot personality in `src/app/api/telegram/route.ts`:

```typescript
const systemPrompt = `You are M4Capital's AI assistant.
Personality: Professional, friendly, knowledgeable in crypto trading.
Guidelines:
- Provide accurate crypto information
- Be helpful and educational
- Never give financial advice
- Always encourage responsible trading`;
```

### Moderation Rules

Add custom rules in database:

```sql
INSERT INTO "ModerationRule" (pattern, action, severity)
VALUES ('spam-keyword', 'DELETE', 'MEDIUM');
```

### Custom Commands

Add new commands in webhook handler:

```typescript
if (messageText.startsWith("/custom")) {
  // Your custom command logic
  await sendMessage(chatId, "Custom response");
}
```

---

## 📊 Analytics & Monitoring

### Track Usage

```typescript
// User statistics are automatically tracked
const stats = await prisma.userStatistics.findUnique({
  where: { userId },
});
```

### Monitor Performance

- Message response time
- API call success rates
- Error frequency
- Popular commands
- Active users count

---

## 🔒 Security Features

1. **Rate Limiting**: Prevents spam and abuse
2. **User Validation**: Telegram user verification
3. **Admin-Only Commands**: Protected by permission checks
4. **Content Filtering**: Blocks malicious content
5. **API Key Protection**: Secure key storage

---

## 🚨 Troubleshooting

### Bot Not Responding

1. Check webhook status:

   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```

2. Verify environment variables are set

3. Check application logs for errors

4. Test bot with `/start` command

### Image Generation Fails

- Verify OpenAI API key is valid
- Check OpenAI account has credits
- Review prompt for policy violations
- Check API rate limits

### Price Data Unavailable

- Verify internet connectivity
- Check CoinGecko API status
- Try alternative symbols
- Review API rate limits

---

## 🔄 Future Features

Planned enhancements:

- [ ] Portfolio tracking in Telegram
- [ ] Trading signals and alerts
- [ ] Market analysis reports
- [ ] Scheduled crypto news updates
- [ ] Interactive quizzes
- [ ] Voice message support
- [ ] Multi-language support
- [ ] Webhook-based notifications
- [ ] Integration with main platform
- [ ] Custom watchlists per user

---

## 📚 Resources

- **Telegram Bot API**: https://core.telegram.org/bots/api
- **OpenAI API**: https://platform.openai.com/docs
- **CoinGecko API**: https://www.coingecko.com/api/documentation
- **Bot Examples**: `/public/telegram-examples/`

---

## 💬 Support

For bot-related issues:

1. Check logs in `/api/telegram` route
2. Review webhook configuration
3. Test with simple commands first
4. Verify all API keys are correct
5. Check rate limits on external APIs
