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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "30"; // 7, 30, 90 days
    const days = Math.min(Math.max(parseInt(range) || 30, 1), 365);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const earnings = await prisma.miningEarning.findMany({
      where: { userId: session.user.id, date: { gte: since } },
      orderBy: { date: "desc" },
      include: {
        MiningContract: { select: { planName: true, coin: true } },
      },
    });

    // Aggregate totals
    const totalAgg = await prisma.miningEarning.aggregate({
      where: { userId: session.user.id },
      _sum: { amount: true, amountUsd: true },
    });

    // Group by day for chart
    const grouped: Record<string, { amount: number; amountUsd: number }> = {};
    for (const e of earnings) {
      const key = e.date.toISOString().split("T")[0];
      if (!grouped[key]) grouped[key] = { amount: 0, amountUsd: 0 };
      grouped[key].amount += Number(e.amount);
      grouped[key].amountUsd += Number(e.amountUsd ?? 0);
    }

    const chartData = Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, values]) => ({ date, ...values }));

    return NextResponse.json({
      earnings,
      chartData,
      totalEarned: totalAgg._sum.amount ?? 0,
      totalEarnedUsd: totalAgg._sum.amountUsd ?? 0,
    });
  } catch (error) {
    console.error("[mining/earnings GET] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
