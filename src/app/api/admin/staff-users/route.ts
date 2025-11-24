import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffAdmin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!staffAdmin || staffAdmin.role !== "STAFF_ADMIN") {
      return NextResponse.json(
        { error: "Only staff admins can access this endpoint" },
        { status: 403 }
      );
    }

    // Fetch users assigned to this staff admin
    const assignedUsers = await prisma.user.findMany({
      where: {
        assignedStaffId: staffAdmin.id,
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        accountType: true,
        createdAt: true,
        Portfolio: {
          select: {
            balance: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    const formattedUsers = assignedUsers.map((user) => ({
      id: user.id,
      email: user.email || "",
      name: user.name,
      accountType: user.accountType,
      balance: user.Portfolio?.balance
        ? parseFloat(user.Portfolio.balance.toString())
        : 0,
      createdAt: user.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error) {
    console.error("Error fetching assigned users:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned users" },
      { status: 500 }
    );
  }
}
