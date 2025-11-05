/**
 * AI Chatbot Service using HuggingFace
 * Provides intelligent support, FAQ, and trading guidance
 */

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

interface ChatResponse {
  message: string;
  confidence: number;
  suggestions?: string[];
}

/**
 * Get chatbot response using HuggingFace
 */
export async function getChatbotResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_API_KEY) {
      return getFallbackResponse(userMessage);
    }

    // Build conversation context
    const context = buildConversationContext(conversationHistory);
    const systemPrompt = getSystemPrompt();

    const fullPrompt = `${systemPrompt}\n\n${context}\n\nUser: ${userMessage}\n\nAssistant:`;

    // Use Mixtral for conversational AI
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }

    const result = await response.json();
    const aiMessage = result[0]?.generated_text || "";

    // Extract suggestions from response
    const suggestions = extractSuggestions(userMessage);

    return {
      message:
        aiMessage.trim() ||
        "I'm here to help! Could you rephrase your question?",
      confidence: 0.85,
      suggestions,
    };
  } catch (error) {
    console.error("❌ Chatbot error:", error);
    return getFallbackResponse(userMessage);
  }
}

/**
 * System prompt for M4Capital trading assistant
 */
function getSystemPrompt(): string {
  return `You are M4Capital AI Assistant, a helpful and knowledgeable trading support chatbot. You help users with:
- Trading platform navigation and features
- Cryptocurrency trading basics and strategies
- Account management and security
- Technical analysis and market insights
- Risk management advice

Be concise, professional, and friendly. Provide actionable advice. If you don't know something, suggest contacting support@m4capital.online.

Key platform features:
- Real-time crypto trading (BTC, ETH, BNB, SOL, etc.)
- AI-powered trading signals
- Portfolio analytics
- KYC verification
- Deposit/withdrawal via crypto
- WebSocket real-time price feeds

Important rules:
- Never guarantee profits or returns
- Always emphasize risk management
- Recommend starting with small amounts
- Suggest using stop-loss orders
- Remind users trading involves risk`;
}

/**
 * Build conversation context from history
 */
