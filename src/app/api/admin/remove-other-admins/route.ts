import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Remove the origin admin account
 * This helps clean up the origin admin if needed
 * Does not require authentication - can be used for setup/cleanup
 */
export async function POST() {
  try {
    const originAdminEmail = process.env.ORIGIN_ADMIN_EMAIL;

    if (!originAdminEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Origin admin email not set in environment variables",
        },
        { status: 400 }
      );
    }

    // Find the origin admin
    const adminToRemove = await prisma.user.findUnique({
      where: {
        email: originAdminEmail,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!adminToRemove) {
      return NextResponse.json({
        success: false,
        error: "Origin admin not found in database",
      });
    }

    if (adminToRemove.role !== "ADMIN") {
      return NextResponse.json({
        success: false,
        error: "User found but is not an admin",
      });
    }

    // Hard delete the origin admin and all related data
    // We need to delete in the correct order due to foreign key constraints

    // 1. Delete deposits and withdrawals first
    await prisma.deposit.deleteMany({
      where: { userId: adminToRemove.id },
    });

    await prisma.withdrawal.deleteMany({
      where: { userId: adminToRemove.id },
    });

    // 2. Delete portfolio
    await prisma.portfolio.deleteMany({
      where: { userId: adminToRemove.id },
    });

    // 3. Delete KYC verification if exists
    await prisma.kycVerification.deleteMany({
      where: { userId: adminToRemove.id },
    });

    // 4. Delete sessions and accounts (these have onDelete: Cascade but we'll delete them explicitly)
    await prisma.session.deleteMany({
      where: { userId: adminToRemove.id },
    });

    await prisma.account.deleteMany({
      where: { userId: adminToRemove.id },
    });

    // 5. Finally delete the user
    await prisma.user.delete({
      where: {
        email: originAdminEmail,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Permanently deleted origin admin: ${originAdminEmail}`,
      removedAdmin: adminToRemove,
    });
  } catch (error) {
    console.error("Failed to remove origin admin:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove origin admin",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
