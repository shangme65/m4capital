import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import AdmZip from "adm-zip";
import axios from "axios";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Prisma
const prisma = new PrismaClient();

// Store conversation history per user (in production, use a database)
const conversationHistory = new Map<
  number,
  Array<{ role: "user" | "assistant"; content: string }>
>();

// Store warning counts per user per chat
const userWarnings = new Map<string, number>();

// Price alert monitoring (in-memory for now)
const priceAlertLastChecked = new Map<string, number>();

// Moderation settings
const MODERATION_CONFIG = {
  MAX_WARNINGS: 3,
  AUTO_BAN_ENABLED: true,
  AUTO_MODERATE_GROUPS: true,
  TOXICITY_THRESHOLD: 0.7, // 0-1 scale, higher = more strict
};

// Multi-language translations
const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: "Welcome to M4Capital AI Assistant! 🤖",
    help: "Available commands:",
    lang_changed: "Language changed to English",
  },
  es: {
    welcome: "¡Bienvenido al Asistente de IA de M4Capital! 🤖",
    help: "Comandos disponibles:",
    lang_changed: "Idioma cambiado a Español",
  },
  fr: {
    welcome: "Bienvenue dans l'Assistant IA M4Capital ! 🤖",
    help: "Commandes disponibles:",
    lang_changed: "Langue changée en Français",
  },
  de: {
    welcome: "Willkommen beim M4Capital KI-Assistenten! 🤖",
    help: "Verfügbare Befehle:",
    lang_changed: "Sprache auf Deutsch geändert",
  },
  pt: {
    welcome: "Bem-vindo ao Assistente de IA M4Capital! 🤖",
    help: "Comandos disponíveis:",
    lang_changed: "Idioma alterado para Português",
  },
  ru: {
    welcome: "Добро пожаловать в AI-помощник M4Capital! 🤖",
    help: "Доступные команды:",
    lang_changed: "Язык изменен на Русский",
  },
  zh: {
    welcome: "欢迎使用 M4Capital AI 助手！🤖",
    help: "可用命令：",
    lang_changed: "语言已更改为中文",
  },
  ja: {
    welcome: "M4Capital AIアシスタントへようこそ！🤖",
    help: "利用可能なコマンド：",
    lang_changed: "言語が日本語に変更されました",
  },
  ar: {
    welcome: "مرحبًا بك في مساعد M4Capital AI! 🤖",
    help: "الأوامر المتاحة:",
    lang_changed: "تم تغيير اللغة إلى العربية",
  },
  hi: {
    welcome: "M4Capital AI सहायक में आपका स्वागत है! 🤖",
    help: "उपलब्ध कमांड:",
    lang_changed: "भाषा हिंदी में बदली गई",
  },
};

// Helper function to get translation
function t(lang: string, key: string): string {
  return translations[lang]?.[key] || translations["en"][key] || key;
}

// Crypto price API functions
async function getCryptoPriceFromCoinGecko(symbols: string[]): Promise<any> {
  try {
    const ids = symbols.join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );
    const data = await response.json();
    return { source: "CoinGecko", data };
  } catch (error) {
    console.error("CoinGecko API error:", error);
    return null;
  }
}

async function getCryptoPriceFromBinance(symbols: string[]): Promise<any> {
  try {
    const prices: any = {};
    for (const symbol of symbols) {
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}USDT`
      );
      if (response.ok) {
        const data = await response.json();
        prices[symbol] = {
          usd: parseFloat(data.lastPrice),
          usd_24h_change: parseFloat(data.priceChangePercent),
          usd_24h_vol: parseFloat(data.volume),
        };
      }
    }
    return { source: "Binance", data: prices };
  } catch (error) {
    console.error("Binance API error:", error);
    return null;
  }
}

async function getCryptoPriceFromCoinMarketCap(
  symbols: string[]
): Promise<any> {
  try {
    const apiKey = process.env.COINMARKETCAP_API_KEY;
    if (!apiKey) {
      return null;
    }

    const slugs = symbols.join(",");
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?slug=${slugs}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
        },
      }
    );
    const result = await response.json();
    return { source: "CoinMarketCap", data: result.data };
  } catch (error) {
    console.error("CoinMarketCap API error:", error);
    return null;
  }
}

// Combined crypto price fetcher
async function getCryptoPrices(symbols: string[]): Promise<string> {
  const results = await Promise.all([
    getCryptoPriceFromCoinGecko(symbols),
    getCryptoPriceFromBinance(symbols),
    getCryptoPriceFromCoinMarketCap(symbols),
  ]);

  const validResults = results.filter((r) => r !== null);

  if (validResults.length === 0) {
    return "Unable to fetch crypto prices at the moment.";
  }

  let response = "📊 **Cryptocurrency Prices** (from multiple sources):\n\n";

  for (const result of validResults) {
    response += `**${result.source}:**\n`;
    const data = result.data;

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "object" && value !== null) {
        const priceData: any = value;
        const price = priceData.usd || priceData.lastPrice || "N/A";
        const change =
          priceData.usd_24h_change || priceData.priceChangePercent || "N/A";
        response += `  • ${key.toUpperCase()}: $${
          typeof price === "number" ? price.toLocaleString() : price
        }`;
        if (change !== "N/A") {
          const changeNum =
            typeof change === "number" ? change : parseFloat(change);
          const emoji = changeNum >= 0 ? "📈" : "📉";
          response += ` (${changeNum >= 0 ? "+" : ""}${changeNum.toFixed(
            2
          )}% ${emoji})`;
        }
        response += "\n";
      }
    }
    response += "\n";
  }

  return response;
}

// Get list of top cryptocurrencies
async function getTopCryptos(limit: number = 200): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`
    );
    const data = await response.json();
    return data.map((coin: any) => coin.id);
  } catch (error) {
    console.error("Error fetching top cryptos:", error);
    return ["bitcoin", "ethereum", "tether", "binancecoin", "solana"];
  }
}

