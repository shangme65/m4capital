import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

interface ConvertCryptoRequest {
  fromAsset: string; // e.g., "BTC"
  toAsset: string; // e.g., "ETH"
  amount: number; // Amount of fromAsset to convert
  rate: number; // Conversion rate (1 fromAsset = X toAsset)
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

    const body: ConvertCryptoRequest = await request.json();
    const { fromAsset, toAsset, amount, rate } = body;

    // Validate required fields
    if (!fromAsset || !toAsset || !amount || !rate) {
      return NextResponse.json(
        { error: "Missing required fields: fromAsset, toAsset, amount, rate" },
        { status: 400 }
      );
    }

    if (fromAsset === toAsset) {
      return NextResponse.json(
        { error: "Cannot convert asset to itself" },
        { status: 400 }
      );
    }

    // Calculate conversion
    const conversionFee = 0.5; // 0.5% fee
    const feeAmount = amount * rate * (conversionFee / 100);
    const receiveAmount = amount * rate - feeAmount;

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

    // Find the fromAsset
    const fromAssetIndex = currentAssets.findIndex(
      (a) => a.symbol === fromAsset
    );

    if (fromAssetIndex === -1) {
      return NextResponse.json(
        { error: `You don't own any ${fromAsset}` },
        { status: 400 }
      );
    }

    const currentFromAsset: Asset = currentAssets[fromAssetIndex];

    // Check if user has enough
    if (currentFromAsset.amount < amount) {
      return NextResponse.json(
        {
          error: `Insufficient ${fromAsset}. You have ${currentFromAsset.amount} but tried to convert ${amount}`,
        },
        { status: 400 }
      );
    }

    // Update assets array - remove fromAsset
    let updatedAssets: Asset[];
    if (currentFromAsset.amount === amount) {
      // Remove fromAsset completely if converting all
      updatedAssets = currentAssets.filter((a) => a.symbol !== fromAsset);
    } else {
      // Reduce fromAsset amount
      updatedAssets = currentAssets.map((a) =>
        a.symbol === fromAsset ? { ...a, amount: a.amount - amount } : a
      );
    }

    // Add toAsset
    const toAssetIndex = updatedAssets.findIndex((a) => a.symbol === toAsset);
    if (toAssetIndex === -1) {
      // Add new asset
      updatedAssets.push({
        symbol: toAsset,
        amount: receiveAmount,
        name: toAsset,
      });
    } else {
      // Increase existing asset
      updatedAssets = updatedAssets.map((a) =>
        a.symbol === toAsset ? { ...a, amount: a.amount + receiveAmount } : a
      );
    }

    // Update portfolio
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        assets: updatedAssets as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully converted ${amount} ${fromAsset} to ${receiveAmount.toFixed(
        8
      )} ${toAsset}`,
      fromAsset,
      toAsset,
      fromAmount: amount,
      receiveAmount,
      fee: feeAmount,
      rate,
    });
  } catch (error) {
    console.error("Error converting crypto:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
