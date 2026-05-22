import { generateId } from "@/lib/generate-id";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";
import { sendPushNotification } from "@/lib/push-notifications";

export const dynamic = "force-dynamic";

/**
 * POST /api/copy-trading/manage
 * Manage copy trading relationship (pause, resume, end)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { copyTradingId, action } = body;

    if (!copyTradingId || !action) {
      return createErrorResponse(
        "Invalid input",
        "copyTradingId and action are required",
        undefined,
        400,
      );
    }

    if (!["pause", "resume", "end"].includes(action)) {
      return createErrorResponse(
        "Invalid action",
        "Action must be one of: pause, resume, end",
        undefined,
        400,
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return createErrorResponse("Not found", "User not found", undefined, 404);
    }

    // Find copy trading relationship
    const copyTrading = await prisma.copyTrading.findUnique({
      where: { id: copyTradingId },
    });

    if (!copyTrading) {
      return createErrorResponse(
        "Not found",
        "Copy trading relationship not found",
        undefined,
        404,
      );
    }

    // Verify ownership
    if (copyTrading.userId !== user.id) {
      return createErrorResponse(
        "Forbidden",
        "You do not have permission to manage this copy trading relationship",
        undefined,
        403,
      );
    }

    // Update status based on action
    let newStatus = copyTrading.status;
    let notificationTitle = "";
    let notificationMessage = "";

    switch (action) {
      case "pause":
        if (copyTrading.status !== "ACTIVE") {
          return createErrorResponse(
            "Invalid state",
            "Can only pause active copy trading",
            undefined,
            400,
          );
        }
        newStatus = "PAUSED";
        notificationTitle = `Copy Trading Paused`;
        notificationMessage = `You have paused copying ${copyTrading.traderName}. No new trades will be copied until you resume.`;
        break;

      case "resume":
        if (copyTrading.status !== "PAUSED") {
          return createErrorResponse(
            "Invalid state",
            "Can only resume paused copy trading",
            undefined,
            400,
          );
        }
        newStatus = "ACTIVE";
        notificationTitle = `Copy Trading Resumed`;
        notificationMessage = `You have resumed copying ${copyTrading.traderName}. New trades will be copied automatically.`;
        break;

      case "end":
        if (copyTrading.status === "ENDED") {
          return createErrorResponse(
            "Invalid state",
            "Copy trading already ended",
            undefined,
            400,
          );
        }
        newStatus = "ENDED";
        notificationTitle = `Copy Trading Ended`;
        notificationMessage = `You have stopped copying ${copyTrading.traderName}. Your existing positions remain open.`;
        break;
    }

    // Update copy trading record
    const updatedCopyTrading = await prisma.copyTrading.update({
      where: { id: copyTradingId },
      data: {
        status: newStatus,
        endedAt: action === "end" ? new Date() : null,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "TRADE",
        title: notificationTitle,
        message: notificationMessage,
        metadata: {
          copyTradingId: copyTrading.id,
          traderName: copyTrading.traderName,
          action: action,
          previousStatus: copyTrading.status,
          newStatus: newStatus,
        },
      },
    });

    // Send push notification
    try {
      await sendPushNotification(
        user.id,
        notificationTitle,
        notificationMessage,
        {
          type: "copy_trading",
          url: "/copy-trading",
        },
      );
    } catch (pushError) {
      console.error("Failed to send push notification:", pushError);
      // Don't fail the request if push notification fails
    }

    return createSuccessResponse(
      {
        copyTrading: updatedCopyTrading,
      },
      `Copy trading ${action}d successfully`,
    );
  } catch (error) {
    console.error("Manage copy trading error:", error);
    return createErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Failed to manage copy trading",
      error,
      500,
    );
  }
}
