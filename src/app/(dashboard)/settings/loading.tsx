import {
  BalanceCardSkeleton,
  PortfolioGridSkeleton,
} from "@/components/ui/LoadingSkeletons";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-700 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-800 rounded" />
        </div>

        {/* Profile Section */}
        <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-700 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-gray-700 rounded" />
              <div className="h-4 w-56 bg-gray-700 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-700 rounded" />
                <div className="h-10 w-full bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
          <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
              >
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-600 rounded" />
                  <div className="h-4 w-48 bg-gray-600 rounded" />
                </div>
                <div className="h-8 w-20 bg-gray-600 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
          <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-700 rounded" />
                <div className="h-10 w-full bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
