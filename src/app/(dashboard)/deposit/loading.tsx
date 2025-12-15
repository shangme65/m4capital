export default function DepositLoading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md animate-pulse">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-8 w-40 bg-gray-700 rounded mx-auto mb-2" />
          <div className="h-4 w-56 bg-gray-700 rounded mx-auto" />
        </div>

        {/* Amount Input */}
        <div className="space-y-2 mb-6">
          <div className="h-4 w-24 bg-gray-700 rounded" />
          <div className="h-12 w-full bg-gray-700 rounded-lg" />
        </div>

        {/* Payment Methods */}
        <div className="space-y-3 mb-6">
          <div className="h-4 w-32 bg-gray-700 rounded" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg"
            >
              <div className="w-10 h-10 bg-gray-600 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <div className="h-5 w-24 bg-gray-600 rounded" />
                <div className="h-3 w-32 bg-gray-600 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="h-12 w-full bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}
