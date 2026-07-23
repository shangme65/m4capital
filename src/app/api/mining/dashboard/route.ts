import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Get active contracts
    const contracts = await prisma.miningContract.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    // Get total earnings (all time)
    const earningsAgg = await prisma.miningEarning.aggregate({
      where: { userId },
      _sum: { amount: true, amountUsd: true },
    });

    // Get today's earnings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEarnings = await prisma.miningEarning.aggregate({
      where: { userId, date: { gte: todayStart } },
      _sum: { amount: true, amountUsd: true },
    });

    // Get this month's earnings
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEarnings = await prisma.miningEarning.aggregate({
      where: { userId, date: { gte: monthStart } },
      _sum: { amount: true, amountUsd: true },
    });

    // Get pending withdrawals
    const pendingWithdrawals = await prisma.miningWithdrawal.aggregate({
      where: { userId, status: { in: ["PENDING", "PROCESSING"] } },
      _sum: { amount: true },
      _count: true,
    });

    // Total hashrate from active contracts
    const totalHashrate = contracts.reduce(
      (sum, c) => sum + Number(c.hashrateValue),
      0,
    );
    const hashrateUnit = contracts[0]?.hashrateUnit ?? "TH/s";

    // Last 7 days earnings for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEarnings = await prisma.miningEarning.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      activeContracts: contracts.length,
      totalHashrate,
      hashrateUnit,
      totalEarned: earningsAgg._sum.amount ?? 0,
      totalEarnedUsd: earningsAgg._sum.amountUsd ?? 0,
      todayEarned: todayEarnings._sum.amount ?? 0,
      todayEarnedUsd: todayEarnings._sum.amountUsd ?? 0,
      monthEarned: monthEarnings._sum.amount ?? 0,
      monthEarnedUsd: monthEarnings._sum.amountUsd ?? 0,
      pendingWithdrawalAmount: pendingWithdrawals._sum.amount ?? 0,
      pendingWithdrawalCount: pendingWithdrawals._count,
      contracts,
      recentEarnings,
    });
  } catch (error) {
    console.error("[mining/dashboard] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
