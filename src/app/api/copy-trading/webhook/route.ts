import { NextRequest, NextResponse } from "next/server";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";
import { executeCopyTrade, closeCopyTrade } from "@/lib/copy-trade-execution";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * Verify webhook signature to ensure request is authentic
 * In production, you would verify a signature sent by the trader platform
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

/**
 * POST /api/copy-trading/webhook
 * Receives trader trade notifications and executes copy trades
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.COPY_TRADING_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error(
        "❌ [Copy Trade Webhook] COPY_TRADING_WEBHOOK_SECRET not configured",
      );
      return createErrorResponse(
        "Configuration error",
        "Webhook secret not configured",
        undefined,
        500,
      );
    }

    // Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-copytrade-signature");

    // Verify signature
    if (!signature) {
      return createErrorResponse(
        "Unauthorized",
        "Missing webhook signature",
        undefined,
        401,
      );
    }

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error("❌ [Copy Trade Webhook] Invalid signature");
      return createErrorResponse(
        "Unauthorized",
        "Invalid webhook signature",
        undefined,
        401,
      );
    }

    // Parse JSON body
    const body = JSON.parse(rawBody);
    const { event, data } = body;

    console.log(`📨 [Copy Trade Webhook] Received event: ${event}`);

    // Validate required fields
    if (!event || !data) {
      return createErrorResponse(
        "Invalid request",
        "Missing event or data",
        undefined,
        400,
      );
    }

    // Validate trader trade data
    const {
      traderTradeId,
      traderName,
      symbol,
      direction,
      entryPrice,
      exitPrice,
      amount,
      leverage = 1,
      status,
      openedAt,
      closedAt,
    } = data;

    if (
      !traderTradeId ||
      !traderName ||
      !symbol ||
      !direction ||
      !entryPrice ||
      !amount ||
      !status ||
      !openedAt
    ) {
      return createErrorResponse(
        "Invalid request",
        "Missing required trade data fields",
        undefined,
        400,
      );
    }

    // Process based on event type
    let results;
    switch (event) {
      case "trade.opened":
        console.log(
          `🚀 [Copy Trade Webhook] Opening trades for ${traderName} - ${symbol}`,
        );
        results = await executeCopyTrade({
          traderTradeId,
          traderName,
          symbol,
          direction: direction.toUpperCase() as "HIGHER" | "LOWER",
          entryPrice: parseFloat(entryPrice),
          amount: parseFloat(amount),
          leverage: parseInt(leverage),
          status: "OPEN",
          openedAt: new Date(openedAt),
        });
        break;

      case "trade.closed":
        if (!exitPrice || !closedAt) {
          return createErrorResponse(
            "Invalid request",
            "Missing exitPrice or closedAt for trade close",
            undefined,
            400,
          );
        }

        console.log(
          `🔒 [Copy Trade Webhook] Closing trades for ${traderName} - ${symbol}`,
        );
        results = await closeCopyTrade({
          traderTradeId,
          traderName,
          symbol,
          direction: direction.toUpperCase() as "HIGHER" | "LOWER",
          entryPrice: parseFloat(entryPrice),
          exitPrice: parseFloat(exitPrice),
          amount: parseFloat(amount),
          leverage: parseInt(leverage),
          status: "CLOSED",
          openedAt: new Date(openedAt),
          closedAt: new Date(closedAt),
        });
        break;

      default:
        return createErrorResponse(
          "Invalid request",
          `Unknown event type: ${event}`,
          undefined,
          400,
        );
    }

    // Count successes and failures
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(
      `✅ [Copy Trade Webhook] Processed: ${successCount} success, ${failureCount} failed`,
    );

    return createSuccessResponse(
      {
        event,
        processed: results.length,
        successCount,
        failureCount,
        results: results.map((r) => ({
          success: r.success,
          executionId: r.executionId,
          error: r.error,
        })),
      },
      `Processed ${event} for ${results.length} copy relationships`,
    );
  } catch (error) {
    console.error("❌ [Copy Trade Webhook] Error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to process webhook",
      error,
      500,
    );
  }
}

/**
 * GET /api/copy-trading/webhook
 * Returns webhook configuration info (for debugging/setup)
 */
export async function GET() {
  return createSuccessResponse(
    {
      endpoint: "/api/copy-trading/webhook",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-copytrade-signature": "HMAC-SHA256 signature of request body",
      },
      events: [
        {
          event: "trade.opened",
          description: "Triggered when a trader opens a new trade",
          requiredFields: [
            "traderTradeId",
            "traderName",
            "symbol",
            "direction",
            "entryPrice",
            "amount",
            "leverage",
            "status",
            "openedAt",
          ],
        },
        {
          event: "trade.closed",
          description: "Triggered when a trader closes a trade",
          requiredFields: [
            "traderTradeId",
            "traderName",
            "symbol",
            "direction",
            "entryPrice",
            "exitPrice",
            "amount",
            "leverage",
            "status",
            "openedAt",
            "closedAt",
          ],
        },
      ],
      example: {
        event: "trade.opened",
        data: {
          traderTradeId: "trade_123456",
          traderName: "KateLilianGems",
          symbol: "BTCUSD",
          direction: "HIGHER",
          entryPrice: 50000,
          amount: 100,
          leverage: 1,
          status: "OPEN",
          openedAt: "2024-01-01T12:00:00Z",
        },
      },
    },
    "Copy trading webhook configuration",
  );
}
