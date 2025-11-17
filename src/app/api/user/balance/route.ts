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
        portfolio: true,
        paperPortfolio: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user doesn't have a portfolio, create one
    let realBalance = 0;
    if (!user.Portfolio) {
      const newPortfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          balance: 0,
          assets: [],
        },
      });
      realBalance = 0;
    } else {
      realBalance = Number(user.Portfolio.balance);
    }

    // If user doesn't have a paper portfolio, create one
    let practiceBalance = 785440.0;
    if (!user.paperPortfolio) {
      const newPaperPortfolio = await prisma.paperPortfolio.create({
        data: {
          userId: user.id,
          balance: 785440.0,
          assets: [],
        },
      });
      practiceBalance = 785440.0;
    } else {
      practiceBalance = Number(user.paperPortfolio.balance);
    }

    return NextResponse.json({
      realBalance,
      practiceBalance,
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
