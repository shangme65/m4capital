"use client";

/**
 * React 19 Suspense Loading Skeletons
 * Provides smooth loading states for data-fetching components
 */

import { motion } from "framer-motion";

const shimmer = {
  initial: { backgroundPosition: "200% 0" },
  animate: {
    backgroundPosition: "-200% 0",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear",
    },
  },
};

// Base shimmer component
const Shimmer = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <motion.div
    className={`bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] rounded ${className}`}
    style={style}
    variants={shimmer}
    initial="initial"
    animate="animate"
  />
);

// News Card Skeleton
export function NewsCardSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <div className="flex gap-4">
        <Shimmer className="w-20 h-20 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-5/6" />
          <div className="flex gap-2 mt-3">
            <Shimmer className="h-5 w-16 rounded-full" />
            <Shimmer className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// News Feed Loading Skeleton
export function NewsFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Transaction Row Skeleton
export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
      <div className="flex items-center gap-3">
        <Shimmer className="w-10 h-10 rounded-full" />
        <div className="space-y-1">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-3 w-16" />
        </div>
      </div>
      <div className="text-right space-y-1">
        <Shimmer className="h-4 w-20 ml-auto" />
        <Shimmer className="h-3 w-12 ml-auto" />
      </div>
    </div>
  );
}

// Transaction History Loading Skeleton
export function TransactionHistorySkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <TransactionRowSkeleton key={i} />
      ))}
    </div>
  );
}

// Portfolio Asset Card Skeleton
export function AssetCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center gap-3 mb-3">
        <Shimmer className="w-10 h-10 rounded-full" />
        <div className="space-y-1">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-3 w-12" />
        </div>
      </div>
      <div className="space-y-2">
        <Shimmer className="h-6 w-24" />
        <div className="flex justify-between">
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

// Portfolio Grid Loading Skeleton
export function PortfolioGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AssetCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Balance Card Skeleton
export function BalanceCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl p-6 border border-blue-500/20">
      <Shimmer className="h-4 w-24 mb-2" />
      <Shimmer className="h-10 w-40 mb-4" />
      <div className="flex gap-4">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-3 w-24" />
      </div>
    </div>
  );
}

// Chart Loading Skeleton
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
      style={{ height }}
    >
      <div className="flex justify-between mb-4">
        <Shimmer className="h-5 w-32" />
        <div className="flex gap-2">
          <Shimmer className="h-6 w-16 rounded" />
          <Shimmer className="h-6 w-16 rounded" />
        </div>
      </div>
      <div className="flex items-end justify-between h-[calc(100%-60px)] gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Shimmer
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <Shimmer className="h-4 w-20" />
        <Shimmer className="w-8 h-8 rounded-lg" />
      </div>
      <Shimmer className="h-8 w-28 mb-1" />
      <Shimmer className="h-3 w-16" />
    </div>
  );
}

// Dashboard Stats Grid Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Table Loading Skeleton
export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-700/50 bg-gray-800/80">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-4 border-b border-gray-700/30 last:border-b-0"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Shimmer key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Full Page Loading Skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="p-4 space-y-6">
      <BalanceCardSkeleton />
      <DashboardStatsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={300} />
        <TransactionHistorySkeleton count={6} />
      </div>
    </div>
  );
}

// Crypto Price Row Skeleton
export function CryptoPriceRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
      <div className="flex items-center gap-3">
        <Shimmer className="w-8 h-8 rounded-full" />
        <div className="space-y-1">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-3 w-10" />
        </div>
      </div>
      <div className="text-right space-y-1">
        <Shimmer className="h-4 w-20 ml-auto" />
        <Shimmer className="h-3 w-14 ml-auto" />
      </div>
    </div>
  );
}

// Crypto Prices List Skeleton
export function CryptoPricesListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <CryptoPriceRowSkeleton key={i} />
      ))}
    </div>
  );
}

// Finance Overview Skeleton
export function FinanceOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      <ChartSkeleton height={350} />
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
