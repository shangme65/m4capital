import { generateId } from "@/lib/generate-id";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pixPayments } from "@/lib/pix-payments";
import { rateLimiters } from "@/lib/middleware/ratelimit";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/create-pix
 * Create a PIX instant payment for Brazilian users
 *
 * Required body parameters:
 * - amount: number (in BRL)
 * - payerName: string
 * - payerDocument: string (CPF or CNPJ)
 * - payerEmail: string
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

    // Check if PIX is enabled
    if (!pixPayments.isEnabled()) {
      return createErrorResponse(
        "Service unavailable",
        "PIX payments are currently unavailable. Please try another payment method.",
        undefined,
        503
      );
    }

    const body = await request.json();
    const {
      amount,
      payerName,
      payerDocument,
      payerEmail,
      expirationMinutes = 30,
    } = body;

    // Validation
    if (!amount || amount <= 0) {
      return createErrorResponse(
        "Invalid input",
        "Amount must be greater than 0",
        undefined,
        400
      );
    }

    if (!payerName || !payerDocument || !payerEmail) {
      return createErrorResponse(
        "Invalid input",
        "Payer name, document (CPF/CNPJ), and email are required",
        undefined,
        400
      );
    }

    // Validate CPF/CNPJ format (Brazilian tax ID)
    const documentClean = payerDocument.replace(/\D/g, "");
    if (documentClean.length !== 11 && documentClean.length !== 14) {
      return createErrorResponse(
        "Invalid input",
        "Invalid CPF or CNPJ. CPF must have 11 digits, CNPJ must have 14 digits",
        undefined,
        400
      );
    }

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    // Convert BRL to USD for internal tracking (simplified - use real exchange rate API)
    const BRL_TO_USD_RATE = 0.2; // Example rate - should fetch from API
    const amountUSD = amount * BRL_TO_USD_RATE;

    // Create deposit record in database first
    const deposit = await prisma.deposit.create({
      data: {
        id: generateId(),
        portfolioId: portfolio.id,
        userId: user.id,
        amount: amountUSD, // Store in USD
        currency: "BRL",
        cryptoAmount: amount, // Store original BRL amount here
        cryptoCurrency: "BRL",
        status: "PENDING",
        method: "PIX",
        updatedAt: new Date(),
        metadata: {
          payerName,
          payerDocument: documentClean,
          payerEmail,
          originalAmountBRL: amount,
          brlToUsdRate: BRL_TO_USD_RATE,
        },
      },
    });

    console.log("Creating PIX payment...", { depositId: deposit.id, amount });

    // Create PIX payment
    const pixPayment = await pixPayments.createPayment({
      amount: amount,
      description: `M4Capital Deposit - ${deposit.id}`,
      payerEmail: payerEmail,
      payerName: payerName,
      payerDocument: documentClean,
      expirationMinutes: expirationMinutes,
    });

    console.log("PIX payment created:", pixPayment.paymentId);

    // Update deposit with PIX payment details
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        paymentId: pixPayment.paymentId,
        paymentAddress: pixPayment.qrCodeText, // Store QR code payload
        paymentAmount: amount,
        metadata: {
          ...(deposit.metadata as any),
          qrCodeText: pixPayment.qrCodeText,
          pixKey: pixPayment.pixKey,
          expiresAt: pixPayment.expiresAt.toISOString(),
        },
      },
    });

    return createSuccessResponse(
      {
        deposit: {
          id: deposit.id,
          amount: amountUSD,
          currency: "BRL",
          amountBRL: amount,
          paymentId: pixPayment.paymentId,
          qrCode: pixPayment.qrCode,
          qrCodeText: pixPayment.qrCodeText,
          pixKey: pixPayment.pixKey,
          status: pixPayment.status,
          expiresAt: pixPayment.expiresAt,
          createdAt: deposit.createdAt,
        },
      },
      "PIX payment created successfully"
    );
  } catch (error) {
    console.error("Create PIX payment error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to create PIX payment",
      error,
      500
    );
  }
}

/**
 * GET /api/payment/create-pix?depositId=xxx
 * Check PIX payment status
 */
export async function GET(request: NextRequest) {
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

    const depositId = request.nextUrl.searchParams.get("depositId");

    if (!depositId) {
      return createErrorResponse(
        "Invalid input",
        "Deposit ID is required",
        undefined,
        400
      );
    }

    // Find deposit
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { User: true },
    });

    if (!deposit) {
      return createErrorResponse(
        "Not found",
        "Deposit not found",
        undefined,
        404
      );
    }

    // Verify user owns this deposit
    if (!deposit.User || deposit.User.email !== session.user.email) {
      return createErrorResponse("Forbidden", "Access denied", undefined, 403);
    }

    if (!deposit.paymentId) {
      return createErrorResponse(
        "Invalid state",
        "Payment ID not found for this deposit",
        undefined,
        400
      );
    }

    // Check payment status
    const pixStatus = await pixPayments.getPaymentStatus(deposit.paymentId);

    // Update deposit if payment is confirmed
    if (pixStatus.status === "paid" && deposit.status === "PENDING") {
      await prisma.$transaction(async (tx) => {
        // Update deposit status
        await tx.deposit.update({
          where: { id: deposit.id },
          data: {
            status: "COMPLETED",
            updatedAt: new Date(),
          },
        });

        // Credit user's portfolio
        await tx.portfolio.update({
          where: { id: deposit.portfolioId },
          data: {
            balance: {
              increment: deposit.amount, // USD amount
            },
          },
        });
      });

      return createSuccessResponse(
        {
          status: "paid",
          deposit: {
            id: deposit.id,
            amount: deposit.amount,
            status: "COMPLETED",
          },
        },
        "Payment confirmed and credited to your account!"
      );
    }

    return createSuccessResponse(
      {
        status: pixStatus.status,
        deposit: {
          id: deposit.id,
          amount: deposit.amount,
          status: deposit.status,
          expiresAt: pixStatus.expiresAt,
        },
      },
      "Payment status retrieved"
    );
  } catch (error) {
    console.error("Check PIX payment status error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to check payment status",
      error,
      500
    );
  }
}
