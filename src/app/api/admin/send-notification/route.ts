import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, notification } = await req.json();

    if (!userId || !notification) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Store notification in database (you may want to create a Notification model)
    // For now, we'll simulate sending the notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Here you would implement your notification system
    // This could be email, push notifications, in-app notifications, etc.

    // Example: Log the notification (in a real app, you'd save to a notifications table)
    console.log(`Notification sent to ${user.email}:`, notification);

    // You could also send an email notification here
    // await sendEmailNotification(user.email, notification);

    return NextResponse.json({
      message: "Notification sent successfully",
      recipient: user.email,
      notification,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
