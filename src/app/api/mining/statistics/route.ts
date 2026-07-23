import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get("range") ?? "30");

    const since = new Date();
    since.setDate(since.getDate() - range);

    // Earnings over time
    const earningsOverTime = await prisma.miningEarning.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "asc" },
    });

    // Earnings by contract/coin
    const earningsByCoin = await prisma.miningEarning.groupBy({
      by: ["currency"],
      where: { userId },
      _sum: { amount: true, amountUsd: true },
    });

    // Contract stats
    const contractStats = await prisma.miningContract.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    });

    // Total withdrawals
    const withdrawalStats = await prisma.miningWithdrawal.groupBy({
      by: ["status"],
      where: { userId },
      _sum: { amount: true },
      _count: true,
    });

    // All-time totals
    const allTimeTotals = await prisma.miningEarning.aggregate({
      where: { userId },
      _sum: { amount: true, amountUsd: true },
      _count: true,
    });

    // Best day
    const bestDay = await prisma.miningEarning.findFirst({
      where: { userId },
      orderBy: { amountUsd: "desc" },
      select: { date: true, amount: true, amountUsd: true, currency: true },
    });

    return NextResponse.json({
      earningsOverTime,
      earningsByCoin,
      contractStats,
      withdrawalStats,
      allTimeTotals: {
        amount: allTimeTotals._sum.amount ?? 0,
        amountUsd: allTimeTotals._sum.amountUsd ?? 0,
        count: allTimeTotals._count,
      },
      bestDay,
    });
  } catch (error) {
    console.error("[mining/statistics GET] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
