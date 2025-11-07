/**
 * Row-Level Security (RLS) middleware for Prisma
 * Sets the current user ID in PostgreSQL session for RLS policies
 */

import { Prisma } from "@prisma/client";

export function createRLSMiddleware(userId?: string): Prisma.Middleware {
  return async (params, next) => {
    // Only set user ID if provided and not already in a transaction
    if (userId && !params.runInTransaction) {
      // Execute SET LOCAL to set session variable for this transaction
      await params.dataloader.loader.request({
        query: `SET LOCAL app.current_user_id = '${userId.replace(
          /'/g,
          "''"
        )}'`,
        args: [],
        clientMethod: "raw",
        dataPath: [],
      });
    }

    return next(params);
  };
}

/**
 * Apply RLS middleware to Prisma client
 * Call this in API routes with the current user ID from session
 *
 * Example:
 * ```ts
 * import { prisma } from "@/lib/prisma";
 * import { applyRLS } from "@/lib/rls-middleware";
 * import { getServerSession } from "next-auth";
 * import { authOptions } from "@/lib/auth";
 *
 * export async function GET() {
 *   const session = await getServerSession(authOptions);
 *   const userId = session?.user?.id;
 *
 *   // Apply RLS for this request
 *   applyRLS(prisma, userId);
 *
 *   // All queries will now respect RLS policies
 *   const portfolio = await prisma.portfolio.findUnique({
 *     where: { userId }
 *   });
 * }
 * ```
 */
export function applyRLS(prismaClient: any, userId?: string): void {
  // Remove existing RLS middleware if any
  prismaClient.$use((params: any, next: any) => {
    if (userId) {
      // Use raw query to set session variable
      return prismaClient
        .$queryRawUnsafe(
          `SET LOCAL app.current_user_id = '${userId.replace(/'/g, "''")}'`
        )
        .then(() => next(params));
    }
    return next(params);
  });
}
