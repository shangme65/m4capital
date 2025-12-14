import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { SUPPORTED_CRYPTOS } from "@/lib/crypto-constants";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";
import { rateLimiters } from "@/lib/middleware/ratelimit";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/create-crypto
 * Create a cryptocurrency deposit payment via NOWPayments
 * Supports multiple cryptocurrencies
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
    const { amount, currency = "USD", cryptoCurrency = "btc" } = body;

    if (!amount || amount <= 0) {
      return createErrorResponse(
        "Invalid input",
        "Amount must be greater than 0",
        undefined,
        400
      );
    }

    // Validate cryptocurrency
    const cryptoKey = cryptoCurrency.toLowerCase();
    const cryptoInfo = SUPPORTED_CRYPTOS[cryptoKey];

    if (!cryptoInfo) {
      return createErrorResponse(
        "Invalid cryptocurrency",
        `Cryptocurrency ${cryptoCurrency} is not supported. Supported: ${Object.keys(
          SUPPORTED_CRYPTOS
        ).join(", ")}`,
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
          id: generateId(),
          userId: user.id,
          balance: 0,
          assets: [],
        },
      });
    }

    // Try payment API first, fall back to invoice API
    try {
      console.log("Attempting to create payment with:", {
        user: user.email,
        amount,
        currency,
        crypto: cryptoInfo.code,
      });
      return await createCryptoPayment(
        user,
        portfolio,
        amount,
        currency,
        cryptoInfo.code,
        cryptoInfo.name
      );
    } catch (error: any) {
      console.error(
        "Payment API failed, falling back to invoice API:",
        error?.message || error,
        error?.stack
      );
      try {
        return await createCryptoInvoice(
          user,
          portfolio,
          amount,
          currency,
          cryptoInfo.code,
          cryptoInfo.name
        );
      } catch (invoiceError: any) {
        console.error(
          "Invoice API also failed:",
          invoiceError?.message || invoiceError,
          invoiceError?.stack
        );
        // Return a more descriptive error
        const errorMessage =
          invoiceError?.message ||
          error?.message ||
          "Payment provider unavailable";
        return createErrorResponse(
          "Payment creation failed",
          errorMessage.includes("API key")
            ? "Payment service is not configured. Please contact support."
            : errorMessage,
          {
            paymentError: error?.message,
            invoiceError: invoiceError?.message,
          },
          500
        );
      }
    }
  } catch (error) {
    console.error("Create crypto payment error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to create payment",
      error,
      500
    );
  }
}

/**
 * Create payment using standard NOWPayments payment API
 */
