/**
 * Admin Loading State
 * React 19 / Next.js 16 - Automatic Suspense boundary for admin routes
 */
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
      {/* Admin Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-gray-800" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-800" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-800" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-800" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-gray-800/50 p-5"
            style={{
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-700" />
              <div className="h-8 w-8 animate-pulse rounded bg-gray-700" />
            </div>
            <div className="h-8 w-24 animate-pulse rounded bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div
        className="rounded-xl bg-gray-800/50 p-6"
        style={{
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-700" />
          <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-700" />
        </div>

        {/* Table Header */}
        <div className="mb-4 grid grid-cols-6 gap-4 border-b border-gray-700 pb-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-gray-700" />
          ))}
        </div>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 border-b border-gray-700/50 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-700" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-700" />
            </div>
            <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-700" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-700" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-700" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}
