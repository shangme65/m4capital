import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear old failed/expired deposits older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedDeposits = await prisma.deposit.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        status: {
          in: ["FAILED", "EXPIRED"],
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Old logs cleared successfully",
      deleted: {
        deposits: deletedDeposits.count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error clearing logs:", error);
    return NextResponse.json(
      { error: "Failed to clear logs" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
