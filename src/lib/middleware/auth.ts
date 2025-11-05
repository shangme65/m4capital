import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Middleware to check if user is authenticated
 * Returns session if authenticated, null otherwise
 */
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      error: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
      session: null,
    };
  }

  return { error: null, session };
}

/**
 * Middleware to check if user is an admin
 * Returns session if admin, error response otherwise
 */
export async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      error: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
      session: null,
    };
  }

  if ((session.user as any).role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { error: null, session };
}

/**
 * Helper to get authenticated user from database
 */
export async function getAuthenticatedUser(prisma: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "Authentication required", user: null };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: "User not found", user: null };
  }

  return { error: null, user };
}
