import { generateId } from "@/lib/generate-id";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

interface SellCryptoRequest {
  symbol: string; // e.g., "BTC", "ETH"
  amount: number; // Amount of crypto to sell
  price: number; // Current price per unit
}

interface Asset {
  symbol: string;
  amount: number;
  name?: string;
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

    const body: SellCryptoRequest = await request.json();
    const { symbol, amount, price } = body;

    // Validate required fields
    if (!symbol || !amount || !price) {
      return NextResponse.json(
        { error: "Missing required fields: symbol, amount, price" },
        { status: 400 }
      );
    }

    // Calculate total value in USD
    const totalValue = amount * price;
    const fee = totalValue * 0.015; // 1.5% fee
    const netReceived = totalValue - fee;

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.Portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    const portfolio = user.Portfolio;

    // Parse current assets with proper typing
    const currentAssets: Asset[] = Array.isArray(portfolio.assets)
      ? (portfolio.assets as unknown as Asset[])
      : [];

    // Find the asset
    const assetIndex = currentAssets.findIndex((a) => a.symbol === symbol);

    if (assetIndex === -1) {
      return NextResponse.json(
        { error: `You don't own any ${symbol}` },
        { status: 400 }
      );
    }

    const currentAsset: Asset = currentAssets[assetIndex];

    // Check if user has enough
    if (currentAsset.amount < amount) {
      return NextResponse.json(
        {
          error: `Insufficient ${symbol}. You have ${currentAsset.amount} but tried to sell ${amount}`,
        },
        { status: 400 }
      );
    }

    // Update assets array
    let updatedAssets: Asset[];
    if (currentAsset.amount === amount) {
      // Remove asset completely if selling all
      updatedAssets = currentAssets.filter((a) => a.symbol !== symbol);
    } else {
      // Reduce amount
      updatedAssets = currentAssets.map((a) =>
        a.symbol === symbol ? { ...a, amount: a.amount - amount } : a
      );
    }

    // Update portfolio - remove crypto and add fiat balance
    const newBalance = new Decimal(portfolio.balance).plus(netReceived);

    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        balance: newBalance,
        assets: updatedAssets as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully sold ${amount} ${symbol}`,
      totalValue,
      fee,
      netReceived,
      newBalance: parseFloat(newBalance.toString()),
    });
  } catch (error) {
    console.error("Error selling crypto:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