// ===== FEATURE 1: Multi-language Support =====
async function getUserLanguage(telegramId: number): Promise<string> {
  try {
    const user = await prisma.telegramUser.findUnique({
      where: { telegramId: BigInt(telegramId) },
      select: { preferredLanguage: true },
    });
    return user?.preferredLanguage || "en";
  } catch (error) {
    return "en";
  }
}

async function setUserLanguage(
  telegramId: number,
  language: string
): Promise<void> {
  try {
    await prisma.telegramUser.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: { preferredLanguage: language },
      create: {
        telegramId: BigInt(telegramId),
        preferredLanguage: language,
      },
    });
  } catch (error) {
    console.error("Error setting user language:", error);
  }
}

// ===== FEATURE 2: Crypto Watchlist =====
async function addToWatchlist(
  telegramId: number,
  symbol: string,
  displayName: string
): Promise<boolean> {
  try {
    const user = await prisma.telegramUser.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: {},
      create: { telegramId: BigInt(telegramId) },
    });

    await prisma.cryptoWatchlist.create({
      data: {
        userId: user.id,
        symbol: symbol.toLowerCase(),
        displayName,
      },
    });
    return true;
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return false;
  }
}

async function removeFromWatchlist(
  telegramId: number,
  symbol: string
): Promise<boolean> {
  try {
    const user = await prisma.telegramUser.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) return false;

    await prisma.cryptoWatchlist.deleteMany({
      where: {
        userId: user.id,
        symbol: symbol.toLowerCase(),
      },
    });
    return true;
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return false;
  }
}

async function getWatchlist(telegramId: number): Promise<string[]> {
  try {
    const user = await prisma.telegramUser.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: { watchlists: true },
    });

    return user?.watchlists.map((w) => w.symbol) || [];
  } catch (error) {
    console.error("Error getting watchlist:", error);
    return [];
  }
}

// ===== FEATURE 3: Price Alerts =====
async function createPriceAlert(
  telegramId: number,
  chatId: number,
  symbol: string,
  targetPrice: number,
  condition: "ABOVE" | "BELOW"
): Promise<boolean> {
  try {
    const user = await prisma.telegramUser.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: {},
      create: { telegramId: BigInt(telegramId) },
    });

    await prisma.priceAlert.create({
      data: {
        userId: user.id,
        symbol: symbol.toLowerCase(),
        targetPrice,
        condition,
        chatId: BigInt(chatId),
      },
    });
    return true;
  } catch (error) {
    console.error("Error creating price alert:", error);
    return false;
  }
}

async function getUserAlerts(telegramId: number): Promise<any[]> {
  try {
    const user = await prisma.telegramUser.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: { priceAlerts: { where: { isActive: true } } },
    });

    return user?.priceAlerts || [];
  } catch (error) {
    console.error("Error getting alerts:", error);
    return [];
  }
}

async function deleteAlert(
  telegramId: number,
  alertId: string
): Promise<boolean> {
  try {
    const user = await prisma.telegramUser.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) return false;

    await prisma.priceAlert.deleteMany({
      where: {
        id: alertId,
        userId: user.id,
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting alert:", error);
    return false;
  }
}

// ===== FEATURE 4: Voice Transcription =====
async function transcribeVoice(fileId: string): Promise<string | null> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return null;

    // Get file path from Telegram
    const fileResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    );
    const fileData = await fileResponse.json();

    if (!fileData.ok) return null;

    const filePath = fileData.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;

    // Download the audio file
    const audioResponse = await fetch(fileUrl);
    const audioBuffer = await audioResponse.arrayBuffer();

    // Convert to File object for OpenAI
    const audioFile = new File([audioBuffer], "voice.ogg", {
      type: "audio/ogg",
    });

    // Transcribe using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return transcription.text;
  } catch (error) {
    console.error("Error transcribing voice:", error);
    return null;
  }
}