function buildConversationContext(history: ChatMessage[]): string {
  const recentHistory = history.slice(-6); // Last 3 exchanges
  return recentHistory
    .map(
      (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
    )
    .join("\n");
}

/**
 * Extract quick reply suggestions based on user message
 */
function extractSuggestions(userMessage: string): string[] {
  const msg = userMessage.toLowerCase();

  if (msg.includes("deposit") || msg.includes("fund")) {
    return [
      "How do I deposit?",
      "What payment methods?",
      "Minimum deposit amount?",
    ];
  }

  if (msg.includes("withdraw") || msg.includes("cash out")) {
    return ["How to withdraw?", "Withdrawal fees?", "Processing time?"];
  }

  if (msg.includes("trade") || msg.includes("buy") || msg.includes("sell")) {
    return [
      "How to place a trade?",
      "What are trading fees?",
      "How does leverage work?",
    ];
  }

  if (
    msg.includes("kyc") ||
    msg.includes("verify") ||
    msg.includes("verification")
  ) {
    return ["What is KYC?", "How to verify account?", "Required documents?"];
  }

  if (
    msg.includes("ai") ||
    msg.includes("signal") ||
    msg.includes("recommendation")
  ) {
    return [
      "How do AI signals work?",
      "Are AI signals accurate?",
      "How to use trading signals?",
    ];
  }

  if (msg.includes("risk") || msg.includes("safe") || msg.includes("lose")) {
    return [
      "How to manage risk?",
      "What is stop-loss?",
      "Position sizing tips?",
    ];
  }

  // Default suggestions
  return ["How to get started?", "Trading tutorial?", "Contact support"];
}

/**
 * Fallback responses when API unavailable
 */
function getFallbackResponse(userMessage: string): ChatResponse {
  const msg = userMessage.toLowerCase();

  const responses: Record<string, string> = {
    "deposit|fund|add money": `To deposit funds:
1. Go to Dashboard → Deposit
2. Select cryptocurrency (Bitcoin, Ethereum, etc.)
3. Copy your unique deposit address
4. Send crypto from your wallet
5. Wait for blockchain confirmations

Need help? Email support@m4capital.online`,

    "withdraw|cash out": `To withdraw funds:
1. Ensure KYC verification is complete
2. Go to Dashboard → Withdraw
3. Enter wallet address and amount
4. Confirm withdrawal
5. Processing time: 1-24 hours

For assistance, contact support@m4capital.online`,

    "trade|buy|sell|order": `To place a trade:
1. Go to Traderoom
2. Select trading pair (e.g., BTC/USDT)
3. Choose Buy or Sell
4. Enter amount and price
5. Review and confirm

Use AI signals for recommendations! Click "Get AI Signal" in the traderoom.`,

    "kyc|verify|verification": `KYC (Know Your Customer) verification:
1. Go to Settings → KYC
2. Upload: ID document, proof of address, selfie
3. Submit for review
4. Approval usually within 24-48 hours

This is required for withdrawals and higher trading limits.`,

    "ai|signal|recommendation": `AI Trading Signals:
- Get BUY/SELL/HOLD recommendations
- Based on technical analysis + sentiment
- Shows confidence level and target prices
- Access in Traderoom → "Get AI Signal"

Remember: AI signals are guidance, not guarantees. Always do your research!`,

    "fee|cost|charge": `Trading Fees:
- Trading: 0.1% - 0.25% per trade
- Deposits: Free (you pay blockchain fees)
- Withdrawals: Network fees apply
- No hidden charges

Premium accounts get lower fees!`,

    "risk|safe|lose|danger": `Risk Management Tips:
✓ Never invest more than you can afford to lose
✓ Use stop-loss orders
✓ Diversify your portfolio
✓ Start small and learn
✓ Don't use high leverage initially
✓ Keep emotions in check

Trading involves significant risk!`,

    "help|support|contact": `Get Help:
📧 Email: support@m4capital.online
💬 Live chat: Available in dashboard
📚 Tutorials: Check Academy section
⏰ Support hours: 24/7

We're here to help!`,
  };

  // Find matching response
  for (const [pattern, response] of Object.entries(responses)) {
    const keywords = pattern.split("|");
    if (keywords.some((keyword) => msg.includes(keyword))) {
      return {
        message: response,
        confidence: 0.7,
        suggestions: extractSuggestions(userMessage),
      };
    }
  }

  // Generic fallback
  return {
    message: `I'm here to help with M4Capital! I can assist with:

• Trading and platform features
• Deposits and withdrawals  
• KYC verification
• AI trading signals
• Risk management
• Account settings

What would you like to know?`,
    confidence: 0.6,
    suggestions: ["How to get started?", "Trading guide", "Contact support"],
  };
}

/**
 * Get FAQ answers
 */
export function getFAQAnswer(question: string): string | null {
  const faqs: Record<string, string> = {
    "What is M4Capital?":
      "M4Capital is an advanced cryptocurrency trading platform offering real-time trading, AI-powered signals, and comprehensive portfolio management.",

    "How do I get started?":
      "1. Sign up for an account\n2. Complete KYC verification\n3. Deposit funds\n4. Start trading in the Traderoom\n5. Use AI signals for guidance",

    "Is M4Capital safe?":
      "Yes! We use bank-level encryption, secure wallet storage, and require KYC verification. Your funds are protected with industry-standard security measures.",

    "What cryptocurrencies can I trade?":
      "BTC, ETH, BNB, SOL, ADA, DOGE, XRP, DOT, MATIC, LINK, and more. Check the Traderoom for full list.",

    "How accurate are AI signals?":
      "AI signals combine technical analysis, sentiment analysis, and market data. While helpful, they're not guarantees. Always do your own research.",

    "What's the minimum deposit?":
      "The minimum deposit varies by cryptocurrency. Generally $50-100 equivalent. Check the deposit page for current minimums.",
  };

  return faqs[question] || null;
}
