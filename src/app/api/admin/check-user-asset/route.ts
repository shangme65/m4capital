import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin access
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const asset = searchParams.get("asset");

    if (!userId || !asset) {
      return NextResponse.json(
        { error: "Missing userId or asset parameter" },
        { status: 400 }
      );
    }

    // Get user's portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      return NextResponse.json({
        hasAsset: false,
        message: "User has no portfolio yet",
      });
    }

    // Check if user has the specific asset
    const assets = Array.isArray(portfolio.assets) ? portfolio.assets : [];
    const hasAsset = assets.some((a: any) => a.symbol === asset);

    return NextResponse.json({
      hasAsset,
      message: hasAsset
        ? `User has ${asset} in their portfolio`
        : `User doesn't have ${asset} in their portfolio`,
    });
  } catch (error) {
    console.error("Error checking user asset:", error);
    return NextResponse.json(
      { error: "Failed to check user asset" },
      { status: 500 }
    );
  }
}
