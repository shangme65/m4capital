import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch real traderoom trading activities from transactions
    // This retrieves actual BUY/SELL trades made in the traderoom
    const activities = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: {
          in: ["BUY", "SELL"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Last 50 activities
      select: {
        id: true,
        type: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        metadata: true,
      },
    });

    // Format activities for frontend
    const formattedActivities = activities.map((activity) => {
      const metadata = activity.metadata as any;
      return {
        id: activity.id,
        type: activity.type,
        symbol: metadata?.symbol || activity.currency,
        amount: activity.amount,
        quantity: metadata?.quantity || 0,
        price: metadata?.price || 0,
        timestamp: activity.createdAt,
        status: activity.status,
      };
    });

    return NextResponse.json({
      activities: formattedActivities,
      total: formattedActivities.length,
    });
  } catch (error) {
    console.error("Error fetching traderoom activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
