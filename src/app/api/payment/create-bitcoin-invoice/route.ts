import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/create-bitcoin-invoice
 * Create a Bitcoin deposit invoice via NOWPayments (alternative to payment API)
 * This doesn't require payment tool setup in NOWPayments dashboard
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

    // Create deposit record in database first
    const deposit = await prisma.deposit.create({
      data: {
        portfolioId: portfolio.id,
        userId: user.id,
        amount: parseFloat(amount),
        currency: currency,
        status: "PENDING",
        method: "NOWPAYMENTS_INVOICE_BTC",
      },
    });

    // Create invoice with NOWPayments (doesn't require payment tool setup)
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payment/webhook`;
    const successUrl = `${process.env.NEXTAUTH_URL}/dashboard?payment=success`;
    const cancelUrl = `${process.env.NEXTAUTH_URL}/finance?payment=cancelled`;

    console.log("Creating NOWPayments invoice...");

    const invoice = await nowPayments.createInvoice({
      price_amount: parseFloat(amount),
      price_currency: currency.toLowerCase(),
      pay_currency: "btc",
      ipn_callback_url: callbackUrl,
      order_id: deposit.id,
      order_description: `Deposit for user ${user.email}`,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    console.log("Invoice created:", invoice);

    // Update deposit with invoice details
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        paymentId: invoice.id,
        paymentAddress: invoice.pay_address || "pending",
        paymentAmount: invoice.pay_amount || 0,
      },
    });

    return NextResponse.json({
      success: true,
      deposit: {
        id: deposit.id,
        amount: amount,
        currency: currency,
        paymentId: invoice.id,
        invoiceUrl: invoice.invoice_url,
        paymentAddress: invoice.pay_address,
        paymentAmount: invoice.pay_amount,
        status: "PENDING",
        createdAt: deposit.createdAt,
      },
      message:
        "Invoice created. User will be redirected to NOWPayments to complete payment.",
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
