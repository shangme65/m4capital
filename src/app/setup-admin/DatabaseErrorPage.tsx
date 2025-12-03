"use client";

export default function DatabaseErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-amber-600 mb-4">
          Database Connection Issue
        </h1>
        <p className="text-gray-600 mb-6">
          Unable to connect to the database. This may be a temporary issue with
          serverless cold starts.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