// ===== FEATURE 5: News Fetching =====
async function fetchCryptoNews(limit: number = 5): Promise<string> {
  try {
    // Using CoinGecko news endpoint (free)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/news?page=1&per_page=${limit}`
    );

    if (!response.ok) {
      // Fallback: Use CryptoCompare news (also free)
      const cryptoCompareResponse = await fetch(
        `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest`
      );

      if (cryptoCompareResponse.ok) {
        const data = await cryptoCompareResponse.json();
        const articles = data.Data.slice(0, limit);

        let newsText = "📰 **Latest Crypto News:**\n\n";
        articles.forEach((article: any, index: number) => {
          newsText += `${index + 1}. **${article.title}**\n`;
          newsText += `   ${article.body.substring(0, 150)}...\n`;
          newsText += `   🔗 [Read more](${article.url})\n`;
          newsText += `   📅 ${new Date(
            article.published_on * 1000
          ).toLocaleString()}\n\n`;
        });

        return newsText;
      }
    }

    const data = await response.json();
    let newsText = "📰 **Latest Crypto News:**\n\n";

    data.data.slice(0, limit).forEach((article: any, index: number) => {
      newsText += `${index + 1}. **${article.title}**\n`;
      newsText += `   ${
        article.description?.substring(0, 150) || "No description"
      }...\n`;
      newsText += `   🔗 [Read more](${article.url})\n`;
      newsText += `   📅 ${article.updated_at}\n\n`;
    });

    return newsText;
  } catch (error) {
    console.error("Error fetching news:", error);
    return "❌ Unable to fetch news at the moment. Please try again later.";
  }
}

// ===== FEATURE 6: PDF Analysis =====
async function downloadFile(fileId: string): Promise<Buffer | null> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Get file path from Telegram
    const fileInfoResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    );
    const fileInfo = await fileInfoResponse.json();

    if (!fileInfo.ok) {
      console.error("Failed to get file info:", fileInfo);
      return null;
    }

    // Download the file
    const filePath = fileInfo.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;

    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  } catch (error) {
    console.error("Error downloading file:", error);
    return null;
  }
}

async function analyzePDF(
  fileId: string
): Promise<{ analysis: string; textContent: string; metadata: any } | null> {
  try {
    const fileBuffer = await downloadFile(fileId);

    if (!fileBuffer) {
      return null;
    }

    // Dynamically import pdf-parse to avoid build issues
    const pdfParse = (await import("pdf-parse")).default;

    // Parse PDF
    const data = await pdfParse(fileBuffer);
    const pageCount = data.numpages;
    const textContent = data.text;
    const wordCount = textContent.split(/\s+/).length;

    // Generate summary using OpenAI
    let summary = "";
    if (textContent.length > 100) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that summarizes PDF documents. Provide a concise summary highlighting key points, main topics, and important information.",
            },
            {
              role: "user",
              content: `Summarize this PDF content:\n\n${textContent.substring(
                0,
                15000
              )}`,
            },
          ],
          max_tokens: 500,
        });
        summary = completion.choices[0].message.content || "";
      } catch (error) {
        console.error("Error generating summary:", error);
        summary = "Unable to generate AI summary.";
      }
    }

    let result = "📄 **PDF Analysis:**\n\n";
    result += `📊 **Statistics:**\n`;
    result += `   • Pages: ${pageCount}\n`;
    result += `   • Words: ${wordCount.toLocaleString()}\n`;
    result += `   • Characters: ${textContent.length.toLocaleString()}\n\n`;

    if (summary) {
      result += `🤖 **AI Summary:**\n${summary}\n\n`;
    }

    result += `📝 **Preview (first 500 chars):**\n`;
    result += textContent.substring(0, 500) + "...";

    return {
      analysis: result,
      textContent,
      metadata: {
        pageCount,
        wordCount,
        charCount: textContent.length,
        summary,
      },
    };
  } catch (error) {
    console.error("Error analyzing PDF:", error);
    return null;
  }
}
async function savePDFAnalysis(
  telegramId: number,
  fileId: string,
  fileName: string,
  fileSize: number,
  extractedText: string,
  metadata: any
): Promise<void> {
  try {
    const user = await prisma.telegramUser.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: {},
      create: { telegramId: BigInt(telegramId) },
    });

    await prisma.fileStorage.create({
      data: {
        userId: user.id,
        fileId,
        fileType: "document",
        fileName,
        fileSize,
        mimeType: "application/pdf",
        extractedText: extractedText.substring(0, 65000), // Limit text size
        metadata,
      },
    });
  } catch (error) {
    console.error("Error saving PDF analysis:", error);
  }
}

async function saveZIPAnalysis(
  telegramId: number,
  fileId: string,
  fileName: string,
  fileSize: number,
  metadata: any
): Promise<void> {
  try {
    const user = await prisma.telegramUser.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: {},
      create: { telegramId: BigInt(telegramId) },
    });

    await prisma.fileStorage.create({
      data: {
        userId: user.id,
        fileId,
        fileType: "document",
        fileName,
        fileSize,
        mimeType: "application/zip",
        metadata,
      },
    });
  } catch (error) {
    console.error("Error saving ZIP analysis:", error);
  }
}

