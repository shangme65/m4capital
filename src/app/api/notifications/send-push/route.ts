import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWebPushToUser } from "@/lib/push-notifications";

export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/send-push
 * Send push notification for crypto purchases
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, amount, asset, icon, data, targetUserId } =
      body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Determine which user to send to (default to current user)
    const userId = targetUserId || session.user.id;

    // Check if user has push notifications enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailNotifications: true,
        name: true,
      },
    });

    // Default to true if user not found
    const pushNotificationsEnabled = user?.emailNotifications ?? true;

    if (!pushNotificationsEnabled) {
      return NextResponse.json({
        success: true,
        message: "Push notifications disabled for this user",
      });
    }

    // Store push notification in database
    const notification = await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        type: "TRANSACTION" as any,
        title,
        message,
        amount: amount ? parseFloat(amount.toString()) : null,
        asset: asset || null,
        read: false,
      },
    });

    console.log(`🔔 Push notification created for user ${userId}`);

    // Send web push notification
    const pushPayload = {
      title,
      body: message,
      icon: icon || "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      tag: `m4capital-${type}-${Date.now()}`,
      data: {
        url: "/dashboard",
        notificationId: notification.id,
        type,
        ...data,
      },
      vibrate: [200, 100, 200],
      requireInteraction: type === "deposit" || type === "withdrawal",
    };

    const { sent, failed } = await sendWebPushToUser(userId, pushPayload);

    return NextResponse.json({
      success: true,
      message: "Push notification sent successfully",
      notification,
      pushStats: { sent, failed },
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Failed to send push notification" },
      { status: 500 }
    );
  }
}
