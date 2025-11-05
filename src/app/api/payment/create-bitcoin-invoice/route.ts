import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";

export const dynamic = "force-dynamic";

/**
 * @deprecated This endpoint is deprecated. Use /api/payment/create-bitcoin with useInvoice=true instead.
 *
 * POST /api/payment/create-bitcoin-invoice
 * Create a Bitcoin deposit invoice via NOWPayments (alternative to payment API)
 * This doesn't require payment tool setup in NOWPayments dashboard
 *
 * MIGRATION: This endpoint will be removed in a future version.
 * Please use /api/payment/create-bitcoin with the following body:
 * { amount: number, currency: string, useInvoice: true }
 */
export async function POST(request: NextRequest) {
  // Log deprecation warning
  console.warn(
    "⚠️  DEPRECATED: /api/payment/create-bitcoin-invoice is deprecated. Use /api/payment/create-bitcoin with useInvoice=true"
  );

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, currency = "USD" } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create portfolio
    let portfolio = user.portfolio;
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          balance: 0,
          assets: [],
        },
      });
    }

    // Create deposit record in database first
    const deposit = await prisma.deposit.create({
      data: {
        portfolioId: portfolio.id,
        userId: user.id,
        amount: parseFloat(amount),
        currency: currency,
        status: "PENDING",
        method: "NOWPAYMENTS_BTC",
      },
    });

    // Create payment directly (provides immediate payment address and amount)
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payment/webhook`;

    console.log("Creating NOWPayments payment...");

    const payment = await nowPayments.createPayment({
      price_amount: parseFloat(amount),
      price_currency: currency.toLowerCase(),
      pay_currency: "btc",
      ipn_callback_url: callbackUrl,
      order_id: deposit.id,
      order_description: `Deposit for user ${user.email}`,
    });

    console.log("Payment created:", payment);

    // Update deposit with payment details
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        paymentId: payment.payment_id,
        paymentAddress: payment.pay_address || "pending",
        paymentAmount: payment.pay_amount || 0,
        paymentStatus: payment.payment_status,
        cryptoCurrency: payment.pay_currency?.toUpperCase(),
      },
    });

    return NextResponse.json({
      success: true,
      deposit: {
        id: deposit.id,
        amount: amount,
        currency: currency,
        paymentId: payment.payment_id,
        paymentAddress: payment.pay_address,
        paymentAmount: payment.pay_amount,
        paymentStatus: payment.payment_status,
        status: "PENDING",
        createdAt: deposit.createdAt,
      },
      message: "Payment created successfully",
    });
  } catch (error) {
    console.error("Create Bitcoin invoice error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create invoice",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
