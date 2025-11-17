import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { symbol, name } = body;

    if (!symbol || !name) {
      return NextResponse.json(
        { error: "Symbol and name are required" },
        { status: 400 }
      );
    }

    // Find user and their portfolio
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

    // Get current assets
    const currentAssets = Array.isArray(portfolio.assets)
      ? portfolio.assets
      : [];

    // Check if asset already exists
    const assetExists = currentAssets.some(
      (asset: any) => asset.symbol === symbol
    );

    if (assetExists) {
      return NextResponse.json(
        { error: "Asset already exists in portfolio" },
        { status: 400 }
      );
    }

    // Add new asset with zero balance
    const newAsset = {
      symbol,
      name,
      amount: 0,
      averagePrice: 0,
      totalInvested: 0,
    };

    const updatedAssets = [...currentAssets, newAsset];

    // Update portfolio with new asset
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { assets: updatedAssets },
    });

    return NextResponse.json({
      success: true,
      message: "Asset added successfully",
      asset: newAsset,
    });
  } catch (error) {
    console.error("Error adding asset:", error);
    return NextResponse.json({ error: "Failed to add asset" }, { status: 500 });
  }
}
