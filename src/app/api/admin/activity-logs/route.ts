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

    // Fetch recent activity logs from database
    // This could be from a dedicated ActivityLog table or derived from various sources
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const recentDeposits = await prisma.deposit.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Combine and format activity logs
    const activities: any[] = [];

    // Add user registrations
    recentUsers.forEach((user) => {
      activities.push({
        id: `user-${user.id}`,
        type: "user_registration",
        message: `New user registered: ${user.name || user.email}`,
        timestamp: user.createdAt,
        icon: "user",
        color: "blue",
      });
    });

    // Add deposits
    recentDeposits.forEach((deposit) => {
      const message = `${
        deposit.User?.name || deposit.User?.email || "Unknown"
      } deposited ${deposit.currency} ${deposit.amount}`;
      const color = "green";

      activities.push({
        id: `deposit-${deposit.id}`,
        type: "deposit",
        message,
        timestamp: deposit.createdAt,
        icon: "activity",
        color,
      });
    });

    // Sort by timestamp (most recent first)
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Take top 20 most recent
    const recentActivities = activities.slice(0, 20);

    // Format timestamps
    const formattedActivities = recentActivities.map((activity) => {
      const now = new Date();
      const activityDate = new Date(activity.timestamp);
      const diffMs = now.getTime() - activityDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeAgo = "";
      if (diffMins < 1) {
        timeAgo = "Just now";
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      } else {
        timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      }

      return {
        ...activity,
        timeAgo,
      };
    });

    return NextResponse.json({ activities: formattedActivities });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
