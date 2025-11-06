/**
 * AI Trading Signal API Endpoint
 * GET /api/ai/trading-signal?symbol=BTCUSDT
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  generateTradingSignal,
  analyzeMarketSentiment,
} from "@/lib/ai/huggingface";
import { getMarketDataService } from "@/lib/marketData";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get symbol from query params
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol parameter required" },
        { status: 400 }
      );
    }

    // Get current price data from MarketDataService
    const marketService = getMarketDataService();
    const priceData = marketService.getPrice(symbol);

    if (!priceData) {
      return NextResponse.json(
        { error: "Price data not available for this symbol" },
        { status: 404 }
      );
    }

    // Generate price history (simulate with some variance)
    // In production, you'd fetch from database or cache
    const priceHistory = generatePriceHistory(
      priceData.price,
      priceData.change || 0
    );

    // Optional: Get news context for sentiment analysis
    const newsContext = searchParams.get("news");

    // Generate AI trading signal
    const signal = await generateTradingSignal(
      symbol,
      priceData.price,
      priceHistory,
      newsContext || undefined
    );

    // Get sentiment analysis if news provided
    let sentiment = null;
    if (newsContext) {
      sentiment = await analyzeMarketSentiment(newsContext);
    }

    return NextResponse.json({
      success: true,
      symbol,
      currentPrice: priceData.price,
      change24h: priceData.change || 0,
      signal: {
        action: signal.action,
        confidence: signal.confidence,
        reasoning: signal.reasoning,
        targetPrice: signal.targetPrice,
        stopLoss: signal.stopLoss,
      },
      sentiment: sentiment
        ? {
            sentiment: sentiment.sentiment,
            confidence: sentiment.confidence,
            analysis: sentiment.analysis,
          }
        : null,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("❌ Trading signal API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate trading signal",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate simulated price history
 * In production, fetch actual historical data
 */
function generatePriceHistory(
  currentPrice: number,
  change24h: number
): number[] {
  const history: number[] = [];
  const volatility = Math.abs(change24h) * 0.01;

  // Generate 100 data points
  let price = currentPrice * (1 - change24h / 100);

  for (let i = 0; i < 100; i++) {
    const randomChange = (Math.random() - 0.5) * volatility * price;
    price += randomChange;
    history.push(price);
  }

  // Ensure last price matches current
  history.push(currentPrice);

  return history;
}
