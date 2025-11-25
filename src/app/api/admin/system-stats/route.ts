import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total number of transactions
    const totalTransactions = await prisma.deposit.count();

    // Get active users (all non-deleted users)
    const totalUsers = await prisma.user.count();

    // Get recent deposits (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentDeposits = await prisma.deposit.count({
      where: {
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    // Get new user registrations today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const newRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    // Calculate last backup time (simulated - would need actual backup system integration)
    const now = new Date();
    const lastBackupHours = Math.floor(Math.random() * 6) + 1; // Random 1-6 hours ago
    const lastBackupTime = new Date(
      now.getTime() - lastBackupHours * 60 * 60 * 1000
    );
    const hoursAgo = Math.floor(
      (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60)
    );
    const lastBackup =
      hoursAgo === 0
        ? "Just now"
        : hoursAgo === 1
        ? "1 hour ago"
        : `${hoursAgo} hours ago`;

    // Get failed login attempts (would need login attempt tracking - simulated for now)
    const failedLogins = 0; // TODO: Implement login attempt tracking

    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    const stats = {
      serverStatus: "Online",
      databaseStatus: "Connected",
      lastBackup,
      totalTransactions,
      activeUsers: totalUsers,
      recentDeposits,
      failedLogins,
      newRegistrations,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("System stats error:", error);
    return NextResponse.json(
      {
        serverStatus: "Online",
        databaseStatus: "Error",
        lastBackup: "Unknown",
        totalTransactions: 0,
        activeUsers: 0,
        recentDeposits: 0,
        failedLogins: 0,
        newRegistrations: 0,
      },
      { status: 500 }
    );
  }
}
