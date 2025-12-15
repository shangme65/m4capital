export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="animate-pulse mb-8">
          <div className="h-8 w-48 bg-gray-700 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-800 rounded" />
        </div>

        {/* Featured Article */}
        <div className="bg-gray-800 rounded-xl overflow-hidden mb-8 animate-pulse">
          <div className="h-64 bg-gray-700" />
          <div className="p-6 space-y-3">
            <div className="h-6 w-3/4 bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-700 rounded" />
            <div className="h-4 w-2/3 bg-gray-700 rounded" />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-700" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-full bg-gray-700 rounded" />
                <div className="h-4 w-3/4 bg-gray-700 rounded" />
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-6 h-6 bg-gray-700 rounded-full" />
                  <div className="h-3 w-20 bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
