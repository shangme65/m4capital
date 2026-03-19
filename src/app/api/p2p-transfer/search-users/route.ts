import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/p2p-transfer/search-users
 * Search users by name or email for P2P transfer recipient selection.
 * Returns up to 10 users excluding the current user.
 * If no query is provided, returns the 10 most recently registered users.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    const whereClause: any = {
      isDeleted: false,
      id: { not: session.user.id }, // Exclude self
      accountNumber: { not: null }, // Only users with fully set-up accounts
    };

    if (query.length > 0) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { accountNumber: { contains: query, mode: "insensitive" } },
      ];

      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          accountNumber: true,
          isVerified: true,
          role: true,
          image: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      const results = users.map((u) => {
        const isAdmin = u.role === "ADMIN" || u.role === "STAFF_ADMIN";
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          accountNumber: u.accountNumber,
          isVerified: isAdmin || u.isVerified || false,
          image: u.image,
        };
      });

      return NextResponse.json({ users: results });
    }

    // No query: return the 10 most recently transferred-to users by the current user
    const recentTransfers = await prisma.p2PTransfer.findMany({
      where: { senderId: session.user.id, status: "COMPLETED" },
      select: { receiverId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 50, // fetch more to deduplicate by receiverId
    });

    // Deduplicate: keep only the most recent transfer per receiver
    const seenReceiverIds = new Set<string>();
    const recentReceiverIds: string[] = [];
    for (const t of recentTransfers) {
      if (!seenReceiverIds.has(t.receiverId)) {
        seenReceiverIds.add(t.receiverId);
        recentReceiverIds.push(t.receiverId);
        if (recentReceiverIds.length >= 10) break;
      }
    }

    if (recentReceiverIds.length === 0) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { in: recentReceiverIds },
        isDeleted: false,
        accountNumber: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        accountNumber: true,
        isVerified: true,
        role: true,
        image: true,
      },
    });

    // Sort results to match the order of recentReceiverIds (most recent first)
    const userMap = new Map(users.map((u) => [u.id, u]));
    const orderedUsers = recentReceiverIds
      .map((id) => userMap.get(id))
      .filter(Boolean) as typeof users;

    const results = orderedUsers.map((u) => {
      const isAdmin = u.role === "ADMIN" || u.role === "STAFF_ADMIN";
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        accountNumber: u.accountNumber,
        isVerified: isAdmin || u.isVerified || false,
        image: u.image,
      };
    });

    return NextResponse.json({ users: results });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
