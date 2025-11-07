/**
 * Row-Level Security (RLS) helper for Prisma with Neon
 * Sets the current user ID in PostgreSQL session for RLS policies
 */

import { PrismaClient } from "@prisma/client";

/**
 * Set the current user ID for RLS policies
 * Call this before making database queries in protected routes
 *
 * @param prisma - Prisma client instance
 * @param userId - Current authenticated user ID
 *
 * Example:
 * ```ts
 * import { prisma } from "@/lib/prisma";
 * import { setRLSContext } from "@/lib/rls-middleware";
 * import { getServerSession } from "next-auth";
 * import { authOptions } from "@/lib/auth";
 *
 * export async function GET() {
 *   const session = await getServerSession(authOptions);
 *
 *   if (session?.user?.id) {
 *     await setRLSContext(prisma, session.user.id);
 *   }
 *
 *   // All queries will now respect RLS policies
 *   const portfolio = await prisma.portfolio.findUnique({
 *     where: { userId: session.user.id }
 *   });
 * }
 * ```
 */
export async function setRLSContext(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  // Set session variable for RLS policies
  // This is scoped to the current transaction/connection
  await prisma.$executeRawUnsafe(
    `SET LOCAL app.current_user_id = '${userId.replace(/'/g, "''")}'`
  );
}

/**
 * Clear RLS context (optional, mainly for testing)
 */
export async function clearRLSContext(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(`SET LOCAL app.current_user_id = ''`);
}
