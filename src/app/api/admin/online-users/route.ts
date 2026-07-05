import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// A user is considered "online" if lastSeenAt is within 5 minutes
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (dbUser?.role !== "ADMIN" && dbUser?.role !== "STAFF_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { isDeleted: false, role: "USER" },
    select: {
      id: true,
      name: true,
      email: true,
      country: true,
      accountType: true,
      createdAt: true,
      lastSeenAt: true,
    },
    orderBy: [
      { lastSeenAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
  });

  const now = Date.now();

  const result = users.map((u) => {
    const lastSeenMs = u.lastSeenAt ? new Date(u.lastSeenAt).getTime() : null;
    const isOnline =
      lastSeenMs !== null && now - lastSeenMs <= ONLINE_THRESHOLD_MS;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      country: u.country,
      accountType: u.accountType,
      createdAt: u.createdAt,
      lastSeenAt: u.lastSeenAt,
      isOnline,
    };
  });

  const onlineCount = result.filter((u) => u.isOnline).length;

  return NextResponse.json({
    users: result,
    onlineCount,
    total: result.length,
  });
}
