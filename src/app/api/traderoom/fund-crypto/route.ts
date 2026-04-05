/**
 * ⚠️ DEPRECATED - DO NOT USE
 * 
 * This endpoint is deprecated and should NOT be used.
 * 
 * REASON: The traderoom should ONLY accept internal transfers from the user's 
 * existing portfolio balance (fiat or crypto), NOT external crypto deposits via NowPayments.
 * 
 * CORRECT FLOW:
 * - Users deposit crypto to their main portfolio via NowPayments (dashboard)
 * - Users transfer crypto from portfolio to traderoom (internal transfer)
 * - Use fundTraderoomCryptoAction() server action for internal crypto transfers
 * 
 * This file is kept for reference only and will be removed in a future cleanup.
 */

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
 * POST /api/traderoom/fund-crypto
 * ⚠️ DEPRECATED - Return error explaining the correct flow
 */
export async function POST(request: NextRequest) {
  return createErrorResponse(
    "Endpoint deprecated",
    "This endpoint is no longer supported. Please transfer crypto from your main portfolio instead. Go to Dashboard → Transfer crypto to Traderoom.",
    undefined,
    410 // 410 Gone - indicates resource is permanently unavailable
  );
}

// ===== DEPRECATED CODE BELOW - KEPT FOR REFERENCE =====

/**
 * OLD DEPRECATED IMPLEMENTATION
 * DO NOT USE - Creates external crypto deposits which violates the internal-only transfer model
 */
async function DEPRECATED_createTraderoomCryptoPayment(
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

  console.log("Traderoom payment estimate:", estimate);

  // Check if amount meets minimum
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

  // Create deposit record with TRADEROOM target
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
      targetAsset: "TRADEROOM", // This marks it as a traderoom deposit
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
    order_description: `Traderoom ${cryptoName} deposit for user ${user.email}`,
  });

  console.log("Traderoom payment created:", payment);

  // Use a longer expiration time (50 minutes) to allow for blockchain confirmations
  const expiresAt = new Date(Date.now() + 50 * 60 * 1000); // 50 minutes

  // Update deposit with payment details
  await prisma.deposit.update({
    where: { id: deposit.id },
    data: {
      paymentId: payment.payment_id,
      paymentAddress: payment.pay_address,
      paymentAmount: payment.pay_amount,
      paymentStatus: payment.payment_status,
      expiresAt: expiresAt,
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
        expiresAt: expiresAt.toISOString(),
        method: "payment",
        target: "TRADEROOM",
      },
    },
    "Traderoom crypto payment created successfully"
  );
}

/**
 * Create payment using NOWPayments invoice API for traderoom (fallback)
 */
async function createTraderoomCryptoInvoice(
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

  // Create deposit record with TRADEROOM target
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
      targetAsset: "TRADEROOM", // This marks it as a traderoom deposit
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
    order_description: `Traderoom ${cryptoName} deposit for user ${user.email}`,
    success_url: `${process.env.NEXTAUTH_URL}/traderoom?payment=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/traderoom?payment=cancelled`,
  });

  console.log("Traderoom invoice created:", invoice);

  // Update deposit with invoice details
  // Use a longer expiration time (50 minutes) for invoices too
  const invoiceExpiresAt = new Date(Date.now() + 50 * 60 * 1000); // 50 minutes

  await prisma.deposit.update({
    where: { id: deposit.id },
    data: {
      paymentId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      paymentAddress: invoice.pay_address,
      paymentAmount: invoice.pay_amount,
      expiresAt: invoiceExpiresAt,
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
        expiresAt: invoiceExpiresAt.toISOString(),
        method: "invoice",
        target: "TRADEROOM",
      },
    },
    "Traderoom crypto invoice created successfully"
  );
}
