import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Mark this route as dynamic to prevent static generation attempts
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Portfolio API endpoint called");
    const session = await getServerSession(authOptions);

    console.log(
      "🔐 Session:",
      session ? `User: ${session.user?.email}` : "No session"
    );

    if (!session?.user?.email) {
      console.error("❌ No authentication - session:", session);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("🔍 Looking up user:", session.user.email);

    // Find user and their portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        portfolio: true,
      },
    });

    console.log("👤 User found:", user ? `ID: ${user.id}` : "Not found");
    console.log("💼 Portfolio exists:", user?.portfolio ? "Yes" : "No");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create portfolio if it doesn't exist
    let portfolio = user.portfolio;
    if (!portfolio) {
      console.log("📝 Creating new portfolio for user:", user.id);
      portfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          balance: 0.0,
          assets: [],
        },
      });
    }

    // Fetch deposits and withdrawals separately to avoid schema relation issues
    // Query by portfolioId (not userId) to match current schema
    const deposits = await prisma.deposit.findMany({
      where: {
        portfolioId: portfolio.id,
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        portfolioId: portfolio.id,
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Parse assets JSON
    const assets = Array.isArray(portfolio.assets) ? portfolio.assets : [];

    // Calculate portfolio value (this would integrate with real-time crypto prices)
    const portfolioValue = parseFloat(portfolio.balance.toString());

    // Return portfolio data
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
      },
      portfolio: {
        balance: portfolioValue,
        assets: assets,
        recentDeposits: deposits.map((d) => ({
          id: d.id,
          amount: parseFloat(d.amount.toString()),
          currency: d.currency,
          status: d.status,
          createdAt: d.createdAt,
        })),
        recentWithdrawals: withdrawals.map((w) => ({
          id: w.id,
          amount: parseFloat(w.amount.toString()),
          currency: w.currency,
          status: w.status,
          createdAt: w.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Portfolio API error:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Handle specific Prisma/database errors
    if (
      error instanceof Error &&
      error.message.includes("Can't reach database")
    ) {
      return NextResponse.json(
        { error: "Database connection issue. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