// ===== FEATURE 7: ZIP File Analysis =====
async function analyzeZIP(
  fileId: string
): Promise<{ analysis: string; metadata: any } | null> {
  try {
    const fileBuffer = await downloadFile(fileId);

    if (!fileBuffer) {
      return null;
    }

    // Parse ZIP
    const zip = new AdmZip(fileBuffer);
    const zipEntries = zip.getEntries();

    let result = "📦 **ZIP File Analysis:**\n\n";
    result += `📊 **Statistics:**\n`;
    result += `   • Total files: ${zipEntries.length}\n`;

    // Count file types
    const fileTypes: Record<string, number> = {};
    let totalSize = 0;

    zipEntries.forEach((entry: any) => {
      if (!entry.isDirectory) {
        const ext = entry.name.split(".").pop()?.toLowerCase() || "unknown";
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        totalSize += entry.header.size;
      }
    });

    result += `   • Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n\n`;

    result += `📁 **File Types:**\n`;
    Object.entries(fileTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([ext, count]) => {
        result += `   • .${ext}: ${count} file${count > 1 ? "s" : ""}\n`;
      });

    result += `\n📋 **Contents (first 20 files):**\n`;
    zipEntries.slice(0, 20).forEach((entry: any, index: number) => {
      const icon = entry.isDirectory ? "📁" : "📄";
      const size = entry.isDirectory
        ? ""
        : ` (${(entry.header.size / 1024).toFixed(1)} KB)`;
      result += `${index + 1}. ${icon} ${entry.name}${size}\n`;
    });

    if (zipEntries.length > 20) {
      result += `\n... and ${zipEntries.length - 20} more files`;
    }

    // Try to find and analyze text files
    const textFiles = zipEntries.filter(
      (entry: any) =>
        !entry.isDirectory &&
        (entry.name.endsWith(".txt") ||
          entry.name.endsWith(".md") ||
          entry.name.endsWith(".json"))
    );

    if (textFiles.length > 0) {
      result += `\n\n📝 **Text Files Preview:**\n`;
      textFiles.slice(0, 3).forEach((entry: any) => {
        try {
          const content = entry.getData().toString("utf8");
          result += `\n**${entry.name}:**\n`;
          result += content.substring(0, 200) + "...\n";
        } catch (error) {
          result += `\n**${entry.name}:** (Unable to read)\n`;
        }
      });
    }

    return {
      analysis: result,
      metadata: {
        totalFiles: zipEntries.length,
        totalSize,
        fileTypes,
        fileList: zipEntries.slice(0, 50).map((e: any) => e.name),
      },
    };
  } catch (error) {
    console.error("Error analyzing ZIP:", error);
    return null;
  }
} // AI-powered content moderation
async function moderateContent(
  text: string,
  username: string
): Promise<{
  shouldModerate: boolean;
  reason: string;
  severity: "low" | "medium" | "high";
}> {
  try {
    const moderationResponse = await openai.moderations.create({
      input: text,
    });

    const result = moderationResponse.results[0];

    // Check if content is flagged
    if (result.flagged) {
      const categories = result.categories;
      const scores = result.category_scores;

      // Determine severity and reason
      let highestScore = 0;
      let highestCategory = "";

      for (const [category, flagged] of Object.entries(categories)) {
        if (flagged) {
          const score = scores[category as keyof typeof scores];
          if (score > highestScore) {
            highestScore = score;
            highestCategory = category;
          }
        }
      }

      const severity: "low" | "medium" | "high" =
        highestScore > 0.9 ? "high" : highestScore > 0.7 ? "medium" : "low";

      return {
        shouldModerate: true,
        reason: `Flagged for ${highestCategory.replace(/[_-]/g, " ")}`,
        severity,
      };
    }

    // Additional AI analysis for spam/promotional content
    const aiAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a content moderator. Analyze if this message is spam, scam, or inappropriate for a professional trading community. 
          
          Consider:
          - Excessive promotional content
          - Scam/phishing attempts
          - Off-topic spam
          - Repetitive messages
          - Suspicious links
          
          Respond with JSON only: {"is_spam": boolean, "confidence": number (0-1), "reason": "brief explanation"}`,
        },
        {
          role: "user",
          content: `Username: ${username}\nMessage: ${text}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
    });

    const analysis = JSON.parse(aiAnalysis.choices[0].message.content || "{}");

    if (
      analysis.is_spam &&
      analysis.confidence > MODERATION_CONFIG.TOXICITY_THRESHOLD
    ) {
      return {
        shouldModerate: true,
        reason: analysis.reason || "Potential spam detected",
        severity: analysis.confidence > 0.9 ? "high" : "medium",
      };
    }

    return {
      shouldModerate: false,
      reason: "",
      severity: "low",
    };
  } catch (error) {
    console.error("Moderation error:", error);
    return {
      shouldModerate: false,
      reason: "",
      severity: "low",
    };
  }
}

