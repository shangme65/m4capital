import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Permanently delete all users marked as isDeleted = true
 * This helps clean up soft-deleted users from the database
 * Requires admin authentication
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication and admin role
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Find all soft-deleted users
    const deletedUsers = await prisma.user.findMany({
      where: { isDeleted: true },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (deletedUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No deleted users to clean up",
        deletedCount: 0,
      });
    }

    const userIds = deletedUsers.map((u) => u.id);

    // Delete all related data in the correct order
    // 1. Delete deposits and withdrawals
    const depositsDeleted = await prisma.deposit.deleteMany({
      where: { userId: { in: userIds } },
    });

    const withdrawalsDeleted = await prisma.withdrawal.deleteMany({
      where: { userId: { in: userIds } },
    });

    // 2. Delete portfolios
    const portfoliosDeleted = await prisma.portfolio.deleteMany({
      where: { userId: { in: userIds } },
    });

    // 3. Delete KYC verifications
    const kycDeleted = await prisma.kycVerification.deleteMany({
      where: { userId: { in: userIds } },
    });

    // 4. Delete sessions and accounts
    const sessionsDeleted = await prisma.session.deleteMany({
      where: { userId: { in: userIds } },
    });

    const accountsDeleted = await prisma.account.deleteMany({
      where: { userId: { in: userIds } },
    });

    // 5. Finally delete the users
    const usersDeleted = await prisma.user.deleteMany({
      where: { isDeleted: true },
    });

    return NextResponse.json({
      success: true,
      message: `Permanently deleted ${usersDeleted.count} users and all related data`,
      deletedCount: usersDeleted.count,
      deletedUsers: deletedUsers.map((u) => ({
        email: u.email,
        name: u.name,
      })),
      relatedDataDeleted: {
        deposits: depositsDeleted.count,
        withdrawals: withdrawalsDeleted.count,
        portfolios: portfoliosDeleted.count,
        kycVerifications: kycDeleted.count,
        sessions: sessionsDeleted.count,
        accounts: accountsDeleted.count,
      },
    });
  } catch (error) {
    console.error("Failed to cleanup deleted users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup deleted users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
