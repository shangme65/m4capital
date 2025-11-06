# Quick Setup Guide - New Features

## 🚀 Getting Started

### 1. Install Dependencies (if needed)

All dependencies are already in your `package.json`. If you need to reinstall:

```bash
npm install
```

### 2. Environment Variables

Add these to your `.env` file (optional but recommended):

```env
# HuggingFace API (for AI features)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx

# Database (should already exist)
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth (should already exist)
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

**Get a free HuggingFace API key**: https://huggingface.co/settings/tokens

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000/traderoom

---

## 📍 Adding New Components to Traderoom

### Option 1: Add AI Assistant (Recommended)

In `src/app/(dashboard)/traderoom/page.tsx`, add at the top level:

```tsx
import AITradingAssistant from "@/components/client/AITradingAssistant";

// Inside your component return, add:
<AITradingAssistant />;
```

The AI assistant will appear as a floating button in the bottom-right corner.

### Option 2: Add Sentiment Panel to Sidebar

Find the left sidebar section in `traderoom/page.tsx` and add:

```tsx
import MarketSentimentPanel from "@/components/client/MarketSentimentPanel";

// In the sidebar:
<MarketSentimentPanel symbols={["BTC", "ETH", "BNB", "SOL", "ADA"]} />;
```

### Option 3: Add Price Prediction Panel

Add to the right sidebar or below charts:

```tsx
import AIPricePrediction from "@/components/client/AIPricePrediction";
import { useCryptoMarket } from "@/components/client/CryptoMarketProvider";

// In your component:
const { cryptoPrices } = useCryptoMarket();

// In JSX:
<AIPricePrediction
  symbol={selectedSymbol}
  currentPrice={cryptoPrices[selectedSymbol] || 0}
/>;
```

### Option 4: Add Price Alerts (Global)

In your main layout or app wrapper:

```tsx
import { PriceAlertSystem } from "@/components/client/PriceAlerts";

// Add at root level:
<PriceAlertSystem />;
```

---

## 🎯 Testing Each Feature

### 1. Test Real-Time Charts

1. Go to `/traderoom`
2. Select any crypto symbol (BTC, ETH, etc.)
3. Watch the chart load with real Binance data
4. Click different interval buttons (1m, 5m, 15m, 1h, 4h, 1D)
5. Chart should reload with new timeframe data
6. Wait and observe - candles should update in real-time

### 2. Test Chart Grid

1. In the left panel, find the chart grid icons (1, 2, 4, 6 charts)
2. Click on "2 charts" icon
3. You should see two charts side by side
4. Each chart has a symbol dropdown in the top-left corner
5. Change symbols independently

### 3. Test AI Assistant

1. Look for the floating orange chat button (bottom-right)
2. Click to open
3. Try asking: "What's the best strategy for BTC right now?"
4. The AI should respond with trading advice
5. Try quick action buttons
6. Test minimize/close functionality

### 4. Test Sentiment Analysis

1. Add `<MarketSentimentPanel>` to your traderoom
2. Should show 5 crypto symbols with sentiment indicators
3. Green = Bullish, Red = Bearish
4. Click on different symbols to see detailed analysis
5. Confidence bars should animate

### 5. Test Price Predictions

1. Add `<AIPricePrediction>` component
2. Select different timeframes (1h, 4h, 24h)
3. Should show predicted price and percentage change
4. Mini timeline chart should display
5. Confidence score should be visible

### 6. Test Price Alerts

1. Add `<PriceAlertSystem>` to your app
2. Wait for price to change >1%
3. Should see notification card appear (top-right)
4. Should hear a beep sound (if not muted)
5. Click bell icon to mute/unmute
6. Alerts auto-dismiss after 5 seconds

---

## 🔍 Troubleshooting

### Charts Not Loading

**Problem**: Chart shows "Loading chart data..." forever

**Solutions**:

1. Check browser console for errors
2. Verify internet connection (needs access to Binance API)
3. Binance might be blocked in some regions - use VPN if needed
4. Check if `fetchKlineData()` is returning data in console

### AI Features Not Working

**Problem**: Chat responds with "API key not configured"

**Solutions**:

1. Add `HUGGINGFACE_API_KEY` to `.env`
2. Restart dev server after adding env variables
3. Get free API key from https://huggingface.co
4. System works with fallback, but limited features

### WebSocket Errors

**Problem**: Console shows WebSocket connection errors

**Solutions**:

1. Normal - Binance has rate limits
2. Component handles reconnection automatically
3. Falls back to REST API polling
4. Not critical - charts still update

### Chart Grid Not Showing

**Problem**: Only one chart visible after selecting grid

**Solutions**:

1. Verify `ChartGrid` component is imported correctly
2. Check `selectedChartGrid` state value
3. Ensure parent container has sufficient height
4. Check console for component errors

### Indicators Not Appearing

**Problem**: Technical indicators don't show on chart

**Solutions**:

1. Click "Indicators" button on chart
2. Select indicator from dropdown (MA, EMA, BOLL, etc.)
3. Indicators appear as overlays or separate panes
4. Click "Clear All" to remove

---

## 📊 Chart Intervals Explained

| Interval | Binance Format | Candle Duration |
| -------- | -------------- | --------------- |
| 1m       | 1m             | 1 minute        |
| 5m       | 5m             | 5 minutes       |
| 15m      | 15m            | 15 minutes      |
| 1h       | 1h             | 1 hour          |
| 4h       | 4h             | 4 hours         |
| 1D       | 1d             | 1 day           |

---

## 🎨 Customization

### Change Chart Colors

In `RealTimeTradingChart.tsx`:

```tsx
styles: {
  candle: {
    bar: {
      upColor: "#5ddf38",      // Green for bullish
      downColor: "#ff4747",    // Red for bearish
    },
  },
}
```

### Adjust Alert Thresholds

In `PriceAlerts.tsx`:

```tsx
// Current: Alert if >1% change
if (Math.abs(changePercent) < 1) return;

