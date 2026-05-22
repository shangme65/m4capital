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
 * GET /api/copy-trading/active
 * Fetch user's active copy trading relationships
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse(
        "Unauthorized",
        "Authentication required",
        undefined,
        401,
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return createErrorResponse("Not found", "User not found", undefined, 404);
    }

    // Fetch active copy trading relationships
    const activeCopyTrades = await prisma.copyTrading.findMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return createSuccessResponse(
      {
        copyTrades: activeCopyTrades,
      },
      "Active copy trades retrieved successfully",
    );
  } catch (error) {
    console.error("Fetch active copy trades error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to fetch copy trades",
      error,
      500,
    );
  }
}
