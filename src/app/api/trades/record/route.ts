import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

interface TradeRecordRequest {
  symbol: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  commission?: number;
  leverage?: number;
  closedAt?: string; // ISO timestamp
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: TradeRecordRequest = await request.json();
    const {
      symbol,
      side,
      entryPrice,
      exitPrice,
      quantity,
      commission = 0,
      leverage = 1,
      closedAt,
    } = body;

    // Validate required fields
    if (
      !symbol ||
      !side ||
      entryPrice === undefined ||
      exitPrice === undefined ||
      quantity === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: symbol, side, entryPrice, exitPrice, quantity",
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create portfolio if it doesn't exist
    let portfolio = user.portfolio;
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          balance: 0.0,
          assets: [],
        },
      });
    }

    // Calculate profit/loss
    // For BUY: profit = (exitPrice - entryPrice) * quantity * leverage - commission
    // For SELL: profit = (entryPrice - exitPrice) * quantity * leverage - commission
    const priceChange =
      side === "BUY" ? exitPrice - entryPrice : entryPrice - exitPrice;

    const profit = priceChange * quantity * leverage - commission;

    // Use transaction to atomically record trade and update balance
    const [trade, updatedPortfolio] = await prisma.$transaction([
      prisma.trade.create({
        data: {
          portfolioId: portfolio.id,
          userId: user.id,
          symbol,
          side,
          entryPrice: new Decimal(entryPrice),
          exitPrice: new Decimal(exitPrice),
          quantity: new Decimal(quantity),
          profit: new Decimal(profit),
          commission: new Decimal(commission),
          leverage: leverage,
          closedAt: closedAt ? new Date(closedAt) : new Date(),
        },
      }),
      prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: {
            increment: new Decimal(profit),
          },
        },
      }),
    ]);

    console.log(
      `✅ Trade recorded: ${side} ${quantity} ${symbol} | Profit: $${profit.toFixed(
        2
      )} | New balance: $${parseFloat(updatedPortfolio.balance.toString())}`
    );

    return NextResponse.json({
      success: true,
      trade: {
        id: trade.id,
        symbol: trade.symbol,
        side: trade.side,
        profit: parseFloat(trade.profit.toString()),
        closedAt: trade.closedAt,
      },
      portfolio: {
        balance: parseFloat(updatedPortfolio.balance.toString()),
      },
    });
  } catch (error) {
    console.error("❌ Trade recording error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to record trade",
      },
      { status: 500 }
    );
  }
}
