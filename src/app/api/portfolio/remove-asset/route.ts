import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { symbol } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    // Find user and their portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { portfolio: true },
    });

    if (!user || !user.portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    // Get current assets
    const currentAssets = Array.isArray(user.portfolio.assets)
      ? user.portfolio.assets
      : [];

    // Find the asset
    const asset = currentAssets.find((a: any) => a.symbol === symbol) as
      | { symbol: string; amount: number; name: string }
      | undefined;

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found in portfolio" },
        { status: 404 }
      );
    }

    // Check if asset has balance
    if (asset.amount > 0) {
      return NextResponse.json(
        {
          error: `Cannot remove ${symbol} because you have a balance of ${asset.amount}. Please sell or transfer your holdings first.`,
        },
        { status: 400 }
      );
    }

    // Remove asset from portfolio
    const updatedAssets = currentAssets.filter((a: any) => a.symbol !== symbol);

    // Update portfolio
    await prisma.portfolio.update({
      where: { id: user.portfolio.id },
      data: { assets: updatedAssets },
    });

    return NextResponse.json({
      success: true,
      message: "Asset removed successfully",
    });
  } catch (error) {
    console.error("Error removing asset:", error);
    return NextResponse.json(
      { error: "Failed to remove asset" },
      { status: 500 }
    );
  }
}
