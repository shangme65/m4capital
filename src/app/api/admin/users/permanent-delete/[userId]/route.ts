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
    // Order matters due to foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete user's deposits and withdrawals
      await tx.deposit.deleteMany({
        where: {
          Portfolio: {
            userId: userId,
          },
        },
      });

      await tx.withdrawal.deleteMany({
        where: {
          Portfolio: {
            userId: userId,
          },
        },
      });

      // Delete user's portfolio
      await tx.portfolio.deleteMany({
        where: { userId: userId },
      });

      // Delete user's KYC verification
      await tx.kycVerification.deleteMany({
        where: { userId: userId },
      });

      // Delete user's accounts (NextAuth)
      await tx.account.deleteMany({
        where: { userId: userId },
      });

      // Sessions will be automatically deleted via CASCADE constraint
      // No need to explicitly delete them here

      // Finally, delete the user (this will cascade delete sessions)
      await tx.user.delete({
        where: { id: userId },
      });
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
