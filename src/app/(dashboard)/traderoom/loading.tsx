/**
 * Traderoom Loading State
 * React 19 / Next.js 16 - Automatic Suspense boundary for traderoom
 */
export default function TraderoomLoading() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Top Bar Skeleton */}
      <div className="flex h-12 items-center justify-between border-b border-gray-800 bg-[#0d1421] px-4">
        <div className="flex items-center gap-4">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-800" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-20 animate-pulse rounded bg-gray-800"
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-800" />
          <div className="h-8 w-8 animate-pulse rounded bg-gray-800" />
        </div>
      </div>

      <div className="flex h-[calc(100vh-48px)]">
        {/* Left Panel - Asset List */}
        <div className="w-64 border-r border-gray-800 bg-[#0d1421] p-3">
          <div className="mb-3 h-10 w-full animate-pulse rounded bg-gray-800" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded bg-gray-800/50 p-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-gray-700" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-700" />
                </div>
                <div className="h-4 w-14 animate-pulse rounded bg-gray-700" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 p-4">
          <div
            className="h-full rounded-lg bg-[#0d1421]"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Chart Header */}
            <div className="flex items-center justify-between border-b border-gray-800 p-4">
              <div className="flex items-center gap-4">
                <div className="h-8 w-24 animate-pulse rounded bg-gray-800" />
                <div className="h-6 w-20 animate-pulse rounded bg-gray-800" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-800" />
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-12 animate-pulse rounded bg-gray-800"
                  />
                ))}
              </div>
            </div>

            {/* Chart Area */}
            <div className="flex h-[calc(100%-80px)] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full bg-gray-800" />
                <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Trading Controls */}
        <div className="w-72 border-l border-gray-800 bg-[#0d1421] p-4">
          {/* Balance */}
          <div className="mb-4 rounded-lg bg-gray-800/50 p-3">
            <div className="mb-1 h-3 w-16 animate-pulse rounded bg-gray-700" />
            <div className="h-7 w-24 animate-pulse rounded bg-gray-700" />
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <div className="mb-2 h-4 w-16 animate-pulse rounded bg-gray-700" />
            <div className="h-12 w-full animate-pulse rounded-lg bg-gray-800" />
          </div>

          {/* Time Selection */}
          <div className="mb-4">
            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-700" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded bg-gray-800"
                />
              ))}
            </div>
          </div>

          {/* Trade Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <div className="h-14 animate-pulse rounded-lg bg-green-900/30" />
            <div className="h-14 animate-pulse rounded-lg bg-red-900/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
