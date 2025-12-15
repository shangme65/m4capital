import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Next.js Cache Utilities
 *
 * Use unstable_cache for fine-grained caching of database queries
 * Use revalidateTag to invalidate specific cached data
 * Use revalidatePath to invalidate entire page caches
 */

// Cache tags for organized invalidation
export const CACHE_TAGS = {
  PORTFOLIO: "portfolio",
  USER: "user",
  NOTIFICATIONS: "notifications",
  TRANSACTIONS: "transactions",
  CRYPTO_PRICES: "crypto-prices",
  EXCHANGE_RATES: "exchange-rates",
  ADMIN_STATS: "admin-stats",
} as const;

/**
 * Cached portfolio fetch - 60 second cache
 */
export const getCachedPortfolio = unstable_cache(
  async (userId: string) => {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            preferredCurrency: true,
          },
        },
      },
    });
    return portfolio;
  },
  ["portfolio"],
  {
    tags: [CACHE_TAGS.PORTFOLIO],
    revalidate: 60, // 60 seconds
  }
);

/**
 * Cached user profile
 */
export const getCachedUser = unstable_cache(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        preferredCurrency: true,
        accountType: true,
        accountNumber: true,
        isEmailVerified: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  },
  ["user"],
  {
    tags: [CACHE_TAGS.USER],
    revalidate: 300, // 5 minutes
  }
);

/**
 * Cached notifications count
 */
export const getCachedNotificationCount = unstable_cache(
  async (userId: string) => {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
    return count;
  },
  ["notification-count"],
  {
    tags: [CACHE_TAGS.NOTIFICATIONS],
    revalidate: 30, // 30 seconds
  }
);

/**
 * Cached recent transactions
 */
export const getCachedRecentTransactions = unstable_cache(
  async (userId: string, limit: number = 10) => {
    const transactions = await prisma.notification.findMany({
      where: {
        userId,
        type: {
          in: ["DEPOSIT", "WITHDRAW", "TRADE", "TRANSACTION"],
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return transactions;
  },
  ["recent-transactions"],
  {
    tags: [CACHE_TAGS.TRANSACTIONS],
    revalidate: 60,
  }
);

/**
 * Cached admin stats
 */
export const getCachedAdminStats = unstable_cache(
  async () => {
    const [totalUsers, totalDeposits, pendingKyc] = await Promise.all([
      prisma.user.count(),
      prisma.deposit.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { amount: true },
      }),
      prisma.kycVerification.count({ where: { status: "PENDING" } }),
    ]);

    return {
      totalUsers,
      totalDeposits: totalDeposits._sum.amount || 0,
      pendingKyc,
    };
  },
  ["admin-stats"],
  {
    tags: [CACHE_TAGS.ADMIN_STATS],
    revalidate: 120, // 2 minutes
  }
);

/**
 * Note: Cache invalidation in Next.js 16 must be done in Server Actions
 * using revalidateTag() and revalidatePath() from 'next/cache'
 *
 * Example usage in a Server Action:
 *
 * "use server";
 * import { revalidateTag, revalidatePath } from 'next/cache';
 * import { CACHE_TAGS } from '@/lib/cache';
 *
 * export async function updatePortfolio() {
 *   // ... update logic
 *   revalidateTag(CACHE_TAGS.PORTFOLIO);
 *   revalidatePath('/dashboard');
 * }
 */
