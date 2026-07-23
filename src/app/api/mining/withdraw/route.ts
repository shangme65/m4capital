import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - list withdrawal history
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const withdrawals = await prisma.miningWithdrawal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error("[mining/withdraw GET] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - submit new withdrawal request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency, destinationType, walletAddress } = body;

    // Validate inputs
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!currency) {
      return NextResponse.json({ error: "Currency required" }, { status: 400 });
    }
    if (
      !destinationType ||
      !["EXTERNAL", "INTERNAL"].includes(destinationType)
    ) {
      return NextResponse.json(
        { error: "Invalid destination type" },
        { status: 400 },
      );
    }
    if (destinationType === "EXTERNAL" && !walletAddress?.trim()) {
      return NextResponse.json(
        { error: "Wallet address required for external withdrawal" },
        { status: 400 },
      );
    }

    // Basic wallet address length validation
    if (destinationType === "EXTERNAL" && walletAddress.trim().length < 10) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 },
      );
    }

    // Check user has enough earned (sum of all earnings minus completed withdrawals)
    const totalEarned = await prisma.miningEarning.aggregate({
      where: { userId: session.user.id, currency },
      _sum: { amount: true },
    });
    const totalWithdrawn = await prisma.miningWithdrawal.aggregate({
      where: {
        userId: session.user.id,
        currency,
        status: { in: ["PENDING", "PROCESSING", "COMPLETED"] },
      },
      _sum: { amount: true },
    });

    const available =
      Number(totalEarned._sum.amount ?? 0) -
      Number(totalWithdrawn._sum.amount ?? 0);

    if (Number(amount) > available) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Available: ${available.toFixed(8)} ${currency}`,
        },
        { status: 400 },
      );
    }

    // BTC price approx (for USD estimate - production would use real price)
    const BTC_PRICE = 60000;
    const amountUsd =
      currency === "BTC"
        ? Number(amount) * BTC_PRICE
        : currency === "ETH"
          ? Number(amount) * 3000
          : Number(amount);

    const withdrawal = await prisma.miningWithdrawal.create({
      data: {
        userId: session.user.id,
        amount: Number(amount),
        currency,
        amountUsd,
        walletAddress:
          destinationType === "EXTERNAL" ? walletAddress.trim() : null,
        destinationType,
        status: "PENDING",
        fee: 0,
      },
    });

    // If internal, add to user's portfolio balance
    if (destinationType === "INTERNAL") {
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId: session.user.id },
      });
      if (portfolio) {
        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { balance: { increment: amountUsd } },
        });
        // Mark as completed immediately for internal transfer
        await prisma.miningWithdrawal.update({
          where: { id: withdrawal.id },
          data: { status: "COMPLETED" },
        });
      }
    }

    // Create notification
    await prisma.notification.create({
      data: {
        id: `mw-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        userId: session.user.id,
        type: "INFO",
        title: "Mining Withdrawal Requested",
        message:
          destinationType === "INTERNAL"
            ? `${amount} ${currency} transferred to your trading wallet.`
            : `Withdrawal of ${amount} ${currency} to ${walletAddress?.slice(0, 12)}... is being processed.`,
        amount: amountUsd,
        asset: currency,
      },
    });

    return NextResponse.json({ withdrawal, success: true });
  } catch (error) {
    console.error("[mining/withdraw POST] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
