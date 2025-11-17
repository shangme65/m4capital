import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";
import { rateLimiters } from "@/lib/middleware/ratelimit";
import {
  createErrorResponse,
  createSuccessResponse,
  withErrorHandler,
} from "@/lib/middleware/errorHandler";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/create-bitcoin
 * Create a Bitcoin deposit payment via NOWPayments
 * Supports both payment API and invoice API methods
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimiters.standard(request);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse(
        "Unauthorized",
        "Authentication required",
        undefined,
        401
      );
    }

    const body = await request.json();
    const { amount, currency = "USD", useInvoice = false } = body;

    if (!amount || amount <= 0) {
      return createErrorResponse(
        "Invalid input",
        "Amount must be greater than 0",
        undefined,
        400
      );
    }

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: { Portfolio: true },
    });

    if (!user) {
      return createErrorResponse("Not found", "User not found", undefined, 404);
    }

    // Get or create portfolio
    let portfolio = user.Portfolio;
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          balance: 0,
          assets: [],
        },
      });
    }

    // Use invoice method if requested or if payment API fails
    if (useInvoice) {
      return await createInvoicePayment(
        user,
        portfolio,
        amount,
        currency,
        request
      );
    } else {
      // Try payment API first
      try {
        return await createStandardPayment(
          user,
          portfolio,
          amount,
          currency,
          request
        );
      } catch (error) {
        console.log("Payment API failed, falling back to invoice API:", error);
        return await createInvoicePayment(
          user,
          portfolio,
          amount,
          currency,
          request
        );
      }
    }
  } catch (error) {
    console.error("Create Bitcoin payment error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to create payment",
      error,
      500
    );
  }
}

/**
 * Create payment using standard NOWPayments API
 */
async function createStandardPayment(
  user: any,
  portfolio: any,
  amount: string,
  currency: string,
  request: NextRequest
) {
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
    return createErrorResponse(
      "Invalid amount",
      `Amount too low. Minimum deposit is ${minAmount.min_amount} BTC (~$${(
        minAmount.min_amount *
        (parseFloat(amount) / estimate.estimated_amount)
      ).toFixed(2)})`,
      undefined,
      400
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

  return createSuccessResponse(
    {
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
        method: "payment",
      },
    },
    "Payment created successfully"
  );
}

/**
 * Create payment using NOWPayments invoice API
 * This method doesn't require payment tool setup
 */
async function createInvoicePayment(
  user: any,
  portfolio: any,
  amount: string,
  currency: string,
  request: NextRequest
) {
  // Get minimum Bitcoin amount
  const minAmount = await nowPayments.getMinimumAmount("btc");

  // Estimate BTC amount
  const estimate = await nowPayments.estimatePrice({
    amount: parseFloat(amount),
    currency_from: currency.toLowerCase(),
    currency_to: "btc",
  });

  // Check if amount meets minimum
  if (estimate.estimated_amount < minAmount.min_amount) {
    return createErrorResponse(
      "Invalid amount",
      `Amount too low. Minimum deposit is ${minAmount.min_amount} BTC (~$${(
        minAmount.min_amount *
        (parseFloat(amount) / estimate.estimated_amount)
      ).toFixed(2)})`,
      undefined,
      400
    );
  }

  // Create deposit record
  const deposit = await prisma.deposit.create({
    data: {
      portfolioId: portfolio.id,
      userId: user.id,
      amount: parseFloat(amount),
      currency: currency,
      cryptoAmount: estimate.estimated_amount,
      cryptoCurrency: "BTC",
      status: "PENDING",
      method: "NOWPAYMENTS_BTC_INVOICE",
    },
  });

  // Create invoice with NOWPayments
  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payment/webhook`;

  const invoice = await nowPayments.createInvoice({
    price_amount: parseFloat(amount),
    price_currency: currency.toUpperCase(),
    pay_currency: "btc",
    ipn_callback_url: callbackUrl,
    order_id: deposit.id,
    order_description: `Deposit for user ${user.email}`,
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=cancelled`,
  });

  console.log("Invoice created:", invoice);

  // Update deposit with invoice details
  await prisma.deposit.update({
    where: { id: deposit.id },
    data: {
      paymentId: invoice.id,
      invoiceUrl: invoice.invoice_url,
    },
  });

  return createSuccessResponse(
    {
      deposit: {
        id: deposit.id,
        amount: amount,
        currency: currency,
        cryptoAmount: estimate.estimated_amount,
        cryptoCurrency: "BTC",
        invoiceId: invoice.id,
        invoiceUrl: invoice.invoice_url,
        status: "pending",
        createdAt: deposit.createdAt,
        method: "invoice",
      },
    },
    "Invoice created successfully"
  );
}
