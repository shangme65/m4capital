import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";

export const dynamic = "force-dynamic";

/**
 * GET /api/payment/status/[depositId]
 * Get payment status for a deposit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ depositId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { depositId } = await params;

    // Find deposit
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { User: true },
    });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    // Verify user owns this deposit
    if (deposit.User?.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if deposit has expired locally
    const now = new Date();
    if (
      deposit.status === "PENDING" &&
      deposit.expiresAt &&
      deposit.expiresAt < now
    ) {
      console.log(`⏰ Deposit ${depositId} has expired locally, checking NowPayments...`);
      
      // IMPORTANT: Before marking as expired, check NowPayments to see if payment was received
      let nowPaymentsStatus = null;
      if (deposit.paymentId && deposit.method !== "NOWPAYMENTS_INVOICE_BTC") {
        try {
          nowPaymentsStatus = await nowPayments.getPaymentStatus(deposit.paymentId);
          console.log(`📡 NowPayments status for expired deposit: ${nowPaymentsStatus.payment_status}`);
          
          // If payment is confirmed/finished in NowPayments, don't mark as failed!
          if (nowPaymentsStatus.payment_status === "confirmed" || 
              nowPaymentsStatus.payment_status === "finished" ||
              nowPaymentsStatus.payment_status === "confirming" ||
              nowPaymentsStatus.payment_status === "waiting" ||
              nowPaymentsStatus.payment_status === "partially_paid") {
            console.log(`✅ Payment is still valid in NowPayments (${nowPaymentsStatus.payment_status}), NOT marking as failed`);
            
            // Update the payment status from NowPayments
            await prisma.deposit.update({
              where: { id: depositId },
              data: {
                paymentStatus: nowPaymentsStatus.payment_status,
                // Extend expiration if payment is in progress
                expiresAt: new Date(Date.now() + 50 * 60 * 1000), // Extend by 50 minutes
                updatedAt: now,
              },
            });
            
            // Return current status without marking as failed
            return NextResponse.json({
              success: true,
              deposit: {
                id: deposit.id,
                amount: parseFloat(deposit.amount.toString()),
                currency: deposit.currency,
                status: deposit.status,
                method: deposit.method,
                createdAt: deposit.createdAt,
                paymentId: deposit.paymentId,
                paymentAddress: deposit.paymentAddress,
                paymentAmount: deposit.paymentAmount
                  ? parseFloat(deposit.paymentAmount.toString())
                  : null,
                paymentStatus: nowPaymentsStatus.payment_status,
                cryptoCurrency: deposit.cryptoCurrency,
              },
              nowPaymentsData: nowPaymentsStatus,
            });
          }
        } catch (npError) {
          console.error("Failed to check NowPayments status:", npError);
          // If we can't check NowPayments, don't auto-fail - just return current status
          return NextResponse.json({
            success: true,
            deposit: {
              id: deposit.id,
              amount: parseFloat(deposit.amount.toString()),
              currency: deposit.currency,
              status: deposit.status,
              method: deposit.method,
              createdAt: deposit.createdAt,
              paymentId: deposit.paymentId,
              paymentAddress: deposit.paymentAddress,
              paymentAmount: deposit.paymentAmount
                ? parseFloat(deposit.paymentAmount.toString())
                : null,
              paymentStatus: deposit.paymentStatus || "unknown",
              cryptoCurrency: deposit.cryptoCurrency,
            },
          });
        }
      }
      
      // Only if NowPayments confirms it's truly expired/failed
      console.log(`❌ Deposit ${depositId} confirmed as expired, marking as FAILED`);
      
      // Update to FAILED status
      await prisma.deposit.update({
        where: { id: depositId },
        data: {
          status: "FAILED",
          paymentStatus: "expired",
          updatedAt: now,
        },
      });

      // Return failed status
      return NextResponse.json({
        success: true,
        deposit: {
          id: deposit.id,
          amount: parseFloat(deposit.amount.toString()),
          currency: deposit.currency,
          status: "FAILED",
          method: deposit.method,
          createdAt: deposit.createdAt,
          paymentId: deposit.paymentId,
          paymentAddress: deposit.paymentAddress,
          paymentAmount: deposit.paymentAmount
            ? parseFloat(deposit.paymentAmount.toString())
            : null,
          paymentStatus: "expired",
          cryptoCurrency: deposit.cryptoCurrency,
        },
      });
    }

    // If payment has a NOWPayments ID, fetch latest status
    // Note: For invoices, we rely on webhook callbacks instead of polling
    // because NOWPayments doesn't provide a direct invoice status endpoint
    let nowPaymentsStatus = null;
    if (deposit.paymentId && deposit.method !== "NOWPAYMENTS_INVOICE_BTC") {
      try {
        nowPaymentsStatus = await nowPayments.getPaymentStatus(
          deposit.paymentId
        );

        // Update local status if different
        if (nowPaymentsStatus.payment_status !== deposit.paymentStatus) {
          await prisma.deposit.update({
            where: { id: depositId },
            data: {
              paymentStatus: nowPaymentsStatus.payment_status,
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch NOWPayments status:", error);
        // Don't throw - just log and continue with database status
      }
    }

    return NextResponse.json({
      success: true,
      deposit: {
        id: deposit.id,
        amount: parseFloat(deposit.amount.toString()),
        currency: deposit.currency,
        status: deposit.status,
        method: deposit.method,
        createdAt: deposit.createdAt,
        paymentId: deposit.paymentId,
        paymentAddress: deposit.paymentAddress,
        paymentAmount: deposit.paymentAmount
          ? parseFloat(deposit.paymentAmount.toString())
          : null,
        paymentStatus:
          nowPaymentsStatus?.payment_status ||
          deposit.paymentStatus ||
          "waiting",
        cryptoCurrency: deposit.cryptoCurrency,
      },
      nowPaymentsData: nowPaymentsStatus,
    });
  } catch (error) {
    console.error("Get payment status error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get payment status",
      },
      { status: 500 }
    );
  }
}
