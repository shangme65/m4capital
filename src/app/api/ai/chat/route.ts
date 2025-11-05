/**
 * AI Chatbot API Endpoint
 * POST /api/ai/chat
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getChatbotResponse, getFAQAnswer } from "@/lib/ai/chatbot";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Allow chat even without login, but track if authenticated
    const userId = session?.user?.id || "anonymous";

    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get chatbot response
    const response = await getChatbotResponse(message, history || []);

    return NextResponse.json({
      success: true,
      response: response.message,
      confidence: response.confidence,
      suggestions: response.suggestions,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("❌ Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to get chatbot response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get FAQ answer
    const { searchParams } = new URL(request.url);
    const question = searchParams.get("question");

    if (question) {
      const answer = getFAQAnswer(question);
      if (answer) {
        return NextResponse.json({
          success: true,
          question,
          answer,
        });
      }
    }

    // Return available FAQs
    return NextResponse.json({
      success: true,
      faqs: [
        "What is M4Capital?",
        "How do I get started?",
        "Is M4Capital safe?",
        "What cryptocurrencies can I trade?",
        "How accurate are AI signals?",
        "What's the minimum deposit?",
      ],
    });
  } catch (error) {
    console.error("❌ FAQ API error:", error);
    return NextResponse.json({ error: "Failed to get FAQ" }, { status: 500 });
  }
}
