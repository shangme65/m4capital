import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";

export const dynamic = "force-dynamic";

/**
 * POST /api/push/subscribe
 * Subscribe a user to push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safely parse JSON with error handling
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: "Missing subscription keys" },
        { status: 400 }
      );
    }

    // Verify user exists in database before creating subscription
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!userExists) {
      console.error(`User ${session.user.id} not found in database`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user agent from request
    const userAgent = request.headers.get("user-agent") || undefined;

    // Upsert subscription (update if endpoint exists, create if not)
    const pushSubscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh,
        auth,
        userAgent,
        userId: session.user.id,
        updatedAt: new Date(),
      },
      create: {
        id: generateId(),
        userId: session.user.id,
        endpoint,
        p256dh,
        auth,
        userAgent,
        updatedAt: new Date(),
      },
    });

    console.log(
      `🔔 Push subscription saved for user ${session.user.id}:`,
      endpoint.substring(0, 50) + "..."
    );

    return NextResponse.json({
      success: true,
      message: "Push subscription saved successfully",
      subscriptionId: pushSubscription.id,
    });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { error: "Failed to save push subscription" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/subscribe
 * Unsubscribe a user from push notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    // Delete the subscription
    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
        endpoint,
      },
    });

    console.log(`🔕 Push subscription removed for user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: "Push subscription removed successfully",
    });
  } catch (error) {
    console.error("Error removing push subscription:", error);
    return NextResponse.json(
      { error: "Failed to remove push subscription" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/push/subscribe
 * Check if user has push subscription
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        endpoint: true,
        userAgent: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      hasSubscription: subscriptions.length > 0,
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        endpoint: sub.endpoint.substring(0, 50) + "...",
        userAgent: sub.userAgent,
        createdAt: sub.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error checking push subscription:", error);
    return NextResponse.json(
      { error: "Failed to check push subscription" },
      { status: 500 }
    );
  }
}
