import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can access analytics
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "7d";
    const activityType = searchParams.get("activityType");
    const userId = searchParams.get("userId");

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startDate,
      },
    };

    if (activityType) {
      where.activityType = activityType;
    }

    if (userId) {
      where.userId = userId;
    }

    // Get activities
    const activities = await prisma.userActivity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1000,
    });

    // Get activity counts by type
    const activityCounts = await prisma.userActivity.groupBy({
      by: ["activityType"],
      where,
      _count: {
        id: true,
      },
    });

    // Get unique users count
    const uniqueUsers = await prisma.userActivity.findMany({
      where,
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    // Get hourly activity for charts
    const hourlyActivity = await prisma.$queryRaw<any[]>`
      SELECT 
        DATE_TRUNC('hour', "createdAt") as hour,
        COUNT(*)::int as count
      FROM "UserActivity"
      WHERE "createdAt" >= ${startDate}
      GROUP BY hour
      ORDER BY hour ASC
    `;

    // Get top pages
    const topPages = await prisma.userActivity.groupBy({
      by: ["page"],
      where: {
        ...where,
        page: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // Get top actions
    const topActions = await prisma.userActivity.groupBy({
      by: ["action"],
      where: {
        ...where,
        action: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    await prisma.$disconnect();

    return NextResponse.json({
      activities,
      summary: {
        totalActivities: activities.length,
        uniqueUsers: uniqueUsers.filter((u) => u.userId).length,
        activityCounts: activityCounts.map((ac) => ({
          type: ac.activityType,
          count: ac._count.id,
        })),
        hourlyActivity: hourlyActivity.map((h) => ({
          hour: h.hour,
          count: h.count,
        })),
        topPages: topPages.map((p) => ({
          page: p.page,
          count: p._count.id,
        })),
        topActions: topActions.map((a) => ({
          action: a.action,
          count: a._count.id,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
