import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";
import { generateId } from "@/lib/generate-id";
import { MINING_PLANS } from "../route";

// GET /api/mining/purchase/status?contractId=xxx
// Polls NowPayments to see if payment was received and activates the contract
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get("contractId");
    const paymentId = searchParams.get("paymentId");

    if (!contractId) {
      return NextResponse.json(
        { error: "contractId required" },
        { status: 400 },
      );
    }

    const contract = await prisma.miningContract.findFirst({
      where: { id: contractId, userId: session.user.id },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }

    // Already active
    if (contract.status === "ACTIVE") {
      return NextResponse.json({ status: "ACTIVE", contract });
    }

    // Check NowPayments status if paymentId provided
    if (paymentId) {
      const payment = await nowPayments.getPaymentStatus(paymentId);
      const confirmedStatuses = ["confirmed", "finished", "partially_paid"];
      const waitingStatuses = ["waiting", "confirming", "sending"];

      if (confirmedStatuses.includes(payment.payment_status)) {
        // Activate the contract
        const planKey = Object.keys(MINING_PLANS).find(
          (k) => MINING_PLANS[k].name === contract.planName,
        );
        const plan = planKey ? MINING_PLANS[planKey] : null;

        const activated = await prisma.miningContract.update({
          where: { id: contractId },
          data: {
            status: "ACTIVE",
            endDate: new Date(
              Date.now() +
                (plan?.duration ?? contract.duration) * 24 * 60 * 60 * 1000,
            ),
          },
        });

        // Notification
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: session.user.id,
            type: "INFO",
            title: "Mining Contract Activated",
            message: `Your ${contract.planName} mining contract is now active! Payment confirmed.`,
          },
        });

        return NextResponse.json({ status: "ACTIVE", contract: activated });
      }

      if (waitingStatuses.includes(payment.payment_status)) {
        return NextResponse.json({
          status: "WAITING",
          paymentStatus: payment.payment_status,
        });
      }

      // Failed / expired
      if (["failed", "expired", "refunded"].includes(payment.payment_status)) {
        await prisma.miningContract.update({
          where: { id: contractId },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json({
          status: "FAILED",
          paymentStatus: payment.payment_status,
        });
      }
    }

    return NextResponse.json({ status: contract.status, contract });
  } catch (error: any) {
    console.error("[mining/purchase/status] error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
