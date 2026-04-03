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
    // Exclude MANUAL_PROFIT trades - they should only appear in dashboard history
    const allTrades = await prisma.trade.findMany({
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
    
    // Filter out manual profit trades - they belong to traderoom, not crypto asset history
    const trades = allTrades.filter((t) => {
      const metadata = t.metadata as { type?: string } | null;
      return metadata?.type !== "MANUAL_PROFIT";
    });

    // Note: Deposits are intentionally excluded from asset history
    // They appear in the main dashboard history, not individual asset modals

    // Fetch withdrawals where currency matches symbol
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        userId,
        currency: { equals: symbol },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Fetch P2P transfers where the crypto asset matches (both sent and received)
    const sentTransfers = await prisma.p2PTransfer.findMany({
      where: {
        senderId: userId,
        currency: { equals: symbol, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { Receiver: { select: { name: true, email: true } } },
    });

    const receivedTransfers = await prisma.p2PTransfer.findMany({
      where: {
        receiverId: userId,
        currency: { equals: symbol, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { Sender: { select: { name: true, email: true } } },
    });

    // Normalize into a common format
    const normalized = [
      ...trades.map((t) => {
        // Check if this is a swap transaction from metadata
        const metadata = t.metadata as {
          type?: string;
          fromAsset?: string;
          toAsset?: string;
          fromAmount?: number;
          toAmount?: number;
          fromPriceUSD?: number;
          toPriceUSD?: number;
          fromValueUSD?: number;
          toValueUSD?: number;
          rate?: number;
          fee?: number;
        } | null;

        const isSwap = metadata?.type === "SWAP";

        if (isSwap) {
          // For swaps, determine if we're showing this in fromAsset or toAsset history
          const fromAsset = metadata?.fromAsset || "";
          const toAsset = metadata?.toAsset || "";
          const isFromAssetView =
            fromAsset.toUpperCase() === symbol.toUpperCase();

          return {
            id: t.id,
            type: "swap",
            symbol: t.symbol,
            amount: isFromAssetView
              ? Number(metadata?.fromAmount || t.quantity)
              : Number(metadata?.toAmount || t.quantity),
            price: Number(t.entryPrice),
            date: t.createdAt,
            status:
              t.status.toLowerCase() === "closed"
                ? "completed"
                : t.status.toLowerCase(),
            source: "trade",
            // Swap-specific fields
            isSwap: true,
            fromAsset,
            toAsset,
            fromAmount: metadata?.fromAmount || 0,
            toAmount: metadata?.toAmount || 0,
            fromPriceUSD: metadata?.fromPriceUSD || 0,
            toPriceUSD: metadata?.toPriceUSD || 0,
            fromValueUSD: metadata?.fromValueUSD || 0,
            toValueUSD: metadata?.toValueUSD || 0,
            swapRate: metadata?.rate || 0,
            fee: metadata?.fee || 0,
            isFromAssetView,
          };
        }

        // Regular buy/sell trade
        return {
          id: t.id,
          type: t.side.toLowerCase(),
          symbol: t.symbol,
          amount: Number(t.quantity),
          price: Number(t.entryPrice),
          date: t.createdAt,
          status:
            t.status.toLowerCase() === "closed"
              ? "completed"
              : t.status.toLowerCase(),
          source: "trade",
        };
      }),
      // Note: Deposits are excluded from asset history - they show in main dashboard
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
      // P2P transfers sent (crypto)
      ...sentTransfers.map((t) => {
        // Parse JSON metadata from description for crypto details
        let cryptoAmount = 0;
        let cryptoPrice = 0;
        let usdValue = Number(t.amount);

        try {
          const metadata = JSON.parse(t.description || "{}");
          if (metadata.type === "crypto" && metadata.cryptoAmount) {
            cryptoAmount = metadata.cryptoAmount;
            cryptoPrice = metadata.cryptoPrice || 0;
            usdValue = metadata.usdValue || Number(t.amount);
          }
        } catch {
          // Old format: "P2P Transfer of X BTC"
          const descMatch = t.description?.match(
            /P2P Transfer of ([\d.]+) [A-Z]+/
          );
          if (descMatch) {
            cryptoAmount = parseFloat(descMatch[1]);
          }
        }

        return {
          id: t.id,
          type: "send",
          symbol: t.currency,
          amount: cryptoAmount,
          price: cryptoPrice, // Price per unit at time of transfer
          fiatValue: usdValue, // Total USD value
          date: t.createdAt,
          status: t.status.toLowerCase(),
          source: "transfer",
          recipient: t.Receiver?.name || t.receiverEmail || "User",
          hash: t.transactionReference,
        };
      }),
      // P2P transfers received (crypto)
      ...receivedTransfers.map((t) => {
        // Parse JSON metadata from description for crypto details
        let cryptoAmount = 0;
        let cryptoPrice = 0;
        let usdValue = Number(t.amount);

        try {
          const metadata = JSON.parse(t.description || "{}");
          if (metadata.type === "crypto" && metadata.cryptoAmount) {
            cryptoAmount = metadata.cryptoAmount;
            cryptoPrice = metadata.cryptoPrice || 0;
            usdValue = metadata.usdValue || Number(t.amount);
          }
        } catch {
          // Old format: "P2P Transfer of X BTC"
          const descMatch = t.description?.match(
            /P2P Transfer of ([\d.]+) [A-Z]+/
          );
          if (descMatch) {
            cryptoAmount = parseFloat(descMatch[1]);
          }
        }

        return {
          id: t.id,
          type: "receive",
          symbol: t.currency,
          amount: cryptoAmount,
          price: cryptoPrice, // Price per unit at time of transfer
          fiatValue: usdValue, // Total USD value
          date: t.createdAt,
          status: t.status.toLowerCase(),
          source: "transfer",
          sender: t.Sender?.name || t.Sender?.email || "User",
          hash: t.transactionReference,
        };
      }),
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
