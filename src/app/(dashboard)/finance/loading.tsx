export default function FinanceLoading() {
  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-700 rounded mb-2" />
          <div className="h-4 w-72 bg-gray-800 rounded" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-gray-700 rounded" />
                <div className="w-10 h-10 bg-gray-700 rounded-lg" />
              </div>
              <div className="h-8 w-32 bg-gray-700 rounded mb-2" />
              <div className="h-3 w-20 bg-gray-700 rounded" />
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
            <div className="h-64 bg-gray-700 rounded" />
          </div>
          <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
            <div className="h-64 bg-gray-700 rounded" />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
          <div className="h-6 w-40 bg-gray-700 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg"
              >
                <div className="w-10 h-10 bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-700 rounded" />
                  <div className="h-3 w-24 bg-gray-700 rounded" />
                </div>
                <div className="h-5 w-20 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
