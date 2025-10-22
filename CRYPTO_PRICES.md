# Crypto Price Integration

Your Telegram bot now supports real-time cryptocurrency prices from multiple sources!

## Features

- **Multi-Source Data**: Fetches prices from 3 APIs:

  - CoinGecko (no API key required)
  - Binance (no API key required)
  - CoinMarketCap (optional - requires free API key)

- **Top 200 Cryptocurrencies**: Supports the top 200 cryptocurrencies by market cap

- **Real-Time Data**:
  - Current USD price
  - 24-hour price change percentage
  - Market cap information

## How to Use

Users can ask the bot questions like:

- "What's the Bitcoin price?"
- "Show me Ethereum and Solana prices"
- "What are the top 10 cryptocurrencies?"
- "Current price of BTC, ETH, and BNB"

The bot will automatically fetch prices from all available sources and display them.

## Setup

### Required (Already Configured)

- ✅ OpenAI API Key
- ✅ Telegram Bot Token

### Optional (For CoinMarketCap Data)

1. Sign up at https://pro.coinmarketcap.com/signup
2. Get your free API key (Basic plan: 10,000 calls/month)
3. Add to your `.env` file:
   ```
   COINMARKETCAP_API_KEY="your-api-key-here"
   ```
4. Redeploy to Vercel

**Note**: The bot works without CoinMarketCap API key using CoinGecko and Binance.

## Supported Cryptocurrencies

The bot supports the top 200 cryptocurrencies including:

**Top 10 by Market Cap:**

- Bitcoin (BTC)
- Ethereum (ETH)
- Tether (USDT)
- BNB (BNB)
- Solana (SOL)
- XRP (XRP)
- USD Coin (USDC)
- Cardano (ADA)
- Dogecoin (DOGE)
- TRON (TRX)

...and 190 more!

## Example Responses

**User**: "Bitcoin price"

**Bot**:

```
📊 Cryptocurrency Prices (from multiple sources):

CoinGecko:
  • BITCOIN: $67,234.50 (+2.34% 📈)

Binance:
  • BITCOIN: $67,235.12 (+2.35% 📈)
```

## How It Works

1. User asks about crypto prices
2. OpenAI detects the intent and calls `get_crypto_prices` function
3. Bot fetches data from all 3 APIs in parallel
4. Results are aggregated and formatted
5. Bot sends formatted response to user

## API Rate Limits

- **CoinGecko**: 50 calls/minute (free tier)
- **Binance**: No strict limits for public endpoints
- **CoinMarketCap**: 333 calls/day (Basic free plan)

The bot automatically handles failures gracefully - if one API fails, it uses data from the others.
