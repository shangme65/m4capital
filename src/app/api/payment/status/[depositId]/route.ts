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
      include: { user: true },
    });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    // Verify user owns this deposit
    if (deposit.user?.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If payment has a NOWPayments ID, fetch latest status
    let nowPaymentsStatus = null;
    if (deposit.paymentId) {
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
      }
    }

    return NextResponse.json({
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
          nowPaymentsStatus?.payment_status || deposit.paymentStatus,
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
