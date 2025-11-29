import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Fetch user notifications
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to last 50 notifications
    });

    // Format notifications for frontend
    const formattedNotifications = notifications.map((notification) => {
      const metadata = notification.metadata as Record<string, any> | null;
      return {
        id: notification.id,
        type: notification.type.toLowerCase(),
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt,
        read: notification.read,
        archived: metadata?.archived || false,
        amount: notification.amount
          ? parseFloat(notification.amount.toString())
          : undefined,
        asset: notification.asset || undefined,
      };
    });

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read or archive
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAllAsRead, archive } = body;

    if (markAllAsRead) {
      // Mark all user notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (notificationId) {
      // Mark specific notification as read (or archived via metadata)
      const updateData: { read?: boolean; metadata?: any } = {};

      if (archive) {
        // For archive, we update the metadata field
        updateData.metadata = {
          archived: true,
          archivedAt: new Date().toISOString(),
        };
        updateData.read = true; // Also mark as read when archiving
      } else {
        updateData.read = true;
      }

      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: session.user.id,
        },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: archive
          ? "Notification archived"
          : "Notification marked as read",
      });
    }

    return NextResponse.json(
      { error: "No notification ID or markAllAsRead flag provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Clear all notifications or delete a specific notification
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if there's a body with a specific notification ID
    let notificationId: string | undefined;
    try {
      const body = await request.json();
      notificationId = body.notificationId;
    } catch {
      // No body, delete all notifications
    }

    if (notificationId) {
      // Delete specific notification
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Notification deleted",
      });
    }

    // Delete all notifications
    await prisma.notification.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return NextResponse.json(
      { error: "Failed to clear notifications" },
      { status: 500 }
    );
  }
}
