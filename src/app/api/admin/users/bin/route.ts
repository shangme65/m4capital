import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Get all deleted users (bin)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        isDeleted: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountType: true,
        country: true,
        deletedAt: true,
        createdAt: true,
        kycVerification: {
          select: {
            status: true,
          },
        },
        portfolio: {
          select: {
            balance: true,
          },
        },
      },
      orderBy: {
        deletedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching deleted users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch deleted users" },
      { status: 500 }
    );
  }
}
