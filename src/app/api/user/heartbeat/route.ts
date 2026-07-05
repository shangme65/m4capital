import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";
import { sendPushNotification } from "@/lib/push-notifications";

export const dynamic = "force-dynamic";

// A user is considered "online" if lastSeenAt is within this window
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
// Only notify admins when user transitions from "offline" → "online"
// (i.e. was absent for longer than this before the heartbeat)
const NOTIFY_AFTER_ABSENT_MS = 10 * 60 * 1000; // 10 minutes

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();

  // Fetch current lastSeenAt to detect offline→online transition
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      country: true,
      lastSeenAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Update lastSeenAt
  await prisma.user.update({
    where: { id: userId },
    data: { lastSeenAt: now },
  });

  // Don't notify about admin/staff heartbeats
  if (user.role === "ADMIN" || user.role === "STAFF_ADMIN") {
    return NextResponse.json({ ok: true });
  }

  // Detect offline→online transition: was absent for > NOTIFY_AFTER_ABSENT_MS
  const wasOffline =
    !user.lastSeenAt ||
    now.getTime() - new Date(user.lastSeenAt).getTime() >
      NOTIFY_AFTER_ABSENT_MS;

  if (wasOffline) {
    // Notify admins asynchronously (fire-and-forget — don't block the response)
    notifyAdminsUserOnline(user, now).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

async function notifyAdminsUserOnline(
  user: {
    id: string;
    name: string | null;
    email: string | null;
    country: string | null;
  },
  now: Date,
) {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF_ADMIN"] } },
    select: { id: true },
  });

  const timeStr = now.toLocaleString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const displayName = user.name || user.email || "Unknown user";
  const locationLine = user.country ? ` from ${user.country}` : "";

  await Promise.all(
    admins.map(async (admin) => {
      await prisma.notification.create({
        data: {
          id: generateId(),
          userId: admin.id,
          type: "INFO",
          title: "🟢 User Online",
          message: `"${displayName}" is now online${locationLine}.\n🕐 ${timeStr}`,
          metadata: {
            event: "user_online",
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            country: user.country,
            onlineAt: now.toISOString(),
          },
        },
      });

      await sendPushNotification(
        admin.id,
        "🟢 User Online",
        `${displayName} is now active on the platform`,
        { url: "/admin" },
      );
    }),
  );
}
