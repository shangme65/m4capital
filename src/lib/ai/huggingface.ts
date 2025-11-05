/**
 * Hugging Face AI Trading Integration
 * Provides market sentiment analysis and price predictions
 */

interface HFResponse {
  generated_text?: string;
  label?: string;
  score?: number;
  [key: string]: any;
}

interface SentimentResult {
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  analysis: string;
}

interface TradingSignal {
  action: "buy" | "sell" | "hold";
  confidence: number;
  reasoning: string;
  targetPrice?: number;
  stopLoss?: number;
}

/**
 * Analyze market sentiment from news/text
 */
export async function analyzeMarketSentiment(
  text: string
): Promise<SentimentResult> {
  try {
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_API_KEY) {
      console.warn("⚠️ HUGGINGFACE_API_KEY not set, using fallback analysis");
      return fallbackSentimentAnalysis(text);
    }

    // Using FinBERT for financial sentiment analysis
    const response = await fetch(
      "https://api-inference.huggingface.co/models/ProsusAI/finbert",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }

    const result: HFResponse[] = await response.json();

    if (!result || !result[0] || !Array.isArray(result[0])) {
      return fallbackSentimentAnalysis(text);
    }

    // FinBERT returns array of labels with scores
    const predictions = result[0] as { label: string; score: number }[];
    const topPrediction = predictions.reduce((max, curr) =>
      curr.score > max.score ? curr : max
    );

    let sentiment: "bullish" | "bearish" | "neutral";
    if (topPrediction.label.toLowerCase().includes("positive")) {
      sentiment = "bullish";
    } else if (topPrediction.label.toLowerCase().includes("negative")) {
      sentiment = "bearish";
    } else {
      sentiment = "neutral";
    }

    return {
      sentiment,
      confidence: topPrediction.score,
      analysis: `Market sentiment appears ${sentiment} with ${(
        topPrediction.score * 100
      ).toFixed(1)}% confidence`,
    };
  } catch (error) {
    console.error("❌ Sentiment analysis error:", error);
    return fallbackSentimentAnalysis(text);
  }
}

/**
 * Generate trading signal for a symbol
 */
export async function generateTradingSignal(
  symbol: string,
  currentPrice: number,
  priceHistory: number[],
  newsContext?: string
): Promise<TradingSignal> {
  try {
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_API_KEY) {
      console.warn("⚠️ HUGGINGFACE_API_KEY not set, using technical analysis");
      return technicalAnalysisSignal(currentPrice, priceHistory);
    }

    // Calculate technical indicators
    const sma20 = calculateSMA(priceHistory, 20);
    const rsi = calculateRSI(priceHistory, 14);
    const volatility = calculateVolatility(priceHistory);

    // Get sentiment from news if available
    let sentiment: SentimentResult | null = null;
    if (newsContext) {
      sentiment = await analyzeMarketSentiment(newsContext);
    }

    // Build context for AI model
    const context = `
Symbol: ${symbol}
Current Price: $${currentPrice}
20-day SMA: $${sma20.toFixed(2)}
RSI: ${rsi.toFixed(2)}
Volatility: ${volatility.toFixed(2)}%
${
  sentiment
    ? `Market Sentiment: ${sentiment.sentiment} (${(
        sentiment.confidence * 100
      ).toFixed(1)}% confidence)`
    : ""
}

Based on this technical and sentiment analysis, provide a trading recommendation.
    `.trim();

    // Use a general instruction-following model for trading advice
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `<s>[INST] You are a professional crypto trader. ${context}\n\nProvide a clear BUY, SELL, or HOLD recommendation with reasoning. [/INST]`,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            top_p: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }

    const result: HFResponse[] = await response.json();
    const aiResponse = result[0]?.generated_text || "";

    // Parse AI response
    return parseAITradingSignal(aiResponse, currentPrice, rsi, sma20);
  } catch (error) {
    console.error("❌ Trading signal error:", error);
    return technicalAnalysisSignal(currentPrice, priceHistory);
  }
}

/**
 * Predict price movement
 */
