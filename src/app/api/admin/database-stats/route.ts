import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get database statistics
    const userCount = await prisma.user.count();
    const depositCount = await prisma.deposit.count();
    const portfolioCount = await prisma.portfolio.count();
    const notificationCount = await prisma.notification.count();

    const totalRecords =
      userCount + depositCount + portfolioCount + notificationCount;

    // Estimate database size (rough calculation)
    // Average sizes: User ~1KB, Deposit ~0.5KB, Portfolio ~0.3KB, Notification ~0.2KB
    const estimatedSizeBytes =
      userCount * 1024 +
      depositCount * 512 +
      portfolioCount * 300 +
      notificationCount * 200;

    let size = "";
    if (estimatedSizeBytes < 1024) {
      size = `${estimatedSizeBytes} B`;
    } else if (estimatedSizeBytes < 1024 * 1024) {
      size = `${(estimatedSizeBytes / 1024).toFixed(2)} KB`;
    } else if (estimatedSizeBytes < 1024 * 1024 * 1024) {
      size = `${(estimatedSizeBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      size = `${(estimatedSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }

    // Get last backup time (for now, we'll use current time as placeholder)
    // In production, you'd store backup timestamps in database
    const lastBackup = "Not available";

    const stats = {
      size,
      totalRecords,
      lastBackup,
      breakdown: {
        users: userCount,
        deposits: depositCount,
        portfolios: portfolioCount,
        notifications: notificationCount,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching database stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch database stats" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
