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

    // Fetch deposits where cryptoCurrency or targetAsset matches symbol
    const deposits = await prisma.deposit.findMany({
      where: {
        userId,
        OR: [
          { cryptoCurrency: { equals: symbol } },
          { targetAsset: { equals: symbol } },
        ],
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
      ...deposits.map((d) => {
        // Get cryptoAmount from field or metadata
        const metadata = d.metadata as {
          cryptoAmount?: number;
          fiatAmount?: number;
        } | null;
        const cryptoAmt = d.cryptoAmount
          ? Number(d.cryptoAmount)
          : metadata?.cryptoAmount || 0;
        const fiatAmt = metadata?.fiatAmount || Number(d.amount || 0);

        return {
          id: d.id,
          type: "deposit",
          symbol: d.cryptoCurrency || d.currency,
          cryptoCurrency: d.cryptoCurrency,
          amount: cryptoAmt,
          price: fiatAmt, // Use fiat amount for the value display
          fiatValue: fiatAmt,
          date: d.createdAt,
          status: d.status.toLowerCase(),
          source: "deposit",
          hash: d.transactionHash,
          confirmations: d.confirmations,
          maxConfirmations: 6,
          method: d.method,
        };
      }),
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
