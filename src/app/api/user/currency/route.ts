import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CURRENCIES } from "@/lib/currencies";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/currency
 * Get user's preferred currency
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { preferredCurrency: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      currency: user.preferredCurrency || "USD",
    });
  } catch (error) {
    console.error("Get currency error:", error);
    return NextResponse.json(
      { error: "Failed to get currency preference" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/currency
 * Update user's preferred currency
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currency } = await req.json();

    // Validate currency code
    const validCurrencies = CURRENCIES.map((c) => c.code);
    if (!currency || !validCurrencies.includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency code" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { preferredCurrency: currency },
    });

    return NextResponse.json({
      success: true,
      message: "Currency preference updated",
      currency: user.preferredCurrency,
    });
  } catch (error) {
    console.error("Update currency error:", error);
    return NextResponse.json(
      { error: "Failed to update currency preference" },
      { status: 500 }
    );
  }
}
