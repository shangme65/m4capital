import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/all-transactions
 * Fetch ALL platform transactions from all users (admin only)
 * Returns combined transaction history with user details
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN" && user?.role !== "STAFF_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all deposits from all users with user info
    const deposits = await prisma.deposit.findMany({
      orderBy: { createdAt: "desc" },
      take: 500, // Limit to last 500 transactions
      include: {
        Portfolio: true,
        User: true,
      },
    });

    // Fetch all withdrawals from all users with user info
    const withdrawals = await prisma.withdrawal.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        Portfolio: true,
        User: true,
      },
    });

    // Fetch all trades from all users with user info
    const trades = await prisma.trade.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        User: true,
      },
    });

    // Transform deposits into transaction format
    const depositTransactions = deposits.map((d) => ({
      id: d.id,
      type: "deposit" as const,
      asset: d.targetAsset || d.currency || "USD",
      amount: Number(d.amount),
      value: Number(d.amount),
      timestamp: d.createdAt.toISOString(),
      status: d.status?.toLowerCase() || "pending",
      fee: d.fee ? Number(d.fee) : 0,
      method: d.method || "Manual",
      description: d.targetAsset
        ? `${d.targetAsset} deposit`
        : "Balance deposit",
      date: d.createdAt,
      confirmations: d.confirmations || 0,
      maxConfirmations: 6,
      hash: d.transactionHash || undefined,
      network: d.targetAsset ? `${d.targetAsset} Network` : undefined,
      userName: d.User?.name || "Unknown User",
      userEmail: d.User?.email || "unknown@email.com",
      userId: d.User?.id || "",
      isManual: d.method?.toLowerCase().includes("manual") || false,
    }));

    // Transform withdrawals into transaction format
    const withdrawalTransactions = withdrawals.map((w) => ({
      id: w.id,
      type: "withdraw" as const,
      asset: w.currency || "USD",
      amount: Number(w.amount),
      value: Number(w.amount),
      timestamp: w.createdAt.toISOString(),
      status: w.status?.toLowerCase() || "pending",
      fee: w.fee ? Number(w.fee) : 0,
      method: w.method || "Bank Transfer",
      description: "Withdrawal",
      date: w.createdAt,
      userName: w.User?.name || "Unknown User",
      userEmail: w.User?.email || "unknown@email.com",
      userId: w.User?.id || "",
      isManual: w.method?.toLowerCase().includes("manual") || false,
    }));

    // Transform trades into transaction format
    const tradeTransactions = trades.map((t) => ({
      id: t.id,
      type:
        t.side?.toLowerCase() === "buy" ? ("buy" as const) : ("sell" as const),
      asset: t.symbol || "Unknown",
      amount: Number(t.quantity),
      value: Number(t.entryPrice) * Number(t.quantity),
      timestamp: t.createdAt.toISOString(),
      status:
        t.status === "CLOSED" ? ("completed" as const) : ("pending" as const),
      fee: Number(t.commission) || 0,
      method: "Trade",
      description: `${t.side} ${t.symbol}`,
      date: t.createdAt,
      price: Number(t.entryPrice),
      profit: Number(t.profit),
      userName: t.User?.name || "Unknown User",
      userEmail: t.User?.email || "unknown@email.com",
      userId: t.User?.id || "",
      isManual: false,
    }));

    // Combine all transactions and sort by date
    const allTransactions = [
      ...depositTransactions,
      ...withdrawalTransactions,
      ...tradeTransactions,
    ].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      transactions: allTransactions,
      total: allTransactions.length,
      stats: {
        totalDeposits: depositTransactions.length,
        totalWithdrawals: withdrawalTransactions.length,
        totalTrades: tradeTransactions.length,
        manualTransactions: allTransactions.filter((t) => t.isManual).length,
      },
    });
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
