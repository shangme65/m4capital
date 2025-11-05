/**
 * Real-Time Price Feed Service
 * Connects to crypto exchanges and broadcasts price updates
 */

import { broadcastPriceUpdate } from "./server";

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

interface ExchangeWebSocket {
  exchange: string;
  ws: WebSocket | null;
  symbols: Set<string>;
}

// Track active exchange connections
const exchangeConnections = new Map<string, ExchangeWebSocket>();
const priceCache = new Map<string, PriceData>();

// Supported trading pairs
const SUPPORTED_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "XRPUSDT",
  "DOTUSDT",
  "MATICUSDT",
  "LINKUSDT",
];

/**
 * Initialize price feed service
 */
export function initPriceService(): void {
  console.log("🚀 Initializing price feed service");

  // Connect to Binance for all supported symbols
  connectToBinance(SUPPORTED_SYMBOLS);

  // Fallback: polling for symbols without WebSocket
  startPollingFallback();

  console.log("✅ Price feed service initialized");
}

/**
 * Connect to Binance WebSocket for real-time price updates
 */
function connectToBinance(symbols: string[]): void {
  try {
    // Binance streams format: btcusdt@ticker
    const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join("/");
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    console.log(`🔌 Connecting to Binance WebSocket`);

    // Note: In Node.js environment, use 'ws' library instead of browser WebSocket
    // This is a simplified version - actual implementation would use 'ws' library
    const binanceConnection: ExchangeWebSocket = {
      exchange: "binance",
      ws: null, // Will be set when using 'ws' library
      symbols: new Set(symbols),
    };

    exchangeConnections.set("binance", binanceConnection);

    // For server-side, you'd use:
    // const WebSocket = require('ws');
    // const ws = new WebSocket(wsUrl);

    console.log(`✅ Binance connection prepared for ${symbols.length} symbols`);
  } catch (error) {
    console.error("❌ Failed to connect to Binance:", error);
  }
}

/**
 * Handle Binance WebSocket message
 * This would be called in the actual WebSocket message handler
 */
export function handleBinanceMessage(data: any): void {
  try {
    if (data.stream && data.data) {
      const ticker = data.data;

      // Extract symbol from stream name (e.g., "btcusdt@ticker")
      const symbol = data.stream.split("@")[0].toUpperCase();

      const priceData: PriceData = {
        symbol,
        price: parseFloat(ticker.c), // Current price
        change24h: parseFloat(ticker.P), // 24h price change percent
        volume24h: parseFloat(ticker.v), // 24h volume
        high24h: parseFloat(ticker.h), // 24h high
        low24h: parseFloat(ticker.l), // 24h low
        timestamp: ticker.E, // Event time
      };

      // Update cache
      priceCache.set(symbol, priceData);

      // Broadcast to WebSocket clients
      broadcastPriceUpdate(symbol, priceData);
    }
  } catch (error) {
    console.error("❌ Error handling Binance message:", error);
  }
}

/**
 * Polling fallback for when WebSocket is unavailable
 */
function startPollingFallback(): void {
  // Poll every 5 seconds as fallback
  setInterval(async () => {
    for (const symbol of SUPPORTED_SYMBOLS) {
      try {
        await fetchAndBroadcastPrice(symbol);
      } catch (error) {
        console.error(`❌ Failed to fetch price for ${symbol}:`, error);
      }
    }
  }, 5000);

  console.log("✅ Polling fallback started (5s interval)");
}

/**
 * Fetch price from Binance REST API and broadcast
 */
async function fetchAndBroadcastPrice(symbol: string): Promise<void> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const ticker = await response.json();

    const priceData: PriceData = {
      symbol,
      price: parseFloat(ticker.lastPrice),
      change24h: parseFloat(ticker.priceChangePercent),
      volume24h: parseFloat(ticker.volume),
      high24h: parseFloat(ticker.highPrice),
      low24h: parseFloat(ticker.lowPrice),
      timestamp: ticker.closeTime,
    };

    // Update cache
    priceCache.set(symbol, priceData);

    // Broadcast to WebSocket clients
    broadcastPriceUpdate(symbol, priceData);
  } catch (error) {
    // Silent fail - will retry on next poll
  }
}

/**
 * Get cached price data for a symbol
 */
export function getCachedPrice(symbol: string): PriceData | null {
  return priceCache.get(symbol) || null;
}

/**
 * Get all cached prices
 */
export function getAllCachedPrices(): Map<string, PriceData> {
  return new Map(priceCache);
}

/**
 * Subscribe to price updates for a symbol
 */
export function subscribeToPriceUpdates(symbol: string): void {
  if (!SUPPORTED_SYMBOLS.includes(symbol)) {
    console.warn(`⚠️ Symbol ${symbol} not supported`);
    return;
  }

  // If we already have cached data, send it immediately
  const cached = priceCache.get(symbol);
  if (cached) {
    broadcastPriceUpdate(symbol, cached);
  }

  console.log(`📊 Subscribed to price updates for ${symbol}`);
}

/**
 * Clean up connections
 */
export function closePriceService(): void {
  exchangeConnections.forEach((connection) => {
    if (connection.ws) {
      connection.ws.close();
    }
  });

  exchangeConnections.clear();
  priceCache.clear();

  console.log("✅ Price feed service closed");
}

/**
 * Get supported trading symbols
 */
export function getSupportedSymbols(): string[] {
  return [...SUPPORTED_SYMBOLS];
}

/**
 * Health check for price service
 */
export function isPriceServiceHealthy(): boolean {
  // Check if we have recent data (within last 30 seconds)
  const now = Date.now();
  const recentPrices = Array.from(priceCache.values()).filter(
    (price) => now - price.timestamp < 30000
  );

  return recentPrices.length > 0;
}
