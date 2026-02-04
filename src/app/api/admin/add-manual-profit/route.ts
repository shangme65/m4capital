import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, asset, profitAmount } = await req.json();

    // Validate inputs
    if (!userId || !asset || !profitAmount) {
      return NextResponse.json(
        { error: "Missing required fields: userId, asset, profitAmount" },
        { status: 400 }
      );
    }

    const profit = parseFloat(profitAmount);
    if (isNaN(profit) || profit <= 0) {
      return NextResponse.json(
        { error: "Profit amount must be a positive number" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        preferredCurrency: true,
        Portfolio: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.Portfolio) {
      return NextResponse.json(
        { error: "User has no portfolio" },
        { status: 400 }
      );
    }

    // Create trade record (profit is stored in USD)
    const trade = await prisma.trade.create({
      data: {
        id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: asset,
        side: "BUY", // Manual profit is treated as a buy trade
        entryPrice: new Decimal(0), // No entry price for manual profits
        quantity: new Decimal(1), // Arbitrary quantity
        profit: new Decimal(profit), // Profit in USD
        status: "CLOSED", // Manual profits are already closed
        closedAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          type: "MANUAL_PROFIT",
          addedBy: session.user.id,
          addedAt: new Date().toISOString(),
        },
        User: {
          connect: { id: userId },
        },
      },
    });

    // Update portfolio traderoom balance (add profit in USD)
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: user.Portfolio.id },
      data: {
        traderoomBalance: {
          increment: new Decimal(profit),
        },
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        type: "TRADE",
        title: "Trade Profit Earned",
        message: `Congratulations! You earned a profit of $${profit.toFixed(
          2
        )} from ${asset} trade.`,
        amount: new Decimal(profit), // Store USD amount
        asset: user.preferredCurrency || "USD", // User's currency for display
        metadata: {
          tradeId: trade.id,
          asset: asset,
          profitUSD: profit,
          type: "MANUAL_PROFIT",
        },
      },
    });

    return NextResponse.json({
      success: true,
      trade: {
        id: trade.id,
        asset: asset,
        profit: profit,
        createdAt: trade.createdAt,
      },
      newTraderoomBalance: updatedPortfolio.traderoomBalance.toString(),
    });
  } catch (error) {
    console.error("Error adding manual profit:", error);
    return NextResponse.json(
      { error: "Failed to add manual profit" },
      { status: 500 }
    );
  }
}
