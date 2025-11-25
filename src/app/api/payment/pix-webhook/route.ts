import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/pix-webhook
 * Handle PIX payment webhooks from payment providers (Mercado Pago, Asaas, etc.)
 *
 * This endpoint receives notifications when a PIX payment status changes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = headers();

    console.log("PIX Webhook received:", {
      provider: process.env.PIX_PROVIDER,
      body: JSON.stringify(body, null, 2),
    });

    const provider = process.env.PIX_PROVIDER || "mercadopago";

    // Process based on provider
    switch (provider) {
      case "mercadopago":
        return await handleMercadoPagoWebhook(body);
      case "asaas":
        return await handleAsaasWebhook(body);
      case "pagseguro":
        return await handlePagSeguroWebhook(body);
      default:
        console.error("Unknown PIX provider:", provider);
        return NextResponse.json(
          { error: "Unknown provider" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("PIX webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle Mercado Pago webhook
 */
async function handleMercadoPagoWebhook(body: any) {
  try {
    // Mercado Pago sends different types of notifications
    if (body.type === "payment") {
      const paymentId = body.data?.id;

      if (!paymentId) {
        return NextResponse.json({ error: "No payment ID" }, { status: 400 });
      }

      // Find deposit by payment ID
      const deposit = await prisma.deposit.findFirst({
        where: { paymentId: paymentId.toString() },
        include: { Portfolio: true },
      });

      if (!deposit) {
        console.log("Deposit not found for payment ID:", paymentId);
        return NextResponse.json(
          { message: "Deposit not found" },
          { status: 404 }
        );
      }

      // Fetch payment details from Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PIX_API_TOKEN}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("Failed to fetch payment details from Mercado Pago");
      }

      const payment = await paymentResponse.json();

      // Process payment based on status
      if (payment.status === "approved" && deposit.status === "PENDING") {
        await processApprovedPayment(deposit);
      } else if (
        payment.status === "cancelled" ||
        payment.status === "rejected"
      ) {
        await processCancelledPayment(deposit);
      }

      return NextResponse.json({ success: true, status: payment.status });
    }

    return NextResponse.json({ message: "Event type not handled" });
  } catch (error) {
    console.error("Mercado Pago webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

/**
 * Handle Asaas webhook
 */
async function handleAsaasWebhook(body: any) {
  try {
    const event = body.event;
    const payment = body.payment;

    if (!payment?.id) {
      return NextResponse.json({ error: "No payment data" }, { status: 400 });
    }

    // Find deposit by payment ID
    const deposit = await prisma.deposit.findFirst({
      where: { paymentId: payment.id },
      include: { Portfolio: true },
    });

    if (!deposit) {
      console.log("Deposit not found for payment ID:", payment.id);
      return NextResponse.json(
        { message: "Deposit not found" },
        { status: 404 }
      );
    }

    // Process based on event type
    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      if (deposit.status === "PENDING") {
        await processApprovedPayment(deposit);
      }
    } else if (event === "PAYMENT_OVERDUE" || event === "PAYMENT_DELETED") {
      await processCancelledPayment(deposit);
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Asaas webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

/**
 * Handle PagSeguro webhook (placeholder)
 */
async function handlePagSeguroWebhook(body: any) {
  console.log("PagSeguro webhook not yet implemented");
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

/**
 * Process approved payment - credit user account
 */
async function processApprovedPayment(deposit: any) {
  console.log("Processing approved PIX payment:", deposit.id);

  await prisma.$transaction(async (tx) => {
    // Update deposit status
    await tx.deposit.update({
      where: { id: deposit.id },
      data: {
        status: "COMPLETED",
        paymentStatus: "approved",
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

    console.log("PIX payment credited:", {
      depositId: deposit.id,
      amount: deposit.amount,
      portfolioId: deposit.portfolioId,
    });
  });
}

/**
 * Process cancelled/expired payment
 */
async function processCancelledPayment(deposit: any) {
  console.log("Processing cancelled PIX payment:", deposit.id);

  await prisma.deposit.update({
    where: { id: deposit.id },
    data: {
      status: "FAILED",
      paymentStatus: "cancelled",
      updatedAt: new Date(),
    },
  });
}
