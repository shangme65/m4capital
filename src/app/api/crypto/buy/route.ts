import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

interface BuyCryptoRequest {
  symbol: string; // e.g., "BTC", "ETH"
  amount: number; // Amount of crypto to buy
  price: number; // Current price per unit
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

    const body: BuyCryptoRequest = await request.json();
    const { symbol, amount, price } = body;

    // Validate required fields
    if (!symbol || !amount || !price) {
      return NextResponse.json(
        { error: "Missing required fields: symbol, amount, price" },
        { status: 400 }
      );
    }

    // Calculate total cost in USD
    const totalCost = amount * price;

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create portfolio if it doesn't exist
    let portfolio = user.Portfolio;
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          balance: 0.0,
          assets: [],
        },
      });
    }

    const currentBalance = parseFloat(portfolio.balance.toString());

    // Check if user has enough balance
    if (currentBalance < totalCost) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          required: totalCost,
          available: currentBalance,
        },
        { status: 400 }
      );
    }

    // Update portfolio: deduct USD balance and add crypto asset
    const assets = portfolio.assets as any[];
    const existingAssetIndex = assets.findIndex((a) => a.symbol === symbol);

    let updatedAssets;
    if (existingAssetIndex >= 0) {
      // Add to existing asset
      updatedAssets = assets.map((asset, index) =>
        index === existingAssetIndex
          ? { ...asset, amount: asset.amount + amount }
          : asset
      );
    } else {
      // Add new asset
      updatedAssets = [...assets, { symbol, amount }];
    }

    // Use transaction to atomically update portfolio and create trade record
    const [updatedPortfolio, trade] = await prisma.$transaction([
      prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: {
            decrement: new Decimal(totalCost),
          },
          assets: updatedAssets,
        },
      }),
      prisma.trade.create({
        data: {
          userId: user.id,
          symbol: symbol,
          side: "BUY",
          entryPrice: new Decimal(price),
          quantity: new Decimal(amount),
          profit: new Decimal(0),
          commission: new Decimal(0),
          status: "CLOSED",
          openedAt: new Date(),
          closedAt: new Date(),
          metadata: {
            method: "USD_BALANCE",
            cryptoSymbol: symbol,
            cryptoAmount: amount,
            pricePerUnit: price,
            totalCost: totalCost,
            purchaseType: "SPOT",
          },
        },
      }),
    ]);

    console.log(
      `✅ Crypto purchase: ${amount} ${symbol} for $${totalCost.toFixed(
        2
      )} | New balance: $${parseFloat(updatedPortfolio.balance.toString())}`
    );

    return NextResponse.json({
      success: true,
      trade: {
        id: trade.id,
        symbol,
        amount,
        price,
        totalCost,
        status: trade.status,
      },
      portfolio: {
        balance: parseFloat(updatedPortfolio.balance.toString()),
        assets: updatedPortfolio.assets,
      },
    });
  } catch (error) {
    console.error("❌ Crypto purchase error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to purchase crypto",
      },
      { status: 500 }
    );
  }
}
