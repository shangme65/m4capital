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

    // Fetch real traderoom trading activities from Trade model
    // This retrieves actual BUY/SELL trades made in the traderoom
    const activities = await prisma.trade.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Last 50 activities
      select: {
        id: true,
        side: true,
        symbol: true,
        quantity: true,
        entryPrice: true,
        profit: true,
        status: true,
        createdAt: true,
        openedAt: true,
        metadata: true,
      },
    });

    // Format activities for frontend
    const formattedActivities = activities.map((activity) => {
      const metadata = activity.metadata as any;
      const quantity = parseFloat(activity.quantity.toString());
      const entryPrice = parseFloat(activity.entryPrice.toString());

      return {
        id: activity.id,
        type: activity.side, // BUY or SELL
        symbol: activity.symbol,
        amount: quantity * entryPrice,
        quantity: quantity,
        price: entryPrice,
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
