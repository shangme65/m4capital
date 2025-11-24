import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/news
 * Fetch real financial news from multiple sources
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 20;

    // Combine news from multiple free sources
    const news = await fetchFinancialNews(category, page, pageSize);

    return NextResponse.json({
      success: true,
      news,
      total: news.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

async function fetchFinancialNews(
  category: string,
  page: number,
  pageSize: number
) {
  const allNews: any[] = [];

  try {
    // 1. Fetch from CoinDesk RSS (Crypto news)
    if (category === "all" || category === "crypto") {
      const cryptoNews = await fetchCoinDeskNews();
      allNews.push(...cryptoNews);
    }

    // 2. Fetch from Yahoo Finance RSS (Market news)
    if (category === "all" || category === "market") {
      const marketNews = await fetchYahooFinanceNews();
      allNews.push(...marketNews);
    }

    // 3. Fetch from CoinTelegraph RSS (Crypto news)
    if (category === "all" || category === "crypto") {
      const cointelegraphNews = await fetchCoinTelegraphNews();
      allNews.push(...cointelegraphNews);
    }

    // 4. Fetch from Investing.com RSS (Forex/Commodities)
    if (category === "all" || category === "forex") {
      const forexNews = await fetchInvestingComNews();
      allNews.push(...forexNews);
    }

    // Sort by date (newest first)
    allNews.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return allNews.slice(start, end);
  } catch (error) {
    console.error("Error fetching financial news:", error);
    return [];
  }
}

// Fetch from CoinDesk RSS
async function fetchCoinDeskNews() {
  try {
    const response = await fetch(
      "https://www.coindesk.com/arc/outboundfeeds/rss/"
    );
    const xml = await response.text();
    return parseRSSFeed(xml, "CoinDesk", "crypto");
  } catch (error) {
    console.error("Error fetching CoinDesk news:", error);
    return [];
  }
}

// Fetch from Yahoo Finance RSS
async function fetchYahooFinanceNews() {
  try {
    const response = await fetch("https://finance.yahoo.com/news/rssindex");
    const xml = await response.text();
    return parseRSSFeed(xml, "Yahoo Finance", "market");
  } catch (error) {
    console.error("Error fetching Yahoo Finance news:", error);
    return [];
  }
}

// Fetch from CoinTelegraph RSS
async function fetchCoinTelegraphNews() {
  try {
    const response = await fetch("https://cointelegraph.com/rss");
    const xml = await response.text();
    return parseRSSFeed(xml, "CoinTelegraph", "crypto");
  } catch (error) {
    console.error("Error fetching CoinTelegraph news:", error);
    return [];
  }
}

// Fetch from Investing.com RSS
async function fetchInvestingComNews() {
  try {
    const response = await fetch("https://www.investing.com/rss/news.rss");
    const xml = await response.text();
    return parseRSSFeed(xml, "Investing.com", "forex");
  } catch (error) {
    console.error("Error fetching Investing.com news:", error);
    return [];
  }
}

// Simple RSS parser
function parseRSSFeed(xml: string, source: string, category: string) {
  const items: any[] = [];

  try {
    // Extract items from RSS feed using exec loop for compatibility
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
      const itemXml = match[1];

      // Extract title
      const titleMatch = itemXml.match(
        /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/
      );
      const title = titleMatch ? (titleMatch[1] || titleMatch[2])?.trim() : "";

      // Extract description
      const descMatch = itemXml.match(
        /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/
      );
      const description = descMatch
        ? (descMatch[1] || descMatch[2])
            ?.trim()
            .replace(/<[^>]*>/g, "")
            .substring(0, 200)
        : "";

      // Extract link
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const url = linkMatch ? linkMatch[1].trim() : "";

      // Extract pubDate
      const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const timestamp = dateMatch
        ? new Date(dateMatch[1].trim()).toISOString()
        : new Date().toISOString();

      if (title && url) {
        items.push({
          id: `${source}-${Date.now()}-${Math.random()}`,
          title,
          summary: description || title,
          source,
          timestamp,
          url,
          category,
          sentiment: analyzeSentiment(title + " " + description),
          impact: "medium",
        });
      }
    }
  } catch (error) {
    console.error(`Error parsing RSS feed from ${source}:`, error);
  }

  return items;
}

// Simple sentiment analysis based on keywords
function analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
  const lowerText = text.toLowerCase();

  const positiveWords = [
    "surge",
    "rally",
    "gain",
    "rise",
    "bull",
    "breakthrough",
    "success",
    "profit",
    "growth",
    "soar",
    "jump",
    "climb",
  ];
  const negativeWords = [
    "crash",
    "fall",
    "drop",
    "decline",
    "bear",
    "loss",
    "down",
    "plunge",
    "slump",
    "sink",
    "tumble",
    "collapse",
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}
