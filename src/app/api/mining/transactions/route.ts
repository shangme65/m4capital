import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/mining/transactions — returns all mining tx types combined
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "all" | "earnings" | "withdrawals" | "purchases"

    const userId = session.user.id;

    // Fetch all three types in parallel
    const [earnings, withdrawals, contracts] = await Promise.all([
      !type || type === "all" || type === "earnings"
        ? prisma.miningEarning.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 50,
          })
        : [],
      !type || type === "all" || type === "withdrawals"
        ? prisma.miningWithdrawal.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
          })
        : [],
      !type || type === "all" || type === "purchases"
        ? prisma.miningContract.findMany({
            where: { userId, status: { not: "CANCELLED" } },
            orderBy: { createdAt: "desc" },
            take: 50,
          })
        : [],
    ]);

    // Combine into unified transaction list
    const txList = [
      ...earnings.map((e) => ({
        id: e.id,
        type: "EARNING",
        amount: Number(e.amount),
        currency: e.currency,
        amountUsd: Number(e.amountUsd ?? 0),
        status: e.status,
        date: e.date,
        description: "Mining Payout",
        direction: "IN",
      })),
      ...withdrawals.map((w) => ({
        id: w.id,
        type: "WITHDRAWAL",
        amount: Number(w.amount),
        currency: w.currency,
        amountUsd: Number(w.amountUsd ?? 0),
        status: w.status,
        date: w.createdAt,
        description:
          w.destinationType === "INTERNAL"
            ? "Transfer to Trading Wallet"
            : `Withdrawal to ${w.walletAddress?.slice(0, 8) ?? "Wallet"}…`,
        direction: "OUT",
      })),
      ...contracts.map((c) => ({
        id: c.id,
        type: "PURCHASE",
        amount: Number(c.price),
        currency: c.currency,
        amountUsd: Number(c.price),
        status:
          c.status === "ACTIVE"
            ? "COMPLETED"
            : c.status === "PENDING"
              ? "PENDING"
              : c.status,
        date: c.createdAt,
        description: `${c.planName} Plan Purchase`,
        direction: "OUT",
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ transactions: txList });
  } catch (error) {
    console.error("[mining/transactions GET] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
