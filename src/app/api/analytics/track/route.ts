import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { activityType, page, action, metadata = {} } = body;

    // Get IP address
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Get user agent
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create activity log
    await prisma.userActivity.create({
      data: {
        userId: session?.user?.id || null,
        sessionId: session?.user?.id || null,
        activityType,
        page,
        action,
        metadata,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking activity:", error);
    return NextResponse.json(
      { error: "Failed to track activity" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
