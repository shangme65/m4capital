import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/create-bitcoin
 * Create a Bitcoin deposit payment via NOWPayments
 */
export async function POST(request: NextRequest) {
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

    // Get minimum Bitcoin amount
    const minAmount = await nowPayments.getMinimumAmount("btc");
    console.log("Minimum BTC amount:", minAmount);

    // Estimate BTC amount
    const estimate = await nowPayments.estimatePrice({
      amount: parseFloat(amount),
      currency_from: currency.toLowerCase(),
      currency_to: "btc",
    });

    console.log("Payment estimate:", estimate);

    // Check if amount meets minimum
    if (estimate.estimated_amount < minAmount.min_amount) {
      return NextResponse.json(
        {
          error: `Amount too low. Minimum deposit is ${
            minAmount.min_amount
          } BTC (~$${(
            minAmount.min_amount *
            (amount / estimate.estimated_amount)
          ).toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    // Create deposit record in database first
    const deposit = await prisma.deposit.create({
      data: {
        portfolioId: portfolio.id,
        userId: user.id,
        amount: parseFloat(amount),
        currency: currency,
        cryptoAmount: estimate.estimated_amount,
        cryptoCurrency: "BTC",
        status: "PENDING",
        method: "NOWPAYMENTS_BTC",
      },
    });

    // Create payment with NOWPayments
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payment/webhook`;

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
        paymentAddress: payment.pay_address,
        paymentAmount: payment.pay_amount,
      },
    });

    return NextResponse.json({
      success: true,
      deposit: {
        id: deposit.id,
        amount: amount,
        currency: currency,
        cryptoAmount: payment.pay_amount,
        cryptoCurrency: "BTC",
        paymentId: payment.payment_id,
        paymentAddress: payment.pay_address,
        status: payment.payment_status,
        createdAt: deposit.createdAt,
        expiresAt: payment.expiration_estimate_date,
      },
    });
  } catch (error) {
    console.error("Create Bitcoin payment error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create payment",
      },
      { status: 500 }
    );
  }
}
