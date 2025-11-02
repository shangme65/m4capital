import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Remove all admins EXCEPT the origin admin
 * This helps clean up test/development admins
 * Requires the requester to be an admin
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can use this endpoint
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

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

    // Find all admins except the origin admin
    const adminsToRemove = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        email: {
          not: originAdminEmail,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Soft delete all non-origin admins
    const result = await prisma.user.updateMany({
      where: {
        role: "ADMIN",
        email: {
          not: originAdminEmail,
        },
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Removed ${result.count} admin(s), keeping origin admin`,
      removedAdmins: adminsToRemove,
      originAdminEmail,
    });
  } catch (error) {
    console.error("Failed to remove other admins:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove other admins",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