async function createCryptoPayment(
  user: any,
  portfolio: any,
  amount: number,
  currency: string,
  payCurrency: string,
  cryptoName: string
) {
  // Get minimum amount for the selected crypto
  let minAmount = { min_amount: 0 };
  try {
    minAmount = await nowPayments.getMinimumAmount(payCurrency);
    console.log(`Minimum ${payCurrency.toUpperCase()} amount:`, minAmount);
  } catch (error) {
    console.log("Could not get minimum amount, proceeding without check");
  }

  // Estimate crypto amount
  const estimate = await nowPayments.estimatePrice({
    amount: parseFloat(String(amount)),
    currency_from: currency.toLowerCase(),
    currency_to: payCurrency,
  });

  console.log("Payment estimate:", estimate);

  // Check if amount meets minimum (if we have the data)
  if (
    minAmount.min_amount > 0 &&
    estimate.estimated_amount < minAmount.min_amount
  ) {
    const minUsdValue = (
      minAmount.min_amount *
      (parseFloat(String(amount)) / estimate.estimated_amount)
    ).toFixed(2);
    const userCurr = user.preferredCurrency || "USD";
    const currSym = getCurrencySymbol(userCurr);
    return createErrorResponse(
      "Invalid amount",
      `Amount too low. Minimum deposit is ${
        minAmount.min_amount
      } ${payCurrency.toUpperCase()} (~${currSym}${minUsdValue})`,
      undefined,
      400
    );
  }

  // Create deposit record in database first
  const deposit = await prisma.deposit.create({
    data: {
      id: generateId(),
      portfolioId: portfolio.id,
      userId: user.id,
      amount: parseFloat(String(amount)),
      currency: currency,
      cryptoAmount: estimate.estimated_amount,
      cryptoCurrency: payCurrency.toUpperCase(),
      status: "PENDING",
      method: `NOWPAYMENTS_${payCurrency.toUpperCase()}`,
      updatedAt: new Date(),
    },
  });

  // Create payment with NOWPayments
  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payment/webhook`;

  const payment = await nowPayments.createPayment({
    price_amount: parseFloat(String(amount)),
    price_currency: currency.toLowerCase(),
    pay_currency: payCurrency,
    ipn_callback_url: callbackUrl,
    order_id: deposit.id,
    order_description: `${cryptoName} deposit for user ${user.email}`,
  });

  console.log("Payment created:", payment);

  // Update deposit with payment details
  await prisma.deposit.update({
    where: { id: deposit.id },
    data: {
      paymentId: payment.payment_id,
      paymentAddress: payment.pay_address,
      paymentAmount: payment.pay_amount,
      paymentStatus: payment.payment_status,
    },
  });

  return createSuccessResponse(
    {
      deposit: {
        id: deposit.id,
        amount: amount,
        currency: currency,
        cryptoAmount: payment.pay_amount,
        cryptoCurrency: payCurrency.toUpperCase(),
        paymentId: payment.payment_id,
        paymentAddress: payment.pay_address,
        paymentStatus: payment.payment_status,
        status: "PENDING",
        createdAt: deposit.createdAt,
        expiresAt: payment.expiration_estimate_date,
        method: "payment",
      },
    },
    "Payment created successfully"
  );
}

/**
 * Create payment using NOWPayments invoice API (fallback)
 */
async function createCryptoInvoice(
  user: any,
  portfolio: any,
  amount: number,
  currency: string,
  payCurrency: string,
  cryptoName: string
) {
  // Estimate crypto amount
  const estimate = await nowPayments.estimatePrice({
    amount: parseFloat(String(amount)),
    currency_from: currency.toLowerCase(),
    currency_to: payCurrency,
  });

  // Create deposit record
  const deposit = await prisma.deposit.create({
    data: {
      id: generateId(),
      portfolioId: portfolio.id,
      userId: user.id,
      amount: parseFloat(String(amount)),
      currency: currency,
      cryptoAmount: estimate.estimated_amount,
      cryptoCurrency: payCurrency.toUpperCase(),
      status: "PENDING",
      method: `NOWPAYMENTS_${payCurrency.toUpperCase()}_INVOICE`,
      updatedAt: new Date(),
    },
  });

  // Create invoice with NOWPayments
  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payment/webhook`;

  const invoice = await nowPayments.createInvoice({
    price_amount: parseFloat(String(amount)),
    price_currency: currency.toUpperCase(),
    pay_currency: payCurrency,
    ipn_callback_url: callbackUrl,
    order_id: deposit.id,
    order_description: `${cryptoName} deposit for user ${user.email}`,
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
      paymentAddress: invoice.pay_address,
      paymentAmount: invoice.pay_amount,
    },
  });

  return createSuccessResponse(
    {
      deposit: {
        id: deposit.id,
        amount: amount,
        currency: currency,
        cryptoAmount: estimate.estimated_amount,
        cryptoCurrency: payCurrency.toUpperCase(),
        invoiceId: invoice.id,
        invoiceUrl: invoice.invoice_url,
        paymentAddress: invoice.pay_address,
        paymentAmount: invoice.pay_amount,
        status: "PENDING",
        createdAt: deposit.createdAt,
        method: "invoice",
      },
    },
    "Invoice created successfully"
  );
}
