import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/welcome
 * Create welcome notification for new users
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId,
        type: "INFO",
        title: "Welcome to M4Capital",
        message:
          "Your account has been successfully created. Start trading now!",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Welcome notification created",
    });
  } catch (error) {
    console.error("Error creating welcome notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
