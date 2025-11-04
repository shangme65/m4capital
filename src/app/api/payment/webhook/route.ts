import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/webhook
 * Webhook endpoint for NOWPayments IPN callbacks
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-nowpayments-sig");
    const body = await request.text();

    console.log("📥 Webhook received from NOWPayments");
    console.log("Signature:", signature);

    // Verify signature
    if (!signature) {
      console.error("❌ Missing signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET!;
    const isValid = nowPayments.verifyIPNSignature(body, signature, ipnSecret);

    if (!isValid) {
      console.error("❌ Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const data = JSON.parse(body);
    console.log("✅ Webhook data:", data);

    const {
      payment_id,
      payment_status,
      order_id,
      pay_amount,
      price_amount,
      actually_paid,
      outcome_amount,
    } = data;

    if (!order_id) {
      console.error("❌ Missing order_id");
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Find deposit by ID
    const deposit = await prisma.deposit.findUnique({
      where: { id: order_id },
      include: { user: { include: { portfolio: true } } },
    });

    if (!deposit) {
      console.error("❌ Deposit not found:", order_id);
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    console.log(
      "💰 Processing deposit:",
      deposit.id,
      "Status:",
      payment_status
    );

    // Update deposit status based on payment status
    let newStatus = deposit.status;

    switch (payment_status) {
      case "waiting":
        newStatus = "PENDING";
        break;
      case "confirming":
        newStatus = "PROCESSING";
        break;
      case "confirmed":
      case "finished":
        newStatus = "COMPLETED";
        break;
      case "failed":
      case "refunded":
      case "expired":
        newStatus = "FAILED";
        break;
      case "partially_paid":
        newStatus = "PROCESSING";
        break;
      default:
        newStatus = "PENDING";
    }

    // Update deposit
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        status: newStatus,
        paymentStatus: payment_status,
      },
    });

    // If payment is completed, credit user's portfolio
    if (newStatus === "COMPLETED" && deposit.status !== "COMPLETED") {
      console.log("✅ Payment completed! Crediting user portfolio...");

      // Get or create portfolio
      let portfolio = deposit.user.portfolio;
      if (!portfolio) {
        portfolio = await prisma.portfolio.create({
          data: {
            userId: deposit.user.id,
            balance: 0,
            assets: [],
          },
        });
      }

      // Add amount to balance
      const newBalance =
        parseFloat(portfolio.balance.toString()) +
        parseFloat(deposit.amount.toString());

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: newBalance,
        },
      });

      console.log(
        `💵 Credited ${deposit.amount} ${deposit.currency} to user ${deposit.user.email}`
      );
      console.log(`New balance: ${newBalance}`);

      // TODO: Send email notification to user
      // TODO: Send Telegram notification if enabled
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: "NOWPayments webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
