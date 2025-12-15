import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  getCachedNotificationCount,
  getCachedRecentTransactions,
} from "@/lib/cache";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

/**
 * Async Server Components for Streaming
 *
 * These components fetch data on the server and stream to the client.
 * Wrap them in Suspense for progressive loading.
 *
 * @example
 * <Suspense fallback={<NotificationBadgeSkeleton />}>
 *   <NotificationBadge userId={userId} />
 * </Suspense>
 */

// Skeleton components for loading states
export function NotificationBadgeSkeleton() {
  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-400" />
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 rounded-full animate-pulse" />
    </div>
  );
}

export function RecentActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg animate-pulse"
        >
          <div className="w-10 h-10 bg-gray-700 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-700 rounded w-24" />
          </div>
          <div className="h-5 bg-gray-700 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-20 mb-2" />
      <div className="h-8 bg-gray-700 rounded w-32" />
    </div>
  );
}

// Async Server Components

/**
 * Server Component: Notification badge with count
 * Streams the unread notification count
 */
export async function NotificationBadge({ userId }: { userId: string }) {
  const count = await getCachedNotificationCount(userId);

  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-300 hover:text-white transition-colors" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
}

/**
 * Server Component: Recent activity list
 * Streams recent transactions
 */
export async function RecentActivityList({
  userId,
  limit = 5,
}: {
  userId: string;
  limit?: number;
}) {
  const transactions = await getCachedRecentTransactions(userId, limit);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              tx.type === "DEPOSIT"
                ? "bg-green-500/20"
                : tx.type === "WITHDRAW"
                ? "bg-red-500/20"
                : tx.type === "TRADE"
                ? "bg-blue-500/20"
                : "bg-orange-500/20"
            }`}
          >
            {tx.type === "DEPOSIT" ? (
              <ArrowDownRight className="w-5 h-5 text-green-400" />
            ) : tx.type === "WITHDRAW" ? (
              <ArrowUpRight className="w-5 h-5 text-red-400" />
            ) : tx.type === "TRADE" ? (
              <TrendingUp className="w-5 h-5 text-blue-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-orange-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {tx.title}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(tx.createdAt).toLocaleDateString()}
            </p>
          </div>

          {tx.amount && (
            <span
              className={`text-sm font-medium ${
                tx.type === "DEPOSIT"
                  ? "text-green-400"
                  : tx.type === "WITHDRAW"
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              {tx.type === "DEPOSIT" ? "+" : tx.type === "WITHDRAW" ? "-" : ""}$
              {tx.amount.toLocaleString()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Server Component: User stats card
 */
export async function UserStatsCard({ userId }: { userId: string }) {
  const [portfolio, transactionCount] = await Promise.all([
    prisma.portfolio.findUnique({
      where: { userId },
      select: { balance: true },
    }),
    prisma.notification.count({
      where: { userId, type: { in: ["DEPOSIT", "WITHDRAW", "TRADE"] } },
    }),
  ]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-800 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-1">Balance</p>
        <p className="text-2xl font-bold text-white">
          ${portfolio?.balance?.toLocaleString() ?? "0"}
        </p>
      </div>
      <div className="bg-gray-800 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-1">Transactions</p>
        <p className="text-2xl font-bold text-white">{transactionCount}</p>
      </div>
    </div>
  );
}

/**
 * Wrapper component with Suspense
 * Use this for easy streaming setup
 */
export function StreamingNotificationBadge({ userId }: { userId: string }) {
  return (
    <Suspense fallback={<NotificationBadgeSkeleton />}>
      <NotificationBadge userId={userId} />
    </Suspense>
  );
}

export function StreamingRecentActivity({
  userId,
  limit = 5,
}: {
  userId: string;
  limit?: number;
}) {
  return (
    <Suspense fallback={<RecentActivitySkeleton />}>
      <RecentActivityList userId={userId} limit={limit} />
    </Suspense>
  );
}

export function StreamingUserStats({ userId }: { userId: string }) {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-2 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      }
    >
      <UserStatsCard userId={userId} />
    </Suspense>
  );
}
