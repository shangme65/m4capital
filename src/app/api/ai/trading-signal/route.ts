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

    // Fetch REAL historical price data from Binance
    const historicalData = await marketService.getHistoricalData(symbol, "1H");
    const priceHistory = historicalData.map((candle) => candle.close);

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
