# WebSocket + AI Integration Guide

## 🎉 Integration Complete!

All core infrastructure has been created. This guide shows you how to integrate everything into your Next.js app.

---

## 📦 What Was Created

### 1. **WebSocket Server** (`src/lib/websocket/server.ts`)

- Authentication via userId
- Subscribe/unsubscribe to trading symbols
- Broadcast price updates and trade executions
- Heartbeat mechanism for connection health
- Client management

### 2. **Hugging Face AI Service** (`src/lib/ai/huggingface.ts`)

- **analyzeMarketSentiment()** - FinBERT sentiment analysis (bullish/bearish/neutral)
- **generateTradingSignal()** - BUY/SELL/HOLD recommendations with confidence scores
- **predictPriceMovement()** - Price predictions with timeframes
- Technical indicators: SMA, RSI, volatility
- Fallback logic when API key not set

### 3. **WebSocket React Hook** (`src/hooks/useWebSocket.ts`)

- Auto-connect on mount
- Auto-reconnect with exponential backoff
- Message queue for offline messages
- Subscribe/unsubscribe to symbols
- Real-time price updates
- Trade execution notifications

### 4. **Real-Time Price Service** (`src/lib/websocket/priceService.ts`)

- Binance WebSocket connection
- Polling fallback (5s interval)
- Price caching
- 10 supported symbols: BTC, ETH, BNB, SOL, ADA, DOGE, XRP, DOT, MATIC, LINK

### 5. **AI Trading Signal API** (`src/app/api/ai/trading-signal/route.ts`)

- GET `/api/ai/trading-signal?symbol=BTCUSDT`
- Combines real-time price + AI analysis
- Returns action, confidence, reasoning, targets

---

## 🚀 Integration Steps

### Step 1: Set Environment Variable

Add to your `.env` file:

```env
# Optional: For full AI features (get free key at huggingface.co)
HUGGINGFACE_API_KEY=hf_your_api_key_here
```

**Note:** The system works without the API key using technical analysis fallback.

### Step 2: Integrate WebSocket Server with Next.js

Create `src/app/api/websocket/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { initWebSocketServer } from "@/lib/websocket/server";
import { initPriceService } from "@/lib/websocket/priceService";

export async function GET(request: NextRequest) {
  // This will be called when Next.js starts
  // Initialize WebSocket server
  const server = (global as any).server;

  if (server && !server.wsInitialized) {
    initWebSocketServer(server);
    initPriceService();
    server.wsInitialized = true;
  }

  return new Response("WebSocket server ready", { status: 200 });
}
```

**OR** modify `server.js` (if using custom server):

```javascript
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { initWebSocketServer } = require("./src/lib/websocket/server");
const { initPriceService } = require("./src/lib/websocket/priceService");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize WebSocket
  initWebSocketServer(server);
  initPriceService();

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
```

### Step 3: Use in Traderoom Component

Update `src/app/dashboard/traderoom/page.tsx`:

