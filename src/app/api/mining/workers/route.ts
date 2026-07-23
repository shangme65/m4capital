import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Workers are simulated per contract (1 worker per TH/s block)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contracts = await prisma.miningContract.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
    });

    // Generate deterministic workers based on contracts
    const workers = contracts.flatMap((c, ci) => {
      const workerCount = Math.min(Math.ceil(Number(c.hashrateValue) / 50), 20);
      return Array.from({ length: workerCount }, (_, i) => ({
        id: `${c.id}-w${i + 1}`,
        name: `${c.planName}-W${String(i + 1).padStart(2, "0")}`,
        contractId: c.id,
        planName: c.planName,
        status: i === 0 && ci === 0 ? "offline" : "online",
        hashrate: `${(Number(c.hashrateValue) / workerCount).toFixed(2)} ${c.hashrateUnit}`,
        temperature: 38 + (i % 4) * 3,
        efficiency: `${(35 + (i % 6)).toFixed(1)} J/TH`,
        uptime: i === 0 && ci === 0 ? "94.2%" : `${97 + (i % 3)}.${i % 10}%`,
        lastSeen: i === 0 && ci === 0 ? "5 min ago" : "Just now",
        algorithm: c.algorithm,
        coin: c.coin,
      }));
    });

    const online = workers.filter((w) => w.status === "online").length;
    const offline = workers.filter((w) => w.status === "offline").length;

    return NextResponse.json({
      workers,
      online,
      offline,
      total: workers.length,
    });
  } catch (error) {
    console.error("[mining/workers GET] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
