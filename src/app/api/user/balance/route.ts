import { generateId } from "@/lib/generate-id";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        Portfolio: true,
        PaperPortfolio: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user doesn't have a portfolio, create one
    let realBalance = 0;
    let traderoomBalance = 0;
    let balanceCurrency = user.preferredCurrency || "USD";
    if (!user.Portfolio) {
      const newPortfolio = await prisma.portfolio.create({
        data: {
          id: generateId(),
          userId: user.id,
          balance: 0,
          traderoomBalance: 0,
          assets: [],
        },
      });
      realBalance = 0;
      traderoomBalance = 0;
    } else {
      realBalance = Number(user.Portfolio.balance);
      traderoomBalance = Number(user.Portfolio.traderoomBalance || 0);
      balanceCurrency = user.Portfolio.balanceCurrency || user.preferredCurrency || "USD";
    }

    // If user doesn't have a paper portfolio, create one
    let practiceBalance = 10000.0;
    if (!user.PaperPortfolio) {
      const newPaperPortfolio = await prisma.paperPortfolio.create({
        data: {
          id: generateId(),
          userId: user.id,
          balance: 10000.0,
          assets: [],
          updatedAt: new Date(),
        },
      });
      practiceBalance = 10000.0;
    } else {
      practiceBalance = Number(user.PaperPortfolio.balance);
    }

    return NextResponse.json({
      realBalance,
      traderoomBalance,
      practiceBalance,
      balanceCurrency,
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Error fetching user balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch balance" },
      { status: 500 }
    );
  }
}
