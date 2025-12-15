/**
 * Dashboard Loading State
 * React 19 / Next.js 16 - Automatic Suspense boundary for dashboard routes
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4 sm:p-6">
      {/* Header Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-800" />
        <div className="flex gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-800" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-800" />
        </div>
      </div>

      {/* Balance Cards Skeleton */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-gray-800/50 p-4"
            style={{
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-700" />
            <div className="h-8 w-32 animate-pulse rounded bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Portfolio Section */}
        <div className="lg:col-span-2">
          <div
            className="rounded-xl bg-gray-800/50 p-6"
            style={{
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-700" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700" />
                  <div className="flex-1">
                    <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-700" />
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-700" />
                  </div>
                  <div className="h-6 w-20 animate-pulse rounded bg-gray-700" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-4">
          <div
            className="rounded-xl bg-gray-800/50 p-4"
            style={{
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div className="mb-3 h-5 w-28 animate-pulse rounded bg-gray-700" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded bg-gray-700"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
