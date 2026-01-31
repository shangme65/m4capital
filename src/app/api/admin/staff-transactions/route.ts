import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is staff admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "STAFF_ADMIN" && user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ success: true, transactions: [] });
    }

    // Fetch deposits for assigned users
    const deposits = await prisma.deposit.findMany({
      where: {
        userId: { in: userIds },
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Fetch trades for assigned users
    const trades = await prisma.trade.findMany({
      where: {
        userId: { in: userIds },
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Transform deposits
    const depositTransactions = deposits.map((d) => ({
      id: d.id,
      type: "deposit",
      asset: d.targetAsset || d.cryptoCurrency || d.currency || "USD",
      amount: Number(d.amount),
      status: d.status?.toLowerCase() || "completed",
      timestamp: d.createdAt.toISOString(),
      userName: d.User?.name || "N/A",
      userEmail: d.User?.email || "N/A",
    }));

    // Transform trades
    const tradeTransactions = trades.map((t) => ({
      id: t.id,
      type: t.side === "BUY" ? "buy" : "sell",
      asset: t.symbol,
      amount: Number(t.quantity),
      status: t.status?.toLowerCase() || "closed",
      timestamp: t.createdAt.toISOString(),
      userName: t.User?.name || "N/A",
      userEmail: t.User?.email || "N/A",
    }));

    // Combine and sort by date
    const allTransactions = [...depositTransactions, ...tradeTransactions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      transactions: allTransactions.slice(0, 100),
    });
  } catch (error) {
    console.error("Error fetching staff transactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
