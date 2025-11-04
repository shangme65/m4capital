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

    // Soft delete the origin admin
    await prisma.user.update({
      where: {
        email: originAdminEmail,
      },
      data: {
        isDeleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Removed origin admin: ${originAdminEmail}`,
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
