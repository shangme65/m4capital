import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";
import { MINING_PLANS } from "@/app/api/mining/purchase/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const contracts = await prisma.miningContract.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { MiningEarning: true } },
      },
    });
    return NextResponse.json({ contracts });
  } catch (error) {
    console.error("[mining/contracts GET] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, coin = "BTC" } = body;

    if (!planId || !MINING_PLANS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = MINING_PLANS[planId];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const contract = await prisma.miningContract.create({
      data: {
        id: generateId(),
        userId: session.user.id,
        planName: plan.name,
        coin,
        algorithm: plan.algorithm,
        hashrate: plan.hashrate,
        hashrateValue: plan.hashrateValue,
        hashrateUnit: plan.hashrateUnit,
        price: plan.price,
        currency: "USD",
        duration: plan.duration,
        status: "ACTIVE",
        endDate,
      },
    });

    return NextResponse.json({ contract, success: true });
  } catch (error) {
    console.error("[mining/contracts POST] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
