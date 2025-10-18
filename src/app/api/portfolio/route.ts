import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find user and their portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        portfolio: {
          include: {
            deposits: {
              where: { status: "COMPLETED" },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            withdrawals: {
              where: { status: "COMPLETED" },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
      },
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
        include: {
          deposits: {
            where: { status: "COMPLETED" },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          withdrawals: {
            where: { status: "COMPLETED" },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });
    }

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
        recentDeposits: portfolio.deposits.map((d) => ({
          id: d.id,
          amount: parseFloat(d.amount.toString()),
          currency: d.currency,
          status: d.status,
          createdAt: d.createdAt,
        })),
        recentWithdrawals: portfolio.withdrawals.map((w) => ({
          id: w.id,
          amount: parseFloat(w.amount.toString()),
          currency: w.currency,
          status: w.status,
          createdAt: w.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Portfolio API error:", error);

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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