export async function predictPriceMovement(
  symbol: string,
  priceHistory: number[]
): Promise<{ prediction: number; confidence: number; timeframe: string }> {
  try {
    // For now, use simple technical prediction
    // In production, you'd use a trained time-series model
    const sma20 = calculateSMA(priceHistory, 20);
    const trend = priceHistory[priceHistory.length - 1] - sma20;
    const avgVolatility = calculateVolatility(priceHistory);

    const prediction = priceHistory[priceHistory.length - 1] + trend * 0.5;
    const confidence = Math.max(0.3, 1 - avgVolatility / 100);

    return {
      prediction,
      confidence,
      timeframe: "24h",
    };
  } catch (error) {
    console.error("❌ Price prediction error:", error);
    return {
      prediction: priceHistory[priceHistory.length - 1],
      confidence: 0.5,
      timeframe: "24h",
    };
  }
}

// ============= Helper Functions =============

function fallbackSentimentAnalysis(text: string): SentimentResult {
  // Simple keyword-based fallback
  const bullishWords = ["up", "gain", "profit", "bullish", "rise", "surge"];
  const bearishWords = ["down", "loss", "bearish", "fall", "drop", "crash"];

  const lowerText = text.toLowerCase();
  const bullishCount = bullishWords.filter((word) =>
    lowerText.includes(word)
  ).length;
  const bearishCount = bearishWords.filter((word) =>
    lowerText.includes(word)
  ).length;

  let sentiment: "bullish" | "bearish" | "neutral";
  let confidence: number;

  if (bullishCount > bearishCount) {
    sentiment = "bullish";
    confidence = Math.min(0.7, 0.5 + bullishCount * 0.1);
  } else if (bearishCount > bullishCount) {
    sentiment = "bearish";
    confidence = Math.min(0.7, 0.5 + bearishCount * 0.1);
  } else {
    sentiment = "neutral";
    confidence = 0.6;
  }

  return {
    sentiment,
    confidence,
    analysis: `Simple keyword analysis suggests ${sentiment} sentiment`,
  };
}

function technicalAnalysisSignal(
  currentPrice: number,
  priceHistory: number[]
): TradingSignal {
  const sma20 = calculateSMA(priceHistory, 20);
  const rsi = calculateRSI(priceHistory, 14);

  let action: "buy" | "sell" | "hold";
  let reasoning: string;
  let confidence: number;

  if (rsi < 30 && currentPrice < sma20 * 0.98) {
    action = "buy";
    reasoning = "RSI oversold and price below SMA - potential reversal";
    confidence = 0.75;
  } else if (rsi > 70 && currentPrice > sma20 * 1.02) {
    action = "sell";
    reasoning = "RSI overbought and price above SMA - potential correction";
    confidence = 0.75;
  } else {
    action = "hold";
    reasoning = "No clear technical signal - waiting for better entry";
    confidence = 0.6;
  }

  return {
    action,
    confidence,
    reasoning,
    targetPrice: action === "buy" ? currentPrice * 1.05 : currentPrice * 0.95,
    stopLoss: action === "buy" ? currentPrice * 0.97 : currentPrice * 1.03,
  };
}

function parseAITradingSignal(
  aiResponse: string,
  currentPrice: number,
  rsi: number,
  sma: number
): TradingSignal {
  const lowerResponse = aiResponse.toLowerCase();

  let action: "buy" | "sell" | "hold" = "hold";
  if (lowerResponse.includes("buy") && !lowerResponse.includes("don't buy")) {
    action = "buy";
  } else if (
    lowerResponse.includes("sell") &&
    !lowerResponse.includes("don't sell")
  ) {
    action = "sell";
  }

  // Extract confidence if mentioned
  const confidenceMatch = aiResponse.match(/(\d+)%/);
  const confidence = confidenceMatch
    ? parseFloat(confidenceMatch[1]) / 100
    : 0.7;

  return {
    action,
    confidence: Math.min(0.95, Math.max(0.5, confidence)),
    reasoning: aiResponse.substring(0, 200),
    targetPrice: action === "buy" ? currentPrice * 1.05 : currentPrice * 0.95,
    stopLoss: action === "buy" ? currentPrice * 0.97 : currentPrice * 1.03,
  };
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((sum, price) => sum + price, 0) / period;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;

  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

  return Math.sqrt(variance) * 100;
}