// Ban user from chat
async function banUser(chatId: number, userId: number): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/banChatMember`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
        }),
      }
    );

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Error banning user:", error);
    return false;
  }
}

// Delete message
async function deleteMessage(
  chatId: number,
  messageId: number
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/deleteMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
        }),
      }
    );

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
}

// Send photo to Telegram
async function sendTelegramPhoto(
  chatId: number,
  photoUrl: string,
  caption?: string
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption: caption,
        }),
      }
    );

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Error sending photo:", error);
    return false;
  }
}

// Generate image using DALL-E
async function generateImage(
  prompt: string,
  size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024"
): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
}> {
  try {
    console.log(`Generating image with prompt: ${prompt}`);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size,
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      return { success: false, error: "No image URL returned" };
    }

    return { success: true, imageUrl };
  } catch (error: any) {
    console.error("Image generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate image",
    };
  }
}

// Warn user
async function warnUser(
  chatId: number,
  userId: number,
  username: string,
  reason: string
): Promise<void> {
  const warningKey = `${chatId}_${userId}`;
  const warnings = (userWarnings.get(warningKey) || 0) + 1;
  userWarnings.set(warningKey, warnings);

  const message = `⚠️ Warning ${warnings}/${
    MODERATION_CONFIG.MAX_WARNINGS
  } for @${username}\n\nReason: ${reason}\n\n${
    warnings >= MODERATION_CONFIG.MAX_WARNINGS
      ? "⛔️ Maximum warnings reached. User will be banned."
      : `You have ${MODERATION_CONFIG.MAX_WARNINGS - warnings} warning(s) left.`
  }`;

  await sendTelegramMessage(chatId, message);

  // Auto-ban if max warnings reached
  if (
    warnings >= MODERATION_CONFIG.MAX_WARNINGS &&
    MODERATION_CONFIG.AUTO_BAN_ENABLED
  ) {
    await banUser(chatId, userId);
    await sendTelegramMessage(
      chatId,
      `🔨 User @${username} has been banned for repeated violations.`
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify Telegram secret token for webhook security (only if set)
    const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
    const expectedSecret = process.env.TELEGRAM_SECRET_TOKEN;

    if (expectedSecret && secretToken !== expectedSecret) {
      console.error("Invalid secret token received");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Received webhook:", JSON.stringify(body));

    // Telegram webhook verification
    if (!body.message) {
      console.log("No message in webhook body");
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const text = message.text;
    const userId = message.from.id;
    const username = message.from.username || message.from.first_name || "User";
    const isGroup =
      message.chat.type === "group" || message.chat.type === "supergroup";
    const messageId = message.message_id;

    console.log(
      `Message from user ${userId} (@${username}) in chat ${chatId}: ${text}`
    );

    // Ignore non-text messages
    if (!text) {
      console.log("Non-text message, ignoring");
      return NextResponse.json({ ok: true });
    }

    // AI-powered moderation for group chats
    if (isGroup && MODERATION_CONFIG.AUTO_MODERATE_GROUPS) {
      console.log("Running AI moderation check...");
      const moderation = await moderateContent(text, username);

      if (moderation.shouldModerate) {
        console.log(
          `Content flagged: ${moderation.reason} (${moderation.severity})`
        );

        // Delete the message
        await deleteMessage(chatId, messageId);

        // Handle based on severity
        if (moderation.severity === "high") {
          // Immediate ban for severe violations
          await banUser(chatId, userId);
          await sendTelegramMessage(
            chatId,
            `🚫 User @${username} has been banned.\n\nReason: ${moderation.reason}\n\nThis action was taken by AI moderation for severe policy violation.`
          );
        } else {
          // Warn user for medium/low violations
          await warnUser(chatId, userId, username, moderation.reason);
        }

        return NextResponse.json({ ok: true });
      }
    }

    // Handle /start command
    if (text === "/start") {
      console.log("Handling /start command");
      const welcomeMsg = isGroup
        ? "Welcome to M4Capital AI Assistant! 🤖\n\nI provide AI-powered moderation and can answer your questions about crypto and trading.\n\n👮 Auto-moderation is active to keep this group safe and spam-free."
        : "Welcome to M4Capital AI Assistant! 🤖\n\n💰 **Crypto Features:**\n/watchlist - Manage your crypto watchlist\n/alert - Set price alerts\n\n🎨 **AI Tools:**\n/imagine - Generate images (DALL-E 3)\n/news - Latest crypto news\n🎤 Send voice messages (auto-transcribed)\n📄 Send PDF files (auto-analyzed with AI summary)\n📦 Send ZIP files (view contents & structure)\n\n🌐 **Settings:**\n/language - Change language\n/clear - Clear conversation\n\nJust chat with me naturally! I support 8 languages.";

      await sendTelegramMessage(chatId, welcomeMsg);
      return NextResponse.json({ ok: true });
    }

    // Handle /clear command to reset conversation
    if (text === "/clear") {
      console.log("Handling /clear command");
      conversationHistory.delete(userId);
      await sendTelegramMessage(
        chatId,
        "Conversation history cleared! Starting fresh. 🔄"
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /ban command (admin only - reply to message or mention user)
    if (text.startsWith("/ban") && isGroup) {
      console.log("Handling /ban command");

      const replyToMessage = message.reply_to_message;
      if (replyToMessage) {
        const targetUserId = replyToMessage.from.id;
        const targetUsername =
          replyToMessage.from.username || replyToMessage.from.first_name;

        const banned = await banUser(chatId, targetUserId);
        if (banned) {
          await deleteMessage(chatId, replyToMessage.message_id);
          await sendTelegramMessage(
            chatId,
            `🔨 User @${targetUsername} has been banned by admin.`
          );
        }
      } else {
        await sendTelegramMessage(
          chatId,
          "❌ Reply to a message to ban that user."
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Handle /warn command (admin only)
    if (text.startsWith("/warn") && isGroup) {
      console.log("Handling /warn command");

      const replyToMessage = message.reply_to_message;
      if (replyToMessage) {
        const targetUserId = replyToMessage.from.id;
        const targetUsername =
          replyToMessage.from.username || replyToMessage.from.first_name;
        const reason =
          text.replace("/warn", "").trim() || "Violation of group rules";

        await warnUser(chatId, targetUserId, targetUsername, reason);
      } else {
        await sendTelegramMessage(
          chatId,
          "❌ Reply to a message to warn that user.\n\nUsage: /warn [reason]"
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Handle /modstatus command
    if (text === "/modstatus" && isGroup) {
      const statusMsg =
        `🤖 **AI Moderation Status**\n\n` +
        `✅ Auto-moderation: ${
          MODERATION_CONFIG.AUTO_MODERATE_GROUPS ? "Enabled" : "Disabled"
        }\n` +
        `🔨 Auto-ban: ${
          MODERATION_CONFIG.AUTO_BAN_ENABLED ? "Enabled" : "Disabled"
        }\n` +
        `⚠️ Max warnings: ${MODERATION_CONFIG.MAX_WARNINGS}\n` +
        `📊 Toxicity threshold: ${(
          MODERATION_CONFIG.TOXICITY_THRESHOLD * 100
        ).toFixed(0)}%\n\n` +
        `The bot uses OpenAI to detect:\n` +
        `• Spam & scams\n` +
        `• Harassment & hate speech\n` +
        `• Inappropriate content\n` +
        `• Phishing attempts\n\n` +
        `Admin commands:\n` +
        `/ban - Ban user (reply to message)\n` +
        `/warn - Warn user (reply to message)`;

      await sendTelegramMessage(chatId, statusMsg);
      return NextResponse.json({ ok: true });
    }

    // Handle /imagine command for image generation
    if (text.startsWith("/imagine ")) {
      console.log("Handling /imagine command");
      const prompt = text.replace("/imagine ", "").trim();

      if (!prompt) {
        await sendTelegramMessage(
          chatId,
          "❌ Please provide a description.\n\nUsage: /imagine a sunset over mountains"
        );
        return NextResponse.json({ ok: true });
      }

      await sendTelegramTypingAction(chatId);
      await sendTelegramMessage(
        chatId,
        "🎨 Generating your image... This may take a moment."
      );

      const result = await generateImage(prompt);

      if (result.success && result.imageUrl) {
        await sendTelegramPhoto(
          chatId,
          result.imageUrl,
          `Generated: ${prompt}`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `❌ Failed to generate image: ${result.error || "Unknown error"}`
        );
      }

      return NextResponse.json({ ok: true });
    }

    // ===== NEW FEATURE COMMANDS =====

    // Handle /language command
    if (text.startsWith("/language")) {
      const args = text.split(" ");
      if (args.length === 1) {
        const currentLang = await getUserLanguage(userId);
        await sendTelegramMessage(
          chatId,
          `🌐 Your current language: ${currentLang}\n\nAvailable languages:\n• en (English)\n• es (Español)\n• fr (Français)\n• de (Deutsch)\n• zh (中文)\n• ja (日本語)\n• ko (한국어)\n• ru (Русский)\n\nUsage: /language <code>\nExample: /language es`
        );
      } else {
        const newLang = args[1].toLowerCase();
        const validLangs = ["en", "es", "fr", "de", "zh", "ja", "ko", "ru"];
        if (validLangs.includes(newLang)) {
          await setUserLanguage(userId, newLang);
          const messages: Record<string, string> = {
            en: "✅ Language set to English",
            es: "✅ Idioma configurado en Español",
            fr: "✅ Langue définie sur Français",
            de: "✅ Sprache auf Deutsch eingestellt",
            zh: "✅ 语言设置为中文",
            ja: "✅ 言語が日本語に設定されました",
            ko: "✅ 언어가 한국어로 설정되었습니다",
            ru: "✅ Язык установлен на Русский",
          };
          await sendTelegramMessage(chatId, messages[newLang]);
        } else {
          await sendTelegramMessage(
            chatId,
            "❌ Invalid language code. Use: en, es, fr, de, zh, ja, ko, ru"
          );
        }
      }
      return NextResponse.json({ ok: true });
    }

    // Handle /watchlist command
    if (text.startsWith("/watchlist")) {
      const args = text.split(" ");
      const subcommand = args[1]?.toLowerCase();

      if (!subcommand || subcommand === "view") {
        const watchlist = await getWatchlist(userId);
        if (watchlist.length === 0) {
          await sendTelegramMessage(
            chatId,
            "📋 Your watchlist is empty.\n\nAdd cryptos with:\n/watchlist add bitcoin\n/watchlist add ethereum"
          );
        } else {
          const prices = await getCryptoPrices(watchlist);
          await sendTelegramMessage(
            chatId,
            `📋 **Your Watchlist**\n\n${prices}`
          );
        }
      } else if (subcommand === "add" && args[2]) {
        const symbol = args[2].toLowerCase();
        const success = await addToWatchlist(userId, username, symbol);
        if (success) {
          await sendTelegramMessage(
            chatId,
            `✅ Added ${symbol} to your watchlist`
          );
        } else {
          await sendTelegramMessage(
            chatId,
            `❌ Failed to add ${symbol}. It might already be in your watchlist.`
          );
        }
      } else if (subcommand === "remove" && args[2]) {
        const symbol = args[2].toLowerCase();
        const success = await removeFromWatchlist(userId, symbol);
        if (success) {
          await sendTelegramMessage(
            chatId,
            `✅ Removed ${symbol} from your watchlist`
          );
        } else {
          await sendTelegramMessage(chatId, `❌ Failed to remove ${symbol}`);
        }
      } else {
        await sendTelegramMessage(
          chatId,
          "Usage:\n/watchlist view - Show your watchlist\n/watchlist add <crypto> - Add crypto\n/watchlist remove <crypto> - Remove crypto\n\nExample: /watchlist add bitcoin"
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Handle /alert command
    if (text.startsWith("/alert")) {
      const args = text.split(" ");
      const subcommand = args[1]?.toLowerCase();

      if (!subcommand || subcommand === "list") {
        const alerts = await getUserAlerts(userId);
        if (alerts.length === 0) {
          await sendTelegramMessage(
            chatId,
            "🔔 You have no active price alerts.\n\nCreate one with:\n/alert set bitcoin 70000 above"
          );
        } else {
          let message = "🔔 **Your Price Alerts**\n\n";
          alerts.forEach((alert: any, i: number) => {
            message += `${i + 1}. ${alert.symbol.toUpperCase()}: ${
              alert.condition
            } $${alert.targetPrice}\n`;
          });
          message += "\nRemove with: /alert delete <number>";
          await sendTelegramMessage(chatId, message);
        }
      } else if (subcommand === "set" && args[2] && args[3] && args[4]) {
        const symbol = args[2].toLowerCase();
        const price = parseFloat(args[3]);
        const condition = args[4].toUpperCase();

        if (["ABOVE", "BELOW"].includes(condition) && !isNaN(price)) {
          const success = await createPriceAlert(
            userId,
            chatId,
            symbol,
            price,
            condition
          );
          if (success) {
            await sendTelegramMessage(
              chatId,
              `✅ Alert set: ${symbol.toUpperCase()} ${condition.toLowerCase()} $${price}`
            );
          } else {
            await sendTelegramMessage(chatId, "❌ Failed to create alert");
          }
        } else {
          await sendTelegramMessage(
            chatId,
            "❌ Invalid format. Use: /alert set <crypto> <price> <above/below>"
          );
        }
      } else if (subcommand === "delete" && args[2]) {
        const alertIndex = parseInt(args[2]) - 1;
        const alerts = await getUserAlerts(userId);
        if (alerts[alertIndex]) {
          await deleteAlert(userId, alerts[alertIndex].id);
          await sendTelegramMessage(chatId, "✅ Alert deleted");
        } else {
          await sendTelegramMessage(chatId, "❌ Invalid alert number");
        }
      } else {
        await sendTelegramMessage(
          chatId,
          "Usage:\n/alert list - Show your alerts\n/alert set <crypto> <price> <above/below> - Create alert\n/alert delete <number> - Remove alert\n\nExample: /alert set bitcoin 70000 above"
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Handle /news command
    if (text.startsWith("/news")) {
      const args = text.split(" ");
      const limit = args[1] ? parseInt(args[1]) : 5;

      await sendTelegramTypingAction(chatId);
      const news = await fetchCryptoNews(limit);
      await sendTelegramMessage(chatId, news);
      return NextResponse.json({ ok: true });
    }

    // Handle voice messages
    if (message.voice) {
      console.log("Handling voice message");
      await sendTelegramTypingAction(chatId);

      const transcription = await transcribeVoice(message.voice.file_id);
      if (transcription) {
        await sendTelegramMessage(
          chatId,
          `🎤 **Transcription:**\n\n${transcription}`
        );
        // Note: User can then use the transcribed text in their next message
      } else {
        await sendTelegramMessage(
          chatId,
          "❌ Failed to transcribe voice message"
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Handle PDF documents
    if (message.document) {
      const document = message.document;
      const fileName = document.file_name || "unknown.pdf";
      const fileSize = document.file_size || 0;
      const mimeType = document.mime_type || "";

      if (
        mimeType === "application/pdf" ||
        fileName.toLowerCase().endsWith(".pdf")
      ) {
        console.log("Handling PDF document");
        await sendTelegramTypingAction(chatId);

        const result = await analyzePDF(document.file_id);
        if (result) {
          // Save to database
          await savePDFAnalysis(
            userId,
            document.file_id,
            fileName,
            fileSize,
            result.textContent,
            result.metadata
          );

          await sendTelegramMessage(chatId, result.analysis);
        } else {
          await sendTelegramMessage(
            chatId,
            "❌ Unable to analyze PDF file. Please ensure it's a valid PDF."
          );
        }
        return NextResponse.json({ ok: true });
      }

      if (
        mimeType === "application/zip" ||
        mimeType === "application/x-zip-compressed" ||
        fileName.toLowerCase().endsWith(".zip")
      ) {
        console.log("Handling ZIP file");
        await sendTelegramTypingAction(chatId);

        const result = await analyzeZIP(document.file_id);
        if (result) {
          // Save to database
          await saveZIPAnalysis(
            userId,
            document.file_id,
            fileName,
            fileSize,
            result.metadata
          );

          await sendTelegramMessage(chatId, result.analysis);
        } else {
          await sendTelegramMessage(
            chatId,
            "❌ Unable to analyze ZIP file. Please ensure it's a valid ZIP archive."
          );
        }
        return NextResponse.json({ ok: true });
      }

      // For other document types, provide basic info
      await sendTelegramMessage(
        chatId,
        `📄 Received document: **${fileName}**\n\nCurrently, I can analyze:\n• PDF files (.pdf)\n• ZIP archives (.zip)\n\nPlease send a PDF or ZIP file for analysis.`
      );
      return NextResponse.json({ ok: true });
    }

    // Get or initialize user conversation history
    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, []);
    }
    const history = conversationHistory.get(userId)!;

    // Add user message to history
    history.push({ role: "user", content: text });

    // Keep only last 10 messages to manage token usage
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    // Send "typing" action
    await sendTelegramTypingAction(chatId);

    // Define available functions for OpenAI
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "get_crypto_prices",
          description:
            "Get real-time cryptocurrency prices from multiple sources (CoinGecko, Binance, CoinMarketCap). Supports top 200 cryptocurrencies by market cap.",
          parameters: {
            type: "object",
            properties: {
              symbols: {
                type: "array",
                items: { type: "string" },
                description:
                  "Array of cryptocurrency symbols or IDs (e.g., ['bitcoin', 'ethereum', 'cardano']). Use lowercase names.",
              },
            },
            required: ["symbols"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "get_top_cryptos",
          description:
            "Get a list of top cryptocurrencies by market cap (up to 200).",
          parameters: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description:
                  "Number of top cryptocurrencies to return (default: 10, max: 200)",
              },
            },
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "generate_image",
          description:
            "Generate an image using DALL-E 3 based on a text description. Use when users ask to create, generate, draw, or visualize images.",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description:
                  "Detailed description of the image to generate. Be specific and descriptive.",
              },
              size: {
                type: "string",
                enum: ["1024x1024", "1792x1024", "1024x1792"],
                description:
                  "Image size. Use 1024x1024 for square, 1792x1024 for landscape, 1024x1792 for portrait. Default: 1024x1024",
              },
            },
            required: ["prompt"],
          },
        },
      },
    ];

    // Get response from OpenAI with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for M4Capital, a trading platform. You can provide real-time cryptocurrency prices for the top 200 cryptocurrencies and generate images using DALL-E 3. When users ask about crypto prices, use get_crypto_prices. When they ask to create, generate, or visualize images, use generate_image. Be concise, friendly, and helpful.",
        },
        ...history,
      ],
      tools: tools,
      tool_choice: "auto",
      max_tokens: 1000,
      temperature: 0.7,
    });

    let assistantMessage =
      completion.choices[0].message.content ||
      "Sorry, I could not generate a response.";

    // Handle function calls
    const responseMessage = completion.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      console.log("Function calls detected:", toolCalls);

      for (const toolCall of toolCalls) {
        // Type guard to check if it's a function tool call
        if (toolCall.type !== "function") continue;

        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`Calling function: ${functionName}`, functionArgs);

        let functionResponse = "";
        let imageGenerated = false;

        if (functionName === "get_crypto_prices") {
          functionResponse = await getCryptoPrices(functionArgs.symbols);
        } else if (functionName === "get_top_cryptos") {
          const limit = functionArgs.limit || 10;
          const topCryptos = await getTopCryptos(limit);
          functionResponse = `Top ${limit} cryptocurrencies by market cap:\n${topCryptos
            .slice(0, limit)
            .join(", ")}`;
        } else if (functionName === "generate_image") {
          await sendTelegramMessage(chatId, "🎨 Generating your image...");

          const size = functionArgs.size || "1024x1024";
          const result = await generateImage(functionArgs.prompt, size);

          if (result.success && result.imageUrl) {
            await sendTelegramPhoto(
              chatId,
              result.imageUrl,
              `Generated: ${functionArgs.prompt}`
            );
            functionResponse = `Image generated successfully with prompt: "${functionArgs.prompt}"`;
            imageGenerated = true;
          } else {
            functionResponse = `Failed to generate image: ${result.error}`;
          }
        }

        // Get final response from OpenAI with function result (skip if image was generated)
        if (!imageGenerated) {
          const secondCompletion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful AI assistant for M4Capital, a trading platform. Present data in a clear, formatted way.",
              },
              ...history,
              responseMessage,
              {
                role: "tool",
                tool_call_id: toolCall.id,
                content: functionResponse,
              },
            ],
            max_tokens: 1000,
            temperature: 0.7,
          });

          assistantMessage =
            secondCompletion.choices[0].message.content ||
            "Sorry, I could not generate a response.";
        } else {
          assistantMessage = "I've generated the image for you! 🎨";
        }
      }
    }

    // Add assistant response to history
    history.push({ role: "assistant", content: assistantMessage });

    // Send response to user (skip if image was already sent)
    if (!assistantMessage.includes("generated the image")) {
      await sendTelegramMessage(chatId, assistantMessage);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to send Telegram message
async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("Failed to send message:", result);
    } else {
      console.log("Message sent successfully");
    }

    return result;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}

// Helper function to send typing action
async function sendTelegramTypingAction(chatId: number) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendChatAction`;

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      action: "typing",
    }),
  });
}

// Handle GET request (for webhook verification)
export async function GET() {
  return NextResponse.json({ status: "Telegram bot webhook is active" });
}
