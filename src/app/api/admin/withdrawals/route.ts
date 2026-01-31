import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";

/**
 * GET: Fetch all withdrawals (admin only)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause = status ? { status } : {};

    const withdrawals = await prisma.withdrawal.findMany({
      where: whereClause,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            preferredCurrency: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error("Fetch withdrawals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    );
  }
}

/**
 * POST: Approve or reject withdrawal (admin only)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { withdrawalId, action, confirmations } = body;

    if (!withdrawalId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            preferredCurrency: true,
          },
        },
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 }
      );
    }

    const metadata = (withdrawal.metadata as any) || {};
    const userCurrency = withdrawal.User?.preferredCurrency || "USD";

    if (action === "approve") {
      // Update withdrawal to PROCESSING or COMPLETED based on confirmations
      const newStatus =
        confirmations && confirmations > 0 ? "PROCESSING" : "COMPLETED";

      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: newStatus,
            metadata: {
              ...metadata,
              approvedAt: new Date().toISOString(),
              approvedBy: user.email,
              confirmations: confirmations || 0,
              requiredConfirmations: confirmations || 0,
            },
          },
        }),
        prisma.notification.create({
          data: {
            id: generateId(),
            userId: withdrawal.userId!,
            type: "WITHDRAW",
            title: "Withdrawal Approved",
            message: `Your withdrawal of ${Number(withdrawal.amount).toLocaleString()} ${withdrawal.currency} has been approved and is being processed.`,
            amount: Number(withdrawal.amount),
            asset: userCurrency,
            metadata: {
              withdrawalId: withdrawal.id,
              status: newStatus,
              confirmations: confirmations || 0,
            },
          },
        }),
      ]);

      return NextResponse.json({
        message: "Withdrawal approved successfully",
        withdrawal: {
          id: withdrawalId,
          status: newStatus,
          confirmations: confirmations || 0,
        },
      });
    } else if (action === "reject") {
      // Reject withdrawal and refund the amount to user's portfolio
      const refundAmount =
        Number(withdrawal.amount) + (Number(metadata.fees?.totalFees) || 0);

      const portfolio = await prisma.portfolio.findUnique({
        where: { id: withdrawal.portfolioId },
      });

      if (!portfolio) {
        return NextResponse.json(
          { error: "Portfolio not found" },
          { status: 404 }
        );
      }

      const newBalance = Number(portfolio.balance) + refundAmount;

      await prisma.$transaction([
        prisma.portfolio.update({
          where: { id: withdrawal.portfolioId },
          data: { balance: newBalance },
        }),
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "REJECTED",
            metadata: {
              ...metadata,
              rejectedAt: new Date().toISOString(),
              rejectedBy: user.email,
              refundAmount,
            },
          },
        }),
        prisma.notification.create({
          data: {
            id: generateId(),
            userId: withdrawal.userId!,
            type: "WITHDRAW",
            title: "Withdrawal Rejected",
            message: `Your withdrawal request has been rejected. ${refundAmount.toLocaleString()} ${withdrawal.currency} has been refunded to your balance.`,
            amount: refundAmount,
            asset: userCurrency,
            metadata: {
              withdrawalId: withdrawal.id,
              refunded: true,
            },
          },
        }),
      ]);

      return NextResponse.json({
        message: "Withdrawal rejected and refunded successfully",
        withdrawal: {
          id: withdrawalId,
          status: "REJECTED",
          refundAmount,
        },
      });
    } else if (action === "update_confirmations") {
      // Update confirmation count for a processing withdrawal
      const currentConfirmations = metadata.confirmations || 0;
      const requiredConfirmations = metadata.requiredConfirmations || 0;
      const newConfirmations = confirmations || currentConfirmations + 1;

      const newStatus =
        newConfirmations >= requiredConfirmations ? "COMPLETED" : "PROCESSING";

      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: newStatus,
            metadata: {
              ...metadata,
              confirmations: newConfirmations,
              lastConfirmationUpdate: new Date().toISOString(),
              updatedBy: user.email,
            },
          },
        }),
        prisma.notification.create({
          data: {
            id: generateId(),
            userId: withdrawal.userId!,
            type: "WITHDRAW",
            title:
              newStatus === "COMPLETED"
                ? "Withdrawal Completed"
                : "Withdrawal Update",
            message:
              newStatus === "COMPLETED"
                ? `Your withdrawal of ${Number(withdrawal.amount).toLocaleString()} ${withdrawal.currency} has been completed.`
                : `Your withdrawal has ${newConfirmations}/${requiredConfirmations} confirmations.`,
            amount: Number(withdrawal.amount),
            asset: userCurrency,
            metadata: {
              withdrawalId: withdrawal.id,
              confirmations: newConfirmations,
              requiredConfirmations,
              completed: newStatus === "COMPLETED",
            },
          },
        }),
      ]);

      return NextResponse.json({
        message:
          newStatus === "COMPLETED"
            ? "Withdrawal completed"
            : "Confirmations updated",
        withdrawal: {
          id: withdrawalId,
          status: newStatus,
          confirmations: newConfirmations,
          requiredConfirmations,
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Manage withdrawal error:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal action" },
      { status: 500 }
    );
  }
}
