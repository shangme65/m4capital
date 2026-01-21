import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Permanently delete a user and all related data
 * This is IRREVERSIBLE - completely removes user from database
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authSession = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!authSession || authSession.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { userId } = await params;

    // Don't allow admins to permanently delete themselves
    if (authSession.user.id === userId) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Get user info before deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Execute permanent deletion in a transaction
    // Portfolio relation doesn't have onDelete: Cascade, so we need to handle it manually
    await prisma.$transaction(async (tx) => {
      // First, get the portfolio ID
      const portfolio = await tx.portfolio.findUnique({
        where: { userId: userId },
        select: { id: true },
      });

      if (portfolio) {
        // Delete deposits and withdrawals related to this portfolio
        await tx.deposit.deleteMany({
          where: { portfolioId: portfolio.id },
        });

        await tx.withdrawal.deleteMany({
          where: { portfolioId: portfolio.id },
        });

        // Delete the portfolio
        await tx.portfolio.delete({
          where: { id: portfolio.id },
        });
      }

      // Delete the user - this will cascade delete everything else
      // (Account, Session, KYC, Notifications, etc.)
      await tx.user.delete({
        where: { id: userId },
      });
    }, {
      timeout: 10000, // 10 second timeout for the transaction
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.email} permanently deleted. Email can now be reused.`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error permanently deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to permanently delete user" },
      { status: 500 }
    );
  }
}
