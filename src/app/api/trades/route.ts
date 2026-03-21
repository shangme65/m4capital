import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's trades, ordered by most recent first
    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 trades
    });

    // Transform trades to match expected format
    const formattedTrades = trades.map((trade) => {
      const entryPrice = Number(trade.entryPrice);
      const exitPrice = trade.exitPrice ? Number(trade.exitPrice) : entryPrice;
      const profit = Number(trade.profit);
      const amount = Number(trade.quantity);
      
      // Determine if win or loss based on profit
      const isWin = profit > 0;
      
      // Determine direction: check metadata first, fallback to side
      const metadataObj = (trade.metadata as any) || {};
      const direction = metadataObj.direction 
        ? metadataObj.direction.toUpperCase() 
        : (trade.side === "BUY" ? "HIGHER" : "LOWER");

      return {
        id: trade.id,
        symbol: trade.symbol,
        direction: direction,
        amount: amount,
        entryPrice: entryPrice,
        exitPrice: exitPrice,
        entryTime: trade.openedAt,
        exitTime: trade.closedAt,
        status: isWin ? "WIN" : "LOSS",
        profit: profit,
      };
    });

    return NextResponse.json({
      success: true,
      trades: formattedTrades,
    });
  } catch (error) {
    console.error("Fetch trades error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}