```typescript
"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";

export default function TraderoomPage() {
  const {
    isConnected,
    subscribe,
    unsubscribe,
    lastPriceUpdate,
    lastTradeExecution,
  } = useWebSocket();

  const [tradingSignal, setTradingSignal] = useState<any>(null);

  // Subscribe to BTC price updates
  useEffect(() => {
    if (isConnected) {
      subscribe("BTCUSDT");
      subscribe("ETHUSDT");
    }

    return () => {
      unsubscribe("BTCUSDT");
      unsubscribe("ETHUSDT");
    };
  }, [isConnected, subscribe, unsubscribe]);

  // Fetch AI trading signal
  const getAISignal = async (symbol: string) => {
    const response = await fetch(`/api/ai/trading-signal?symbol=${symbol}`);
    const data = await response.json();
    setTradingSignal(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Trading Room</h1>

      {/* Connection Status */}
      <div className="mb-4">
        <span
          className={`px-3 py-1 rounded ${
            isConnected ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </span>
      </div>

      {/* Real-Time Prices */}
      {lastPriceUpdate && (
        <div className="bg-gray-800 p-4 rounded mb-4">
          <h2 className="text-xl font-bold">{lastPriceUpdate.symbol}</h2>
          <p className="text-3xl">${lastPriceUpdate.price.toFixed(2)}</p>
          <p
            className={
              lastPriceUpdate.change24h >= 0 ? "text-green-500" : "text-red-500"
            }
          >
            {lastPriceUpdate.change24h >= 0 ? "+" : ""}
            {lastPriceUpdate.change24h.toFixed(2)}%
          </p>
        </div>
      )}

      {/* AI Trading Signal */}
      <button
        onClick={() => getAISignal("BTCUSDT")}
        className="bg-blue-600 px-4 py-2 rounded mb-4"
      >
        Get AI Signal
      </button>

      {tradingSignal?.signal && (
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-xl font-bold mb-2">AI Recommendation</h3>
          <p className="text-2xl font-bold">
            {tradingSignal.signal.action.toUpperCase()}
          </p>
          <p>
            Confidence: {(tradingSignal.signal.confidence * 100).toFixed(1)}%
          </p>
          <p className="mt-2">{tradingSignal.signal.reasoning}</p>
          {tradingSignal.signal.targetPrice && (
            <p className="mt-2">
              Target: ${tradingSignal.signal.targetPrice.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* Trade Notifications */}
      {lastTradeExecution && (
        <div className="bg-green-900 p-4 rounded mt-4">
          <p>Trade Executed: {lastTradeExecution.symbol}</p>
          <p>
            {lastTradeExecution.side} @ ${lastTradeExecution.price}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Testing

### 1. Test AI Trading Signal API

```bash
# Terminal (with server running)
curl "http://localhost:3000/api/ai/trading-signal?symbol=BTCUSDT"
```

Expected response:

```json
{
  "success": true,
  "symbol": "BTCUSDT",
  "currentPrice": 95000,
  "change24h": 2.5,
  "signal": {
    "action": "buy",
    "confidence": 0.75,
    "reasoning": "RSI oversold and price below SMA - potential reversal",
    "targetPrice": 99750,
    "stopLoss": 92150
  },
  "sentiment": null,
  "timestamp": 1234567890
}
```

### 2. Test WebSocket Connection

Open browser console in traderoom:

```javascript
// Should see in console:
// 🔌 Connecting to WebSocket: ws://localhost:3000/ws
// ✅ WebSocket connected
// ✅ WebSocket authenticated
// 📊 Subscribed to price updates for BTCUSDT
```

---

## 🎨 UI Components You Can Build

### Price Ticker

```typescript
function PriceTicker({ symbol }: { symbol: string }) {
  const { lastPriceUpdate } = useWebSocket();

  if (lastPriceUpdate?.symbol !== symbol) return null;

  return (
    <div>
      <span className="text-2xl">${lastPriceUpdate.price}</span>
      <span
        className={
          lastPriceUpdate.change24h >= 0 ? "text-green-500" : "text-red-500"
        }
      >
        {lastPriceUpdate.change24h.toFixed(2)}%
      </span>
    </div>
  );
}
```

### AI Signal Badge

```typescript
function AISignalBadge({ signal }: { signal: any }) {
  const colors = {
    buy: "bg-green-600",
    sell: "bg-red-600",
    hold: "bg-yellow-600",
  };

  return (
    <div className={`${colors[signal.action]} px-4 py-2 rounded`}>
      <p className="font-bold">{signal.action.toUpperCase()}</p>
      <p className="text-sm">
        {(signal.confidence * 100).toFixed(0)}% confident
      </p>
    </div>
  );
}
```

---

## 📊 Available Features

### WebSocket Messages

**Send:**

- `{ type: "subscribe", symbol: "BTCUSDT" }`
- `{ type: "unsubscribe", symbol: "BTCUSDT" }`
- `{ type: "ping" }`

**Receive:**

- `{ type: "priceUpdate", symbol, price, change24h, volume24h }`
- `{ type: "tradeExecuted", tradeId, symbol, side, price, quantity }`
- `{ type: "pong" }`

### AI Functions

```typescript
import {
  analyzeMarketSentiment,
  generateTradingSignal,
  predictPriceMovement,
} from "@/lib/ai/huggingface";

// Analyze news sentiment
const sentiment = await analyzeMarketSentiment("Bitcoin surges past $100k!");

// Get trading recommendation
const signal = await generateTradingSignal("BTCUSDT", 95000, priceHistory);

// Predict future price
const prediction = await predictPriceMovement("BTCUSDT", priceHistory);
```

---

## 🔧 Next Steps

1. **Run Database Migration** (when DB available):

   ```bash
   npx prisma migrate dev --name add_trade_model
   ```

2. **Customize Supported Symbols**:
   Edit `SUPPORTED_SYMBOLS` in `src/lib/websocket/priceService.ts`

3. **Add More AI Models**:

   - Price forecasting with time-series models
   - Risk assessment
   - Portfolio optimization

4. **Enhanced UI**:

   - Live order book
   - Candlestick charts with TradingView
   - Real-time portfolio value
   - Trade history with live updates

5. **Production Optimizations**:
   - Use actual WebSocket library on server (`ws` package)
   - Implement rate limiting
   - Add Redis for price caching
   - Set up monitoring/alerts

---

## 🐛 Troubleshooting

**WebSocket not connecting?**

- Check if custom server is set up
- Verify port 3000 is not blocked
- Check browser console for errors

**AI signals not working?**

- System works without API key (uses technical analysis)
- For full features, add `HUGGINGFACE_API_KEY` to `.env`
- Check API quotas at huggingface.co

**No price updates?**

- Binance API might be rate-limited
- Check polling fallback is working (5s interval)
- Verify network connectivity

---

## ✅ Summary

You now have:

- ✅ Real-time WebSocket server with authentication
- ✅ Hugging Face AI integration for trading signals
- ✅ React hooks for easy WebSocket usage
- ✅ Live price feeds from Binance
- ✅ AI trading signal API endpoint
- ✅ Complete integration guide

**Start the dev server and test the AI trading signal API!**

```bash
npm run dev

# In another terminal:
curl "http://localhost:3000/api/ai/trading-signal?symbol=BTCUSDT"
```
