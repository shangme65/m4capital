import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";

export const dynamic = "force-dynamic";

/**
 * GET /api/deposits/pending
 * Get pending crypto deposits for the current user
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

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return createErrorResponse("Not found", "User not found", undefined, 404);
    }

    // Get pending deposits
    const pendingDeposits = await prisma.deposit.findMany({
      where: {
        userId: user.id,
        status: "PENDING",
        method: {
          startsWith: "NOWPAYMENTS_",
        },
        createdAt: {
          // Only show deposits from the last 24 hours
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        cryptoAmount: true,
        cryptoCurrency: true,
        paymentId: true,
        paymentAddress: true,
        paymentAmount: true,
        invoiceUrl: true,
        expiresAt: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Check for expired deposits and mark them as FAILED
    const now = new Date();
    const expiredDeposits = pendingDeposits.filter(
      (deposit) => deposit.expiresAt && deposit.expiresAt < now
    );

    if (expiredDeposits.length > 0) {
      console.log(`⏰ Found ${expiredDeposits.length} expired deposits, marking as FAILED`);
      
      // Update all expired deposits to FAILED status
      await prisma.deposit.updateMany({
        where: {
          id: {
            in: expiredDeposits.map((d) => d.id),
          },
        },
        data: {
          status: "FAILED",
          paymentStatus: "expired",
          updatedAt: now,
        },
      });

      // Remove expired deposits from the list
      return createSuccessResponse(
        {
          deposits: pendingDeposits.filter(
            (d) => !expiredDeposits.some((exp) => exp.id === d.id)
          ),
        },
        "Pending deposits retrieved successfully"
      );
    }

    return createSuccessResponse(
      {
        deposits: pendingDeposits,
      },
      "Pending deposits retrieved successfully"
    );
  } catch (error) {
    console.error("Get pending deposits error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to get pending deposits",
      error,
      500
    );
  }
}