// Change to 0.5% for more alerts:
if (Math.abs(changePercent) < 0.5) return;
```

### Modify Prediction Timeframes

In `AIPricePrediction.tsx`:

```tsx
// Add new timeframe:
const [timeframe, setTimeframe] = useState<'1h' | '4h' | '24h' | '7d'>('1h');

// Add to selector:
{(['1h', '4h', '24h', '7d'] as const).map(tf => ( ... ))}
```

---

## 🚀 Performance Tips

1. **Limit Active Charts**: More charts = more API calls. Use 2-4 max.
2. **Longer Intervals**: Use 15m+ intervals for better performance
3. **Mute Alerts**: Disable sound if running multiple symbols
4. **Close Unused Grids**: Switch back to 1 chart when not needed
5. **API Rate Limits**: Binance limits requests. Respect their limits.

---

## 📱 Mobile Considerations

- Chart grid works best on desktop/tablet
- AI assistant is mobile-friendly (floating button)
- Sentiment panel scrollable on mobile
- Consider showing 1-2 charts max on mobile

---

## 🎓 Learning Resources

### Understanding Technical Indicators

- **MA (Moving Average)**: Trend direction over time
- **EMA (Exponential MA)**: More weight to recent prices
- **BOLL (Bollinger Bands)**: Volatility and price ranges
- **RSI (Relative Strength)**: Overbought/oversold levels (0-100)
- **MACD**: Momentum and trend changes
- **KDJ (Stochastic)**: Price momentum indicator
- **VOL (Volume)**: Trading volume bars

### AI Features

- **Sentiment Analysis**: Uses FinBERT model to analyze market sentiment
- **Price Prediction**: Technical analysis + random walk (upgradeable to ML)
- **Trading Signals**: Combines multiple indicators for BUY/SELL/HOLD

---

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Verify `.env` variables are set
3. Restart dev server: `npm run dev`
4. Clear browser cache
5. Check network tab for API failures

---

## ✅ Feature Checklist

After setup, verify:

- [ ] Charts load with real data from Binance
- [ ] Interval buttons change chart timeframe
- [ ] Chart grid shows multiple charts
- [ ] Symbol selector works on each chart
- [ ] AI chat button appears and responds
- [ ] Sentiment panel displays for symbols
- [ ] Price predictions generate
- [ ] Alerts trigger on price changes
- [ ] Indicators menu works (MA, EMA, etc.)
- [ ] WebSocket updates charts in real-time

---

## 🎉 You're Ready!

All features are implemented and ready to use. Enjoy your professional trading platform with AI-powered insights, real-time data, and advanced charting capabilities!

For detailed implementation docs, see: `docs/PRIORITY_FEATURES_IMPLEMENTATION.md`
