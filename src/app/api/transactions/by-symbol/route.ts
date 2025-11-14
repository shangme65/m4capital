import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const symbol = (searchParams.get("symbol") || "").toUpperCase();
    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Fetch trades where symbol contains the provided symbol (e.g., "BTC" in "BTC/USD")
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        symbol: {
          contains: symbol,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Fetch deposits where cryptoCurrency matches symbol (if field exists)
    const deposits = await prisma.deposit.findMany({
      where: {
        userId,
        cryptoCurrency: { equals: symbol },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Fetch withdrawals where currency matches symbol
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        userId,
        currency: { equals: symbol },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Normalize into a common format
    const normalized = [
      ...trades.map((t) => ({
        id: t.id,
        type: t.side.toLowerCase(),
        symbol: t.symbol,
        amount: Number(t.quantity),
        price: Number(t.entryPrice),
        date: t.createdAt,
        status: t.status.toLowerCase(),
        source: "trade",
      })),
      ...deposits.map((d) => ({
        id: d.id,
        type: "deposit",
        symbol: d.cryptoCurrency || d.currency,
        amount: Number(d.cryptoAmount || 0),
        price: d.paymentAmount
          ? Number(d.paymentAmount)
          : Number(d.amount || 0),
        date: d.createdAt,
        status: d.status.toLowerCase(),
        source: "deposit",
      })),
      ...withdrawals.map((w) => ({
        id: w.id,
        type: "withdrawal",
        symbol: w.currency,
        amount: Number(w.amount),
        price: Number(w.amount),
        date: w.createdAt,
        status: w.status.toLowerCase(),
        source: "withdrawal",
      })),
    ];

    // Sort by date desc
    normalized.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ history: normalized });
  } catch (error) {
    console.error("Error fetching transactions by symbol:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
